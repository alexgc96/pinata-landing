// Party cursor + piñata stick — EXPERIMENT (feat/pinata-stick-cursor)
//
// Mouse:  a party cone follows the pointer; over the hero it turns into a stick
//         you can swing (click) at the piñata.
// Touch:  no cursor — tap or swipe across the hero piñata to hit it.
// Reduced motion: cursors stay, but no trail, spring, particles or break.
// Pages without the hero (portafolio.html) get just the cone, trail and click confetti.

(() => {
  const art    = document.querySelector('.hero__art');
  const pinata = document.querySelector('.hero__pinata');
  const hero = !!(art && pinata);

  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => reducedQuery.matches;
  const fineHover = matchMedia('(hover: hover) and (pointer: fine)');

  const BASE_ANGLE = -3; // matches .hero__pinata's resting rotate()
  const COLORS = ['#e8458b', '#f5b82e', '#1fa79a', 'ink'];
  // 'ink' follows the active theme (cream on dark, near-black on light)
  const confettiColor = () => {
    const c = pick(COLORS);
    return c === 'ink'
      ? getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#f4f1ea'
      : c;
  };
  // Hit words come from js/i18n.js (keys pop.1 … pop.6, pop.burst) so they follow the language switch.
  const say = key => window.PinataI18n.t(key);
  const popWord = () => say('pop.' + (1 + Math.floor(Math.random() * 6)));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // ---------- DOM ----------

  const cone = document.createElement('div');
  cone.className = 'party-cone';
  cone.setAttribute('aria-hidden', 'true');
  cone.innerHTML = '<img src="img/cursor-cone.svg" width="44" height="60" alt="" draggable="false" />';

  const stick = document.createElement('div');
  stick.className = 'party-stick';
  stick.setAttribute('aria-hidden', 'true');
  stick.innerHTML = '<div class="party-stick__swing"><img src="img/cursor-stick.svg" width="40" height="262" alt="" draggable="false" /></div>';
  const swing = stick.firstElementChild;

  const canvas = document.createElement('canvas');
  canvas.className = 'party-fx';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');

  const hint = document.createElement('p');
  hint.className = 'hero__hint';
  // Hint copy comes from js/i18n.js so it follows the language switch.
  let hintIsTouch = !fineHover.matches;
  const setHint = touch => {
    hintIsTouch = touch;
    hint.textContent = window.PinataI18n.t(touch ? 'hero.hint.touch' : 'hero.hint.mouse');
  };
  setHint(hintIsTouch);
  document.addEventListener('pinata:languagechange', () => setHint(hintIsTouch));

  const fxParts = [cone, stick, canvas];
  document.body.append(...fxParts);

  // A modal <dialog> paints in the browser's top layer, above everything in the
  // page, so while one is open the cursor parts move inside it (js/gallery.js
  // announces this) and come back to <body> on close.
  document.addEventListener('pinata:toplayer', e => {
    (e.detail.host || document.body).append(...fxParts);
  });
  if (hero) art.append(hint);

  // ---------- Particles ----------

  const particles = [];
  const MAX_PARTICLES = 400;
  let dpr = 1;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
  }
  resizeCanvas();
  addEventListener('resize', resizeCanvas);

  function burst(x, y, count, { dir = 0, speed = 1, radial = false, candy = 0 } = {}) {
    for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
      const a = radial ? rand(0, Math.PI * 2) : -Math.PI / 2 + rand(-1.9, 1.9) + dir * 0.35;
      const v = rand(260, 700) * speed;
      const isCandy = Math.random() < candy;
      particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        rot: rand(0, Math.PI * 2),
        vr: rand(-9, 9),
        ph: rand(0, 6.28),
        fs: rand(8, 16),
        w: isCandy ? rand(11, 15) : rand(7, 12),
        h: isCandy ? rand(7, 9) : rand(3.5, 5.5),
        shape: isCandy ? 'candy' : Math.random() < 0.3 ? 'dot' : 'strip',
        color: confettiColor(),
        age: 0,
        life: rand(1.1, 2),
      });
    }
    wake();
  }

  function stepParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) { particles.splice(i, 1); continue; }
      p.vy += 900 * dt;
      const drag = Math.exp(-3.5 * dt);
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
  }

  function drawParticles() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of particles) {
      const left = 1 - p.age / p.life;
      ctx.globalAlpha = left < 0.3 ? left / 0.3 : 1;
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 'dot') {
        ctx.beginPath();
        ctx.arc(0, 0, p.h * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'candy') {
        ctx.beginPath();
        ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.moveTo(-p.w / 2, 0);
        ctx.lineTo(-p.w / 2 - 4, -p.h / 2 - 1);
        ctx.lineTo(-p.w / 2 - 4, p.h / 2 + 1);
        ctx.moveTo(p.w / 2, 0);
        ctx.lineTo(p.w / 2 + 4, -p.h / 2 - 1);
        ctx.lineTo(p.w / 2 + 4, p.h / 2 + 1);
        ctx.fill();
      } else {
        ctx.scale(1, Math.cos(p.ph + p.age * p.fs)); // paper flutter
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Piñata spring ----------

  const spring = { a: 0, v: 0 }; // degrees, degrees/s (positive = swings left)
  let jolt = 0;
  const K = 110, C = 2.6;

  function stepSpring(dt) {
    spring.v += (-K * spring.a - C * spring.v) * dt;
    spring.a = clamp(spring.a + spring.v * dt, -40, 40);
    jolt *= Math.exp(-10 * dt);
    if (Math.abs(spring.a) < 0.05 && Math.abs(spring.v) < 0.5 && jolt < 0.01) {
      spring.a = spring.v = jolt = 0;
    }
  }

  function renderPinata() {
    if (!hero) return;
    pinata.style.transform =
      `rotate(${BASE_ANGLE + spring.a}deg) scale(${1 + 0.035 * jolt}, ${1 - 0.03 * jolt})`;
  }

  const springActive = () => spring.a !== 0 || spring.v !== 0 || jolt !== 0;

  // ---------- Pointer state ----------

  const mouse = { x: -200, y: -200, dx: 0, flip: 1, zone: false, trail: 0 };
  let tilt = -12;
  const tiltTarget = () => (reduced() ? -12 : clamp(mouse.dx * 1.2, -28, 28) - 12);

  function renderCone() {
    cone.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) rotate(${tilt}deg)`;
  }

  function renderStick(x = mouse.x, y = mouse.y, flip = mouse.flip) {
    stick.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${flip}) rotate(-32deg)`;
  }

  function pinataCircle() {
    const r = pinata.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.482, r: r.height * 0.4 };
  }

  function updateZone() {
    if (!hero) return;
    const r = art.getBoundingClientRect();
    mouse.zone = mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom;
    document.body.classList.toggle('party-zone', mouse.zone);
    if (mouse.zone) {
      const c = pinataCircle();
      if (mouse.x > c.x + 16) mouse.flip = 1;
      else if (mouse.x < c.x - 16) mouse.flip = -1;
      renderStick();
    }
  }

  // ---------- Animation loop (sleeps when nothing is moving) ----------

  let looping = false;
  let lastT = 0;

  function wake() {
    if (looping) return;
    looping = true;
    lastT = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    mouse.dx *= Math.exp(-6 * dt);
    const target = tiltTarget();
    tilt += (target - tilt) * Math.min(1, dt * 14);
    if (document.body.classList.contains('party-on')) renderCone();

    stepSpring(dt);
    renderPinata();
    stepParticles(dt);
    drawParticles();

    const settled = Math.abs(mouse.dx) < 0.3 && Math.abs(target - tilt) < 0.2;
    if (springActive() || particles.length || !settled) {
      requestAnimationFrame(frame);
    } else {
      looping = false;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  // ---------- Hitting ----------

  let hits = 0;
  let hitsToBreak = Math.floor(rand(6, 9));
  let broken = false;
  let swingAnim = null;
  let flashTimer = 0;

  function swingStick(onContact) {
    if (swingAnim) swingAnim.cancel();
    if (reduced()) { onContact(); return; }
    const duration = 320;
    swingAnim = swing.animate([
      { transform: 'rotate(0deg)',   offset: 0,    easing: 'ease-out' },
      { transform: 'rotate(16deg)',  offset: 0.2,  easing: 'ease-in' },
      { transform: 'rotate(-30deg)', offset: 0.44, easing: 'ease-out' },
      { transform: 'rotate(0deg)',   offset: 1 },
    ], { duration });
    setTimeout(onContact, duration * 0.44);
  }

  function pop(x, y, text) {
    const el = document.createElement('span');
    el.className = 'party-pop';
    el.textContent = text;
    el.setAttribute('aria-hidden', 'true');
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = pick(COLORS.slice(0, 3));
    document.body.append(el);
    const frames = reduced()
      ? [{ opacity: 1, transform: 'translate(-50%, -40px)' }, { opacity: 0, transform: 'translate(-50%, -40px)' }]
      : [
          { opacity: 0, transform: 'translate(-50%, -10px) scale(.6)' },
          { opacity: 1, transform: 'translate(-50%, -38px) scale(1.1)', offset: 0.25 },
          { opacity: 0, transform: 'translate(-50%, -76px) scale(1)' },
        ];
    el.animate(frames, { duration: 800, easing: 'ease-out' }).onfinish = () => el.remove();
  }

  // x, y: where the stick head lands (viewport px). dir: -1 pushes the piñata
  // left, +1 right. power scales the reaction (swipes pass their speed in).
  function strike(x, y, dir, power) {
    if (broken) return;
    const c = pinataCircle();
    if (Math.hypot(x - c.x, y - c.y) > c.r) return; // whiff

    hits++;
    hint.classList.add('is-hidden');

    if (reduced()) {
      pinata.animate([{ filter: 'brightness(1.8)' }, { filter: 'none' }], { duration: 180 });
      pop(x, y, popWord());
      return;
    }

    spring.v += -dir * power * rand(170, 210);
    jolt = Math.min(1, jolt + 0.7 * power);
    burst(x, y, Math.round(12 + 8 * power), { dir, speed: power });
    pop(x, y, hits >= hitsToBreak ? say('pop.burst') : popWord());
    wake();

    if (hits >= hitsToBreak) breakPinata(c);
  }

  function breakPinata(c) {
    broken = true;
    burst(c.x, c.y, 110, { radial: true, speed: 1.15, candy: 0.3 });
    pinata.classList.add('is-burst');
    setTimeout(rebuildPinata, 1700);
  }

  // Back to a fresh piñata: every bit of state is reset here, and nothing
  // depends on an animation callback firing (those proved unreliable).
  function rebuildPinata() {
    pinata.classList.remove('is-burst');
    spring.a = spring.v = jolt = 0;
    hits = 0;
    hitsToBreak = Math.floor(rand(6, 9));
    renderPinata();
    pinata.animate(
      [{ translate: '0 -90px', opacity: 0, scale: 0.9 }, { translate: '0 0', opacity: 1, scale: 1 }],
      { duration: 700, easing: 'cubic-bezier(.34, 1.56, .64, 1)' }
    );
    setTimeout(() => { spring.v = -90; wake(); }, 450); // little wobble as it lands
    setTimeout(() => { broken = false; }, 700);
  }

  // ---------- Mouse ----------

  function enterMouseMode() {
    if (document.body.classList.contains('party-on')) return;
    document.body.classList.add('party-on');
    setHint(false);
  }

  function leaveMouseMode() {
    document.body.classList.remove('party-on', 'party-zone');
    mouse.zone = false;
  }

  const NATIVE_SELECTOR = 'input, textarea, select, [contenteditable]';
  const HOT_SELECTOR = 'a, button, summary, label';

  function onMouseMove(e) {
    enterMouseMode();
    mouse.dx = e.clientX - mouse.x;
    const moved = Math.hypot(e.clientX - mouse.x, e.clientY - mouse.y);
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    renderCone();
    updateZone();

    const t = e.target instanceof Element ? e.target : null;
    document.body.classList.toggle('party-native', !!(t && t.closest(NATIVE_SELECTOR)));
    cone.classList.toggle('is-hot', !!(t && t.closest(HOT_SELECTOR)));

    if (!mouse.zone && !reduced()) {
      mouse.trail += moved;
      if (mouse.trail > 46 && moved < 400) {
        mouse.trail = 0;
        burst(mouse.x - mouse.dx, mouse.y + 6, 1, { speed: 0.2 });
      }
    }
    wake();
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    if (mouse.zone) {
      const { x, y, flip } = mouse;
      swingStick(() => strike(x, y, -flip, 1));
    } else if (!reduced() && !document.body.classList.contains('party-native')) {
      burst(e.clientX, e.clientY, 9, { speed: 0.5, radial: true });
    }
  }

  // ---------- Touch: tap or swipe the piñata ----------

  let touch = null;
  let lastSwipeAt = 0;

  function touchStick(x, y, flip, onContact) {
    renderStick(x, y, flip);
    stick.classList.add('is-flash');
    swingStick(onContact);
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => stick.classList.remove('is-flash'), 520);
  }

  function inArt(x, y) {
    if (!hero) return false;
    const r = art.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function onTouchDown(e) {
    leaveMouseMode();
    setHint(true);
    touch = inArt(e.clientX, e.clientY)
      ? { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: e.timeStamp,
          lx: e.clientX, lt: e.timeStamp, swiped: false }
      : null;
  }

  function onTouchMove(e) {
    if (!touch || e.pointerId !== touch.id) return;
    const dt = e.timeStamp - touch.lt;
    if (dt < 8) return;
    const vx = (e.clientX - touch.lx) / dt; // px/ms
    touch.lx = e.clientX;
    touch.lt = e.timeStamp;

    if (Math.abs(vx) < 0.55 || e.timeStamp - lastSwipeAt < 260) return;
    const c = pinataCircle();
    if (Math.hypot(e.clientX - c.x, e.clientY - c.y) > c.r) return;

    touch.swiped = true;
    lastSwipeAt = e.timeStamp;
    const dir = Math.sign(vx);
    const power = clamp(Math.abs(vx) / 1.2, 0.7, 1.8);
    const { clientX: x, clientY: y } = e;
    touchStick(x, y, -dir, () => strike(x, y, dir, power));
  }

  function onTouchUp(e) {
    if (!touch || e.pointerId !== touch.id) return;
    const t = touch;
    touch = null;
    const tap = !t.swiped
      && Math.hypot(e.clientX - t.x0, e.clientY - t.y0) < 12
      && e.timeStamp - t.t0 < 400;
    if (!tap) return;
    const { clientX: x, clientY: y } = e;
    const c = pinataCircle();
    const flip = x > c.x ? 1 : -1;
    touchStick(x, y, flip, () => strike(x, y, -flip, 1));
  }

  // ---------- Wiring ----------

  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') onTouchMove(e); else onMouseMove(e);
  });
  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') onTouchDown(e); else onMouseDown(e);
  });
  document.addEventListener('pointerup', e => {
    if (e.pointerType === 'touch') onTouchUp(e);
  });
  document.addEventListener('pointercancel', e => {
    if (touch && e.pointerId === touch.id) touch = null;
  });
  document.documentElement.addEventListener('mouseleave', leaveMouseMode);
  addEventListener('scroll', () => {
    if (document.body.classList.contains('party-on')) updateZone();
  }, { passive: true });
})();
