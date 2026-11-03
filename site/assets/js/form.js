/* Multimodalis demo form: sends the request to the form endpoint with fetch.
   No cookies (credentials: 'omit'), no storage. The only network request on this site. */
(function () {
  var form = document.getElementById('contact-form');
  if (!form || !window.fetch || !window.FormData) return;
  var endpoint = form.getAttribute('data-endpoint');
  var fieldset = form.querySelector('fieldset');
  var status = document.getElementById('form-status');
  var button = form.querySelector('button[type="submit"]');
  var ts = form.querySelector('input[name="_timestamp"]');
  var lang = (form.querySelector('input[name="lang"]') || {}).value === 'de' ? 'de' : 'en';
  var L = {
    en: { sending: 'Sending…', network: 'Your request could not be sent. Please check your connection and try again later.' },
    de: { sending: 'Wird gesendet…', network: 'Ihre Anfrage konnte nicht gesendet werden. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es später erneut.' }
  }[lang];
  var label = button.textContent;
  var now = function () { return Math.floor(Date.now() / 1000); };
  var stamp = function () { ts.value = String(now()); };

  stamp();
  fieldset.disabled = false;
  // The endpoint rejects timestamps older than 2 h; refresh one that has gone stale.
  form.addEventListener('focusin', function () { if (now() - Number(ts.value) > 6000) stamp(); });

  function show(msg, kind) {
    status.textContent = msg;
    status.className = 'form-status form-status-' + kind;
    status.hidden = false;
  }
  function busy(on) {
    button.disabled = on;
    button.textContent = on ? L.sending : label;
    form.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (button.disabled) return;
    busy(true);
    show(L.sending, 'pending');
    // The endpoint silently drops submissions sent within 3 s of the timestamp (bot check).
    var wait = Math.max(0, 4 - (now() - Number(ts.value))) * 1000;
    setTimeout(function () {
      var body = new URLSearchParams(new FormData(form));
      fetch(endpoint, { method: 'POST', body: body, mode: 'cors', credentials: 'omit', cache: 'no-store', referrerPolicy: 'strict-origin' })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data || {} }; });
        })
        .then(function (r) {
          var ok = r.ok && r.data.success === true;
          var msg = typeof r.data.message === 'string' && r.data.message ? r.data.message : L.network;
          show(msg, ok ? 'success' : 'error');
          if (ok) { form.reset(); stamp(); }
        })
        .catch(function () { show(L.network, 'error'); })
        .then(function () { busy(false); });
    }, wait);
  });
})();
