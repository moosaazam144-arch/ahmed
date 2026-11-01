/* =========================================================
   APPS — edit this array to add / change apps.
   status: 'live' (shows ● LIVE + Google Play button) or 'soon'.
   shots: screenshot URLs (first = front phone, second = back phone).
   art:   used when there are no shots ('utility' | 'games').
   ========================================================= */
const APPS = [
  {
    name: 'FunZone Kids 3D',
    status: 'live',
    link: 'https://play.google.com/store/apps/details?id=com.aistudio.funzonekids.qzxwvb',
    icon: 'https://play-lh.googleusercontent.com/_368htUxyBUdLcHFtA6O07w_5B5HEmj1S-vOFWbknIyqQEnYxm4OrBuGBQ-i-giXAWOPDwf_8ysprvdCckEtng=w192-h192',
    shots: ['https://play-lh.googleusercontent.com/3ptNu0Ite32FuwIy3qnvZXaYXzlCrr24L7XvalvwW-tajkQinP1i91gUOZt9Yx8WpYsMKoi-17oURnOsJzw=w540-h1200', 'https://play-lh.googleusercontent.com/jFeyL5W4BkCDLU96__Kf6LvQIFYvN2O6DO3-E1kN8zZFSB5Upss7WfqTsDS0xcCyTo-ro50vKRDlG9sEQTZ2ODc=w540-h1200'],
    desc: 'A colourful 3D world for kids: playful games, animals and adventures in a simple, kid-friendly app.',
    tags: ['Android', '3D', 'Kids'],
    meta: 'Published on Google Play',
    accent: ['#38bdf8', '#facc15']
  },
  {
    name: 'Utility Box',
    status: 'soon',
    link: '',
    icon: '',
    shots: [],
    art: 'utility',
    desc: 'Every everyday tool in one place: calculator, unit converter, flashlight, QR scanner and more.',
    tags: ['Android', 'Tools', 'Offline'],
    meta: 'Launching on Google Play',
    accent: ['#2ee6a6', '#4ff3ff']
  },
  {
    name: 'NEXO Mini Games',
    status: 'soon',
    link: '',
    icon: '',
    shots: [],
    art: 'games',
    desc: 'A pocket arcade: quick, addictive mini games with scores, levels and daily challenges.',
    tags: ['Android', 'Games', 'Arcade'],
    meta: 'Launching on Google Play',
    accent: ['#ff5cd6', '#8b5cff']
  }
];

(function () {
'use strict';
const D = document;
const host = D.getElementById('appStack');
if (!host) return;
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00d7fe" d="M3.6 1.8 13.4 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1z"/><path fill="#ffce00" d="m16.9 15.5-3.5-3.5 3.5-3.5 4 2.3c1.1.6 1.1 1.8 0 2.4z"/><path fill="#ff3a44" d="M16.9 15.5 13.4 12 3.6 22.2c.4.2.9.2 1.4-.1z"/><path fill="#00f076" d="M3.6 1.8 13.4 12l3.5-3.5L5 1.9c-.5-.3-1-.3-1.4-.1z"/></svg>';

function art(kind, a) {
  if (kind === 'utility') {
    const t = [['±', 'Calc'], ['°C', 'Convert'], ['◐', 'Torch'], ['QR', 'Scan'], ['%', 'Discount'], ['kg', 'BMI'], ['↻', 'Timer'], ['Aa', 'Notes'], ['⌖', 'Compass']];
    return '<div class="ua"><div class="ua__top"><b>Utility Box</b><i>9 tools</i></div>' +
      '<div class="ua__search">Search tools…</div><div class="ua__grid">' +
      t.map((x, i) => `<div class="ua__t" style="--h:${(i * 37) % 360}"><span>${x[0]}</span><em>${x[1]}</em></div>`).join('') +
      '</div><div class="ua__calc"><div class="ua__disp"><small>128 × 4.5</small>576</div><div class="ua__keys">' +
      ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '='].map((k) => `<span${'÷×='.includes(k) ? ' class="op"' : ''}>${k}</span>`).join('') + '</div></div></div>';
  }
  const g = [['Snake', '#22c55e', '#065f46'], ['2048', '#f59e0b', '#7c2d12'], ['Tic Tac', '#38bdf8', '#1e3a8a'], ['Memory', '#f472b6', '#701a75'], ['Bricks', '#a78bfa', '#312e81'], ['Flappy', '#facc15', '#854d0e']];
  return '<div class="ga"><div class="ga__top"><b>NEXO</b><span>★ 2,450</span></div>' +
    '<div class="ga__hero"><small>DAILY CHALLENGE</small><strong>Beat 12,000</strong><span class="ga__play">PLAY ▶</span></div>' +
    '<div class="ga__grid">' + g.map((x) => `<div class="ga__c" style="--a:${x[1]};--b:${x[2]}"><i></i><em>${x[0]}</em></div>`).join('') + '</div>' +
    '<div class="ga__bar"><span class="on">Home</span><span>Games</span><span>Scores</span></div></div>';
}

function phone(inner, cls) { return `<div class="aphone ${cls || ''}"><div class="aphone__screen">${inner}</div><span class="aphone__notch"></span></div>`; }

host.innerHTML = APPS.map((a, i) => {
  const live = a.status === 'live' && a.link;
  const front = a.shots && a.shots[0] ? `<img src="${esc(a.shots[0])}" alt="${esc(a.name)} app screenshot" decoding="async" referrerpolicy="no-referrer">` : art(a.art, a);
  const back = a.shots && a.shots[1] ? `<img src="${esc(a.shots[1])}" alt="" decoding="async" referrerpolicy="no-referrer">` : '';
  const icon = a.icon ? `<img class="asheet__icon" src="${esc(a.icon)}" alt="" width="64" height="64" referrerpolicy="no-referrer">` : `<span class="asheet__icon asheet__icon--txt">${esc(a.name.split(' ').map((w) => w[0]).join('').slice(0, 2))}</span>`;
  const badge = live ? '<span class="live live--inline"><i></i>LIVE ON PLAY STORE</span>' : '<span class="soon"><i></i>COMING SOON</span>';
  const btn = live
    ? `<a class="gplay magnetic" href="${esc(a.link)}" target="_blank" rel="noopener" data-cursor="Open ↗">${PLAY}<span><small>GET IT ON</small>Google Play</span></a>`
    : `<span class="gplay gplay--off" aria-disabled="true">${PLAY}<span><small>COMING SOON TO</small>Google Play</span></span>`;
  return `<article class="asheet" style="--a1:${a.accent[0]};--a2:${a.accent[1]};z-index:${i + 1}" aria-label="${esc(a.name)}">
    <div class="asheet__glow"></div>
    <div class="asheet__media">${back ? phone(back, 'aphone--back') : ''}${phone(front, 'aphone--front')}</div>
    <div class="asheet__body">
      <div class="asheet__row"><span class="asheet__n">${String(i + 1).padStart(2, '0')} / ${String(APPS.length).padStart(2, '0')}</span>${badge}</div>
      <div class="asheet__title">${icon}<div><h3>${esc(a.name)}</h3><p class="asheet__meta">${esc(a.meta || '')}</p></div></div>
      <p class="asheet__desc">${esc(a.desc)}</p>
      <div class="proj__tags asheet__tags">${(a.tags || []).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      ${btn}
    </div>
    <div class="asheet__shade"></div>
  </article>`;
}).join('');
const cnt = D.getElementById('appCount'); if (cnt) cnt.textContent = APPS.length + ' APPS';

/* ---------- WEBSITES word: fit to width ---------- */
const word = D.getElementById('webWord');
function fitWord() {
  if (!word) return;
  word.style.fontSize = '';
  const g = word.querySelector('.webword__ghost');
  const avail = word.clientWidth, w = g.offsetWidth;
  if (!avail || !w) return;
  const fs = parseFloat(getComputedStyle(word).fontSize);
  word.style.fontSize = Math.min(fs * avail / w * 0.97, 230).toFixed(1) + 'px';
}
fitWord();
if (D.fonts && D.fonts.ready) D.fonts.ready.then(() => { fitWord(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
let rzT; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(fitWord, 120); });

/* ---------- stacking sheets ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!(window.gsap && window.ScrollTrigger) || reduce) { D.documentElement.classList.add('apps-flat'); return; }
gsap.registerPlugin(ScrollTrigger);
const sheets = gsap.utils.toArray('#appStack .asheet');
const pin = D.getElementById('appsPin');
const n = sheets.length;
gsap.set(sheets.slice(1), { yPercent: 112 });
const tl = gsap.timeline({ defaults: { ease: 'none' } });
for (let i = 1; i < n; i++) {
  const at = i - 1;
  tl.to(sheets[i], { yPercent: 0, duration: 1, ease: 'power2.out' }, at);
  for (let j = 0; j < i; j++) {
    const depth = i - j;
    tl.to(sheets[j], { scale: 1 - depth * 0.06, yPercent: -depth * 4.5, duration: 1, ease: 'power2.out' }, at);
    tl.to(sheets[j].querySelector('.asheet__shade'), { opacity: Math.min(0.62, depth * 0.38), duration: 1 }, at);
  }
}
tl.to({}, { duration: 0.35 }); // short hold on the last app
ScrollTrigger.create({
  trigger: pin, start: 'top top', end: () => '+=' + Math.round(innerHeight * (n - 1 + 0.35) * 0.95),
  pin: true, scrub: 0.6, animation: tl, anticipatePin: 1, invalidateOnRefresh: true
});
/* first sheet rises into place as the section arrives */
gsap.from(sheets[0], { yPercent: 18, scale: 0.94, opacity: 0, ease: 'power2.out', scrollTrigger: { trigger: pin, start: 'top 95%', end: 'top 15%', scrub: 0.6 } });
/* phones float */
D.querySelectorAll('.aphone--front').forEach((p, i) => gsap.to(p, { y: -10, duration: 2.6 + i * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

/* ---------- WEBSITES word reveal ---------- */
if (word) {
  const letters = word.querySelectorAll('.ww > span');
  gsap.fromTo(letters, { yPercent: 115, rotate: 8 }, { yPercent: 0, rotate: 0, ease: 'power3.out', stagger: 0.07,
    scrollTrigger: { trigger: word, start: 'top 92%', end: 'top 45%', scrub: 0.7 } });
  gsap.fromTo(word.querySelector('.webword__ghost'), { xPercent: -6, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: word, start: 'top 90%', end: 'top 40%', scrub: true } });
}
addEventListener('load', () => ScrollTrigger.refresh());
})();
