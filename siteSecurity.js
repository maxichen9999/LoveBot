/* ═══════════════════════════════════════════════════════════════════════
   🛡️  siteSecurity.js  —  Header · Cache · Kompression · .env · Validierung
   ─────────────────────────────────────────────────────────────────────
   Ein Modul, kein Framework, keine Zusatz-Pakete (nur Node-Bordmittel).
   server.js bindet es ein; alles ist einzeln testbar:

       node --test tests/siteSecurity.test.mjs

   Enthalten:
     1. .env-Lader            → Secrets aus Datei statt im Code
     2. Security-Header       → CSP, HSTS (nur bei HTTPS), COOP/COEP, …
     3. Cache-Control + ETag  → 304 statt Voll-Download
     4. gzip / brotli         → ~75 % weniger Bytes für HTML/CSS/JS
     5. CORS                  → standardmäßig Same-Origin, opt-in offen
     6. Eingabe-Validierung   → URLs, Strings, Zahlen, Enums
   ═══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
/* ═══════════════════════════════════════════════════════════════════════
   1) .env  —  Secrets aus der Datei, nie im Code
   ─────────────────────────────────────────────────────────────────────
   Bestehende Umgebungsvariablen werden NICHT überschrieben (die echte
   Umgebung hat immer Vorrang vor der Datei). Kein npm-Paket nötig.
   ═══════════════════════════════════════════════════════════════════════ */

export function parseEnv(text) {
  const out = {};
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (!key) continue;
    /* Anführungszeichen entfernen — dabei einen Kommentar NACH dem
       schließenden Anführungszeichen korrekt abschneiden
       (PW="ge heim"  # Kommentar  →  ge heim). */
    const q = val[0];
    if (q === '"' || q === "'") {
      const end = val.indexOf(q, 1);
      val = end > -1 ? val.slice(1, end) : val.slice(1);
    } else {
      const hash = val.indexOf(' #');
      if (hash > -1) val = val.slice(0, hash).trim();
    }
    out[key] = val;
  }
  return out;
}

export function loadEnv(file = path.join(process.cwd(), '.env'), { override = false } = {}) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { return { loaded: 0, file, existed: false }; }
  const vars = parseEnv(text);
  let n = 0;
  for (const [k, v] of Object.entries(vars)) {
    if (override || process.env[k] === undefined) { process.env[k] = v; n++; }
  }
  return { loaded: n, file, existed: true, keys: Object.keys(vars) };
}

/* ═══════════════════════════════════════════════════════════════════════
   2) Security-Header
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   CSP — zwei Stufen
   ─────────────────────────────────────────────────────────────────────
   streng (Standard):  Jede HTML-Antwort bekommt einen frischen Nonce.
                       Der Server verseht damit alle Inline-Skripte und
                       hängt Inline-Handler auf addEventListener um
                       (siehe prepareInlineHtml) → script-src ohne
                       'unsafe-inline'.
   locker (CSP_STRICT=0): Verhalten wie vorher — Notausstieg, falls eine
                       Seite doch noch ein Inline-Skript braucht.

   'upgrade-insecure-requests' gibt es NUR über HTTPS: über
   http://127.0.0.1 würde es jede Anfrage auf https umschreiben und die
   Seite damit unerreichbar machen.
   ═══════════════════════════════════════════════════════════════════════ */
export const CSP_STRICT = !/^(0|false|no)$/i.test(String(process.env.CSP_STRICT ?? '1'));

export function cspFor(req, nonce = '') {
  const dirs = [
    "default-src 'self'",
    nonce
      ? `script-src 'self' 'nonce-${nonce}'`
      : "script-src 'self' 'unsafe-inline'",
    /* Inline-<style> und style="…"-Attribute brauchen weiterhin
       'unsafe-inline'; ein Nonce hier würde die Attribute blockieren. */
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'"
  ];
  if (isSecureRequest(req)) dirs.push('upgrade-insecure-requests');
  return dirs.join('; ');
}

export const BASE_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'X-XSS-Protection': '0',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-DNS-Prefetch-Control': 'off',
  'Origin-Agent-Cluster': '?1',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=(), payment=(), interest-cohort=()',
};

/* Ist die Anfrage über TLS verschlüsselt? (eigener Port oder Proxy-Header) */
export function isSecureRequest(req) {
  try {
    if (req?.socket?.encrypted) return true;
    const trusted = /^(1|true|yes)$/i.test(String(process.env.TRUST_PROXY || 'false'));
    if (!trusted) return false;
    return String(req?.headers?.['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
  } catch (e) { return false; }
}

/* HSTS gibt es NUR über HTTPS — über HTTP wäre der Header wirkungslos und
   würde bei späterer Umstellung zu unnötigem Risiko. */
export function hstsHeaders(req, { maxAge = 15552000, preload = false } = {}) {
  if (!isSecureRequest(req)) return {};
  const value = `max-age=${maxAge}; includeSubDomains${preload ? '; preload' : ''}`;
  return { 'Strict-Transport-Security': value };
}

export function securityHeaders(req, extra = {}) {
  return Object.assign({}, BASE_HEADERS, { 'Content-Security-Policy': cspFor(req) }, hstsHeaders(req), extra);
}

/* CORS: Same-Origin ist die sichere Voreinstellung.
   Wer die API aus einem anderen Ursprung braucht, setzt API_CORS=*
   (oder API_CORS=https://example.com). */
export function corsHeaders(origin) {
  const allow = String(process.env.API_CORS || '').trim();
  const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
  /* Ohne Konfiguration: in der Entwicklung offen (wie bisher, damit lokale
     Tools weiter funktionieren), in der Produktion geschlossen. */
  if (!allow) {
    if (isProd) return {};
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };
  }
  const originHeader = allow === '*'
    ? '*'
    : String(origin || '').trim();
  if (allow !== '*' && !allow.split(',').map((s) => s.trim()).includes(originHeader)) return {};
  return {
    'Access-Control-Allow-Origin': originHeader,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   3) Cache-Control + ETag
   ═══════════════════════════════════════════════════════════════════════ */

const CACHE_RULES = [
  /* Bilder/Icons/Fonts ändern sich selten → eine Woche */
  { test: /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf)$/i, value: 'public, max-age=604800, immutable' },
  /* CSS/JS: kurz, damit ein Deploy schnell ankommt */
  { test: /\.(css|js|mjs|json|webmanifest|svg)$/i, value: 'public, max-age=300, must-revalidate' },
  /* HTML immer frisch prüfen (Navigation/Inhalte ändern sich) */
  { test: /\.(html)$|\/$/i, value: 'no-cache' }
];

export function cacheControlFor(urlPath = '') {
  for (const rule of CACHE_RULES) if (rule.test.test(urlPath)) return rule.value;
  return 'public, max-age=60';
}

/* ETag aus Inhalt — stabil über Neustarts hinweg. */
export function etagFor(buf) {
  const hash = crypto.createHash('sha1').update(buf).digest('base64').slice(0, 27);
  return `W/"${buf.length}-${hash}"`;
}

/* ═══════════════════════════════════════════════════════════════════════
   4) Kompression (gzip / brotli)
   ═══════════════════════════════════════════════════════════════════════ */

const COMPRESSIBLE = /^(text\/|application\/(javascript|json|xml|xhtml|manifest\+json)|image\/svg\+xml|application\/wasm)/i;
const MIN_COMPRESS_BYTES = 1024;                 // unter 1 KB lohnt es nicht
const compressCache = new Map();                 // etag|encoding → Buffer
const CACHE_MAX = 256;

export function wantsEncoding(req, available = { br: true, gzip: true }) {
  const ae = String(req?.headers?.['accept-encoding'] || '');
  if (available.br && /\bbr\b/.test(ae)) return 'br';
  if (available.gzip && /\bgzip\b/.test(ae)) return 'gz';
  return '';
}

export async function maybeCompress(req, body, contentType = '', key = '') {
  const enc = wantsEncoding(req);
  if (!enc || !body) return { body, encoding: '' };
  if (!COMPRESSIBLE.test(contentType)) return { body, encoding: '' };
  if (Buffer.byteLength(body) < MIN_COMPRESS_BYTES) return { body, encoding: '' };

  const cacheKey = `${key}|${enc}`;
  if (key && compressCache.has(cacheKey)) {
    return { body: compressCache.get(cacheKey), encoding: enc };
  }
  try {
    const out = enc === 'br'
      ? await new Promise((res, rej) => zlib.brotliCompress(body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }, (e, r) => (e ? rej(e) : res(r))))
      : await new Promise((res, rej) => zlib.gzip(body, { level: 6 }, (e, r) => (e ? rej(e) : res(r))));
    if (key) {
      if (compressCache.size >= CACHE_MAX) compressCache.delete(compressCache.keys().next().value);
      compressCache.set(cacheKey, out);
    }
    /* Nur verwenden, wenn es wirklich kleiner ist (z. B. schon komprimierte Daten) */
    return Buffer.byteLength(out) < Buffer.byteLength(body) ? { body: out, encoding: enc } : { body, encoding: '' };
  } catch (e) {
    return { body, encoding: '' };
  }
}

/* ── Komplettpaket für statische Antworten ─────────────────────────────
   Setzt Security-Header, ETag (inkl. 304), Cache-Control und Kompression. */
export async function hardenStatic(req, { body, contentType = '', urlPath = '', extraHeaders = {}, nonce = '', etagFrom = null }) {
  /* etagFrom: bei Nonce-Seiten der Body OHNE Nonce — sonst würde sich der
     ETag mit jeder Antwort ändern und 304 nie greifen. */
  const etagSource = etagFrom !== null ? etagFrom : body;
  const etag = etagFor(Buffer.isBuffer(etagSource) ? etagSource : Buffer.from(String(etagSource)));
  const headers = Object.assign(
    { 'Content-Type': contentType || 'application/octet-stream' },
    securityHeaders(req),
    { 'Cache-Control': nonce ? 'no-store' : cacheControlFor(urlPath), 'ETag': etag, 'Vary': 'Accept-Encoding' },
    extraHeaders
  );
  if (nonce) headers['Content-Security-Policy'] = cspFor(req, nonce);

  /* Ein 304 würde den alten HTML-Body mit einer neuen CSP-Nonce kombinieren. */
  if (!nonce && req?.headers?.['if-none-match'] && String(req.headers['if-none-match']).split(',').map((s) => s.trim()).includes(etag)) {
    return { notModified: true, headers, body: Buffer.alloc(0) };
  }

  /* Achtung: mit Nonce darf der Kompressions-Cache NICHT greifen. Der
     Schlüssel (ETag) bleibt stabil, der Body enthält aber den Nonce —
     sonst würde ein zwischengespeicherter Body mit einem anderen Nonce
     im Header ausgeliefert und der Browser blockt jedes Skript. */
  const { body: out, encoding } = await maybeCompress(req, body, contentType, nonce ? '' : etag);
  if (encoding === 'br') headers['Content-Encoding'] = 'br';
  if (encoding === 'gz') headers['Content-Encoding'] = 'gzip';
  headers['Content-Length'] = String(Buffer.byteLength(out));
  return { notModified: false, headers, body: out };
}

/* Header für JSON-Antworten: nie cachen, CORS nur bei Bedarf. */
export function jsonHeaders(req, extra = {}) {
  return Object.assign(
    { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    securityHeaders(req),
    corsHeaders(req?.headers?.origin),
    extra
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   5) Eingabe-Validierung  (für API-Parameter, z. B. $ping-URLs)
   ═══════════════════════════════════════════════════════════════════════ */

const PRIVATE_V4 = [/^10\./, /^127\./, /^169\.254\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./, /^0\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./];

/* URL prüfen: Schema, Länge, Host — und optional private Ziele verbieten.
   Liefert { ok, url, host, error } — niemals eine Exception. */
export function safeUrl(input, { allowHttp = true, allowPrivate = false, maxLen = 2048, defaultProto = 'https' } = {}) {
  const raw = String(input == null ? '' : input).trim();
  if (!raw) return { ok: false, error: 'leer' };
  if (raw.length > maxLen) return { ok: false, error: `zu lang (max. ${maxLen} Zeichen)` };
  if (/[\s"'`\\<>[\]{}]/.test(raw)) return { ok: false, error: 'unerlaubte Zeichen' };

  const withProto = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `${defaultProto}://${raw.replace(/^\/+/, '')}`;
  let u;
  try { u = new URL(withProto); } catch (e) { return { ok: false, error: 'keine gültige Adresse' }; }

  if (!allowHttp && u.protocol === 'http:') return { ok: false, error: 'http nicht erlaubt' };
  if (!/^https?:$/.test(u.protocol)) return { ok: false, error: `Schema ${u.protocol} nicht erlaubt` };
  if (u.username || u.password) return { ok: false, error: 'Adresse mit Benutzername/Passwort nicht erlaubt' };
  if (!u.hostname || !u.hostname.includes('.')) return { ok: false, error: 'Host fehlt oder ungültig' };
  if (!allowPrivate) {
    if (u.hostname === 'localhost' || u.hostname.endsWith('.localhost') || u.hostname.endsWith('.internal')) {
      return { ok: false, error: 'interne Adresse nicht erlaubt' };
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname) && PRIVATE_V4.some((re) => re.test(u.hostname))) {
      return { ok: false, error: 'private IP nicht erlaubt' };
    }
  }
  return { ok: true, url: u.toString(), host: u.hostname };
}

export function strParam(value, { max = 200, def = '', pattern = null } = {}) {
  let s = String(value == null ? '' : value).trim();
  if (!s) return def;
  if (s.length > max) s = s.slice(0, max);
  /* Steuerzeichen entfernen (Log-Injection / Terminal-Escapes) */
  s = s.replace(/[\u0000-\u001f\u007f]/g, '');   /* Steuerzeichen entfernen (Log-Injection) */
  if (pattern && !pattern.test(s)) return def;
  return s;
}

export function intParam(value, { min = 0, max = 1_000_000_000, def = 0 } = {}) {
  const n = Number.parseInt(String(value == null ? '' : value), 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

export function enumParam(value, allowed = [], def = null) {
  const s = String(value == null ? '' : value).trim().toLowerCase();
  return allowed.map((a) => String(a).toLowerCase()).includes(s) ? s : (def === null ? allowed[0] : def);
}


/* ═══════════════════════════════════════════════════════════════════════
   7) CSP-Nonce für HTML-Seiten
   ─────────────────────────────────────────────────────────────────────
   Der Browser blockt mit Nonce-CSP jedes Inline-Skript und jeden
   Inline-Handler (onclick="…"). Damit die Seiten unverändert
   weiterlaufen, macht der Server zweierlei:

     1. jedes <script>/<style> bekommt nonce="…"
     2. aus onclick="CODE" wird data-csp-ev="id" und ein winziges
        (ebenso mit Nonce versehenes) Skript hängt CODE per
        addEventListener an. Dabei bleibt `this` das Element und
        `event` verfügbar — genau wie vorher.

   Kein eval, kein new Function: der Code steht als normale Funktion da,
   die der Browser übersetzt. Attribute inner halb von <script>-Blöcken
   (dort stehen sie in JS-Zeichenketten) bleiben unangetastet.
   ═══════════════════════════════════════════════════════════════════════ */
import crypto from 'node:crypto';

const NONCE_TOKEN = '__LOVEBOT_CSP_NONCE__';
const RE_BLOCK = /(<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>)/gi;
const RE_EV = /\son([a-z][a-z0-9_-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;

/* Frischer Zufallswert pro Antwort. */
export function cspNonce() {
  return crypto.randomBytes(18).toString('base64');
}

export function prepareInlineHtml(html) {
  const chunks = String(html).split(RE_BLOCK);
  const handlers = [];
  let n = 0;

  const out = chunks.map((chunk) => {
    /* Skript- und Stilblöcke: nur das Start-Tag mit Nonce versehen,
       der Inhalt bleibt, wie er ist (dort können onclick="…" als
       JS-Zeichenkette vorkommen — die dürfen wir nicht anfassen). */
    if (/^<script\b/i.test(chunk)) {
      return chunk.replace(/^<script\b([^>]*)>/i, (m, attrs) =>
        /\bnonce\s*=/i.test(attrs) ? m : `<script${attrs} nonce="${NONCE_TOKEN}">`);
    }
    if (/^<style\b/i.test(chunk)) {
      return chunk.replace(/^<style\b([^>]*)>/i, (m, attrs) =>
        /\bnonce\s*=/i.test(attrs) ? m : `<style${attrs} nonce="${NONCE_TOKEN}">`);
    }
    return chunk.replace(RE_EV, (m, ev, _q, dq, sq, bare) => {
      const code = String(dq !== undefined ? dq : sq !== undefined ? sq : (bare || '')).trim();
      if (!code) return '';
      const id = 'csph' + (++n);
      handlers.push({ id, ev: String(ev).toLowerCase(), code });
      return ` data-csp-ev="${id}"`;
    });
  }).join('');

  if (!handlers.length) return out;

  /* </script> innerhalb von Handler-Code würde den Block vorzeitig
     beenden — in JS-Zeichenketten ist <\/ die erlaubte Schreibweise. */
  const esc = (c) => c.replace(/<\/(script)/gi, '<\\/$1');
  const map = handlers.map((h) =>
    `    ${JSON.stringify(h.id)}: [${JSON.stringify(h.ev)}, function (event) {\n${esc(h.code)}\n    }]`
  ).join(',\n');

  const shim = `\n<script nonce="${NONCE_TOKEN}">\n(function () {\n  var H = {\n${map}\n  };\n` +
    `  document.querySelectorAll('[data-csp-ev]').forEach(function (el) {\n` +
    `    var h = H[el.getAttribute('data-csp-ev')];\n` +
    `    if (h) el.addEventListener(h[0], h[1]);\n  });\n})();\n</script>\n`;

  return /<\/body\s*>/i.test(out) ? out.replace(/<\/body\s*>/i, shim + '</body>') : out + shim;
}

/* Ergebnis zwischenspeichern: die Umschreibung ist pro Datei gleich,
   nur der Nonce wechselt. */
const preparedCache = new Map();
export function preparedHtml(file, mtimeMs, rawHtml) {
  const hit = preparedCache.get(file);
  if (hit && hit.mtime === mtimeMs) return hit.html;
  const html = prepareInlineHtml(rawHtml);
  if (preparedCache.size > 120) preparedCache.clear();
  preparedCache.set(file, { mtime: mtimeMs, html });
  return html;
}

/* Den Platzhalter durch den echten Nonce ersetzen (eine Antwort = ein Nonce). */
export function finalizeHtml(html, nonce) {
  return nonce ? String(html).split(NONCE_TOKEN).join(nonce) : String(html);
}

export { NONCE_TOKEN };
