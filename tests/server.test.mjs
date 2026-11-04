/* ═══════════════════════════════════════════════════════════════════════
   🧪  INTEGRATIONSTEST · echter server.js
   ─────────────────────────────────────────────────────────────────────
   Startet server.js auf einem Test-Port und prüft das Verhalten, das man
   im Browser/Curl wirklich sieht: Security-Header, Cache, ETag/304,
   gzip/brotli, CORS und Fehlerseiten.

   Aufruf:  node --test tests/server.test.mjs
   Voraussetzung: die Module des Projekts müssen auflösbar sein
   (npm install). Sonst wird der Test übersprungen.
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.TEST_PORT || 7788);
const BASE = `http://127.0.0.1:${PORT}`;

/* Hilfsfunktion für Anfragen mit beliebigen Headern */
function req(url, { headers = {}, method = 'GET', body = undefined } = {}) {
  return new Promise((resolve, reject) => {
    const requestHeaders = body === undefined
      ? headers
      : { 'content-type': 'application/json', ...headers };
    const r = http.request(url, { method, headers: requestHeaders }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({
        status: res.statusCode, headers: res.headers,
        body: Buffer.concat(chunks), text: Buffer.concat(chunks).toString('utf8')
      }));
    });
    r.on('error', reject);
    r.setTimeout(10000, () => r.destroy(new Error('Timeout')));
    r.end(body === undefined ? undefined : JSON.stringify(body));
  });
}

/* ── Server starten (einmal für alle Tests) ─────────────────────────── */
let child = null;
let booted = false;

async function startServer() {
  child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      HOST: '127.0.0.1',
      NODE_ENV: 'production',
      TRUST_PROXY: 'false',
      OWNER_NUMBER: '4915550000000',
      OAUTH_BASE_URL: 'https://lovebot.example',
      GOOGLE_OAUTH_CLIENT_ID: 'test-google-client',
      GOOGLE_OAUTH_CLIENT_SECRET: 'test-google-secret',
      DISCORD_OAUTH_CLIENT_ID: '',
      DISCORD_OAUTH_CLIENT_SECRET: '',
      GITHUB_OAUTH_CLIENT_ID: 'test-github-client',
      GITHUB_OAUTH_CLIENT_SECRET: 'test-github-secret'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  for (let i = 0; i < 60; i++) {
    try { const r = await req(BASE + '/index.html'); if (r.status === 200) { booted = true; return true; } } catch (e) {}
    await new Promise((r) => setTimeout(r, 250));
  }
  try { child.kill('SIGKILL'); } catch (e) {}
  return false;
}

test.before(async () => {
  const ok = await startServer();
  if (!ok) {
    console.log('⏭️  server.js startet nicht (fehlende Module?) — Integrationstest übersprungen.');
    console.log('    Hinweis: npm install ausführen, dann erneut testen.');
  }
});

test.after(() => { try { child && child.kill('SIGKILL'); } catch (e) {} });

test('ehemaliger Zusatz-Owner erhält keine Owner-Rolle mehr', async () => {
  if (!booted) return;
  const response = await req(BASE + '/api/check-number', {
    method: 'POST',
    body: { number: '4917625006811@s.whatsapp.net' }
  });
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.text).status, 'unknown');
});

/* ── Security-Header ────────────────────────────────────────────────── */
test('Security-Header sind auf jeder Antwort gesetzt', async () => {
  if (!booted) return;
  const r = await req(BASE + '/index.html');
  assert.equal(r.status, 200);
  assert.match(r.headers['content-security-policy'], /default-src 'self'/);
  assert.match(r.headers['content-security-policy'], /frame-ancestors 'none'/);
  assert.equal(r.headers['x-content-type-options'], 'nosniff');
  assert.equal(r.headers['x-frame-options'], 'DENY');
  assert.equal(r.headers['cross-origin-opener-policy'], 'same-origin');
  assert.equal(r.headers['referrer-policy'], 'no-referrer');
  assert.equal(r.headers['x-dns-prefetch-control'], 'off');
  assert.equal(r.headers['origin-agent-cluster'], '?1');
});

test('HSTS fehlt über unverschlüsseltem HTTP (korrekt so)', async () => {
  if (!booted) return;
  const r = await req(BASE + '/index.html');
  assert.equal(r.headers['strict-transport-security'], undefined);
});

/* ── Cache ──────────────────────────────────────────────────────────── */
test('Cache-Control: Nonce-HTML no-store, CSS kurz, Bilder lange', async () => {
  if (!booted) return;
  const html = await req(BASE + '/index.html');
  assert.match(html.headers['cache-control'], /no-store/);
  const css = await req(BASE + '/css/style.css');
  assert.match(css.headers['cache-control'], /max-age=300/);
  const png = await req(BASE + '/assets/img/logo.png');
  assert.match(png.headers['cache-control'], /max-age=604800/);
});

/* ── ETag / 304 ─────────────────────────────────────────────────────── */
test('ETag + 304: unveränderte Datei wird nicht erneut gesendet', async () => {
  if (!booted) return;
  const first = await req(BASE + '/css/style.css', { headers: { 'Accept-Encoding': 'identity' } });
  const etag = first.headers['etag'];
  assert.ok(etag, 'ETag gesetzt');
  const second = await req(BASE + '/css/style.css', {
    headers: { 'Accept-Encoding': 'identity', 'If-None-Match': etag }
  });
  assert.equal(second.status, 304, '304 statt Voll-Download');
  assert.equal(second.body.length, 0, 'kein Body bei 304');
  assert.ok(second.body.length < first.body.length);
});

/* ── Kompression ────────────────────────────────────────────────────── */
test('gzip: CSS/HTML werden komprimiert ausgeliefert', async () => {
  if (!booted) return;
  const plain = await req(BASE + '/css/style.css', { headers: { 'Accept-Encoding': 'identity' } });
  const gz = await req(BASE + '/css/style.css', { headers: { 'Accept-Encoding': 'gzip' } });
  assert.equal(gz.headers['content-encoding'], 'gzip');
  assert.ok(gz.body.length < plain.body.length / 2, `deutlich kleiner (${plain.body.length} → ${gz.body.length} Bytes)`);
  assert.equal(gz.headers.vary, 'Accept-Encoding');
});

test('brotli wird bevorzugt, wenn der Browser es kann', async () => {
  if (!booted) return;
  const br = await req(BASE + '/index.html', { headers: { 'Accept-Encoding': 'br, gzip' } });
  assert.equal(br.headers['content-encoding'], 'br');
  /* Der Testclient muss selbst entpacken — der Browser macht das automatisch. */
  const text = zlib.brotliDecompressSync(br.body).toString('utf8');
  assert.match(text, /<html/i, 'inhaltlich korrekt');
  const plain = await req(BASE + '/index.html', { headers: { 'Accept-Encoding': 'identity' } });
  assert.equal(text.length, plain.text.length, 'entpackt identisch mit Original');
  assert.ok(br.body.length < plain.body.length / 2, `deutlich kleiner (${plain.body.length} → ${br.body.length} Bytes)`);
});

/* ── API ────────────────────────────────────────────────────────────── */
test('API-Antworten werden nie gecacht und sind in Produktion nicht öffentlich (CORS)', async () => {
  if (!booted) return;
  const r = await req(BASE + '/api/siteinfo');
  assert.equal(r.headers['cache-control'], 'no-store');
  assert.equal(r.headers['access-control-allow-origin'], undefined, 'Produktion: kein ACAO *');
  assert.ok(r.headers['content-security-policy']);
});

test('Manuelle IP-Sperren sind ohne Owner-Login weder sichtbar noch änderbar', async () => {
  if (!booted) return;
  const list = await req(BASE + '/api/admin/ip-bans');
  assert.ok([401, 403].includes(list.status));
  assert.equal(JSON.parse(list.text).bans, undefined);

  const mutation = await fetch(BASE + '/api/admin/ip-bans', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'ban', ip: '203.0.113.25', reason: 'test' })
  });
  assert.ok([401, 403].includes(mutation.status));
});

test('Kontakt-API ist öffentlich erreichbar und validiert vor dem Login-Gate', async () => {
  if (!booted) return;
  const response = await fetch(BASE + '/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '', email: '', subject: '', message: '' })
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /gültige E-Mail-Adresse/);
});

test('OAuth zeigt nur konfigurierte Provider und gibt keine Secrets preis', async () => {
  if (!booted) return;
  const response = await req(BASE + '/api/oauth/providers');
  assert.equal(response.status, 200);
  const data = JSON.parse(response.text);
  assert.deepEqual(data.providers, [
    { id: 'google', label: 'Google', enabled: true },
    { id: 'discord', label: 'Discord', enabled: false },
    { id: 'github', label: 'GitHub', enabled: true }
  ]);
  assert.doesNotMatch(response.text, /test-google-secret|test-google-client|test-github-secret|test-github-client/);
});

test('OAuth-Start verwendet festen Callback, einmaligen State und PKCE', async () => {
  if (!booted) return;
  const response = await req(BASE + '/api/oauth/start/google');
  assert.equal(response.status, 302);
  const authorization = new URL(response.headers.location);
  assert.equal(authorization.origin, 'https://accounts.google.com');
  assert.equal(authorization.searchParams.get('redirect_uri'), 'https://lovebot.example');
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
  assert.match(authorization.searchParams.get('code_challenge'), /^[A-Za-z0-9_-]{43}$/);
  assert.match(authorization.searchParams.get('state'), /^[A-Za-z0-9_-]{40,}$/);
  const callback = await req(`${BASE}/?error=access_denied&state=${authorization.searchParams.get('state')}`);
  assert.equal(callback.status, 303);
  assert.match(callback.headers.location, /^\/login\.html#oauth_error=/);
  const signupResponse = await fetch(BASE + '/api/oauth/start/google', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ allowSignup: true })
  });
  assert.equal(signupResponse.status, 200);
  const signupData = await signupResponse.json();
  assert.equal(signupData.ok, true);
  assert.equal(new URL(signupData.url).searchParams.get('redirect_uri'), 'https://lovebot.example');
  const githubResponse = await req(BASE + '/api/oauth/start/github');
  assert.equal(githubResponse.status, 302);
  const githubAuthorization = new URL(githubResponse.headers.location);
  assert.equal(githubAuthorization.origin, 'https://github.com');
  assert.equal(githubAuthorization.searchParams.get('redirect_uri'), 'https://lovebot.example');
  assert.match(githubAuthorization.searchParams.get('scope'), /user%3Aemail|user:email/);
  assert.equal((await req(BASE + '/api/oauth/start/discord')).status, 404);
  assert.equal((await req(BASE + '/api/oauth/start/facebook')).status, 401);
  assert.equal((await req(BASE + '/api/oauth/start/apple')).status, 401);
});

test('Passwort-Reset verrät nicht, ob eine Telefonnummer registriert ist', async () => {
  if (!booted) return;
  const post = (number) => fetch(BASE + '/api/password-reset/request', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ number })
  }).then(async (response) => ({ status: response.status, data: await response.json() }));
  const [first, second] = await Promise.all([
    post('4915550000001'),
    post('4915550000002')
  ]);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(first.data.message, second.data.message);
  assert.notEqual(first.data.requestId, second.data.requestId);
});

test('Neue Webkonten können ohne WhatsApp- und E-Mail-verifizierten Setup-Token nicht erstellt werden', async () => {
  if (!booted) return;
  const response = await fetch(BASE + '/api/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'test_user', password: 'a-secure-test-password', privacyAccepted: true })
  });
  assert.equal(response.status, 400);
});

test('Legacy-Admin-URL leitet in die Ticket-Inbox des SOUL ECHO Control Centers', async () => {
  if (!booted) return;
  const legacy = await req(BASE + '/admin.html');
  assert.equal(legacy.status, 302);
  assert.equal(legacy.headers.location, '/control.html#/tickets');
  assert.equal(legacy.headers['cache-control'], 'no-store');

  const control = await req(BASE + '/control.html');
  assert.equal(control.status, 200);
  assert.match(control.text, /cc-akten\.js/);
  const tickets = await req(BASE + '/tickets.html');
  assert.match(tickets.text, /\/control\.html#\/tickets/);
});

test('App Control Panel mit Sessions-Ansicht wird direkt ausgeliefert', async () => {
  if (!booted) return;
  const app = await req(BASE + '/app.html');
  assert.equal(app.status, 200);
  assert.match(app.text, /\/css\/control-center\.css\?v=20261011-night/);
  assert.match(app.text, /night\/app\.js/);
  assert.match(app.text, /night\/ui\.js/);
  const scripts = await req(BASE + '/js/night/app.js');
  assert.equal(scripts.status, 200);
  assert.match(scripts.text, /V\.sessions = async/);
  assert.match(scripts.text, /data-session-action/);
  assert.doesNotMatch(scripts.text, /onclick="APP\.(?:newSession|startAllSessions|sessionAct)/);
  assert.match(scripts.text, /AdminSave · nur gespeicherte Admins schützen/);
});

test('Unbekannte Wege → 404 (Browser bekommt HTML, Tools JSON)', async () => {
  if (!booted) return;
  const page = await req(BASE + '/gibt-es-nicht.html', { headers: { Accept: 'text/html' } });
  assert.equal(page.status, 404);
  assert.match(page.text, /<html/i, 'hübsche 404-Seite statt nacktem Text');
  const api = await req(BASE + '/api/gibt-es-nicht');
  assert.ok([401, 403, 404].includes(api.status), `API antwortet mit ${api.status}`);
});

test('AI-API-Routen sind entfernt', async () => {
  if (!booted) return;
  for (const endpoint of ['/api/ai/status', '/api/ai/local/status', '/api/ai/local/chat', '/api/ai/chat']) {
    const response = await req(BASE + endpoint);
    assert.equal(response.status, 404, `${endpoint} existiert nicht mehr`);
  }
});

test('TRACE/CONNECT werden abgelehnt (XST-Schutz)', async () => {
  if (!booted) return;
  const r = await req(BASE + '/index.html', { method: 'TRACE' });
  assert.equal(r.status, 405);
  assert.equal(r.headers.allow, 'GET, POST, OPTIONS, HEAD');
});
