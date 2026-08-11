import express from 'express'
import { randomBytes, createHash } from 'node:crypto'
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
} from './db.js'
import { requireAuth, setSessionReader, signAccess, verifyAccess } from './auth.js'
import { approvePage, errorPage, sitePage } from './site.js'

// Dev convenience: reads a git-ignored .env next to package.json so the Discord
// secret never lives in the repo. Production secrets come from the platform.
try {
  const { readFileSync } = await import('node:fs')
  const { dirname, join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const dir = dirname(fileURLToPath(import.meta.url))
  const text = readFileSync(join(dir, '..', '.env'), 'utf8')
  for (const line of text.split('\n')) {
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch {}

const PUBLIC_BASE = process.env.PUBLIC_BASE || 'http://localhost:8787'
// The Discord client ID is public; only the secret is a secret.
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1536058209532510259'
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ''
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
    verifyUrl: PUBLIC_BASE + '/v2/auth/launcher/approve?device_code=' + deviceCode,
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
    redirect_uri: PUBLIC_BASE + '/v2/auth/discord/callback',
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
      redirect_uri: PUBLIC_BASE + '/v2/auth/discord/callback',
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

const TEXTURE_BASE = PUBLIC_BASE + '/v2/yggdrasil/csl/textures/'

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
    skinUrl: skin ? TEXTURE_BASE + skin.hash : null,
    capeUrl: cape ? TEXTURE_BASE + cape.hash : null,
  })
}))

app.get('/v2/users/me', requireAuth, ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.userId])
  const user = rows[0]
  res.json({
    nickname: user.nickname,
    discordName: user.discord_username || null,
    avatarUrl: user.discord_avatar || null,
  })
}))

const NICK_RE = /^[A-Za-zА-Яа-яЁё0-9 _.-]{3,20}$/
const normalizeNick = (s) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 20)

/// Смена ника работает и из лаунчера (Bearer), и с сайта (сессия).
app.patch('/v2/users/me', requireAuth, ah(async (req, res) => {
  const nick = normalizeNick(req.body && req.body.nickname)
  if (nick.length < 3 || !NICK_RE.test(nick)) {
    return res.status(400).json({ message: 'Ник 3–20 символов: буквы, цифры, _, -, точка или пробел' })
  }
  const { rows: taken } = await query(
    'SELECT * FROM users WHERE LOWER(nickname) = LOWER($1) AND id <> $2 LIMIT 1',
    [nick, req.userId],
  )
  if (taken[0]) return res.status(409).json({ message: 'Этот ник уже занят' })
  await query('UPDATE users SET nickname = $1 WHERE id = $2', [nick, req.userId])
  res.json({ nickname: nick })
}))

app.post('/v2/launcher/heartbeat', requireAuth, (req, res) => res.json({}))
app.post('/v2/launcher/telemetry', requireAuth, (req, res) => res.json({}))
app.get('/v2/core/wallet/me/display', requireAuth, (req, res) => res.json({ availableKopecks: 0 }))
app.get('/v2/rating/servers', requireAuth, (req, res) => res.json({ servers: [], topThree: [], total: 0 }))
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

app.get('/v2/core/blocks', requireAuth, (req, res) => res.json({ items: [] }))
app.delete('/v2/core/blocks/:blockedId', requireAuth, (req, res) => res.json({}))

// ============ Гардероб и скины ============

const wardItem = (t) => ({
  id: String(t.id),
  kind: t.kind,
  name: t.name,
  url: TEXTURE_BASE + t.hash,
  model: t.slim ? 'slim' : 'default',
  source: t.source,
  createdAt: String(t.created_at),
})

app.post('/v2/launcher/game-texture', requireAuth, ah(async (req, res) => {
  const body = req.body || {}
  const kind = body.type === 'cape' ? 'cape' : 'skin'
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
    skinUrl: skin ? TEXTURE_BASE + skin.hash : null,
    capeUrl: cape ? TEXTURE_BASE + cape.hash : null,
    model: skin && skin.slim ? 'slim' : 'default',
  })
}))

app.get('/v2/launcher/wardrobe/capes/catalog', requireAuth, (req, res) => res.json([]))

app.get('/v2/launcher/wardrobe', requireAuth, ah(async (req, res) => {
  const items = await listTextures(req.userId)
  const { skin, cape } = await activeTextures(req.userId)
  res.json({
    items: items.map(wardItem),
    active: {
      skinUrl: skin ? TEXTURE_BASE + skin.hash : null,
      capeUrl: cape ? TEXTURE_BASE + cape.hash : null,
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
  res.status(201).json(wardItem(tex))
}))

app.post('/v2/launcher/wardrobe/:id/apply', requireAuth, ah(async (req, res) => {
  const tex = await getTexture(req.params.id)
  if (!tex || Number(tex.user_id) !== req.userId) return res.status(404).json({ message: 'не найдено' })
  await setActiveTexture(req.userId, tex.kind, tex.id)
  const { skin, cape } = await activeTextures(req.userId)
  res.json({
    skinUrl: skin ? TEXTURE_BASE + skin.hash : null,
    capeUrl: cape ? TEXTURE_BASE + cape.hash : null,
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

app.get('/v2/friends', requireAuth, (req, res) => res.json({ friends: [] }))
app.get('/v2/friends/requests', requireAuth, (req, res) => res.json({ incoming: [], outgoing: [] }))

app.get('/v2/friends/search', requireAuth, (req, res) => res.json({ results: [] }))

app.post('/v2/friends/request', requireAuth, (req, res) => {
  const r = res.json({ status: 'pending' })
  return r
})
app.post('/v2/friends/accept', requireAuth, (req, res) => res.json({}))
app.post('/v2/friends/decline', requireAuth, (req, res) => res.json({}))
app.post('/v2/friends/cancel', requireAuth, (req, res) => res.json({}))
app.post('/v2/friends/remove', requireAuth, (req, res) => res.json({}))
app.post('/v2/friends/block', requireAuth, (req, res) => res.json({}))

app.get('/v2/friends/profile/:uid', requireAuth, (req, res) =>
  res.json({ nick: '', nickname: '', text: '', online: false }),
)

app.post('/v2/friends/chat/upload', requireAuth, (req, res) => {
  const body = req.body || {}
  const kind = body.kind === 'voice' ? 'voice' : 'image'
  const name = kind === 'voice' ? 'message.ogg' : 'image.png'
  res.json({ url: null, kind, name })
})

app.get('/v2/friends/chat/:uid', requireAuth, (req, res) =>
  res.json({ messages: [], hasMore: false, peerReadAt: null }),
)

app.post('/v2/friends/chat/:uid', requireAuth, (req, res) =>
  res.json({ id: String(Math.floor(Math.random() * 1e15)), ts: Date.now() }),
)

app.post('/v2/friends/chat/:uid/read', requireAuth, (req, res) => res.json({}))
app.post('/v2/friends/chat/:uid/typing', requireAuth, (req, res) => res.json({}))

app.get('/v2/friends/poll', requireAuth, (req, res) =>
  res.json({
    now: Date.now(),
    presence: [],
    requests: { incoming: [], outgoing: [] },
    messages: [],
    reads: [],
    typing: [],
  }),
)

app.post('/v2/friends/stats', requireAuth, (req, res) => res.json({}))
app.post('/v2/friends/stats/hide', requireAuth, (req, res) => res.json({}))
app.post('/v2/friends/presence/heartbeat', requireAuth, (req, res) => res.json({}))

// ============ Рейтинг серверов ============

app.get('/v2/rating/servers', requireAuth, (req, res) =>
  res.json({ servers: [], topThree: [], total: 0 }),
)

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

const yggProfile = async (user) => {
  const uuid = uuidFromId(user.id)
  const { skin, cape } = await activeTextures(user.id)
  const textureMap = {}
  if (skin) textureMap.SKIN = { url: TEXTURE_BASE + skin.hash, metadata: { model: skin.slim ? 'slim' : 'default' } }
  if (cape) textureMap.CAPE = { url: TEXTURE_BASE + cape.hash }
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
  res.json(await yggProfile(user))
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
