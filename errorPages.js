/* ═══════════════════════════════════════════════════════════════════════
   💥  FEHLERSEITEN  —  richtige HTTP-Codes, ordentliche Seiten
   ───────────────────────────────────────────────────────────────────────
   Bislang: 404 und 500 als Text. Jetzt: jede Antwort bekommt den Code,
   der zur Lage passt — und im Browser eine Seite im Look der Website,
   mit Navigation, damit man nicht in einer Sackgasse landet.

     400  Schlechte Anfrage      404  Nicht gefunden      429  Zu viele Anfragen
     401  Anmeldung nötig        405  Methode verboten    500  Serverfehler
     403  Kein Zutritt           408  Zeitüberschreitung  502  Schlechte Brücke
     413  Zu groß                418  Teekanne 🫖          503  Wartung / überlastet
     501  Nicht umgesetzt        504  Brücke zu langsam

   Regeln:
   · Browser (Accept: text/html)  → schöne Seite
   · Tools   (alles andere)       → kurzes JSON mit denselben Daten
   · Interne Details (Stacktraces) NIE nach außen — nur mit DEV_ERRORS=1
   · Alles wird maskiert: auch der angeforderte Pfad (sonst XSS-Lücke)
   · Keine Inline-Skripte → die strenge CSP aus siteSecurity.js greift voll
   ═══════════════════════════════════════════════════════════════════════ */
import { cspFor, cspNonce, securityHeaders } from './siteSecurity.js';
import { findCode } from './httpCodes.js';

/* ── Inhalte je Code ────────────────────────────────────────────────── */
export const ERROR_PAGES = {
  400: { emoji: '🤔', title: 'UNVERSTÄNDLICHE ANFRAGE', text: 'Der Server konnte die Anfrage nicht lesen — wahrscheinlich fehlt etwas oder ein Feld ist falsch ausgefüllt.', hint: 'Prüfe deine Eingabe und sende sie erneut.', retry: true },
  401: { emoji: '🔑', title: 'ANMELDUNG NÖTIG', text: 'Diese Seite gibt es nur für angemeldete Nutzer. Deine Sitzung ist abgelaufen oder wurde nicht gestartet.', hint: 'Logge dich ein — danach geht es hier weiter.', retry: false, links: [{ href: '/login.html', label: '🔑 Einloggen' }] },
  403: { emoji: '🚫', title: 'KEIN ZUTRITT', text: 'Du darfst diese Seite nicht sehen — auch nicht mit Anmeldung. Meistens steckt eine bewusste Sperre dahinter.', hint: 'Wenn das ein Versehen ist, melde dich beim Owner.', retry: false },
  404: { emoji: '🧭', title: 'SEITE NICHT GEFUNDEN', text: 'Diese Adresse existiert nicht (mehr). Vielleicht hast du dich vertippt — oder der Link ist veraltet.', hint: 'Über die Navigation findest du alles Wichtige.', retry: false },
  405: { emoji: '🙅', title: 'METHODE NICHT ERLAUBT', text: 'Diese Adresse versteht die Art der Anfrage nicht (z.&nbsp;B. Senden statt Abrufen).', hint: 'Technisches Detail — für Besucher normalerweise ohne Bedeutung.', retry: false },
  408: { emoji: '⏳', title: 'ZEITÜBERSCHREITUNG', text: 'Die Anfrage hat zu lange gedauert und wurde vom Server abgebrochen.', hint: 'Versuche es gleich noch einmal.', retry: true },
  413: { emoji: '📦', title: 'ZU GROSS', text: 'Die hochgeladene Datei oder Anfrage ist größer als erlaubt.', hint: 'Verkleinere die Datei und versuche es erneut.', retry: false },
  418: { emoji: '🫖', title: 'ICH BIN EINE TEEKANNE', text: 'Offizieller Aprilscherz-Code: Dieser Server braut keinen Kaffee, nur Tee.', hint: 'Ganz entspannt — hier gibt es ernstere Seiten.', retry: false },
  429: { emoji: '🚦', title: 'ZU VIELE ANFRAGEN', text: 'Du hast in kurzer Zeit zu viel angefragt. Das ist eine Schutzfunktion, kein Defekt.', hint: 'Warte einen Moment — es geht dann von selbst weiter.', retry: true },
  500: { emoji: '💥', title: 'INTERNER FEHLER', text: 'Auf dem Server ist etwas Unerwartetes passiert. Der Vorgang wurde sicher abgebrochen.', hint: 'Versuche es erneut. Bleibt es, sag dem Owner die Kennung unten.', retry: true, showId: true },
  501: { emoji: '🚧', title: 'NOCH NICHT UMGESETZT', text: 'Diese Funktion ist geplant, aber noch nicht fertig gebaut.', hint: 'Schau später wieder vorbei.', retry: false },
  502: { emoji: '🌉', title: 'SCHLECHTE VERBINDUNG', text: 'Der Server hat von einem anderen Dienst (z.&nbsp;B. dem KI-Backend) eine unbrauchbare Antwort bekommen.', hint: 'Das liegt am anderen Dienst, nicht an dir. Später klappt es meist wieder.', retry: true, showId: true },
  503: { emoji: '🛠️', title: 'NICHT VERFÜGBAR', text: 'Der Server ist gerade nicht erreichbar — wegen Wartungsarbeiten oder Überlastung.', hint: 'Kurze Geduld: meist ist es wenige Minuten später wieder da.', retry: true },
  504: { emoji: '🐌', title: 'VERBINDUNG ZU LANGSAM', text: 'Ein anderer Dienst, auf den der Server wartet, hat zu lange gebraucht.', hint: 'Versuche es in einem Moment erneut.', retry: true, showId: true }
};

/* Fallback für alle anderen Codes: Name/Erklärung aus httpCodes.js */
function pageFor(code) {
  const basis = ERROR_PAGES[code] || {};
  const amtlich = findCode(String(code));
  return {
    code,
    emoji: basis.emoji || '❗',
    title: basis.title || (amtlich ? amtlich.name.toUpperCase() : 'FEHLER'),
    text: basis.text || (amtlich ? amtlich.desc : 'Es ist ein Fehler aufgetreten.'),
    hint: basis.hint || 'Versuche es später erneut.',
    retry: basis.retry === true,
    showId: basis.showId === true,
    links: basis.links || [],
    official: amtlich ? `${amtlich.code} · ${amtlich.name}` : String(code)
  };
}

/* ── Hilfen ─────────────────────────────────────────────────────────── */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DEV = /^(1|true|yes)$/i.test(String(process.env.DEV_ERRORS || '0')) ||
  String(process.env.NODE_ENV || '').toLowerCase() !== 'production';

export function errorId() {
  return 'E-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/* ── HTML ───────────────────────────────────────────────────────────── */
export function errorHtml(page, opts = {}) {
  const {
    path = '', reason = '', retryAfter = 0, id = '', details = null, year = new Date().getFullYear()
  } = opts;

  const extra = [];
  if (path) extra.push(`<div class="kv"><span>Angefordert</span><b>${esc(path)}</b></div>`);
  if (reason) extra.push(`<div class="kv"><span>Grund</span><b>${esc(reason)}</b></div>`);
  if (retryAfter > 0) extra.push(`<div class="kv"><span>Erneut versuchen in</span><b>${esc(retryAfter)} Sekunden</b></div>`);
  if (page.showId && id) extra.push(`<div class="kv"><span>Kennung</span><b>${esc(id)}</b></div>`);

  /* Robust: die Funktion darf auch mit einem Teil-Objekt aufgerufen werden. */
  const links = Array.isArray(page.links) ? page.links : [];
  const knoepfe = [
    { href: '/', label: '💜 Zur Startseite', primary: true },
    ...(page.retry ? [{ href: '', label: '🔄 Erneut versuchen', js: true }] : []),
    ...links,
    { href: '/status.html', label: '📡 Live-Status' },
    { href: '/cmd.html', label: '⌨️ Befehle' }
  ].slice(0, 5);

  /* Alle Knöpfe sind echte Links — auch „Erneuern“ (einfach dieselbe
     Adresse noch einmal). Kein Inline-Skript, deshalb greift die strenge
     CSP ohne jede Ausnahme. */
  const buttons = knoepfe.map((b) => {
    const ziel = b.js ? (path || '/') : b.href;
    return `<a class="btn ${b.primary ? '' : 'ghost'}" href="${esc(ziel)}">${esc(b.label)}</a>`;
  }).join('\n      ');

  return `<!DOCTYPE html>
<html lang="de" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(page.code)} — ${esc(page.title)} | HelloKitty Baby Maxi 💔</title>
<meta name="description" content="${esc(page.text)}">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<meta name="theme-color" content="#09090d">
<link rel="stylesheet" href="/css/style.css">
<style>
  .errwrap{min-height:72vh;display:flex;align-items:center;justify-content:center;padding:40px 20px}
  .errbox{max-width:620px;width:100%;text-align:center;padding:38px 30px}
  .errcode{font-family:ui-monospace,Consolas,monospace;font-size:64px;font-weight:800;line-height:1;
    letter-spacing:-.03em;background:linear-gradient(120deg,#fff 20%,#b6c2ff 55%,#67e8f9 100%);
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .erremoji{font-size:46px;line-height:1;margin:6px 0 2px}
  .errbox h1{font-size:22px;margin:6px 0 12px;letter-spacing:.01em}
  .errbox p{color:var(--muted);font-size:15px;line-height:1.65;margin:0 0 8px}
  .errhint{font-size:13.5px;color:var(--faint);margin-bottom:22px !important}
  .errbtns{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:18px}
  .kverr{display:flex;flex-direction:column;gap:6px;margin:20px 0 4px;font-size:12.5px;color:var(--faint);
    border-top:1px solid var(--hair);padding-top:16px}
  .kverr .kv{display:flex;justify-content:space-between;gap:12px}
  .kverr b{color:var(--muted);font-weight:600;word-break:break-all}
  pre.errdev{text-align:left;font-size:11px;white-space:pre-wrap;word-break:break-word;
    background:rgba(0,0,0,.35);border:1px solid var(--line);border-radius:10px;padding:12px;margin-top:14px;color:#ffb4c6}
</style>
</head>
<body>
<div class="aurora"></div>
<div class="grid-overlay"></div>

<header class="topnav" id="site-nav"></header>

<main class="errwrap">
  <div class="card errbox">
    <div class="errcode">${esc(page.code)}</div>
    <div class="erremoji">${esc(page.emoji)}</div>
    <h1>${esc(page.title)}</h1>
    <p>${esc(page.text)}</p>
    <p class="errhint">💡 ${esc(page.hint)}</p>
    <div class="errbtns">
      ${buttons}
    </div>
    ${extra.length ? `<div class="kverr">${extra.join('')}</div>` : ''}
    <p style="font-size:11.5px;color:var(--faint);margin-top:14px">${esc(page.official || page.code)}</p>
    ${(DEV && details) ? `<pre class="errdev">${esc(String(details).slice(0, 2000))}</pre>` : ''}
  </div>
</main>

<footer id="site-footer" data-foot-desc="Fehler passieren — wichtig ist nur, dass man hier wieder herausfindet."></footer>

<script src="/js/site-shell.js"></script>
</body>
</html>`;
}

/* ── Senden ─────────────────────────────────────────────────────────── */
export function sendErrorPage(req, res, code, opts = {}) {
  const page = pageFor(Number(code) || 500);
  const id = opts.id || (page.showId ? errorId() : '');
  const wantsHtml = !String(req?.url || '').startsWith('/api/') &&
    String(req?.headers?.accept || '').includes('text/html');

  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  };
  if (opts.retryAfter > 0) headers['Retry-After'] = String(Math.ceil(opts.retryAfter));
  if (opts.allow) headers.Allow = opts.allow;

  /* Tools/API bekommen weiterhin JSON — mit demselben Inhalt. */
  if (!wantsHtml) {
    return sendErrorJson(req, res, code, { ...opts, id, page });
  }

  const html = errorHtml(page, { ...opts, id });
  const nonce = cspNonce();
  const headers2 = Object.assign(
    headers,
    securityHeaders(req),
    { 'Content-Security-Policy': cspFor(req, nonce) }
  );
  if (res.headersSent) return;
  res.writeHead(Number(code), headers2);
  return res.end(html);
}

/* CSP kommt aus siteSecurity.js (eine Stelle kennt die Policy). Da die
   Fehlerseiten KEIN Inline-Skript enthalten, gilt sie hier voll —
   strenger geht es nicht. */

export function sendErrorJson(req, res, code, opts = {}) {
  const page = opts.page || pageFor(Number(code) || 500);
  const body = {
    error: page.title.toLowerCase(),
    status: Number(code),
    code: Number(code),
    official: page.official,
    message: page.text,
    hint: page.hint
  };
  if (opts.path) body.path = String(opts.path).slice(0, 200);
  if (opts.reason) body.reason = String(opts.reason).slice(0, 300);
  if (opts.id) body.id = opts.id;
  if (opts.retryAfter > 0) body.retryAfter = Math.ceil(opts.retryAfter);
  if (DEV && opts.details) body.details = String(opts.details).slice(0, 2000);

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };
  if (opts.retryAfter > 0) headers['Retry-After'] = String(Math.ceil(opts.retryAfter));
  if (opts.allow) headers.Allow = opts.allow;
  if (res.headersSent) return;
  res.writeHead(Number(code), Object.assign(headers, securityHeaders(req)));
  return res.end(JSON.stringify(body));
}

/* ── Kurzformen für typische Fälle ──────────────────────────────────── */
export const sendNotFound = (req, res, opts = {}) =>
  sendErrorPage(req, res, 404, { reason: 'Diese Adresse existiert nicht.', ...opts });
export const sendForbidden = (req, res, opts = {}) =>
  sendErrorPage(req, res, 403, opts);
export const sendTooMany = (req, res, retryAfter = 60, opts = {}) =>
  sendErrorPage(req, res, 429, { retryAfter, ...opts });
export const sendMaintenance = (req, res, opts = {}) =>
  sendErrorPage(req, res, 503, { retryAfter: opts.retryAfter || 300, ...opts });
export const sendInternal = (req, res, opts = {}) =>
  sendErrorPage(req, res, 500, { id: opts.id || errorId(), ...opts });
/* 502 = anderer Dienst antwortet unbrauchbar · 504 = anderer Dienst zu langsam */
export const sendUpstream = (req, res, opts = {}) =>
  sendErrorPage(req, res, 502, opts);
export const sendUpstreamTimeout = (req, res, opts = {}) =>
  sendErrorPage(req, res, 504, opts);

/* Für API-Antworten: richtigen Code, aber gewohntes JSON behalten. */
export function upstreamStatus(err, kind = '') {
  const k = String(kind || err?.kind || '').toLowerCase();
  const name = String(err?.name || '');
  if (k === 'timeout' || name === 'AbortError' || /timeout|abort/i.test(String(err?.message || ''))) return 504;
  return 502;
}

export default {
  ERROR_PAGES, errorHtml, errorId, sendErrorPage, sendErrorJson,
  sendNotFound, sendForbidden, sendTooMany, sendMaintenance,
  sendInternal, sendUpstream, sendUpstreamTimeout, upstreamStatus
};
