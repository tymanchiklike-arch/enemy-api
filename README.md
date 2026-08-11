# Enemy API — серверная часть лаунчера

Каркас бэкенда для аккаунтов Enemy. Реализовано «ядро»: вход по device-code
(с веб-подтверждением), обновление сессии с ротацией refresh-токена, сессия для
запуска игры и профиль. Всё остальное отвечает заглушками, чтобы лаунчер не падал.

## Стек

- **Express** (Node.js) — API
- **PostgreSQL** (драйвер `pg`) — база. В проде — Supabase (бесплатно), локально — любой Postgres
- **Хостинг** — Vercel (бесплатно, serverless) + GitHub (код)
- Все сервисы работают из России без VPN

## Запуск локально

Нужен работающий Postgres. Самый простой способ — поднять его в Docker:

```sh
docker run -d --name enemy-pg \
  -e POSTGRES_PASSWORD=enemy -e POSTGRES_DB=enemy \
  -p 5432:5432 postgres:16
```

Затем:

```sh
cd server
npm install
DATABASE_URL=postgres://postgres:enemy@localhost:5432/enemy npm start
# или npm run dev (авто-перезапуск)
```

По умолчанию поднимается на `http://localhost:8787`.

Переменные окружения:
- `DATABASE_URL` — строка подключения к Postgres (обязательна)
- `PORT` — порт (по умолчанию `8787`)
- `PUBLIC_BASE` — внешний адрес, который уйдёт в `verifyUrl` (по умолчанию `http://localhost:8787`)
- `JWT_SECRET` — секрет access-токенов
- `ACCESS_TTL_S` — время жизни access-токена в секундах (по умолчанию 900)

## Как переключить лаунчер на этот сервер

Клиент уже умеет это без правки кода — задать адрес через окружение:

```sh
ENEMY_API=http://localhost:8787/v2 ./enemy-launcher.exe
```

Либо захардкодить: заменить константу `ENEMY_API` в
`src-tauri/src/engine/accounts/enemy.rs:4` на нужный адрес и пересобрать
(`bun run build:fast`).

## Как проверить вход целиком

1. Запусти сервер (локально или на Vercel).
2. В лаунчере: аккаунт → «Аккаунт Enemy» → «Войти через Enemy».
3. Откроется страница `…/v2/auth/launcher/approve` с кодом — жми «Подтвердить».
4. Лаунчер подхватит вход и запустится.

## Развёртывание бесплатно: GitHub → Vercel + Supabase

Нужны три бесплатных аккаунта: **GitHub** (код), **Supabase** (база),
**Vercel** (хостинг). Всё работает из России.

### Шаг 1. Код в GitHub

1. Зарегистрируйся на [github.com](https://github.com) и создай новый пустой
   репозиторий: зелёная кнопка **«New»** → имя `enemy-api` → **«Create repository»**.
2. Залить код (папка `server/`). На локальной машине:

   ```sh
   cd server
   git init
   git add .
   git commit -m "Enemy API"
   git branch -M main
   git remote add origin https://github.com/ТВОЙ_ЛОГИН/enemy-api.git
   git push -u origin main
   ```

   (после этого каждый следующий раз — просто `git add . && git commit -m "..." && git push`)

### Шаг 2. База — Supabase (бесплатно)

1. Зарегистрируйся на [supabase.com](https://supabase.com) (можно через GitHub).
2. **New project** → имя `enemy`, пароль от БД пусть придумает сам,
   регион `Frankfurt` (или `Singapore` — что ближе). Создание займёт пару минут.
3. В проекте нажми **Connect** → выбери вкладку подключения. Нужна ссылка
   **Session pooler** (Session pooler — в строке будет `pooler.supabase.com`
   и порт `5432`). Скопируй её **URI** (начинается с `postgresql://`).
   Именно пулер, а не «Direct connection» — у direct-адреса Supabase нет
   IPv4-адреса, и из России/через провайдеров он может не открыться.
4. (Важно) Пароль внутри ссылки будет со спецсимволами — так и должно быть,
   ничего менять не надо.

### Шаг 3. Хостинг — Vercel

1. Зарегистрируйся на [vercel.com](https://vercel.com) — **вход через GitHub** (быстрее).
2. **Add New… → Project** → выбери репозиторий `enemy-api` → **Import**.
3. Перед деплоем раскрой **Environment Variables** и добавь:
   - `DATABASE_URL` = ссылка из шага 2
   - `JWT_SECRET` = длинная случайная строка
   - `PUBLIC_BASE` = `https://enemy-api.vercel.app` (адрес будет виден после деплоя)
4. Нажми **Deploy**. Через ~минуту проверь в браузере:

   ```
   https://enemy-api.vercel.app/v2/health
   ```

   Должно быть `{"ok":true}`.
5. Дальше **каждый `git push` автоматически обновляет сервер** — ничего вручную запускать не надо.

### Шаг 4. Подключи лаунчер

```sh
ENEMY_API=https://enemy-api.vercel.app/v2 ./enemy-launcher.exe
```

или захардкодь адрес в `src-tauri/src/engine/accounts/enemy.rs` и пересобери
(`bun run build:fast`).

## Альтернатива: полностью свой сервер (Docker)

Если не хочешь Vercel — проект умеет работать и как обычный сервис:

```sh
cd server
docker compose up -d --build
```

Поднимет Postgres + API на `localhost:8787`. Перед запуском поправь
`JWT_SECRET` и `PUBLIC_BASE` в `docker-compose.yml`.

## Что уже работает

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/v2/auth/launcher/init` | начать вход: `{deviceCode, userCode, verifyUrl, expiresInSec, intervalSec}` |
| GET | `/v2/auth/launcher/approve` | страница подтверждения кода |
| POST | `/v2/auth/launcher/accept` | подтвердить код |
| POST | `/v2/auth/launcher/poll` | опрос: `pending` → `ok`/`denied`/`expired` |
| POST | `/v2/auth/refresh` | `{refreshToken}` → `{accessToken}` + ротация в cookie `rt2` |
| POST | `/v2/launcher/game-session` | сессия запуска: `{accessToken, uuid, name}` |
| GET | `/v2/launcher/game-profile` | ник/uuid/скин для игры |
| GET | `/v2/users/me` | профиль в оболочке |
| GET | `/v2/core/wallet/me/display` | баланс (заглушка 0) |

## Заглушки

Любой незнакомый путь под `/v2/*` отвечает `{}` (или `[]` для списков вроде
`/friends`, `/hosting/servers`) с кодом 200 — друзья, хостинг, гардероб и прочее
пока не реализованы, но не роняют лаунчер. Список маппится по мере разработки.

## Дальше

- Друзья: `/friends`, `/friends/requests`, чат, presence.
- Скины: свой yggdrasil-сервер на `{base}/v2/yggdrasil` (authlib-injector) или
  проксирование `game-profile`.
- Настоящая регистрация: завести сайт вместо страницы подтверждения и хранить
  почту/пароль вместо автогенерируемых пользователей.
