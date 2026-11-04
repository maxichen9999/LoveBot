/* ═══════════════════════════════════════════════════════════════════════
   📦  BUILD  —  CSS minifizieren · Sitemap erzeugen
   ─────────────────────────────────────────────────────────────────────
   Kein Build-Werkzeug, keine Zusatz-Pakete. Erzeugt:

     public/css/style.min.css   kompakte Fassung (Quelle bleibt style.css)
     public/sitemap.xml         alle öffentlichen Seiten für Suchmaschinen

   Aktivieren:  MINIFY=1 node server.js
   (fehlt die .min.css, liefert der Server automatisch das Original —
    es kann also nie zu einer kaputten Seite führen).

   Aufruf:  node scripts/build-assets.mjs
   ═══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const CSS_IN = path.join(PUBLIC, 'css', 'style.css');
const CSS_OUT = path.join(PUBLIC, 'css', 'style.min.css');
const SITEMAP = path.join(PUBLIC, 'sitemap.xml');
const HTTP_DATA = path.join(PUBLIC, 'js', 'http-codes-data.js');

const SITE = process.env.SITE_URL || 'https://maxichen.de';

/* Seiten, die nicht in die Sitemap gehören (Login-Bereich, Weiterleitung) */
const SITEMAP_SKIP = new Set([
  'login.html', 'admin.html', 'control.html', 'dashboard.html', 'home.html',
  'logs.html', 'owners.html', 'settings.html', 'sessions.html', 'session.html',
  'bans.html', 'broadcast.html', 'tickets.html', 'reports.html', 'profiles.html',
  'badwords.html', 'economy.html', 'bank.html', 'groups.html', 'group.html',
  'ai.html', 'notifications.html', 'progression.html', 'account.html',
  'commands.html', 'test.html', 'app.html', '404.html'
]);

/* ── CSS-Minifizierer (zeichenweise, string-sicher) ─────────────────── */
function minifyCss(src) {
  const out = [];
  const isSpace = (c) => c === ' ' || c === '\n' || c === '\t' || c === '\r';
  const isPunct = (c) => c === '{' || c === '}' || c === ':' || c === ';' || c === ',' || c === '>';
  let i = 0, quote = null;

  while (i < src.length) {
    const c = src[i];

    /* Kommentar überspringen */
    if (!quote && c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    /* Zeichenkette unverändert übernehmen */
    if (quote) {
      out.push(c);
      if (c === '\\') { out.push(src[++i] || ''); }
      else if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; out.push(c); i++; continue; }

    /* Whitespace: zu einem Zeichen zusammenfassen, um Satzzeichen entfernen */
    if (isSpace(c)) {
      let j = i;
      while (j < src.length && isSpace(src[j])) j++;
      const prev = out[out.length - 1];
      const next = src[j];
      if (prev && next && !isPunct(prev) && !isPunct(next) && prev !== '(' && next !== ')') out.push(' ');
      i = j;
      continue;
    }
    /* Letztes Semikolon vor } bzw. vor Dateiende ist überflüssig.
       Achtung: NUR das — alle anderen Semikolons trennen Deklarationen
       und müssen bleiben (sonst wird aus ``a:1;b:2`` ein ``a:1 b:2``). */
    if (c === ';') {
      let j = i + 1;
      while (j < src.length && isSpace(src[j])) j++;
      if (j >= src.length || src[j] === '}') { i = j; continue; }
    }

    out.push(c);
    i++;
  }
  return out.join('').trim() + '\n';
}

/* ── 1) CSS ─────────────────────────────────────────────────────────── */
const css = fs.readFileSync(CSS_IN, 'utf8');
const mini = minifyCss(css);

/* ── Sicherheitsprüfung: die Struktur muss erhalten bleiben ───────────
   Klammern, Doppelpunkte und Deklarations-Trenner werden verglichen.
   Stimmt etwas nicht, wird NICHTS geschrieben — die Seite bleibt heil. */
const count = (s, ch) => (s.match(new RegExp('\\' + ch, 'g')) || []).length;
/* Vergleichsbasis: Quelle OHNE Kommentare (Kommentare enthalten selbst
   Doppelpunkte und @ — sie dürfen den Vergleich nicht verfälschen). */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const base = stripComments(css);
const problems = [];
if (count(css, '{') !== count(mini, '{') || count(css, '}') !== count(mini, '}')) problems.push('Klammern');
if (count(base, ':') !== count(mini, ':')) problems.push('Doppelpunkte (Eigenschaften)');
/* Semikolons: nur die letzten vor }/Dateiende dürfen fehlen */
const expectedSemi = count(base, ';') - count(css, '}');
if (count(mini, ';') < expectedSemi) problems.push(`Semikolons (${count(mini, ';')} < ${expectedSemi})`);
/* Stichprobe: bekannte Deklarationen müssen unverändert vorkommen */
for (const probe of ['--bg0', 'border-radius', 'backdrop-filter', '@media']) {
  if (probe === '@media' && count(mini, '@') !== count(base, '@')) problems.push('@-Regeln');
  if (probe !== '@media' && base.split(probe).length !== mini.split(probe).length) problems.push(`Vorkommen von ${probe}`);
}
if (problems.length) {
  console.error('❌ Struktur weicht ab (' + problems.join(', ') + ') — Ausgabe verworfen, style.css bleibt unberührt.');
  process.exit(1);
}
fs.writeFileSync(CSS_OUT, mini);
const before = Buffer.byteLength(css), after = Buffer.byteLength(mini);
console.log(`✅ CSS    style.css ${(before / 1024).toFixed(1)} KB → style.min.css ${(after / 1024).toFixed(1)} KB ` +
  `(${Math.round((1 - after / before) * 100)} % kleiner)`);

/* ── 2) HTTP-Statuscodes für die Website ───────────────────────────────
   Eine Quelle (httpCodes.js) für Website UND Bot — hier wird nur die
   Browser-Fassung daraus erzeugt, damit nichts doppelt gepflegt wird. */
try {
  const mod = await import('../httpCodes.js');
  const body = '/* automatisch erzeugt von scripts/build-assets.mjs — Quelle: httpCodes.js */\n' +
    'window.HTTP_CODES = ' + JSON.stringify(mod.HTTP_CODES) + ';\n' +
    'window.HTTP_GROUPS = ' + JSON.stringify(mod.HTTP_GROUPS) + ';\n';
  fs.writeFileSync(HTTP_DATA, body);
  console.log(`✅ Codes   http-codes-data.js mit ${mod.HTTP_CODES.length} Statuscodes (aus httpCodes.js)`);
} catch (e) {
  console.error('❌ HTTP-Codes konnten nicht erzeugt werden: ' + e.message);
  process.exitCode = 1;
}

/* ── 3) Sitemap ─────────────────────────────────────────────────────── */
const pages = fs.readdirSync(PUBLIC)
  .filter((f) => f.endsWith('.html') && !SITEMAP_SKIP.has(f))
  .sort();

const urls = pages.map((f) => {
  const stat = fs.statSync(path.join(PUBLIC, f));
  const loc = f === 'index.html' ? `${SITE}/` : `${SITE}/${f}`;
  const prio = f === 'index.html' ? '1.0' : (/^(cmd|features|level|status|faq|spiele|http-codes)\.html$/.test(f) ? '0.8' : '0.5');
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${stat.mtime.toISOString().slice(0, 10)}</lastmod>\n    <priority>${prio}</priority>\n  </url>`;
});

fs.writeFileSync(SITEMAP,
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.join('\n') + `\n</urlset>\n`);
console.log(`✅ Sitemap sitemap.xml mit ${pages.length} Seiten (${SITE})`);
console.log('\nStart mit minifizierten Assets:  MINIFY=1 node server.js');
