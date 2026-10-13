// Portfolio lightbox — native <dialog>, no library.
// Each .work__open button carries the full (uncropped) image in data-full;
// the caption and alt text are read from the figure, so they follow the language switch.

(() => {
  const dialog = document.querySelector('.lightbox');
  const buttons = [...document.querySelectorAll('.work__open')];
  if (!dialog || !buttons.length || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector('.lightbox__img');
  const caption = dialog.querySelector('.lightbox__caption');
  const root = document.documentElement;
  let index = 0;

  function show(i) {
    index = (i + buttons.length) % buttons.length;
    const btn = buttons[index];
    const thumb = btn.querySelector('img');
    img.src = btn.dataset.full;
    img.width = btn.dataset.fullW;
    img.height = btn.dataset.fullH;
    img.alt = thumb.alt;
    caption.textContent = btn.closest('figure').querySelector('figcaption').textContent;
    // warm the neighbours so arrows feel instant
    [index - 1, index + 1].forEach(n => { new Image().src = buttons[(n + buttons.length) % buttons.length].dataset.full; });
  }

  function open(i) {
    show(i);
    root.classList.add('lightbox-open');
    dialog.showModal();
    // the party cursor (js/party-cursor.js) must move into the top layer to stay visible
    document.dispatchEvent(new CustomEvent('pinata:toplayer', { detail: { host: dialog } }));
  }

  buttons.forEach((btn, i) => btn.addEventListener('click', () => open(i)));
  dialog.addEventListener('close', () => {
    root.classList.remove('lightbox-open');
    document.dispatchEvent(new CustomEvent('pinata:toplayer', { detail: { host: null } }));
  });

  dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox__prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.lightbox__next').addEventListener('click', () => show(index + 1));

  // click on the dark backdrop (outside the photo and buttons) closes
  dialog.addEventListener('click', e => {
    if (swiped) return;
    if (e.target === dialog || e.target.classList.contains('lightbox__figure')) dialog.close();
  });

  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
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
      show(index + (dx < 0 ? 1 : -1));
    }
  });
  dialog.addEventListener('pointercancel', () => { startX = null; });

  // keep the caption in sync if the language changes while the lightbox is open
  document.addEventListener('pinata:languagechange', () => { if (dialog.open) show(index); });
})();
