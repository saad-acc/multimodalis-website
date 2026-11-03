# QA — Multimodalis · demo form endpoint · 2026-11-03 (branch feat/contact-form-endpoint)

- Brand mix check: 12 hits, all the endpoint URL `https://bestmodal.de/send_mail_multimodalis.php` in the CSP meta tag and the form's `data-endpoint` (code, not visible copy). No BestModal/Acceltra wording in visible text. ⚠️ accepted by design (endpoint chosen by Saad 2026-11-03).
- `[NEED` in site: 2 per locale on the privacy page (hoster + server location; retention of rate-limit hash and server access logs). ❌ blocks publishing until Saad fills them.
- Privacy section 3 (DE+EN) rewritten for the form: ⚠️ needs lawyer review.
- Local test (Playwright, endpoint mocked via route, no real request): fieldset enabled by JS, `_timestamp` + `lang` set, honeypot off-screen with tabindex -1, native validation blocks empty required fields, button disabled + "Sending…" while in flight, server message shown in `role=status aria-live=polite`, form reset on success, generic DE/EN message on network error, no cookie header, CSP allows the fetch. DE+EN, 1280 + 390.
- Endpoint: preflight 204 with ACAO https://multimodalis.com; foreign origin 403. One real test POST 2026-11-03 16:18:25 CET → 200 `{"success":true,...}`.
- Screens: /workspace/pagemaster/multimodalis-site/screens/contact-form/
- STOP: merge only after Saad's OK.
