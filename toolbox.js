/* ═══════════════════════════════════════════════════════════════════════
   🧰  TOOLBOX  —  Notizen · Erinnerungen · Umfragen
   ───────────────────────────────────────────────────────────────────────
   Drei nützliche Dinge, die vorher gefehlt haben:

     📝 Notizen      — pro Nutzer, anlegen · auflisten · löschen
     ⏰ Erinnerungen — „in 10 Minuten", „morgen 9 Uhr", „12.03. 18:00"
     📊 Umfragen     — pro Chat, mit Auswertung

   Alles liegt in einer Datei (Database/toolbox.json). Zum Testen kann man
   das Verzeichnis mit TOOLBOX_DB_DIR woanders hinlegen — Database/ bleibt
   dann unberührt.

   Regeln:
   · Nur reine Datenfunktionen hier drin — kein WhatsApp, kein Netz.
   · Aussehen kommt aus botLook.js, nicht von hier.
   · Nichts wird gelöscht, was nicht ausdrücklich gelöscht werden soll.
   ═══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = process.env.TOOLBOX_DB_DIR || path.join(process.cwd(), 'Database');
const DB_FILE = path.join(DB_DIR, 'toolbox.json');

const LEER = { notizen: {}, erinner: [], umfragen: {} };

/* ── Stand lesen & schreiben ────────────────────────────────────────── */
export function loadBox() {
  try {
    const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return {
      notizen: raw.notizen && typeof raw.notizen === 'object' ? raw.notizen : {},
      erinner: Array.isArray(raw.erinner) ? raw.erinner : [],
      umfragen: raw.umfragen && typeof raw.umfragen === 'object' ? raw.umfragen : {}
    };
  } catch (e) {
    return { ...LEER, notizen: {}, erinner: [], umfragen: {} };
  }
}

function saveBox(box) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(box, null, 2));
    fs.renameSync(tmp, DB_FILE);
    return true;
  } catch (e) {
    return false;
  }
}

/* Nächste freie Nummer in einer Liste von {i: n} */
function naechsteNummer(liste) {
  return liste.reduce((max, x) => Math.max(max, Number(x?.i) || 0), 0) + 1;
}

/* ── Zeitangaben verstehen (Deutsch) ────────────────────────────────── */
const MINUTE = 60000, STUNDE = 60 * MINUTE, TAG = 24 * STUNDE;

export function parseWann(text, jetzt = Date.now()) {
  if (!text) return null;
  const s = String(text).toLowerCase().trim();
  const basis = new Date(jetzt);

  /* 1) Relative Angaben: „in 10 Minuten", „in 2 Stunden", „in 3 Tagen" …
        Kurzformen „10m", „2h", „3d", „2w" gehen auch. */
  const rel = [
    [/^(?:in\s*)?(\d+)\s*(?:minuten?|mins?|m)$/, MINUTE],
    [/^(?:in\s*)?(\d+)\s*(?:stunden?|std|h)$/, STUNDE],
    [/^(?:in\s*)?(\d+)\s*(?:tag(?:e|en)?|days?|d)$/, TAG],
    [/^(?:in\s*)?(\d+)\s*(?:wochen?|w)$/, 7 * TAG]
  ];
  for (const [muster, faktor] of rel) {
    const m = muster.exec(s.replace(/\s+/g, ' ').trim());
    if (m) return new Date(jetzt + Number(m[1]) * faktor);
  }

  /* 2) Feste Tageswörter — „übermorgen" VOR „morgen" prüfen! */
  if (/(übermorgen|uebermorgen)/.test(s)) {
    const d = new Date(basis);
    d.setDate(d.getDate() + 2);
    return uhrzeitSetzen(d, s, 9, 0);
  }
  if (/\bmorgen\b/.test(s)) {
    const d = new Date(basis);
    d.setDate(d.getDate() + 1);
    return uhrzeitSetzen(d, s, 9, 0);
  }
  if (/\bheute\b/.test(s)) {
    const d = new Date(basis);
    return uhrzeitSetzen(d, s, basis.getHours(), basis.getMinutes());
  }

  /* 3) Datum: „12.03." oder „12.03.2027", Uhrzeit darf folgen */
  const datum = /(\d{1,2})\.\s*(\d{1,2})\.(?:\s*(\d{4}))?/.exec(s);
  if (datum) {
    const d = new Date(basis);
    const jahr = datum[3] ? Number(datum[3]) : d.getFullYear();
    d.setFullYear(jahr, Number(datum[2]) - 1, Number(datum[1]));
    const rest = s.slice(datum.index + datum[0].length);
    uhrzeitSetzen(d, rest, 9, 0);
    /* Ohne Jahr und schon vorbei → nächstes Jahr nehmen */
    if (!datum[3] && d.getTime() <= jetzt) d.setFullYear(jahr + 1);
    return d;
  }

  /* 4) „um 18:30" — heute, wenn die Zeit noch kommt, sonst morgen */
  if (/^um\s*\d/.test(s)) {
    const d = new Date(basis);
    uhrzeitSetzen(d, s, basis.getHours(), basis.getMinutes());
    if (d.getTime() <= jetzt) d.setDate(d.getDate() + 1);
    return d;
  }
  return null;
}

/* Setzt auf einen Zeitpunkt eine Uhrzeit, falls im Text eine steht.
   Ohne Angabe bleibt die übergebene Standardzeit. */
function uhrzeitSetzen(datum, text, stdStandard, minStandard) {
  const m = /(\d{1,2})\s*[:.]\s*(\d{2})/.exec(String(text || ''));
  if (m) {
    const h = Number(m[1]), mi = Number(m[2]);
    if (h >= 0 && h <= 23 && mi >= 0 && mi <= 59) { datum.setHours(h, mi, 0, 0); return datum; }
  }
  const nur = /(?:um\s*)?(\d{1,2})\s*uhr/.exec(String(text || ''));
  if (nur) {
    const h = Number(nur[1]);
    if (h >= 0 && h <= 23) { datum.setHours(h, 0, 0, 0); return datum; }
  }
  datum.setHours(stdStandard, minStandard, 0, 0);
  return datum;
}

/* Menschenlesbare Restzeit / vergangene Zeit */
export function formatiereWann(ms, jetzt = Date.now()) {
  const diff = ms - jetzt;
  const abs = Math.abs(diff);
  const wert = abs >= TAG ? Math.round(abs / TAG) + ' Tagen'
    : abs >= STUNDE ? Math.round(abs / STUNDE) + ' Stunden'
      : Math.max(1, Math.round(abs / MINUTE)) + ' Minuten';
  return diff >= 0 ? `in ${wert}` : `vor ${wert}`;
}

/* ── 📝 Notizen ─────────────────────────────────────────────────────── */
export function notizAdd(user, text) {
  const sauber = String(text || '').trim();
  if (!sauber) return null;
  const box = loadBox();
  const liste = box.notizen[user] || (box.notizen[user] = []);
  const eintrag = { i: naechsteNummer(liste), t: sauber.slice(0, 500), c: Date.now() };
  liste.push(eintrag);
  return saveBox(box) ? eintrag : null;
}

export function notizList(user) {
  const box = loadBox();
  return (box.notizen[user] || []).slice().sort((a, b) => (a.c || 0) - (b.c || 0));
}

export function notizDel(user, nr) {
  const box = loadBox();
  const liste = box.notizen[user] || [];
  const idx = liste.findIndex((n) => Number(n.i) === Number(nr));
  if (idx < 0) return false;
  const [weg] = liste.splice(idx, 1);
  if (!liste.length) delete box.notizen[user];
  saveBox(box);
  return weg || true;
}

export function notizClear(user) {
  const box = loadBox();
  const anzahl = (box.notizen[user] || []).length;
  delete box.notizen[user];
  saveBox(box);
  return anzahl;
}

/* ── ⏰ Erinnerungen ────────────────────────────────────────────────── */
export function erinnerAdd(user, chat, text, wannMs) {
  if (!wannMs || Number.isNaN(wannMs)) return null;
  const box = loadBox();
  const eintrag = {
    i: naechsteNummer(box.erinner),
    u: String(user), c: String(chat),
    t: String(text || '').trim().slice(0, 300) || 'Erinnerung',
    due: Number(wannMs), done: false
  };
  box.erinner.push(eintrag);
  return saveBox(box) ? eintrag : null;
}

export function erinnerList(user) {
  const box = loadBox();
  return box.erinner
    .filter((e) => e.u === String(user) && !e.done)
    .sort((a, b) => (a.due || 0) - (b.due || 0));
}

export function erinnerDel(user, nr) {
  const box = loadBox();
  const idx = box.erinner.findIndex((e) => e.u === String(user) && Number(e.i) === Number(nr) && !e.done);
  if (idx < 0) return false;
  box.erinner.splice(idx, 1);
  saveBox(box);
  return true;
}

/* Fällige Erinnerungen holen UND als erledigt markieren (jede nur einmal) */
export function erinnerFaellig(jetzt = Date.now()) {
  const box = loadBox();
  const offen = box.erinner.filter((e) => !e.done && Number(e.due) <= jetzt);
  if (!offen.length) return [];
  for (const e of offen) e.done = true;
  box.erinner = box.erinner.filter((e) => !e.done);
  saveBox(box);
  return offen;
}

/* ── 📊 Umfragen ───────────────────────────────────────────────────── */
export function umfrageNeu(chat, frage, optionen) {
  const q = String(frage || '').trim();
  const o = (optionen || []).map((x) => String(x).trim()).filter(Boolean).slice(0, 10);
  if (!q || o.length < 2) return null;
  const box = loadBox();
  const liste = box.umfragen[chat] || (box.umfragen[chat] = []);
  const eintrag = { i: naechsteNummer(liste), q, o, v: {}, open: true, c: Date.now() };
  liste.push(eintrag);
  return saveBox(box) ? eintrag : null;
}

export function umfrageHolen(chat, nr) {
  const box = loadBox();
  const liste = box.umfragen[chat] || [];
  return nr ? liste.find((u) => Number(u.i) === Number(nr)) : liste[liste.length - 1] || null;
}

export function umfrageListe(chat) {
  const box = loadBox();
  return (box.umfragen[chat] || []).slice().sort((a, b) => (a.c || 0) - (b.c || 0));
}

export function umfrageStimme(chat, nr, user, wahl) {
  const box = loadBox();
  const liste = box.umfragen[chat] || [];
  const u = liste.find((x) => Number(x.i) === Number(nr)) || liste[liste.length - 1];
  if (!u || u.open === false) return null;
  const index = Number(wahl) - 1;
  if (index < 0 || index >= u.o.length) return null;
  u.v = u.v || {};
  u.v[String(user)] = index;
  saveBox(box);
  return u;
}

export function umfrageErgebnis(u) {
  if (!u) return null;
  const stimmen = Object.values(u.v || {});
  const gesamt = stimmen.length;
  return u.o.map((text, idx) => {
    const n = stimmen.filter((s) => s === idx).length;
    return { text, n, anteil: gesamt ? Math.round((n / gesamt) * 100) : 0 };
  });
}

export function umfrageEnde(chat, nr) {
  const box = loadBox();
  const liste = box.umfragen[chat] || [];
  const u = liste.find((x) => Number(x.i) === Number(nr)) || liste[liste.length - 1];
  if (!u) return null;
  u.open = false;
  saveBox(box);
  return u;
}

export default {
  loadBox, parseWann, formatiereWann,
  notizAdd, notizList, notizDel, notizClear,
  erinnerAdd, erinnerList, erinnerDel, erinnerFaellig,
  umfrageNeu, umfrageHolen, umfrageListe, umfrageStimme, umfrageErgebnis, umfrageEnde
};
