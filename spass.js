/* ═══════════════════════════════════════════════════════════════════════
   🎮  S P A S S  —  neue Befehle & Mini-Spiele  (spass.js)
   ───────────────────────────────────────────────────────────────────────
   Zehn neue Dinge für den Bot — alles offline, keine API, kein Key:

     Werkzeuge:
       $ascii <text>            · Text als großes ASCII-Banner
       $base64 <text>           · Base64 kodieren / dekodieren
       $rot13 <text>            · Buchstaben verschieben (und zurück)
       $umkehren <text>         · Text rückwärts
       $wortzaehler <text>      · Wörter, Zeichen, Sätze zählen
       $promille <ml> <%> <kg>  · Promille-Schätzung (Widmark, ehrlich)

     Spaß & Spiele (gegen Love 💜 oder den Zufall):
       $kampf @user             · Kampf-Simulation zwischen zwei Namen
       $teams <a, b, c …>       · Teams auslosen
       $zahlenraten <1-100>     · Zahl erraten, Streak & Rekord
       $ttt <1-9>               · Tic-Tac-Toe gegen Love 💜

   Regeln (wie toolbox.js):
   · Nur reine Datenfunktionen hier drin — kein WhatsApp, kein Netz.
   · Aussehen kommt aus botLook.js, nicht von hier.
   · Nichts wird gelöscht, was nicht ausdrücklich gelöscht werden soll.
   · Spielstände liegen in Database/spass.json — zum Testen kann das
     Verzeichnis mit SPASS_DB_DIR woanders hin gelegt werden.
   ═══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = process.env.SPASS_DB_DIR || path.join(process.cwd(), 'Database');
const DB_FILE = path.join(DB_DIR, 'spass.json');

const LEER = { zahlen: {}, ttt: {} };

/* ── Stand lesen & schreiben ────────────────────────────────────────── */
function lade() {
  try {
    const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return {
      zahlen: raw.zahlen && typeof raw.zahlen === 'object' ? raw.zahlen : {},
      ttt: raw.ttt && typeof raw.ttt === 'object' ? raw.ttt : {}
    };
  } catch (e) {
    return { zahlen: {}, ttt: {} };
  }
}

function speichere(st) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(st, null, 2));
    fs.renameSync(tmp, DB_FILE);
    return true;
  } catch (e) {
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   1 · ASCII-BANNER — 3×5-Blockbuchstaben (A–Z, 0–9, Satzzeichen, Herz)
   ═══════════════════════════════════════════════════════════════════════ */

/* Jeder Buchstabe: 5 Zeilen × 3 Zeichen (1 = Block, 0 = Leer). */
const GLYPHEN = {
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '010'],
  K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['110', '101', '101', '101', '101'],
  O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'],
  Q: ['010', '101', '101', '111', '011'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
  V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '111', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '001', '001', '001'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
  '!': ['010', '010', '010', '000', '010'],
  '?': ['111', '001', '011', '000', '010'],
  '.': ['000', '000', '000', '000', '010'],
  ',': ['000', '000', '000', '010', '100'],
  '-': ['000', '000', '111', '000', '000'],
  '+': ['000', '010', '111', '010', '000'],
  '*': ['101', '010', '111', '010', '101'],
  ':': ['000', '010', '000', '010', '000'],
  '/': ['001', '001', '010', '100', '100'],
  '#': ['101', '111', '101', '111', '101'],
  '@': ['111', '101', '111', '100', '111'],
  '&': ['110', '101', '010', '101', '011'],
  '%': ['101', '001', '010', '100', '101'],
  '(': ['010', '100', '100', '100', '010'],
  ')': ['010', '001', '001', '001', '010'],
  '=': ['000', '111', '000', '111', '000'],
  '<': ['001', '010', '100', '010', '001'],
  '>': ['100', '010', '001', '010', '100'],
  '~': ['000', '000', '010', '101', '010'],
  ' ': ['000', '000', '000', '000', '000'],
  '♥': ['000', '101', '111', '111', '101']
};

const MAX_BANNER_ZEICHEN = 14;

/**
 * Text als ASCII-Banner (5 Zeilen). Unbekannte Zeichen werden zu '?'.
 * Gibt { zeilen, benutzt, übersprungen } zurück.
 */
export function asciiBanner(text, maxZeichen = MAX_BANNER_ZEICHEN) {
  const roh = String(text || '').trim();
  if (!roh) return null;
  const oben = roh.slice(0, maxZeichen);
  const übersprungen = roh.length - oben.length;
  const zeilen = ['', '', '', '', ''];
  for (const ch of oben.toUpperCase()) {
    const g = GLYPHEN[ch] || GLYPHEN['?'];
    for (let i = 0; i < 5; i++) {
      zeilen[i] += g[i].replace(/1/g, '█').replace(/0/g, ' ') + ' ';
    }
  }
  return {
    zeilen: zeilen.map((z) => z.replace(/\s+$/, '')),
    benutzt: oben.length,
    übersprungen
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   2 · TEXT-WERKZEUGE — Base64 · ROT13 · Umkehren · Zählen
   ═══════════════════════════════════════════════════════════════════════ */

const B64_MAX = 600;

export function base64(text, dekodieren = false) {
  const t = String(text || '');
  if (!t.trim()) return null;
  if (t.length > B64_MAX) return { fehler: `Text ist zu lang (max ${B64_MAX} Zeichen).` };
  try {
    return dekodieren
      ? { text: Buffer.from(t.trim(), 'base64').toString('utf8'), modus: 'dekodiert' }
      : { text: Buffer.from(t, 'utf8').toString('base64'), modus: 'kodiert' };
  } catch (e) {
    return { fehler: 'Das ist kein gültiger Base64-Text.' };
  }
}

export function rot13(text) {
  const t = String(text || '');
  if (!t.trim()) return null;
  const gedreht = t.replace(/[a-z]/gi, (ch) => {
    const basis = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - basis + 13) % 26) + basis);
  });
  /* Umlaute mitdrehen, damit „äöü" nicht verloren gehen */
  const umlaute = { ä: 'nr', ö: 'pb', ü: 'ho', Ä: 'Nr', Ö: 'Pb', Ü: 'Ho', ß: 'ß' };
  return { text: gedreht.replace(/[äöüÄÖÜß]/g, (ch) => umlaute[ch]), laenge: t.length };
}

export function umkehren(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  return { text: [...t].reverse().join(''), laenge: [...t].length };
}

export function wortZaehler(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  const wörter = t.split(/\s+/).filter(Boolean);
  const sätze = t.split(/[.!?…]+/).map((s) => s.trim()).filter(Boolean);
  const zeichen = [...t].length;
  const ohneLeer = [...t.replace(/\s+/g, '')].length;
  const länger = wörter.filter((w) => w.length > 6).length;
  return {
    wörter: wörter.length,
    zeichen,
    ohneLeer,
    sätze: sätze.length || 1,
    länger,
    laengstes: wörter.reduce((a, b) => (b.length > a.length ? b : a), '')
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   3 · PROMILLE — Widmark-Formel (Schätzung, NIE exakt)
   ═══════════════════════════════════════════════════════════════════════ */

export function promille({ mengeMl, alkoholProzent, gewichtKg, stunden = 0, geschlecht = 'm' }) {
  const ml = Number(mengeMl);
  const pct = Number(alkoholProzent);
  const kg = Number(gewichtKg);
  const h = Number(stunden) || 0;
  if (![ml, pct, kg].every((n) => Number.isFinite(n) && n > 0)) return null;
  if (kg < 30 || kg > 300) return { fehler: 'Gib ein Gewicht zwischen 30 und 300 kg an.' };
  if (ml > 5000) return { fehler: 'So viel trinkt niemand — gib die Menge in Millilitern an.' };

  /* Alkohol in Gramm: ml × Vol% × 0,8 (Dichte Ethanol) */
  const gramm = ml * (pct / 100) * 0.8;
  /* Reduktionsfaktor: Mann 0,7 · Frau 0,6 (Körperwasser-Anteil) */
  const r = /^w|f/i.test(String(geschlecht)) ? 0.6 : 0.7;
  const roh = gramm / (kg * r);
  const abgebaut = 0.15 * h;           /* ~0,15 ‰ pro Stunde */
  const promilleWert = Math.max(0, roh - abgebaut);

  let ampel = '🟢';
  if (promilleWert >= 0.5) ampel = '🔴';
  else if (promilleWert > 0) ampel = '🟡';

  return {
    promille: Math.round(promilleWert * 100) / 100,
    gramm: Math.round(gramm * 10) / 10,
    ampel,
    stunden: h,
    hinweis: promilleWert > 0
      ? 'Nur eine SCHÄTZUNG (Widmark) — keine Messung. Kein Alkohol am Steuer, keine Krankheits-Tipps.'
      : 'Nüchtern Bereich (geschätzt). Trink trotzdem verantwortungsvoll. 💜'
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   4 · KAMPF — deterministische Simulation zwischen zwei Namen
   ═══════════════════════════════════════════════════════════════════════ */

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KAMPF_ZUEGE = [
  'wirft einen Herzblitz',
  'kontert mit einem Kratzen',
  'nutzt den süßen Blick',
  'zieht die Schnuller-Kanone',
  'ruft die Kitty-Verstärkung',
  'macht einen Purzelbaum-Tritt',
  'schleudert Konfetti',
  'singt zu laut'
];

export function kampf(nameA, nameB) {
  const a = String(nameA || '').trim();
  const b = String(nameB || '').trim();
  if (!a || !b) return null;

  const seed = hashString(a.toLowerCase() + '|' + b.toLowerCase());
  const rnd = mulberry(seed);

  let hpA = 100, hpB = 100;
  const log = [];
  let runde = 1;

  while (hpA > 0 && hpB > 0 && runde <= 12) {
    /* A greift an */
    const schadenA = Math.round(6 + rnd() * 16);
    const kritA = rnd() > 0.85;
    hpB -= kritA ? schadenA * 2 : schadenA;
    log.push({
      runde,
      von: a,
      aktion: KAMPF_ZUEGE[Math.floor(rnd() * KAMPF_ZUEGE.length)],
      schaden: kritA ? schadenA * 2 : schadenA,
      krit: kritA
    });
    if (hpB <= 0) break;

    /* B greift an */
    const schadenB = Math.round(6 + rnd() * 16);
    const kritB = rnd() > 0.85;
    hpA -= kritB ? schadenB * 2 : schadenB;
    log.push({
      runde,
      von: b,
      aktion: KAMPF_ZUEGE[Math.floor(rnd() * KAMPF_ZUEGE.length)],
      schaden: kritB ? schadenB * 2 : schadenB,
      krit: kritB
    });
    if (hpA <= 0) break;
    runde++;
  }

  const sieger = hpA <= 0 && hpB <= 0 ? null : hpA <= 0 ? b : hpB <= 0 ? a : null;
  const verzögerung = hpA > 0 && hpB > 0 ? Math.max(hpA, hpB) : 0;
  return {
    a: { name: a, hp: Math.max(0, hpA) },
    b: { name: b, hp: Math.max(0, hpB) },
    runden: runde,
    log,
    sieger: sieger || (verzögerung && (hpA >= hpB ? a : b)),
    unentschieden: !sieger && verzögerung === 0
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   5 · TEAMS — auslosen (deterministisch pro Tag & Eingabe)
   ═══════════════════════════════════════════════════════════════════════ */

export function teamLos(eingabe) {
  const teile = String(eingabe || '')
    .split(/[,;|]|\bund\b|\s+\+\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (teile.length < 2) return null;

  const rnd = mulberry(hashString(teile.join('|') + new Date().toISOString().slice(0, 10)));
  const gemischt = [...teile];
  for (let i = gemischt.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
  }
  const mitte = Math.ceil(gemischt.length / 2);
  return {
    anzahl: gemischt.length,
    team1: gemischt.slice(0, mitte),
    team2: gemischt.slice(mitte)
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   6 · ZAHLENRATEN — 1–100, Streak & Rekord pro Nutzer
   ═══════════════════════════════════════════════════════════════════════ */

const RAT_BEREICH = 100;

export function zahlenStart(bid) {
  const st = lade();
  const alt = st.zahlen[bid] || { streak: 0, best: null };
  const secret = 1 + Math.floor(Math.random() * RAT_BEREICH);
  st.zahlen[bid] = { secret, versuche: 0, streak: alt.streak || 0, best: alt.best ?? null };
  speichere(st);
  return { secret, versuche: 0 };
}

export function zahlenStatus(bid) {
  const st = lade();
  const z = st.zahlen[bid];
  if (!z) return null;
  return { läuft: true, versuche: z.versuche, streak: z.streak, best: z.best };
}

export function zahlenRat(bid, guess) {
  const n = Number(String(guess).replace(',', '.'));
  if (!Number.isInteger(n) || n < 1 || n > RAT_BEREICH) {
    return { fehler: `Rate mit einer ganzen Zahl von 1 bis ${RAT_BEREICH}.` };
  }
  const st = lade();
  const z = st.zahlen[bid];
  if (!z || typeof z.secret !== 'number') {
    const neu = zahlenStart(bid);
    return { status: 'neu', hinweis: 'Neue Runde gestartet — rate jetzt!', bereich: RAT_BEREICH };
  }
  z.versuche = (z.versuche || 0) + 1;
  if (n === z.secret) {
    const treffer = { status: 'treffer', zahl: z.secret, versuche: z.versuche, streak: (z.streak || 0) + 1 };
    z.streak = (z.streak || 0) + 1;
    z.best = z.best == null ? z.versuche : Math.min(z.best, z.versuche);
    treffer.best = z.best;
    delete z.secret;                     /* Runde zu Ende — nächster Tipp startet neu */
    speichere(st);
    return treffer;
  }
  speichere(st);
  return {
    status: n < z.secret ? 'höher' : 'tiefer',
    versuche: z.versuche,
    tipp: n,
    streak: z.streak || 0
  };
}

export function zahlenStop(bid) {
  const st = lade();
  const z = st.zahlen[bid];
  if (!z || typeof z.secret !== 'number') return null;
  const secret = z.secret;
  delete z.secret;
  speichere(st);
  return { secret };
}

/* ═══════════════════════════════════════════════════════════════════════
   7 · TIC-TAC-TOE — gegen Love 💜 (Feld 1–9, Love = O)
   ═══════════════════════════════════════════════════════════════════════ */

const TTT_LINIEN = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function tttGewinner(feld) {
  for (const linie of TTT_LINIEN) {
    const [a, b, c] = linie;
    if (feld[a] && feld[a] === feld[b] && feld[a] === feld[c]) return feld[a];
  }
  return feld.every((x) => x) ? 'unentschieden' : null;
}

/* Love' Bot-Zug: gewinnen > blocken > Mitte > Ecke > sonst */
export function tttBotZug(feld) {
  const frei = feld.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (!frei.length) return null;
  const versuche = (mark) => {
    for (const i of frei) {
      const probe = [...feld]; probe[i] = mark;
      if (tttGewinner(probe) === mark) return i;
    }
    return null;
  };
  return versuche('O')
    ?? versuche('X')
    ?? (feld[4] === null ? 4 : null)
    ?? frei.find((i) => [0, 2, 6, 8].includes(i))
    ?? frei[0];
}

export function tttZug(bid, feldIndex) {
  const idx = Number(feldIndex);
  if (!Number.isInteger(idx) || idx < 1 || idx > 9) {
    return { fehler: 'Sag mir ein Feld von 1 bis 9.' };
  }
  const st = lade();
  let spiel = st.ttt[bid];
  if (!spiel) spiel = { feld: Array(9).fill(null), scoreU: 0, scoreB: 0 };

  const i = idx - 1;
  if (spiel.feld[i]) return { fehler: 'Dieses Feld ist schon belegt.' };

  spiel.feld[i] = 'X';
  let ergebnis = tttGewinner(spiel.feld);

  if (!ergebnis) {
    const bot = tttBotZug(spiel.feld);
    if (bot != null) spiel.feld[bot] = 'O';
    ergebnis = tttGewinner(spiel.feld);
  }

  if (ergebnis === 'X') spiel.scoreU++;
  else if (ergebnis === 'O') spiel.scoreB++;
  else if (ergebnis === 'unentschieden') { /* nichts zählen */ }

  const meldung = ergebnis === 'X' ? 'Du gewinnst! 🎉'
    : ergebnis === 'O' ? 'Love 💜 gewinnt diese Runde!'
      : ergebnis === 'unentschieden' ? 'Unentschieden — Kopf an Kopf 🤝'
        : '';

  const zurueck = {
    feld: [...spiel.feld],
    ergebnis,
    meldung,
    scoreU: spiel.scoreU,
    scoreB: spiel.scoreB
  };

  if (ergebnis) spiel.feld = Array(9).fill(null);   /* nächste Runde sofort bereit */
  st.ttt[bid] = spiel;
  speichere(st);
  return zurueck;
}

export function tttStatus(bid) {
  const st = lade();
  const s = st.ttt[bid];
  if (!s) return { scoreU: 0, scoreB: 0, feld: Array(9).fill(null) };
  return { scoreU: s.scoreU || 0, scoreB: s.scoreB || 0, feld: [...(s.feld || Array(9).fill(null))] };
}

export function tttReset(bid) {
  const st = lade();
  delete st.ttt[bid];
  speichere(st);
  return true;
}
