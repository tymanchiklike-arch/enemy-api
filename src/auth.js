import jwt from 'jsonwebtoken'

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

export const requireAuth = (req, res, next) => {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  const payload = verifyAccess(token)
  if (!payload) {
    res.status(401).json({ message: 'unauthorized' })
    return
  }
  req.userId = Number(payload.sub)
  next()
}
