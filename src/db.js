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
      ALTER TABLE users ADD COLUMN IF NOT EXISTS roles TEXT NOT NULL DEFAULT '[]';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS banner TEXT NOT NULL DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_avatar TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS about TEXT NOT NULL DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS nova_until BIGINT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS nova_avatar TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS nova_banner TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS nick_font TEXT NOT NULL DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS nick_color TEXT NOT NULL DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT NOT NULL DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_at BIGINT;

      CREATE TABLE IF NOT EXISTS ip_bans (
        ip         TEXT PRIMARY KEY,
        reason     TEXT,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admins (
        discord_id TEXT PRIMARY KEY,
        created_at BIGINT NOT NULL
      );

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
      CREATE UNIQUE INDEX IF NOT EXISTS users_discord_id_key ON users (discord_id);
      DROP INDEX IF EXISTS users_discord_id_idx;
      CREATE UNIQUE INDEX IF NOT EXISTS users_nick_lower_key ON users (LOWER(nickname));

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

      CREATE TABLE IF NOT EXISTS friend_requests (
        id         BIGSERIAL PRIMARY KEY,
        from_id    BIGINT NOT NULL,
        to_id      BIGINT NOT NULL,
        status     TEXT NOT NULL DEFAULT 'pending',
        created_at BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS friend_requests_to_idx ON friend_requests (to_id, status);

      CREATE TABLE IF NOT EXISTS friendships (
        user_a     BIGINT NOT NULL,
        user_b     BIGINT NOT NULL,
        created_at BIGINT NOT NULL,
        PRIMARY KEY (user_a, user_b)
      );

      CREATE TABLE IF NOT EXISTS blocks (
        blocker_id BIGINT NOT NULL,
        blocked_id BIGINT NOT NULL,
        created_at BIGINT NOT NULL,
        PRIMARY KEY (blocker_id, blocked_id)
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id         BIGSERIAL PRIMARY KEY,
        from_id    BIGINT NOT NULL,
        to_id      BIGINT NOT NULL,
        text       TEXT NOT NULL DEFAULT '',
        attachment TEXT,
        created_at BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS chat_messages_pair_idx ON chat_messages (from_id, to_id, created_at);

      CREATE TABLE IF NOT EXISTS chat_reads (
        user_id BIGINT NOT NULL,
        peer_id BIGINT NOT NULL,
        read_at  BIGINT NOT NULL,
        PRIMARY KEY (user_id, peer_id)
      );

      CREATE TABLE IF NOT EXISTS presence (
        user_id   BIGINT PRIMARY KEY,
        status    TEXT NOT NULL DEFAULT 'lobby',
        server    TEXT,
        server_ip TEXT,
        build     TEXT,
        seen_at   BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_typing (
        user_id  BIGINT NOT NULL,
        peer_id  BIGINT NOT NULL,
        typed_at BIGINT NOT NULL,
        PRIMARY KEY (user_id, peer_id)
      );

      CREATE TABLE IF NOT EXISTS play_stats (
        user_id         BIGINT PRIMARY KEY,
        total_seconds   BIGINT NOT NULL DEFAULT 0,
        sessions        BIGINT NOT NULL DEFAULT 0,
        last_build      TEXT,
        last_server     TEXT,
        last_server_name TEXT,
        last_played_at  BIGINT,
        builds          TEXT NOT NULL DEFAULT '[]',
        servers         TEXT NOT NULL DEFAULT '[]',
        hidden          BOOLEAN NOT NULL DEFAULT false
      );

      -- Владелец (Endertyma) носит бейдж владельца. Выдаём один раз (пока ролей
      -- нет) — дальше админка управляет вручную: у игрока может быть один бейдж.
      UPDATE users SET roles = '["owner"]'
      WHERE LOWER(nickname) = 'endertyma' AND roles = '[]';
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

// The nickname uniqueness constraint (lowercase index) can collide even for
// auto-generated names, so inserts retry with a fresh name a few times.
const isUniqueViolation = (err) => err && (err.code === '23505' || /duplicate key/.test(String(err && err.message)))

export const uuidFromId = (id) =>
  createHash('md5').update('enemy:' + id).digest('hex')

// ============ Роли (бейджи) ============

export const ALL_ROLES = ['owner', 'admin', 'moder', 'tester']

/// Роли хранятся как JSON-массив в users.roles; отдаём только канонический
/// набор, мусор отбрасываем.
export const rolesOf = (user) => {
  if (!user || !user.roles) return []
  try {
    const arr = JSON.parse(user.roles)
    return Array.isArray(arr) ? [...new Set(arr.filter((r) => ALL_ROLES.includes(String(r))))] : []
  } catch {
    return []
  }
}

export const setUserRoles = async (userId, roles) => {
  const clean = [...new Set((roles || []).map(String).filter((r) => ALL_ROLES.includes(r)))]
  // Правило лаунчера: у игрока один бейдж. Берём последний выбранный.
  const single = clean.length ? [clean[clean.length - 1]] : []
  await query('UPDATE users SET roles = $1 WHERE id = $2', [JSON.stringify(single), userId])
  return single
}

export const novaOf = (user) => (user && user.nova_until ? Number(user.nova_until) : 0)

export const setNova = async (userId, untilMs) => {
  await query('UPDATE users SET nova_until = $1 WHERE id = $2', [untilMs ? Number(untilMs) : null, userId])
}

export const newUser = async (nickname, email = null) => {
  for (let attempt = 0; ; attempt++) {
    const nick = nickname || 'Player' + Math.floor(1000 + Math.random() * 8999)
    try {
      const { rows } = await query(
        'INSERT INTO users (email, nickname) VALUES ($1, $2) RETURNING *',
        [email, nick],
      )
      return rows[0]
    } catch (err) {
      if (!nickname || attempt >= 4 || !isUniqueViolation(err)) throw err
    }
  }
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

// ============ Чат и присутствие ============

export const saveMessage = async ({ fromId, toId, text, attachment }) => {
  const { rows } = await query(
    'INSERT INTO chat_messages (from_id, to_id, text, attachment, created_at) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [fromId, toId, text || '', attachment ? JSON.stringify(attachment) : null, Date.now()],
  )
  return rows[0]
}

export const chatPage = async (a, b, before) => {
  const { rows } = await query(
    `SELECT * FROM chat_messages
     WHERE ((from_id = $1 AND to_id = $2) OR (from_id = $2 AND to_id = $1))
       AND ($3::bigint IS NULL OR created_at < $3)
     ORDER BY created_at DESC LIMIT 50`,
    [a, b, before || null],
  )
  return rows.reverse()
}

export const newIncomingMessages = async (userId, friendIds, since) => {
  if (!friendIds.length) return []
  const { rows } = await query(
    `SELECT * FROM chat_messages
     WHERE to_id = $1 AND from_id = ANY($2) AND created_at > $3
     ORDER BY created_at ASC LIMIT 100`,
    [userId, friendIds, since],
  )
  return rows
}

export const unreadCount = async (userId, peerId) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS n FROM chat_messages
     WHERE from_id = $1 AND to_id = $2 AND created_at > COALESCE(
       (SELECT read_at FROM chat_reads WHERE user_id = $2 AND peer_id = $1), 0)`,
    [peerId, userId],
  )
  return rows[0] ? rows[0].n : 0
}

export const markRead = async (userId, peerId) => {
  await query(
    `INSERT INTO chat_reads (user_id, peer_id, read_at) VALUES ($1,$2,$3)
     ON CONFLICT (user_id, peer_id) DO UPDATE SET read_at = EXCLUDED.read_at`,
    [userId, peerId, Date.now()],
  )
}

export const peerReadAt = async (peerId, userId) => {
  const { rows } = await query(
    'SELECT read_at FROM chat_reads WHERE user_id = $1 AND peer_id = $2',
    [peerId, userId],
  )
  return rows[0] ? rows[0].read_at : 0
}

export const setTyping = async (userId, peerId) => {
  await query(
    `INSERT INTO chat_typing (user_id, peer_id, typed_at) VALUES ($1,$2,$3)
     ON CONFLICT (user_id, peer_id) DO UPDATE SET typed_at = EXCLUDED.typed_at`,
    [userId, peerId, Date.now()],
  )
}

export const typingPeers = async (userId, friendIds) => {
  if (!friendIds.length) return []
  const { rows } = await query(
    `SELECT user_id FROM chat_typing
     WHERE peer_id = $1 AND user_id = ANY($2) AND typed_at > $3`,
    [userId, friendIds, Date.now() - 6000],
  )
  return rows.map((r) => String(r.user_id))
}

export const touchPresence = async (userId, data = {}) => {
  await query(
    `INSERT INTO presence (user_id, status, server, server_ip, build, seen_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id) DO UPDATE SET
       status = EXCLUDED.status,
       server = EXCLUDED.server,
       server_ip = EXCLUDED.server_ip,
       build = EXCLUDED.build,
       seen_at = EXCLUDED.seen_at`,
    [
      userId,
      data.status || 'lobby',
      data.server || null,
      data.serverIp || null,
      data.build || null,
      Date.now(),
    ],
  )
}

export const presenceOf = async (userId) => {
  const { rows } = await query('SELECT * FROM presence WHERE user_id = $1', [userId])
  return rows[0] || null
}

/// Полл идёт каждые ~5 секунд: он только продлевает сессию, не трогая статус.
/// Иначе регулярный опрос затирал бы «playing» своим lobby.
export const bumpPresence = async (userId) => {
  await query(
    `INSERT INTO presence (user_id, status, seen_at) VALUES ($1, 'lobby', $2)
     ON CONFLICT (user_id) DO UPDATE SET seen_at = EXCLUDED.seen_at`,
    [userId, Date.now()],
  )
}

export const savePlayStats = async (userId, stats) => {
  await query(
    `INSERT INTO play_stats
       (user_id, total_seconds, sessions, last_build, last_server, last_server_name, last_played_at, builds, servers)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (user_id) DO UPDATE SET
       total_seconds = EXCLUDED.total_seconds,
       sessions = EXCLUDED.sessions,
       last_build = EXCLUDED.last_build,
       last_server = EXCLUDED.last_server,
       last_server_name = EXCLUDED.last_server_name,
       last_played_at = EXCLUDED.last_played_at,
       builds = EXCLUDED.builds,
       servers = EXCLUDED.servers,
       hidden = false`,
    [
      userId,
      stats.totalSeconds || 0,
      stats.sessions || 0,
      stats.lastBuild || null,
      stats.lastServer || null,
      stats.lastServerName || null,
      stats.lastPlayedAt || null,
      JSON.stringify((stats.builds || []).slice(0, 10)),
      JSON.stringify((stats.servers || []).slice(0, 10)),
    ],
  )
}

export const hidePlayStats = async (userId) => {
  await query('UPDATE play_stats SET hidden = true WHERE user_id = $1', [userId])
}

export const playStatsOf = async (userId) => {
  const { rows } = await query('SELECT * FROM play_stats WHERE user_id = $1', [userId])
  const r = rows[0]
  if (!r || r.hidden) return null
  return {
    totalSeconds: Number(r.total_seconds),
    sessions: Number(r.sessions),
    lastBuild: r.last_build,
    lastServer: r.last_server,
    lastServerName: r.last_server_name,
    lastPlayedAt: r.last_played_at ? Number(r.last_played_at) : null,
    builds: JSON.parse(r.builds || '[]'),
    servers: JSON.parse(r.servers || '[]'),
  }
}

// ============ Discord + сайт ============

/// Регистрация/вход через Discord: создаёт аккаунт при первом входе или
/// обновляет данные профиля Discord у уже существующего.
export const upsertByDiscord = async ({ discordId, username, avatar }) => {
  for (let attempt = 0; ; attempt++) {
    try {
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
    } catch (err) {
      if (attempt >= 4 || !isUniqueViolation(err)) throw err
    }
  }
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

/// Только привязывает личность к коду, не подтверждая вход: финальное решение
/// принимает админ в панели (approve/deny).
export const claimDeviceUser = async (deviceCode, userId) => {
  await query(
    'UPDATE device_codes SET user_id = $1 WHERE device_code = $2 AND status = $3',
    [userId, deviceCode, 'pending'],
  )
}
