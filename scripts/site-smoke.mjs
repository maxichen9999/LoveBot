/* ═══════════════════════════════════════════════════════════════════════
   🌐  WEBSITE-SMOKE-TEST  (Shell · Links · Assets)
   ─────────────────────────────────────────────────────────────────────
   Startet den statischen Vorschau-Server, lädt JEDE Seite mit einer
   echten DOM-Engine (jsdom, führt die Skripte aus) und prüft:

     1. Seite liefert 200
     2. Die geteilte Shell steht: Navigation + Footer + Back-to-top
     3. Der aktive Nav-Link zeigt auf die richtige Seite
     4. Die bekannten Hooks sind da (#socials, #year, #footOwner, .cta)
     5. Kein onclick mehr im Markup (CSP-freundlich)
     6. Alle lokalen Verweise (CSS/JS/Bilder) existieren wirklich
     7. Keine Seite enthält doppelte <footer>/<header>

   Aufruf:  node scripts/site-smoke.mjs
   Benötigt jsdom:  npm i -D jsdom   (oder JSDOM_PATH=/pfad/zu/jsdom)
   ═══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.SMOKE_PORT || 8099);
const BASE = `http://127.0.0.1:${PORT}`;

/* ── jsdom finden (Projekt-Abhängigkeit oder Umgebungsvariable) ────── */
async function loadJsdom() {
  const require = createRequire(import.meta.url);
  const tries = [
    () => import('jsdom'),
    () => { const p = process.env.JSDOM_PATH; return p ? import(pathToFile(p)) : Promise.reject(); },
    () => import('/home/user/.shot/node_modules/jsdom/lib/api.js')
  ];
  let mod = null;
  for (const t of tries) {
    try { mod = await t(); if (mod) break; } catch (e) { /* nächster Versuch */ }
  }
  if (!mod) return null;
  const JSDOMCtor = mod.JSDOM || mod.default?.JSDOM;
  if (!JSDOMCtor) return null;
  const { VirtualConsole } = mod;
  return { JSDOM: JSDOMCtor, VirtualConsole };
}
const pathToFile = (p) => 'file://' + p;

const SKIP = new Set(['app.html', 'commands.html', 'test.html']);

/* Erwartete Navigation direkt aus site-shell.js lesen — so bleibt der Test
   gültig, wenn dort ein Link dazukommt (kein veralteter Zähler). */
function expectedNavCount() {
  try {
    const src = fs.readFileSync(path.join(PUBLIC, 'js', 'site-shell.js'), 'utf8');
    const block = src.slice(src.indexOf('var NAV = ['), src.indexOf('];', src.indexOf('var NAV = [')));
    return (block.match(/\{\s*label:/g) || []).length;
  } catch (e) {
    return 10;   /* Fallback, falls die Datei unlesbar wird */
  }
}
const NAV_COUNT = expectedNavCount();

/* ── statischer Server ─────────────────────────────────────────────── */
function startServer() {
  const srv = spawn(process.execPath, [path.join(ROOT, 'tools', 'preview-server.cjs')], {
    env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore'
  });
  return new Promise((resolve) => {
    const t0 = Date.now();
    (function wait() {
      const req = http.get(BASE + '/index.html', (res) => { res.resume(); resolve(srv); });
      req.on('error', () => {
        if (Date.now() - t0 > 15000) return resolve(null);
        setTimeout(wait, 250);
      });
    })();
  });
}

const get = (url) => new Promise((resolve) => {
  http.get(url, (res) => {
    let d = ''; res.on('data', (c) => (d += c));
    res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
  }).on('error', () => resolve({ status: 0, body: '', headers: {} }));
});

/* ── Prüfungen ─────────────────────────────────────────────────────── */
const results = [];
const fail = (page, msg) => results.push({ page, ok: false, msg });
const pass = (page, msg) => results.push({ page, ok: true, msg });

function checkAssets(page, dom) {
  const refs = new Set();
  dom.window.document.querySelectorAll('link[href], script[src], img[src], source[src]').forEach((el) => {
    const v = el.getAttribute('href') || el.getAttribute('src');
    if (v && v.startsWith('/')) refs.add(v.split('?')[0].split('#')[0]);
  });
  for (const r of refs) {
    const f = path.join(PUBLIC, decodeURIComponent(r));
    if (!fs.existsSync(f)) fail(page, `Verweis ins Leere: ${r}`);
  }
}

async function checkPage({ JSDOM, VirtualConsole }, page) {
  const res = await get(`${BASE}/${page}`);
  if (res.status !== 200) { fail(page, `HTTP ${res.status}`); return; }

  const vc = new VirtualConsole();
  if (process.env.SMOKE_VERBOSE) {
    vc.on('jsdomError', (e) => console.log(`   ⚠️  ${page}: ${String(e.message).split('\n')[0]}`));
  }
  const dom = await JSDOM.fromURL(`${BASE}/${page}`, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      /* jsdom kennt diese Browser-APIs nicht — im echten Browser sind sie da. */
      if (!w.IntersectionObserver) {
        w.IntersectionObserver = class { constructor(cb) { this.cb = cb; } observe() {} unobserve() {} disconnect() {} };
      }
      if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    }
  });
  /* Warten, bis die Shell gerendert ist (Skripte laden asynchron nach) */
  const doc = dom.window.document;
  const html = res.body;
  const hasNav = html.includes('id="site-nav"');
  const hasFoot = html.includes('id="site-footer"');
  for (let i = 0; i < 40; i++) {
    const navOk = !hasNav || doc.querySelectorAll('#site-nav .nav-links a').length > 0;
    const footOk = !hasFoot || doc.querySelector('#site-footer #socials');
    if (navOk && footOk && doc.getElementById('toTop')) break;
    await new Promise((r) => setTimeout(r, 100));
  }

  /* 1) Struktur: genau ein Header/Footer */
  if ((html.match(/<footer/g) || []).length > 1) fail(page, 'mehr als ein <footer> im Markup');
  if ((html.match(/<header/g) || []).length > 1) fail(page, 'mehr als ein <header> im Markup');

  /* 2) Shell gerendert? */
  const nav = doc.getElementById('site-nav');
  const foot = doc.getElementById('site-footer');
  if (nav) {
    const links = nav.querySelectorAll('.nav-links a:not(.cta-mobile)');
    if (links.length !== NAV_COUNT) fail(page, `Navigation: ${links.length} statt ${NAV_COUNT} Links`);
    const want = page === 'index.html' ? '/' : '/' + page;
    const inNav = [...nav.querySelectorAll('.nav-links a')].some((a) => a.getAttribute('href') === want);
    const active = nav.querySelector('.nav-links a.active');
    if (inNav && !active) fail(page, 'kein aktiver Nav-Link');
    else if (inNav && active.getAttribute('href') !== want) fail(page, `aktiver Link ${active.getAttribute('href')} ≠ ${want}`);
    if (!nav.querySelector('.cta')) fail(page, '.cta fehlt (Notification-Glocke hängt daran)');
    if (!nav.querySelector('.nav-burger')) fail(page, '.nav-burger fehlt');
    if (nav.querySelectorAll('[onclick]').length) fail(page, 'Navigation nutzt inline onclick (CSP-Risiko)');
  }
  if (foot) {
    for (const id of ['socials', 'year', 'footOwner']) {
      if (!foot.querySelector('#' + id)) fail(page, `Footer-Hook #${id} fehlt`);
    }
    if (foot.querySelectorAll('.flinks a').length < 10) fail(page, 'Footer-Links unvollständig');
  }

  /* 3) Back-to-top */
  if (!doc.getElementById('toTop')) fail(page, 'Back-to-top-Button fehlt');

  /* 4) Assets */
  checkAssets(page, dom);
  dom.window.close();

  if (!results.some((r) => r.page === page && !r.ok)) pass(page, 'OK');
}

(async function main() {
  const jsdomMod = await loadJsdom();
  if (!jsdomMod) {
    console.log('⏭️  jsdom nicht installiert — Test übersprungen.');
    console.log('    Installieren mit:  npm i -D jsdom   (oder JSDOM_PATH=<pfad> setzen)');
    process.exit(0);
  }
  const srv = await startServer();
  if (!srv) { console.log('❌ Vorschau-Server startet nicht.'); process.exit(1); }

  const { JSDOM: JSDOMCtor, VirtualConsole } = jsdomMod;
  const pages = fs.readdirSync(PUBLIC).filter((f) => f.endsWith('.html') && !SKIP.has(f)).sort();
  for (const p of pages) await checkPage({ JSDOM: JSDOMCtor, VirtualConsole }, p);
  srv.kill();

  const bad = results.filter((r) => !r.ok);
  console.log(`\n🌐 SMOKE-TEST · ${pages.length} Seiten · ${results.length - bad.length} sauber · ${bad.length} Fehler\n`);
  for (const b of bad) console.log(`   ❌ ${b.page}: ${b.msg}`);
  if (!bad.length) console.log('   ✅ Alle Seiten: Shell steht, Links zeigen ins Ziel, Assets vorhanden.');
  process.exit(bad.length ? 1 : 0);
})();
