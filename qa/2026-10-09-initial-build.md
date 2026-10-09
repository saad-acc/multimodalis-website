QA — multimodalis · initial site build · 2026-10-09 · Status: DRAFT
Result: BLOCKED FOR PUBLISHING (by design — placeholders open; Pages not enabled)

A Brand ✅ brand_mix_check.py --brand multimodalis on repo: 0 hits, 24 own tokens; .pagemaster/brand = multimodalis. ⚠️ brand files are DRAFT.
B Content ❌ 36 visible [NEED] placeholders in site/ (Impressum/Datenschutz details, contact email/form endpoint, draft banner) — requested by Saad as visible placeholders. Copy 1:1 from predecessor site (Saad), figures replaced with "all transport modes" wording. Voice check not run (Saad asked for 1:1 copy).
C Links ✅ 211 internal href/src checked, 0 broken; all links relative; no external links.
D i18n ✅ /en/ + /de/ with full parity; lang attr per page; reciprocal hreflang + x-default; switcher links to equivalent page; root = EN with canonical /en/, no auto-redirect. ⚠️ hreflang/canonical use https://multimodalis.com (domain not configured).
E SEO ✅ unique title/description per locale, one H1, canonical, OG tags, JSON-LD (Organization, SoftwareApplication, FAQPage matching visible FAQ) parses; robots.txt + sitemap.xml. ⚠️ OG image is a logo placeholder.
F A11y ⚠️ manual: skip link, landmarks (nav/main/footer), labelled (disabled) form fields, aria-expanded on menu + FAQ, focus-visible ring, reduced-motion respected (typewriter + globe rotation off). Text contrast ≥ 4.5:1 for body/muted on white (#64748B on #FFFFFF 4.76:1, on #F8FAFC 4.55:1 — tight). White on #1F63CC 5.65:1. No Lighthouse/axe run.
G Perf ⚠️ manual: three.js r128 is ~149211 B gzipped (> 50 KB JS budget) — only loaded on the home pages; globe disabled ≤ 768 px. Images WebP 800×600 with width/height. Fonts: 2 woff2 files, font-display swap.
H Legal ❌ Impressum/Datenschutz pages exist and are linked in every footer, but contain [NEED] placeholders and need legal review. External-request inventory: none (headless Chrome: 0 non-local requests, 0 cookies, 0 console errors on /en/ and /de/ at 1280 + 390).
I CRO n/a (1:1 replication requested).
J Deploy ⚠️ workflow present (manual trigger only); Pages not enabled; no domain/CNAME.
