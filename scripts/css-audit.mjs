/* ═══════════════════════════════════════════════════════════════════════
   🧹  CSS-AUDIT  —  finden, was niemand mehr braucht
   ─────────────────────────────────────────────────────────────────────
   Meldet
     · Größe, Anzahl Regeln, !important-Zähler
     · doppelte Regeln (gleicher Selektor + gleicher Inhalt)
     · Klassen, die in keiner HTML- und keiner JS-Datei vorkommen
   und entfernt auf Wunsch (--fix) alle Regeln, deren Klassen komplett
   unbenutzt sind. Backup: css/style.css.bak

   Sicherheitsregel: Eine Regel wird NUR gelöscht, wenn jeder Klassenname
   darin in keiner HTML- und keiner JS-Datei (auch nicht als Teilstring,
   z. B. bei 'st ' + (on ? 'on' : 'off')) vorkommt. At-Regeln (@media,
   @keyframes …) und Regeln mit Element-Selektoren bleiben unangetastet.

   Aufruf:  node scripts/css-audit.mjs        (nur Bericht)
            node scripts/css-audit.mjs --fix  (aufräumen, mit Backup)
   ═══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSS_FILE = path.join(ROOT, 'public', 'css', 'style.css');
const FIX = process.argv.includes('--fix');

/* Quellen, in denen Klassennamen vorkommen können (HTML + JS) */
const SOURCE_DIRS = [path.join(ROOT, 'public')];
const SOURCE_FILES = [
  path.join(ROOT, 'server.js'),
  path.join(ROOT, 'Love.js'),
  path.join(ROOT, 'glassCard.js'),
  path.join(ROOT, 'progressstats.js'),
  path.join(ROOT, 'levelsystem.js'),
  path.join(ROOT, 'sessioncmds.js'),
  path.join(ROOT, 'notifications.js')
];
const EXCLUDE_DIRS = new Set(['node_modules', 'Database', 'backup-2026-10-02-stand', 'backup-public-2026-10-02-stand', '.git', 'Bilder', 'preview', 'Dokumente']);

function collectSources() {
  const files = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(html|js|mjs|cjs)$/i.test(e.name)) files.push(p);
    }
  };
  for (const d of SOURCE_DIRS) if (fs.existsSync(d)) walk(d);
  for (const f of SOURCE_FILES) if (fs.existsSync(f)) files.push(f);
  return files;
}

const sources = collectSources().map((f) => ({ file: f, text: fs.readFileSync(f, 'utf8') }));
const haystack = sources.map((s) => s.text).join('\n');

/* ── CSS in Blöcke zerlegen (einfach, aber ausreichend) ─────────────── */
const css = fs.readFileSync(CSS_FILE, 'utf8');
const rules = [];
let i = 0;
const re = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(css)) !== null) {
  const sel = m[1].trim();
  const body = m[2];
  if (sel.startsWith('@')) continue;                 // @media, @keyframes …
  if (sel.includes('@')) continue;
  if (!/[.#]/.test(sel)) continue;                   // reine Element-Selektoren behalten
  rules.push({ sel, body, index: m.index, length: m[0].length, raw: m[0] });
}

/* ── Klassenauswertung ──────────────────────────────────────────────── */
const classNames = new Set();
for (const r of rules) {
  for (const c of r.sel.match(/\.[-_a-zA-Z0-9\u00a0-\uffff]+/g) || []) classNames.add(c.slice(1));
}

const used = new Set();
const unused = [];
for (const c of [...classNames].sort()) {
  /* Teilstring-Suche: deckt auch dynamisch gebaute Klassennamen ab */
  const hit = haystack.includes(c);
  if (hit) used.add(c); else unused.push(c);
}

/* Regeln, bei denen ALLE Klassen unbenutzt sind */
const deadRules = rules.filter((r) => {
  const cs = r.sel.match(/\.[-_a-zA-Z0-9\u00a0-\uffff]+/g) || [];
  return cs.length > 0 && cs.every((c) => unused.includes(c.slice(1)));
});

/* ── Duplikate ──────────────────────────────────────────────────────── */
const seen = new Map();
const dupes = [];
for (const r of rules) {
  const key = r.sel.replace(/\s+/g, ' ') + ' {' + r.body.replace(/\s+/g, ' ').trim() + '}';
  if (seen.has(key)) dupes.push({ sel: r.sel, first: seen.get(key) });
  else seen.set(key, r.index);
}

/* ── Bericht ────────────────────────────────────────────────────────── */
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  CSS-AUDIT · public/css/style.css                             ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Größe             : ${kb(Buffer.byteLength(css))}`);
console.log(`  Regeln (Klassen)  : ${rules.length}`);
console.log(`  Klassen gesamt    : ${classNames.size}`);
console.log(`  !important        : ${(css.match(/!important/g) || []).length}`);
console.log(`  doppelte Regeln   : ${dupes.length}`);
console.log(`  unbenutzte Klassen: ${unused.length}`);
console.log(`  tote Regeln       : ${deadRules.length} (${kb(deadRules.reduce((a, r) => a + r.length, 0))})`);
if (unused.length) console.log('\n  Unbenutzte Klassen:\n   ' + unused.join(', '));
if (dupes.length) console.log('\n  Doppelte Regeln:\n   ' + dupes.slice(0, 30).map((d) => d.sel).join('\n   '));

/* ── Aufräumen ──────────────────────────────────────────────────────── */
if (FIX) {
  if (!deadRules.length) { console.log('\n✅ Nichts zu löschen.'); process.exit(0); }
  fs.copyFileSync(CSS_FILE, CSS_FILE + '.bak');
  let out = css;
  /* von hinten nach vorn, damit die Indizes stimmen */
  for (const r of [...deadRules].sort((a, b) => b.index - a.index)) {
    out = out.slice(0, r.index) + out.slice(r.index + r.length);
  }
  out = out.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(CSS_FILE, out);
  const saved = Buffer.byteLength(css) - Buffer.byteLength(out);
  console.log(`\n✅ ${deadRules.length} tote Regeln entfernt · ${kb(saved)} gespart`);
  console.log(`   Backup: public/css/style.css.bak  →  ${kb(Buffer.byteLength(css))} vorher, ${kb(Buffer.byteLength(out))} nachher`);
}
