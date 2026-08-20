const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

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
  <symbol id="ic-pen" viewBox="0 0 24 24"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>
  <symbol id="ic-lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="ic-arrow" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="ic-gift" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1" fill="currentColor"/><rect x="5" y="12" width="14" height="9" rx="2" fill="currentColor"/><path d="M12 8v13" stroke="currentColor" stroke-width="2"/><path d="M12 8H8.5a2.5 2.5 0 1 1 0-5C11 3 12 5 12 8Zm0 0h3.5a2.5 2.5 0 1 0 0-5C13 3 12 5 12 8Z" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
  <symbol id="ic-crown" viewBox="0 0 24 24"><path d="M3 8l4.2 3.8L12 5l4.8 6.8L21 8l-1.8 10H4.8L3 8Z" fill="currentColor"/><rect x="5" y="19" width="14" height="2" rx="1" fill="currentColor"/></symbol>
</svg>`

const ICON = (name, cls = 'ic') => `<svg class="${cls}"><use href="#${name}"/></svg>`

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
body{cursor:default;user-select:none;-webkit-user-select:none}
input,textarea{user-select:text;-webkit-user-select:text;cursor:text}
a,button,[role="button"],label{cursor:pointer}
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
.rv{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.22,.61,.36,1),transform .7s cubic-bezier(.22,.61,.36,1)}
.rv.on{opacity:1;transform:none}
.rv[data-d="1"]{transition-delay:.08s}
.rv[data-d="2"]{transition-delay:.16s}
.rv[data-d="3"]{transition-delay:.24s}
@media (prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}.bg-glow::before,.bg-glow::after{animation:none}}
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
footer{border-top:1px solid var(--line);background:rgba(8,11,17,.6);padding:52px 24px 60px}
.foot{max-width:1120px;margin:0 auto;display:flex;flex-wrap:wrap;gap:44px;justify-content:space-between}
.foot .co{color:var(--mut);font-size:13px;line-height:1.75;max-width:300px;margin-top:14px}
.foot h4{margin:0 0 14px;font-family:'Unbounded';font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.foot nav a{display:block;color:var(--mut);font-size:13.5px;margin-bottom:10px;transition:color .2s,transform .2s}
.foot nav a:hover{color:var(--txt);transform:translateX(3px)}
.legal{margin-top:44px;color:var(--faint);font-size:12px;line-height:1.7;max-width:900px}
.panel.profile{padding:0;overflow:hidden;border-radius:22px}
.prof-banner{position:relative;height:190px}
.prof-banner-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1}
.prof-banner::before{content:'';position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,.16) 18%,rgba(255,255,255,0) 42%)}
.prof-banner::after{content:'';position:absolute;right:-30px;top:-40px;width:240px;height:240px;background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.15),rgba(255,255,255,0) 68%)}
.prof-body{position:relative;display:flex;gap:24px;align-items:flex-end;padding:0 30px 30px;margin-top:-70px}
.prof-ava-wrap{position:relative;flex:none;padding:6px}
.prof-ava{width:104px;height:104px;border-radius:28px;object-fit:cover;border:4px solid var(--bg);background:var(--line);display:grid;place-items:center;font-family:'Unbounded';font-weight:800;font-size:34px;color:var(--acc);position:relative;z-index:1;box-shadow:0 12px 32px rgba(0,0,0,.45)}
.prof-ava .ic{width:44px;height:44px}
.prof-ava-wrap::before{content:'';position:absolute;inset:0;border-radius:34px;background:conic-gradient(from 180deg,#3EA6FF,rgba(255,255,255,.25) 30%,#8B5CF6 60%,#3EA6FF);filter:blur(7px);opacity:.7}
.prof-ava-wrap::after{content:'';position:absolute;inset:6px;border-radius:26px;background:var(--bg)}
.prof-who{min-width:0;padding-bottom:8px}
.prof-nick{font-family:'Unbounded';font-weight:800;font-size:26px;line-height:1.1;letter-spacing:-.01em;background:linear-gradient(100deg,#F2F6FB,#9DC7FF);-webkit-background-clip:text;background-clip:text;color:transparent;word-break:break-word}
.prof-disc{display:flex;align-items:center;gap:8px;color:var(--mut);font-size:13.5px;margin-top:9px}
.prof-disc .ic{width:16px;height:16px;color:#5865F2;flex:none}
.prof-about{margin-top:8px;font-size:13px;color:var(--mut);line-height:1.55;white-space:pre-wrap;word-break:break-word;max-width:560px}
.prof-roles{display:flex;gap:8px;flex-wrap:wrap;margin-left:auto;padding-bottom:8px;justify-content:flex-end;max-width:55%}
.p-badge{font-family:'Unbounded';font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 11px;border-radius:8px;line-height:1}
.p-badge.owner{background:linear-gradient(135deg,#FFB84D,#FF8A3D);color:#1A1206}
.p-badge.admin{background:linear-gradient(135deg,#FF6B6B,#F43F5E);color:#1A0608}
.p-badge.moder{background:linear-gradient(135deg,#4BE38B,#22C55E);color:#052012}
.p-badge.tester{background:linear-gradient(135deg,#8B5CF6,#6D28D9);color:#12041F}
.panel .ph{display:flex;align-items:flex-start;gap:14px;margin-bottom:18px}
.panel .ph .pic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:rgba(62,166,255,.12);color:var(--acc);flex:none;box-shadow:0 6px 16px rgba(62,166,255,.18)}
.panel .ph .pic svg{width:18px;height:18px}
.panel .ph h2{margin:0;font-family:'Unbounded';font-weight:600;font-size:15px;line-height:1.3}
.panel .ph p{margin:3px 0 0;color:var(--mut);font-size:12.5px;line-height:1.55}
.lab{display:block;margin:0 0 10px;color:var(--mut);font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
.swatches{display:flex;flex-wrap:wrap;gap:10px}
.sw{width:36px;height:36px;border-radius:11px;border:2px solid rgba(255,255,255,.06);cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s}
.sw:hover{transform:scale(1.12)}
.sw.on{border-color:#fff;box-shadow:0 0 0 3px rgba(62,166,255,.25)}
.sw.none{background:linear-gradient(135deg,rgba(120,170,255,.3),rgba(120,170,255,.06));position:relative}
.sw.none::after{content:'×';position:absolute;inset:0;display:grid;place-items:center;color:var(--faint);font-size:15px;font-weight:800}
.sw-custom{display:flex;align-items:center;gap:12px;margin-top:18px;flex-wrap:wrap}
.sw-custom input[type="color"]{width:46px;height:40px;padding:3px;border-radius:10px;background:var(--panel);flex:none}
.sw-custom input[type="text"]{width:130px;flex:none}
.sw-custom .lab{margin:0}
.dropzone{display:flex;flex-direction:column;align-items:center;gap:10px;padding:26px 16px;border:1.5px dashed rgba(62,166,255,.35);border-radius:14px;background:rgba(62,166,255,.04);cursor:pointer;text-align:center;transition:border-color .2s,background .2s,transform .2s}
.dropzone:hover,.dropzone.drag{border-color:var(--acc);background:rgba(62,166,255,.09)}
.dropzone .dz-ic{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:rgba(62,166,255,.12);color:var(--acc);flex:none}
.dropzone .dz-ic svg{width:20px;height:20px}
.dropzone .dz-title{font-weight:800;font-size:14.5px}
.dropzone .dz-sub{color:var(--mut);font-size:12px;line-height:1.5}
.dropzone.busy{opacity:.55;pointer-events:none}
.prof-back{display:inline-flex;align-items:center;gap:8px;color:var(--mut);font-size:13.5px;font-weight:600;margin:34px 0 0;transition:color .2s,transform .2s}
.prof-back:hover{color:var(--txt);transform:translateX(-3px)}
.prof-back .ic{width:16px;height:16px;transform:rotate(180deg)}
@media (max-width:640px){.prof-banner{height:150px}.prof-body{flex-wrap:wrap;align-items:center;padding-top:6px}.prof-nick{font-size:21px}}
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
    ${logged ? '<a href="/profile">Профиль</a>' : ''}
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
  <div style="margin-top:12px"><a href="/profile" class="subtle">${ICON('ic-arrow')} Открыть полный профиль — баннер и аватарка</a></div>
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

const BANNER_COLORS = [
  '#5b8cff', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#f8fafc',
]

const NICK_FONTS = {
  unbounded: "'Unbounded',sans-serif",
  russo: "'Arial Black','Segoe UI',sans-serif",
  jost: "'Segoe UI',sans-serif",
  bebas: "'Impact','Arial Narrow',sans-serif",
}

const bannerBg = (hex) =>
  hex
    ? 'linear-gradient(135deg, ' + hex + 'f2 0%, ' + hex + 'b8 45%, ' + hex + '55 78%, ' + hex + '1f 100%)'
    : 'linear-gradient(135deg, rgba(120,170,255,.25) 0%, rgba(120,170,255,.06) 100%)'

const PROFILE_SCRIPT = `
(function () {
  function msg(el, text, ok) { el.textContent = text; el.className = 'msg' + (ok ? ' ok' : '') }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
  function bannerBg(hex) {
    return hex
      ? 'linear-gradient(135deg, ' + hex + 'f2 0%, ' + hex + 'b8 45%, ' + hex + '55 78%, ' + hex + '1f 100%)'
      : 'linear-gradient(135deg, rgba(120,170,255,.25) 0%, rgba(120,170,255,.06) 100%)'
  }
  function markSwatches(hex) {
    var sws = document.querySelectorAll('.sw')
    for (var i = 0; i < sws.length; i++) sws[i].classList.toggle('on', sws[i].getAttribute('data-c') === hex)
  }
  function setBanner(hex, msgEl) {
    if (hex !== '' && !/^#[0-9a-fA-F]{3,8}$/.test(hex)) { msg(msgEl, 'Цвет баннера — hex, например #5b8cff'); return }
    fetch('/v2/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ banner: hex }) })
      .then(function (r) { return r.json().catch(function () { return {} }).then(function (d) {
        if (!r.ok) { msg(msgEl, d.message || 'Не сохранилось'); return }
        document.getElementById('profBanner').style.background = bannerBg(hex)
        markSwatches(hex)
        var hx = document.getElementById('banHex')
        if (hx) hx.value = hex
        msg(msgEl, hex ? 'Цвет баннера сохранён: ' + hex : 'Баннер убран', true)
      }) })
      .catch(function () { msg(msgEl, 'Сеть недоступна — попробуй ещё раз') })
  }
  document.addEventListener('click', function (e) {
    var sw = e.target.closest('.sw')
    if (sw) { setBanner(sw.getAttribute('data-c'), document.getElementById('banMsg')); return }
  })
  var banApply = document.getElementById('banApply')
  if (banApply) banApply.onclick = function () {
    setBanner(document.getElementById('banHex').value.trim(), document.getElementById('banMsg'))
  }
  var banHexEl = document.getElementById('banHex')
  if (banHexEl) banHexEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' && banApply) banApply.onclick() })
  var banColor = document.getElementById('banColor')
  if (banColor) banColor.addEventListener('input', function () { document.getElementById('banHex').value = banColor.value })
  markSwatches(document.getElementById('banHex').value)

  var nickBtn = document.getElementById('nickBtn')
  if (nickBtn) nickBtn.onclick = function () {
    var nick = document.getElementById('nick').value.trim()
    var nickMsg = document.getElementById('nickMsg')
    if (!nick) { msg(nickMsg, 'Введи ник'); return }
    nickBtn.disabled = true
    fetch('/v2/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname: nick }) })
      .then(function (r) { return r.json().catch(function () { return {} }).then(function (d) {
        if (!r.ok) { msg(nickMsg, d.message || 'Не удалось сохранить ник'); return }
        msg(nickMsg, 'Ник сохранён: ' + d.nickname, true)
        var pn = document.getElementById('profNick')
        if (pn) pn.textContent = d.nickname
        if (d.avatarUrl) setAvaImg(d.avatarUrl)
      }) })
      .catch(function () { msg(nickMsg, 'Сеть недоступна — попробуй ещё раз') })
      .then(function () { nickBtn.disabled = false })
  }
  function setAvaImg(src) {
    var el = document.getElementById('profAva')
    if (el) el.outerHTML = '<img class="prof-ava" id="profAva" src="' + esc(src) + '" alt="" />'
  }
  var avaFile = document.getElementById('avaFile')
  var avaDrop = document.getElementById('avaDrop')
  var avaClear = document.getElementById('avaClear')
  function patchAvatar(b64, msgEl) {
    if (avaDrop) avaDrop.classList.add('busy')
    if (avaClear) avaClear.disabled = true
    fetch('/v2/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar: b64 }) })
      .then(function (r) { return r.json().catch(function () { return {} }).then(function (d) {
        if (!r.ok) { msg(msgEl, d.message || 'Не загрузилось'); return }
        if (b64 === '') { window.location.reload(); return }
        if (d.avatarUrl) setAvaImg(d.avatarUrl)
        msg(msgEl, 'Аватарка обновлена', true)
        if (avaFile) avaFile.value = ''
      }) })
      .catch(function () { msg(msgEl, 'Сеть недоступна — попробуй ещё раз') })
      .then(function () { if (avaDrop) avaDrop.classList.remove('busy'); if (avaClear) avaClear.disabled = false })
  }
  function uploadAva() {
    var f = avaFile.files && avaFile.files[0]
    var avaMsg = document.getElementById('avaMsg')
    if (!f) { msg(avaMsg, 'Сначала выбери файл'); return }
    if (f.size > 1.8 * 1024 * 1024) { msg(avaMsg, 'Файл слишком большой — максимум 1.8 МБ'); return }
    var rd = new FileReader()
    rd.onload = function () {
      var b64 = String(rd.result).split(',')[1] || ''
      if (!b64) { msg(avaMsg, 'Не удалось прочитать файл'); return }
      patchAvatar(b64, avaMsg)
    }
    rd.onerror = function () { msg(avaMsg, 'Не удалось прочитать файл') }
    rd.readAsDataURL(f)
  }
  if (avaFile) avaFile.onchange = uploadAva
  if (avaDrop) {
    avaDrop.addEventListener('dragover', function (e) { e.preventDefault(); avaDrop.classList.add('drag') })
    avaDrop.addEventListener('dragleave', function () { avaDrop.classList.remove('drag') })
    avaDrop.addEventListener('drop', function (e) {
      e.preventDefault()
      avaDrop.classList.remove('drag')
      var fs = e.dataTransfer && e.dataTransfer.files
      if (!fs || !fs.length) return
      var made = new DataTransfer()
      for (var i = 0; i < fs.length; i++) made.items.add(fs[i])
      avaFile.files = made.files
      uploadAva()
    })
  }
  if (avaClear) avaClear.onclick = function () {
    if (!confirm('Убрать свою аватарку?')) return
    patchAvatar('', document.getElementById('avaMsg'))
  }
  var aboutBtn = document.getElementById('aboutBtn')
  if (aboutBtn) aboutBtn.onclick = function () {
    var about = document.getElementById('about').value
    var aboutMsg = document.getElementById('aboutMsg')
    if (about.length > 300) { msg(aboutMsg, 'Максимум 300 символов'); return }
    aboutBtn.disabled = true
    fetch('/v2/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ about: about }) })
      .then(function (r) { return r.json().catch(function () { return {} }).then(function (d) {
        if (!r.ok) { msg(aboutMsg, d.message || 'Не сохранилось'); return }
        var pa = document.getElementById('profAbout')
        if (pa) { pa.textContent = about; pa.style.display = about ? '' : 'none' }
        msg(aboutMsg, about ? 'Описание сохранено' : 'Описание убрано', true)
      }) })
      .catch(function () { msg(aboutMsg, 'Сеть недоступна — попробуй ещё раз') })
      .then(function () { aboutBtn.disabled = false })
  }
})();
`

export const profilePage = ({ user }) => {
  const logged = esc(user.nickname)
  const letter = esc((user.discordName || user.nickname || 'E').slice(0, 1).toUpperCase())
  const ava = user.avatarUrl
    ? `<img class="prof-ava" id="profAva" src="${esc(user.avatarUrl)}" alt="" />`
    : `<div class="prof-ava" id="profAva">${letter}</div>`
  const roles = (user.roles || []).map((r) => `<span class="p-badge ${esc(r)}">${esc(r)}</span>`).join('')
  const swatches = BANNER_COLORS.map((hex) =>
    `<button class="sw" data-c="${hex}" style="background:${hex}" title="${hex}"></button>`,
  ).join('')
  const novaBanner = user.bannerImg
    ? `<img class="prof-banner-img" src="${esc(user.bannerImg)}" alt="" />`
    : ''
  const nickStyle =
    user.nickFont || user.nickColor
      ? ` style="font-family:${NICK_FONTS[user.nickFont] || "'Unbounded',sans-serif"};${user.nickColor ? 'background:linear-gradient(95deg,' + user.nickColor + ');-webkit-background-clip:text;background-clip:text;color:transparent' : ''}"`
      : ''
  return HEAD('Профиль — Enemy') + NAV({ logged }) + `
<div class="wrap" style="max-width:960px">
  <a class="prof-back" href="/">${ICON('ic-arrow')}На сайт</a>
  <div class="panel profile" style="margin-top:16px">
    <div class="prof-banner" id="profBanner" style="background:${bannerBg(user.banner)}">${novaBanner}</div>
    <div class="prof-body">
      <div class="prof-ava-wrap">${ava}</div>
      <div class="prof-who">
        <div class="prof-nick" id="profNick"${nickStyle}>${esc(user.nickname)}</div>
        <div class="prof-disc">${ICON('ic-discord')}<span>${esc(user.discordName || '')} · Discord</span></div>
        ${user.about ? `<div class="prof-about" id="profAbout">${esc(user.about)}</div>` : '<div class="prof-about" id="profAbout" style="display:none"></div>'}
      </div>
      ${roles ? `<div class="prof-roles">${roles}</div>` : ''}
    </div>
  </div>
  <div class="grid2" style="margin-top:24px">
    <div class="panel">
      <div class="ph"><span class="pic">${ICON('ic-user')}</span><div><h2>Ник</h2><p>2–20 символов, без дублей. Ник связан с аккаунтом и лаунчером.</p></div></div>
      <input id="nick" value="${esc(user.nickname)}" maxlength="20" autocomplete="off" placeholder="Ник Enemy" />
      <button class="btn btn-block" id="nickBtn">${ICON('ic-check')}Сохранить ник</button>
      <div class="msg" id="nickMsg"></div>
    </div>
    <div class="panel">
      <div class="ph"><span class="pic">${ICON('ic-image')}</span><div><h2>Аватарка</h2><p>PNG, JPEG или WEBP до 1.8 МБ. Уберёшь — вернётся обычная аватарка.</p></div></div>
      <input type="file" id="avaFile" accept="image/png,image/jpeg,image/webp" hidden />
      <label class="dropzone" id="avaDrop" for="avaFile">
        <span class="dz-ic">${ICON('ic-image')}</span>
        <span class="dz-title">Нажми, чтобы выбрать</span>
        <span class="dz-sub">или перетащи картинку сюда — PNG, JPEG или WEBP</span>
      </label>
      <button class="btn btn-block ghost" id="avaClear">Убрать аватарку</button>
      <div class="msg" id="avaMsg"></div>
    </div>
  </div>
  <div class="panel" style="margin-top:24px">
    <div class="ph"><span class="pic">${ICON('ic-palette')}</span><div><h2>Цвет баннера</h2><p>Баннер — полоса над профилем. Тот же цвет, что и в лаунчере.</p></div></div>
    <span class="lab">Пресеты</span>
    <div class="swatches">
      <button class="sw none" data-c="" title="Без баннера"></button>
      ${swatches}
    </div>
    <div class="sw-custom">
      <span class="lab">Свой цвет</span>
      <input type="color" id="banColor" value="${user.banner || '#5b8cff'}" />
      <input type="text" id="banHex" value="${esc(user.banner)}" maxlength="7" placeholder="#5b8cff" />
      <button class="btn sm" id="banApply">Применить</button>
    </div>
    <div class="msg" id="banMsg"></div>
  </div>
  <div class="panel" style="margin-top:24px">
    <div class="ph"><span class="pic">${ICON('ic-pen')}</span><div><h2>Описание профиля</h2><p>Коротко о себе — видно тебе и друзьям. До 300 символов.</p></div></div>
    <textarea id="about" maxlength="300" rows="3" placeholder="Например: строю выживание с друзьями, люблю мини-игры">${esc(user.about || '')}</textarea>
    <button class="btn btn-block" id="aboutBtn">${ICON('ic-check')}Сохранить описание</button>
    <div class="msg" id="aboutMsg"></div>
  </div>
</div>` + FOOT + `<script>${PROFILE_SCRIPT}</script>`
}

export const confirmPage = ({ kind, title, text, user }) => HEAD(title) + NAV({ logged: '' }) + `
<style>
.cp-wrap{min-height:100vh;display:grid;place-items:center;padding:32px 16px}
.cp{width:100%;max-width:430px;text-align:center;padding:38px 28px}
.cp-ring{width:86px;height:86px;margin:0 auto 24px;border-radius:50%;display:grid;place-items:center;font-size:36px}
.cp-ok .cp-ring{color:#7dff6b;background:radial-gradient(circle at 50% 35%,rgba(125,255,107,.18),rgba(125,255,107,0) 72%);border:1px solid rgba(125,255,107,.4);box-shadow:0 0 40px rgba(125,255,107,.2)}
.cp-frozen .cp-ring{color:#ffd83d;background:radial-gradient(circle at 50% 35%,rgba(255,216,61,.18),rgba(255,216,61,0) 72%);border:1px solid rgba(255,216,61,.4);box-shadow:0 0 40px rgba(255,216,61,.2)}
.cp h2{margin:0 0 10px}
.cp .sub{margin:0 0 24px;line-height:1.55}
.cp-acc{display:flex;gap:12px;align-items:center;justify-content:center;padding:12px 14px;background:rgba(8,12,18,.7);border:1px solid var(--line);border-radius:14px;margin-bottom:24px;text-align:left}
.cp-foot{margin-top:6px}
</style>
<div class="wrap cp-wrap">
  <div class="panel cp cp-${kind}">
    <div class="cp-ring">${ICON(kind === 'ok' ? 'ic-check' : 'ic-lock')}</div>
    <h2>${esc(title)}</h2>
    <p class="sub">${esc(text)}</p>
    ${
      user
        ? `<div class="cp-acc">${
            user.avatarUrl
              ? `<img class="ava" src="${esc(user.avatarUrl)}" alt="" />`
              : `<div class="ava">${esc((user.nickname || 'E').slice(0, 1).toUpperCase())}</div>`
          }
            <div>
              <div class="nm">${esc(user.nickname)}</div>
              ${user.discordName ? `<div class="dn">${esc(user.discordName)}</div>` : ''}
            </div>
          </div>`
        : ''
    }
    <a href="/" style="display:block"><button class="btn ghost" style="width:100%">На сайт</button></a>
    <div class="sub cp-foot">Страницу можно закрыть — лаунчер сам увидит результат.</div>
  </div>
</div>` + FOOT

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
    <p class="sub">Или войди как Discord-админ, которому владелец выдал доступ:</p>
    <a class="btn" href="/v2/auth/discord?redirect=/admin" style="width:100%;box-sizing:border-box">Войти через Discord</a>
    ${loginError ? '<p class="msg err">Неверный пароль — попробуй ещё раз.</p>' : ''}
  </div>
</div>
<script>
document.querySelector('input').addEventListener('keydown', function (e) { if (e.key === 'Enter') e.target.form.submit() })
</script>` + FOOT
  }
  return HEAD('Админ-панель') + NAV({ logged: '' }) + `
<div class="wrap" style="max-width:1080px">
  <div class="adm-top">
    <div class="sechead" style="margin:0"><span class="bar"></span><h2>Админ-панель</h2></div>
    <div class="adm-top-r">
      <a class="subtle" href="/">На сайт</a>
      <a class="btn ghost sm" href="/admin/logout">${ICON('ic-key')}Выйти</a>
    </div>
  </div>

  <nav class="adm-nav" id="admNav">
    <button class="adm-tab on" data-tab="users">${ICON('ic-users')}Игроки<span class="adb" id="ctUsers"></span></button>
    <button class="adm-tab" data-tab="reqs">${ICON('ic-key')}Обжалование<span class="adb warn" id="ctAppeals"></span></button>
    <button class="adm-tab" data-tab="bans">${ICON('ic-shield')}Баны<span class="adb" id="ctBans"></span></button>
    <button class="adm-tab" data-tab="donates">${ICON('ic-gift')}Донаты<span class="adb" id="ctDon"></span></button>
    <button class="adm-tab" data-tab="ranks">${ICON('ic-crown')}Ранги<span class="adb" id="ctRanks"></span></button>
    <button class="adm-tab" data-tab="admins">${ICON('ic-lock')}Доступ<span class="adb" id="ctAdmins"></span></button>
  </nav>

  <section class="adm-pane on" id="pane-users">
    <div class="adm-card">
      <div class="adm-h"><h3>Игроки</h3><input id="qUsers" placeholder="Поиск по нику или id…" /></div>
      <div class="adm-scroll">
        <table class="admin-table">
          <thead><tr>
            <th>#</th><th>Ник</th><th>Discord</th><th>IP</th><th>Создан</th><th class="r">Действия</th>
          </tr></thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
      <div id="st" class="adm-st"></div>
    </div>
  </section>

  <section class="adm-pane" id="pane-reqs">
    <div class="adm-card">
      <div class="adm-h"><h3>Обжалование</h3></div>
      <p class="secd">Забаненный игрок начал вход в лаунчер — это его обжалование. Приняв его, ты снимаешь бан и пускаешь вход. Обновляется автоматически.</p>
      <div class="adm-chips" id="reqCats">
        <button class="adm-chip on" data-cat="pending">Ожидают</button>
        <button class="adm-chip" data-cat="accepted">Принятые</button>
        <button class="adm-chip" data-cat="denied">Отклонённые</button>
      </div>
      <div id="loginReqs" class="adm-list"></div>
    </div>
  </section>

  <section class="adm-pane" id="pane-bans">
    <div class="adm-card">
      <div class="adm-h"><h3>Бан аккаунта</h3></div>
      <p class="secd">Блокирует сам аккаунт: вход в лаунчер и на сайт закрыт, у игрока идёт обжалование администратору.</p>
      <div class="adm-row">
        <input id="abanNick" placeholder="Ник игрока (Enemy)" />
        <input id="abanReason" placeholder="Причина (необязательно)" />
        <button class="btn" id="abanAdd">${ICON('ic-user')}Забанить</button>
      </div>
      <div id="abanList" class="adm-list"></div>
    </div>
    <div class="adm-card" style="margin-top:18px">
      <div class="adm-h"><h3>Бан по IP</h3></div>
      <p class="secd">Заблокированный IP не пройдёт ни в лаунчер, ни на сайт.</p>
      <div class="adm-row">
        <input id="banIp" placeholder="IP, например 1.2.3.4" />
        <input id="banReason" placeholder="Причина (необязательно)" />
        <button class="btn" id="banAdd">${ICON('ic-shield')}Забанить</button>
      </div>
      <div id="banList" class="adm-list"></div>
    </div>
  </section>

  <section class="adm-pane" id="pane-admins">
    <div class="adm-card">
      <div class="adm-h"><h3>Доступ администраторов</h3></div>
      <p class="secd">Выдай доступ по нику: человек войдёт на сайт через Discord — и панель откроется без пароля.</p>
      <div class="adm-row">
        <input id="admNick" placeholder="Ник игрока (Enemy)" />
        <button class="btn" id="admAdd">${ICON('ic-user')}Дать доступ</button>
      </div>
      <div id="admList" class="adm-list"></div>
    </div>
  </section>

  <section class="adm-pane" id="pane-donates">
    <div class="adm-card">
      <div class="adm-h"><h3>Донаты</h3><input id="qDon" placeholder="Поиск по нику или id…" /></div>
      <p class="secd">Выдай игроку подписку: выбери срок в днях и нажми «Выдать». «Снять» забирает подписку сразу.</p>
      <div id="donList" class="adm-list"></div>
    </div>
  </section>

  <section class="adm-pane" id="pane-ranks">
    <div class="adm-card">
      <div class="adm-h"><h3>Ранги</h3><input id="qRanks" placeholder="Поиск по нику или id…" /></div>
      <p class="secd">У игрока один ранг. Выбери ранг-чип и нажми «Выдать». У кого ранг не выдан — тот «Обычный игрок».</p>
      <div id="ranksList" class="adm-list"></div>
    </div>
  </section>
</div>
<style>
.adm-top{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin:56px 0 22px;flex-wrap:wrap}
.adm-top-r{display:flex;align-items:center;gap:16px}
nav{position:sticky;top:0;z-index:30;background:rgba(10,14,20,.97);backdrop-filter:none;-webkit-backdrop-filter:none}
.adm-nav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:26px;position:static;top:auto;z-index:auto;background:none;border-bottom:0;backdrop-filter:none;-webkit-backdrop-filter:none}
.adm-tab{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--line);background:rgba(148,163,200,.06);color:var(--mut);border-radius:12px;padding:10px 16px;font-family:'Manrope';font-weight:700;font-size:13.5px;cursor:pointer;transition:all .18s}
.adm-tab .ic{width:16px;height:16px;color:var(--faint);transition:color .18s}
.adm-tab:hover{color:var(--txt);background:rgba(148,163,200,.12)}
.adm-tab.on{color:#fff;background:linear-gradient(135deg,rgba(62,166,255,.22),rgba(30,139,232,.12));border-color:rgba(62,166,255,.5);box-shadow:0 4px 18px rgba(62,166,255,.15)}
.adm-tab.on .ic{color:var(--acc)}
.adb{min-width:20px;height:20px;padding:0 6px;border-radius:99px;background:rgba(148,163,200,.14);color:var(--mut);display:inline-grid;place-items:center;font-size:11px;font-weight:800;line-height:1}
.adb:empty{display:none}
.adb.warn{background:rgba(255,216,61,.16);color:#ffd83d}
.adm-pane{display:none}
.adm-pane.on{display:block;animation:fadeIn .25s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.adm-card{background:linear-gradient(180deg,rgba(22,30,48,.7),rgba(17,25,39,.7));border:1px solid var(--line);border-radius:18px;padding:22px}
.adm-h{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px}
.adm-h h3{margin:0;font-family:'Unbounded';font-weight:700;font-size:16px;letter-spacing:.01em}
.adm-h input{max-width:260px;padding:10px 13px;font-size:13.5px}
.adm-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.adm-row input{flex:1;min-width:170px;padding:10px 13px;font-size:13.5px}
.adm-list{margin-top:14px}
.adm-list>*{border-top:1px solid var(--line)}
.adm-chips{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0 4px}
.adm-chip{border:1px solid var(--line);background:rgba(148,163,200,.06);color:var(--faint);border-radius:99px;padding:7px 14px;font-family:'Manrope';font-weight:700;font-size:12.5px;cursor:pointer;transition:all .18s}
.adm-chip:hover{color:var(--txt)}
.adm-chip.on{color:#fff;background:rgba(62,166,255,.2);border-color:rgba(62,166,255,.5)}
.admin-table{width:100%;border-collapse:collapse;font-size:13.5px}
.admin-table thead th{text-align:left;color:var(--faint);font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:14px 8px;border-bottom:1px solid var(--line);white-space:nowrap}
.admin-table thead th:first-child{padding-left:4px}
.admin-table thead th.r{text-align:right}
.admin-table th,.admin-table td{vertical-align:middle}
.admin-table .btn.sm{padding:8px 11px;font-size:12.5px;border-radius:8px}
.copy-ip{cursor:pointer;color:var(--acc);border-bottom:1px dashed rgba(62,166,255,.4);padding-bottom:1px;transition:opacity .15s}
.copy-ip:hover{opacity:.75}
.adm-st{margin-top:12px;color:var(--mut);font-size:13px;min-height:18px}
.req-st{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;padding:4px 9px;border-radius:99px;white-space:nowrap}
.req-st::before{content:'';width:6px;height:6px;border-radius:50%}
.req-st.wait{color:#ffd83d;background:rgba(255,216,61,.1)}
.req-st.wait::before{background:#ffd83d}
.req-st.frozen{color:#ff5f57;background:rgba(255,95,87,.12)}
.req-st.frozen::before{background:#ff5f57}
.req-st.ok{color:#7dff6b;background:rgba(125,255,107,.1)}
.req-st.ok::before{background:#7dff6b}
.req-st.no{color:#ff8d7a;background:rgba(255,95,87,.08)}
.req-st.no::before{background:#ff8d7a}
.role-chip{display:inline-block;border:0;cursor:pointer;font-family:'Manrope';font-weight:800;font-size:10.5px;letter-spacing:.03em;padding:4px 8px;border-radius:6px;margin:2px;background:rgba(148,163,200,.08);color:var(--faint);transition:color .15s,background .15s}
.role-chip.on{color:#0A0E14}
.role-chip[data-role="owner"].on{background:#ffd83d;color:#000}
.role-chip[data-role="admin"].on{background:#ff5f57;color:#fff}
.role-chip[data-role="moder"].on{background:#7dff6b;color:#000}
.role-chip[data-role="tester"].on{background:#6be8ff;color:#000}
.role-chip:disabled{opacity:.5;cursor:default}
.adm-person{display:flex;gap:16px;align-items:center;padding:14px;border-radius:16px;background:linear-gradient(180deg,rgba(148,163,200,.06),rgba(148,163,200,.02));border:1px solid var(--line);margin-bottom:10px;transition:border-color .18s,background .18s;flex-wrap:wrap}
.adm-person:hover{border-color:rgba(62,166,255,.4);background:linear-gradient(180deg,rgba(148,163,200,.09),rgba(148,163,200,.03))}
.adm-person .ph-wrap{flex:none;padding:2px;border-radius:50%;background:linear-gradient(135deg,rgba(62,166,255,.65),rgba(30,139,232,.25));box-shadow:0 2px 10px rgba(0,0,0,.3)}
.adm-person .ph-wrap .ph{display:block;border-radius:50%;object-fit:cover;border:2px solid #0A0E14}
.adm-person .ph-wrap .ph.off{background:var(--line)}
.adm-person .who{flex:1;min-width:150px;display:flex;flex-direction:column;align-items:flex-start;gap:3px}
.adm-person .who b{font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
.adm-person .who .pid{font-size:11px;color:var(--faint);font-weight:600;letter-spacing:.02em}
.adm-person .pill{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.02em;padding:3px 9px;border-radius:99px;color:var(--faint);background:rgba(148,163,200,.08);white-space:nowrap;margin-top:2px}
.adm-person .pill::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--faint);flex:none}
.adm-person .pill.hot{color:#6be8ff;background:rgba(107,232,255,.1)}
.adm-person .pill.hot::before{background:#6be8ff;box-shadow:0 0 6px rgba(107,232,255,.6)}
.adm-person .grant{flex:none;display:flex;flex-direction:column;gap:9px;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:rgba(148,163,200,.05);min-width:252px}
.adm-person .grant.nova{border-color:rgba(62,166,255,.3);background:linear-gradient(180deg,rgba(62,166,255,.1),rgba(30,139,232,.03))}
.adm-person .grant.crown{border-color:rgba(255,216,61,.24);background:linear-gradient(180deg,rgba(255,216,61,.08),rgba(255,216,61,.02))}
.adm-person .grant-cap{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
.adm-person .grant-cap .ic{width:13px;height:13px;flex:none}
.adm-person .grant.nova .grant-cap{color:#6be8ff}
.adm-person .grant.nova .grant-cap .ic{color:#3EA6FF}
.adm-person .grant.crown .grant-cap{color:#ffd83d}
.adm-person .grant.crown .grant-cap .ic{color:#ffd83d}
.adm-person .grant-field{display:flex;flex-direction:column;gap:8px}
.adm-person .grant-field .g-lab{font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.adm-person .chip-set{display:flex;gap:6px;flex-wrap:wrap}
.adm-person .g-chip{appearance:none;border:1px solid var(--line);background:rgba(148,163,200,.07);color:var(--faint);border-radius:99px;padding:7px 13px;font-family:'Manrope';font-weight:800;font-size:12px;cursor:pointer;transition:all .15s}
.adm-person .g-chip:hover{color:var(--txt);border-color:rgba(62,166,255,.45);background:rgba(148,163,200,.12)}
.adm-person .g-chip.on{color:#0A0E14;background:#3EA6FF;border-color:#3EA6FF;box-shadow:0 3px 12px rgba(62,166,255,.35)}
.adm-person .g-chip.rk{color:var(--cc)}
.adm-person .g-chip.rk.on{color:var(--cc);background:rgba(255,255,255,.04);border-color:var(--cc);box-shadow:0 0 0 1px var(--cc) inset,0 3px 12px rgba(0,0,0,.3)}
.adm-person .grant-acts{display:flex;gap:8px;flex-wrap:wrap}
.adm-person .grant-acts .btn.sm{margin:0}
.adm-person .grant-acts .btn.sm.danger{background:rgba(255,95,87,.12);color:#ff8d7a;border:1px solid rgba(255,95,87,.3);box-shadow:none}
.adm-person .grant-acts .btn.sm.danger:hover{background:rgba(255,95,87,.22);color:#ffb4a6}
</style>
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
  function setCount(id, n) {
    var el = document.getElementById(id)
    if (!el) return
    el.textContent = n || ''
  }
  function showTab(tab) {
    document.querySelectorAll('.adm-tab').forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-tab') === tab) })
    document.querySelectorAll('.adm-pane').forEach(function (p) { p.classList.toggle('on', p.id === 'pane-' + tab) })
  }
  document.querySelectorAll('.adm-tab').forEach(function (t) {
    t.addEventListener('click', function () { showTab(t.getAttribute('data-tab')) })
  })
  var lastUsers = []
  var lastReqs = []
  var reqCat = 'pending'
  function setReqCat(cat) {
    reqCat = cat
    document.querySelectorAll('#reqCats .adm-chip').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-cat') === cat) })
    renderReqs(lastReqs)
  }
  document.querySelectorAll('#reqCats .adm-chip').forEach(function (c) {
    c.addEventListener('click', function () { setReqCat(c.getAttribute('data-cat')) })
  })
  var qUsersEl = document.getElementById('qUsers')
  if (qUsersEl) qUsersEl.addEventListener('input', function () { render(lastUsers) })
  function render(users) {
    lastUsers = users
    setCount('ctUsers', users.length)
    var q = (qUsersEl ? qUsersEl.value.trim().toLowerCase() : '')
    var list = q
      ? users.filter(function (u) { return String(u.nickname || '').toLowerCase().indexOf(q) !== -1 || String(u.id || '').indexOf(q) !== -1 })
      : users
    rows.innerHTML = ''
    if (!list.length) { rows.innerHTML = '<tr><td colspan="6" style="padding:18px;color:var(--faint)">' + (q ? 'Никого не найдено.' : 'Пока никого нет.') + '</td></tr>'; return }
    list.forEach(function (u) {
      var tr = document.createElement('tr')
      tr.style.borderTop = '1px solid var(--line)'
      tr.innerHTML = '<td style="padding:10px 16px;color:var(--faint);white-space:nowrap">' + u.id + '</td>' +
        '<td style="padding:10px 8px"><div style="display:flex;align-items:center;gap:10px">' + (u.avatarUrl
          ? '<img src="' + esc2(u.avatarUrl) + '" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex:none" />'
          : '') + '<input data-uid="' + u.id + '" value="' + esc2(u.nickname) + '" maxlength="20" style="max-width:150px;padding:8px 10px;font-size:13px;flex:1;min-width:80px" />' +
        (u.banned ? ' <span style="color:#ff5f57;font-weight:800;font-size:11px;white-space:nowrap">ЗАБАНЕН</span>' : '') + '</div></td>' +
        '<td style="padding:10px 8px;color:var(--mut)">' + esc2(u.discord_username || (u.discord_id ? '#' + u.discord_id : '—')) + '</td>' +
        '<td style="padding:10px 8px;white-space:nowrap">' + (u.last_ip
          ? '<span class="copy-ip" data-ip="' + esc2(u.last_ip) + '" title="Копировать IP">' + esc2(u.last_ip) + '</span>'
          : '<span style="color:var(--faint)">—</span>') + '</td>' +
        '<td style="padding:10px 8px;color:var(--faint);white-space:nowrap">' + human(u.created_at) + '</td>' +
        '<td style="padding:10px 16px;text-align:right;white-space:nowrap">' +
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
    banCounts.ip = list.length
    updateBanCount()
    if (!list.length) { el.innerHTML = '<p style="color:var(--faint);font-size:13px">Забаненных IP нет.</p>'; return }
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

  var banCounts = { ip: 0, acc: 0 }
  function updateBanCount() { setCount('ctBans', banCounts.ip + banCounts.acc) }
  function renderAccountBans(list) {
    var el = document.getElementById('abanList')
    if (!el) return
    banCounts.acc = list.length
    updateBanCount()
    if (!list.length) { el.innerHTML = '<p style="color:var(--faint);font-size:13px">Забаненных аккаунтов нет.</p>'; return }
    el.innerHTML = list.map(function (b) {
      return '<div style="display:flex;gap:10px;align-items:center;padding:8px 2px">' +
        (b.avatarUrl
          ? '<img src="' + esc2(b.avatarUrl) + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex:none" />'
          : '') +
        '<b style="font-size:13.5px">' + esc2(b.nickname) + '</b>' +
        '<span style="color:var(--faint);font-size:12.5px">#' + esc2(b.id) + '</span>' +
        '<span style="flex:1;min-width:0;color:var(--mut);font-size:13px">' + (b.reason ? esc2(b.reason) : '<span style="color:var(--faint)">без причины</span>') + '</span>' +
        '<span style="color:var(--faint);font-size:12px;white-space:nowrap">' + human2(b.at) + '</span>' +
        '<button class="btn sm" data-abanun="' + esc2(b.id) + '">Разбан</button></div>'
    }).join('')
  }
  function loadAccountBans() {
    fetch('/v2/admin/account-bans').then(function (r) {
      if (r.status === 401) return
      return r.json().then(function (d) { renderAccountBans(d.bans || []) })
    }).catch(function () {})
  }
  var abanAdd = document.getElementById('abanAdd')
  if (abanAdd) abanAdd.onclick = function () {
    var nick = document.getElementById('abanNick').value.trim()
    var reason = document.getElementById('abanReason').value.trim()
    if (!nick) { msg('Введи ник'); return }
    abanAdd.disabled = true
    fetch('/v2/admin/ban-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nick, reason: reason })
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) { msg(d.message || 'Не получилось'); return }
        msg('Аккаунт забанен: ' + nick)
        document.getElementById('abanNick').value = ''
        document.getElementById('abanReason').value = ''
        loadAccountBans()
        loadUsers()
      })
    }).catch(function () { msg('Ошибка сети') }).then(function () { abanAdd.disabled = false })
  }
  var abanNickEl = document.getElementById('abanNick')
  if (abanNickEl) abanNickEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' && abanAdd) abanAdd.onclick() })
  loadAccountBans()

  function reqInCat(r) {
    if (reqCat === 'accepted') return r.status === 'accepted'
    if (reqCat === 'denied') return r.status === 'denied'
    return r.status === 'pending'
  }
  function renderReqs(list) {
    var el = document.getElementById('loginReqs')
    if (!el) return
    lastReqs = list
    var shown = list.filter(reqInCat)
    if (!shown.length) { el.innerHTML = '<p style="color:var(--faint);font-size:13px;padding:10px 0">В этой категории пусто.</p>'; return }
    el.innerHTML = shown.map(function (r) {
      var who = r.nickname ? esc2(r.nickname) : (r.discordName ? esc2(r.discordName) : 'Не определён')
      var who2 = r.nickname && r.discordName ? ' <span style="color:var(--faint)">· ' + esc2(r.discordName) + '</span>' : ''
      var ava = r.avatarUrl ? '<img src="' + esc2(r.avatarUrl) + '" style="width:28px;height:28px;border-radius:50%;flex:none" />' : '<span style="width:28px;height:28px;border-radius:50%;background:var(--line);flex:none"></span>'
      var stCls, stTxt
      if (r.status === 'accepted') { stCls = 'ok'; stTxt = 'принято' }
      else if (r.status === 'denied') { stCls = 'no'; stTxt = 'отклонено' }
      else { stCls = 'wait'; stTxt = 'ждёт решения' }
      var acts = r.status === 'pending'
        ? '<button class="btn sm" data-approve="' + esc2(r.deviceCode) + '" style="margin-right:8px">Принять</button><button class="btn sm danger" data-deny="' + esc2(r.deviceCode) + '">Отклонить</button>'
        : ''
      return '<div style="display:flex;gap:12px;align-items:center;padding:12px 4px">' + ava +
        '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:700">' + who + who2 + '</div>' +
        '<div style="color:var(--faint);font-size:12px">Код ' + esc2(r.userCode || '') + ' · ' + human2(r.createdAt) + '</div></div>' +
        '<span class="req-st ' + stCls + '">' + stTxt + '</span>' +
        (acts ? '<span style="white-space:nowrap">' + acts + '</span>' : '') + '</div>'
    }).join('')
  }
  function loadReqs() {
    fetch('/v2/admin/login-requests').then(function (r) {
      if (r.status === 401) return
      return r.json().then(function (d) {
        var reqs = d.requests || []
        setCount('ctAppeals', reqs.filter(function (x) { return x.status === 'pending' }).length)
        renderReqs(reqs)
      })
    }).catch(function () {})
  }
  loadReqs()
  setInterval(loadReqs, 3000)

  function renderAdmins(list) {
    var el = document.getElementById('admList')
    setCount('ctAdmins', list.length)
    if (!el) return
    if (!list.length) { el.innerHTML = '<p style="color:var(--faint);font-size:13px">Никого нет. Выдай доступ по нику игрока.</p>'; return }
    el.innerHTML = list.map(function (a) {
      return '<div style="display:flex;gap:10px;align-items:center;padding:8px 2px;border-top:1px solid var(--line)">' +
        '<b style="font-size:13.5px">' + esc2(a.nickname || a.discordName || a.discordId) + '</b>' +
        (a.discordName && a.nickname ? '<span style="color:var(--faint);font-size:12.5px">' + esc2(a.discordName) + '</span>' : '') +
        '<span style="flex:1"></span>' +
        '<button class="btn sm danger" data-remadm="' + esc2(a.discordId) + '">Убрать</button></div>'
    }).join('')
  }
  function loadAdmins() {
    fetch('/v2/admin/admins').then(function (r) {
      if (r.status === 401) return
      return r.json().then(function (d) { renderAdmins(d.admins || []) })
    }).catch(function () {})
  }
  var admAdd = document.getElementById('admAdd')
  if (admAdd) admAdd.onclick = function () {
    var nick = document.getElementById('admNick').value.trim()
    if (!nick) { msg('Введи ник'); return }
    admAdd.disabled = true
    fetch('/v2/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nick })
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) { msg(d.message || 'Не получилось'); return }
        msg('Доступ выдан: ' + nick)
        document.getElementById('admNick').value = ''
        loadAdmins()
      })
    }).catch(function () { msg('Ошибка сети') }).then(function () { admAdd.disabled = false })
  }
  var admNickEl = document.getElementById('admNick')
  if (admNickEl) admNickEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' && admAdd) admAdd.onclick() })
  loadAdmins()
  function loadUsers() {
    fetch('/v2/admin/users').then(function (r) {
      if (r.status === 401) { msg('Сессия истекла — перезайди под паролем.'); location.href = '/admin'; return }
      return r.json().then(function (d) { render(d.users || []); renderDon(d.users || []); renderRanks(d.users || []) })
    }).catch(function () { msg('Ошибка сети') })
  }
  loadUsers()
  var donEl = document.getElementById('donList')
  var qDonEl = document.getElementById('qDon')
  if (qDonEl) qDonEl.addEventListener('input', function () { renderDon(lastUsers) })
  var ranksEl = document.getElementById('ranksList')
  var qRanksEl = document.getElementById('qRanks')
  if (qRanksEl) qRanksEl.addEventListener('input', function () { renderRanks(lastUsers) })
  var RANK_NAMES = { owner: 'Owner', admin: 'Admin', moder: 'Moder', tester: 'Tester' }
  function avaTag(u, size) {
    return u.avatarUrl
      ? '<img class="ph" src="' + esc2(u.avatarUrl) + '" style="width:' + size + 'px;height:' + size + 'px" />'
      : '<span class="ph off" style="width:' + size + 'px;height:' + size + 'px"></span>'
  }
  function renderDon(list) {
    lastUsers = list
    if (!donEl) return
    setCount('ctDon', list.length)
    var q = (qDonEl ? qDonEl.value.trim().toLowerCase() : '')
    var shown = q
      ? list.filter(function (u) { return String(u.nickname || '').toLowerCase().indexOf(q) !== -1 || String(u.id || '').indexOf(q) !== -1 })
      : list
    if (!shown.length) { donEl.innerHTML = '<p style="color:var(--faint);font-size:13px;padding:10px 0">' + (q ? 'Никого не найдено.' : 'Пока никого нет.') + '</p>'; return }
    var dayChips = [7, 14, 30, 90, 180, 365].map(function (d) {
      return '<button type="button" class="g-chip' + (d === 30 ? ' on' : '') + '" data-v="' + d + '">' + d + 'д</button>'
    }).join('')
    donEl.innerHTML = shown.map(function (u) {
      var active = u.novaUntil > Date.now()
      return '<div class="adm-person">' +
        '<div class="ph-wrap">' + avaTag(u, 44) + '</div>' +
        '<div class="who">' +
        '<b>' + esc2(u.nickname) + '</b>' +
        '<span class="pid">#' + u.id + '</span>' +
        '<span class="pill' + (active ? ' hot' : '') + '">' + (active ? 'Nova · до ' + human(u.novaUntil / 1000) : 'без подписки') + '</span>' +
        '</div>' +
        '<div class="grant nova">' +
        '<div class="grant-cap"><svg class="ic"><use href="#ic-gift"/></svg>Подписка Nova</div>' +
        '<div class="grant-field">' +
        '<span class="g-lab">Срок</span>' +
        '<div class="chip-set">' + dayChips + '</div>' +
        '</div>' +
        '<div class="grant-acts">' +
        '<button class="btn sm" data-don="' + u.id + '">Выдать</button>' +
        (active ? '<button class="btn sm danger" data-don-remove="' + u.id + '">Снять</button>' : '') +
        '</div></div></div>'
    }).join('')
  }
  var RANK_COLOR = { owner: '#ffd83d', admin: '#ff5f57', moder: '#7dff6b', tester: '#6be8ff' }
  function rankChipsFor(u) {
    var cur = u.roles && u.roles[0]
    return ['owner', 'admin', 'moder', 'tester'].map(function (r) {
      return '<button type="button" class="g-chip rk" data-v="' + r + '" style="--cc:' + RANK_COLOR[r] + '"' + (cur === r ? ' on' : '') + '>' + RANK_NAMES[r] + '</button>'
    }).join('')
  }
  function rankLabel(u) {
    var r = u.roles && u.roles[0]
    return r ? (RANK_NAMES[r] || r) : 'Обычный игрок'
  }
  function renderRanks(list) {
    lastUsers = list
    if (!ranksEl) return
    setCount('ctRanks', list.length)
    var q = (qRanksEl ? qRanksEl.value.trim().toLowerCase() : '')
    var shown = q
      ? list.filter(function (u) { return String(u.nickname || '').toLowerCase().indexOf(q) !== -1 || String(u.id || '').indexOf(q) !== -1 })
      : list
    if (!shown.length) { ranksEl.innerHTML = '<p style="color:var(--faint);font-size:13px;padding:10px 0">' + (q ? 'Никого не найдено.' : 'Пока никого нет.') + '</p>'; return }
    ranksEl.innerHTML = shown.map(function (u) {
      var r = u.roles && u.roles[0]
      return '<div class="adm-person">' +
        '<div class="ph-wrap">' + avaTag(u, 44) + '</div>' +
        '<div class="who">' +
        '<b>' + esc2(u.nickname) + '</b>' +
        '<span class="pid">#' + u.id + '</span>' +
        '<span class="pill' + (r ? ' hot' : '') + '">' + rankLabel(u) + '</span>' +
        '</div>' +
        '<div class="grant crown">' +
        '<div class="grant-cap"><svg class="ic"><use href="#ic-crown"/></svg>Ранг игрока</div>' +
        '<div class="grant-field">' +
        '<span class="g-lab">Ранг</span>' +
        '<div class="chip-set">' + rankChipsFor(u) + '</div>' +
        '</div>' +
        '<div class="grant-acts">' +
        '<button class="btn sm" data-rank-set="' + u.id + '">Выдать</button>' +
        (r ? '<button class="btn sm danger" data-rank-remove="' + u.id + '">Снять</button>' : '') +
        '</div></div></div>'
    }).join('')
  }
  document.addEventListener('click', function (e) {
    var cip = e.target.closest('.copy-ip')
    if (cip) {
      var cipVal = cip.getAttribute('data-ip')
      function copied() { msg('IP скопирован: ' + cipVal) }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cipVal).then(copied).catch(copied)
      } else copied()
      return
    }
    var gchip = e.target.closest('.g-chip')
    if (gchip) {
      gchip.closest('.chip-set').querySelectorAll('.g-chip').forEach(function (c) { c.classList.remove('on') })
      gchip.classList.add('on')
      return
    }
    var dremove = e.target.closest('button[data-don-remove]')
    if (dremove) {
      var drid = dremove.getAttribute('data-don-remove')
      if (!confirm('Забрать Nova у игрока #' + drid + '?')) return
      dremove.disabled = true
      fetch('/v2/admin/set-nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: drid, days: 0 })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { msg(d.message || 'Не получилось'); return }
          msg('Nova #' + drid + ' снята')
          loadUsers()
        })
      }).catch(function () { msg('Ошибка сети') }).then(function () { dremove.disabled = false })
      return
    }
    var rset = e.target.closest('button[data-rank-set]')
    if (rset) {
      var rid = rset.getAttribute('data-rank-set')
      var rChip = rset.closest('.adm-person').querySelector('.chip-set .g-chip.on')
      var rv = (rChip && rChip.getAttribute('data-v')) || 'tester'
      rset.disabled = true
      fetch('/v2/admin/set-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rid, roles: [rv] })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { msg(d.message || 'Не получилось'); return }
          msg('Ранг #' + rid + ': ' + (d.roles.length ? (RANK_NAMES[d.roles[0]] || d.roles[0]) : 'снят'))
          loadUsers()
        })
      }).catch(function () { msg('Ошибка сети') }).then(function () { rset.disabled = false })
      return
    }
    var rremove = e.target.closest('button[data-rank-remove]')
    if (rremove) {
      var rrid = rremove.getAttribute('data-rank-remove')
      if (!confirm('Снять ранг у игрока #' + rrid + '? Станет «Обычный игрок».')) return
      rremove.disabled = true
      fetch('/v2/admin/set-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rrid, roles: [] })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { msg(d.message || 'Не получилось'); return }
          msg('Ранг #' + rrid + ' снят — обычный игрок')
          loadUsers()
        })
      }).catch(function () { msg('Ошибка сети') }).then(function () { rremove.disabled = false })
      return
    }
    var don = e.target.closest('button[data-don]')
    if (don) {
      var did = don.getAttribute('data-don')
      var donRow = don.closest('.adm-person')
      var dit = 'Nova'
      var dChip = donRow.querySelector('.chip-set .g-chip.on')
      var dDays = Math.floor(Number(dChip && dChip.getAttribute('data-v'))) || 0
      don.disabled = true
      fetch('/v2/admin/set-nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: did, days: dDays })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { msg(d.message || 'Не получилось'); return }
          msg('#' + did + ' ' + dit + ': ' + (d.novaUntil ? 'до ' + human(d.novaUntil / 1000) : 'снята'))
          loadUsers()
        })
      }).catch(function () { msg('Ошибка сети') }).then(function () { don.disabled = false })
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
    var ab = e.target.closest('button[data-abanun]')
    if (ab) {
      var abId = ab.getAttribute('data-abanun')
      if (!confirm('Разбанить аккаунт #' + abId + '?')) return
      fetch('/v2/admin/unban-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: abId })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { msg(d.message || 'Не получилось'); return }
          msg('Аккаунт #' + abId + ' разбанен')
          loadAccountBans()
          loadUsers()
        })
      }).catch(function () { msg('Ошибка сети') })
      return
    }
    var ap = e.target.closest('button[data-approve],button[data-deny]')
    if (ap) {
      var apCode = ap.getAttribute('data-approve') || ap.getAttribute('data-deny')
      var apAct = ap.hasAttribute('data-approve') ? 'approve' : 'deny'
      if (apAct === 'approve') {
        if (!confirm('Принять обжалование? Бан с аккаунта будет снят автоматически.')) return
      } else if (!confirm('Отклонить обжалование? Бан останется.')) return
      fetch('/v2/admin/login-' + apAct, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceCode: apCode })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { msg(d.message || 'Не получилось'); return }
          msg(apAct === 'approve' ? 'Обжалование принято — бан снят' : 'Обжалование отклонено')
          loadReqs()
          loadUsers()
          loadAccountBans()
        })
      }).catch(function () { msg('Ошибка сети') })
      return
    }
    var ra = e.target.closest('button[data-remadm]')
    if (ra) {
      var raDiscord = ra.getAttribute('data-remadm')
      if (!confirm('Убрать этого администратора?')) return
      fetch('/v2/admin/admins/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId: raDiscord })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { msg(d.message || 'Не получилось'); return }
          msg('Доступ убран')
          loadAdmins()
        })
      }).catch(function () { msg('Ошибка сети') })
      return
    }
    var b = e.target.closest('button[data-a]')
    if (!b) return
    var uid = b.getAttribute('data-uid')
    var act = b.getAttribute('data-a')
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
