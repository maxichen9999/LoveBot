/* ═══════════════════════════════════════════════════════════════════════
   🎀  BOT-LOOK  —  das gemeinsame Aussehen aller Bot-Antworten
   ───────────────────────────────────────────────────────────────────────
   Vorher hatte jede Antwort ihr eigenes Aussehen: mal „━━━", mal „▰▰▰",
   mal GROSSBUCHSTABEN, mal Klein, mal 💔, mal 💜. Ab jetzt kommt jede
   Übersicht aus diesen Bausteinen:

     karte()     eine ganze Antwort: Kopf, Abschnitte, Fuß
     kopf()      Überschrift mit Unterzeile
     abschnitt() ein Themenblock mit sortierten Feldern
     liste()     sortierte Aufzählung
     balken()    Fortschrittsbalken
     fuss()      Hinweise am Ende

   Stil: ruhig, rosa, ordentlich — Überschriften in normaler Schreibweise
   (kein Dauerschreien), gleiche Symbole überall, Listen alphabetisch.

   WICHTIG: Hier entsteht nur TEXT. Keine Daten werden angefasst, keine
   Funktion wird entschieden — das Aussehen ist von der Logik getrennt.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Zeichenvorrat: überall dieselben ───────────────────────────────── */
import { getMood } from './botStyle.js';

/* ── 🌸 Stimmung ───────────────────────────────────────────────────────
   'happy'   → freundlich, mit kleinen Aufmunterungen (Vorgabe seit
               dem 02.10.2026 — der Bot soll fröhlich sein)
   'neutral' → sachlich, ohne Gefühle
   'aus'     → keine Veränderung des Textes
   ─────────────────────────────────────────────────────────────────── */
let STIMMUNG = null;
export function stimmung(neu) {
  if (neu) { STIMMUNG = neu; return STIMMUNG; }
  if (!STIMMUNG) {
    try { STIMMUNG = getMood() || 'neutral'; } catch (e) { STIMMUNG = 'neutral'; }
  }
  return STIMMUNG;
}
export function istFroehlich() { return stimmung() === 'happy'; }

/* Kleine Aufmunterungen — nie zweimal hintereinander dieselbe */
const GRUESSE = [
  '🌸 Schön, dass du da bist.',
  '☀️ Viel Spaß damit!',
  '🎀 Du machst das gut.',
  '⭐ Weiter so!',
  '🌷 Heute wird ein guter Tag.',
  '🍀 Viel Erfolg dabei!',
  '💗 Ich helfe gern.'
];
/* Der Reihe nach — so kommt jede Zeile erst wieder, wenn alle dran waren. */
let grussZaehler = Math.floor(Math.random() * GRUESSE.length);
export function gruss() {
  if (!istFroehlich()) return '';
  const zeile = GRUESSE[grussZaehler % GRUESSE.length];
  grussZaehler++;
  return zeile;
}

export const ZEICHEN = {
  schleife: '🎀',
  bluete: '🌸',
  herz: '💗',
  katze: '🐱',
  stern: '✨',
  punkt: '·',
  /* 🎀 Hello-Kitty-Look: Trenner in Pink statt graue Linie */
  trenner: '🎀･ﾟ✧ ･ﾟ:🎀: ･ﾟ✧･ﾟ🎀',
  pfeil: '→',
  hinweis: '💡'
};

/* 🎀 Herz-Trenner für Abschnitte: „💗 ─ 🎀 ─ 💗" */
export function herzTrenner(zeichen = '💗') {
  return `${zeichen} ─ 🎀 ─ ${zeichen}`;
}

/* Fortschrittsbalken: gefüllt / leer, in zwei Stufen */
export function balken(prozent, breite = 12) {
  const p = Math.max(0, Math.min(100, Math.round(Number(prozent) || 0)));
  const voll = Math.round((p / 100) * breite);
  return '▰'.repeat(voll) + '▱'.repeat(Math.max(0, breite - voll));
}

/* Kopf einer Antwort: Titel, darunter eine ruhige Unterzeile */
export function kopf(titel, { emoji = ZEICHEN.schleife, untertitel = '' } = {}) {
  const erste = `${emoji} *${titel}*`;
  return untertitel ? `${erste}\n_${untertitel}_` : erste;
}

/* 🎀 Karten-Kopf im Hello-Kitty-Look: Schleifen-Zeile drüber und drunter */
export function kopfHK(titel, { emoji = ZEICHEN.schleife, untertitel = '' } = {}) {
  return [
    herzTrenner('🎀'),
    kopf(titel, { emoji, untertitel }),
    herzTrenner('💗')
  ].join('\n');
}

/* Ein Themenblock. felder: entweder ['freitext'] oder [[label, wert]] */
export function abschnitt(emoji, titel, felder = []) {
  const L = [`${emoji} *${titel}*`];
  for (const f of felder) {
    if (Array.isArray(f)) {
      const [label, wert] = f;
      if (wert === '' || wert === null || wert === undefined) continue;
      L.push(`${label}: *${wert}*`);
    } else if (f !== '' && f !== null && f !== undefined) {
      L.push(String(f));
    }
  }
  return L.join('\n');
}

/* Sortierte Aufzählung — Standardsortierung ist alphabetisch (deutsch) */
export function liste(eintraege, { zeichen = ZEICHEN.bluete, sortiert = true } = {}) {
  const sauber = (eintraege || []).filter((e) => e !== '' && e !== null && e !== undefined).map(String);
  const fertig = sortiert ? [...sauber].sort((a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' })) : sauber;
  return fertig.map((e) => `${zeichen} ${e}`).join('\n');
}

/* Hinweise am Ende — einer pro Zeile */
export function fuss(hinweise = []) {
  const sauber = (Array.isArray(hinweise) ? hinweise : [hinweise]).filter(Boolean).map(String);
  if (!sauber.length) return '';
  return sauber.map((h) => `${ZEICHEN.hinweis} ${h}`).join('\n');
}

/* Nummerierte Auswahl (1️⃣ 2️⃣ 3️⃣ …) — für Menüs */
const ZIFFERN = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
export function nummeriert(eintraege, { start = 0 } = {}) {
  return (eintraege || []).map((e, i) => `${ZIFFERN[start + i] || `${start + i + 1}.`} ${e}`).join('\n');
}

/* ── Das Herzstück: eine ganze Antwort als Karte ────────────────────── */
export function karte({
  titel,
  emoji = ZEICHEN.schleife,
  untertitel = '',
  inhalte = [],      /* Blöcke (schon fertige Zeichenketten) in Reihenfolge */
  hinweise = [],
  fusszeile = '',
  froh = false       /* true → eine kleine Aufmunterung ans Ende (nur bei 'happy') */
} = {}) {
  if (froh && istFroehlich()) {
    const zeile = gruss();
    const liste = (Array.isArray(hinweise) ? hinweise : [hinweise]).filter(Boolean);
    if (zeile && !liste.includes(zeile)) hinweise = liste.concat([zeile]);
  }
  const L = [kopf(titel, { emoji, untertitel })];
  if (inhalte.length) L.push('', inhalte.filter(Boolean).join('\n\n'));
  const f = fuss(hinweise);
  if (f) L.push('', ZEICHEN.trenner, f);
  if (fusszeile) L.push(`_${fusszeile}_`);
  return L.join('\n');
}

/* Einheitliche Statuskarte für Stil-/Systembefehle. So sehen technische
   Antworten genauso ruhig und hochwertig aus wie Profil- und Spielkarten. */
export function statusKarte(st) {
  const mood = st?.moodText ? `${st.mood} — ${st.moodText}` : (st?.mood || 'neutral');
  return karte({
    titel: 'Bot-Stil',
    emoji: ZEICHEN.schleife,
    untertitel: 'Darstellung für alle ausgehenden Antworten',
    inhalte: [abschnitt('🎭', 'Aktive Einstellungen', [
      ['Stimmung', mood],
      ['Auto-Reaktionen', st?.autoReactions ? 'AN' : 'AUS'],
      ['Pink & Mädchen-Stil', st?.helloKitty ? 'AN' : 'AUS'],
      ['Schleife voran', st?.deko ? 'AN' : 'AUS']
    ])],
    hinweise: [
      '$stil neutral | happy | aus',
      '$stil kitty an | aus',
      '$stil deko an | aus',
      '$autoreaktion an | aus'
    ],
    froh: true
  });
}

/* Kurze Bestätigung: „🎀 Erledigt." */
export function ok(text, { emoji = ZEICHEN.schleife } = {}) {
  const auftakt = istFroehlich()
    ? ['🌟 Geschafft', '🎉 Erledigt', '🌸 Gemacht', '✅ Klar'][Math.floor(Math.random() * 4)] + ' — '
    : '';
  return `${emoji} *${auftakt}${text}*`;
}

/* Fehlermeldung im gleichen Stil */
export function fehler(text, hinweise = []) {
  const liste = (Array.isArray(hinweise) ? hinweise : [hinweise]).filter(Boolean);
  const sanft = istFroehlich();
  return karte({
    titel: text,
    emoji: sanft ? '🌸' : ZEICHEN.katze,
    hinweise: liste.length ? liste : (sanft ? ['🌱 Einfach nochmal versuchen — kein Ding.'] : []),
    untertitel: ''
  });
}

/* Zwei Spalten ordentlich ausrichten: „Label····Wert" */
export function zeile(label, wert, breite = 18) {
  const l = String(label);
  const luecke = Math.max(1, breite - l.length);
  return `${l}${' '.repeat(luecke)}${wert}`;
}

/* Deutsche Zahl mit Tausenderpunkt */
export function de(n) {
  const z = Number(n) || 0;
  return z.toLocaleString('de-DE');
}

export default {
  ZEICHEN, balken, kopf, kopfHK, herzTrenner, abschnitt, liste, fuss, nummeriert, karte, ok, fehler, zeile, de
};
