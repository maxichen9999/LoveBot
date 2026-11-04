/* ═══════════════════════════════════════════════════════════════════════
   🧩  SITE-SHELL  —  geteiltes Layout für ALLE Seiten
   ─────────────────────────────────────────────────────────────────────
   Navigation und Footer existieren genau EINMAL — hier. Seiten schreiben
   nur noch zwei Platzhalter:

       <header class="topnav" id="site-nav"></header>
       …
       <footer id="site-footer"></footer>

   Navigation ändern ⇒ diese Datei ändern ⇒ alle Seiten sind aktuell.
   ─────────────────────────────────────────────────────────────────────
   Bewusst erhalten (andere Skripte hängen daran):
     · .cta            → common.js hängt daran die Notification-Glocke
     · .nav-links      → Mobile-Menü  (Burger schaltet .open)
     . .nav-burger     → bisher per onclick, jetzt sauber per Listener
     · #socials        → landing.js / Seiten füllen die Social-Links
     · #year           → wird mit dem aktuellen Jahr gefüllt
     · #footOwner      → landing.js schreibt den Owner hinein
   Falls ein Platzhalter fehlt, tut dieses Skript gar nichts (kein Fehler).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 🎀 Einheitlicher Feinschliff: ein kleiner Layer für Fokuszustände,
     Motion-Reduktion und den verbesserten Befehle-Browser. Er wird hier
     eingebunden, damit wirklich jede Seite denselben Look erhält. */
  (function loadPolishLayer() {
    if (!document.head || document.querySelector('link[data-lovebot-polish]')) return;
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/css/lovebot-polish.css';
    css.dataset.lovebotPolish = '1';
    document.head.appendChild(css);
  }());

  /* ── Konfiguration: HIER ändern, gilt überall ─────────────────────── */
  var BRAND = {
    name: 'HELLOKITTY BABY MAXI',
    logo: '/assets/img/Menu.png',
    alt: 'HelloKitty Baby Maxi',
    href: '/'
  };

  var NAV = [
    { label: 'Start',        href: '/' },
    { label: 'Features',     href: '/features.html' },
    { label: 'Befehle',      href: '/cmd.html' },
    { label: 'Spiele',       href: '/spiele.html' },
    { label: 'Changelog',    href: '/changelog.html', neu: true },
    { label: 'Galerie',      href: '/galerie.html', neu: true },
    { label: 'Level',        href: '/level.html' },
    { label: 'Status',       href: '/status.html' },
    { label: 'Bestenliste',  href: '/leaderboard.html' },
    { label: 'Statistiken',  href: '/statistics.html' },
    { label: 'Docs',         href: '/docs.html' },
    { label: 'HTTP-Codes',   href: '/http-codes.html' },
    { label: 'FAQ',          href: '/faq.html' }
  ];

  var FOOTER_NAV = [
    { label: 'Start',        href: '/' },
    { label: 'Features',     href: '/features.html' },
    { label: 'Befehle',      href: '/cmd.html' },
    { label: 'Changelog',    href: '/changelog.html', neu: true },
    { label: 'Galerie',      href: '/galerie.html' },
    { label: 'Level-System', href: '/level.html' },
    { label: 'Live-Status',  href: '/status.html' },
    { label: 'Statistiken',  href: '/statistics.html' },
    { label: 'Bestenliste',  href: '/leaderboard.html' },
    { label: 'HTTP-Codes',   href: '/http-codes.html' },
    { label: 'FAQ',          href: '/faq.html' }
  ];

  var FOOTER_LEGAL = [
    { label: 'Kontakt',     href: '/#kontakt' },
    { label: 'Datenschutz', href: '/datenschutz.html' },
    { label: 'Impressum',   href: '/impressum.html' },
    { label: 'Regeln',      href: '/regeln.html' },
    { label: 'Docs',        href: '/docs.html' }
  ];

  var DEFAULT_DESC = 'Der fröhliche WhatsApp-Bot — gebaut von Maxichen. Liebe, Spiele, Economy und ein Live-Dashboard in einem System. 🌸';

  /* ── Helfer ───────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Aktuelle Seite: '/' → 'index.html', '/cmd.html' → 'cmd.html' */
  function currentFile() {
    var p = String(location.pathname || '/');
    if (p === '/' || p === '') return 'index.html';
    var base = p.split('/').pop() || 'index.html';
    return base.indexOf('.') === -1 ? base + '.html' : base;
  }

  function isActive(href) {
    return href === '/' + currentFile() || (href === '/' && currentFile() === 'index.html');
  }

  function linkHtml(item, cls) {
    var mark = item.neu ? ' <span class="nav-neu">neu</span>' : '';
    return '<a href="' + esc(item.href) + '"' +
      (cls ? ' class="' + cls + '"' : '') +
      (isActive(item.href) ? ' aria-current="page"' : '') + '>' + esc(item.label) + mark + '</a>';
  }

  /* ── Navigation ───────────────────────────────────────────────────── */
  function renderNav(el) {
    if (!el || el.dataset.shellDone === '1') return;
    var links = NAV.map(function (n) {
      return linkHtml(n, isActive(n.href) ? 'active' : '');
    }).join('\n    ');

    el.innerHTML =
      '<a class="brand" href="' + esc(BRAND.href) + '">' +
        '<img class="h" src="' + esc(BRAND.logo) + '" alt="' + esc(BRAND.alt) + '">' +
        '<b>' + esc(BRAND.name) + '</b>' +
        '<span class="hk-bow" aria-hidden="true"><i></i></span>' +
      '</a>\n' +
      '  <div class="look-switch" role="group" aria-label="Akzentfarbe">\n' +
      '    <span class="akzente" id="akzente" role="group" aria-label="Akzentfarbe">\n' +
      '      <button class="akzent" data-akzent="pink" type="button" title="Pink" aria-label="Akzent Pink"></button>\n' +
      '      <button class="akzent" data-akzent="rosa" type="button" title="Rosa" aria-label="Akzent Rosa"></button>\n' +
      '      <button class="akzent" data-akzent="tuerkis" type="button" title="Türkis" aria-label="Akzent Türkis"></button>\n' +
      '    </span>\n' +
      '  </div>\n' +
      '  <button class="nav-burger" id="navBurger" aria-label="Menü" aria-expanded="false" aria-controls="navLinks">☰</button>\n' +
      '  <nav class="nav-links" id="navLinks">\n    ' + links + '\n' +
      '    <a class="cta-mobile" href="/login.html"><span class="btn" style="padding:12px 22px">Einloggen</span></a>\n' +
      '  </nav>\n' +
      '  <a href="/login.html" class="cta">Dashboard →</a>';

    /* Mobile-Menü: sauber per Listener statt onclick (CSP-freundlich) */
    var burger = el.querySelector('#navBurger');
    var list = el.querySelector('#navLinks');
    if (burger && list) {
      burger.addEventListener('click', function () {
        var open = list.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    /* 🎀 Akzentfarbe: Pink · Rosa · Türkis — der Punkt zeigt die Wahl */
    var punkte = el.querySelectorAll('#akzente .akzent');
    var akzentZeichen = function () {
      var gewaehlt = window.LoveBotTheme ? window.LoveBotTheme.getAkzent() : 'pink';
      for (var i = 0; i < punkte.length; i++) {
        var aktiv = punkte[i].getAttribute('data-akzent') === gewaehlt;
        punkte[i].classList.toggle('aktiv', aktiv);
        punkte[i].setAttribute('aria-pressed', aktiv ? 'true' : 'false');
      }
    };
    for (var i = 0; i < punkte.length; i++) {
      punkte[i].addEventListener('click', function (ev) {
        var wunsch = this.getAttribute('data-akzent');
        if (window.LoveBotTheme) window.LoveBotTheme.setAkzent(wunsch);
        else {
          document.documentElement.setAttribute('data-akzent', wunsch);
          try { localStorage.setItem('lovebot-akzent', wunsch); } catch (e) {}
        }
        akzentZeichen();
        ev.preventDefault();
      });
    }
    akzentZeichen();
    /* Wenn der Server eine gespeicherte Wahl liefert, Punkt nachziehen */
    try { document.addEventListener('look:geaendert', akzentZeichen); } catch (e) {}
    list.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'A') {
        list.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    el.dataset.shellDone = '1';
  }

  /* ── Footer ───────────────────────────────────────────────────────── */
  /* 🌸 Kleine Begrüßung in der Fußzeile — wechselt mit dem Tag,
     damit es nicht immer dieselbe Zeile ist. */
  function grussDesTages() {
    var zeilen = [
      '🌸 Schön, dass du da bist!',
      '☀️ Viel Spaß beim Stöbern.',
      '🎀 Heute ist ein guter Tag für neue Befehle.',
      '⭐ Nimm dir gern, was dir gefällt.',
      '🌷 Danke, dass du hier bist.',
      '🍀 Viel Erfolg mit dem Bot!',
      '💗 Bei Fragen: einfach fragen.'
    ];
    var jetzt = new Date();
    var start = new Date(jetzt.getFullYear(), 0, 0);
    var tag = Math.floor((jetzt - start) / 86400000);
    return zeilen[tag % zeilen.length];
  }

  function renderFooter(el) {
    if (!el || el.dataset.shellDone === '1') return;
    var desc = el.getAttribute('data-foot-desc') || DEFAULT_DESC;

    el.innerHTML =
      '<div class="foot-inner">\n' +
      '  <div>\n' +
      '    <div class="foot-brand"><img class="h" src="' + esc(BRAND.logo) + '" alt="' + esc(BRAND.alt) + '"><b>' + esc(BRAND.name) + '</b></div>\n' +
      '    <p class="foot-desc">' + esc(desc) + '</p>\n' +
      '    <p class="foot-gruss">' + esc(grussDesTages()) + '</p>\n' +
      '  </div>\n' +
      '  <div>\n    <h4>Navigation</h4>\n    <div class="flinks">\n      ' +
          FOOTER_NAV.map(function (n) { return linkHtml(n); }).join('\n      ') + '\n    </div>\n  </div>\n' +
      '  <div>\n    <h4>Rechtliches</h4>\n    <div class="flinks">\n      ' +
          FOOTER_LEGAL.map(function (n) { return linkHtml(n); }).join('\n      ') + '\n    </div>\n  </div>\n' +
      '  <div>\n    <h4>Community</h4>\n    <div class="socials" id="socials"></div>\n  </div>\n' +
      '</div>\n' +
      '<div class="foot-bottom">\n' +
      '  <p id="footOwner"></p>\n' +
      '  <p>© <span id="year">' + new Date().getFullYear() + '</span> ' + esc(BRAND.name) + ' 🎀 by Maxichen · ' +
          '<a href="https://maxichen.de" target="_blank" rel="noopener">maxichen.de</a> (Hauptadresse) · ' +
          '<a href="https://maxichen.de" target="_blank" rel="noopener">maxichen.de</a> (Subdomain)</p>\n' +
      '</div>';

    el.dataset.shellDone = '1';
  }

  /* ── Zurück-nach-oben ─────────────────────────────────────────────── */
  function backToTop() {
    if (document.getElementById('toTop')) return;
    var b = document.createElement('button');
    b.id = 'toTop';
    b.className = 'to-top';
    b.type = 'button';
    b.title = 'Nach oben';
    b.setAttribute('aria-label', 'Nach oben scrollen');
    b.innerHTML = '↑';
    b.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    document.body.appendChild(b);
    var onScroll = function () {
      if (window.scrollY > 420) b.classList.add('show'); else b.classList.remove('show');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── <head> ergänzen (Manifest · Theme-Farbe) ────────────────────────
     Spart die manuelle Pflege in 38 Dateien: die Shell hängt nach, was
     auf JEDER Seite gelten soll und dort noch fehlt. */
  function headExtras() {
    try {
      if (!document.querySelector('link[rel="manifest"]')) {
        var l = document.createElement('link');
        l.rel = 'manifest'; l.href = '/manifest.webmanifest';
        document.head.appendChild(l);
      }
      if (!document.querySelector('meta[name="theme-color"]')) {
        var m = document.createElement('meta');
        m.name = 'theme-color'; m.content = '#09090d';
        document.head.appendChild(m);
      }
    } catch (e) { /* darf eine Seite nie brechen */ }
  }

  /* ── Start ────────────────────────────────────────────────────────── */
  function boot() {
    try {
      headExtras();
      renderNav(document.getElementById('site-nav'));
      renderFooter(document.getElementById('site-footer'));
      backToTop();
      /* aktives Nav-Element für Seiten, die keinen Platzhalter nutzen */
      document.querySelectorAll('.nav-links a').forEach(function (a) {
        var href = a.getAttribute('href');
        if (href && href === '/' + currentFile()) a.classList.add('active');
      });
    } catch (e) {
      /* Die Shell darf eine Seite NIE brechen — sonst steht sie ohne Nav da. */
      if (window.console) console.warn('[site-shell] übersprungen:', e);
    }
  }

  /* Synchron ausführen: die Shell muss stehen, BEVOR common.js (Glocke)
     und die Seiten-Skripte (landing.js → #socials, #year) laufen. */
  if (document.readyState === 'loading' && !document.getElementById('site-nav')) {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
