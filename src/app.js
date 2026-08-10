import express from 'express'
import { randomBytes } from 'node:crypto'
import { query, newUser, rotateRefresh, storeRefresh, uuidFromId } from './db.js'
import { requireAuth, signAccess } from './auth.js'

const PUBLIC_BASE = process.env.PUBLIC_BASE || 'http://localhost:8787'
const INTERVAL_S = 3
const EXPIRE_S = 300

const ah = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err)
    res.status(500).json({ message: 'internal error' })
  })

export const app = express()
app.use(express.json({ limit: '25mb' }))
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
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

const APPROVE_PAGE = (deviceCode, userCode) => `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Вход в Enemy Launcher</title>
  <style>
    body{font-family:system-ui,sans-serif;background:#08090A;color:#EDEFEE;display:grid;place-items:center;min-height:100vh;margin:0}
    .box{background:#121418;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:28px;width:340px;text-align:center}
    h1{font-size:18px;margin:0 0 6px}
    .code{font-family:monospace;font-size:26px;letter-spacing:.12em;color:#3EA6FF;margin:12px 0}
    p{color:rgba(237,239,238,.7);font-size:13px;line-height:1.5}
    button{margin-top:14px;width:100%;padding:11px;border:0;border-radius:10px;background:#3EA6FF;color:#fff;font-size:14px;font-weight:700;cursor:pointer}
    button:hover{filter:brightness(1.08)}
  </style>
</head>
<body>
  <form class="box" method="POST" action="/v2/auth/launcher/accept">
    <h1>Подтверждение входа</h1>
    <p>Войди в лаунчер с кодом</p>
    <div class="code">${userCode}</div>
    <input type="hidden" name="deviceCode" value="${deviceCode}" />
    <button type="submit">Подтвердить</button>
  </form>
</body>
</html>`

app.get('/v2/auth/launcher/approve', ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM device_codes WHERE device_code = $1', [
    req.query.device_code,
  ])
  const row = rows[0]
  if (!row || row.expires_at < Math.floor(Date.now() / 1000)) {
    return res.status(404).send('Код не найден или истёк')
  }
  if (row.status === 'denied') return res.status(400).send('Вход отклонён')
  if (row.status === 'accepted') return res.status(200).send('Код уже подтверждён — возвращайся в лаунчер')
  res.set('Content-Type', 'text/html').send(APPROVE_PAGE(row.device_code, row.user_code))
}))

app.post('/v2/auth/launcher/accept', express.urlencoded({ extended: false }), ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM device_codes WHERE device_code = $1', [
    req.body.deviceCode,
  ])
  const row = rows[0]
  if (!row || row.expires_at < Math.floor(Date.now() / 1000)) {
    return res.status(404).send('Код не найден или истёк')
  }
  await query('UPDATE device_codes SET status = $1, accepted_at = $2 WHERE device_code = $3', [
    'accepted',
    Math.floor(Date.now() / 1000),
    row.device_code,
  ])
  res.set('Content-Type', 'text/html').send('Готово! Возвращайся в лаунчер.')
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

  const user = await newUser(null)
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

app.get('/v2/launcher/game-profile', requireAuth, ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.userId])
  const user = rows[0]
  const uuid = uuidFromId(user.id)
  res.json({
    uuid,
    uuidDashed:
      uuid.slice(0, 8) + '-' + uuid.slice(8, 12) + '-' + uuid.slice(12, 16) + '-' + uuid.slice(16, 20) + '-' + uuid.slice(20, 32),
    name: user.nickname,
    model: 'default',
    skinUrl: null,
    capeUrl: null,
  })
}))

app.get('/v2/users/me', requireAuth, ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.userId])
  const user = rows[0]
  res.json({ nickname: user.nickname, avatarUrl: null })
}))

app.post('/v2/launcher/heartbeat', requireAuth, (req, res) => res.json({}))
app.post('/v2/launcher/telemetry', requireAuth, (req, res) => res.json({}))
app.get('/v2/core/wallet/me/display', requireAuth, (req, res) => res.json({ availableKopecks: 0 }))
app.get('/v2/rating/servers', requireAuth, (req, res) => res.json({ servers: [], topThree: [], total: 0 }))
app.get('/v2/launcher/rewards', requireAuth, (req, res) => res.json({ items: [] }))
app.get('/v2/launcher/wardrobe', requireAuth, (req, res) =>
  res.json({ items: [], active: { skinUrl: null, capeUrl: null, model: 'default' } }),
)

// ============ Заглушки: всё остальное не падает ============

const LIST_PATHS = ['/friends', '/hosting/servers', '/hosting/plans', '/hosting/catalog', '/core/list', '/core/blocks']

app.all('/v2/*', requireAuth, (req, res) => {
  if (LIST_PATHS.some((p) => req.path.startsWith(p))) return res.json([])
  res.json({})
})
