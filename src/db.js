import pg from 'pg'
import { setDefaultResultOrder } from 'node:dns'
import { createHash, randomBytes } from 'node:crypto'

setDefaultResultOrder('ipv4first')

const rawUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/enemy'
// Supabase session-mode pooler (port 5432) caps the number of live clients and
// leaves stale ones hanging, so we route through the transaction-mode pooler on
// port 6543 instead, which pools connections behind a proxy.
const DATABASE_URL = rawUrl.replace(/([a-z0-9-]+\.)?pooler\.supabase\.com:\d+/, '$1pooler.supabase.com:6543')
const isLocal = /localhost|127\.0\.0\.1/.test(DATABASE_URL)

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  max: 1,
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 30000,
  statement_timeout: 8000,
})
pool.on('error', () => {})

const RETRYABLE = /terminated unexpectedly|ECONNRESET|ECONNREFUSED|ETIMEDOUT|Connection terminated|Idle session timeout|50P01|connect /

let schemaPromise = null
const ensureSchema = () => {
  if (!schemaPromise) {
    schemaPromise = pool
      .query(
        `
      CREATE TABLE IF NOT EXISTS users (
        id         BIGSERIAL PRIMARY KEY,
        email      TEXT UNIQUE,
        nickname   TEXT NOT NULL,
        created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()))
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_username TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_avatar TEXT;

      CREATE TABLE IF NOT EXISTS device_codes (
        device_code TEXT PRIMARY KEY,
        user_code   TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'pending',
        created_at  BIGINT NOT NULL,
        expires_at  BIGINT NOT NULL,
        accepted_at BIGINT
      );
      ALTER TABLE device_codes ADD COLUMN IF NOT EXISTS user_id BIGINT;

      CREATE TABLE IF NOT EXISTS site_sessions (
        token_hash TEXT PRIMARY KEY,
        user_id    BIGINT NOT NULL,
        created_at BIGINT NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS users_discord_id_idx ON users (discord_id) WHERE discord_id IS NOT NULL;

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        user_id    BIGINT NOT NULL,
        token_hash TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS textures (
        id         BIGSERIAL PRIMARY KEY,
        user_id    BIGINT NOT NULL,
        kind       TEXT NOT NULL,
        name       TEXT NOT NULL,
        hash       TEXT NOT NULL,
        png        TEXT NOT NULL,
        slim       BOOLEAN NOT NULL DEFAULT false,
        active     BOOLEAN NOT NULL DEFAULT false,
        source     TEXT NOT NULL DEFAULT 'custom',
        created_at BIGINT NOT NULL
      );
      `,
      )
      .catch((err) => {
        console.error('db init:', err && err.message)
        schemaPromise = null
        throw err
      })
  }
  return schemaPromise
}

export const query = async (text, params) => {
  await ensureSchema()
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

export const saveTexture = async ({ userId, kind, name, hash, png, slim, active = false, source = 'custom' }) => {
  const { rows } = await query(
    `INSERT INTO textures (user_id, kind, name, hash, png, slim, active, source, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [userId, kind, name, hash, png, slim, active, source, Date.now()],
  )
  return rows[0]
}

export const listTextures = async (userId) => {
  const { rows } = await query(
    'SELECT * FROM textures WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  )
  return rows
}

export const getTexture = async (id) => {
  const { rows } = await query('SELECT * FROM textures WHERE id = $1', [id])
  return rows[0] || null
}

export const getTextureByHash = async (hash) => {
  const { rows } = await query('SELECT * FROM textures WHERE hash = $1 LIMIT 1', [hash])
  return rows[0] || null
}

export const setActiveTexture = async (userId, kind, id) => {
  await query('UPDATE textures SET active = false WHERE user_id = $1 AND kind = $2', [userId, kind])
  await query('UPDATE textures SET active = true WHERE id = $1 AND user_id = $2', [id, userId])
}

export const clearActiveTexture = async (userId, kind) => {
  await query('UPDATE textures SET active = false WHERE user_id = $1 AND kind = $2', [userId, kind])
}

export const deleteTexture = async (userId, id) => {
  await query('DELETE FROM textures WHERE id = $1 AND user_id = $2', [id, userId])
}

export const getActiveTextures = async (userId) => {
  const { rows } = await query(
    'SELECT * FROM textures WHERE user_id = $1 AND active = true',
    [userId],
  )
  return rows
}

export const getUserByNick = async (nickname) => {
  const { rows } = await query('SELECT * FROM users WHERE LOWER(nickname) = LOWER($1) LIMIT 1', [
    nickname,
  ])
  return rows[0] || null
}

// ============ Discord + сайт ============

/// Регистрация/вход через Discord: создаёт аккаунт при первом входе или
/// обновляет данные профиля Discord у уже существующего.
export const upsertByDiscord = async ({ discordId, username, avatar }) => {
  const { rows } = await query(
    `INSERT INTO users (discord_id, discord_username, discord_avatar, nickname, created_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (discord_id) DO UPDATE
       SET discord_username = EXCLUDED.discord_username,
           discord_avatar   = EXCLUDED.discord_avatar
     RETURNING *`,
    [discordId, username, avatar, 'Player' + Math.floor(1000 + Math.random() * 8999), Date.now()],
  )
  return rows[0]
}

export const storeSiteSession = async (userId) => {
  const token = randomToken()
  await query(
    'INSERT INTO site_sessions (token_hash, user_id, created_at) VALUES ($1, $2, $3)',
    [sha256(token), userId, Math.floor(Date.now() / 1000)],
  )
  return token
}

export const siteUserByToken = async (token) => {
  if (!token) return null
  const { rows } = await query(
    'SELECT u.* FROM site_sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1',
    [sha256(token)],
  )
  return rows[0] || null
}

export const dropSiteSession = async (token) => {
  if (!token) return
  await query('DELETE FROM site_sessions WHERE token_hash = $1', [sha256(token)])
}

/// Поиск device-кода по человекочитаемому коду, который лаунчер показывает
/// на экране (пользователь вводит его на сайте).
export const deviceByUserCode = async (code) => {
  const { rows } = await query(
    'SELECT * FROM device_codes WHERE UPPER(TRIM(user_code)) = UPPER(TRIM($1)) LIMIT 1',
    [code],
  )
  return rows[0] || null
}

/// Привязывает аккаунт с сайта к device-коду лаунчера: именно он и залогинится.
export const bindDeviceUser = async (deviceCode, userId) => {
  await query(
    'UPDATE device_codes SET user_id = $1, status = $2, accepted_at = $3 WHERE device_code = $4',
    [userId, 'accepted', Math.floor(Date.now() / 1000), deviceCode],
  )
}
