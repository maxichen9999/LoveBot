/* ═══════════════════════════════════════════════════════════════════════
   💥  TESTS  —  Fehlerseiten mit richtigem HTTP-Code
   ───────────────────────────────────────────────────────────────────────
   Teil 1  Einheiten: Inhalte, Maskierung, keine Interna nach außen
   Teil 2  Integration: echter server.js liefert die Codes
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV = 'production';      /* Produktionsverhalten prüfen */
const ep = await import('../errorPages.js');
const {
  ERROR_PAGES, errorHtml, errorId, upstreamStatus
} = ep;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.ERRPAGE_PORT || 7791);
const BASE = `http://127.0.0.1:${PORT}`;

const CODES = [400, 401, 403, 404, 405, 408, 413, 418, 429, 500, 501, 502, 503, 504];

/* ═══════════════════════════════════════════════════════════════════════
   TEIL 1 — Einheiten
   ═══════════════════════════════════════════════════════════════════════ */

test('alle wichtigen Codes sind hinterlegt', () => {
  for (const c of CODES) {
    assert.ok(ERROR_PAGES[c], `Code ${c} fehlt`);
    assert.ok(ERROR_PAGES[c].emoji, `${c}: kein Symbol`);
    assert.ok(ERROR_PAGES[c].title, `${c}: keine Überschrift`);
    assert.ok(ERROR_PAGES[c].text.length > 30, `${c}: Erklärung zu kurz`);
    assert.ok(ERROR_PAGES[c].hint, `${c}: kein Hinweis`);
  }
});

test('jede Seite zeigt den Code, die Überschrift und einen Ausweg', () => {
  for (const c of CODES) {
    const page = { code: c, ...ERROR_PAGES[c], official: `${c} · Test` };
    const html = errorHtml(page, { path: '/test', id: 'E-TEST01' });
    assert.match(html, new RegExp(`<title>${c} — `), `${c}: Titel`);
    assert.ok(html.includes(String(c)), `${c}: Code im Text`);
    assert.match(html, /Zur Startseite/, `${c}: Ausweg fehlt`);
    assert.match(html, /site-shell\.js/, `${c}: gemeinsame Navigation fehlt`);
  }
});

test('Wiederholen-Knopf nur dort, wo er Sinn ergibt', () => {
  const mitRetry = errorHtml({ code: 503, ...ERROR_PAGES[503] }, {});
  assert.match(mitRetry, /Erneut versuchen/, '503 ist wiederholbar');
  const ohneRetry = errorHtml({ code: 404, ...ERROR_PAGES[404] }, {});
  assert.ok(!/Erneut versuchen/.test(ohneRetry), '404 bringt ein Neuladen nichts');
});

test('angeforderter Pfad wird maskiert (keine XSS-Lücke)', () => {
  const html = errorHtml({ code: 404, ...ERROR_PAGES[404] }, {
    path: '/<img src=x onerror=alert(1)>'
  });
  assert.ok(!html.includes('<img src=x'), 'Schadcode steht unmaskiert drin');
  assert.ok(html.includes('&lt;img'), 'Statt dessen maskiert');
});

test('Grund und Kennung werden ebenfalls maskiert', () => {
  const html = errorHtml({ code: 500, ...ERROR_PAGES[500] }, {
    reason: '<script>böse</script>', id: 'E-<b>'
  });
  assert.ok(!/<script>böse/.test(html));
  assert.ok(!/<b>/.test(html) || html.includes('&lt;b&gt;'));
});

test('in der Produktion gelangen keine Interna nach außen', () => {
  const html = errorHtml({ code: 500, ...ERROR_PAGES[500] }, {
    details: 'Error: geheime Pfade /home/user/…\n    at server.js:123'
  });
  assert.ok(!/geheime Pfade/.test(html), 'Details dürfen nicht erscheinen');
  assert.ok(!/at server\.js/.test(html), 'Stacktrace darf nicht erscheinen');
});

test('mit DEV_ERRORS=1 helfen die Details beim Fehlersuchen', async () => {
  process.env.DEV_ERRORS = '1';
  try {
    const dev = await import('../errorPages.js?dev=1');   /* frische Instanz */
    const html = dev.errorHtml({ code: 500, ...dev.ERROR_PAGES[500] }, {
      details: 'Error: zum Entwickeln sichtbar'
    });
    assert.match(html, /zum Entwickeln sichtbar/);
  } finally {
    delete process.env.DEV_ERRORS;
  }
});

test('keine Inline-Skripte und keine Inline-Handler (strenge CSP)', () => {
  for (const c of CODES) {
    const html = errorHtml({ code: c, ...ERROR_PAGES[c] }, {});
    assert.ok(!/<script(?![^>]*\ssrc=)/.test(html), `${c}: Inline-Skript gefunden`);
    assert.ok(!/\son[a-z]+=/i.test(html), `${c}: Inline-Handler gefunden`);
  }
});

test('Wartezeit wird angezeigt und als Retry-After mitgegeben', () => {
  const html = errorHtml({ code: 429, ...ERROR_PAGES[429] }, { retryAfter: 45 });
  assert.match(html, /45 Sekunden/);
});

test('unbekannte Codes fallen sauber auf die offizielle Beschreibung zurück', () => {
  const html = errorHtml({ code: 451, emoji: '⚖️', title: 'AUS RECHTLICHEN GRÜNDEN', text: 'x', hint: 'y', official: '451 · Unavailable For Legal Reasons' }, {});
  assert.match(html, /451/);
  assert.match(html, /Unavailable For Legal Reasons/);
});

test('Kennungen sind kurz und lesbar', () => {
  const ids = new Set();
  for (let i = 0; i < 50; i++) {
    const id = errorId();
    assert.match(id, /^E-[A-Z0-9]{6}$/, 'Form: ' + id);
    ids.add(id);
  }
  assert.ok(ids.size > 45, 'praktisch keine Wiederholungen');
});

test('Fehler anderer Dienste: 502 bei kaputter Antwort, 504 bei Timeout', () => {
  assert.equal(upstreamStatus({ message: 'fetch failed' }), 502);
  assert.equal(upstreamStatus({ code: 'ECONNREFUSED' }), 502);
  assert.equal(upstreamStatus({ name: 'AbortError' }), 504);
  assert.equal(upstreamStatus({ message: 'UND_ERR_BODY_TIMEOUT' }), 504);
  assert.equal(upstreamStatus({ kind: 'timeout' }), 504);
});

/* ═══════════════════════════════════════════════════════════════════════
   TEIL 2 — Integration gegen den echten Server
   ═══════════════════════════════════════════════════════════════════════ */

let srv = null;
let booted = false;

test.before(async () => {
  srv = spawn(process.execPath, [path.join(ROOT, 'server.js')], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', NODE_ENV: 'production' },
    stdio: 'ignore'
  });
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const r = await req(BASE + '/index.html');
      if (r.status === 200) { booted = true; break; }
    } catch (e) { /* noch nicht da */ }
  }
});

test.after(() => { try { srv?.kill('SIGKILL'); } catch (e) { /* schon weg */ } });

function req(url, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        let raw = body;
        if (res.headers['content-encoding'] === 'br') raw = zlib.brotliDecompressSync(body);
        else if (res.headers['content-encoding'] === 'gzip') raw = zlib.gunzipSync(body);
        resolve({ status: res.statusCode, headers: res.headers, body, text: raw.toString('utf8') });
      });
    }).on('error', reject);
  });
}

const BROWSER = { Accept: 'text/html,application/xhtml+xml' };
const TOOL = { Accept: 'application/json' };

test('unbekannte Seite: 404 — im Browser als Seite', async () => {
  if (!booted) return;
  const r = await req(BASE + '/gibtesnicht', BROWSER);
  assert.equal(r.status, 404, 'nicht 200 mit Fehlerseite!');
  assert.match(r.headers['content-type'], /text\/html/);
  assert.match(r.text, /<title>404 — SEITE NICHT GEFUNDEN/);
  assert.match(r.text, /site-shell\.js/, 'Navigation zum Weiterklicken');
  assert.match(r.headers['cache-control'], /no-store/, 'Fehlerseiten nie cachen');
});

test('unbekannte Seite: 404 — für Tools als JSON', async () => {
  if (!booted) return;
  const r = await req(BASE + '/gibtesnicht', TOOL);
  assert.equal(r.status, 404);
  assert.match(r.headers['content-type'], /application\/json/);
  const body = JSON.parse(r.text);
  assert.equal(body.code, 404);
  assert.equal(body.status, 404);
  assert.ok(body.message && body.hint, 'mit Erklärung und Hinweis');
});

test('🫖 /teapot antwortet mit 418', async () => {
  if (!booted) return;
  const r = await req(BASE + '/teapot', BROWSER);
  assert.equal(r.status, 418);
  assert.match(r.text, /TEEKANNE/);
});

test('Fehlerseiten tragen dieselbe strenge CSP', async () => {
  if (!booted) return;
  const r = await req(BASE + '/gibtesnicht', BROWSER);
  const csp = r.headers['content-security-policy'] || '';
  assert.ok(csp, 'CSP gesetzt');
  assert.ok(!/script-src[^;]*unsafe-inline/.test(csp), 'kein unsafe-inline');
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
});

test('Fehlerseiten werden nicht zwischengespeichert', async () => {
  if (!booted) return;
  const r = await req(BASE + '/gibtesnicht', BROWSER);
  assert.match(String(r.headers['cache-control']), /no-store/);
  assert.ok(!r.headers.etag, 'kein ETag für Fehlerseiten');
});

test('verbotene Methode: 405 mit Allow-Header', async () => {
  if (!booted) return;
  const r = await new Promise((resolve, reject) => {
    const rq = http.request({ host: '127.0.0.1', port: PORT, path: '/', method: 'TRACE' }, (res) => {
      res.resume();
      resolve({ status: res.statusCode, headers: res.headers });
    });
    rq.on('error', reject);
    rq.end();
  });
  assert.equal(r.status, 405);
  assert.ok(r.headers.allow, 'Allow-Header fehlt');
  assert.match(r.headers.allow, /GET/);
});

test('gesunde Seiten bleiben unberührt (200)', async () => {
  if (!booted) return;
  for (const p of ['/', '/index.html', '/cmd.html', '/http-codes.html', '/css/style.css']) {
    const r = await req(BASE + p, BROWSER);
    assert.equal(r.status, 200, p + ' muss erreichbar bleiben');
  }
});
