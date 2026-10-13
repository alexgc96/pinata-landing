// pinatas_landing

const header    = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.getElementById('main-nav');

// Keep --header-h equal to the sticky header's collapsed height so anchor
// jumps clear it (CSS scroll-padding-top). Skipped while the mobile menu is
// open, since the header is temporarily taller then.
const syncHeaderHeight = () => {
  if (mainNav.classList.contains('is-open')) return;
  document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
};
syncHeaderHeight();
if ('ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(header);
window.addEventListener('load', syncHeaderHeight);

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  mainNav.classList.toggle('is-open', !open);
});

mainNav.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
    syncHeaderHeight();
  })
);
