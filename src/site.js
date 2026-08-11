// Enemy — сайт в стиле Millida: вход через Discord, смена ника, код из лаунчера.
// Здесь же живёт админ-панель (/admin).

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const CSS = `
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#07090D;color:#EDEFEE;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
img{user-select:none}
nav{position:sticky;top:0;z-index:20;backdrop-filter:blur(14px);background:rgba(7,9,13,.72);border-bottom:1px solid rgba(255,255,255,.06)}
.nav{max-width:1080px;margin:0 auto;padding:14px 22px;display:flex;align-items:center;gap:18px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;letter-spacing:.01em}
.brand img{width:32px;height:32px;border-radius:8px}
.beta{font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:#F2B13A;color:#3B2400;padding:3px 5px;border-radius:4px;line-height:1}
.nlinks{display:flex;gap:16px;margin-left:auto;color:#9BA1B0;font-size:13.5px}
.nlinks a:hover{color:#EDEFEE}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;cursor:pointer;font-weight:700;font-size:14px;padding:11px 20px;border-radius:12px;color:#fff;background:#3EA6FF;transition:filter .15s,transform .1s;font-family:inherit}
.btn:hover{filter:brightness(1.1)}
.btn:disabled{opacity:.6;cursor:default}
.btn.ghost{background:transparent;border:1px solid rgba(255,255,255,.14);color:#EDEFEE}
.btn.discord{background:#5865F2}
.btn.sm{padding:8px 14px;font-size:13px}
.btn.danger{background:rgba(255,82,82,.14);color:#FF6B6B;border:1px solid rgba(255,82,82,.25)}
.hero{max-width:1080px;margin:0 auto;padding:84px 22px 40px;text-align:center;position:relative}
.hero::before{content:"";position:absolute;inset:-120px -10% auto;height:520px;background:radial-gradient(600px 300px at 50% 0%,rgba(62,166,255,.20),transparent 70%);pointer-events:none}
.overline{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;letter-spacing:.16em;color:#3EA6FF;border:1px solid rgba(62,166,255,.28);border-radius:99px;padding:6px 14px;background:rgba(62,166,255,.08)}
.hero h1{font-size:clamp(34px,6vw,60px);line-height:1.05;margin:22px 0 14px;font-weight:800;letter-spacing:-.02em}
.hero p{color:#9BA1B0;font-size:17px;line-height:1.6;max-width:620px;margin:0 auto}
.cta{display:flex;gap:12px;justify-content:center;margin-top:30px;flex-wrap:wrap}
.plats{margin-top:26px;display:flex;gap:12px;justify-content:center;color:#6E7482;font-size:13px;flex-wrap:wrap}
.wrap{max-width:1080px;margin:0 auto;padding:0 22px 90px}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:18px;margin-top:44px}
.panel{background:#0E1118;border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:26px}
.panel h2{margin:0 0 6px;font-size:17.5px;font-weight:800}
.panel .sub{margin:0 0 18px;color:#9BA1B0;font-size:13.5px;line-height:1.55}
.acc{display:flex;align-items:center;gap:14px;margin-bottom:18px}
.ava{width:56px;height:56px;border-radius:14px;object-fit:cover;background:rgba(255,255,255,.07);display:grid;place-items:center;font-weight:800;font-size:22px;color:#3EA6FF}
.acc .nm{font-size:16px;font-weight:700}
.acc .dn{color:#9BA1B0;font-size:13px;margin-top:2px}
input{width:100%;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);border-radius:11px;color:#EDEFEE;padding:12px 14px;font-size:14.5px;outline:none;font-family:inherit}
input:focus{border-color:#3EA6FF}
.msg{margin-top:12px;font-size:13px;line-height:1.5;color:#9BA1B0;min-height:18px}
.msg.ok{color:#4BE38B}.msg.err{color:#FF6B6B}
.subtle{color:#9BA1B0;font-size:13.5px}
.subtle:hover{color:#EDEFEE}
.step{display:flex;gap:12px;margin:10px 0;color:#9BA1B0;font-size:13.5px;line-height:1.5}
.step b{color:#EDEFEE}
.stepnum{flex:none;width:26px;height:26px;border-radius:50%;background:rgba(62,166,255,.14);color:#3EA6FF;display:grid;place-items:center;font-weight:800;font-size:13px}
.sechead{display:flex;align-items:center;gap:12px;margin:64px 0 8px}
.sechead h2{margin:0;font-size:20px;font-weight:800}
.sechead .bar{width:30px;height:3px;border-radius:99px;background:linear-gradient(90deg,#3EA6FF,#7B5CFF)}
.secd{color:#6E7482;font-size:14px;margin:6px 0 0;max-width:560px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:26px}
.feat{background:#0E1118;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:22px}
.feat .ic{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-size:21px;background:rgba(62,166,255,.12);margin-bottom:14px}
.feat b{font-size:15px;display:block;margin-bottom:6px}
.feat p{margin:0;color:#9BA1B0;font-size:13.5px;line-height:1.55}
.goods{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.tick{display:inline-flex;align-items:center;gap:7px;color:#9BA1B0;font-size:13.5px;background:#0E1118;border:1px solid rgba(255,255,255,.07);padding:8px 12px;border-radius:99px}
.tick::before{content:"✓";color:#4BE38B;font-weight:800}
footer{border-top:1px solid rgba(255,255,255,.06);background:#07090D;padding:44px 22px 56px}
.foot{max-width:1080px;margin:0 auto;display:flex;flex-wrap:wrap;gap:34px;justify-content:space-between}
.foot .co{color:#9BA1B0;font-size:13px;line-height:1.7;max-width:300px}
.foot h4{margin:0 0 12px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6E7482}
.foot nav a{display:block;color:#9BA1B0;font-size:13.5px;margin-bottom:9px}
.foot nav a:hover{color:#EDEFEE}
.legal{margin-top:38px;color:#6E7482;font-size:12px;line-height:1.7;max-width:900px}
@media (max-width:760px){.nlinks{display:none}}
.fancy{color:transparent;background:linear-gradient(100deg,#EDEFEE 30%,#3EA6FF 62%,#7B5CFF 90%);-webkit-background-clip:text;background-clip:text}
`

const HEAD = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Enemy Launcher — бесплатный лаунчер Minecraft</title>
<link rel="icon" href="/logo.png" />
<style>${CSS}</style>
</head>
<body>`

const NAV = ({ logged }) => `
<nav><div class="nav">
  <a class="brand" href="/"><img src="/logo.png" alt="Enemy" />Enemy<span class="beta">beta</span></a>
  <div class="nlinks">
    <a href="/#account">Аккаунт</a>
    <a href="/#launcher">Лаунчер</a>
    <a href="/#features">Возможности</a>
    <a href="/admin">Админ</a>
  </div>
  ${
    logged
      ? `<a class="brand" href="/logout" title="Сменить аккаунт">${logged}<span class="beta" style="background:#3EA6FF;color:#08131F">выйти</span></a>`
      : '<a href="/v2/auth/discord"><button class="btn sm">Войти</button></a>'
  }
</div></nav>`

const FOOT = `
<footer>
  <div class="foot">
    <div>
      <a class="brand" href="/" style="margin-bottom:14px"><img src="/logo.png" alt="Enemy" />Enemy<span class="beta">beta</span></a>
      <p class="co">Бесплатный лаунчер Minecraft: любые версии, сборки, скины, друзья и свой сервер — в одном окне. Без рекламы.</p>
    </div>
    <div><h4>Навигация</h4><nav><a href="/">Главная</a><a href="/#account">Сменить ник</a><a href="/#launcher">Вход в лаунчер</a><a href="/admin">Админ-панель</a></nav></div>
    <div><h4>Экосистема</h4><nav><a href="/">Лаунчер</a><a href="/">Скины</a><a href="/">Хостинг</a><a href="/">Топ серверов</a></nav></div>
  </div>
  <div class="legal" style="margin:0 auto">Enemy — независимый проект. Мы не связаны с Mojang Studios, Microsoft Corporation или Minecraft. Minecraft — товарный знак Mojang Synergies AB. Лаунчер бесплатный: играть можно без лицензии, по обычному нику.</div>
</footer>`

const hero = (logged) => `
<div class="hero">
  <span class="overline">ENEMY LAUNCHER</span>
  <h1>Открой Minecraft <span class="fancy">по-новому</span></h1>
  <p>Любые версии и сборки, скины и плащи, друзья и чат, свой сервер на хостинге — в одном окне. Бесплатно и без рекламы.</p>
  <div class="cta">
    <a href="${logged ? '/#account' : '/v2/auth/discord'}"><button class="btn ${logged ? '' : 'discord'}">${logged ? 'Аккаунт и ник' : 'Войти через Discord'}</button></a>
    <a href="#launcher"><button class="btn ghost">Как войти в лаунчер</button></a>
  </div>
  <div class="plats">Windows · macOS · Linux · Без лицензии · Любая версия · Открытый код</div>
</div>`

export const sitePage = ({ user }) => {
  const logged = user ? esc(user.nickname) : ''
  const body = user ? authed(user) : authBox()
  return HEAD + NAV({ logged }) + hero(logged) + `
<div class="wrap">
  <div class="grid2" id="account">
    ${body.profile}
    ${body.launcher}
  </div>
  <div class="sechead" id="features"><span class="bar"></span><h2>Один аккаунт — весь лаунчер</h2></div>
  <p class="secd">Тот же аккаунт, что на сайте: лаунчер, игра, друзья, скины и серверы вместе.</p>
  <div class="cards">
    <div class="feat"><div class="ic">🎨</div><b>Скины и плащи</b><p>Загружай скин PNG и меряй в 3D до захода в игру. Плащи — отдельной вкладкой.</p></div>
    <div class="feat"><div class="ic">👥</div><b>Друзья и чат</b><p>Видно, кто в сети и на каком сервере. Переписка и приглашение прямо из лаунчера.</p></div>
    <div class="feat"><div class="ic">🖥️</div><b>Свой сервер</b><p>Запуск и остановка хостинга, файлы, бэкапы и консоль — не выходя из лаунчера.</p></div>
    <div class="feat"><div class="ic">🎵</div><b>Музыка и обои</b><p>Фоновая музыка, живые обои и тёмная тема. Окно — как ты хочешь.</p></div>
  </div>
  <div class="sechead"><span class="bar"></span><h2>Безопасно — это можно проверить</h2></div>
  <p class="secd">Лаунчер отдаёшь свои файлы игры. Поэтому ничего не скрываем.</p>
  <div class="goods" style="margin-bottom:8px">
    <span class="tick">Вход подтверждается на официальной странице Enemy</span>
    <span class="tick">Пароль от Microsoft не нужен</span>
    <span class="tick">Токены не покидают ядро лаунчера</span>
    <span class="tick">Без лицензии — играешь по нику</span>
  </div>
</div>` + FOOT + siteScriptTag()
}

const authBox = () => ({
  profile: `
<div class="panel">
  <h2>Аккаунт Enemy</h2>
  <p class="sub">Один аккаунт на всём: этот сайт, лаунчер, запуск игры, друзья и скины. Первый вход создаёт его автоматически.</p>
  <a href="/v2/auth/discord" style="display:block"><button class="btn discord" style="width:100%">Войти через Discord</button></a>
  <p class="msg">После входа здесь же поменяешь ник — а код из лаунчера пустит в него именно этот аккаунт.</p>
</div>`,
  launcher: `
<div class="panel" id="launcher">
  <h2>Впустить лаунчер</h2>
  <p class="sub">Лаунчер сам покажет код на экране входа. Введи его здесь — зайдёт аккаунт из этого браузера.</p>
  <div class="step"><span class="stepnum">1</span><span>В лаунчере открой <b>«Войти через Enemy»</b> — появится код вида <b>ABCD-EFGH</b>.</span></div>
  <div class="step"><span class="stepnum">2</span><span>Сначала войди через Discord выше, потом введи код сюда и нажми <b>Впустить</b>.</span></div>
  <div class="step"><span class="stepnum">3</span><span>Вернись в лаунчер — он зайдёт автоматически.</span></div>
  <input id="lcode" placeholder="Код из лаунчера" style="margin-top:16px" autocomplete="off" />
  <button class="btn" id="linkBtn" style="width:100%">Проверить код</button>
  <div class="msg" id="linkMsg">Сначала войди через Discord, чтобы код впустил твой аккаунт.</div>
</div>`,
})

const authed = (user) => {
  const letter = esc((user.discordName || user.nickname || 'E').slice(0, 1).toUpperCase())
  const ava = user.avatarUrl
    ? `<img class="ava" src="${esc(user.avatarUrl)}" alt="" />`
    : `<div class="ava">${letter}</div>`
  return {
    profile: `
<div class="panel">
  <h2>Профиль</h2>
  <div class="acc">${ava}
    <div>
      <div class="nm">${esc(user.nickname)}</div>
      <div class="dn">${esc(user.discordName || '')} · Discord</div>
    </div>
  </div>
  <input id="nick" value="${esc(user.nickname)}" maxlength="20" autocomplete="off" placeholder="Ник Enemy" />
  <button class="btn" id="nickBtn" style="width:100%;margin-top:12px">Сохранить ник</button>
  <div class="msg" id="nickMsg">Если ник совпадает с лицензионным аккаунтом Minecraft — на аватаре будет его голова.</div>
</div>`,
    launcher: `
<div class="panel" id="launcher">
  <h2>Впустить лаунчер</h2>
  <p class="sub">Лаунчер сам покажет код на экране входа. Он впустит именно тебя — ${esc(user.nickname)}.</p>
  <div class="step"><span class="stepnum">1</span><span>В лаунчере открой <b>«Войти через Enemy»</b> — появится код вида <b>ABCD-EFGH</b>.</span></div>
  <div class="step"><span class="stepnum">2</span><span>Введи его ниже и нажми <b>Впустить</b>.</span></div>
  <div class="step"><span class="stepnum">3</span><span>Вернись в лаунчер — он зайдёт автоматически.</span></div>
  <input id="lcode" placeholder="Код из лаунчера" style="margin-top:16px" autocomplete="off" />
  <button class="btn" id="linkBtn" style="width:100%">Впустить лаунчер</button>
  <div class="msg" id="linkMsg"></div>
</div>`,
  }
}

export const approvePage = ({ user, deviceCode, userCode }) => HEAD + NAV({ logged: esc(user.nickname) }) + `
<div class="wrap" style="max-width:520px">
  <div class="panel" style="margin-top:50px;text-align:center">
    <h2>Вход в Enemy Launcher</h2>
    <p class="sub">Код впустит в лаунчер аккаунт, в который ты вошёл на сайте:</p>
    <div class="acc" style="justify-content:center">${
      user.avatarUrl
        ? `<img class="ava" src="${esc(user.avatarUrl)}" alt="" />`
        : `<div class="ava">${esc((user.discordName || user.nickname || 'E').slice(0, 1).toUpperCase())}</div>`
    }
      <div style="text-align:left">
        <div class="nm">${esc(user.nickname)}</div>
        <div class="dn">${esc(user.discordName || '')}</div>
      </div>
    </div>
    <div style="font-family:ui-monospace,Consolas,monospace;font-size:30px;letter-spacing:.14em;padding:14px;background:rgba(0,0,0,.35);border-radius:12px;margin:0 0 18px">${esc(userCode)}</div>
    <form method="POST" action="/v2/auth/launcher/accept">
      <input type="hidden" name="deviceCode" value="${esc(deviceCode)}" />
      <button class="btn" type="submit" style="width:100%">Войти в лаунчер</button>
    </form>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:14px">
      <a href="/v2/auth/discord?redirect=%2Fv2%2Fauth%2Flauncher%2Fapprove%3Fdevice_code%3D${esc(encodeURIComponent(deviceCode))}" class="subtle">Сменить аккаунт</a>
      <span style="color:#2a2f3a">·</span>
      <a href="/">На сайт</a>
    </div>
  </div>
</div>` + FOOT

export const errorPage = (title, text) => HEAD + NAV({ logged: '' }) + `
<div class="wrap" style="max-width:520px">
  <div class="panel" style="margin-top:50px;text-align:center">
    <h2>${esc(title)}</h2>
    <p class="sub">${esc(text)}</p>
    <a href="/" style="display:block"><button class="btn ghost" style="width:100%">На сайт</button></a>
  </div>
</div>` + FOOT

// ============ Админ-панель ============

export const adminPage = ({ authed, passwordSet }) => {
  if (!authed) {
    return HEAD + NAV({ logged: '' }) + `
<div class="wrap" style="max-width:420px">
  <div class="panel" style="margin-top:60px;text-align:center">
    <div class="ava" style="margin:0 auto 16px">🔐</div>
    <h2>Админ-панель</h2>
    <p class="sub">${passwordSet ? 'Введи пароль администратора.' : 'Пароль администратора не задан (переменная ADMIN_PASSWORD) — вход с дефолтным паролем.'}</p>
    <form method="POST" action="/admin">
      <input type="password" name="password" placeholder="Пароль" autocomplete="current-password" />
      <button class="btn" type="submit" style="width:100%">Войти</button>
    </form>
    <p class="msg" id="te"></p>
  </div>
</div>
<script>
document.querySelector('input').addEventListener('keydown', function (e) { if (e.key === 'Enter') e.target.form.submit() })
</script>` + FOOT
  }
  return HEAD + NAV({ logged: '' }) + `
<div class="wrap">
  <div class="sechead"><span class="bar"></span><h2>Админ-панель</h2></div>
  <p class="secd">Пользователи Enemy: смена ника, удаление аккаунта.</p>
  <div class="panel" style="padding:0;overflow:hidden">
    <table style="width:100%;border-collapse:collapse;font-size:13.5px">
      <thead><tr style="text-align:left;color:#6E7482;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase">
        <th style="padding:14px 16px">#</th>
        <th style="padding:14px 8px">Ник</th>
        <th style="padding:14px 8px">Discord</th>
        <th style="padding:14px 8px">Создан</th>
        <th style="padding:14px 16px;text-align:right">Действия</th>
      </tr></thead>
      <tbody id="rows"></tbody>
    </table>
    <div id="st" style="padding:16px;color:#9BA1B0;font-size:13px"></div>
  </div>
  <a href="/admin/logout" style="color:#9BA1B0;font-size:13.5px;display:inline-block;margin-top:16px">Выйти из админки →</a>
</div>
<script>
(function () {
  var rows = document.getElementById('rows')
  var st = document.getElementById('st')
  function msg(t) { st.textContent = t }
  function human(sec) {
    if (!sec) return '—'
    var d = new Date(sec * 1000)
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }
  function render(users) {
    rows.innerHTML = ''
    if (!users.length) { rows.innerHTML = '<tr><td colspan="5" style="padding:18px;color:#6E7482">Пока никого нет.</td></tr>'; return }
    users.forEach(function (u) {
      var tr = document.createElement('tr')
      tr.style.borderTop = '1px solid rgba(255,255,255,.06)'
      tr.innerHTML = '<td style="padding:10px 16px;color:#6E7482;white-space:nowrap">' + u.id + '</td>' +
        '<td style="padding:10px 8px"><input data-uid="' + u.id + '" value="' + esc2(u.nickname) + '" maxlength="20" style="max-width:150px;padding:8px 10px;font-size:13px" /></td>' +
        '<td style="padding:10px 8px;color:#9BA1B0">' + esc2(u.discord_username || (u.discord_id ? '#' + u.discord_id : '—')) + '</td>' +
        '<td style="padding:10px 8px;color:#6E7482;white-space:nowrap">' + human(u.created_at) + '</td>' +
        '<td style="padding:10px 16px;text-align:right;white-space:nowrap">' +
          '<button class="btn sm" data-a="set" data-uid="' + u.id + '" style="margin-right:6px">Сохранить</button>' +
          '<button class="btn sm danger" data-a="del" data-uid="' + u.id + '">Удалить</button></td>'
      rows.appendChild(tr)
    })
  }
  function esc2(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
  fetch('/v2/admin/users').then(function (r) {
    if (r.status === 401) { msg('Сессия истекла — перезайди под паролем.'); location.href = '/admin'; return }
    return r.json().then(function (d) { render(d.users || []) })
  }).catch(function () { msg('Ошибка сети') })
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-a]')
    if (!b) return
    var uid = b.getAttribute('data-uid')
    var act = b.getAttribute('data-a')
    if (act === 'del' && !confirm('Удалить пользователя #' + uid + '?')) return
    var body = act === 'del' ? { id: uid } : { id: uid, nickname: rows.querySelector('input[data-uid="' + uid + '"]').value }
    b.disabled = true
    fetch('/v2/admin/' + (act === 'del' ? 'delete-user' : 'set-nick'), {
      method: 'POST',
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) { msg(d.message || 'Не получилось'); return }
        if (act === 'del') { var tr = b.closest('tr'); tr.parentNode.removeChild(tr); msg('Удалён #' + uid) }
        else msg('Ник #' + uid + ' сохранён')
      })
    }).catch(function () { msg('Ошибка сети') }).then(function () { b.disabled = false })
  })
})();
</script>` + FOOT
}

// ============ Скрипт главной страницы ============

export const SITE_SCRIPT = `(function () {
  var nickBtn = document.getElementById('nickBtn')
  var nickMsg = document.getElementById('nickMsg')
  var linkBtn = document.getElementById('linkBtn')
  var linkMsg = document.getElementById('linkMsg')
  function msg(el, text, ok) { if (!el) return; el.textContent = text || ''; el.className = 'msg' + (ok ? ' ok' : text ? ' err' : '') }
  if (nickBtn) document.getElementById('nick').addEventListener('keydown', function (e) { if (e.key === 'Enter') nickBtn.onclick() })
  if (nickBtn) nickBtn.onclick = function () {
    var nick = document.getElementById('nick').value.trim()
    if (!nick) return msg(nickMsg, 'Введи ник')
    nickBtn.disabled = true
    fetch('/v2/users/me', { method: 'PATCH', body: JSON.stringify({ nickname: nick }) })
      .then(function (r) { return r.json().catch(function () { return {} }).then(function (d) {
        if (!r.ok) return msg(nickMsg, d.message || 'Не удалось сохранить ник')
        msg(nickMsg, 'Ник сохранён: ' + d.nickname, true)
        var nm = document.querySelector('.nm')
        if (nm) nm.textContent = d.nickname
        var ava = document.querySelector('.ava')
        if (ava && d.avatarUrl) ava.src = d.avatarUrl
      }) })
      .catch(function () { msg(nickMsg, 'Сеть недоступна — попробуй ещё раз') })
      .then(function () { nickBtn.disabled = false })
  }
  if (linkBtn) document.getElementById('lcode').addEventListener('keydown', function (e) { if (e.key === 'Enter') linkBtn.onclick() })
  if (linkBtn) linkBtn.onclick = function () {
    var code = document.getElementById('lcode').value.trim()
    if (!code) return msg(linkMsg, 'Сначала введи код из лаунчера')
    if (!nickBtn && !code) return
    linkBtn.disabled = true
    msg(linkMsg, 'Проверяем код…')
    fetch('/v2/site/launcher/link', { method: 'POST', body: JSON.stringify({ code: code }) })
      .then(function (r) { return r.json().catch(function () { return {} }).then(function (d) {
        if (!r.ok) return msg(linkMsg, d.message || 'Код не подошёл')
        msg(linkMsg, 'Готово! Возвращайся в лаунчер — вход выполнен.', true)
      }) })
      .catch(function () { msg(linkMsg, 'Сеть недоступна — попробуй ещё раз') })
      .then(function () { linkBtn.disabled = false })
  }
})();`

export function siteScriptTag() {
  return `<script>${SITE_SCRIPT}</script>`
}