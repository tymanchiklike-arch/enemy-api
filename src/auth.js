import jwt from 'jsonwebtoken'
import { query } from './db.js'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const ACCESS_TTL_S = Number(process.env.ACCESS_TTL_S || 900)

export const signAccess = (userId) => jwt.sign({ sub: String(userId) }, SECRET, { expiresIn: ACCESS_TTL_S })

export const verifyAccess = (token) => {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

// The site (browser session in a cookie) is the same account universe as the
// launcher (bearer token), so `requireAuth` also accepts a valid site session.
// app.js wires `setSessionReader`; until then bearer-only behaviour is intact.
export let sessionReader = null
export const setSessionReader = (fn) => {
  sessionReader = fn
}

export const requireAuth = async (req, res, next) => {
  let fromSession = null
  if (sessionReader) {
    try {
      fromSession = await sessionReader(req)
    } catch (err) {
      console.error('site session:', err && err.message)
    }
  }
  if (fromSession) {
    req.userId = Number(fromSession)
  } else {
    const h = req.headers.authorization || ''
    const token = h.startsWith('Bearer ') ? h.slice(7) : ''
    const payload = verifyAccess(token)
    if (!payload) {
      res.status(401).json({ message: 'unauthorized' })
      return
    }
    req.userId = Number(payload.sub)
  }
  // Замороженный аккаунт не получает ничего: лаунчер вылетает по 403 banned,
  // сайт-запросы от него тоже молчат.
  try {
    const { rows } = await query('SELECT banned FROM users WHERE id = $1', [req.userId])
    if (rows[0] && rows[0].banned) {
      res.status(403).json({ message: 'Аккаунт заморожен', banned: true })
      return
    }
  } catch {}
  next()
}
