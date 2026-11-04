/* ═══════════════════════════════════════════════════════════════════════
  🌗  TESTS  —  Dark Mode & Lesbarkeit der Farbpalette
   ───────────────────────────────────────────────────────────────────────
   Diese Tests stellen sicher, dass
     · der Dark Mode Standard und nicht umschaltbar ist,
     · jede Textfarbe die WCAG-AA-Norm erfüllt (≥ 4.5:1),
     · helle Palette-Altlasten die Website nicht mehr überschreiben.
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSS = fs.readFileSync(path.join(ROOT, 'public', 'css', 'style.css'), 'utf8');
const KITTY_CSS = fs.readFileSync(path.join(ROOT, 'public', 'css', 'hello-kitty.css'), 'utf8');
const SHELL = fs.readFileSync(path.join(ROOT, 'public', 'js', 'site-shell.js'), 'utf8');

/* ── Farb-Mathematik (WCAG 2.1) ─────────────────────────────────────── */
function rgb(hex) {
  const h = String(hex).trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminanz(hex) {
  const c = rgb(hex);
  if (!c) return null;
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function kontrast(a, b) {
  const [x, y] = [luminanz(a), luminanz(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/* Palette aus der CSS lesen */
function palette(anfang) {
  const i = CSS.indexOf(anfang);
  assert.ok(i >= 0, 'Block nicht gefunden: ' + anfang);
  const ende = CSS.indexOf('}', i);
  const out = {};
  for (const m of CSS.slice(i, ende).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

const HELL = palette(':root {\n  color-scheme: light;');
const DUNKEL = palette('[data-theme="dark"] {');

test('es gibt eine helle und eine dunkle Palette', () => {
  assert.ok(HELL['--bg0'], 'helle Palette fehlt');
  assert.ok(DUNKEL['--bg0'], 'dunkle Palette fehlt');
  assert.match(HELL['--bg0'], /^#[0-9a-f]{6}$/i);
  assert.match(DUNKEL['--bg0'], /^#[0-9a-f]{6}$/i);
});

test('Dark Mode ist der feste Standard', () => {
  assert.match(CSS, /\[data-theme="dark"\]\s*\{/, 'dunkle Variablen sind definiert');
  const theme = fs.readFileSync(path.join(ROOT, 'public', 'js', 'theme.js'), 'utf8');
  assert.match(theme, /setAttribute\('data-theme', 'dark'\)/, 'Theme wird immer dunkel gesetzt');
  assert.doesNotMatch(SHELL, /themeToggle/, 'es gibt keinen Hell/Dunkel-Schalter');
  assert.doesNotMatch(CSS, /body\.portal-home\s*\{[^}]*--bg0:\s*#f3f6f7/s, 'Startseite erzwingt keinen hellen Hintergrund');
  assert.match(KITTY_CSS, /body\.portal-home \.topnav\s*\{\s*background: rgba\(10, 9, 14, \.92\)/, 'Navigation bleibt im dunklen Theme');
});

test('Dark-Mode-Hintergrund bleibt dunkel', () => {
  const helligkeit = Math.round(luminanz(DUNKEL['--bg0']) * 255);
  assert.ok(helligkeit < 60, 'dunkle Palette ist nicht dunkel: ' + helligkeit);
  assert.match(CSS, /\[data-theme="dark"\]/);
});

test('Texte sind im hellen Modus lesbar (WCAG AA ≥ 4.5:1)', () => {
  const bg = HELL['--bg0'];
  for (const [name, farbe] of Object.entries(HELL)) {
    if (!/^#[0-9a-f]{6}$/i.test(farbe)) continue;
    if (!/--(text|muted|faint|ok|warn|err|brand-1|brand-2|brand-3)$/.test(name)) continue;
    const wert = kontrast(bg, farbe);
    assert.ok(wert >= 4.5, `${name} (${farbe}) hat nur ${wert.toFixed(2)}:1 — mindestens 4.5 nötig`);
  }
});

test('Texte sind auch im dunklen Modus lesbar', () => {
  const bg = DUNKEL['--bg0'];
  for (const [name, farbe] of Object.entries(DUNKEL)) {
    if (!/^#[0-9a-f]{6}$/i.test(farbe)) continue;
    if (!/--(text|muted|faint|ok|warn|err|brand-1|brand-2)$/.test(name)) continue;
    const wert = kontrast(bg, farbe);
    assert.ok(wert >= 4.5, `${name} (${farbe}) hat nur ${wert.toFixed(2)}:1 im dunklen Modus`);
  }
});

test('weiße Schrift auf dem Button-Verlauf ist lesbar', () => {
  const verlauf = HELL['--grad'] || '';
  const farben = [...verlauf.matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0]);
  assert.ok(farben.length >= 2, 'Verlauf gefunden');
  for (const f of farben) {
    const wert = kontrast('#ffffff', f);
    assert.ok(wert >= 4.5, `weiße Schrift auf ${f} hat nur ${wert.toFixed(2)}:1`);
  }
});

test('die Navigation bietet Akzentfarben ohne Theme-Umschalter', () => {
  assert.doesNotMatch(SHELL, /themeToggle/, 'kein Hell/Dunkel-Knopf');
  assert.match(SHELL, /LoveBotTheme/, 'nutzt das gemeinsame Theme-Modul');
  assert.match(SHELL, /data-akzent="pink"/, 'Akzentfarben bleiben verfügbar');
});

test('theme.js lädt im <head> (kein dunkles Aufblitzen)', () => {
  const seiten = fs.readdirSync(path.join(ROOT, 'public')).filter((f) => f.endsWith('.html'));
  let ok = 0;
  for (const s of seiten) {
    const html = fs.readFileSync(path.join(ROOT, 'public', s), 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    if (head.includes('/js/theme.js')) ok++;
  }
  assert.ok(ok >= seiten.length - 0, `theme.js fehlt im <head> von ${seiten.length - ok} Seiten`);
});

test('Fehlerseiten nutzen den Dark Mode', () => {
  const ep = fs.readFileSync(path.join(ROOT, 'errorPages.js'), 'utf8');
  assert.match(ep, /<html lang="de" data-theme="dark">/, 'Fehlerseiten setzen den Dark Mode');
  assert.match(ep, /#09090d/, 'Browseroberfläche nutzt den dunklen Hintergrund');
});

/* ── theme.js im Kleinst-Browser laufen lassen (ohne jsdom) ───────────── */
function themeLaden(gespeichert) {
  const fs2 = fs.readFileSync(path.join(ROOT, 'public', 'js', 'theme.js'), 'utf8');
  const merkmale = {};
  const speicher = { [gespeichert === null ? 'nix' : 'lovebot-theme']: gespeichert };
  const document = {
    documentElement: {
      /* Jedes Attribut einzeln merken — seit dem Akzent-Umschalter
         setzt theme.js mehr als eines (data-theme und data-akzent). */
      attribute: {},
      setAttribute(n, v) { this.attribute[n] = v; },
      getAttribute(n) { return n in this.attribute ? this.attribute[n] : null; }
    },
    addEventListener() { /* im Kleinst-Browser nicht nötig */ },
    dispatchEvent() {}
  };
  const localStorage = {
    getItem(k) { return k in speicher ? speicher[k] : null; },
    setItem(k, v) { speicher[k] = v; }
  };
  const fn = new Function('document', 'localStorage', 'window', fs2 + '\nreturn window.LoveBotTheme;');
  const fenster = {};
  const api = fn(document, localStorage, fenster);
  return { api, document, speicher };
}

test('theme.js: die Website ist ohne gespeicherte Wahl dauerhaft dunkel', () => {
  const { api, document } = themeLaden(null);
  assert.equal(document.documentElement.getAttribute('data-theme'), 'dark');
  assert.equal(api.get(), 'dark');
});

test('theme.js: gespeicherte helle Wahl kann den Dark Mode nicht überschreiben', () => {
  assert.equal(themeLaden('dark').document.documentElement.getAttribute('data-theme'), 'dark');
  assert.equal(themeLaden('light').document.documentElement.getAttribute('data-theme'), 'dark');
});

test('theme.js: Umschalten bleibt dunkel und speichert keinen Modus', () => {
  const { api, document, speicher } = themeLaden(null);
  assert.equal(api.toggle(), 'dark');
  assert.equal(document.documentElement.getAttribute('data-theme'), 'dark');
  assert.equal(api.set('light'), 'dark');
  assert.equal(document.documentElement.getAttribute('data-theme'), 'dark');
  assert.equal(speicher['lovebot-theme'], undefined);
});

test('theme.js: kaputter Speicher wirft keinen Fehler', () => {
  const fs2 = fs.readFileSync(path.join(ROOT, 'public', 'js', 'theme.js'), 'utf8');
  const document = { documentElement: { attribute: '', setAttribute(n, v) { this.attribute = v; }, getAttribute() { return this.attribute; } } };
  const localStorage = { getItem() { throw new Error('gesperrt'); }, setItem() { throw new Error('gesperrt'); } };
  const fn = new Function('document', 'localStorage', 'window', fs2 + '\nreturn window.LoveBotTheme;');
  const api = fn(document, localStorage, {});
  assert.equal(api.get(), 'dark');
  assert.doesNotThrow(() => api.set('dark'));
});
