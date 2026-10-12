// pinatas_landing

const header    = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.getElementById('main-nav');

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
  })
);
