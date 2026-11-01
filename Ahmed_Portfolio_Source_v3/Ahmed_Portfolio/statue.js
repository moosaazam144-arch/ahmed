
(function(){
const THREE = window.THREE;
if (!THREE) { document.documentElement.classList.add('no-webgl'); (window.__stage = window.__stage || {}).ready = true; return; }

const canvas = document.getElementById('stage');
const S = (window.__stage = window.__stage || { morph: 0, fade: 1, mode: 'hero', ready: false });
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const small = Math.min(innerWidth, innerHeight) < 700;
const cores = navigator.hardwareConcurrency || 4;
const MAX = 36000;
const N = small ? (cores <= 4 ? 13000 : 19000) : (cores <= 4 ? 24000 : 34000);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
} catch (e) { document.documentElement.classList.add('no-webgl'); S.ready = true; return; }
const PR = Math.min(window.devicePixelRatio || 1, small ? 1.6 : 1.75);
renderer.setPixelRatio(PR);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 6.2);
const group = new THREE.Group();
scene.add(group);

// ---------- devices target (sampled from a 2D drawing) ----------
function devicesTarget(n) {
  const c = document.createElement('canvas'); c.width = 560; c.height = 340;
  const g = c.getContext('2d');
  g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineJoin = 'round'; g.lineCap = 'round';
  const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  // laptop
  g.lineWidth = 7; rr(40, 40, 330, 210, 14); g.stroke();
  g.lineWidth = 5; g.beginPath(); g.moveTo(10, 268); g.lineTo(400, 268); g.lineTo(380, 286); g.lineTo(30, 286); g.closePath(); g.stroke();
  g.font = '800 92px Syne, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('</>', 205, 148);
  g.lineWidth = 4; [[70,72,90],[70,226,150],[250,226,90]].forEach(([x,y,w]) => { g.beginPath(); g.moveTo(x,y); g.lineTo(x+w,y); g.stroke(); });
  // phone
  g.lineWidth = 7; rr(430, 70, 110, 216, 22); g.stroke();
  g.lineWidth = 5; g.beginPath(); g.moveTo(470, 88); g.lineTo(500, 88); g.stroke();
  g.globalAlpha = 1; rr(448, 112, 74, 58, 10); g.fill();
  g.lineWidth = 5; [[450,192,70],[450,210,50],[450,228,62]].forEach(([x,y,w]) => { g.beginPath(); g.moveTo(x,y); g.lineTo(x+w,y); g.stroke(); });
  g.beginPath(); g.arc(485, 262, 9, 0, Math.PI * 2); g.stroke();
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const px = [];
  for (let y = 0; y < c.height; y += 1) for (let x = 0; x < c.width; x += 1) if (d[(y * c.width + x) * 4 + 3] > 120) px.push(x, y);
  const out = new Float32Array(n * 3);
  const W = 3.6, H = W * c.height / c.width, cnt = px.length / 2;
  for (let i = 0; i < n; i++) {
    const k = (Math.random() * cnt) | 0;
    const x = px[k * 2] + Math.random() - 0.5, y = px[k * 2 + 1] + Math.random() - 0.5;
    out[i * 3] = (x / c.width - 0.5) * W;
    out[i * 3 + 1] = -(y / c.height - 0.5) * H;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.12 + (x > 400 ? 0.25 : 0);
  }
  return out;
}

function cloudTarget(n) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random(), v = Math.random(), r = 1.4 + Math.pow(Math.random(), 0.6) * 2.6;
    const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1);
    out[i * 3] = r * Math.sin(ph) * Math.cos(th) * 1.4;
    out[i * 3 + 1] = r * Math.cos(ph) * 0.8;
    out[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  return out;
}

// ---------- shaders ----------
const vert = `
attribute float aSeed; attribute float aGlow; attribute vec3 aNormal; attribute vec3 aColor;
uniform float uPhoto; uniform float uGain; uniform float uPS;
uniform float uTime; uniform float uSize; uniform float uMorph; uniform float uFade;
uniform vec3 uC1; uniform vec3 uC2;
varying vec3 vColor; varying float vAlpha;
void main(){
  vec3 p = position;
  float w = 1.0 - clamp(uMorph, 0.0, 1.0);
  p += aNormal * sin(uTime*1.3 + p.y*4.0 + aSeed*2.0) * 0.010 * w;
  p += vec3(sin(uTime*0.6+aSeed*40.0), cos(uTime*0.5+aSeed*31.0), sin(uTime*0.4+aSeed*17.0)) * (0.006 + 0.03*(1.0-w)*step(0.5, uMorph)*(1.0-step(1.5,uMorph)));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec3 n = normalize(normalMatrix * aNormal);
  vec3 vdir = normalize(-mv.xyz);
  float facing = dot(n, vdir);
  float light = clamp(dot(n, normalize(vec3(-0.7, 0.4, 0.6))), 0.0, 1.0);
  float rim = pow(1.0 - clamp(facing, 0.0, 1.0), 2.5);
  float shade = 0.22 + 2.2*pow(light,1.4) + 0.6*rim;
  float front = mix(0.12, 1.0, smoothstep(-0.05, 0.35, facing));
  shade = mix(0.85, shade, w); front = mix(1.0, front, w);
  float t = smoothstep(-1.3, 0.6, position.y + sin(aSeed*6.2831)*0.3);
  vec3 col = mix(uC2, uC1, t);
  col = mix(col, vec3(0.85, 0.97, 1.0), light*0.35*w);
  float lum = dot(aColor, vec3(0.299, 0.587, 0.114));
  vec3 duo = col * (0.18 + 1.9*lum) + vec3(0.9,0.95,1.0)*pow(lum,2.2)*0.5;
  vec3 pc = mix(aColor*1.25, col*(0.25+lum), 0.28) + col*0.10*(1.0-lum);
  vec3 portrait = mix(duo, pc, uPhoto);
  col = mix(col, portrait + mix(uC1, uC2, 0.35)*rim*0.9, w);
  shade = mix(shade, (0.75 + 0.55*light + 0.25*rim) * uGain, w);
  col = mix(col, vec3(1.0, 0.55, 0.95), clamp(aGlow, 0.0, 1.0)*0.75);
  vColor = col;
  vAlpha = shade * front * uFade * (1.0 + 0.6*aGlow);
  float sz = mix(0.6 + 0.9*fract(aSeed*13.7), (0.62 + 0.36*fract(aSeed*13.7)) * uPS, w);
  gl_PointSize = uSize * sz * (1.0 + aGlow*1.4) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const frag = `
varying vec3 vColor; varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(vColor, a * vAlpha);
}`;

const uniforms = {
  uTime: { value: 0 }, uSize: { value: (small ? 15 : 16) * PR }, uMorph: { value: 0 }, uFade: { value: 0 },
  uC1: { value: new THREE.Color('#4ff3ff') }, uC2: { value: new THREE.Color('#8b5cff') },
  uPhoto: { value: /[?&]c=glow/.test(location.search) ? 0 : (/[?&]c=photo/.test(location.search) ? 1 : 0.62) }, uGain: { value: small ? 0.62 : 0.78 }, uPS: { value: small ? 1.0 : 1.3 },
};

// ---------- dust + halo ring ----------
function makeDust() {
  const n = small ? 500 : 1100, g = new THREE.BufferGeometry();
  const p = new Float32Array(n * 3), s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const ring = i < n * 0.45;
    if (ring) { const a = Math.random() * Math.PI * 2, r = 1.75 + (Math.random() - 0.5) * 0.18; p[i*3] = Math.cos(a) * r; p[i*3+1] = (Math.random() - 0.5) * 0.05; p[i*3+2] = Math.sin(a) * r; }
    else { p[i*3] = (Math.random() - 0.5) * 14; p[i*3+1] = (Math.random() - 0.5) * 9; p[i*3+2] = (Math.random() - 0.5) * 8 - 2; }
    s[i] = Math.random();
  }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(s, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime, uFade: uniforms.uFade, uPR: { value: PR } },
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uPR; varying float vA;
      void main(){ vec3 p = position; p.y += sin(uTime*0.3 + aSeed*20.0)*0.08;
      vec4 mv = modelViewMatrix*vec4(p,1.0); vA = 0.25 + 0.75*abs(sin(uTime*0.8 + aSeed*30.0));
      gl_PointSize = uPR * (1.0 + 2.2*aSeed) * 5.0 / -mv.z; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uFade; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d); gl_FragColor = vec4(0.6,0.85,1.0, a*a*vA*0.55*uFade); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(g, m);
}
const dust = makeDust();
scene.add(dust);
const halo = dust; // ring is part of dust (first 45%)

// ---------- state ----------
let geo, base, cloud, dev, pos, off, vel, glow, nrm, points;
const ndc = new THREE.Vector2(9, 9);
let pointerActive = false, pointerT = 0;
const ray = new THREE.Raycaster();
const inv = new THREE.Matrix4();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const hit = new THREE.Vector3(), prevHit = new THREE.Vector3(), pv = new THREE.Vector3();
let hasPrev = false;

async function init() {
  if (!window.__STATUE_B64) throw new Error('statue data missing'); const bin = atob(window.__STATUE_B64); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); const buf = u8.buffer;
  const q = new Int16Array(buf, 0, MAX * 3), qn = new Int8Array(buf, MAX * 3 * 2, MAX * 3);
  const qc = new Uint8Array(buf, MAX * 3 * 3, MAX * 3);
  base = new Float32Array(N * 3); nrm = new Float32Array(N * 3); const colr = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) colr[i] = qc[i] / 255;
  const SC = 1.28;
  for (let i = 0; i < N * 3; i++) { base[i] = q[i] / 32767 * SC; nrm[i] = qn[i] / 127; }
  cloud = cloudTarget(N); dev = devicesTarget(N);
  pos = new Float32Array(N * 3); off = new Float32Array(N * 3); vel = new Float32Array(N * 3); glow = new Float32Array(N);
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) seed[i] = Math.random();
  // start exploded so the statue assembles on load
  for (let i = 0; i < N * 3; i++) off[i] = (cloud[i] - base[i]) * 1.0;
  pos.set(base);
  geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aNormal', new THREE.BufferAttribute(nrm, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colr, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aGlow', new THREE.BufferAttribute(glow, 1).setUsage(THREE.DynamicDrawUsage));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  points = new THREE.Points(geo, mat);
  group.add(points);
  S.ready = true; S.count = N;
  document.documentElement.classList.add('stage-ready');
}

// ---------- input ----------
let rotY = 0, rotX = 0, dragY = 0, dragX = 0, dragging = false, lx = 0, ly = 0, tiltX = 0, tiltY = 0;
const hero = document.getElementById('hero');
function setPointer(x, y) {
  ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
  pointerActive = true; pointerT = performance.now();
}
addEventListener('pointermove', (e) => {
  setPointer(e.clientX, e.clientY);
  if (dragging) { dragY += (e.clientX - lx) * 0.006; dragX += (e.clientY - ly) * 0.004; dragX = Math.max(-0.3, Math.min(0.3, dragX)); lx = e.clientX; ly = e.clientY; }
}, { passive: true });
addEventListener('pointerdown', (e) => {
  setPointer(e.clientX, e.clientY);
  if (hero && hero.contains(e.target) && !e.target.closest('a,button')) { dragging = true; lx = e.clientX; ly = e.clientY; hero.classList.add('is-drag'); }
}, { passive: true });
const endDrag = () => { dragging = false; hero && hero.classList.remove('is-drag'); hasPrev = false; };
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
document.addEventListener('pointerleave', () => { pointerActive = false; hasPrev = false; });
addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) setPointer(t.clientX, t.clientY); }, { passive: true });
addEventListener('touchend', () => { setTimeout(() => { pointerActive = false; hasPrev = false; }, 250); }, { passive: true });
if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    tiltY = Math.max(-1, Math.min(1, e.gamma / 35)) * 0.45;
    tiltX = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 40)) * 0.2;
  }, { passive: true });
}

// ---------- layout ----------
let gx = 0, gy = 0, gs = 1, tx = 0, ty = 0, ts = 1;
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
function layoutTarget() {
  const aspect = camera.aspect;
  const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const visW = visH * aspect;
  const mode = S.mode || 'hero';
  if (aspect > 1.05) {
    if (mode === 'about') { tx = visW * 0.25; ty = 0; ts = 0.9; }
    else if (mode === 'contact') { tx = -visW * 0.24; ty = -0.05; ts = 1.0; }
    else { tx = visW * 0.2; ty = -0.02; ts = 1.0; }
  } else {
    const fit = Math.min(1, visW / 3.3);
    if (mode === 'about') { tx = 0; ty = visH * 0.22; ts = fit * 0.95; }
    else if (mode === 'contact') { tx = 0; ty = visH * 0.18; ts = fit * 0.8; }
    else { tx = 0; ty = visH * 0.23; ts = fit * 0.98; }
  }
}
addEventListener('resize', resize);
resize();

// ---------- loop ----------
const clock = new THREE.Clock();
let morph = 0, fade = 0, last = performance.now();
const tmp = new THREE.Vector3();
function frame() {
  requestAnimationFrame(frame);
  const now = performance.now();
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = clock.getElapsedTime();
  const k = 1 - Math.pow(0.0015, dt);
  fade += ((S.ready ? S.fade : 0) - fade) * Math.min(1, dt * 4);
  uniforms.uFade.value = fade;
  if (fade < 0.01) { canvas.style.visibility = 'hidden'; return; }
  canvas.style.visibility = 'visible';
  uniforms.uTime.value = t;
  layoutTarget();
  gx += (tx - gx) * k * 0.6; gy += (ty - gy) * k * 0.6; gs += (ts - gs) * k * 0.6;
  group.position.set(gx, gy, 0); group.scale.setScalar(gs * (1 + Math.sin(t * 0.9) * 0.008));
  morph += (S.morph - morph) * Math.min(1, dt * 3.2);
  uniforms.uMorph.value = morph;
  const statueW = 1 - Math.min(1, morph);
  dragY = Math.max(-0.5, Math.min(0.5, dragY));
  rotY += ((Math.sin(t * 0.22) * 0.22 + dragY + tiltY * 0.6) * statueW + (dragY * 0.3 + Math.sin(t * 0.3) * 0.25) * (1 - statueW) - rotY) * k * 0.5;
  rotX += ((dragX + tiltX + Math.sin(t * 0.17) * 0.05) - rotX) * k * 0.5;
  if (!dragging) { dragY *= 0.995; }
  rotY = Math.max(-0.61, Math.min(0.61, rotY)); rotX = Math.max(-0.35, Math.min(0.35, rotX));
  if (window.__rotOverride != null) rotY = window.__rotOverride;
  group.rotation.set(rotX, rotY, 0);
  halo.rotation.y = t * 0.05;
  if (points) {
    group.updateMatrixWorld();
    inv.copy(group.matrixWorld).invert();
    const live = pointerActive && now - pointerT < (fine ? 1e9 : 1200);
    let ox = 0, oy = 0, oz = 0, dx = 0, dy = 0, dz = 1, pvx = 0, pvy = 0, pvz = 0;
    if (live) {
      ray.setFromCamera(ndc, camera);
      ray.ray.applyMatrix4(inv);
      ox = ray.ray.origin.x; oy = ray.ray.origin.y; oz = ray.ray.origin.z;
      dx = ray.ray.direction.x; dy = ray.ray.direction.y; dz = ray.ray.direction.z;
      if (ray.ray.intersectPlane(plane, hit)) {
        if (hasPrev) { pv.subVectors(hit, prevHit); if (pv.length() > 0.6) pv.set(0, 0, 0); pvx = pv.x; pvy = pv.y; pvz = pv.z; }
        prevHit.copy(hit); hasPrev = true;
      }
    }
    // morph weights
    const m = morph;
    const a1 = Math.min(1, Math.max(0, m)), a2 = Math.min(1, Math.max(0, m - 1));
    const R = 0.42, R2 = R * R;
    const spring = 0.045, damp = 0.86;
    for (let i = 0, j = 0; i < N; i++, j += 3) {
      // staggered morph per particle
      const sd = (i * 0.61803) % 1;
      const s1 = Math.min(1, Math.max(0, a1 * 1.6 - sd * 0.6));
      const s2 = Math.min(1, Math.max(0, a2 * 1.6 - sd * 0.6));
      let bx = base[j] + (cloud[j] - base[j]) * s1, by = base[j+1] + (cloud[j+1] - base[j+1]) * s1, bz = base[j+2] + (cloud[j+2] - base[j+2]) * s1;
      bx += (dev[j] - bx) * s2; by += (dev[j+1] - by) * s2; bz += (dev[j+2] - bz) * s2;
      let fx = off[j], fy = off[j+1], fz = off[j+2];
      let vx = vel[j], vy = vel[j+1], vz = vel[j+2];
      if (live) {
        const px = bx + fx - ox, py = by + fy - oy, pz = bz + fz - oz;
        const tt = px * dx + py * dy + pz * dz;
        const qx = px - dx * tt, qy = py - dy * tt, qz = pz - dz * tt;
        const d2 = qx * qx + qy * qy + qz * qz;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + 1e-4, f = 1 - d / R, ff = f * f;
          vx += (qx / d) * ff * 0.035 + pvx * ff * 0.22 + (Math.random() - 0.5) * ff * 0.01;
          vy += (qy / d) * ff * 0.035 + pvy * ff * 0.22 + (Math.random() - 0.5) * ff * 0.01;
          vz += (qz / d) * ff * 0.035 + pvz * ff * 0.22 + ff * 0.012;
        }
      }
      vx = (vx - fx * spring) * damp; vy = (vy - fy * spring) * damp; vz = (vz - fz * spring) * damp;
      fx += vx; fy += vy; fz += vz;
      off[j] = fx; off[j+1] = fy; off[j+2] = fz; vel[j] = vx; vel[j+1] = vy; vel[j+2] = vz;
      pos[j] = bx + fx; pos[j+1] = by + fy; pos[j+2] = bz + fz;
      const g = (Math.abs(fx) + Math.abs(fy) + Math.abs(fz)) * 3.2;
      glow[i] = g > 1 ? 1 : g;
    }
    // during morph, the statue's glow attr gets a little lift
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aGlow.needsUpdate = true;
  }
  renderer.render(scene, camera);
}
init().catch((e) => { console.warn('statue load failed', e); S.ready = true; });
requestAnimationFrame(frame);
window.__stageDebug = () => ({ N, ready: S.ready, morph, fade, glowMax: glow ? Math.max(...glow.slice(0, 5000)) : 0 });
})();
