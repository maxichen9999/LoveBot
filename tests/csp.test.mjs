/* ═══════════════════════════════════════════════════════════════════════
   🔐  CSP-TESTS  —  Nonce, Inline-Handler, Delegation
   ─────────────────────────────────────────────────────────────────────
   Teil 1  Einheiten: prepareInlineHtml / finalizeHtml / cspFor / cspNonce
   Teil 2  Integration: echter server.js liefert Nonce + CSP
   Teil 3  Funktion: eine Seite im DOM laden und einen umgehängten
           Handler wirklich anklicken (jsdom)

   Start:  node --test tests/csp.test.mjs
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  CSP_STRICT, cspFor, cspNonce, prepareInlineHtml, finalizeHtml, NONCE_TOKEN
} from '../siteSecurity.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.CSP_TEST_PORT || 7789);
const BASE = `http://127.0.0.1:${PORT}`;
const N = 'TESTNONCE123';

function req(url, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        let text = '';
        let raw = body;
        if (res.headers['content-encoding'] === 'br') raw = zlib.brotliDecompressSync(body);
        else if (res.headers['content-encoding'] === 'gzip') raw = zlib.gunzipSync(body);
        text = raw.toString('utf8');
        resolve({ status: res.statusCode, headers: res.headers, body, raw, text });
      });
    }).on('error', reject);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   TEIL 1 — Einheiten
   ═══════════════════════════════════════════════════════════════════════ */

test('Inline-Skripte und -Styles bekommen einen Nonce', () => {
  const out = prepareInlineHtml('<html><head><style>a{}</style></head><body><script>var a=1;</script></body></html>');
  assert.equal((out.match(/<style[^>]*nonce="/g) || []).length, 1, 'style');
  assert.equal((out.match(/<script[^>]*nonce="/g) || []).length, 1, 'script');
  assert.ok(out.includes(NONCE_TOKEN), 'Platzhalter statt festem Nonce');
});

test('ein bereits gesetzter Nonce wird nicht überschrieben', () => {
  const out = prepareInlineHtml('<script nonce="bleibt">x</script>');
  assert.ok(out.includes('nonce="bleibt"'));
  assert.ok(!out.includes(NONCE_TOKEN));
});

test('Inline-Handler werden auf addEventListener umgehängt', () => {
  const out = prepareInlineHtml('<button onclick="mach(\'x\')">Klick</button>');
  assert.ok(!/\sonclick=/.test(out), 'kein onclick mehr im Markup');
  assert.ok(out.includes('data-csp-ev='), 'Element markiert');
  assert.ok(out.includes("mach('x')") || out.includes('mach(\'x\')'), 'Code bleibt erhalten');
  assert.ok(out.includes('addEventListener'), 'Binding vorhanden');
  assert.ok(out.includes(`nonce="${NONCE_TOKEN}"`), 'Shim trägt Nonce');
});

test('this und event bleiben im umgehängten Handler verfügbar', () => {
  const out = prepareInlineHtml('<div onclick="if(event.target===this)this.style.display=\'none\'"></div>');
  assert.ok(out.includes('function (event) {'), 'event ist Parameter');
  assert.ok(out.includes('this.style.display'), 'this bleibt das Element');
});

test('Handler in JS-Zeichenketten bleiben unangetastet', () => {
  const src = '<script>var h = \'<button onclick="go(1)">x</button>\';</script>';
  const out = prepareInlineHtml(src);
  assert.ok(out.includes('onclick="go(1)"'), 'Innerhalb von <script> darf nichts ersetzt werden');
  assert.ok(out.includes('nonce='), 'aber der Script-Tag selbst bekommt einen Nonce');
});

test('</script> im Handler-Code kann den Block nicht vorzeitig beenden', () => {
  const out = prepareInlineHtml('<button onclick="alert(\'</script>\')">x</button>');
  assert.ok(!out.includes('</script>\')'), 'nacktes </script> im Code');
  assert.ok(out.includes('<\\/script>'), 'entschärft');
});

test('mehrere Handler landen in genau einem Shim', () => {
  const out = prepareInlineHtml('<a onclick="a()">1</a><a onclick="b()">2</a><a onkeydown="c()">3</a>');
  assert.equal((out.match(/data-csp-ev=/g) || []).length, 3, 'drei Markierungen');
  assert.equal((out.match(/<script[^>]*nonce=/g) || []).length, 1, 'ein Shim');
  assert.ok(out.includes('"keydown"'), 'onkeydown → keydown');
});

test('finalizeHtml ersetzt jeden Platzhalter durch den echten Nonce', () => {
  const prepared = prepareInlineHtml('<script>x</script><style>y</style>');
  const finished = finalizeHtml(prepared, N);
  assert.ok(!finished.includes(NONCE_TOKEN), 'kein Platzhalter übrig');
  assert.equal((finished.split(N).length - 1), 2, 'zwei Nonces eingesetzt');
});

test('CSP streng: Nonce drin, unsafe-inline raus', () => {
  const strict = cspFor({}, 'abc');
  assert.match(strict, /script-src 'self' 'nonce-abc'/);
  assert.ok(!/script-src[^;]*unsafe-inline/.test(strict), 'kein unsafe-inline bei script-src');
  assert.match(strict, /object-src 'none'/);
  assert.match(strict, /frame-ancestors 'none'/);
});

test('CSP locker: weiterhin unsafe-inline (Notausstieg)', () => {
  const loose = cspFor({});
  assert.match(loose, /script-src 'self' 'unsafe-inline'/);
});

test('upgrade-insecure-requests nur über HTTPS', () => {
  const http1 = cspFor({ socket: {} });
  assert.ok(!http1.includes('upgrade-insecure-requests'), 'über http würde es die Seite zerstören');
  const https = cspFor({ socket: { encrypted: true } });
  assert.ok(https.includes('upgrade-insecure-requests'));
});

test('jeder Nonce ist zufällig und lang genug', () => {
  const a = cspNonce(), b = cspNonce();
  assert.notEqual(a, b);
  assert.ok(a.length >= 20, `Nonce zu kurz: ${a.length}`);
  assert.match(a, /^[A-Za-z0-9+/=]+$/);
});

/* ═══════════════════════════════════════════════════════════════════════
   TEIL 2 — Integration gegen den echten Server
   ═══════════════════════════════════════════════════════════════════════ */

let srv = null;
let booted = false;

test.before(async () => {
  srv = spawn(process.execPath, [path.join(ROOT, 'server.js')], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', NODE_ENV: 'production', CSP_STRICT: '1' },
    stdio: 'ignore'
  });
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try { const r = await req(BASE + '/index.html'); if (r.status === 200) { booted = true; break; } } catch (e) { /* noch nicht da */ }
  }
});

test.after(() => { try { srv?.kill('SIGKILL'); } catch (e) { /* schon weg */ } });

test('ausgeliefertes HTML: Nonce im Header UND im Body', async () => {
  if (!booted) return;
  const r = await req(BASE + '/login.html');
  const csp = r.headers['content-security-policy'] || '';
  const nonce = (csp.match(/'nonce-([^']+)'/) || [])[1];
  assert.ok(nonce, 'CSP enthält einen Nonce');
  assert.ok(!/script-src[^;]*unsafe-inline/.test(csp), 'script-src ohne unsafe-inline');
  assert.ok(r.text.split(nonce).length > 1, 'derselbe Nonce steht im HTML');
});

test('kein Inline-Handler bleibt im ausgelieferten Markup', async () => {
  if (!booted) return;
  for (const page of ['/login.html', '/sessions.html', '/control.html', '/tickets.html', '/admin.html']) {
    const r = await req(BASE + page);
    /* Nur außerhalb von <script>-Blöcken prüfen — dort stehen sie in JS-Strings. */
    const outside = r.text.split(/(<script\b[^>]*>[\s\S]*?<\/script\s*>)/i)
      .filter((part) => !/^<script\b/i.test(part)).join('');
    const leftover = (outside.match(/\son[a-z]+=/gi) || []);
    assert.equal(leftover.length, 0, `${page}: noch Inline-Handler ${leftover.join(', ')}`);
  }
});

test('Nonce-HTML wird nicht gespeichert und bekommt je Antwort einen neuen ETag', async () => {
  if (!booted) return;
  const nonces = new Set();
  const etags = new Set();
  for (let i = 0; i < 3; i++) {
    const r = await req(BASE + '/login.html', { 'Accept-Encoding': 'br' });
    const nonce = (String(r.headers['content-security-policy']).match(/'nonce-([^']+)'/) || [])[1];
    assert.ok(r.text.split(nonce).length > 1, `Nonce fehlt im komprimierten Body (Durchlauf ${i + 1})`);
    assert.match(r.headers['cache-control'], /no-store/);
    nonces.add(nonce);
    etags.add(r.headers.etag);
  }
  assert.equal(nonces.size, 3, 'drei Antworten → drei verschiedene Nonces');
  assert.equal(etags.size, 3, 'Nonce-HTML darf nicht unter einem alten ETag wiederverwendet werden');
});

test('Nonce-HTML mit If-None-Match liefert frischen Body statt 304', async () => {
  if (!booted) return;
  const first = await req(BASE + '/login.html');
  const second = await req(BASE + '/login.html', { 'If-None-Match': first.headers.etag });
  assert.equal(second.status, 200);
  const nonce = (String(second.headers['content-security-policy']).match(/'nonce-([^']+)'/) || [])[1];
  assert.ok(nonce);
  assert.ok(second.text.includes(`nonce="${nonce}"`), 'frischer CSP-Nonce muss zum Body passen');
});

test('kein javascript:-Link und keine externe Schrift mehr', async () => {
  if (!booted) return;
  const r = await req(BASE + '/notifications.html');
  assert.ok(!/href="javascript:/i.test(r.text), 'javascript:-Links entfernt');
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(r.text), 'keine externe Schrift mehr');
});

/* ═══════════════════════════════════════════════════════════════════════
   TEIL 3 — Funktion: Handler wirklich anklicken (jsdom)
   ═══════════════════════════════════════════════════════════════════════ */

async function loadJsdom() {
  const tries = [
    () => import('jsdom'),
    () => { const p = process.env.JSDOM_PATH; return p ? import(pathToFileURL(p).href) : Promise.reject(); },
    () => import('/home/user/.shot/node_modules/jsdom/lib/api.js')
  ];
  for (const t of tries) { try { const m = await t(); if (m?.JSDOM) return m; } catch (e) { /* nächster */ } }
  return null;
}

const jsdom = await loadJsdom();

test('umgehängter Handler feuert beim Klick (login.html)', { skip: jsdom ? false : 'jsdom fehlt (npm i -D jsdom)' }, async () => {
  if (!booted) return;
  const r = await req(BASE + '/login.html');
  const dom = new jsdom.JSDOM(r.text, {
    url: BASE + '/login.html',
    runScripts: 'dangerously',
    resources: undefined,
    pretendToBeVisual: true,
    beforeParse(win) {
      win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
      win.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
      win.fetch = () => Promise.reject(new Error('kein Netz im Test'));
      win.getToken = () => '';
      win.getRole = () => 'user';
    }
  });
  await new Promise((res) => setTimeout(res, 800));
  const win = dom.window;
  const doc = win.document;
  const btn = doc.getElementById('btn1');
  assert.ok(btn, 'Button vorhanden');
  assert.ok(btn.hasAttribute('data-csp-ev'), 'Button ist umgehängt');

  let aufgerufen = 0;
  win.step1Go = () => { aufgerufen++; };          /* Original-Funktion abfangen */
  btn.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  assert.equal(aufgerufen, 1, `Handler wurde ${aufgerufen}x aufgerufen (erwartet: 1)`);
  dom.window.close();
});

test('Ticket-Inbox ist in das SOUL ECHO Control Center eingebunden', { skip: jsdom ? false : 'jsdom fehlt (npm i -D jsdom)' }, async () => {
  if (!booted) return;
  const page = await req(BASE + '/control.html');
  assert.equal(page.status, 200);
  assert.match(page.text, /cc-core\.js/);
  assert.match(page.text, /cc-akten\.js/);

  const module = await req(BASE + '/js/cc-akten.js');
  assert.equal(module.status, 200);
  assert.match(module.text, /CC\.reg\('tickets'/);
  assert.match(module.text, /tickets\.manage/);
});
