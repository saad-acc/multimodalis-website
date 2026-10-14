/* Multimodalis — UC-style motion layer (hand-written, no libraries, no network, no storage). */
(function () {
  var D = document, H = D.documentElement;
  H.classList.add('js');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) H.classList.add('js-motion');
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* Curtain intro (Barba-like leave/enter feel on first load) */
  function loaded() { requestAnimationFrame(function () { H.classList.add('loaded'); revealHero(); }); }
  if (D.readyState === 'complete') loaded(); else window.addEventListener('load', loaded);
  setTimeout(function () { H.classList.add('loaded'); revealHero(); }, 2500); // safety

  function revealHero() {
    D.querySelectorAll('.s-hero .rv, .s-hero h1').forEach(function (el, i) {
      setTimeout(function () { el.classList.add('in'); }, reduced ? 0 : 450 + i * 90);
    });
  }

  /* Header: transparent over dark hero, solid after; hides on scroll down, shows on scroll up */
  var hd = D.querySelector('[data-hd]'), lastY = 0;
  var menu = D.getElementById('mobile-menu'), tog = D.querySelector('.mobile-toggle');
  if (menu && tog) {
    tog.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      tog.setAttribute('aria-expanded', open ? 'true' : 'false');
      hd.classList.toggle('menu-open', open);
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); tog.setAttribute('aria-expanded', 'false'); hd.classList.remove('menu-open'); }); });
  }

  /* Reveals (ScrollTrigger "top 85%" equivalent) */
  var rvs = D.querySelectorAll('.rv, .tt');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(sib, 6) * 0.06 + 's';
        el.classList.add('in'); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    rvs.forEach(function (el) { if (!el.closest('.s-hero')) io.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add('in'); });

  /* FAQ accordion */
  D.querySelectorAll('.faq-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      D.querySelectorAll('.faq-q').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); D.getElementById(o.getAttribute('aria-controls')).classList.remove('open'); });
      if (!open) { b.setAttribute('aria-expanded', 'true'); D.getElementById(b.getAttribute('aria-controls')).classList.add('open'); }
    });
  });

  var y = D.getElementById('footer-year'); if (y) y.textContent = new Date().getFullYear();

  if (reduced) { onScrollHeader(); window.addEventListener('scroll', onScrollHeader, { passive: true }); return; }

  /* ── Scroll engine: progress 0..1 per scene, scrub with a light lerp (≈ scrub:1) ── */
  var scenes = [].map.call(D.querySelectorAll('[data-scene], .svc-pin, .why-pin'), function (el) { return { el: el, p: 0, t: 0 }; });
  function progressOf(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    var span = el.offsetHeight - vh;
    if (el.classList.contains('ft') || el.classList.contains('s-uc')) return clamp((vh - r.top) / (r.height + vh * (el.classList.contains('ft') ? 0 : 1)), 0, 1);
    return span > 0 ? clamp(-r.top / span, 0, 1) : clamp((vh - r.top) / (vh + r.height), 0, 1);
  }
  var svcStick = D.querySelector('.svc-stick'), svcModes = D.querySelectorAll('.svc-mode'), meter = D.querySelector('.svc-meter-n');
  var rig = D.querySelector('.svc-rig'), box = D.querySelector('.svc-box'), stage = D.querySelector('.svc-stage');
  var modeKeys = ['sea', 'road', 'rail', 'air'], modeCol = { sea: 'var(--sea)', road: 'var(--road)', rail: 'var(--rail)', air: 'var(--air)' };
  var steps = D.querySelectorAll('.why-step'), globe = D.querySelector('.hero-globe-wrap'), sea = D.querySelector('.why-sea');
  var lastMode = -1;
  function apply(s) {
    var el = s.el, p = s.p;
    el.style.setProperty('--p', p.toFixed(4));
    if (el.dataset.scene === 'hero' && globe) {            // globe drifts up, grows, fades into the glow
      globe.style.setProperty('--gy', (-p * 18) + 'vh'); globe.style.setProperty('--gs', (1 + p * .25).toFixed(3)); globe.style.setProperty('--go', (1 - p * .6).toFixed(3));
    }
    if (el.classList.contains('svc-pin')) {                 // container travels across 4 mode segments
      var n = 4, seg = Math.min(n - 1, Math.floor(p * n * 0.999)), local = p * n - seg;
      if (seg !== lastMode) {
        lastMode = seg; svcStick.dataset.m = modeKeys[seg];
        svcModes.forEach(function (m, i) { m.classList.toggle('on', i === seg); });
        meter.textContent = '0' + (seg + 1); box.style.setProperty('--c', modeCol[modeKeys[seg]]);
      }
      var w = stage.offsetWidth, rw = rig.offsetWidth;
      var ease = local < .5 ? 4 * local * local * local : 1 - Math.pow(-2 * local + 2, 3) / 2; // power3.inOut
      rig.style.setProperty('--rx', (-rw + ease * (w + rw)).toFixed(1) + 'px');
      rig.style.setProperty('--ry', modeKeys[seg] === 'air' ? (-Math.sin(local * Math.PI) * 60).toFixed(1) + 'px' : '0px');
    }
    if (el.classList.contains('why-pin')) steps.forEach(function (st, i) { st.classList.toggle('on', p >= i / steps.length + .02 || p > .97); });
  }
  function frame() {
    var moving = false;
    scenes.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      s.t = progressOf(s.el);
      var d = s.t - s.p; s.p = Math.abs(d) < .0005 ? s.t : s.p + d * .14;
      if (s.p !== s.t) moving = true;
      apply(s);
    });
    if (sea) { var r = sea.getBoundingClientRect(); sea.style.setProperty('--sp', clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1).toFixed(3)); }
    onScrollHeader();
    raf = moving ? requestAnimationFrame(frame) : 0;
  }
  var raf = 0;
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  kick();

  function onScrollHeader() {
    if (!hd) return;
    var sy = window.scrollY, heroH = (D.querySelector('.s-hero') || {}).offsetHeight || 600;
    hd.classList.toggle('solid', sy > heroH - 80);
    if (!hd.classList.contains('menu-open')) hd.classList.toggle('hide', sy > lastY && sy > 300);
    lastY = sy;
  }

  /* Custom cursor (fine pointers only) */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cur = D.querySelector('.cursor'), dot = D.querySelector('.cursor-dot'), ring = D.querySelector('.cursor-ring');
    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    D.addEventListener('mouseover', function (e) { cur.classList.toggle('hov', !!e.target.closest('a, button, .row, .hg-cell')); });
    (function loop() {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }
})();
