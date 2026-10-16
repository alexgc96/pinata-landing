// Portfolio lightbox — native <dialog>, no library.
// Each .work is one piñata. Its cover button (.work__open) and any extra .work__angle
// spans carry a photo in data-full/-w/-h plus data-thumb; the alt text and title are read
// from the markup, so they follow the language switch.
// Arrows step through every photo, with a piñata's angles kept side by side.

(() => {
  const dialog = document.querySelector('.lightbox');
  const works = [...document.querySelectorAll('.work')];
  if (!dialog || !works.length || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector('.lightbox__img');
  const figure = dialog.querySelector('.lightbox__figure');
  const title = dialog.querySelector('.lightbox__title');
  const count = dialog.querySelector('.lightbox__count');
  const thumbs = dialog.querySelector('.lightbox__thumbs');
  const root = document.documentElement;
  const t = key => (window.PinataI18n ? window.PinataI18n.t(key) : '');

  // Flat list of photos, grouped by piñata: [{ work, el, first, pos, size }]
  const slides = [];
  const firstOf = new Map(); // .work -> index of its first slide
  works.forEach(work => {
    const els = [...work.querySelectorAll('[data-full]')];
    firstOf.set(work, slides.length);
    els.forEach((el, pos) => slides.push({ work, el, first: slides.length - pos, pos, size: els.length }));
  });

  const altOf = el => (el.matches('button') ? el.querySelector('img').alt : el.dataset.alt);

  let index = 0;
  let loadToken = 0;

  function renderThumbs(s) {
    thumbs.replaceChildren();
    thumbs.hidden = s.size < 2;
    figure.classList.toggle('has-thumbs', s.size > 1);
    if (s.size < 2) return;
    for (let i = 0; i < s.size; i++) {
      const target = slides[s.first + i];
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lightbox__thumb';
      b.setAttribute('aria-label', `${t('lightbox.photo')} ${i + 1} / ${s.size}`);
      if (i === s.pos) b.setAttribute('aria-current', 'true');
      const im = document.createElement('img');
      im.src = target.el.dataset.thumb;
      im.alt = '';
      im.width = 52;
      im.height = 65;
      b.appendChild(im);
      b.addEventListener('click', () => show(s.first + i));
      li.appendChild(b);
      thumbs.appendChild(li);
    }
    thumbs.setAttribute('aria-label', t('lightbox.group'));
  }

  // dir: 1 = next, -1 = previous, 0 = no slide (opening, thumb click, language change)
  function show(i, dir = 0) {
    index = (i + slides.length) % slides.length;
    const s = slides[index];
    const token = ++loadToken;
    const full = s.el.dataset.full;
    img.width = s.el.dataset.fullW;
    img.height = s.el.dataset.fullH;
    img.alt = altOf(s.el);
    if (img.getAttribute('src') !== full) {
      // show the (already small) thumb at once, swap in the full photo when it is ready
      img.classList.add('is-loading');
      img.src = s.el.dataset.thumb;
      const big = new Image();
      big.onload = big.onerror = () => {
        if (token !== loadToken) return; // the user already moved on
        img.src = full;
        img.classList.remove('is-loading');
      };
      big.src = full;
    }
    img.classList.remove('slide-next', 'slide-prev');
    if (dir) {
      void img.offsetWidth; // restart the animation
      img.classList.add(dir > 0 ? 'slide-next' : 'slide-prev');
    }
    title.textContent = s.work.querySelector('figcaption').textContent;
    count.textContent = s.size > 1 ? `${s.pos + 1} / ${s.size}` : '';
    renderThumbs(s);
    // warm the neighbours so arrows feel instant
    [index - 1, index + 1].forEach(n => { new Image().src = slides[(n + slides.length) % slides.length].el.dataset.full; });
  }

  function open(i) {
    show(i);
    root.classList.add('lightbox-open');
    dialog.showModal();
    // the party cursor (js/party-cursor.js) must move into the top layer to stay visible
    document.dispatchEvent(new CustomEvent('pinata:toplayer', { detail: { host: dialog } }));
  }

  works.forEach(work => {
    const btn = work.querySelector('.work__open');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', () => open(firstOf.get(work)));
  });
  dialog.addEventListener('close', () => {
    root.classList.remove('lightbox-open');
    document.dispatchEvent(new CustomEvent('pinata:toplayer', { detail: { host: null } }));
  });

  dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox__prev').addEventListener('click', () => show(index - 1, -1));
  dialog.querySelector('.lightbox__next').addEventListener('click', () => show(index + 1, 1));

  // click on the dark backdrop (outside the photo and buttons) closes
  dialog.addEventListener('click', e => {
    if (swiped) return;
    if (e.target === dialog || e.target.classList.contains('lightbox__figure')) dialog.close();
  });

  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1, -1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1, 1); }
    if (e.key === 'Home') { e.preventDefault(); show(0); }
    if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
  });

  // horizontal swipe on touch screens
  let startX = null;
  let swiped = false;
  dialog.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') startX = e.clientX; });
  dialog.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) {
      swiped = true; // the click that follows a swipe must not close the backdrop
      setTimeout(() => { swiped = false; }, 0);
      show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }
  });
  dialog.addEventListener('pointercancel', () => { startX = null; });

  // keep caption, alt text and labels in sync if the language changes while the lightbox is open
  document.addEventListener('pinata:languagechange', () => { if (dialog.open) show(index); });

  // gentle fade-up as tiles scroll into view (skipped for reduced motion)
  const grid = document.querySelector('.works');
  if (grid && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    grid.classList.add('reveal-ready');
    works.forEach((w, n) => { w.style.setProperty('--stagger', `${(n % 4) * 70}ms`); io.observe(w); });
  }
})();
