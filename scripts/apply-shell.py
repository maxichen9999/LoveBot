#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════════╗
║  GETEILTE KOMPONENTEN — aus 35× Kopie wird 1× Vorlage                    ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Ersetzt in jeder Seite                                                  ║
║    <header class="topnav"> … </header>   →  <header … id="site-nav">     ║
║    <footer> … </footer>                  →  <footer id="site-footer">    ║
║  und bindet js/site-shell.js VOR common.js ein.                          ║
║                                                                          ║
║  · Die bisherige Footer-Beschreibung wird als data-foot-desc gerettet    ║
║    (damit keine Seite ihren eigenen Text verliert).                      ║
║  · Backup: vor jeder Änderung <seite>.html.bak3 in backup-public-*/      ║
║  · Idempotent: mehrfaches Ausführen ändert nichts mehr.                  ║
╚══════════════════════════════════════════════════════════════════════════╝
"""
import io, os, re, shutil, sys

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')
BAK = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backup-public-2026-10-02-stand')
SKIP = {'app.html', 'commands.html', 'test.html'}   # Night-Shell · Weiterleitung · Testseite

HEADER_RE = re.compile(r'<header class="topnav"[^>]*>.*?</header>', re.S)
FOOTER_RE = re.compile(r'<footer[^>]*>.*?</footer>', re.S)
DESC_RE = re.compile(r'<p class="foot-desc">(.*?)</p>', re.S)
SHELL_TAG = '<script src="/js/site-shell.js"></script>'


def clean_text(s):
    s = re.sub(r'<[^>]+>', '', s or '')
    s = s.replace('&amp;', '&').replace('&nbsp;', ' ').replace('&quot;', '"').replace('&#39;', "'")
    return re.sub(r'\s+', ' ', s).strip()


def backup(path, name):
    os.makedirs(BAK, exist_ok=True)
    dst = os.path.join(BAK, name + '.bak3')
    shutil.copy2(path, dst)


def apply(path):
    name = os.path.basename(path)
    src = io.open(path, encoding='utf-8').read()
    out = src
    log = []

    # ── 1) Navigation ──────────────────────────────────────────────────
    if 'id="site-nav"' not in out:
        m = HEADER_RE.search(out)
        if m:
            out = out[:m.start()] + '<header class="topnav" id="site-nav"></header>' + out[m.end():]
            log.append('Navigation → Vorlage')

    # ── 2) Footer (mit Rettung der Beschreibung) ───────────────────────
    if 'id="site-footer"' not in out:
        m = FOOTER_RE.search(out)
        if m:
            block = m.group(0)
            d = DESC_RE.search(block)
            desc = clean_text(d.group(1)) if d else ''
            attrs = ' id="site-footer"'
            if desc:
                attrs += ' data-foot-desc="%s"' % desc.replace('"', '&quot;')
            out = out[:m.start()] + '<footer%s></footer>' % attrs + out[m.end():]
            log.append('Footer → Vorlage' + (' (Beschreibung übernommen)' if desc else ''))

    # ── 3) Shell-Skript einbinden (vor common.js, sonst vor </body>) ───
    if SHELL_TAG not in out:
        idx = out.find('<script src="/js/common.js">')
        if idx == -1:
            idx = out.rfind('</body>')
            ins = '  ' + SHELL_TAG + '\n'
            out = out[:idx] + ins + out[idx:]
        else:
            out = out[:idx] + SHELL_TAG + '\n  ' + out[idx:]
        log.append('site-shell.js eingebunden')

    if out == src or not log:
        return None
    backup(path, name)
    io.open(path, 'w', encoding='utf-8').write(out)
    return log


def main():
    files = sorted(f for f in os.listdir(ROOT) if f.endswith('.html') and f not in SKIP)
    n = 0
    for f in files:
        log = apply(os.path.join(ROOT, f))
        if log:
            n += 1
            print('✅ %-22s %s' % (f, ' · '.join(log)))
    print('\n%d von %d Seiten auf die geteilte Shell umgestellt.' % (n, len(files)))


if __name__ == '__main__':
    main()
