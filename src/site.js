// The Enemy website, served by the API host itself: the account the browser
// logs into (Discord) owns the nickname and is the one that signs into the
// launcher when its device code is entered here.

const FONT = `font-family:'Segoe UI',system-ui,-apple-system,sans-serif`
const BG = '#08090A'
const CARD = '#121418'
const LINE = 'rgba(255,255,255,.08)'
const TXT = '#EDEFEE'
const MUT = 'rgba(237,239,238,.62)'
const ACC = '#3EA6FF'
const DISCORD = '#5865F2'

const HEAD = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Enemy</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:${BG};color:${TXT};${FONT};min-height:100vh}
.wrap{max-width:540px;margin:0 auto;padding:48px 20px 80px}
.bar{display:flex;align-items:center;gap:12px;margin-bottom:28px}
.mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,${ACC},#7B5CFF);display:grid;place-items:center;color:#fff;font-weight:800;font-size:20px;box-shadow:0 0 22px rgba(62,166,255,.35)}
.name{font-size:22px;font-weight:800;letter-spacing:.02em}
.card{background:${CARD};border:1px solid ${LINE};border-radius:18px;padding:24px;margin-bottom:18px}
.card h2{margin:0 0 4px;font-size:17px}
.sub{margin:0 0 18px;color:${MUT};font-size:13px;line-height:1.55}
input{width:100%;background:rgba(0,0,0,.28);border:1px solid ${LINE};border-radius:10px;color:${TXT};padding:12px 14px;font-size:15px;outline:none;${FONT}}
input:focus{border-color:${ACC}}
button{width:100%;margin-top:12px;padding:12px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;${FONT};color:#fff;transition:filter .15s}
button:hover{filter:brightness(1.1)}
button:disabled{opacity:.6;cursor:default}
.primary{background:${ACC}}
.discord{background:${DISCORD}}
.ghost{background:transparent;border:1px solid ${LINE};color:${MUT}}
.msg{margin-top:12px;font-size:13px;line-height:1.5;color:${MUT};min-height:18px}
.msg.ok{color:#4BE38B}
.msg.err{color:#FF6B6B}
.acc{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.ava{width:56px;height:56px;border-radius:50%;object-fit:cover;background:${LINE};display:grid;place-items:center;font-weight:800;font-size:22px;color:${ACC}}
.acc .nm{font-size:16px;font-weight:700}
.acc .dn{color:${MUT};font-size:13px;margin-top:2px}
.step{display:flex;gap:12px;margin:10px 0;color:${MUT};font-size:13.5px;line-height:1.5}
.step b{color:${TXT}}
.stepnum{flex:none;width:26px;height:26px;border-radius:50%;background:rgba(62,166,255,.14);color:${ACC};display:grid;place-items:center;font-weight:800;font-size:13px}
.link{color:${ACC};text-decoration:none;font-size:13px}
.rowof{display:flex;gap:8px}
.rowof button{width:auto;margin-top:0;padding:10px 14px;font-size:13.5px}
.cap{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${MUT};margin:20px 0 8px}
.code{font-family:ui-monospace,Consolas,monospace;font-size:30px;letter-spacing:.14em;color:#fff;text-align:center;margin:18px 0;padding:14px;background:rgba(0,0,0,.35);border-radius:12px}
.foot{color:${MUT};font-size:12px;text-align:center;margin-top:30px;line-height:1.6}
</style>
</head>
<body>
<div class="wrap">`

const FOOT = `<div class="foot">Вход через Discord · аккаунт Enemy · код из лаунчера<br/>Настройки приватности, скины и друзья — в самом лаунчере.</div>
</div>
</body>
</html>`

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const sitePage = ({ user }) => {
  if (!user) {
    return HEAD + `
<div class="bar"><div class="mark">E</div><div class="name">Enemy</div></div>
<div class="card">
  <h2>Аккаунт Enemy</h2>
  <p class="sub">Один аккаунт на всём: этот сайт, лаунчер, запуск игры, друзья и скины. Вход занимает секунду и ничего не стоит.</p>
  <a href="/v2/auth/discord" style="text-decoration:none;display:block"><button class="discord">Войти через Discord</button></a>
  <p class="msg" style="margin-top:14px">После входа здесь же можно поменять ник, а код из лаунчера привяжет вход именно к этому аккаунту.</p>
</div>` + FOOT
  }
  const letter = esc((user.discordName || user.nickname || 'E').slice(0, 1).toUpperCase())
  const ava = user.avatarUrl
    ? `<img class="ava" src="${esc(user.avatarUrl)}" alt="" />`
    : `<div class="ava">${letter}</div>`
  return HEAD + `
<div class="bar"><div class="mark">E</div><div class="name">Enemy</div></div>
<div class="card">
  <h2>Профиль</h2>
  <div class="acc">${ava}
    <div>
      <div class="nm">${esc(user.nickname)}</div>
      <div class="dn">${esc(user.discordName || '')}</div>
    </div>
  </div>
  <input id="nick" value="${esc(user.nickname)}" maxlength="20" autocomplete="off" placeholder="Ник Enemy" />
  <button class="primary" id="nickBtn">Сохранить ник</button>
  <div class="msg" id="nickMsg"></div>
  <div class="rowof"><a class="link" href="/v2/auth/discord?redirect=/">Сменить аккаунт</a></div>
</div>
<div class="cap">Вход в лаунчер</div>
<div class="card">
  <h2>Впустить лаунчер</h2>
  <p class="sub">Лаунчер сам покажет код. Введи его здесь — и войдёт именно ${esc(user.nickname)}.</p>
  <div class="step"><span class="stepnum">1</span><span>В лаунчере открой <b>«Войти через Enemy»</b> — появится код вида <b>ABCD-EFGH</b>.</span></div>
  <div class="step"><span class="stepnum">2</span><span>Введи его ниже и нажми <b>Впустить</b>.</span></div>
  <div class="step"><span class="stepnum">3</span><span>Вернись в лаунчер — он зайдёт под этим аккаунтом автоматически.</span></div>
  <input id="lcode" autocomplete="off" placeholder="Код из лаунчера, например ABCD-EFGH" style="margin-top:14px" />
  <button class="primary" id="linkBtn">Впустить лаунчер</button>
  <div class="msg" id="linkMsg"></div>
</div>
<script>
(function () {
  var nickBtn = document.getElementById('nickBtn')
  var nickMsg = document.getElementById('nickMsg')
  var linkBtn = document.getElementById('linkBtn')
  var linkMsg = document.getElementById('linkMsg')
  function msg(el, text, ok) {
    el.textContent = text || ''
    el.className = 'msg' + (ok ? ' ok' : text ? ' err' : '')
  }
  nickBtn.onclick = function () {
    var nick = document.getElementById('nick').value.trim()
    if (!nick) return msg(nickMsg, 'Введи ник')
    nickBtn.disabled = true
    fetch('/v2/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ nickname: nick })
    }).then(function (r) {
      return r.json().catch(function () { return {} }).then(function (d) {
        if (!r.ok) return msg(nickMsg, d.message || 'Не удалось сохранить ник')
        msg(nickMsg, 'Ник сохранён: ' + d.nickname, true)
        document.querySelector('.nm').textContent = d.nickname
      })
    }).catch(function () { msg(nickMsg, 'Сеть недоступна — попробуй ещё раз') })
      .then(function () { nickBtn.disabled = false })
  }
  linkBtn.onclick = function () {
    var code = document.getElementById('lcode').value.trim()
    if (!code) return msg(linkMsg, 'Сначала введи код из лаунчера')
    linkBtn.disabled = true
    msg(linkMsg, 'Проверяем код…')
    fetch('/v2/site/launcher/link', {
      method: 'POST',
      body: JSON.stringify({ code: code })
    }).then(function (r) {
      return r.json().catch(function () { return {} }).then(function (d) {
        if (!r.ok) return msg(linkMsg, d.message || 'Код не подошёл')
        msg(linkMsg, 'Готово! Возвращайся в лаунчер — вход выполнен.', true)
      })
    }).catch(function () { msg(linkMsg, 'Сеть недоступна — попробуй ещё раз') })
      .then(function () { linkBtn.disabled = false })
  }
  document.getElementById('lcode').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') linkBtn.onclick()
  })
  document.getElementById('nick').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') nickBtn.onclick()
  })
})();
</script>` + FOOT
}

export const approvePage = ({ user, deviceCode, userCode }) => HEAD + `
<div class="bar"><div class="mark">E</div><div class="name">Enemy</div></div>
<div class="card">
  <h2>Вход в Enemy Launcher</h2>
  <p class="sub">Этот код впустит в лаунчер аккаунт, в который ты вошёл на сайте:</p>
  <div class="acc">${
    user.avatarUrl
      ? `<img class="ava" src="${esc(user.avatarUrl)}" alt="" />`
      : `<div class="ava">${esc((user.discordName || user.nickname || 'E').slice(0, 1).toUpperCase())}</div>`
  }
    <div>
      <div class="nm">${esc(user.nickname)}</div>
      <div class="dn">${esc(user.discordName || '')}</div>
    </div>
  </div>
  <div class="code">${esc(userCode)}</div>
  <form method="POST" action="/v2/auth/launcher/accept">
    <input type="hidden" name="deviceCode" value="${esc(deviceCode)}" />
    <button class="primary" type="submit">Войти в лаунчер</button>
  </form>
  <div class="rowof" style="margin-top:12px">
    <a class="link" href="/v2/auth/discord?redirect=%2Fv2%2Fauth%2Flauncher%2Fapprove%3Fdevice_code%3D${esc(encodeURIComponent(deviceCode))}">Сменить аккаунт</a>
    <a class="link" href="/">На сайт</a>
  </div>
</div>` + FOOT

export const errorPage = (title, text) => HEAD + `
<div class="bar"><div class="mark">E</div><div class="name">Enemy</div></div>
<div class="card">
  <h2>${esc(title)}</h2>
  <p class="sub">${esc(text)}</p>
  <a href="/" style="text-decoration:none;display:block"><button class="ghost">На сайт</button></a>
</div>` + FOOT