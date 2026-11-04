#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════════╗
║  VEREINHEITLICHER — gleiche Navigation & gleicher Hintergrund überall    ║
╠══════════════════════════════════════════════════════════════════════════╣
║  1) Nav-Links: jede Seite bekommt dieselbe Linkreihenfolge, der Link auf ║
║     die aktuelle Seite wird automatisch als .active markiert.           ║
║  2) Hintergrund: .aurora + .grid-overlay werden ergänzt, wo sie fehlen  ║
║     (einheitliches Licht + Haarlinien-Raster auf allen Seiten).         ║
║  3) Sicherungen: vor jeder Änderung wird .bak angelegt; der Lauf ist    ║
║     idempotent (mehrfaches Ausführen ändert nichts mehr).               ║
╚══════════════════════════════════════════════════════════════════════════╝
"""
import io, os, re, shutil, sys

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')

# Dieselbe Reihenfolge auf JEDER Seite — die Reihenfolge ist Design.
NAV = [
    ('Start',        '/'),
    ('Features',     '/features.html'),
    ('Befehle',      '/cmd.html'),
    ('Spiele',       '/spiele.html'),
    ('Level',        '/level.html'),
    ('Status',       '/status.html'),
    ('Bestenliste',  '/leaderboard.html'),
    ('Statistiken',  '/statistics.html'),
    ('Docs',         '/docs.html'),
    ('FAQ',          '/faq.html'),
]

BG = '<div class="aurora"></div>\n<div class="grid-overlay"></div>\n'

# Seiten, die bewusst anders aussehen (Night-Shell, Weiterleitung, Testseite)
SKIP = {'app.html', 'commands.html', 'test.html'}


def nav_html(page):
    links = []
    for label, href in NAV:
        cls = ' class="active"' if href == '/' + page or (href == '/' and page == 'index.html') else ''
        links.append(f'    <a href="{href}"{cls}>{label}</a>')
    return (
        '  <nav class="nav-links">\n'
        + '\n'.join(links)
        + '\n    <a class="cta-mobile" href="/login.html"><span class="btn" style="padding:12px 22px">Einloggen</span></a>\n'
        + '  </nav>'
    )


def has_bg(s):
    return 'class="aurora"' in s


def normalize(path):
    name = os.path.basename(path)
    src = io.open(path, encoding='utf-8').read()
    out = src
    log = []

    # ── 1) Navigation ─────────────────────────────────────────────────
    m = re.search(r'[ \t]*<nav class="nav-links">.*?</nav>', out, re.S)
    if m:
        new = nav_html(name)
        if m.group(0).strip() != new.strip():
            out = out[:m.start()] + new + out[m.end():]
            log.append('Navigation vereinheitlicht')

    # ── 2) Hintergrund ────────────────────────────────────────────────
    if not has_bg(out):
        bm = re.search(r'<body[^>]*>\s*', out)
        if bm:
            out = out[:bm.end()] + BG + out[bm.end():]
            log.append('Aurora + Raster ergänzt')

    if out == src or not log:
        return None
    shutil.copy2(path, path + '.bak')
    io.open(path, 'w', encoding='utf-8').write(out)
    return log


def main():
    files = sorted(f for f in os.listdir(ROOT) if f.endswith('.html') and f not in SKIP)
    changed = 0
    for f in files:
        log = normalize(os.path.join(ROOT, f))
        if log:
            changed += 1
            print(f'✅ {f}')
            for l in log:
                print(f'   · {l}')
    print(f'\n{changed} von {len(files)} Seiten angepasst.')
    print('Sicherungen liegen als *.html.bak daneben (können gelöscht werden, wenn alles passt).')


if __name__ == '__main__':
    main()
