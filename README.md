# Multimodalis website

Static marketing site for **Multimodalis** (Multimodalis GmbH), EN + DE.
Live (approved by Saad 2026-10-09): https://multimodalis.com (custom domain set by Saad 2026-10-10 via CNAME; github.io URL redirects) — deployed by GitHub Actions on every push to `main`. Content is still DRAFT (visible [NEED] placeholders). Canonical domain: **multimodalis.com (non-www)**.

## Structure
```
site/                     # deployable static output (plain HTML/CSS/JS, no build step)
  index.html              # root = English page, canonical -> /en/, visible EN|DE switch, no auto-redirect
  en/  en/imprint/  en/privacy/
  de/  de/impressum/  de/datenschutz/
  404.html  robots.txt  sitemap.xml  site.webmanifest  favicon.ico  .nojekyll
  assets/css/site.css     # Multimodalis tokens (see tokens.json), Geist fonts
  assets/js/main.js       # menu, typewriter, FAQ, fade-in (no cookies, no storage, no network)
  assets/js/globe.js      # hero globe (three.js r128)
  assets/js/three.r128.min.js
.github/workflows/deploy.yml   # Pages workflow, manual trigger only until publishing is approved
DESIGN.md  PRODUCT.md  tokens.json  .agents/  .pagemaster/brand   # brand mirrors (registry is the source of truth)
qa/                       # pre-publish QA reports
```
All internal links are relative, so the site works both as a project page (`/<repo>/`) and on a custom domain. Canonical/hreflang/OG/JSON-LD/sitemap/robots URLs use `https://multimodalis.com`; the 404 page uses root-absolute paths (`/assets/…`), so it only works at the domain root.

## Privacy
No cookies, no localStorage, no analytics, no third-party requests: fonts, scripts and images are all self-hosted. A Content-Security-Policy meta tag restricts everything to `'self'`. The demo form is disabled (endpoint to be decided).

## Third-party code, fonts and assets — provenance
| File | Source | Licence | Notes |
|---|---|---|---|
| `site/assets/js/three.r128.min.js` | npm `three@0.128.0` (`build/three.min.js`), downloaded 2026-10-09 | MIT, see `site/assets/js/LICENSE-three.txt` | self-hosted, no CDN |
| `site/assets/fonts/multimodalis-Geist-Variable.woff2`, `multimodalis-GeistMono-Variable.woff2` | Geist by Vercel (official release), via the Multimodalis brand folder | SIL OFL 1.1, see `site/assets/fonts/OFL-Geist.txt` | approved by Saad 2026-10-09 |
| `site/assets/logo/*`, `site/favicon.ico`, `site/assets/favicon/*` | Multimodalis logo + favicon supplied by Saad (chat, 2026-10-09); PNG sizes derived locally | owned by Multimodalis/Saad, confirmed 2026-10-09 | logo PNG is AI-generated per its metadata |
| `site/assets/img/multimodalis-og.png` | derived from the logo (white 1200×630 canvas) | as logo | placeholder OG image |
| `site/assets/img/multimodalis-ocean.webp`, `-road.webp`, `-rail-barge.webp`, `-air.webp` | reused from the predecessor product's website on Saad's instruction (chat, 2026-10-09: "replicate everything"); resized to 800×600 WebP | AI-generated images (the original files carried C2PA content credentials indicating AI generation); owned by Multimodalis/Saad, confirmed 2026-10-09 | metadata stripped by conversion |
| `site/assets/img/multimodalis-globe-world-fill.png` | reused from the predecessor product's website on Saad's instruction (chat, 2026-10-09), unchanged | owned by Multimodalis/Saad, confirmed 2026-10-09 | world land mask texture for the globe |

Copy: adapted 1:1 from the predecessor product's website per Saad (chat, 2026-10-09); specific figures replaced with "all transport modes" wording.

## Local preview
```
cd site && python3 -m http.server 8000   # then open http://localhost:8000/en/
```
