<!-- Mirror of brands/multimodalis/DESIGN.md (Pagemaster brand registry), copied 2026-10-09. Edit the registry, not this copy. -->
# Multimodalis — Design system

Status: DRAFT
Brand slug: multimodalis
Tokens: `tokens.json` (source of truth for values; this file explains how to use them)
Sources:
- [S1] Saad, style guide image "Enterprise UI Color Style Guide" (chat attachment, 2026-10-09), copy at `assets/images/source/multimodalis-color-style-guide-2026-10-09.png`. Section 1 adopted 2026-10-09; sections 2–5 adopted on Saad's approval (Saad, chat, 2026-10-09). All hex values read from the image's printed labels and checked in zoomed crops (2026-10-09).
- [S2] Logo + favicon: Saad, chat attachments, 2026-10-09, approved by Saad as the logo/favicon (Saad, chat, 2026-10-09). See `assets/README.md`.
- [S3] Fonts: proposed by Pagemaster 2026-10-09, approved by Saad (chat, 2026-10-09 22:05).
- [S4] Mode colors/scales changed to the logo colors: Saad, chat, 2026-10-09 22:05.
- Everything else: [NEED: Saad]

> Impeccable reads this file as DESIGN.md. It describes THIS brand only. Never copy sections from another brand.

## 1. Design world (one paragraph)
From [S1] (inference, needs Saad's confirmation): an enterprise software UI that is "mostly neutrals, with transport and interaction colors used as accents" (the image's own recommendation). Cool slate neutrals carry surfaces and text; one action blue (#1F63CC) carries interaction; the four transport-mode colors (Road graphite, Rail burgundy, Sea cyan, Air azure) are reserved for meaning — they always identify a mode. Audience, use scene and what makes it not look like a generic SaaS template: [NEED: Saad]

## 2. Principles (3–5)
1. Neutrals first; color means something (from [S1] "Recommended UI distribution").
2. A mode color always means its mode — never decoration, never swapped (from [S1] caption "These colors consistently represent transport modes across the product.").
3. One action color (#1F63CC) for buttons, key interactive states and focus (from [S1] section 5).
4. [NEED: Saad]

## 3. Color roles
All values: Saad, style guide image, 2026-10-09 ([S1]). Contrast measured 2026-10-09 (WCAG 2.x relative luminance; AA = 4.5:1 normal text, 3:1 large text and UI components).

### 3.1 Core transport-mode colors — changed to the logo colors
Saad, chat, 2026-10-09 22:05: "make the palette match the logo". Values = medians sampled from `assets/logo/multimodalis-logo-original.png` (41×41 px patches). They replace the style guide's section-1 values (kept in brackets for history). **Rail is now the pink.**
| Mode | Name | Token | Hex (was) | vs #FFFFFF | vs #000000 | White text at AA? |
|---|---|---|---|---|---|---|
| Road | Asphalt Graphite | `color.brand.road` | `#455161` (was #374151) | 8.07:1 | 2.60:1 | Yes |
| Rail | [NEED: new name — "Signal Burgundy" no longer fits a pink (Saad)] | `color.brand.rail` | `#D11767` (was #8F3D56) | 5.21:1 | 4.03:1 | Yes |
| Sea | Deep Ocean Cyan | `color.brand.sea` | `#0294AB` (was #007C91) | **3.60:1** | 5.83:1 | **Large text / UI only** — dark text for normal size |
| Air | Sky Azure | `color.brand.air` | `#037AE2` (was #3A86FF) | **4.30:1** | 4.89:1 | **Large text / UI only** — dark text (black 4.89) for normal size |
Measured 2026-10-09 (WCAG 2.x; AA = 4.5:1 normal text, 3:1 large text/UI).

### 3.2 Brand color scales — regenerated from the logo colors
Method (Pagemaster, 2026-10-09, on Saad's request to regenerate consistently): OKLab interpolation of each 500 color toward white (50: 94 %, 100: 84 %, 300: 45 %) and toward black (700: 22 %, 900: 50 %). Same steps as the guide (50/100/300/500/700/900). Replaces the guide's section-2 scales. Contrast vs white in brackets.
| Step | Road | Rail | Sea | Air |
|---|---|---|---|---|
| 50 | `#F3F4F5` (1.1) | `#FFF3F5` (1.08) | `#F3F9FA` (1.06) | `#F2F7FE` (1.08) |
| 100 | `#DFE1E4` (1.31) | `#FDDFE5` (1.25) | `#DEEEF2` (1.19) | `#DCEBFD` (1.21) |
| 300 | `#949BA5` (2.8) | `#EF90A8` (2.28) | `#8EC4D1` (1.91) | `#87B8F3` (2.06) |
| 500 | `#455161` (8.07) | `#D11767` (5.21) | `#0294AB` (3.6) | `#037AE2` (4.3) |
| 700 | `#2F3843` (11.88) | `#950D48` (8.65) | `#01697A` (6.36) | `#0156A2` (7.36) |
| 900 | `#151A21` (17.48) | `#500423` (15.19) | `#003640` (13.11) | `#002B57` (14.16) |
Use: 50/100 as tinted backgrounds/chips behind mode labels (text on them in the mode's 700/900 or neutral-900); 300 never for text (all < 3:1); 700/900 for text and fills with white text (all ≥ 6.36:1); Sea-500 and Air-500 carry white text only at large sizes.

### 3.3 Neutrals (section 3, "Primary surfaces, borders, and text hierarchy")
| Token | Hex | vs white | Proposed role (Pagemaster, needs Saad's OK) |
|---|---|---|---|
| `neutral.0` | `#FFFFFF` | — | page surface |
| `neutral.25` | `#FCFCFD` | 1.03 | subtle surface |
| `neutral.50` | `#F8FAFC` | 1.05 | raised / alternating sections |
| `neutral.100` | `#F1F5F9` | 1.10 | hover rows, chips |
| `neutral.200` | `#E2E8F0` | 1.23 | decorative dividers |
| `neutral.300` | `#CBD5E1` | 1.48 | borders, disabled BG |
| `neutral.500` | `#64748B` | 4.76 | tertiary text, disabled text |
| `neutral.700` | `#334155` | 10.35 | secondary text |
| `neutral.900` | `#0F172A` | 17.85 | primary text, dark sections |
(Steps 400/600/800 aren't defined in the image. Values match Tailwind's slate scale plus #FCFCFD.)

### 3.4 Functional colors (section 4)
| State | Base | Light BG | Dark emphasis | Measured |
|---|---|---|---|---|
| Success | `#15803D` | `#F0FDF4` | `#166534` | white on base 5.02 · dark on light 6.81 |
| Warning | `#B45309` | `#FFFBEB` | `#92400E` | white on base 5.02 · base on light 4.84 · dark on light 6.84 — **passes AA** |
| Error | `#DC2626` | `#FEF2F2` | `#991B1B` | white on base 4.83 · **base on light BG 4.41 (fails AA normal)** → use dark #991B1B for error text on light BG · dark on light 7.60 |
| Information | `#2563EB` | `#EFF6FF` | `#1D4ED8` | white on base 5.17 · base on light 4.75 · dark on light 6.16 |
Info base #2563EB is close to the action blue #1F63CC; don't use info-blue for clickable elements.

### 3.5 Primary action (section 5, "Use for buttons, key interactive states, and focus feedback")
Primary action color: **#1F63CC** (Saad, chat, 2026-10-09, per the guide) — kept after the palette change. Clash check: ΔE76 to the new Air #037AE2 is 10.5 (clearly different but same hue family; both read as "blue"), to Air-700 #0156A2 18.0; info-blue #2563EB vs Air 24.3. Not a hard clash, but a blue Air badge next to a blue button can be mistaken for clickable → keep Air for mode identity only (icons, legend, chips), never as button/link color [NEED: Saad OK].
| State | Token | Hex | Measured |
|---|---|---|---|
| Default | `action.default` | `#1F63CC` | white text **5.65:1 (AA)**; as link text on white 5.65:1 |
| Hover | `action.hover` | `#174FA5` | white 7.78:1 |
| Pressed | `action.pressed` | `#123D82` | white 10.42:1 |
| Focus ring | `action.focus-ring` | `#8AB6FF` | **FAILS 3:1**: 2.06:1 vs white, 2.75:1 vs #1F63CC. A ring in this color alone isn't visible enough (WCAG 2.4.11/1.4.11). Option: 2px #1F63CC (or #0F172A) inner ring + #8AB6FF outer halo [NEED: Saad decide] |
| Disabled BG | `action.disabled-bg` | `#CBD5E1` | 1.48:1 vs white (disabled controls are exempt, but the button outline nearly disappears on white) |
| Disabled text | `action.disabled-text` | `#64748B` | **3.21:1 on #CBD5E1** — below 4.5 (exempt as disabled, but hard to read) |

### 3.6 Other measured pairs / flags
- Text: #0F172A on white 17.85 · #334155 on white 10.35 · #64748B on white 4.76, on #F8FAFC 4.55, **on #F1F5F9 4.34 (fails AA normal)** → don't put neutral-500 text on neutral-100.
- Form-field borders in #CBD5E1 (1.48:1) or #E2E8F0 (1.23:1) fail the 3:1 needed for input boundaries; use neutral-500 #64748B (4.76:1) for input borders [NEED: Saad OK].
- Mode colors now equal the logo colors (§3.1).
Light/dark: light UI with dark sections in neutral-900 (from [S1] neutrals); dark mode: [NEED: Saad].

## 4. Typography — APPROVED: Geist + Geist Mono (Saad, chat, 2026-10-09 22:05)
Brief (Saad, chat, 2026-10-09): close in feel to the predecessor's intended Helvetica-like grotesk but better; no reuse of the predecessor's fonts; no mono uppercase eyebrows.
- **Recommendation: Geist (sans) + Geist Mono (data only).** SIL OFL 1.1, © Vercel with basement.studio; files from the official `geist` npm package v1.7.2 (repo github.com/vercel/geist-font; font version 1.800), self-hosted woff2 in `assets/fonts/`. Why: a refined Swiss neo-grotesk in the same family of feel, but a stable v1.x release (not pre-1.0), variable weight 100–900, tabular figures (`tnum`), full German coverage incl. „“ and capital ẞ, and a matching mono whose digits are naturally tabular for rate tables and codes (FCL, THC, BAF). Inter was excluded on purpose (used for the predecessor's decks).
- Runner-up: **Schibsted Grotesk** (OFL 1.1, Schibsted) — has `tnum` and slashed zero, a bit more character; weights 400–900 only, no matching mono.
- Evaluated and set aside: Instrument Sans (OFL; `tnum` but weights 400–700 only, 501 glyphs, no №), Hanken Grotesk (OFL; **no `tnum`**). Caveat on Geist: very widespread in 2025–26 SaaS/dev-tool UIs, so less distinctive on its own.
- Use: headings Geist 600, tight tracking (−0.02/−0.025em); body Geist 400, 16px+/1.6; figures with `font-variant-numeric: tabular-nums`; Geist Mono only for data, figures, codes — never uppercase letter-spaced labels.
- Specimen: `assets/images/source/multimodalis-type-specimen.png` (headline, DE body with umlauts, tabular numbers, buttons on #1F63CC, logo, mode colors; rendered with headless Chrome 2026-10-09).
- Headings balanced (`text-wrap: balance`), body measure 65–75ch
- German compounds: allow `hyphens: auto` with `lang` set; test longest DE headline at 320px
- No Google Fonts CDN (privacy, see de-legal-pages): self-host only

## 5. Spacing, grid, radius, depth
- Spacing scale: `space.*` (template default); more space above a heading than below
- Grid: [NEED: e.g. 12-col, max-width `layout.maxWidth`]
- Radius: [NEED (Saad)] · Shadows: [NEED or "none — flat world" (Saad)]

## 6. Components (brand-specific treatment)
| Component | Treatment |
|---|---|
| Buttons (primary / secondary / ghost) | Primary: #1F63CC fill, white text (5.65:1), hover #174FA5, pressed #123D82, disabled #CBD5E1/#64748B (from [S1] §5). Shape/radius/size: [NEED] |
| Links | #1F63CC on white (5.65:1); underline style: [NEED] |
| Header / nav / language switcher | [NEED] |
| Section backgrounds / dividers | neutral-0 / neutral-50, dividers neutral-200 (proposal) |
| Forms | borders neutral-500 for AA (see §3.6); error text #991B1B on #FEF2F2 [NEED: confirm] |
| Footer (legal links, language) | [NEED] |
| Mode labels / chips | mode 50/100 tint background + mode 700/900 text (proposal) |
| Icons | [NEED: library or authored SVG set, stroke weight] |

## 7. Imagery & assets
- Photography/illustration style: [NEED]
- **Logo** ([S2]): stylized "M" in four segments — dark grey top-left, teal bottom-left, magenta top-right, blue right leg — on white. Files in `assets/logo/`. Approved by Saad as the logo (chat, 2026-10-09). Clear space / min size / dark-background version: [NEED].
  - The supplied SVG is **not vector**: it is a RealFaviconGenerator wrapper (1,092,547 bytes; 11 elements, 0 paths) that embeds the PNG as base64 (byte-identical to the supplied PNG) inside a 1000×1000 white rounded square (rx 250). It renders correctly in headless Chrome, but only as a raster. A true vector logo is needed for crisp scaling [NEED: Saad / designer].
  - The supplied PNG (1254×1254, RGB, white background, not transparent) carries C2PA content credentials naming "OpenAI Media Service API" / "gpt-image", digital source type `trainedAlgorithmicMedia`, dated 2026-08-06 → AI-generated. Saad approved it as the logo; recorded for provenance.
  - **Logo colors vs. core palette** (sampled medians of 41×41 px patches; ΔE = CIE76):
    | Segment | Sampled | Palette | ΔRGB | ΔE | white contrast |
    |---|---|---|---|---|---|
    | Grey (top-left) ~ Road | `#455161` | `#374151` | +14/+16/+16 | 6.8 | 8.07 |
    | Teal (bottom-left) ~ Sea | `#0294AB` | `#007C91` | +2/+24/+26 | 9.5 | 3.60 |
    | Magenta (top-right) ~ Rail | `#D11767` | `#8F3D56` | +66/−38/+17 | **34.1** | 5.21 |
    | Blue (right leg) ~ Air | `#037AE2` | `#3A86FF` | −55/−12/−29 | 11.2 | 4.30 |
    Resolved 2026-10-09 22:05 (Saad, chat): the palette now uses these sampled logo colors (§3.1); logo unchanged.
- Favicon: supplied ICO (16/32/48 px) + derived PNGs (32, 180 apple-touch, 192) in `assets/favicon/`. No SVG favicon derived (the only SVG is a raster wrapper).
- OG image template: [NEED]
- Never: stock photos without a licence record in `assets/README.md`; AI-generated images unless Saad approves.

## 8. Motion
[NEED: none / one authored moment; respect prefers-reduced-motion]

## 9. Do / Don't
- Do: neutrals first; mode colors only for modes; #1F63CC for action; dark text on Air-500 at normal size.
- Don't: info-blue or Air-700 for non-clickable emphasis next to buttons; neutral-500 text on neutral-100; #8AB6FF focus ring alone; 300-step colors for text.
- House bans (all brands): gradient text, eyebrow/kicker labels above headings, fake metric heroes, emoji as icons, invented logos/customers.
