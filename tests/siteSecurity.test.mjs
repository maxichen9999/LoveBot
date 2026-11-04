/* ═══════════════════════════════════════════════════════════════════════
   🧪  UNIT-TESTS · siteSecurity.js
   ─────────────────────────────────────────────────────────────────────
   Aufruf:  node --test tests/
   Keine externen Pakete — nur Node-Bordmittel.
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  parseEnv, loadEnv, securityHeaders, isSecureRequest, hstsHeaders, corsHeaders,
  cacheControlFor, etagFor, maybeCompress, hardenStatic, safeUrl, strParam, intParam, enumParam
} from '../siteSecurity.js';

/* ── .env ───────────────────────────────────────────────────────────── */
test('.env: Werte, Kommentare und Anführungszeichen werden korrekt gelesen', () => {
  const vars = parseEnv('# Kommentar\nOWNER_NUMBER=49123\nLEER=\nPW="ge heim"\nANDERE=\'x\'  # Kommentar danach\n');
  assert.equal(vars.OWNER_NUMBER, '49123');
  assert.equal(vars.PW, 'ge heim');
  assert.equal(vars.ANDERE, 'x');
  assert.equal(vars.LEER, '');
});

test('.env: bestehende Umgebungsvariablen werden nicht überschrieben', () => {
  const file = path.join(os.tmpdir(), 'lovebot-test.env');
  fs.writeFileSync(file, 'LOVEBOT_TEST_KEY=aus_datei\n');
  process.env.LOVEBOT_TEST_KEY = 'aus_umgebung';
  const r = loadEnv(file);
  assert.equal(process.env.LOVEBOT_TEST_KEY, 'aus_umgebung', 'Umgebung hat Vorrang');
  assert.equal(r.loaded, 0);
  delete process.env.LOVEBOT_TEST_KEY;
  const r2 = loadEnv(file);
  assert.equal(process.env.LOVEBOT_TEST_KEY, 'aus_datei');
  assert.equal(r2.loaded, 1);
  fs.unlinkSync(file);
});

test('.env: fehlende Datei ist kein Fehler', () => {
  const r = loadEnv(path.join(os.tmpdir(), 'gibt-es-nicht-12345.env'));
  assert.equal(r.existed, false);
  assert.equal(r.loaded, 0);
});

/* ── Security-Header ────────────────────────────────────────────────── */
test('Security-Header: CSP, nosniff, DENY, COOP sind gesetzt', () => {
  const h = securityHeaders({ headers: {}, socket: {} });
  assert.match(h['Content-Security-Policy'], /default-src 'self'/);
  assert.match(h['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.equal(h['X-Content-Type-Options'], 'nosniff');
  assert.equal(h['X-Frame-Options'], 'DENY');
  assert.equal(h['Cross-Origin-Opener-Policy'], 'same-origin');
  assert.equal(h['X-Content-Type-Options'], 'nosniff');
});

test('HSTS nur über HTTPS — niemals über unverschlüsseltes HTTP', () => {
  const http = securityHeaders({ headers: {}, socket: {} });
  assert.equal(http['Strict-Transport-Security'], undefined, 'plain HTTP darf kein HSTS bekommen');
  const https = securityHeaders({ headers: {}, socket: { encrypted: true } });
  assert.match(https['Strict-Transport-Security'], /max-age=15552000/);
  assert.match(https['Strict-Transport-Security'], /includeSubDomains/);
});

test('HSTS hinter Proxy nur, wenn TRUST_PROXY aktiv ist', () => {
  const req = { headers: { 'x-forwarded-proto': 'https' }, socket: {} };
  const before = process.env.TRUST_PROXY;
  process.env.TRUST_PROXY = 'false';
  assert.deepEqual(hstsHeaders(req), {}, 'ohne Vertrauen kein HSTS (Header sind fälschbar)');
  process.env.TRUST_PROXY = 'true';
  assert.match(hstsHeaders(req)['Strict-Transport-Security'], /max-age/);
  if (before === undefined) delete process.env.TRUST_PROXY; else process.env.TRUST_PROXY = before;
});

/* ── CORS ───────────────────────────────────────────────────────────── */
test('CORS: in Produktion Same-Origin, in Entwicklung offen (Rückwärtskompatibilität)', () => {
  const before = process.env.API_CORS;
  const beforeEnv = process.env.NODE_ENV;
  delete process.env.API_CORS;
  process.env.NODE_ENV = 'production';
  assert.deepEqual(corsHeaders('https://evil.example'), {}, 'Produktion: kein ACAO');
  process.env.NODE_ENV = 'development';
  assert.equal(corsHeaders('https://evil.example')['Access-Control-Allow-Origin'], '*', 'Entwicklung: offen');
  if (beforeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = beforeEnv;
  process.env.API_CORS = '*';
  assert.equal(corsHeaders('https://evil.example')['Access-Control-Allow-Origin'], '*');
  process.env.API_CORS = 'https://meine.seite';
  assert.deepEqual(corsHeaders('https://evil.example'), {}, 'fremder Ursprung wird abgelehnt');
  assert.equal(corsHeaders('https://meine.seite')['Access-Control-Allow-Origin'], 'https://meine.seite');
  if (before === undefined) delete process.env.API_CORS; else process.env.API_CORS = before;
});

/* ── Cache ──────────────────────────────────────────────────────────── */
test('Cache-Control: Bilder lange, HTML nie, CSS/JS kurz', () => {
  assert.match(cacheControlFor('/assets/img/logo.png'), /max-age=604800/);
  assert.match(cacheControlFor('/css/style.css'), /max-age=300/);
  assert.equal(cacheControlFor('/index.html'), 'no-cache');
  assert.equal(cacheControlFor('/'), 'no-cache');
});

test('ETag: stabil bei gleichem Inhalt, unterschiedlich bei Änderung', () => {
  const a = etagFor(Buffer.from('hallo'));
  const b = etagFor(Buffer.from('hallo'));
  const c = etagFor(Buffer.from('hallo!'));
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^W\/"/);
});

/* ── Kompression ────────────────────────────────────────────────────── */
test('Kompression: Text wird gzip/br komprimiert', async () => {
  const body = Buffer.from('a'.repeat(5000));
  const gz = await maybeCompress({ headers: { 'accept-encoding': 'gzip' } }, body, 'text/html', 'k1');
  assert.equal(gz.encoding, 'gz');
  assert.ok(gz.body.length < body.length / 5, 'deutlich kleiner');
  const br = await maybeCompress({ headers: { 'accept-encoding': 'br, gzip' } }, body, 'text/css', 'k2');
  assert.equal(br.encoding, 'br');
});

test('Kompression: kleine Dateien und Bilder bleiben unberührt', async () => {
  const klein = Buffer.from('hi');
  const r1 = await maybeCompress({ headers: { 'accept-encoding': 'gzip' } }, klein, 'text/html', 'k3');
  assert.equal(r1.encoding, '');
  const bild = Buffer.alloc(5000, 7);
  const r2 = await maybeCompress({ headers: { 'accept-encoding': 'gzip' } }, bild, 'image/png', 'k4');
  assert.equal(r2.encoding, '');
});

/* ── 304 ────────────────────────────────────────────────────────────── */
test('hardenStatic: unveränderte Datei → 304 ohne Body', async () => {
  const body = Buffer.from('<html>test</html>');
  const first = await hardenStatic({ headers: {} }, { body, contentType: 'text/html', urlPath: '/index.html' });
  const etag = first.headers['ETag'];
  const second = await hardenStatic({ headers: { 'if-none-match': etag } }, { body, contentType: 'text/html', urlPath: '/index.html' });
  assert.equal(second.notModified, true);
  assert.equal(second.body.length, 0);
  assert.equal(first.headers['Cache-Control'], 'no-cache');
  assert.ok(first.headers['Content-Security-Policy']);
});

/* ── Eingabe-Validierung ────────────────────────────────────────────── */
test('safeUrl: lässt normale Adressen zu', () => {
  for (const e of ['maxichen.de', 'https://maxichen.de/ping', 'http://example.com:8080/x']) {
    assert.equal(safeUrl(e).ok, true, e);
  }
});

test('safeUrl: blockt private/interne Ziele', () => {
  for (const e of ['http://127.0.0.1', 'http://localhost', 'http://192.168.1.1', 'http://169.254.169.254/latest', 'http://10.0.0.5']) {
    assert.equal(safeUrl(e).ok, false, `${e} darf nicht durchgehen`);
  }
  /* bewusst erlaubt, wenn der Aufrufer es will (z. B. eigener Server) */
  assert.equal(safeUrl('http://127.0.0.1', { allowPrivate: true }).ok, true);
});

test('safeUrl: blockt fremde Schemata, Zugangsdaten und Müll', () => {
  for (const e of ['javascript:alert(1)', 'file:///etc/passwd', 'ftp://example.com', 'https://user:pw@example.com', 'https://', 'a'.repeat(3000)]) {
    assert.equal(safeUrl(e).ok, false, `${e} darf nicht durchgehen`);
  }
});

test('safeUrl: http nur, wenn erlaubt', () => {
  assert.equal(safeUrl('http://example.com', { allowHttp: false }).ok, false);
  assert.equal(safeUrl('https://example.com', { allowHttp: false }).ok, true);
});

test('Parameter: Strings, Zahlen und Enums werden begrenzt', () => {
  assert.equal(strParam('  hallo  '), 'hallo');
  assert.equal(strParam('x'.repeat(500), { max: 10 }).length, 10);
  assert.equal(strParam('abc', { pattern: /^\d+$/ }), '');
  assert.equal(intParam('42'), 42);
  assert.equal(intParam('999999999999', { max: 100 }), 100);
  assert.equal(intParam('keinzahl', { def: 7 }), 7);
  assert.equal(enumParam('FULL', ['full', 'kurz']), 'full');
  assert.equal(enumParam('quatsch', ['full', 'kurz']), 'full');
});
