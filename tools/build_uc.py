#!/usr/bin/env python3
"""Build the UC-style home pages (/en/, /de/) from the content of the main-branch pages.
Content is extracted verbatim from origin/main:site/<lang>/index.html (no new copy is written here).
Run from repo root:  python3 tools/build_uc.py"""
import re, subprocess, copy
from bs4 import BeautifulSoup

def src(lang):
    return subprocess.check_output(['git', 'show', f'origin/main:site/{lang}/index.html']).decode()

def inner(el): return el.decode_contents().strip() if el else ''
def txt(el): return el.get_text(' ', strip=True) if el else ''

def two_tone(html_text, tag='h2', cls='', ratio=0.45):
    """Split a heading into a muted first part and a strong second part, each in a reveal mask."""
    s = BeautifulSoup(html_text, 'html.parser').get_text(' ', strip=True)
    w = s.split()
    k = max(1, round(len(w) * ratio)) if len(w) > 1 else 0
    a, b = ' '.join(w[:k]), ' '.join(w[k:])
    esc = lambda t: t.replace('&', '&amp;')
    parts = (f'<span class="ln"><span class="mut">{esc(a)}</span></span> ' if a else '') + f'<span class="ln"><span>{esc(b)}</span></span>'
    return f'<{tag} class="tt {cls}">{parts}</{tag}>'

def build(lang):
    raw = src(lang)
    S = BeautifulSoup(raw, 'html.parser')
    sec = lambda i: S.find(id=i)
    head = raw.split('<body>')[0]
    head = head.replace('../assets/css/site.css', '../assets/css/uc.css').replace('../assets/js/main.js', '../assets/js/uc.js')
    head = head.replace('<meta name="theme-color" content="#FFFFFF">', '<meta name="theme-color" content="#0F172A">')
    nav = S.find('nav', class_='site-nav')
    skip = str(S.find('a', class_='skip-link'))
    banner = str(S.find('div', class_='draft-banner'))
    navlinks = [(a['href'], txt(a)) for a in S.select('#mobile-menu > a[href^="#"]')]
    cta_txt = txt(nav.select_one('.nav-btn'))
    lang_toggle = str(nav.select_one('.nav-cta .lang-toggle'))
    mobile_lang = str(nav.select_one('#mobile-menu .lang-toggle'))
    open_label = nav.select_one('.mobile-toggle')['aria-label']
    nav_aria = nav['aria-label']

    # hero
    h = S.select_one('section.hero')
    tag = inner(h.select_one('.hero-tagline'))
    h1spans = h.select('h1 > span')
    h1a, h1b = txt(h1spans[0]), txt(h1spans[1])
    sub = inner(h.select_one('.hero-sub'))
    btns = h.select('.hero-cta a')
    stats = [(inner(x.select_one('.stat-num')), inner(x.select_one('.stat-label'))) for x in h.select('.hero-stat')]
    globe = inner(h.select_one('.hero-globe'))

    it = sec('intro')
    intro_tag = txt(it.select_one('.intro-tagline')); intro_h2 = txt(it.h2); intro_lead = inner(it.select_one('.intro-lead'))
    intro_cards = [(inner(c.select_one('.platform-icon')), inner(c.h4), inner(c.p)) for c in it.select('.platform-card')]

    pl = sec('platform')
    pl_h2, pl_p = txt(pl.h2), inner(pl.select_one('.section-header p'))
    pl_cards = [(inner(c.select_one('.platform-icon')), inner(c.h4), inner(c.p)) for c in pl.select('.platform-card')]

    cv = sec('coverage')
    cv_h2, cv_p = txt(cv.h2), inner(cv.select_one('.coverage-header p'))
    modes = [(c.img['src'], inner(c.h3), inner(c.p)) for c in cv.select('.mode-card')]
    comp_h3 = inner(cv.select_one('.cstrip-left h3'))
    comps = [txt(c) for c in cv.select('.comp-item')]
    why_h3 = inner(cv.select_one('.cstrip-right h3')); why_p = inner(cv.select_one('.cstrip-right p'))
    crows = [(inner(r.find_all('span')[0]), inner(r.select_one('.cstat-val'))) for r in cv.select('.cstat-row')]

    ee = sec('end-to-end')
    ee_h2, ee_p, ee_key = txt(ee.h2), inner(ee.select_one('.section-header p')), inner(ee.select_one('.key-message'))
    chain = [(txt(c.select_one('.phase-badge')), inner(c.select_one('.phase-label')), [inner(li) for li in c.select('li')], 'main' in c['class']) for c in ee.select('.chain-col')]
    ee_foot = inner(ee.select_one('.chain-footer p'))

    hw = sec('how-it-works')
    hw_h2, hw_p = txt(hw.h2), inner(hw.select_one('.section-header p'))
    steps = [(txt(c.select_one('.step-num')).replace('—', '').strip(), inner(c.h4), inner(c.p)) for c in hw.select('.step-card')]

    of = sec('offers')
    of_h2, of_p = txt(of.h2), inner(of.select_one('.section-header p'))
    of_blocks = [(inner(b.h3), [inner(li) for li in b.select('li')]) for b in of.select('.feature-block')]

    uc = sec('use-cases')
    uc_h2, uc_p = txt(uc.h2), inner(uc.select_one('.section-header p'))
    ucs = [(inner(c.h3), inner(c.p)) for c in uc.select('.usecase-card')]

    tc = sec('technology')
    tc_h2, tc_p = txt(tc.h2), inner(tc.select_one('.section-header p'))
    tcs = [(inner(c.h4), inner(c.p)) for c in tc.select('.tech-card')]
    tbar = [(inner(c.select_one('.stat-bar-num')), inner(c.select_one('.stat-bar-label'))) for c in tc.select('.stat-bar-item')]

    fq = sec('faq')
    fq_h2 = txt(fq.h2)
    faqs = [(inner(i.select_one('.faq-toggle span')), inner(i.select_one('.faq-content'))) for i in fq.select('.faq-item')]

    wt = sec('working-together')
    wt_h2, wt_p = txt(wt.h2), inner(wt.select_one('.section-header p'))
    wt_blocks = [(inner(b.h3), [inner(li) for li in b.select('li')]) for b in wt.select('.feature-block')]
    wt_btn = wt.select_one('.feature-cta')

    ct = sec('contact')
    ct_h2, ct_p = txt(ct.h2), inner(ct.select_one('.section-header p'))
    why_title = inner(ct.select_one('.why-title'))
    whys = [inner(w.find_all('span')[1]) for w in ct.select('.why-item')]
    tbox = ct.select_one('.tagline-box')
    form_box = ct.select_one('.form-box')

    ft = S.find('footer')
    f_brand_p = inner(ft.select_one('.footer-brand p'))
    f_cols = ft.select('.footer-col-title')
    f_links = [(a['href'], txt(a)) for a in ft.select('.footer-links a')]
    f_contact = str(ft.select_one('.footer-contact-link'))
    f_copy = inner(ft.select_one('.footer-copy'))
    f_motto = inner(ft.select_one('.footer-motto'))
    tail = raw[raw.index('<script type="application/ld+json">'):]

    arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14m-5-5 5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    mode_key = ['sea', 'road', 'rail', 'air']   # order of mode cards: Ocean, Road, Intermodal, Airfreight
    o = []
    w = o.append
    w(head + '<body class="uc">\n' + skip + '\n' + banner + '\n')
    w('<div class="curtain" aria-hidden="true"><span class="curtain-bar"></span></div>\n')
    w('<div class="cursor" aria-hidden="true"><span class="cursor-dot"></span><span class="cursor-ring"></span></div>\n')
    w(f'<a class="side-tab" href="#contact">{cta_txt}</a>\n')
    # header
    w(f'<header class="hd" data-hd><nav aria-label="{nav_aria}" class="hd-inner">'
      f'<a class="hd-logo" href="./"><img alt="" height="32" src="../assets/logo/multimodalis-logo-64.png" width="32">Multimodalis</a>'
      '<div class="hd-links">' + ''.join(f'<a href="{hr}">{t}</a>' for hr, t in navlinks) + '</div>'
      f'<div class="hd-right">{lang_toggle}<a class="pill pill-light hd-cta" href="#contact">{cta_txt}</a>'
      f'<button aria-controls="mobile-menu" aria-expanded="false" aria-label="{open_label}" class="mobile-toggle" type="button"><span></span><span></span></button></div>'
      '</nav><div id="mobile-menu">' + ''.join(f'<a href="{hr}">{t}</a>' for hr, t in navlinks) + mobile_lang +
      f'<a class="pill pill-blue" href="#contact">{cta_txt}</a></div></header>\n<main id="main">\n')
    # 1 HERO
    w(f'''<section class="s-hero" data-scene="hero" aria-labelledby="hero-title">
<div class="s-hero-stick">
<div class="hero-stars" aria-hidden="true"></div>
<div class="hero-glow" aria-hidden="true"></div>
<div class="hero-globe-wrap">{globe}</div>
<div class="wrap hero-text">
<p class="label rv"><span class="label-line"></span>{tag}</p>
<h1 id="hero-title" class="display"><span class="ln"><span class="mut">{h1a}</span></span> <span class="ln"><span>{h1b}</span></span></h1>
<p class="hero-desc rv">{sub}</p>
<div class="hero-btns rv"><a class="pill pill-blue" href="{btns[0]['href']}">{txt(btns[0])}</a><a class="pill pill-ghost" href="{btns[1]['href']}">{txt(btns[1])}</a></div>
</div>
</div>
</section>
''')
    # 2 INTRO
    w(f'''<section class="s-intro" id="intro">
<div class="intro-glow" aria-hidden="true"></div>
<div class="wrap intro-grid">
<div class="intro-left">
<p class="label rv"><span class="label-line"></span>{intro_tag}</p>
{two_tone(intro_h2, 'h2', 'display-2')}
<p class="intro-lead rv">{intro_lead}</p>
<ul class="intro-mini">''' + ''.join(f'<li class="rv"><span class="ico">{ic}</span><span><strong>{t}</strong> {p}</span></li>' for ic, t, p in intro_cards) + '''</ul>
</div>
<div class="intro-stats">''' + ''.join(f'<div class="stat rv"><div class="stat-big">{n}</div><span class="stat-line"></span><div class="stat-desc">{l}</div></div>' for n, l in stats) + '''</div>
</div>
</section>
''')
    # 3 SERVICES (coverage scrollytelling + platform dark grid)
    w(f'''<section class="s-svc" id="coverage" aria-labelledby="cov-title">
<div class="svc-pin" data-scene="svc">
<div class="svc-stick">
<div class="svc-marquee" aria-hidden="true"><span>{cv_h2}</span><span>{cv_h2}</span></div>
<div class="wrap svc-head"><h2 id="cov-title" class="tt display-2"><span class="ln"><span>{cv_h2}</span></span></h2><p class="svc-lead">{cv_p}</p></div>
<div class="svc-stage" aria-hidden="true">
<div class="svc-ground"></div>
<div class="svc-meter"><span class="svc-meter-n mono">01</span><span class="svc-meter-of mono">/ 04</span></div>
<div class="svc-rig">
<div class="svc-box"><span></span><span></span><span></span><span></span><span></span><span></span></div>
<div class="carriers"><svg class="carrier carrier-sea" viewBox="0 0 400 80"><path d="M10 20h380l-40 50H60z"/><rect x="40" y="28" width="320" height="6" opacity=".35" fill="#fff"/></svg>
<svg class="carrier carrier-road" viewBox="0 0 400 80"><rect x="20" y="10" width="300" height="16" rx="2"/><rect x="320" y="-30" width="70" height="56" rx="6"/><circle cx="70" cy="40" r="14"/><circle cx="110" cy="40" r="14"/><circle cx="350" cy="40" r="14"/></svg>
<svg class="carrier carrier-rail" viewBox="0 0 400 80"><rect x="10" y="10" width="380" height="14" rx="2"/><circle cx="60" cy="36" r="11"/><circle cx="90" cy="36" r="11"/><circle cx="310" cy="36" r="11"/><circle cx="340" cy="36" r="11"/><rect x="0" y="52" width="400" height="4"/></svg>
<svg class="carrier carrier-air" viewBox="0 0 400 80"><path d="M0 30h330c40 0 70 8 70 14s-30 14-70 14H20z"/><path d="M150 44l60 36h30l-30-36z" opacity=".8"/></svg></div>
</div>
</div>
<div class="wrap svc-modes">''' + ''.join(f'<article class="svc-mode" data-mode="{mode_key[i]}"><span class="svc-mode-chip"></span><h3>{t}</h3><p>{p}</p></article>' for i, (_, t, p) in enumerate(modes)) + f'''</div>
</div>
</div>
<div class="svc-dark" id="platform">
<div class="wrap">
<div class="svc-dark-head">{two_tone(pl_h2, 'h2', 'display-2 on-dark')}<p class="rv">{pl_p}</p></div>
<div class="svc-grid">''' + ''.join(f'<article class="svc-item rv"><span class="svc-ico">{ic}</span><h3>{t}</h3><p>{p}</p></article>' for ic, t, p in pl_cards) + f'''</div>
</div>
</div>
</section>
''')
    # 4 WHY (how-it-works pinned route + end-to-end sea panel)
    w(f'''<section class="s-why" id="how-it-works">
<div class="why-pin" data-scene="why">
<div class="why-stick">
<div class="wrap why-grid">
<div class="why-left">{two_tone(hw_h2, 'h2', 'display-2')}<p class="rv">{hw_p}</p></div>
<div class="why-route" aria-hidden="true"><svg viewBox="0 0 40 600" preserveAspectRatio="none"><line class="why-road" x1="20" y1="0" x2="20" y2="600"/><line class="why-road-fill" x1="20" y1="0" x2="20" y2="600" pathLength="1"/></svg><span class="why-puck"></span></div>
<ol class="why-steps">''' + ''.join(f'<li class="why-step" data-i="{i}"><span class="why-num mono">{n}</span><h3>{t}</h3><p>{p}</p></li>' for i, (n, t, p) in enumerate(steps)) + f'''</ol>
</div>
</div>
</div>
<div class="why-sea" id="end-to-end">
<div class="sea-waves" aria-hidden="true"></div>
<div class="wrap">
<div class="sea-head">{two_tone(ee_h2, 'h2', 'display-2 on-dark center')}<p class="rv">{ee_p}</p><p class="sea-key rv">{ee_key}</p></div>
<div class="chain" data-chain>
<div class="chain-track" aria-hidden="true"><span class="chain-dot"></span></div>
''' + ''.join(f'<div class="chain-col rv{" is-main" if m else ""}"><span class="chain-badge mono">{b}</span><h3>{l}</h3><ul>' + ''.join(f'<li>{x}</li>' for x in li) + '</ul></div>' for b, l, li, m in chain) + f'''
</div>
<p class="chain-foot rv">{ee_foot}</p>
</div>
</div>
</section>
''')
    # 5 TESTI -> use cases
    w(f'''<section class="s-uc" id="use-cases" data-scene="uc">
<div class="uc-sky" aria-hidden="true"><span class="cloud c1"></span><span class="cloud c2"></span><span class="cloud c3"></span>
<svg class="uc-plane" viewBox="0 0 200 200"><path d="M100 6c7 0 11 10 11 22v46l78 40v16l-78-22v44l22 16v12l-33-9-33 9v-12l22-16v-44l-78 22v-16l78-40V28c0-12 4-22 11-22z"/></svg></div>
<div class="wrap uc-grid">
<div class="uc-title">{two_tone(uc_h2, 'h2', 'display-2')}<p class="rv">{uc_p}</p></div>
<div class="uc-cards">''' + ''.join(f'<article class="uc-card rv"><span class="uc-idx mono">{i+1:02d}</span><h3>{t}</h3><p>{p}</p></article>' for i, (t, p) in enumerate(ucs)) + '''</div>
</div>
</section>
''')
    # 6 PARTNERS -> components grid + offers
    w(f'''<section class="s-grid" id="offers">
<div class="wrap">
<div class="grid-cat"><p class="label rv"><span class="label-line"></span>{comp_h3}</p>
<div class="hair-grid hg-4">''' + ''.join(f'<div class="hg-cell rv"><span class="hg-n mono">{i+1:02d}</span>{c.replace("&", "&amp;")}</div>' for i, c in enumerate(comps)) + f'''</div>
<div class="why-pricing rv"><h3>{why_h3}</h3><p>{why_p}</p><dl>''' + ''.join(f'<div><dt>{a}</dt><dd class="mono">{b}</dd></div>' for a, b in crows) + f'''</dl></div>
</div>
<div class="grid-cat">{two_tone(of_h2, 'h2', 'display-3')}<p class="grid-lead rv">{of_p}</p>
<div class="hair-grid hg-2">''' + ''.join(f'<div class="hg-col rv"><h3>{t}</h3><ul>' + ''.join(f'<li>{x}</li>' for x in li) + '</ul></div>' for t, li in of_blocks) + f'''</div>
</div>
</div>
<div class="grid-glow" aria-hidden="true"></div>
</section>
''')
    # 7 INSIGHTS -> technology dark list
    w(f'''<section class="s-list" id="technology">
<div class="wrap">
<div class="list-head">{two_tone(tc_h2, 'h2', 'display-2 on-dark')}<p class="rv">{tc_p}</p></div>
<ul class="rows">''' + ''.join(f'<li class="row rv"><span class="row-meta mono">{i+1:02d}</span><h3>{t}</h3><p>{p}</p><span class="row-arrow">{arrow}</span></li>' for i, (t, p) in enumerate(tcs)) + '''</ul>
<div class="list-bar">''' + ''.join(f'<div class="rv"><span class="mono">{a}</span><span>{b}</span></div>' for a, b in tbar) + '''</div>
</div>
</section>
''')
    # 8 FAQ
    w(f'''<section class="s-faq" id="faq">
<div class="wrap faq-grid">
<div class="faq-left">{two_tone(fq_h2, 'h2', 'display-2', 0.5)}</div>
<div class="faq-list">''' + ''.join(f'<div class="faq-item rv"><h3><button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a{i}" id="faq-q{i}"><span>{q}</span><span class="faq-plus" aria-hidden="true"></span></button></h3><div class="faq-a" id="faq-a{i}" role="region" aria-labelledby="faq-q{i}"><div class="faq-a-in"><p>{a}</p></div></div></div>' for i, (q, a) in enumerate(faqs)) + '''</div>
</div>
</section>
''')
    # 9 CTA -> works alongside TMS + contact
    w(f'''<section class="s-cta" id="working-together">
<div class="cta-dots" aria-hidden="true"></div>
<div class="wrap">
<div class="cta-head">{two_tone(wt_h2, 'h2', 'display on-dark center', 0.5)}<p class="rv">{wt_p}</p></div>
<div class="cta-cols">''' + ''.join(f'<div class="cta-col rv"><h3>{t}</h3><ol>' + ''.join(f'<li>{x}</li>' for x in li) + '</ol></div>' for t, li in wt_blocks) + f'''</div>
<div class="cta-btn rv"><a class="pill pill-blue" href="{wt_btn['href']}">{txt(wt_btn)}</a></div>
</div>
<div class="wrap s-contact" id="contact">
<div class="contact-head">{two_tone(ct_h2, 'h2', 'display-3 on-dark')}<p class="rv">{ct_p}</p></div>
<div class="contact-grid">
<div class="contact-why rv"><h3>{why_title}</h3><ul>''' + ''.join(f'<li>{x}</li>' for x in whys) + f'''</ul><div class="contact-tag"><strong>{txt(tbox.select_one('.tagline-box-name'))}</strong><p>{inner(tbox.p)}</p></div></div>
<div class="form-box rv">{inner(form_box)}</div>
</div>
</div>
</section>
</main>
''')
    # FOOTER
    w(f'''<footer class="ft" data-scene="ft">
<div class="wrap ft-top">
<div class="ft-brand"><a class="hd-logo" href="./"><img alt="" height="32" src="../assets/logo/multimodalis-logo-64.png" width="32">Multimodalis</a><p>{f_brand_p}</p></div>
<div><p class="ft-title">{txt(f_cols[0])}</p><ul>''' + ''.join(f'<li><a href="{hr}">{t}</a></li>' for hr, t in f_links) + f'''</ul></div>
<div><p class="ft-title">{txt(f_cols[1])}</p>{f_contact}</div>
</div>
<div class="wrap ft-bottom"><p class="ft-copy">{f_copy}</p><p class="ft-motto">{f_motto}</p></div>
<div class="ft-word" aria-hidden="true"><span>MULTIMODALIS</span></div>
</footer>
''')
    w(tail)
    out = ''.join(o)
    open(f'site/{lang}/index.html', 'w').write(out)
    print(lang, len(out))

for l in ('en', 'de'): build(l)
