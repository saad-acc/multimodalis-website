import re,sys
C={'en':{'hero':['One unified pricing platform','Complete cost transparency','Supporting RFQ / Tender'],
 'cov':['All transport modes','All cost elements per route','Daily exchange rates','Unified pricing logic of all carriers'],
 'tech':['Made in Germany','Hosted in Europe','GDPR aligned','Monitored 24/7']},
 'de':{'hero':['Eine einheitliche Pricing-Plattform','Vollständige Kostentransparenz','Unterstützt RFQ / Ausschreibungen'],
 'cov':['Alle Verkehrsträger','Alle Kostenelemente pro Route','Tägliche Wechselkurse','Einheitliche Preislogik aller Carrier'],
 'tech':['Made in Germany','Gehostet in Europa','DSGVO-konform','24/7 überwacht']}}
def apply(s,lang,live=True):
    c=C[lang];n=0
    if live:
        hero='<div class="hero-stats claims">'+''.join(f'\n<div class="hero-stat"><div class="stat-num">{t.replace(" / ", "&nbsp;/ ")}</div></div>' for t in c['hero'])+'\n</div>\n'
        s,k=re.subn(r'<div class="hero-stats">.*?</div>\n(?=</div>\n<div class="fade-up visible hero-globe">)',hero,s,flags=re.S);n+=k
        rows=''.join(f'<div class="cstat-row cstat-claim"><span class="cstat-check" aria-hidden="true"></span><span>{t}</span></div>\n' for t in c['cov'])
        s,k=re.subn(r'(<div class="cstat-row">.*?</div>\n){4}',rows,s,flags=re.S);n+=k
        bar='<div class="stat-bar claims">'+''.join(f'\n<div class="stat-bar-item"><div class="stat-bar-num">{t}</div></div>' for t in c['tech'])+'\n</div>'
        s,k=re.subn(r'<div class="stat-bar">.*?</div>\s*</div>\s*</div>(?=\s*</div>\s*</div>\s*</section>)',bar,s,flags=re.S);n+=k
    return s,n
if __name__=='__main__':
    for p,l in [(a.split(':')[0],a.split(':')[1]) for a in sys.argv[1:]]:
        s=open(p).read();s,n=apply(s,l);open(p,'w').write(s);print(p,n)
