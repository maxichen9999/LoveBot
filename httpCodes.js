/* ═══════════════════════════════════════════════════════════════════════
   🌐  HTTP-STATUSCODES  —  eine Datenquelle für Website und Bot
   ─────────────────────────────────────────────────────────────────────
   · public/js/http-codes-data.js  wird daraus erzeugt (npm run build),
     damit die Website keine zweite Liste pflegen muss.
   · Der Bot nutzt dieselbe Datei für  $http <code>.

   Aufgerufen von:  Love.js (case 'http')  ·  scripts/build-assets.mjs
   ═══════════════════════════════════════════════════════════════════════ */

export const HTTP_GROUPS = {
  1: { emoji: 'ℹ️', title: 'Information', tone: 'info', desc: 'Anfrage erhalten, der Prozess läuft weiter.' },
  2: { emoji: '✅', title: 'Erfolgreich', tone: 'ok', desc: 'Anfrage war erfolgreich und wurde verarbeitet.' },
  3: { emoji: '↪️', title: 'Umleitung', tone: 'warn', desc: 'Der Browser muss noch etwas tun, meist weiterleiten.' },
  4: { emoji: '⚠️', title: 'Client-Fehler', tone: 'err', desc: 'Anfrage fehlerhaft, Rechte fehlen oder Seite existiert nicht.' },
  5: { emoji: '💥', title: 'Server-Fehler', tone: 'bad', desc: 'Die Anfrage war okay, der Server hat das Problem.' }
};

/* [Code, englischer Name, deutsche Erklärung] */
const RAW = [
  [100, 'Continue', 'Alles okay, mach weiter.'],
  [101, 'Switching Protocols', 'Der Server wechselt das Protokoll (z. B. auf WebSockets).'],
  [102, 'Processing', 'Der Server arbeitet noch daran (WebDAV).'],
  [103, 'Early Hints', 'Vorab-Infos zu den Ressourcen, bevor die Hauptantwort kommt.'],

  [200, 'OK', 'Standard für eine erfolgreiche Anfrage. Seite lädt.'],
  [201, 'Created', 'Die Anfrage war erfolgreich und eine neue Ressource wurde erstellt.'],
  [202, 'Accepted', 'Anfrage angenommen, aber noch nicht fertig verarbeitet.'],
  [203, 'Non-Authoritative Information', 'Infos stammen von einer Kopie, nicht direkt vom Server.'],
  [204, 'No Content', 'Anfrage erfolgreich, aber es gibt keinen Inhalt zurückzugeben.'],
  [205, 'Reset Content', 'Der Browser soll die Ansicht (z. B. ein Formular) zurücksetzen.'],
  [206, 'Partial Content', 'Nur ein Teil der Daten wurde übertragen (gut für Video-Streaming).'],
  [207, 'Multi-Status', 'Mehrere Statusmeldungen auf einmal (WebDAV).'],
  [208, 'Already Reported', 'Bereits an anderer Stelle gemeldet.'],
  [226, 'IM Used', 'Der Server hat die Ressource verändert (Delta-Codierung).'],

  [300, 'Multiple Choices', 'Es gibt mehrere Optionen für diese Seite.'],
  [301, 'Moved Permanently', 'Die Seite ist dauerhaft umgezogen. Die neue Adresse wird geladen.'],
  [302, 'Found', 'Die Seite ist vorübergehend unter einer anderen Adresse erreichbar.'],
  [303, 'See Other', 'Die Daten liegen woanders bereit.'],
  [304, 'Not Modified', 'Die Seite hat sich nicht geändert. Sie wird aus dem Browser-Cache geladen.'],
  [305, 'Use Proxy', '(Veraltet) Zugriff nur über einen bestimmten Proxy erlaubt.'],
  [306, 'Switch Proxy', 'Wird nicht mehr genutzt.'],
  [307, 'Temporary Redirect', 'Vorübergehende Weiterleitung (ähnlich wie 302).'],
  [308, 'Permanent Redirect', 'Dauerhafte Weiterleitung (ähnlich wie 301).'],

  [400, 'Bad Request', 'Der Server versteht die Anfrage nicht (Syntaxfehler).'],
  [401, 'Unauthorized', 'Du musst dich zuerst einloggen/anmelden.'],
  [402, 'Payment Required', 'Reserviert für digitale Bezahlsysteme (wird selten genutzt).'],
  [403, 'Forbidden', 'Du hast absolut keine Berechtigung, diese Seite zu sehen.'],
  [404, 'Not Found', 'Die Seite existiert nicht oder wurde gelöscht.'],
  [405, 'Method Not Allowed', 'Die genutzte Anfrage-Methode (z. B. POST statt GET) ist verboten.'],
  [406, 'Not Acceptable', 'Der Server kann das gewünschte Format (z. B. Sprache/Codierung) nicht liefern.'],
  [407, 'Proxy Authentication Required', 'Du musst dich erst beim Proxy-Server anmelden.'],
  [408, 'Request Timeout', 'Die Anfrage hat zu lange gedauert. Abbruch durch den Server.'],
  [409, 'Conflict', 'Es gibt einen Konflikt mit dem aktuellen Zustand der Daten.'],
  [410, 'Gone', 'Die Seite ist dauerhaft gelöscht und kommt nie wieder.'],
  [411, 'Length Required', 'Der Server verlangt eine Angabe zur Inhaltslänge.'],
  [412, 'Precondition Failed', 'Eine vom Browser gesetzte Bedingung wurde nicht erfüllt.'],
  [413, 'Payload Too Large', 'Die hochgeladene Datei oder Anfrage ist zu groß.'],
  [414, 'URI Too Long', 'Die eingegebene Webadresse (URL) ist zu lang für den Server.'],
  [415, 'Unsupported Media Type', 'Das Dateiformat der Anfrage wird nicht unterstützt.'],
  [416, 'Range Not Satisfiable', 'Der angeforderte Teil einer Datei existiert nicht.'],
  [417, 'Expectation Failed', 'Das im Header geforderte Verhalten wird nicht unterstützt.'],
  [418, "I'm a teapot", 'Ein berühmter Aprilscherz-Code ("Ich bin eine Teekanne").'],
  [421, 'Misdirected Request', 'Die Anfrage wurde an den falschen Server geleitet.'],
  [422, 'Unprocessable Entity', 'Die Anfrage war syntaktisch korrekt, aber inhaltlich unbrauchbar.'],
  [423, 'Locked', 'Die Ressource ist gesperrt.'],
  [424, 'Failed Dependency', 'Ein vorheriger Schritt ist fehlgeschlagen.'],
  [425, 'Too Early', 'Der Server verweigert die Bearbeitung aus Sicherheitsgründen vorab.'],
  [426, 'Upgrade Required', 'Du musst auf ein neueres Protokoll wechseln (z. B. TLS 1.3).'],
  [428, 'Precondition Required', 'Der Server verlangt Bedingungen, um Datenüberschreiben zu verhindern.'],
  [429, 'Too Many Requests', 'Du hast zu viele Anfragen in kurzer Zeit gesendet (Spam-Schutz).'],
  [431, 'Request Header Fields Too Large', 'Der Kopfbereich der Anfrage ist zu groß.'],
  [451, 'Unavailable For Legal Reasons', 'Die Seite ist aus rechtlichen Gründen gesperrt (z. B. Zensur/Urheberrecht).'],

  [500, 'Internal Server Error', 'Der Standard-Serverfehler. Irgendetwas ist im Code kaputtgegangen.'],
  [501, 'Not Implemented', 'Der Server versteht die Anfrage-Funktion noch nicht.'],
  [502, 'Bad Gateway', 'Der Server hat als Brücke (Gateway) eine ungültige Antwort von einem anderen Server erhalten.'],
  [503, 'Service Unavailable', 'Der Server ist überlastet oder wegen Wartungsarbeiten offline.'],
  [504, 'Gateway Timeout', 'Der Server hat zu lange auf die Antwort eines anderen Servers gewartet.'],
  [505, 'HTTP Version Not Supported', 'Die vom Browser genutzte HTTP-Version wird nicht unterstützt.'],
  [506, 'Variant Also Negotiates', 'Ein interner Konfigurationsfehler bei der Inhaltssuche.'],
  [507, 'Insufficient Storage', 'Der Server hat keinen Speicherplatz mehr frei.'],
  [508, 'Loop Detected', 'Der Server hat sich bei einer Weiterleitung im Kreis gedreht.'],
  [510, 'Not Extended', 'Dem Server fehlen weitere Erweiterungen, um die Anfrage zu verstehen.'],
  [511, 'Network Authentication Required', 'Du musst dich erst im Netzwerk (z. B. Hotel-WLAN) anmelden.']
];

export const HTTP_CODES = RAW.map(([code, name, desc]) => ({
  code, name, desc, group: Math.floor(code / 100)
}));

/* ── Suche ─────────────────────────────────────────────────────────── */
export function findCode(query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return null;
  if (/^\d{3}$/.test(q)) {
    const code = Number.parseInt(q, 10);
    return HTTP_CODES.find((e) => e.code === code) || null;
  }
  const exact = HTTP_CODES.find((e) => e.name.toLowerCase() === q);
  if (exact) return exact;
  return HTTP_CODES.find((e) =>
    e.name.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q)) || null;
}

export function searchCodes(query = '', group = '') {
  const q = String(query).trim().toLowerCase();
  return HTTP_CODES.filter((e) => {
    if (group && String(e.group) !== String(group)) return false;
    if (!q) return true;
    return String(e.code).startsWith(q) ||
      e.name.toLowerCase().includes(q) ||
      e.desc.toLowerCase().includes(q);
  });
}

/* ── Bot-Ausgabe ($http 404) ───────────────────────────────────────── */
const TONE_ICON = { info: 'ℹ️', ok: '🟢', warn: '🟠', err: '🔴', bad: '💥' };

export function formatCodeForChat(entry, pref = '$') {
  if (!entry) return null;
  const g = HTTP_GROUPS[entry.group] || {};
  return [
    `${g.emoji || TONE_ICON[g.tone] || '•'} *${entry.code} · ${entry.name}*`,
    `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,
    `${entry.desc}`,
    ``,
    `📂 _${entry.group}xx – ${g.title}_`,
    `💡 _${pref}http liste = alle Codes · Alle auf maxichen.de/http-codes.html_`
  ].join('\n');
}

/* ── Bot-Handler ───────────────────────────────────────────────────── */
export async function handleHttpCodeCommand({ sock, from, msg, args = [], pref = '$' }) {
  const arg = String(args[0] || '').trim().toLowerCase();

  if (!arg || arg === 'liste' || arg === 'list' || arg === 'hilfe') {
    const lines = Object.entries(HTTP_GROUPS).map(([k, g]) =>
      `│ ${g.emoji} *${k}xx* — ${g.title}  _(${HTTP_CODES.filter((e) => e.group === Number(k)).length} Codes)_`);
    const text = [
      '🌐 *HTTP-STATUSCODES*',
      '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄',
      ...lines,
      '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄',
      `🔍 *_${pref}http 404_* = einzelnen Code erklären`,
      `💡 _Alle Codes: maxichen.de/http-codes.html_`
    ].join('\n');
    return sock.sendMessage(from, { text }, { quoted: msg });
  }

  const entry = findCode(arg);
  if (!entry) {
    return sock.sendMessage(from, {
      text: `> ⚠️ *NICHT GEFUNDEN*\n\n` +
        `Zu „${String(arg).slice(0, 24)}“ gibt es keinen offiziellen HTTP-Code.\n\n` +
        `💡 _${pref}http liste = alle Kategorien · ${pref}http 404 = Beispiel_`
    }, { quoted: msg });
  }
  return sock.sendMessage(from, { text: formatCodeForChat(entry, pref) }, { quoted: msg });
}

export default { HTTP_CODES, HTTP_GROUPS, findCode, searchCodes, formatCodeForChat, handleHttpCodeCommand };
