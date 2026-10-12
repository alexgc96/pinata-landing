// Light / dark theme toggle.
// Loaded synchronously in <head> so the saved theme is applied before first
// paint (no flash). Light is the default; the choice is remembered in
// localStorage. Self-contained: builds its own button and needs only
// css/theme.css plus the palettes in css/style.css.

(function () {
  const KEY = 'pinatas-theme';
  const root = document.documentElement;

  // Button text per page language. Add a key here when a new language ships.
  const LABELS = {
    es: { toDark: 'Cambiar a modo oscuro', toLight: 'Cambiar a modo claro' },
    eu: { toDark: 'Aldatu modu ilunera', toLight: 'Aldatu modu argira' },
  };
  const labels = () => LABELS[(root.lang || 'es').slice(0, 2)] || LABELS.es;

  function stored() {
    try {
      const v = localStorage.getItem(KEY);
      return v === 'dark' || v === 'light' ? v : null;
    } catch (e) {
      return null; // storage blocked (private mode, etc.)
    }
  }

  function save(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) { /* ignore */ }
  }

  const current = () => (root.dataset.theme === 'dark' ? 'dark' : 'light');

  function apply(theme) {
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0a0a0b' : '#f4f1ea';
  }

  apply(stored() || 'light');

  const SUN =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  const MOON =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>';

  function init() {
    const bar = document.querySelector('.site-header__inner');
    if (!bar) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';

    // Shows the icon of the mode you will switch to.
    function sync() {
      const dark = current() === 'dark';
      btn.innerHTML = dark ? SUN : MOON;
      const label = dark ? labels().toLight : labels().toDark;
      btn.setAttribute('aria-label', label);
      btn.title = label;
    }

    btn.addEventListener('click', () => {
      // brief class so colours fade, without slowing down normal hovers
      root.classList.add('theme-fading');
      apply(current() === 'dark' ? 'light' : 'dark');
      save(current());
      sync();
      setTimeout(() => root.classList.remove('theme-fading'), 400);
    });

    sync();
    // js/i18n.js fires this when the visitor switches language
    document.addEventListener('pinata:languagechange', sync);
    const burger = bar.querySelector('.nav-toggle');
    bar.insertBefore(btn, burger || bar.querySelector('.nav'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
