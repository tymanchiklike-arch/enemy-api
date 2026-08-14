// Enemy — сайт с фирменным дизайном: уникальный шрифт, свои SVG-иконки,
// анимации появления, аккуратные отступы. Здесь же админ-панель (/admin),
// но ссылок на неё на публичных страницах нет.

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// ============ Свои иконки (inline SVG, никаких эмодзи) ============

const ICONS = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="ic-enemy" viewBox="0 0 24 24"><path d="M14.2 7.2H9.6v3.1h3.1v2.6H9.6v3.1h4.6V7.2ZM5.8 4.4h12.4v2.8H5.8V4.4Zm0 12.4h12.4v2.8H5.8v-2.8Zm0 0" fill="currentColor"/></symbol>
  <symbol id="ic-discord" viewBox="0 0 24 24"><path d="M19.3 5.3A16 16 0 0 0 15.2 4l-.3.6c1.6.4 2.8 1 3.7 1.6a11.6 11.6 0 0 0-9.2 0c.9-.6 2.1-1.2 3.7-1.6L12.8 4c-1.4.1-2.8.5-4.1 1.3C6.3 8.7 5.6 12 5.9 15.3a16 16 0 0 0 4.8 2.4l.7-1.1c-.7-.2-1.4-.6-2-1l.3-.2c2.6 1.2 5.4 1.2 8 0l.3.2c-.6.4-1.3.8-2 1l.7 1.1a16 16 0 0 0 4.8-2.4c.3-3.8-.8-7-3.2-10Zm-8.1 8.1c-.9 0-1.7-.8-1.7-1.8s.7-1.8 1.7-1.8 1.7.8 1.7 1.8-.8 1.8-1.7 1.8Zm5.6 0c-.9 0-1.7-.8-1.7-1.8s.7-1.8 1.7-1.8 1.7.8 1.7 1.8-.8 1.8-1.7 1.8Z" fill="currentColor"/></symbol>
  <symbol id="ic-key" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0-5.2 9L3 15.8V21h5v-3h3v-3h2.2A6 6 0 0 0 12 3Zm3 3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" fill="currentColor"/></symbol>
  <symbol id="ic-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20a8 8 0 0 1 16 0" fill="currentColor"/></symbol>
  <symbol id="ic-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" fill="currentColor"/><path d="M3 19a6 6 0 0 1 12 0" fill="currentColor"/><circle cx="17" cy="9" r="2.5" fill="currentColor"/><path d="M16 14a5 5 0 0 1 5 5" fill="currentColor"/></symbol>
  <symbol id="ic-server" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="7" rx="2" fill="currentColor"/><rect x="3" y="13" width="18" height="7" rx="2" fill="currentColor"/><circle cx="7" cy="7.5" r="1" fill="#0A0E14"/><circle cx="7" cy="16.5" r="1" fill="#0A0E14"/><circle cx="11" cy="7.5" r="1" fill="#0A0E14"/><circle cx="11" cy="16.5" r="1" fill="#0A0E14"/></symbol>
  <symbol id="ic-music" viewBox="0 0 24 24"><path d="M9 18V6l11-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="17" cy="16" r="3" fill="currentColor"/></symbol>
  <symbol id="ic-image" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="2" fill="currentColor"/><path d="m4 18 5-5 3 3 4-4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
  <symbol id="ic-shield" viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="ic-check" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="ic-code" viewBox="0 0 24 24"><path d="m8 6-6 6 6 6M16 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="ic-palette" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.8 2-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.1 0-1 .8-1.7 1.9-1.7H16a5 5 0 0 0 5-5c0-4-4-7.3-9-7.3Z" fill="currentColor"/><circle cx="7.5" cy="10.5" r="1.2" fill="#0A0E14"/><circle cx="12" cy="7.8" r="1.2" fill="#0A0E14"/><circle cx="16.2" cy="10.5" r="1.2" fill="#0A0E14"/></symbol>
  <symbol id="ic-lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="ic-arrow" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</svg>`

const ICON = (name, cls = 'ic') => `<svg class="${cls}"><use href="#${name}"/></svg>`

// ============ Шрифты: уникальная пара (Unbounded + Manrope) ============

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
[id]{scroll-margin-top:96px}
body{
  --bg:#0A0E14; --bg2:#0D1320; --panel:#111927; --line:rgba(148,163,200,.12);
  --txt:#E8EDF6; --mut:#8CA0BF; --faint:#5C6E8C; --acc:#3EA6FF; --acc2:#66BDFF;
  background:var(--bg); color:var(--txt);
  font-family:'Manrope',system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased; line-height:1.55; overflow-x:hidden;
}
a{color:inherit;text-decoration:none}
img,svg{display:block}
::selection{background:rgba(62,166,255,.3)}
/* Без текстового курсора: страница выглядит как интерфейс, а не документ.
   В полях ввода каретка остаётся (иначе невозможно печатать). */
body{cursor:default;user-select:none;-webkit-user-select:none}
input,textarea{user-select:text;-webkit-user-select:text;cursor:text}
a,button,[role="button"],label{cursor:pointer}
/* ===== Фон: сетка + свечение ===== */
.bg-grid{position:fixed;inset:0;z-index:-1;pointer-events:none;
  background-image:linear-gradient(rgba(148,163,200,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,200,.045) 1px,transparent 1px);
  background-size:44px 44px;
  mask-image:radial-gradient(900px 500px at 50% 0%,#000 0%,transparent 80%);
  -webkit-mask-image:radial-gradient(900px 500px at 50% 0%,#000 0%,transparent 80%);
}
.bg-glow{position:fixed;inset:0;z-index:-1;pointer-events:none}
.bg-glow::before,.bg-glow::after{content:'';position:absolute;border-radius:50%;filter:blur(90px);opacity:.5;animation:drift 18s ease-in-out infinite alternate}
.bg-glow::before{width:520px;height:520px;left:-140px;top:-120px;background:radial-gradient(circle,rgba(62,166,255,.22),transparent 70%)}
.bg-glow::after{width:620px;height:620px;right:-200px;top:120px;background:radial-gradient(circle,rgba(62,166,255,.2),transparent 70%);animation-delay:-9s}
@keyframes drift{from{transform:translateY(0) scale(1)}to{transform:translateY(60px) scale(1.1)}}
/* ===== Появление при скролле ===== */
.rv{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.22,.61,.36,1),transform .7s cubic-bezier(.22,.61,.36,1)}
.rv.on{opacity:1;transform:none}
.rv[data-d="1"]{transition-delay:.08s}
.rv[data-d="2"]{transition-delay:.16s}
.rv[data-d="3"]{transition-delay:.24s}
@media (prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}.bg-glow::before,.bg-glow::after{animation:none}}
/* ===== Навбар ===== */
nav{position:sticky;top:0;z-index:30;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:rgba(10,14,20,.72);border-bottom:1px solid var(--line)}
.nav{max-width:1120px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;gap:22px}
.brand{display:flex;align-items:center;gap:11px;font-family:'Unbounded',sans-serif;font-weight:700;font-size:17px;letter-spacing:.01em}
.brand .ic{width:30px;height:30px;color:var(--acc)}
.brand .logo{width:30px;height:30px;border-radius:8px;object-fit:cover}
.beta{font-family:'Manrope';font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;background:#05080D;color:#fff;border:1px solid #fff;padding:3px 7px;border-radius:5px;line-height:1}
.nlinks{display:flex;gap:6px;margin-left:auto;color:var(--mut);font-size:13.5px;font-weight:600}
.nlinks a{padding:8px 12px;border-radius:9px;transition:color .2s,background .2s}
.nlinks a:hover{color:var(--txt);background:rgba(148,163,200,.08)}
@media (max-width:760px){.nlinks{display:none}}
/* ===== Кнопки ===== */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;padding:12px 22px;border-radius:11px;color:#fff;background:linear-gradient(135deg,#3EA6FF,#1E8BE8);box-shadow:0 4px 18px rgba(62,166,255,.25);transition:transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .18s,filter .18s}
.btn:hover{transform:translateY(-2px);filter:brightness(1.07);box-shadow:0 8px 26px rgba(62,166,255,.35)}
.btn:active{transform:translateY(0)}
.btn:disabled{opacity:.55;cursor:default;transform:none}
.btn.ghost{background:rgba(148,163,200,.08);border:1px solid var(--line);box-shadow:none;color:var(--txt)}
.btn.ghost:hover{background:rgba(148,163,200,.14)}
.btn.ghost.acc{color:var(--acc);border-color:rgba(62,166,255,.35)}
.btn.discord{background:linear-gradient(135deg,#5865F2,#4A56E8);box-shadow:0 4px 18px rgba(88,101,242,.28)}
.btn.discord:hover{box-shadow:0 8px 26px rgba(88,101,242,.4)}
.btn.sm{padding:9px 15px;font-size:13px;border-radius:9px}
.btn.danger{background:rgba(255,93,93,.14);color:#FF6B6B;border:1px solid rgba(255,93,93,.3);box-shadow:none}
.btn .ic{width:17px;height:17px}
/* ===== Hero ===== */
.hero{max-width:1120px;margin:0 auto;padding:96px 24px 54px;text-align:center;position:relative}
.overline{display:inline-flex;align-items:center;gap:9px;font-family:'Unbounded';font-size:10.5px;font-weight:600;letter-spacing:.22em;color:var(--acc);border:1px solid rgba(62,166,255,.3);border-radius:99px;padding:7px 16px;background:rgba(62,166,255,.07)}
.overline .ic{width:14px;height:14px}
.hero h1{font-family:'Unbounded',sans-serif;font-weight:800;font-size:clamp(34px,6.2vw,64px);line-height:1.08;margin:26px 0 16px;letter-spacing:-.015em;color:#F2F6FB}
.hero h1 em{font-style:normal;background:linear-gradient(100deg,#3EA6FF 10%,#6ABEFF 50%,#D9ECFF 95%);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--mut);font-size:17px;line-height:1.65;max-width:640px;margin:0 auto}
.cta{display:flex;gap:14px;justify-content:center;margin-top:34px;flex-wrap:wrap}
.plats{margin-top:30px;display:flex;gap:12px;justify-content:center;color:var(--faint);font-size:12.5px;font-weight:600;flex-wrap:wrap}
.plats span{display:inline-flex;align-items:center;gap:7px}
.plats span::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--acc);opacity:.6}
/* ===== Секции ===== */
.wrap{max-width:1120px;margin:0 auto;padding:0 24px 96px}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:22px;margin-top:52px}
.panel{background:linear-gradient(180deg,rgba(22,30,48,.7),rgba(17,25,39,.7));border:1px solid var(--line);border-radius:18px;padding:30px;position:relative;overflow:hidden;transition:border-color .25s,transform .25s}
.panel::before{content:'';position:absolute;inset:0 0 auto;height:2px;background:linear-gradient(90deg,transparent,#3EA6FF 50%,transparent);opacity:0;transition:opacity .3s}
.panel:hover{border-color:rgba(62,166,255,.25);transform:translateY(-2px)}
.panel:hover::before{opacity:1}
.panel h2{margin:0 0 8px;font-family:'Unbounded';font-weight:600;font-size:16px;letter-spacing:.01em}
.panel .sub{margin:0 0 22px;color:var(--mut);font-size:13.5px;line-height:1.6}
.acc{display:flex;align-items:center;gap:15px;margin-bottom:20px}
.ava{width:58px;height:58px;border-radius:15px;object-fit:cover;background:rgba(148,163,200,.1);border:1px solid var(--line);display:grid;place-items:center;font-family:'Unbounded';font-weight:700;font-size:22px;color:var(--acc)}
.acc .nm{font-size:16px;font-weight:800}
.acc .dn{color:var(--mut);font-size:13px;margin-top:2px}
.ava .ic{width:26px;height:26px}
input{width:100%;background:rgba(8,12,18,.7);border:1px solid var(--line);border-radius:11px;color:var(--txt);padding:13px 15px;font-size:14.5px;outline:none;font-family:inherit;transition:border-color .2s,box-shadow .2s}
input:focus{border-color:rgba(62,166,255,.5);box-shadow:0 0 0 3px rgba(62,166,255,.12)}
input::placeholder{color:var(--faint)}
.btn-block{width:100%;margin-top:16px}
.msg{margin-top:14px;font-size:13px;line-height:1.55;color:var(--mut);min-height:20px}
.msg.ok{color:#4BE38B}.msg.err{color:#FF6B6B}
.subtle{color:var(--mut);font-size:13.5px;transition:color .2s}
.subtle:hover{color:var(--txt)}
.step{display:flex;gap:13px;margin:12px 0;color:var(--mut);font-size:13.5px;line-height:1.55;align-items:flex-start}
.step b{color:var(--txt)}
.stepnum{flex:none;width:26px;height:26px;border-radius:9px;background:rgba(62,166,255,.12);color:var(--acc);display:grid;place-items:center;font-weight:800;font-size:12.5px;font-family:'Unbounded'}
.sechead{display:flex;align-items:center;gap:14px;margin:76px 0 10px}
.sechead h2{margin:0;font-family:'Unbounded';font-weight:700;font-size:21px;letter-spacing:-.01em}
.sechead .bar{width:34px;height:3px;border-radius:99px;background:linear-gradient(90deg,#3EA6FF,#66BDFF)}
.secd{color:var(--faint);font-size:14px;margin:6px 0 0;max-width:580px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;margin-top:30px}
.feat{background:linear-gradient(180deg,rgba(22,30,48,.6),rgba(17,25,39,.6));border:1px solid var(--line);border-radius:16px;padding:24px;transition:transform .25s,border-color .25s,box-shadow .25s}
.feat:hover{transform:translateY(-4px);border-color:rgba(62,166,255,.28);box-shadow:0 14px 34px rgba(0,0,0,.35)}
.feat .fic{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;background:rgba(62,166,255,.12);color:var(--acc);margin-bottom:16px;transition:transform .25s}
.feat:hover .fic{transform:scale(1.08) rotate(-4deg)}
.feat .fic svg{width:23px;height:23px}
.feat b{font-size:15px;display:block;margin-bottom:7px;font-weight:800}
.feat p{margin:0;color:var(--mut);font-size:13.5px;line-height:1.6}
.goods{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}
.tick{display:inline-flex;align-items:center;gap:9px;color:var(--mut);font-size:13.5px;background:rgba(22,30,48,.55);border:1px solid var(--line);padding:10px 15px;border-radius:99px;transition:border-color .2s,color .2s}
.tick:hover{color:var(--txt);border-color:rgba(62,166,255,.3)}
.tick .ic{width:15px;height:15px;color:var(--acc)}
/* ===== Футер ===== */
footer{border-top:1px solid var(--line);background:rgba(8,11,17,.6);padding:52px 24px 60px}
.foot{max-width:1120px;margin:0 auto;display:flex;flex-wrap:wrap;gap:44px;justify-content:space-between}
.foot .co{color:var(--mut);font-size:13px;line-height:1.75;max-width:300px;margin-top:14px}
.foot h4{margin:0 0 14px;font-family:'Unbounded';font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.foot nav a{display:block;color:var(--mut);font-size:13.5px;margin-bottom:10px;transition:color .2s,transform .2s}
.foot nav a:hover{color:var(--txt);transform:translateX(3px)}
.legal{margin-top:44px;color:var(--faint);font-size:12px;line-height:1.7;max-width:900px}
@media (max-width:760px){.hero{padding-top:60px}.wrap{padding-bottom:64px}}
`

const HEAD = (title) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="Enemy — бесплатный лаунчер Minecraft: любые версии, сборки, скины, друзья и свой сервер в одном окне." />
<title>${esc(title || 'Enemy Launcher — бесплатный лаунчер Minecraft')}</title>
<link rel="icon" href="/logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<style>${CSS}</style>
</head>
<body>
${ICONS}
<div class="bg-grid"></div><div class="bg-glow"></div>`

const NAV = ({ logged }) => `
<nav><div class="nav">
  <a class="brand" href="/"><img class="logo" src="/logo.png" alt="Enemy" />Enemy<span class="beta">beta</span></a>
  <div class="nlinks">
    <a href="/#account">Аккаунт</a>
    <a href="/#launcher">Лаунчер</a>
    <a href="/#features">Возможности</a>
  </div>
  ${
    logged
      ? `<a class="brand" href="/logout" title="Выйти" style="font-family:Manrope;font-weight:700;font-size:13.5px;color:var(--mut)">${logged} · Выйти</a>`
      : `<a href="/v2/auth/discord"><button class="btn sm">Войти через Discord</button></a>`
  }
</div></nav>`

const FOOT = `
<footer>
  <div class="foot">
    <div>
      <a class="brand" href="/" style="margin-bottom:0"><img class="logo" src="/logo.png" alt="Enemy" />Enemy<span class="beta">beta</span></a>
      <p class="co">Бесплатный лаунчер Minecraft: любые версии, сборки, скины, друзья и свой сервер — в одном окне. Без рекламы.</p>
    </div>
    <div><h4>Навигация</h4><nav><a href="/">Главная</a><a href="/#account">Сменить ник</a><a href="/#launcher">Вход в лаунчер</a></nav></div>
    <div><h4>Экосистема</h4><nav><a href="/">Лаунчер</a><a href="/">Скины</a><a href="/">Хостинг</a><a href="/">Топ серверов</a></nav></div>
  </div>
  <div class="legal" style="margin:0 auto">Enemy — независимый проект. Мы не связаны с Mojang Studios, Microsoft Corporation или Minecraft. Minecraft — товарный знак Mojang Synergies AB. Лаунчер бесплатный: играть можно без лицензии, по обычному нику.</div>
</footer>`

const hero = (logged) => `
<div class="hero">
  <span class="overline">${ICON('ic-code')}ENEMY LAUNCHER</span>
  <h1>Открой Minecraft <em>по-новому</em></h1>
  <p>Любые версии и сборки, скины и плащи, друзья и чат, свой сервер на хостинге — в одном окне. Бесплатно и без рекламы.</p>
  <div class="cta">
    <a href="/download"><button class="btn">${ICON('ic-code')}Установить лаунчер</button></a>
    <a href="/v2/auth/discord"><button class="btn ghost">${ICON('ic-discord')}Войти через Discord</button></a>
  </div>
  <div class="plats"><span>Windows</span><span>macOS</span><span>Linux</span><span>Без лицензии</span><span>Любая версия</span><span>Открытый код</span></div>
</div>`

const reveal = (block, d = 0) => {
  const dAttr = d ? ` data-d="${d}"` : ''
  return `<div class="rv"${dAttr}>${block}</div>`
}

export const sitePage = ({ user }) => {
  const logged = user ? esc(user.nickname) : ''
  const body = user ? authed(user) : authBox()
  return HEAD() + NAV({ logged }) + hero(logged) + `
<div class="wrap">
  <div class="grid2" id="account">
    ${reveal(body.profile)}
    ${reveal(body.launcher, 1)}
  </div>
  <div class="sechead" id="features"><span class="bar"></span><h2>Один аккаунт — весь лаунчер</h2></div>
  <p class="secd">Тот же аккаунт, что на сайте: лаунчер, игра, друзья, скины и серверы вместе.</p>
  <div class="cards">
    ${reveal(`<div class="feat"><div class="fic">${ICON('ic-palette')}</div><b>Скины и плащи</b><p>Загружай скин PNG и меряй в 3D до захода в игру. Плащи — отдельной вкладкой.</p></div>`)}
    ${reveal(`<div class="feat"><div class="fic">${ICON('ic-users')}</div><b>Друзья и чат</b><p>Видно, кто в сети и на каком сервере. Переписка и приглашение прямо из лаунчера.</p></div>`, 1)}
    ${reveal(`<div class="feat"><div class="fic">${ICON('ic-server')}</div><b>Свой сервер</b><p>Запуск и остановка хостинга, файлы, бэкапы и консоль — не выходя из лаунчера.</p></div>`, 2)}
    ${reveal(`<div class="feat"><div class="fic">${ICON('ic-music')}</div><b>Музыка и обои</b><p>Фоновая музыка, живые обои и тёмная тема. Окно — как ты хочешь.</p></div>`, 3)}
  </div>
  <div class="sechead"><span class="bar"></span><h2>Безопасно — это можно проверить</h2></div>
  <p class="secd">Лаунчеру ты отдаёшь свои файлы игры. Поэтому ничего не скрываем.</p>
  <div class="goods" style="margin-bottom:8px">
    ${reveal(`<span class="tick">${ICON('ic-check')}Вход подтверждается на официальной странице Enemy</span>`)}
    ${reveal(`<span class="tick">${ICON('ic-check')}Пароль от Microsoft не нужен</span>`, 1)}
    ${reveal(`<span class="tick">${ICON('ic-check')}Токены не покидают ядро лаунчера</span>`, 2)}
    ${reveal(`<span class="tick">${ICON('ic-check')}Без лицензии — играешь по нику</span>`, 3)}
  </div>
</div>` + FOOT + siteScriptTag()
}

const authBox = () => ({
  profile: `
<div class="panel">
  <h2>Аккаунт Enemy</h2>
  <p class="sub">Один аккаунт на всём: этот сайт, лаунчер, запуск игры, друзья и скины. Первый вход создаёт его автоматически.</p>
  <a href="/v2/auth/discord" style="display:block"><button class="btn discord btn-block">${ICON('ic-discord')}Войти через Discord</button></a>
  <p class="msg">После входа здесь же поменяешь ник — а код из лаунчера пустит в него именно этот аккаунт.</p>
</div>`,
  launcher: `
<div class="panel" id="launcher">
  <h2>Впустить лаунчер</h2>
  <p class="sub">Лаунчер сам покажет код на экране входа. Введи его здесь — зайдёт аккаунт из этого браузера.</p>
  <div class="step"><span class="stepnum">1</span><span>В лаунчере открой <b>«Войти через Enemy»</b> — появится код вида <b>ABCD-EFGH</b>.</span></div>
  <div class="step"><span class="stepnum">2</span><span>Сначала войди через Discord выше, потом введи код сюда и нажми <b>Впустить</b>.</span></div>
  <div class="step"><span class="stepnum">3</span><span>Вернись в лаунчер — он зайдёт автоматически.</span></div>
  <input id="lcode" placeholder="Код из лаунчера" style="margin-top:18px" autocomplete="off" />
  <button class="btn btn-block" id="linkBtn">${ICON('ic-key')}Проверить код</button>
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
  <button class="btn btn-block" id="nickBtn">${ICON('ic-check')}Сохранить ник</button>
  <div class="msg" id="nickMsg">Если ник совпадает с лицензионным аккаунтом Minecraft — на аватаре будет его голова.</div>
</div>`,
    launcher: `
<div class="panel" id="launcher">
  <h2>Впустить лаунчер</h2>
  <p class="sub">Лаунчер сам покажет код на экране входа. Он впустит именно тебя — ${esc(user.nickname)}.</p>
  <div class="step"><span class="stepnum">1</span><span>В лаунчере открой <b>«Войти через Enemy»</b> — появится код вида <b>ABCD-EFGH</b>.</span></div>
  <div class="step"><span class="stepnum">2</span><span>Введи его ниже и нажми <b>Впустить</b>.</span></div>
  <div class="step"><span class="stepnum">3</span><span>Вернись в лаунчер — он зайдёт автоматически.</span></div>
  <input id="lcode" placeholder="Код из лаунчера" style="margin-top:18px" autocomplete="off" />
  <button class="btn btn-block" id="linkBtn">${ICON('ic-key')}Впустить лаунчер</button>
  <div class="msg" id="linkMsg"></div>
</div>`,
  }
}

export const approvePage = ({ user, deviceCode, userCode }) => HEAD('Вход в Enemy Launcher') + NAV({ logged: esc(user.nickname) }) + `
<div class="wrap" style="max-width:540px">
  <div class="panel" style="margin-top:56px;text-align:center">
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
    <div style="font-family:'Unbounded';font-size:28px;letter-spacing:.14em;padding:16px;background:rgba(8,12,18,.7);border:1px solid var(--line);border-radius:12px;margin:0 0 20px;user-select:text;-webkit-user-select:text;cursor:text">${esc(userCode)}</div>
    <form method="POST" action="/v2/auth/launcher/accept">
      <input type="hidden" name="deviceCode" value="${esc(deviceCode)}" />
      <button class="btn" type="submit" style="width:100%">${ICON('ic-key')}Войти в лаунчер</button>
    </form>
    <div style="display:flex;gap:14px;justify-content:center;margin-top:16px;align-items:center">
      <a href="/v2/auth/discord?redirect=%2Fv2%2Fauth%2Flauncher%2Fapprove%3Fdevice_code%3D${esc(encodeURIComponent(deviceCode))}" class="subtle">Сменить аккаунт</a>
      <span style="color:var(--faint)">·</span>
      <a href="/" class="subtle">На сайт</a>
    </div>
  </div>
</div>` + FOOT

export const errorPage = (title, text) => HEAD(title) + NAV({ logged: '' }) + `
<div class="wrap" style="max-width:540px">
  <div class="panel" style="margin-top:56px;text-align:center">
    <div class="ava" style="margin:0 auto 18px">${ICON('ic-shield')}</div>
    <h2>${esc(title)}</h2>
    <p class="sub">${esc(text)}</p>
    <a href="/" style="display:block"><button class="btn ghost" style="width:100%">На сайт</button></a>
  </div>
</div>` + FOOT

// ============ Админ-панель (по прямому адресу /admin) ============

export const adminPage = ({ authed, passwordSet, loginError }) => {
  if (!authed) {
    return HEAD('Админ-панель') + NAV({ logged: '' }) + `
<div class="wrap" style="max-width:440px">
  <div class="panel" style="margin-top:60px;text-align:center">
    <div class="ava" style="margin:0 auto 16px">${ICON('ic-lock')}</div>
    <h2>Админ-панель</h2>
    <p class="sub">${passwordSet ? 'Введи пароль администратора.' : 'Пароль администратора не задан (переменная ADMIN_PASSWORD) — вход с дефолтным паролем.'}</p>
    <form method="POST" action="/admin">
      <input type="password" name="password" placeholder="Пароль" autocomplete="current-password" />
      <button class="btn" type="submit" style="width:100%">Войти</button>
    </form>
    ${loginError ? '<p class="msg err">Неверный пароль — попробуй ещё раз.</p>' : ''}
  </div>
</div>
<script>
document.querySelector('input').addEventListener('keydown', function (e) { if (e.key === 'Enter') e.target.form.submit() })
</script>` + FOOT
  }
  return HEAD('Админ-панель') + NAV({ logged: '' }) + `
<div class="wrap">
  <div class="sechead"><span class="bar"></span><h2>Админ-панель</h2></div>
  <p class="secd">Пользователи Enemy: смена ника, удаление аккаунта, выдача бейджа (Owner / Admin / Moder / Tester — один на игрока) по нику или id. Бейдж показывается в лаунчере рядом с ником. Ниже — баны по IP: заблокированный адрес не пройдёт ни в лаунчер, ни на сайт.</p>
  <div class="panel" style="padding:0;overflow:hidden">
    <table class="admin-table" style="width:100%;border-collapse:collapse;font-size:13.5px">
      <thead><tr style="text-align:left;color:var(--faint);font-size:11px;letter-spacing:.08em;text-transform:uppercase">
        <th style="padding:14px 16px">#</th>
        <th style="padding:14px 8px">Ник</th>
        <th style="padding:14px 8px">Discord</th>
        <th style="padding:14px 8px">Роли</th>
        <th style="padding:14px 8px">IP</th>
        <th style="padding:14px 8px">Создан</th>
        <th style="padding:14px 16px;text-align:right">Действия</th>
      </tr></thead>
      <tbody id="rows"></tbody>
    </table>
    <div id="st" style="padding:16px;color:var(--mut);font-size:13px"></div>
  </div>

  <div class="sechead" style="margin-top:26px"><span class="bar"></span><h2>Баны по IP</h2></div>
  <div class="panel" style="padding:16px">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <input id="banIp" placeholder="IP, например 1.2.3.4" style="flex:1;min-width:180px;padding:8px 10px;font-size:13px" />
      <input id="banReason" placeholder="Причина (необязательно)" style="flex:1.4;min-width:180px;padding:8px 10px;font-size:13px" />
      <button class="btn" id="banAdd" style="flex:none">Забанить</button>
    </div>
    <div id="banList" style="margin-top:12px"></div>
  </div>

  <a href="/admin/logout" style="color:var(--mut);font-size:13.5px;display:inline-block;margin-top:16px">Выйти из админки →</a>
</div>
<style>
.role-chip{display:inline-block;border:0;cursor:pointer;font-family:'Manrope';font-weight:800;font-size:10.5px;letter-spacing:.03em;padding:4px 8px;border-radius:6px;margin:2px;background:rgba(148,163,200,.08);color:var(--faint);transition:color .15s,background .15s}
.role-chip.on{color:#0A0E14}
.role-chip[data-role="owner"].on{background:#ffd83d;color:#000}
.role-chip[data-role="admin"].on{background:#ff5f57;color:#fff}
.role-chip[data-role="moder"].on{background:#7dff6b;color:#000}
.role-chip[data-role="tester"].on{background:#6be8ff;color:#000}
.role-chip:disabled{opacity:.5;cursor:default}
.admin-table th,.admin-table td{vertical-align:middle}
</style>
<script>
(function () {
  var rows = document.getElementById('rows')
  var st = document.getElementById('st')
  var ROLE_ORDER = ['owner', 'admin', 'moder', 'tester']
  function msg(t) { st.textContent = t }
  function human(sec) {
    if (!sec) return '—'
    var d = new Date(sec * 1000)
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }
  function render(users) {
    rows.innerHTML = ''
    if (!users.length) { rows.innerHTML = '<tr><td colspan="7" style="padding:18px;color:var(--faint)">Пока никого нет.</td></tr>'; return }
    users.forEach(function (u) {
      var tr = document.createElement('tr')
      tr.style.borderTop = '1px solid var(--line)'
      var roles = u.roles || []
      var chips = ROLE_ORDER.map(function (r) {
        var on = roles.indexOf(r) !== -1
        return '<button class="role-chip' + (on ? ' on' : '') + '" data-uid="' + u.id + '" data-role="' + r + '">' + r.charAt(0).toUpperCase() + r.slice(1) + '</button>'
      }).join('')
      tr.innerHTML = '<td style="padding:10px 16px;color:var(--faint);white-space:nowrap">' + u.id + '</td>' +
        '<td style="padding:10px 8px"><input data-uid="' + u.id + '" value="' + esc2(u.nickname) + '" maxlength="20" style="max-width:150px;padding:8px 10px;font-size:13px" /></td>' +
        '<td style="padding:10px 8px;color:var(--mut)">' + esc2(u.discord_username || (u.discord_id ? '#' + u.discord_id : '—')) + '</td>' +
        '<td style="padding:10px 8px;white-space:nowrap;min-width:180px">' + chips + '</td>' +
        '<td style="padding:10px 8px;white-space:nowrap">' + (u.last_ip ? esc2(u.last_ip) : '<span style="color:var(--faint)">—</span>') + '</td>' +
        '<td style="padding:10px 8px;color:var(--faint);white-space:nowrap">' + human(u.created_at) + '</td>' +
        '<td style="padding:10px 16px;text-align:right;white-space:nowrap">' +
          (u.last_ip ? '<button class="btn sm" data-a="ban" data-uid="' + u.id + '" style="margin-right:8px">Бан</button>' : '') +
          '<button class="btn sm" data-a="set" data-uid="' + u.id + '" style="margin-right:8px">Сохранить</button>' +
          '<button class="btn sm danger" data-a="del" data-uid="' + u.id + '">Удалить</button></td>'
      rows.appendChild(tr)
    })
  }
  function esc2(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
  function human2(sec) {
    if (!sec) return '—'
    var d = new Date(sec)
    return d.getDate() + '.' + String(d.getMonth() + 1).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
  }
  function renderBans(list) {
    var el = document.getElementById('banList')
    if (!list.length) { el.innerHTML = '<p style="color:var(--faint);font-size:13px">Забаненных нет.</p>'; return }
    el.innerHTML = list.map(function (b) {
      return '<div style="display:flex;gap:10px;align-items:center;padding:8px 2px;border-top:1px solid var(--line)">' +
        '<b style="min-width:0;word-break:break-all;font-size:13.5px">' + esc2(b.ip) + '</b>' +
        '<span style="flex:1;color:var(--mut);font-size:13px">' + (b.reason ? esc2(b.reason) : '') + '</span>' +
        '<span style="color:var(--faint);font-size:12px;white-space:nowrap">' + human2(b.created_at) + '</span>' +
        '<button class="btn sm" data-unban="' + esc2(b.ip) + '">Разбанить</button></div>'
    }).join('')
  }
  function loadBans() {
    fetch('/v2/admin/bans').then(function (r) {
      if (r.status === 401) return
      return r.json().then(function (d) { renderBans(d.bans || []) })
    }).catch(function () {})
  }
  function prefillBan(ip) {
    var inp = document.getElementById('banIp')
    if (inp) { inp.value = ip || ''; inp.focus() }
  }
  var banAdd = document.getElementById('banAdd')
  if (banAdd) banAdd.onclick = function () {
    var ip = document.getElementById('banIp').value.trim()
    var reason = document.getElementById('banReason').value.trim()
    if (!ip) { msg('Введи IP'); return }
    banAdd.disabled = true
    fetch('/v2/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: ip, reason: reason })
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) { msg(d.message || 'Не получилось'); return }
        msg('IP забанен: ' + ip)
        document.getElementById('banIp').value = ''
        document.getElementById('banReason').value = ''
        loadBans()
      })
    }).catch(function () { msg('Ошибка сети') }).then(function () { banAdd.disabled = false })
  }
  var banIpEl = document.getElementById('banIp')
  var banReasonEl = document.getElementById('banReason')
  function banEnter(e) { if (e.key === 'Enter' && banAdd) banAdd.onclick() }
  if (banIpEl) banIpEl.addEventListener('keydown', banEnter)
  if (banReasonEl) banReasonEl.addEventListener('keydown', banEnter)
  loadBans()
  fetch('/v2/admin/users').then(function (r) {
    if (r.status === 401) { msg('Сессия истекла — перезайди под паролем.'); location.href = '/admin'; return }
    return r.json().then(function (d) { render(d.users || []) })
  }).catch(function () { msg('Ошибка сети') })
  function rowRoles(uid) {
    var tr = rows.querySelector('button.role-chip[data-uid="' + uid + '"]').closest('tr')
    var out = []
    tr.querySelectorAll('.role-chip').forEach(function (c) { if (c.classList.contains('on')) out.push(c.getAttribute('data-role')) })
    return out
  }
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('button.role-chip')
    if (chip) {
      var uid = chip.getAttribute('data-uid')
      var wasOn = chip.classList.contains('on')
      // Один бейдж на игрока: клик выбирает его, повторный клик снимает.
      chip.closest('tr').querySelectorAll('.role-chip').forEach(function (c) { c.classList.remove('on') })
      if (!wasOn) chip.classList.add('on')
      chip.disabled = true
      fetch('/v2/admin/set-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: uid, roles: rowRoles(uid) })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { msg(d.message || 'Не получилось'); return }
          msg('Бейдж #' + uid + ': ' + (d.roles.length ? d.roles.join(', ') : 'снят'))
        })
      }).catch(function () { msg('Ошибка сети') }).then(function () { chip.disabled = false })
      return
    }
    var ub = e.target.closest('button[data-unban]')
    if (ub) {
      var ubIp = ub.getAttribute('data-unban')
      if (!confirm('Разбанить ' + ubIp + '?')) return
      fetch('/v2/admin/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ubIp })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { msg(d.message || 'Не получилось'); return }
          msg('Разбанен: ' + ubIp)
          loadBans()
        })
      }).catch(function () { msg('Ошибка сети') })
      return
    }
    var b = e.target.closest('button[data-a]')
    if (!b) return
    var uid = b.getAttribute('data-uid')
    var act = b.getAttribute('data-a')
    if (act === 'ban') {
      var ipTd = b.closest('tr').querySelectorAll('td')[4]
      prefillBan(ipTd ? ipTd.textContent.trim() : '')
      return
    }
    if (act === 'del' && !confirm('Удалить пользователя #' + uid + '?')) return
    var body = act === 'del' ? { id: uid } : { id: uid, nickname: rows.querySelector('input[data-uid="' + uid + '"]').value }
    b.disabled = true
    fetch('/v2/admin/' + (act === 'del' ? 'delete-user' : 'set-nick'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    fetch('/v2/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname: nick }) })
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
    fetch('/v2/site/launcher/link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code }) })
      .then(function (r) { return r.json().catch(function () { return {} }).then(function (d) {
        if (!r.ok) return msg(linkMsg, d.message || 'Код не подошёл')
        msg(linkMsg, 'Готово! Возвращайся в лаунчер — вход выполнен.', true)
      }) })
      .catch(function () { msg(linkMsg, 'Сеть недоступна — попробуй ещё раз') })
      .then(function () { linkBtn.disabled = false })
  }
  // Появление блоков при скролле
  var rv = document.querySelectorAll('.rv')
  if ('IntersectionObserver' in window && rv.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target) } })
    }, { threshold: 0.12 })
    rv.forEach(function (el) { io.observe(el) })
  } else {
    rv.forEach(function (el) { el.classList.add('on') })
  }
})();`

export function siteScriptTag() {
  return `<script>${SITE_SCRIPT}</script>`
}
