import express from 'express'
import { randomBytes, createHash, createHmac } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  query,
  newUser,
  rotateRefresh,
  storeRefresh,
  uuidFromId,
  saveTexture,
  listTextures,
  getTexture,
  getTextureByHash,
  setActiveTexture,
  clearActiveTexture,
  deleteTexture,
  getActiveTextures,
  getUserByNick,
  upsertByDiscord,
  storeSiteSession,
  siteUserByToken,
  dropSiteSession,
  deviceByUserCode,
  bindDeviceUser,
  saveMessage,
  chatPage,
  newIncomingMessages,
  unreadCount,
  markRead,
  peerReadAt,
  setTyping,
  typingPeers,
  touchPresence,
  presenceOf,
  savePlayStats,
  hidePlayStats,
  playStatsOf,
  bumpPresence,
} from './db.js'
import { requireAuth, setSessionReader, signAccess, verifyAccess } from './auth.js'
import { adminPage, approvePage, errorPage, sitePage } from './site.js'

const SRC_DIR = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = join(SRC_DIR, '..')

// Dev convenience: reads a git-ignored .env next to package.json so the Discord
// secret never lives in the repo. Production secrets come from the platform.
try {
  const text = readFileSync(join(APP_ROOT, '.env'), 'utf8')
  for (const line of text.split('\n')) {
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch {}

// Публичный базовый URL сайта. На Vercel его всегда видно из запроса (протокол
// и Host), поэтому URL текстур/ссылок возвращаются в том хосте, к которому
// обращается лаунчер или браузер. Внешний PUBLIC_BASE нужен только локально.
const PUBLIC_BASE = process.env.PUBLIC_BASE || 'http://localhost:8787'
const hostBase = (req) =>
  (process.env.PUBLIC_BASE || (req.secure || (req.headers['x-forwarded-proto'] || '').includes('https') ? 'https' : 'http') + '://' + req.get('host')).replace(/\/$/, '')
// The Discord client ID is public; only the secret is a secret.
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1536058209532510259'
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'endertyma2001'
const INTERVAL_S = 3
const EXPIRE_S = 300

// ============ Сессия сайта (cookie в браузере) ============

const SESSION_COOKIE = 'site_session'
const SESSION_TTL_S = 60 * 60 * 24 * 30

const readCookie = (req, name) => {
  const h = req.headers.cookie || ''
  for (const part of h.split(';')) {
    const i = part.indexOf('=')
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim()
  }
  return null
}

const setSessionCookie = (res, token) =>
  res.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_S}`,
  )
const clearSessionCookie = (res) =>
  res.set('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)

setSessionReader(async (req) => {
  const user = await siteUserByToken(readCookie(req, SESSION_COOKIE))
  return user ? Number(user.id) : null
})

const ah = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err)
    res.status(500).json({ message: 'internal error' })
  })

export const app = express()
app.use(express.json({ limit: '25mb' }))
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin) res.set('Access-Control-Allow-Origin', origin)
  else res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Credentials', 'true')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

const userCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const pick = (n) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  return pick(4) + '-' + pick(4)
}

app.get('/v2/health', (req, res) => res.json({ ok: true }))

// ============ Лого и статика ============

app.get('/logo.png', (req, res) => {
  res.set('Content-Type', 'image/png').send(readFileSync(join(APP_ROOT, 'enemy-logo.png')))
})
app.get('/logo.svg', (req, res) => {
  res.set('Content-Type', 'image/svg+xml').send(readFileSync(join(APP_ROOT, 'enemy-logo.svg')))
})

// ============ Скачивание лаунчера ============

app.get('/download', (req, res) => {
  const exe = join(APP_ROOT, '..', 'src-tauri', 'target', 'fast', 'enemy-launcher.exe')
  try {
    const stat = statSync(exe)
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(stat.size),
      'Content-Disposition': 'attachment; filename="EnemyLauncher.exe"',
    })
    res.send(readFileSync(exe))
  } catch {
    res
      .set('Content-Type', 'text/html; charset=utf-8')
      .send(errorPage('Файл не найден', 'Сборка лаунчера ещё не выложена. Загляни позже.'))
  }
})

// ============ Аватар по лицензии Mojang ============

const MC_CACHE = new Map()
const mcUuidForName = async (name) => {
  const key = String(name || '').trim().toLowerCase()
  if (MC_CACHE.has(key)) return MC_CACHE.get(key)
  let uuid = null
  try {
    const r = await fetch('https://api.mojang.com/users/profiles/minecraft/' + encodeURIComponent(key), {
      signal: AbortSignal.timeout(4000),
    })
    if (r.ok) {
      const j = await r.json().catch(() => null)
      uuid = j && j.id ? String(j.id).toLowerCase() : null
    }
  } catch {}
  MC_CACHE.set(key, uuid)
  return uuid
}
const mcHeadUrl = (uuid) => (uuid ? 'https://mc-heads.net/avatar/' + uuid + '/64' : null)

// Голова лицензии для ника: если ник совпал с лицензионным аккаунтом Minecraft,
// показываем его скин-голову, иначе обычный аватар (Discord).
const avatarForUser = async (user) => {
  const uuid = await mcUuidForName(user.nickname)
  return (uuid && mcHeadUrl(uuid)) || user.discord_avatar || null
}

// ============ Вход (device-code) ============

app.post('/v2/auth/launcher/init', ah(async (req, res) => {
  const deviceCode = randomBytes(24).toString('base64url')
  const code = userCode()
  const now = Math.floor(Date.now() / 1000)
  await query(
    'INSERT INTO device_codes (device_code, user_code, status, created_at, expires_at) VALUES ($1, $2, $3, $4, $5)',
    [deviceCode, code, 'pending', now, now + EXPIRE_S],
  )
  res.json({
    deviceCode,
    userCode: code,
    verifyUrl: hostBase(req) + '/v2/auth/launcher/approve?device_code=' + deviceCode,
    expiresInSec: EXPIRE_S,
    intervalSec: INTERVAL_S,
  })
}))

// ============ Discord OAuth (сайт) ============

const SITE_PAGE = '/v2/auth/discord'

app.get(SITE_PAGE, (req, res) => {
  if (!DISCORD_CLIENT_ID) return res.status(500).send('Discord OAuth не настроен (DISCORD_CLIENT_ID)')
  const redirect = typeof req.query.redirect === 'string' && req.query.redirect.startsWith('/') ? req.query.redirect : '/'
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    response_type: 'code',
    scope: 'identify',
    redirect_uri: hostBase(req) + '/v2/auth/discord/callback',
    state: redirect,
  })
  res.redirect('https://discord.com/oauth2/authorize?' + params.toString())
})

app.get('/v2/auth/discord/callback', ah(async (req, res) => {
  const code = req.query.code
  if (!code) return res.status(400).send('Не удалось войти: нет кода')
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) return res.sendStatus(500)
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: hostBase(req) + '/v2/auth/discord/callback',
    }),
  })
  const token = await tokenRes.json().catch(() => ({}))
  if (!tokenRes.ok || !token.access_token) return res.status(400).send('Discord не принял вход. Попробуй ещё раз.')
  const meRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: 'Bearer ' + token.access_token },
  })
  const me = await meRes.json().catch(() => ({}))
  if (!meRes.ok || !me.id) return res.status(400).send('Не удалось получить профиль Discord.')
  const avatar = me.avatar
    ? 'https://cdn.discordapp.com/avatars/' + me.id + '/' + me.avatar + (me.avatar.startsWith('a_') ? '.gif' : '.png')
    : null
  const user = await upsertByDiscord({ discordId: me.id, username: me.username, avatar })
  const session = await storeSiteSession(user.id)
  setSessionCookie(res, session)
  const target = typeof req.query.state === 'string' && req.query.state.startsWith('/') ? req.query.state : '/'
  res.redirect(target)
}))

// ============ Сайт ============

app.get('/', ah(async (req, res) => {
  const user = await siteUserByToken(readCookie(req, SESSION_COOKIE))
  res
    .set('Content-Type', 'text/html; charset=utf-8')
    .send(sitePage({ user: user ? { nickname: user.nickname, discordName: user.discord_username, avatarUrl: user.discord_avatar } : null }))
}))

app.get('/logout', ah(async (req, res) => {
  await dropSiteSession(readCookie(req, SESSION_COOKIE))
  clearSessionCookie(res)
  const target = typeof req.query.redirect === 'string' && req.query.redirect.startsWith('/') ? req.query.redirect : '/'
  res.redirect(target)
}))

app.post('/logout', ah(async (req, res) => {
  await dropSiteSession(readCookie(req, SESSION_COOKIE))
  clearSessionCookie(res)
  res.redirect('/')
}))

// ============ Админ-панель /admin ============

const ADMIN_COOKIE = 'admin'
const ADMIN_TTL_MS = 12 * 60 * 60 * 1000
const adminToken = () => {
  const payload = Buffer.from('admin:' + (Date.now() + ADMIN_TTL_MS)).toString('base64url')
  const sig = createHmac('sha256', ADMIN_PASSWORD).update(payload).digest('base64url')
  return payload + '.' + sig
}
const adminOk = (req) => {
  const c = readCookie(req, ADMIN_COOKIE)
  if (!c) return false
  const i = c.indexOf('.')
  if (i <= 0) return false
  const p = c.slice(0, i)
  const s = c.slice(i + 1)
  const expected = createHmac('sha256', ADMIN_PASSWORD).update(p).digest('base64url')
  const t = Number(Buffer.from(p, 'base64url').toString())
  return s === expected && t > Date.now()
}
const setAdminCookie = (res) =>
  res.set('Set-Cookie', `${ADMIN_COOKIE}=${adminToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_TTL_MS / 1000}`)
const clearAdminCookie = (res) =>
  res.set('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)

app.get('/admin', (req, res) => {
  res
    .set('Content-Type', 'text/html; charset=utf-8')
    .send(adminPage({ authed: adminOk(req), passwordSet: Boolean(process.env.ADMIN_PASSWORD) }))
})

app.post('/admin', express.urlencoded({ extended: false }), (req, res) => {
  if (typeof req.body.password === 'string' && req.body.password === ADMIN_PASSWORD) {
    setAdminCookie(res)
  }
  res.redirect('/admin')
})

app.get('/admin/logout', (req, res) => {
  clearAdminCookie(res)
  res.redirect('/')
})

app.get('/v2/admin/users', ah(async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ message: 'нет доступа' })
  const { rows } = await query(
    'SELECT id, nickname, discord_id, discord_username, email, created_at FROM users ORDER BY created_at DESC LIMIT 500',
  )
  res.json({ users: rows })
}))

app.post('/v2/admin/set-nick', ah(async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ message: 'нет доступа' })
  const id = Number(req.body && req.body.id)
  const nick = normalizeNick(req.body && req.body.nickname)
  if (!id || nick.length < 2 || !NICK_RE.test(nick)) return res.status(400).json({ message: 'ник не подходит' })
  try {
    await query('UPDATE users SET nickname = $1 WHERE id = $2', [nick, id])
  } catch (err) {
    if (String(err && err.code) === '23505') return res.status(409).json({ message: 'Этот ник уже занят' })
    throw err
  }
  res.json({ ok: true })
}))

app.post('/v2/admin/delete-user', ah(async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ message: 'нет доступа' })
  const id = Number(req.body && req.body.id)
  if (!id) return res.status(400).json({ message: 'нет id' })
  await query('DELETE FROM users WHERE id = $1', [id])
  res.json({ ok: true })
}))

// ============ Подтверждение входа в лаунчер ============

app.get('/v2/auth/launcher/approve', ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM device_codes WHERE device_code = $1', [
    req.query.device_code,
  ])
  const row = rows[0]
  const now = Math.floor(Date.now() / 1000)
  if (!row || row.expires_at < now) {
    return res.set('Content-Type', 'text/html; charset=utf-8').send(errorPage('Код не найден', 'Код из лаунчера истёк или уже недействителен. Вернись в лаунчер и начни вход заново.'))
  }
  if (row.status === 'denied') {
    return res.set('Content-Type', 'text/html; charset=utf-8').send(errorPage('Вход отклонён', 'Ты сам отклонил этот вход в лаунчер.'))
  }
  const user = await siteUserByToken(readCookie(req, SESSION_COOKIE))
  if (!user) {
    const back = encodeURIComponent('/v2/auth/launcher/approve?device_code=' + req.query.device_code)
    return res.redirect(SITE_PAGE + '?redirect=' + back)
  }
  res
    .set('Content-Type', 'text/html; charset=utf-8')
    .send(approvePage({
      user: { nickname: user.nickname, discordName: user.discord_username, avatarUrl: user.discord_avatar },
      deviceCode: row.device_code,
      userCode: row.user_code,
    }))
}))

app.post('/v2/auth/launcher/accept', express.urlencoded({ extended: false }), ah(async (req, res) => {
  const ru = () => res.set('Content-Type', 'text/html; charset=utf-8')
  const { rows } = await query('SELECT * FROM device_codes WHERE device_code = $1', [
    req.body.deviceCode,
  ])
  const row = rows[0]
  if (!row || row.expires_at < Math.floor(Date.now() / 1000)) {
    return ru().send(errorPage('Код не найден', 'Код из лаунчера истёк или уже недействителен.'))
  }
  const user = await siteUserByToken(readCookie(req, SESSION_COOKIE))
  if (!user) {
    const back = encodeURIComponent('/v2/auth/launcher/approve?device_code=' + row.device_code)
    return res.redirect(SITE_PAGE + '?redirect=' + back)
  }
  await bindDeviceUser(row.device_code, user.id)
  ru().send(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Готово</title></head>
<body style="background:#08090A;color:#EDEFEE;font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0">
<div style="text-align:center;max-width:400px"><h2>Готово!</h2>
<p style="color:rgba(237,239,238,.7)">Возвращайся в лаунчер — под ником ${user.nickname.replace(/[<>&"]/g, '')} ты вошёл.</p>
<a href="/" style="color:#3EA6FF">Открыть сайт</a></div></body></html>`)
}))

/// Ввод кода на самом сайте (а не только переход по ссылке из лаунчера).
app.post('/v2/site/launcher/link', requireAuth, ah(async (req, res) => {
  const raw = String((req.body && req.body.code) || '').trim().replace(/\s+/g, '')
  if (!raw) return res.status(400).json({ message: 'Введи код из лаунчера' })
  const row = await deviceByUserCode(raw)
  const now = Math.floor(Date.now() / 1000)
  if (!row || row.expires_at < now) return res.status(404).json({ message: 'Код не найден или истёк — начни вход в лаунчере заново' })
  if (row.status === 'denied') return res.status(400).json({ message: 'Этот вход отклонён' })
  if (row.status === 'accepted') return res.json({ ok: true })
  await bindDeviceUser(row.device_code, req.userId)
  res.json({ ok: true })
}))

app.post('/v2/auth/launcher/poll', ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM device_codes WHERE device_code = $1', [
    req.body.deviceCode,
  ])
  const row = rows[0]
  if (!row || row.expires_at < Math.floor(Date.now() / 1000)) {
    if (row) {
      await query('UPDATE device_codes SET status = $1 WHERE device_code = $2', ['expired', row.device_code])
    }
    return res.json({ status: 'expired' })
  }
  if (row.status === 'denied') return res.json({ status: 'denied' })
  if (row.status !== 'accepted') return res.json({ status: 'pending' })

  let user = null
  if (row.user_id) {
    const { rows: users } = await query('SELECT * FROM users WHERE id = $1', [row.user_id])
    user = users[0] || null
  }
  if (!user) user = await newUser(null)
  const accessToken = signAccess(user.id)
  const refreshToken = await storeRefresh(user.id)
  res.json({
    status: 'ok',
    accessToken,
    refreshToken,
    user: { id: String(user.id), email: user.email || null, nickname: user.nickname },
  })
}))

// ============ Обновление сессии ============

app.post('/v2/auth/refresh', ah(async (req, res) => {
  const rt = req.body && req.body.refreshToken
  if (!rt) return res.status(400).json({ message: 'нет refreshToken' })
  const next = await rotateRefresh(rt)
  if (!next) return res.status(401).json({ message: 'refreshToken недействителен' })
  res.set('Set-Cookie', 'rt2=' + next.token + '; Path=/; HttpOnly; SameSite=Lax')
  res.json({ accessToken: signAccess(next.userId) })
}))

// ============ Запуск игры ============

app.post('/v2/launcher/game-session', requireAuth, ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.userId])
  const user = rows[0]
  const uuid = uuidFromId(user.id)
  res.json({
    accessToken: signAccess(user.id),
    uuid,
    name: user.nickname,
  })
}))

// ============ Текстуры ============

const texBase = (req) => hostBase(req) + '/v2/yggdrasil/csl/textures/'

const decodePng = (pngBase64) => {
  if (!pngBase64) return null
  let b64 = String(pngBase64)
  if (b64.startsWith('data:image/png;base64,')) b64 = b64.slice('data:image/png;base64,'.length)
  if (b64.startsWith('data:image/')) b64 = b64.slice(b64.indexOf(',') + 1)
  const buf = Buffer.from(b64, 'base64')
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (!buf.length || !buf.subarray(0, 8).equals(sig)) return null
  return buf
}

const textureHash = (buf) => createHash('sha1').update(buf).digest('hex')

const activeTextures = async (userId) => {
  const rows = await getActiveTextures(userId)
  const skin = rows.find((r) => r.kind === 'skin')
  const cape = rows.find((r) => r.kind === 'cape')
  return { skin, cape }
}

app.get('/v2/launcher/game-profile', requireAuth, ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.userId])
  const user = rows[0]
  const uuid = uuidFromId(user.id)
  const { skin, cape } = await activeTextures(user.id)
  res.json({
    uuid,
    uuidDashed:
      uuid.slice(0, 8) + '-' + uuid.slice(8, 12) + '-' + uuid.slice(12, 16) + '-' + uuid.slice(16, 20) + '-' + uuid.slice(20, 32),
    name: user.nickname,
    model: skin && skin.slim ? 'slim' : 'default',
    skinUrl: skin ? texBase(req) + skin.hash : null,
    capeUrl: cape ? texBase(req) + cape.hash : null,
  })
}))

app.get('/v2/users/me', requireAuth, ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.userId])
  const user = rows[0]
  res.json({
    nickname: user.nickname,
    discordName: user.discord_username || null,
    avatarUrl: await avatarForUser(user),
  })
}))

const NICK_RE = /^[\p{L}\p{N}\p{P}\p{S} ]{2,20}$/u
const normalizeNick = (s) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 20)

/// Смена ника работает и из лаунчера (Bearer), и с сайта (сессия).
/// Дубли ников запрещены (в т.ч. с разным регистром) уникальным индексом в БД.
app.patch('/v2/users/me', requireAuth, ah(async (req, res) => {
  const nick = normalizeNick(req.body && req.body.nickname)
  if (nick.length < 2 || !NICK_RE.test(nick)) {
    return res.status(400).json({ message: 'Ник — 2–20 символов. Можно буквы любого языка, цифры и символы' })
  }
  const { rows: taken } = await query(
    'SELECT id FROM users WHERE LOWER(nickname) = LOWER($1) AND id <> $2 LIMIT 1',
    [nick, req.userId],
  )
  if (taken[0]) return res.status(409).json({ message: 'Этот ник уже занят' })
  try {
    await query('UPDATE users SET nickname = $1 WHERE id = $2', [nick, req.userId])
  } catch (err) {
    if (String(err && err.code) === '23505') return res.status(409).json({ message: 'Этот ник уже занят' })
    throw err
  }
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.userId])
  res.json({ nickname: nick, avatarUrl: await avatarForUser(rows[0]) })
}))

app.post('/v2/launcher/heartbeat', requireAuth, (req, res) => res.json({}))
app.post('/v2/launcher/telemetry', requireAuth, (req, res) => res.json({}))
app.get('/v2/core/wallet/me/display', requireAuth, (req, res) => res.json({ availableKopecks: 0 }))
app.get('/v2/launcher/rewards', requireAuth, (req, res) => res.json({ items: [] }))

// ============ Приватность ============

const DEFAULT_PRIVACY = {
  showActivity: true,
  showFriends: true,
  showPlaytime: true,
  showAchievements: true,
  showMarket: true,
  showServers: true,
}

app.get('/v2/users/me/privacy', requireAuth, (req, res) => res.json({ ...DEFAULT_PRIVACY }))
app.patch('/v2/users/me/privacy', requireAuth, (req, res) =>
  res.json({ ...DEFAULT_PRIVACY, ...(req.body || {}) }),
)

// ============ Блокировки ============

app.get('/v2/core/blocks', requireAuth, ah(async (req, res) => {
  const { rows } = await query(
    `SELECT b.blocked_id, u.nickname, u.discord_avatar
     FROM blocks b LEFT JOIN users u ON u.id = b.blocked_id
     WHERE b.blocker_id = $1 ORDER BY b.created_at DESC`,
    [req.userId],
  )
  res.json({
    items: rows.map((r) => ({
      blockedId: String(r.blocked_id),
      user: { id: String(r.blocked_id), nickname: r.nickname, avatarUrl: r.discord_avatar || null },
    })),
  })
}))

app.delete('/v2/core/blocks/:blockedId', requireAuth, ah(async (req, res) => {
  await query('DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2', [
    req.userId,
    Number(req.params.blockedId),
  ])
  res.json({})
}))

// ============ Гардероб и скины ============

const wardItem = (t, req) => ({
  id: String(t.id),
  kind: t.kind,
  name: t.name,
  url: texBase(req) + t.hash,
  model: t.slim ? 'slim' : 'default',
  source: t.source,
  createdAt: String(t.created_at),
})

app.post('/v2/launcher/game-texture', requireAuth, ah(async (req, res) => {
  const body = req.body || {}
  const kind = body.type === 'cape' ? 'cape' : 'skin'
  // null pngBase64 = снять скин/плащ (лаунчер так сбрасывает текстуру)
  if (body.pngBase64 == null || body.pngBase64 === '') {
    await clearActiveTexture(req.userId, kind)
    const { skin, cape } = await activeTextures(req.userId)
    return res.json({
      skinUrl: skin ? texBase(req) + skin.hash : null,
      capeUrl: cape ? texBase(req) + cape.hash : null,
      model: skin && skin.slim ? 'slim' : 'default',
    })
  }
  const buf = decodePng(body.pngBase64)
  if (!buf) return res.status(400).json({ message: 'Нужен PNG-файл' })
  const hash = textureHash(buf)
  const name = body.name || (kind === 'cape' ? 'Плащ' : 'Скин')
  const slim = Boolean(body.slim)
  const mine = await getTextureByHash(hash)
  const tex = mine && Number(mine.user_id) === req.userId
    ? mine
    : await saveTexture({
        userId: req.userId, kind, name, hash,
        png: buf.toString('base64'), slim, active: true, source: 'custom',
      })
  await setActiveTexture(req.userId, kind, tex.id)
  const { skin, cape } = await activeTextures(req.userId)
  res.json({
    skinUrl: skin ? texBase(req) + skin.hash : null,
    capeUrl: cape ? texBase(req) + cape.hash : null,
    model: skin && skin.slim ? 'slim' : 'default',
  })
}))

app.get('/v2/launcher/wardrobe/capes/catalog', requireAuth, (req, res) => res.json([]))

app.get('/v2/launcher/wardrobe', requireAuth, ah(async (req, res) => {
  const items = await listTextures(req.userId)
  const { skin, cape } = await activeTextures(req.userId)
  res.json({
    items: items.map((t) => wardItem(t, req)),
    active: {
      skinUrl: skin ? texBase(req) + skin.hash : null,
      capeUrl: cape ? texBase(req) + cape.hash : null,
      model: skin && skin.slim ? 'slim' : 'default',
    },
  })
}))

app.post('/v2/launcher/wardrobe', requireAuth, ah(async (req, res) => {
  const body = req.body || {}
  const kind = body.kind === 'cape' ? 'cape' : 'skin'
  const buf = decodePng(body.pngBase64)
  if (!buf) return res.status(400).json({ message: 'Нужен PNG-файл' })
  const tex = await saveTexture({
    userId: req.userId,
    kind,
    name: body.name || (kind === 'cape' ? 'Плащ' : 'Скин'),
    hash: textureHash(buf),
    png: buf.toString('base64'),
    slim: Boolean(body.slim),
    active: false,
    source: body.source || 'custom',
  })
  res.status(201).json(wardItem(tex, req))
}))

app.post('/v2/launcher/wardrobe/:id/apply', requireAuth, ah(async (req, res) => {
  const tex = await getTexture(req.params.id)
  if (!tex || Number(tex.user_id) !== req.userId) return res.status(404).json({ message: 'не найдено' })
  await setActiveTexture(req.userId, tex.kind, tex.id)
  const { skin, cape } = await activeTextures(req.userId)
  res.json({
    skinUrl: skin ? texBase(req) + skin.hash : null,
    capeUrl: cape ? texBase(req) + cape.hash : null,
    model: skin && skin.slim ? 'slim' : 'default',
  })
}))
app.delete('/v2/launcher/wardrobe/:id', requireAuth, ah(async (req, res) => {
  await deleteTexture(req.userId, req.params.id)
  res.json({})
}))

// ============ Награды ============

app.get('/v2/launcher/rewards', requireAuth, (req, res) => res.json({ items: [] }))
app.post('/v2/launcher/rewards/:code/claim', requireAuth, (req, res) =>
  res.status(404).json({ message: 'Код не найден' }),
)

// ============ Друзья ============

const PRESENCE_ONLINE_MS = 45000

const friendRow = (user) => ({
  userId: String(user.id),
  nickname: user.nickname,
  avatarUrl: user.discord_avatar || null,
})

const rowToMsg = (row) => {
  let attachment = null
  if (row.attachment) {
    try {
      attachment = JSON.parse(row.attachment)
    } catch {}
  }
  return {
    id: String(row.id),
    text: row.text || '',
    ts: Number(row.created_at),
    attachment,
  }
}

/// Присутствие в формате Friend для списка/полла: онлайн по свежести seen_at,
/// статус «в игре» — по полю status, unread — непрочитанные сообщения от него.
const presenceRow = async (me, user) => {
  const p = await presenceOf(user.id)
  const online = !!p && Date.now() - p.seen_at < PRESENCE_ONLINE_MS
  const playing = !!p && p.status === 'playing'
  return {
    ...friendRow(user),
    online,
    playing,
    text: playing
      ? p.server || p.build || 'В игре'
      : online
        ? 'В лаунчере'
        : p && p.status === 'playing'
          ? 'В игре'
          : 'Не в сети',
    serverIp: playing ? p.server_ip : null,
    serverName: playing ? p.server : null,
    build: playing ? p.build : null,
    lastSeen: p ? p.seen_at : null,
    unread: await unreadCount(me, user.id),
  }
}

// Возвращает список друзей текущего пользователя (обе стороны связи).
const friendIds = async (userId) => {
  const { rows } = await query(
    `SELECT CASE WHEN user_a = $1 THEN user_b ELSE user_a END AS id
     FROM friendships WHERE user_a = $1 OR user_b = $1`,
    [userId],
  )
  return rows.map((r) => Number(r.id))
}

app.get('/v2/friends', requireAuth, ah(async (req, res) => {
  const ids = await friendIds(req.userId)
  const friends = []
  for (const id of ids) {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [id])
    if (rows[0]) friends.push(await presenceRow(req.userId, rows[0]))
  }
  res.json({ friends })
}))

app.get('/v2/friends/requests', requireAuth, ah(async (req, res) => {
  const inc = await query(
    `SELECT fr.id, fr.from_id, u.nickname, u.discord_avatar
     FROM friend_requests fr JOIN users u ON u.id = fr.from_id
     WHERE fr.to_id = $1 AND fr.status = 'pending' ORDER BY fr.created_at DESC`,
    [req.userId],
  )
  const out = await query(
    `SELECT fr.id, fr.to_id, u.nickname, u.discord_avatar
     FROM friend_requests fr JOIN users u ON u.id = fr.to_id
     WHERE fr.from_id = $1 AND fr.status = 'pending' ORDER BY fr.created_at DESC`,
    [req.userId],
  )
  const map = (r) => ({ id: String(r.id), userId: String(r.from_id || r.to_id), nickname: r.nickname, avatarUrl: r.discord_avatar || null })
  res.json({ incoming: inc.rows.map(map), outgoing: out.rows.map(map) })
}))

const friendshipStatus = async (a, b) => {
  const { rows } = await query(
    'SELECT 1 FROM friendships WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)',
    [a, b],
  )
  return rows.length > 0
}

app.get('/v2/friends/search', requireAuth, ah(async (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase()
  if (q.length < 2) return res.json({ results: [] })
  const { rows } = await query(
    `SELECT * FROM users WHERE LOWER(nickname) LIKE $1 AND id <> $2 ORDER BY nickname LIMIT 10`,
    ['%' + q + '%', req.userId],
  )
  const mine = rows
  const results = []
  for (const u of mine) {
    const uid = Number(u.id)
    const isFriend = await friendshipStatus(req.userId, uid)
    const pending = !isFriend && (await query(
      `SELECT 1 FROM friend_requests
       WHERE status = 'pending'
         AND ((from_id = $1 AND to_id = $2) OR (from_id = $2 AND to_id = $1)) LIMIT 1`,
      [req.userId, uid],
    )).rows.length > 0
    results.push({
      userId: String(uid),
      nickname: u.nickname,
      avatarUrl: u.discord_avatar || null,
      isFriend,
      pending,
      text: 'Игрок Enemy',
    })
  }
  res.json({ results })
}))

app.post('/v2/friends/request', requireAuth, ah(async (req, res) => {
  const body = req.body || {}
  let target = Number(body.targetId)
  if (!target && typeof body.nickname === 'string') {
    const { rows } = await query('SELECT id FROM users WHERE LOWER(nickname) = LOWER($1) LIMIT 1', [body.nickname.trim()])
    target = rows[0] ? Number(rows[0].id) : 0
  }
  if (!target || target === req.userId) return res.status(400).json({ message: 'Пользователь не найден' })
  if (await friendshipStatus(req.userId, target)) return res.json({ status: 'already_friends' })
  const reverse = await query(
    'SELECT * FROM friend_requests WHERE from_id = $1 AND to_id = $2 AND status = $3 LIMIT 1',
    [target, req.userId, 'pending'],
  )
  if (reverse.rows[0]) {
    await query(
      'UPDATE friend_requests SET status = $1 WHERE id = $2',
      ['accepted', reverse.rows[0].id],
    )
    const a = Math.min(req.userId, target)
    const b = Math.max(req.userId, target)
    await query(
      'INSERT INTO friendships (user_a, user_b, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [a, b, Date.now()],
    )
    return res.json({ status: 'accepted' })
  }
  const existing = await query(
    'SELECT id FROM friend_requests WHERE from_id = $1 AND to_id = $2 AND status = $3 LIMIT 1',
    [req.userId, target, 'pending'],
  )
  if (existing.rows[0]) return res.json({ status: 'pending' })
  await query(
    'INSERT INTO friend_requests (from_id, to_id, status, created_at) VALUES ($1, $2, $3, $4)',
    [req.userId, target, 'pending', Date.now()],
  )
  res.json({ status: 'pending' })
}))

app.post('/v2/friends/accept', requireAuth, ah(async (req, res) => {
  const id = Number((req.body || {}).id)
  const { rows } = await query(
    'SELECT * FROM friend_requests WHERE id = $1 AND to_id = $2 AND status = $3 LIMIT 1',
    [id, req.userId, 'pending'],
  )
  if (!rows[0]) return res.status(404).json({ message: 'Заявка не найдена' })
  await query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['accepted', id])
  const a = Math.min(Number(rows[0].from_id), req.userId)
  const b = Math.max(Number(rows[0].from_id), req.userId)
  await query('INSERT INTO friendships (user_a, user_b, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [a, b, Date.now()])
  res.json({})
}))

app.post('/v2/friends/decline', requireAuth, ah(async (req, res) => {
  await query(
    'UPDATE friend_requests SET status = $1 WHERE id = $2 AND to_id = $3',
    ['declined', Number((req.body || {}).id), req.userId],
  )
  res.json({})
}))

app.post('/v2/friends/cancel', requireAuth, ah(async (req, res) => {
  await query(
    'UPDATE friend_requests SET status = $1 WHERE id = $2 AND from_id = $3',
    ['cancelled', Number((req.body || {}).id), req.userId],
  )
  res.json({})
}))

app.post('/v2/friends/remove', requireAuth, ah(async (req, res) => {
  const uid = Number((req.body || {}).userId)
  if (!uid) return res.status(400).json({ message: 'нет userId' })
  await query(
    'DELETE FROM friendships WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)',
    [req.userId, uid],
  )
  res.json({})
}))

app.post('/v2/friends/block', requireAuth, ah(async (req, res) => {
  const uid = Number((req.body || {}).userId)
  if (!uid) return res.status(400).json({ message: 'нет userId' })
  await query(
    'DELETE FROM friendships WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)',
    [req.userId, uid],
  )
  await query(
    'INSERT INTO blocks (blocker_id, blocked_id, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [req.userId, uid, Date.now()],
  )
  res.json({})
}))

app.get('/v2/friends/profile/:uid', requireAuth, ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [Number(req.params.uid)])
  const u = rows[0]
  if (!u) return res.status(404).json({ message: 'Не найден' })
  const p = await presenceOf(u.id)
  const online = !!p && Date.now() - p.seen_at < PRESENCE_ONLINE_MS
  const playing = !!p && p.status === 'playing'
  res.json({
    nick: u.nickname,
    nickname: u.nickname,
    text: playing ? (p.server || p.build || 'Играет') : online ? 'В лаунчере' : 'Игрок Enemy',
    online,
    playing,
    serverIp: playing ? p.server_ip : null,
    serverName: playing ? p.server : null,
    build: playing ? p.build : null,
    stats: await playStatsOf(u.id),
  })
}))

app.post('/v2/friends/chat/upload', requireAuth, (req, res) => {
  const body = req.body || {}
  const kind = body.kind === 'voice' ? 'voice' : 'image'
  const mime = kind === 'voice' ? 'audio/ogg' : 'image/png'
  const name = kind === 'voice' ? 'message.ogg' : 'image.png'
  const b64 = String(body.dataBase64 || '')
  const url = b64 ? 'data:' + mime + ';base64,' + b64 : null
  // Вложения едут как data-URL внутри сообщения — сервер не держит файлы.
  res.json({
    url,
    kind,
    name,
    ...(kind === 'voice'
      ? { durationMs: body.durationMs || 0, peaks: Array.isArray(body.peaks) ? body.peaks : [] }
      : {}),
  })
})

app.get('/v2/friends/chat/:uid', requireAuth, ah(async (req, res) => {
  const peer = Number(req.params.uid)
  if (!peer) return res.status(400).json({ message: 'нет uid' })
  const before = Number(req.query.before) || null
  const rows = await chatPage(req.userId, peer, before)
  res.json({
    messages: rows.map((r) => ({ ...rowToMsg(r), me: Number(r.from_id) === req.userId })),
    hasMore: rows.length === 50,
    peerReadAt: (await peerReadAt(peer, req.userId)) || null,
  })
}))

app.post('/v2/friends/chat/:uid', requireAuth, ah(async (req, res) => {
  const peer = Number(req.params.uid)
  if (!peer) return res.status(400).json({ message: 'нет uid' })
  const body = req.body || {}
  const row = await saveMessage({
    fromId: req.userId,
    toId: peer,
    text: String(body.text || ''),
    attachment: body.attachment || null,
  })
  res.json({ id: String(row.id), ts: Number(row.created_at) })
}))

app.post('/v2/friends/chat/:uid/read', requireAuth, ah(async (req, res) => {
  const peer = Number(req.params.uid)
  if (peer) await markRead(req.userId, peer)
  res.json({})
}))

app.post('/v2/friends/chat/:uid/typing', requireAuth, ah(async (req, res) => {
  const peer = Number(req.params.uid)
  if (peer) await setTyping(req.userId, peer)
  res.json({})
}))

app.get('/v2/friends/poll', requireAuth, ah(async (req, res) => {
  const ids = await friendIds(req.userId)
  await bumpPresence(req.userId)
  const presence = []
  for (const id of ids) {
    const user = (await query('SELECT * FROM users WHERE id = $1', [id])).rows[0]
    if (user) presence.push(await presenceRow(req.userId, user))
  }
  const inc = await query(
    `SELECT fr.id, fr.from_id, u.nickname, u.discord_avatar
     FROM friend_requests fr JOIN users u ON u.id = fr.from_id
     WHERE fr.to_id = $1 AND fr.status = 'pending' ORDER BY fr.created_at DESC`,
    [req.userId],
  )
  const out = await query(
    `SELECT fr.id, fr.to_id, u.nickname, u.discord_avatar
     FROM friend_requests fr JOIN users u ON u.id = fr.to_id
     WHERE fr.from_id = $1 AND fr.status = 'pending' ORDER BY fr.created_at DESC`,
    [req.userId],
  )
  const map = (r) => ({ id: String(r.id), userId: String(r.from_id || r.to_id), nickname: r.nickname, avatarUrl: r.discord_avatar || null })
  const since = Number(req.query.since) || Date.now() - 10 * 60000
  const byId = new Map(presence.map((p) => [Number(p.userId), p]))
  const messages = (await newIncomingMessages(req.userId, ids, since)).map((row) => ({
    id: String(row.id),
    from: String(row.from_id),
    fromNick: (byId.get(Number(row.from_id)) || {}).nickname || '',
    ts: Number(row.created_at),
    ...rowToMsg(row),
  }))
  const reads = []
  for (const id of ids) {
    const readAt = await peerReadAt(id, req.userId)
    if (readAt) reads.push({ userId: String(id), readAt })
  }
  res.json({
    now: Date.now(),
    presence,
    requests: { incoming: inc.rows.map(map), outgoing: out.rows.map(map) },
    messages,
    reads,
    typing: await typingPeers(req.userId, ids),
  })
}))

app.post('/v2/friends/stats', requireAuth, ah(async (req, res) => {
  await savePlayStats(req.userId, req.body || {})
  res.json({})
}))

app.post('/v2/friends/stats/hide', requireAuth, ah(async (req, res) => {
  await hidePlayStats(req.userId)
  res.json({})
}))

app.post('/v2/friends/presence/heartbeat', requireAuth, ah(async (req, res) => {
  await touchPresence(req.userId, (req.body || {}).status ? req.body : {})
  res.json({})
}))

// ============ Рейтинг серверов ============

/// Прокси для HotMC: движок вебвью не даёт достучаться до hotmc.ru напрямую
/// (CORS и анти-бот проверка на заголовки браузера). Качаем один раз и
/// кешируем на 5 минут — список популярных серверов меняется медленно.
const HOTMC_API = 'https://hotmc.ru/api/v1/servers'
let hotmcCache = { at: 0, servers: [], total: 0 }
const HOTMC_TTL = 5 * 60 * 1000

async function fetchHotmc(category) {
  const now = Date.now()
  if (now - hotmcCache.at < HOTMC_TTL) return hotmcCache
  const url = HOTMC_API + '?limit=30&sort=rating' + (category ? '&category=' + encodeURIComponent(category) : '')
  const r = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      Accept: 'application/json',
    },
  })
  if (!r.ok) throw new Error('hotmc http ' + r.status)
  const d = await r.json()
  const list = Array.isArray(d) ? d : d.servers || d.list || []
  hotmcCache = { at: now, servers: list, total: d.total ?? list.length }
  return hotmcCache
}

app.get('/v2/rating/servers', requireAuth, (req, res) => {
  void (async () => {
    if (req.query.source === 'hotmc') {
      try {
        const d = await fetchHotmc(String(req.query.category || ''))
        res.json({ servers: d.servers, topThree: [], total: d.total })
      } catch (e) {
        res.status(502).json({ error: String(e) })
      }
      return
    }
    res.json({ servers: [], topThree: [], total: 0 })
  })()
})

// ============ Ошибки / отчёты ============

app.post('/v2/errors', (req, res) => res.json({}))

// ============ Хостинг: каталог и тарифы ============

app.get('/v2/hosting/plans', requireAuth, (req, res) => res.json([]))
app.get('/v2/hosting/catalog/cores', requireAuth, (req, res) => res.json({ cores: [], stale: false }))

app.get('/v2/hosting/catalog/search', requireAuth, (req, res) =>
  res.json({ hits: [], total: 0, nextOffset: 0, hasMore: false }),
)

app.get('/v2/hosting/catalog/curseforge/:modId', requireAuth, (req, res) => res.json({ files: [] }))
app.get('/v2/hosting/catalog/curseforge', requireAuth, (req, res) =>
  res.json({ hits: [], enabled: false, hasMore: false, nextOffset: 0 }),
)

app.get('/v2/hosting/catalog/ftb/:packId', requireAuth, (req, res) =>
  res.json({ id: req.params.packId, name: '', summary: '', iconUrl: null, installs: 0, tags: [], versions: [] }),
)
app.get('/v2/hosting/catalog/ftb', requireAuth, (req, res) => res.json({ packs: [], stale: false }))

// ============ Хостинг: серверы ============

app.get('/v2/hosting/servers/me', requireAuth, (req, res) => res.json([]))

app.post('/v2/hosting/servers', requireAuth, (req, res) => {
  const body = req.body || {}
  const id = 'srv_' + Math.random().toString(36).slice(2, 10)
  const plan = body.planCode || 'default'
  res.status(201).json({
    id,
    name: body.name || 'Мой сервер',
    slug: id,
    status: 'stopped',
    address: null,
    icon: null,
    core: 'vanilla',
    version: 'latest',
    preset: null,
    planName: plan,
    planCode: plan,
    planRamMb: 1024,
    ramMb: 1024,
    maxPlayers: 20,
    planMaxPlayers: 20,
    playersOnline: 0,
    inviteUrl: null,
    pendingRestart: false,
    planPriceKopecks: 0,
    expiresAt: null,
    worldDeleteAt: null,
  })
})

const HOSTING_404 = (req, res) => res.status(404).json({ message: 'Сервер не найден' })

app.get('/v2/hosting/servers/:id', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id', requireAuth, HOSTING_404)

app.post('/v2/hosting/servers/:id/start', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/stop', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/restart', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/kill', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/crash', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/plan', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/plan/auto-renew', requireAuth, HOSTING_404)
app.patch('/v2/hosting/servers/:id/name', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/icon', requireAuth, HOSTING_404)
app.patch('/v2/hosting/servers/:id/settings', requireAuth, HOSTING_404)
app.patch('/v2/hosting/servers/:id/core', requireAuth, HOSTING_404)
app.patch('/v2/hosting/servers/:id/address', requireAuth, HOSTING_404)
app.patch('/v2/hosting/servers/:id/domain', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/stats', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/online', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/events', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/usage', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/backups', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/backups', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/backups/:backupId', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/backups/:backupId/restore', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/installs', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/installs', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/installs/:installId', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/installs/updates', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/reinstall', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/worlds', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/worlds/switch', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/worlds/import', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/world/regenerate', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/features', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/features/:feature', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/features/:feature', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/files', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/files', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/files/content', requireAuth, HOSTING_404)
app.put('/v2/hosting/servers/:id/files/content', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/files/mkdir', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/files/rename', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/files/extract', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/schedules', requireAuth, HOSTING_404)
app.put('/v2/hosting/servers/:id/schedules', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/ports', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/ports', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/ports/:port', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/database', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/database', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/database', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/sftp', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/sftp', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/sftp', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/shares', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/shares', requireAuth, HOSTING_404)
app.patch('/v2/hosting/servers/:id/shares/:userId', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/shares/:userId', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/api-keys', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/api-keys', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/api-keys/:keyId', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/notifications', requireAuth, HOSTING_404)
app.put('/v2/hosting/servers/:id/notifications', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/console/command', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/console/command', requireAuth, HOSTING_404)
app.get('/v2/hosting/servers/:id/players', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/players', requireAuth, HOSTING_404)
app.delete('/v2/hosting/servers/:id/players/:playerId', requireAuth, HOSTING_404)
app.patch('/v2/hosting/servers/:id/players/:playerId/role', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/players/:playerId/ban', requireAuth, HOSTING_404)
app.post('/v2/hosting/servers/:id/online/action', requireAuth, HOSTING_404)

// ============ Yggdrasil (authlib-injector) ============

const YGG_BASE = '/v2/yggdrasil'

const yggMeta = () => ({
  meta: {
    serverName: 'Enemy Launcher',
    implementationName: 'Enemy Yggdrasil',
    implementationVersion: '1.0',
    'feature.non_email_login': true,
    'feature.username_login': true,
    'feature.email_login': false,
    'feature.registration': false,
  },
})

const yggProfile = async (user, req) => {
  const uuid = uuidFromId(user.id)
  const { skin, cape } = await activeTextures(user.id)
  const textureMap = {}
  if (skin) textureMap.SKIN = { url: texBase(req) + skin.hash, metadata: { model: skin.slim ? 'slim' : 'default' } }
  if (cape) textureMap.CAPE = { url: texBase(req) + cape.hash }
  const textures = {
    timestamp: Date.now(),
    profileId: uuid,
    profileName: user.nickname,
    textures: textureMap,
  }
  return {
    id: uuid,
    name: user.nickname,
    properties: [
      {
        name: 'textures',
        value: Buffer.from(JSON.stringify(textures)).toString('base64'),
        signature: '',
      },
    ],
  }
}

const bearerUser = async (req) => {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  const payload = verifyAccess(token)
  if (!payload) return null
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [payload.sub])
  return rows[0] || null
}

const yggForbidden = (res) =>
  res.status(403).json({ error: 'ForbiddenOperationException', errorMessage: 'Invalid token' })

app.get(YGG_BASE, (req, res) => res.json(yggMeta()))
app.get(YGG_BASE + '/', (req, res) => res.json(yggMeta()))

app.post(YGG_BASE + '/authserver/authenticate', (req, res) => yggForbidden(res))

app.post(YGG_BASE + '/authserver/validate', async (req, res) => {
  const user = await bearerUser(req)
  if (!user) return yggForbidden(res)
  res.sendStatus(204)
})

app.post(YGG_BASE + '/authserver/refresh', (req, res) => yggForbidden(res))
app.post(YGG_BASE + '/authserver/signout', (req, res) => res.sendStatus(204))
app.post(YGG_BASE + '/authserver/invalidate', (req, res) => res.sendStatus(204))

app.post(YGG_BASE + '/sessionserver/session/minecraft/join', (req, res) => res.sendStatus(204))

app.get(YGG_BASE + '/sessionserver/session/minecraft/hasJoined', (req, res) => res.sendStatus(204))

app.get(YGG_BASE + '/sessionserver/session/minecraft/profile/:uuid', async (req, res) => {
  const user = await bearerUser(req)
  if (!user) return yggForbidden(res)
  if (uuidFromId(user.id) !== req.params.uuid) return res.sendStatus(404)
  res.json(await yggProfile(user, req))
})

// ============ CustomSkinLoader ============

app.get(YGG_BASE + '/csl/:nick', ah(async (req, res) => {
  const user = await getUserByNick(req.params.nick)
  if (!user) return res.status(404).json({ message: 'Игрок не найден' })
  const { skin, cape } = await activeTextures(user.id)
  const skins = {}
  const capes = {}
  if (skin) {
    if (skin.slim) skins.slim = skin.hash
    else skins.default = skin.hash
  }
  if (cape) capes.enemy = cape.hash
  res.json({ skins, capes })
}))

app.get(YGG_BASE + '/csl/textures/:hash', ah(async (req, res) => {
  const tex = await getTextureByHash(req.params.hash)
  if (!tex) return res.status(404).send('Текстура не найдена')
  res.set('Content-Type', 'image/png').send(Buffer.from(tex.png, 'base64'))
}))

// ============ Заглушки: всё остальное не падает ============

app.all('/v2/*', requireAuth, (req, res) => {
  if (req.path.startsWith('/hosting/catalog') || req.path.startsWith('/hosting/plans')) return res.json([])
  res.json({})
})
