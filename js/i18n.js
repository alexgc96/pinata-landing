// pinatas_landing — language switch (Spanish default, Basque option)
//
// Spanish is the source text and is read from the markup itself. Other languages
// live in js/lang/<code>.js as { key: string } maps registered on
// window.PinataStrings. Elements opt in with:
//   data-i18n="key"                      -> replaces the element's innerHTML
//   data-i18n-attr="attr:key;attr:key"   -> replaces attributes (alt, aria-label, content…)
// A missing key falls back to Spanish. The choice is remembered in localStorage,
// and ?lang=eu in the URL selects a language directly (handy for sharing a link).

(() => {
  const STORAGE_KEY = 'pinata-lang';
  const DEFAULT_LANG = 'es';
  const LANGS = ['es', 'eu'];

  const strings = window.PinataStrings || {};
  const es = Object.assign({}, strings.es); // JS-only strings, then markup is added below

  const textNodes = [...document.querySelectorAll('[data-i18n]')];
  const attrNodes = [...document.querySelectorAll('[data-i18n-attr]')];
  const attrPairs = el => el.dataset.i18nAttr.split(';').map(p => p.split(':').map(s => s.trim()));

  // Capture the Spanish source text straight from the markup.
  textNodes.forEach(el => {
    if (!(el.dataset.i18n in es)) es[el.dataset.i18n] = el.innerHTML;
  });
  attrNodes.forEach(el => attrPairs(el).forEach(([attr, key]) => {
    if (!(key in es)) es[key] = el.getAttribute(attr);
  }));

  let current = DEFAULT_LANG;

  const lookup = (lang, key) => (strings[lang] && strings[lang][key]) ?? es[key] ?? '';

  const read = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  };
  const write = lang => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode etc. */ }
  };

  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang;
    textNodes.forEach(el => { el.innerHTML = lookup(lang, el.dataset.i18n); });
    attrNodes.forEach(el => attrPairs(el).forEach(([attr, key]) => {
      el.setAttribute(attr, lookup(lang, key));
    }));
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
    document.dispatchEvent(new CustomEvent('pinata:languagechange', { detail: { lang } }));
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) return;
    write(lang);
    apply(lang);
  }

  document.querySelectorAll('[data-lang]').forEach(btn =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang))
  );

  window.PinataI18n = {
    t: key => lookup(current, key),
    get lang() { return current; },
    setLang
  };

  const fromUrl = new URLSearchParams(location.search).get('lang');
  const saved = read();
  const initial = [fromUrl, saved].find(l => LANGS.includes(l)) || DEFAULT_LANG;
  if (fromUrl && LANGS.includes(fromUrl)) write(fromUrl);
  if (initial !== DEFAULT_LANG) apply(initial);
  else document.querySelectorAll('[data-lang]').forEach(btn =>
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === DEFAULT_LANG))
  );
})();
