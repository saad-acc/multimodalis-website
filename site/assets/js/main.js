/* Multimodalis site script — no cookies, no storage, no network requests. */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var lang = doc.lang === 'de' ? 'de' : 'en';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile menu */
  var menu = document.getElementById('mobile-menu');
  var toggle = document.querySelector('.mobile-toggle');
  if (menu && toggle) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* Typewriter */
  var terms = {
    en: ['all transport modes', 'FCL, LCL & Ocean', 'FTL, LTL & Road', 'Rail & Barge', 'Airfreight pricing'],
    de: ['alle Verkehrsträger', 'FCL, LCL & Seefracht', 'FTL, LTL & Straße', 'Bahn & Binnenschiff', 'Luftfracht-Pricing']
  }[lang];
  var rotEl = document.getElementById('rotating-term');
  var h1 = rotEl && rotEl.closest('h1');
  function reserveHeight() {
    if (!h1) return;
    h1.style.minHeight = '';
    var keep = rotEl.textContent, max = 0;
    terms.forEach(function (t) { rotEl.textContent = t; max = Math.max(max, h1.offsetHeight); });
    rotEl.textContent = keep;
    h1.style.minHeight = max + 'px';
  }
  if (rotEl && !reduced) {
    var ti = 0, ci = 0, cycled = false;
    var set = function (t) { rotEl.textContent = t || '\u00A0'; };
    var typeNext = function () {
      var term = terms[ti]; set(term.slice(0, ci));
      if (ci < term.length) { ci++; setTimeout(typeNext, 85); } else { setTimeout(del, 2200); }
    };
    var del = function () {
      var term = terms[ti];
      if (ci > 0) { ci--; set(term.slice(0, ci)); setTimeout(del, 40); }
      else { ti++; if (ti >= terms.length) { ti = 0; cycled = true; }
        if (!cycled) setTimeout(typeNext, 180); else set(terms[0]); }
    };
    reserveHeight();
    window.addEventListener('resize', reserveHeight);
    rotEl.setAttribute('aria-hidden', 'true');
    typeNext();
  }

  /* Scroll fade-in */
  var items = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -80px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('visible'); }); }

  /* FAQ accordion */
  document.querySelectorAll('.faq-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var content = btn.nextElementSibling;
      var isOpen = content.classList.contains('visible');
      document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      document.querySelectorAll('.faq-content').forEach(function (c) { c.classList.remove('visible'); });
      document.querySelectorAll('.faq-icon').forEach(function (i) { i.classList.remove('open'); });
      document.querySelectorAll('.faq-toggle').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (!isOpen) {
        item.classList.add('open'); content.classList.add('visible');
        btn.querySelector('.faq-icon').classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  var y = document.getElementById('footer-year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
