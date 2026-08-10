import pg from 'pg'
import { setDefaultResultOrder } from 'node:dns'
import { createHash, randomBytes } from 'node:crypto'

setDefaultResultOrder('ipv4first')

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/enemy'
const isLocal = /localhost|127\.0\.0\.1/.test(DATABASE_URL)

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  max: 1,
})
pool.on('error', () => {})

const RETRYABLE = /terminated unexpectedly|ECONNRESET|Connection terminated|Idle session timeout|50P01/

export const query = async (text, params) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await pool.query(text, params)
    } catch (err) {
      if (attempt < 3 && RETRYABLE.test(String(err && err.message))) {
        await new Promise((r) => setTimeout(r, 200 * attempt))
        continue
      }
      throw err
    }
  }
}

await query(`
  CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL PRIMARY KEY,
    email      TEXT UNIQUE,
    nickname   TEXT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()))
  );

  CREATE TABLE IF NOT EXISTS device_codes (
    device_code TEXT PRIMARY KEY,
    user_code   TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    created_at  BIGINT NOT NULL,
    expires_at  BIGINT NOT NULL,
    accepted_at BIGINT
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    user_id    BIGINT NOT NULL,
    token_hash TEXT NOT NULL,
    created_at BIGINT NOT NULL
  );
`)

export const sha256 = (s) => createHash('sha256').update(s).digest('hex')
export const randomToken = () => randomBytes(32).toString('hex')

export const uuidFromId = (id) =>
  createHash('md5').update('enemy:' + id).digest('hex')

export const newUser = async (nickname, email = null) => {
  const nick = nickname || 'Player' + Math.floor(1000 + Math.random() * 8999)
  const { rows } = await query(
    'INSERT INTO users (email, nickname) VALUES ($1, $2) RETURNING *',
    [email, nick],
  )
  return rows[0]
}

export const storeRefresh = async (userId) => {
  const token = randomToken()
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, created_at) VALUES ($1, $2, $3)',
    [userId, sha256(token), Math.floor(Date.now() / 1000)],
  )
  return token
}

export const rotateRefresh = async (oldToken) => {
  const { rows } = await query(
    'SELECT user_id FROM refresh_tokens WHERE token_hash = $1',
    [sha256(oldToken)],
  )
  if (!rows[0]) return null
  await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [sha256(oldToken)])
  const token = await storeRefresh(rows[0].user_id)
  return { userId: Number(rows[0].user_id), token }
}

export const dropRefresh = async (token) => {
  await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [sha256(token)])
}
