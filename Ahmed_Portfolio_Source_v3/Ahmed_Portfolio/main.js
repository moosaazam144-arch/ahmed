
(function(){
'use strict';
const D = document, H = D.documentElement;
const S = (window.__stage = window.__stage || { morph: 0, fade: 1, mode: 'hero', ready: false });
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const mob = () => innerWidth < 760;
const hasG = !!(window.gsap && window.ScrollTrigger);
if (!hasG) H.classList.add('no-gsap');
if (hasG) gsap.registerPlugin(ScrollTrigger);
D.body.classList.add('loading');

/* ---------- Lenis ---------- */
let lenis = null;
if (window.Lenis && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, syncTouch: false });
  if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { const r = (t) => { lenis.raf(t); requestAnimationFrame(r); }; requestAnimationFrame(r); }
  lenis.stop();
}
D.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const el = D.querySelector(id); if (!el) return;
  e.preventDefault(); H.classList.remove('menu-open'); D.getElementById('burger').setAttribute('aria-expanded', 'false');
  if (lenis) lenis.scrollTo(el, { offset: id === '#hero' ? 0 : -10 }); else el.scrollIntoView({ behavior: 'smooth' });
}));

/* ---------- split helpers ---------- */
function splitWords(el, cls) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w) => cls === 'rw' ? `<span class="rw">${w}</span>` : `<span class="w"><span>${w}</span></span>`).join(' ');
  return el.querySelectorAll(cls === 'rw' ? '.rw' : '.w>span');
}
const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}#$%&*01';
function scramble(el, delay) {
  const txt = el.dataset.text, len = txt.length; let f = 0; const total = 26 + len * 2;
  el.textContent = '';
  setTimeout(function tick() {
    let out = '';
    for (let i = 0; i < len; i++) {
      const rev = f > 8 + i * 2;
      out += rev || txt[i] === ' ' ? txt[i] : CH[(Math.random() * CH.length) | 0];
    }
    el.textContent = out; f++;
    if (f <= total) setTimeout(tick, 32); else el.textContent = txt;
  }, delay);
}

/* ---------- loader ---------- */
const bar = D.getElementById('loaderBar'), num = D.getElementById('loaderNum'), loader = D.getElementById('loader');
let p = 0, t0 = performance.now();
(function load() {
  const target = S.ready ? 100 : Math.min(90, (performance.now() - t0) / 14);
  p += (target - p) * 0.18;
  bar.style.width = p + '%'; num.textContent = String(Math.round(p)).padStart(2, '0');
  if (p > 99.4 || performance.now() - t0 > 6000) return intro();
  requestAnimationFrame(load);
})();

function intro() {
  loader.classList.add('done'); D.body.classList.remove('loading'); if (lenis) lenis.start();
  S.fade = 1;
  D.querySelectorAll('.scramble').forEach((el, i) => scramble(el, 250 + i * 180));
  if (hasG) {
    gsap.from('.hero__title .line > span', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
    gsap.from(['.eyebrow', '.hero__sub', '.hero__ctas', '.hero__hint', '.hero__meta', '.hero__scroll'], { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.5 });
  }
}

/* ---------- stage scroll mapping ---------- */
const about = D.getElementById('about'), stack = D.getElementById('stack'), contact = D.getElementById('contact'), hint = D.getElementById('hint');
const cl = (v) => Math.max(0, Math.min(1, v));
function stage() {
  const y = scrollY, vh = innerHeight;
  const aT = about.offsetTop, sT = stack.offsetTop, cT = contact.offsetTop;
  let morph = cl((y - vh * 0.08) / (aT - vh * 0.08 - vh * 0.05)) * 2; // 0 statue -> 1 cloud -> 2 devices
  let fade = 1 - cl((y - (sT - vh * 0.55)) / (vh * 0.5));
  if (mob() && morph > 1.2) fade *= 1 - 0.8 * cl((y - aT + vh * 0.15) / (vh * 0.45));
  let mode = morph > 1 ? 'about' : 'hero';
  const c = cl((y - (cT - vh * 1.05)) / (vh * 0.75));
  if (c > 0) { fade = Math.max(fade, c * (mob() ? 0.55 : 1)); morph = 2 - c * 2; mode = 'contact'; }
  S.morph = morph; S.fade = loader.classList.contains('done') ? fade : 0; S.mode = mode;
  if (hint) hint.style.opacity = y > vh * 0.15 ? 0 : '';
}
addEventListener('scroll', stage, { passive: true });
addEventListener('resize', stage);
stage();

/* ---------- nav ---------- */
const nav = D.getElementById('nav'); let ly = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('scrolled', y > 40);
  nav.classList.toggle('hidden', y > ly && y > 400 && !H.classList.contains('menu-open'));
  ly = y;
}, { passive: true });
D.getElementById('burger').addEventListener('click', (e) => {
  const o = H.classList.toggle('menu-open'); e.currentTarget.setAttribute('aria-expanded', o);
  if (lenis) o ? lenis.stop() : lenis.start();
});

/* ---------- clock ---------- */
const ck = D.getElementById('clock');
function tick() { try { ck.textContent = 'PKT ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' }); } catch (e) {} }
tick(); setInterval(tick, 30000);

/* ---------- scroll animations ---------- */
if (hasG) {
  // word-by-word about
  D.querySelectorAll('.reveal-words').forEach((el) => {
    const w = splitWords(el, 'rw');
    gsap.to(w, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: true } });
  });
  D.querySelectorAll('.split').forEach((el) => {
    const w = splitWords(el, 'w');
    gsap.from(w, { yPercent: 115, rotate: 4, duration: 1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.utils.toArray('.about__cols p, .svc, .proj, .quote, .stat, .step, .form, .contact__sub, .contact__btns').forEach((el, i) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, delay: (i % 3) * 0.08 });
  });
  // marquee speed skew with scroll velocity
  const tracks = D.querySelectorAll('.marquee__track');
  ScrollTrigger.create({ trigger: '#stack', start: 'top bottom', end: 'bottom top', onUpdate: (s) => {
    const v = gsap.utils.clamp(-12, 12, s.getVelocity() / 250);
    tracks.forEach((t) => gsap.to(t, { skewX: -v, duration: 0.4, overwrite: true }));
  } });
  // timeline
  const fill = D.getElementById('tlFill'), steps = D.querySelectorAll('.step');
  ScrollTrigger.create({ trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: true, onUpdate: (s) => {
    const p = s.progress;
    fill.style.transform = mob() ? `scaleY(${p})` : `scaleX(${p})`;
    steps.forEach((st, i) => st.classList.toggle('on', p >= i / steps.length + 0.02));
  } });
  // counters
  D.querySelectorAll('[data-count]').forEach((el) => {
    const o = { v: 0 }, to = +el.dataset.count, suf = el.dataset.suffix || '';
    gsap.to(o, { v: to, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => (el.textContent = Math.round(o.v) + suf) });
  });
  // footer big text
  gsap.from('.foot__big', { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 40%', scrub: true } });
} else {
  D.querySelectorAll('[data-count]').forEach((el) => (el.textContent = el.dataset.count + (el.dataset.suffix || '')));
}

/* ---------- desktop pointer effects ---------- */
if (fine) {
  H.classList.add('has-cursor');
  const cur = D.getElementById('cursor'), dot = cur.querySelector('.cursor__dot'), ring = cur.querySelector('.cursor__ring'), lab = D.getElementById('cursorLabel');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; cur.classList.add('on'); mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
  (function loop() { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  D.querySelectorAll('a,button,input,select,textarea').forEach((el) => {
    el.addEventListener('mouseenter', () => cur.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
  });
  D.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => { lab.textContent = el.dataset.cursor; cur.classList.add('is-label'); });
    el.addEventListener('mouseleave', () => cur.classList.remove('is-label'));
  });
  // magnetic
  D.querySelectorAll('.magnetic').forEach((el) => {
    const inner = el.querySelector('span');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.3}px,${y * 0.4}px)`; if (inner) inner.style.transform = `translate(${x * 0.15}px,${y * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)'; el.style.transform = ''; if (inner) { inner.style.transition = 'transform .6s'; inner.style.transform = ''; } setTimeout(() => { el.style.transition = ''; }, 600); });
  });
  // tilt
  D.querySelectorAll('.tilt').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = 'transform .1s'; el.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 12}deg) translateZ(10px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1)'; el.style.transform = ''; });
  });
  // service spotlight
  D.querySelectorAll('.svc').forEach((el) => el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect(); el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
  }));
}

/* ---------- contact form → WhatsApp / email ---------- */
const WA_NUM = '923217441543', EMAIL = 'moosaazam144@gmail.com';
function formText(f) {
  return 'Hi Ahmed! I\'m ' + f.name.value.trim() + '.\n' + 'Project: ' + f.type.value + '\n' +
    (f.msg.value.trim() ? 'Details: ' + f.msg.value.trim() + '\n' : '') + 'Reach me at: ' + f.contact.value.trim();
}
function formOk(f, n) {
  if (!f.name.value.trim() || !f.contact.value.trim()) { n.style.color = '#ff7a9a'; n.textContent = 'Please add your name and a way to reach you.'; return false; }
  n.style.color = ''; return true;
}
function go(url, newTab) { const w = newTab ? window.open(url, '_blank') : null; if (w) { try { w.opener = null; } catch (_) {} } else window.location.href = url; }
D.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault(); const f = e.currentTarget, n = D.getElementById('formNote');
  if (!formOk(f, n)) return;
  n.textContent = 'Opening WhatsApp…';
  go('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(formText(f)), true);
});
D.getElementById('formMail').addEventListener('click', () => {
  const f = D.getElementById('form'), n = D.getElementById('formNote');
  if (!formOk(f, n)) return;
  n.textContent = 'Opening your email app…';
  go('mailto:' + EMAIL + '?subject=' + encodeURIComponent('Project enquiry — ' + f.type.value) + '&body=' + encodeURIComponent(formText(f)), false);
});
})();
