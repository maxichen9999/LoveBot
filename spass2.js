/* ═══════════════════════════════════════════════════════════════════════
   🎮 S P A S S 2 (spass2.js) — weitere Spiele & Tools für LoveBot
   ─────────────────────────────────────────────────────────────────────
   Nachfolger von spass.js — gleiche Konventionen:
     · reine Funktionen (kein WhatsApp-Zugriff)
     · State pro Nutzer in Database/spass2.json
     · SPASS2_DB_DIR überschreibt das Verzeichnis (für Tests)
     · deterministische Zufälle pro (bid, Runde) → testbar

   Enthaltene Befehle:
     · hangman   — Galgenmännchen rund um die Liebe 🪢
     · connect4  — Vier gewinnt gegen Love 💜
     · mastermind — 4-stelligen Code knacken 🧠
     · blackjack — 21 gegen Love 🂱 (nur Spielchips, kein echtes Geld)
     · stopuhr   — Stoppuhr mit Start/Stop/Reset ⏱️
     · alter     — exaktes Alter + Tage bis zum Geburtstag 🎂
     · todo      — persönliche Aufgabenliste ✅
   ═══════════════════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';

const DB_DIR = process.env.SPASS2_DB_DIR || path.join(process.cwd(), 'Database');
const DB_FILE = path.join(DB_DIR, 'spass2.json');

const LEER = () => ({ hangman: {}, c4: {}, mm: {}, bj: {}, stopuhr: {}, todo: {} });

/* ── Stand lesen & schreiben ────────────────────────────────────────── */
function lade() {
  try {
    const roh = fs.readFileSync(DB_FILE, 'utf8');
    const daten = JSON.parse(roh);
    return { ...LEER(), ...daten };
  } catch (e) {
    return LEER();
  }
}

function speichere(st) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(st, null, 2));
  } catch (e) { /* Nicht tödlich — Spiele gehen trotzdem */ }
}

/* DB-Key pro Nutzer: identity.bid oder JID */
function keyVon(ctx) {
  const bid = ctx?.userProfile?.identity?.bid || ctx?.bid || ctx?.from || '';
  return String(bid || 'anon');
}

/* ── kleiner deterministischer Zufall (pro bid + Runde) ─────────────── */
function strHash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickAus(liste, rnd) {
  return liste[Math.floor(rnd() * liste.length) % liste.length];
}

/* ═══════════════════════════════════════════════════════════════════════
   1 · HANGMAN — Galgenmännchen rund um die Liebe 🪢
   ═══════════════════════════════════════════════════════════════════════ */

const HM_WOERTER = [
  'liebe', 'herzklopfen', 'kupfer', 'schmetterling', 'sternenhimmel', 'kuscheln',
  'hoffnung', 'zärtlichkeit', 'seelenverwandt', 'rosenblatt', 'mondlicht', 'vertrauen',
  'gefühl', 'umarmung', 'herzchen', 'liebesbrief', 'gänsehaut', 'sehnsucht',
  'zuneigung', 'glücksgefühl', 'sommerregen', 'sternenklar', 'kaffee', 'dankbarkeit'
];

/* 10 Stufen: 0 = nichts, 9 = verloren */
const HM_GALGEN = [
  '',
  '\n╭───╮\n│',
  '\n╭───╮\n│   │',
  '\n╭───╮\n│   │\n│   😊',
  '\n╭───╮\n│   │\n│   😊\n│   │',
  '\n╭───╮\n│   │\n│   😊\n│  ╱│',
  '\n╭───╮\n│   │\n│   😊\n│  ╱│╲',
  '\n╭───╮\n│   │\n│   😵\n│  ╱│╲\n│  ╱',
  '\n╭───╮\n│   │\n│   😵\n│  ╱│╲\n│  ╱ ╲',
  '\n╭───╮\n│   │\n│   💀\n│  ╱│╲\n│  ╱ ╲'
];

const HM_MAX_FEHLER = 9;

function hmMaske(wort, geraten) {
  return [...wort].map((z) => (geraten.includes(z) ? z : (z === ' ' ? ' ' : '_'))).join(' ');
}

function hmFertig(wort, geraten) {
  return [...wort].every((z) => z === ' ' || geraten.includes(z));
}

export function hangmanStart(bid, seed = 0) {
  const key = String(bid || 'anon');
  const st = lade();
  const rnd = mulberry(strHash(key + '|hangman|' + seed + '|' + (st.hangman[key]?.runde || 0)));
  const wort = pickAus(HM_WOERTER, rnd);
  const spiel = {
    wort,
    geraten: [],
    fehler: 0,
    runde: (st.hangman[key]?.runde || 0) + 1,
    siege: st.hangman[key]?.siege || 0,
    verloren: st.hangman[key]?.verloren || 0
  };
  st.hangman[key] = spiel;
  speichere(st);
  return hangmanBild(spiel);
}

function hangmanBild(spiel) {
  const fertig = hmFertig(spiel.wort, spiel.geraten);
  return {
    läuft: spiel.fehler < HM_MAX_FEHLER && !fertig,
    maske: hmMaske(spiel.wort, spiel.geraten),
    versuche: spiel.geraten.length,
    fehler: spiel.fehler,
    maxFehler: HM_MAX_FEHLER,
    galgen: HM_GALGEN[Math.min(spiel.fehler, HM_MAX_FEHLER)],
    siege: spiel.siege || 0,
    verloren: spiel.verloren || 0,
    buchstaben: [...new Set(spiel.geraten)].sort().join(' ') || '—'
  };
}

export function hangmanRat(bid, buchstabe) {
  const key = String(bid || 'anon');
  const st = lade();
  const spiel = st.hangman[key];
  if (!spiel || spiel.fehler >= HM_MAX_FEHLER || hmFertig(spiel.wort, spiel.geraten)) {
    return { fehler: 'Kein Spiel läuft — starte mit $hangman.' };
  }
  const b = String(buchstabe || '').toLowerCase().trim().slice(0, 1);
  if (!/^[a-zäöüß]$/.test(b)) return { fehler: 'Sag mir einen Buchstaben, z. B. $hangman a' };

  if (spiel.geraten.includes(b)) {
    return { ...hangmanBild(spiel), hinweis: `„${b}" hattest du schon.` };
  }
  spiel.geraten.push(b);
  const treffer = spiel.wort.includes(b);
  if (!treffer) spiel.fehler++;

  let ergebnis = null;
  if (hmFertig(spiel.wort, spiel.geraten)) { ergebnis = 'sieg'; spiel.siege++; }
  else if (spiel.fehler >= HM_MAX_FEHLER) { ergebnis = 'verloren'; spiel.verloren++; }

  st.hangman[key] = spiel;
  speichere(st);
  const bild = hangmanBild(spiel);
  bild.treffer = treffer;
  if (ergebnis) {
    bild.ergebnis = ergebnis;
    bild.wort = spiel.wort;
  }
  return bild;
}

export function hangmanStatus(bid) {
  const st = lade();
  const s = st.hangman[String(bid || 'anon')];
  if (!s) return null;
  return hangmanBild(s);
}

export function hangmanStop(bid) {
  const key = String(bid || 'anon');
  const st = lade();
  const s = st.hangman[key];
  if (!s) return null;
  delete st.hangman[key];
  speichere(st);
  return { wort: s.wort };
}

/* ═══════════════════════════════════════════════════════════════════════
   2 · CONNECT4 — Vier gewinnt gegen Love 💜 (7 Spalten × 6 Reihen)
   ═══════════════════════════════════════════════════════════════════════ */

const C4_SPALTEN = 7;
const C4_REIHEN = 6;

function c4Leer() {
  return Array(C4_SPALTEN * C4_REIHEN).fill(null);
}

const C4_LINIEN = (() => {
  const linien = [];
  for (let r = 0; r < C4_REIHEN; r++) {
    for (let c = 0; c < C4_SPALTEN; c++) {
      if (c + 3 < C4_SPALTEN) linien.push([r * 7 + c, r * 7 + c + 1, r * 7 + c + 2, r * 7 + c + 3]);
      if (r + 3 < C4_REIHEN) linien.push([r * 7 + c, (r + 1) * 7 + c, (r + 2) * 7 + c, (r + 3) * 7 + c]);
      if (c + 3 < C4_SPALTEN && r + 3 < C4_REIHEN) linien.push([r * 7 + c, (r + 1) * 7 + c + 1, (r + 2) * 7 + c + 2, (r + 3) * 7 + c + 3]);
      if (c - 3 >= 0 && r + 3 < C4_REIHEN) linien.push([r * 7 + c, (r + 1) * 7 + c - 1, (r + 2) * 7 + c - 2, (r + 3) * 7 + c - 3]);
    }
  }
  return linien;
})();

export function c4Gewinner(feld) {
  for (const linie of C4_LINIEN) {
    const [a, b, c, d] = linie;
    if (feld[a] && feld[a] === feld[b] && feld[a] === feld[c] && feld[a] === feld[d]) return feld[a];
  }
  return feld.every((x) => x) ? 'unentschieden' : null;
}

/* Welche Reihe belegt ein Wurf in Spalte c (von unten)? */
function c4Reihe(feld, spalte) {
  for (let r = C4_REIHEN - 1; r >= 0; r--) {
    if (!feld[r * C4_SPALTEN + spalte]) return r;
  }
  return -1;
}

function c4Frei(feld) {
  const frei = [];
  for (let c = 0; c < C4_SPALTEN; c++) if (c4Reihe(feld, c) >= 0) frei.push(c);
  return frei;
}

/* Love' Bot-Zug: gewinnen > blocken > zentrumsnah (deterministisch) */
export function c4BotZug(feld, seed = 0) {
  const frei = c4Frei(feld);
  if (!frei.length) return null;
  const teste = (mark) => {
    for (const c of frei) {
      const probe = [...feld];
      probe[c4Reihe(feld, c) * C4_SPALTEN + c] = mark;
      if (c4Gewinner(probe) === mark) return c;
    }
    return null;
  };
  const gewinnen = teste('O');
  if (gewinnen != null) return gewinnen;
  const blocken = teste('X');
  if (blocken != null) return blocken;
  /* Zentrum bevorzugen: 3, 2, 4, 1, 5, 0, 6 */
  const reihenfolge = [3, 2, 4, 1, 5, 0, 6].filter((c) => frei.includes(c));
  return reihenfolge[0] ?? frei[0];
}

export function c4Zug(bid, spalte, seed = 0) {
  const key = String(bid || 'anon');
  const st = lade();
  let spiel = st.c4[key];
  if (!spiel) spiel = { feld: c4Leer(), scoreU: 0, scoreB: 0, remis: 0 };

  const col = Number(spalte);
  if (!Number.isInteger(col) || col < 1 || col > C4_SPALTEN) {
    return { fehler: `Sag mir eine Spalte von 1 bis ${C4_SPALTEN}.` };
  }
  const c = col - 1;
  const r = c4Reihe(spiel.feld, c);
  if (r < 0) return { fehler: 'Diese Spalte ist schon voll.' };

  spiel.feld[r * C4_SPALTEN + c] = 'X';
  let ergebnis = c4Gewinner(spiel.feld);

  if (!ergebnis) {
    const botCol = c4BotZug(spiel.feld, seed);
    if (botCol != null) {
      const br = c4Reihe(spiel.feld, botCol);
      spiel.feld[br * C4_SPALTEN + botCol] = 'O';
    }
    ergebnis = c4Gewinner(spiel.feld);
  }

  if (ergebnis === 'X') spiel.scoreU++;
  else if (ergebnis === 'O') spiel.scoreB++;
  else if (ergebnis === 'unentschieden') spiel.remis++;

  const zurueck = {
    feld: [...spiel.feld],
    ergebnis,
    meldung: ergebnis === 'X' ? 'Vier in einer Reihe — du gewinnst! 🎉'
      : ergebnis === 'O' ? 'Love 💜 hat vier in einer Reihe!'
        : ergebnis === 'unentschieden' ? 'Unentschieden — Brett voll 🤝' : '',
    scoreU: spiel.scoreU, scoreB: spiel.scoreB, remis: spiel.remis || 0,
    botSpalte: ergebnis ? null : null
  };

  if (ergebnis) spiel.feld = c4Leer();
  st.c4[key] = spiel;
  speichere(st);
  return zurueck;
}

export function c4Status(bid) {
  const st = lade();
  const s = st.c4[String(bid || 'anon')];
  if (!s) return { feld: c4Leer(), scoreU: 0, scoreB: 0, remis: 0 };
  return { feld: [...(s.feld || c4Leer())], scoreU: s.scoreU || 0, scoreB: s.scoreB || 0, remis: s.remis || 0 };
}

export function c4Reset(bid) {
  const st = lade();
  delete st.c4[String(bid || 'anon')];
  speichere(st);
  return true;
}

/* ═══════════════════════════════════════════════════════════════════════
   3 · MASTERMIND — 4-stelligen Code knacken (Ziffern 1–6) 🧠
   ═══════════════════════════════════════════════════════════════════════ */

const MM_LAENGE = 4;
const MM_MAX = 10;

export function mmStart(bid, seed = 0) {
  const key = String(bid || 'anon');
  const st = lade();
  const rnd = mulberry(strHash(key + '|mm|' + seed + '|' + (st.mm[key]?.runde || 0)));
  const code = Array.from({ length: MM_LAENGE }, () => String(1 + Math.floor(rnd() * 6))).join('');
  st.mm[key] = { code, versuche: 0, rufe: [], runde: (st.mm[key]?.runde || 0) + 1, siege: st.mm[key]?.siege || 0 };
  speichere(st);
  return { läuft: true, versuche: 0, maxVersuche: MM_MAX, länge: MM_LAENGE };
}

export function mmRat(bid, tipp) {
  const key = String(bid || 'anon');
  const st = lade();
  const spiel = st.mm[key];
  if (!spiel) return { fehler: 'Kein Spiel läuft — starte mit $mastermind.' };
  if (spiel.versuche >= MM_MAX) return { fehler: 'Alle Versuche verbraucht — $mastermind für eine neue Runde.', ergebnis: 'verloren', code: spiel.code };

  const t = String(tipp || '').replace(/\D/g, '');
  if (t.length !== MM_LAENGE || /[0789]/.test(t)) {
    return { fehler: `Tippe ${MM_LAENGE} Ziffern von 1–6, z. B. $mastermind 1234` };
  }

  spiel.versuche++;
  /* richtige Position + richtige Ziffer (mit Mehrfachbelegung) */
  let position = 0;
  const codeRest = [];
  const tippRest = [];
  for (let i = 0; i < MM_LAENGE; i++) {
    if (t[i] === spiel.code[i]) position++;
    else { codeRest.push(spiel.code[i]); tippRest.push(t[i]); }
  }
  let richtig = position;
  for (const z of tippRest) {
    const idx = codeRest.indexOf(z);
    if (idx !== -1) { richtig++; codeRest.splice(idx, 1); }
  }

  spiel.rufe.push({ tipp: t, richtig, position });
  let ergebnis = null;
  if (position === MM_LAENGE) { ergebnis = 'sieg'; spiel.siege++; }
  else if (spiel.versuche >= MM_MAX) ergebnis = 'verloren';

  st.mm[key] = spiel;
  speichere(st);
  return {
    tipp: t, richtig, position,
    versuche: spiel.versuche, maxVersuche: MM_MAX,
    ergebnis,
    code: ergebnis ? spiel.code : undefined,
    siege: spiel.siege || 0,
    verlust: ergebnis === 'verloren'
  };
}

export function mmStatus(bid) {
  const st = lade();
  const s = st.mm[String(bid || 'anon')];
  if (!s) return null;
  return { versuche: s.versuche || 0, maxVersuche: MM_MAX, rufe: s.rufe || [], siege: s.siege || 0 };
}

export function mmStop(bid) {
  const key = String(bid || 'anon');
  const st = lade();
  const s = st.mm[key];
  if (!s) return null;
  delete st.mm[key];
  speichere(st);
  return { code: s.code };
}

/* ═══════════════════════════════════════════════════════════════════════
   4 · BLACKJACK — 21 gegen Love 🂱 (Spielchips, KEIN echtes Geld)
   ═══════════════════════════════════════════════════════════════════════ */

const BJ_FARBEN = ['♠', '♥', '♦', '♣'];
const BJ_WERTE = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'];
const BJ_START_CHIPS = 500;
const BJ_EINSATZ_MIN = 10;

function bjKarte(rnd) {
  const farbe = pickAus(BJ_FARBEN, rnd);
  const wert = pickAus(BJ_WERTE, rnd);
  const label = wert === 'B' ? 'Bube' : wert === 'D' ? 'Dame' : wert === 'K' ? 'König' : wert === 'A' ? 'Ass' : wert;
  return { wert, farbe, label };
}

function bjSumme(karten) {
  let summe = 0;
  let asse = 0;
  for (const k of karten) {
    if (k.wert === 'A') { asse++; summe += 11; }
    else if (['B', 'D', 'K'].includes(k.wert)) summe += 10;
    else summe += Number(k.wert);
  }
  while (summe > 21 && asse > 0) { summe -= 10; asse--; }
  return summe;
}

function bjKarteText(k) {
  return `${k.farbe}${k.wert === 'A' ? 'A' : k.wert}`;
}

function bjBild(spiel) {
  return {
    kartenU: spiel.kartenU.map(bjKarteText),
    kartenB: (spiel.bVerdeckt ? ['??'] : spiel.kartenB.map(bjKarteText)),
    summeU: bjSumme(spiel.kartenU),
    summeB: spiel.bVerdeckt ? null : bjSumme(spiel.kartenB),
    bVerdeckt: !!spiel.bVerdeckt,
    einsatz: spiel.einsatz,
    chips: spiel.chips,
    ergebnis: spiel.ergebnis || null,
    blackjack: bjSumme(spiel.kartenU) === 21 && spiel.kartenU.length === 2
  };
}

export function bjStart(bid, einsatz, seed = 0) {
  const key = String(bid || 'anon');
  const st = lade();
  let spiel = st.bj[key];
  if (!spiel) spiel = { chips: BJ_START_CHIPS };
  if (spiel.läuft) return { fehler: 'Eine Runde läuft schon — $bj hit oder $bj stand.' };

  const e = Math.floor(Number(einsatz));
  if (!Number.isFinite(e) || e < BJ_EINSATZ_MIN) return { fehler: `Einsatz mindestens ${BJ_EINSATZ_MIN} Chips — z. B. $bj 50` };
  if (e > spiel.chips) return { fehler: `Du hast nur ${spiel.chips} Chips.` };

  const rnd = mulberry(strHash(key + '|bj|' + seed + '|' + (spiel.runden || 0)));
  spiel.runden = (spiel.runden || 0) + 1;
  spiel.kartenU = [bjKarte(rnd), bjKarte(rnd)];
  spiel.kartenB = [bjKarte(rnd), bjKarte(rnd)];
  spiel.bVerdeckt = true;
  spiel.einsatz = e;
  spiel.chips -= e;
  spiel.ergebnis = null;
  spiel.läuft = true;

  /* Sofort-Blackjack des Spielers */
  if (bjSumme(spiel.kartenU) === 21) {
    return bjStand(bid, seed);
  }

  st.bj[key] = spiel;
  speichere(st);
  return bjBild(spiel);
}

export function bjHit(bid, seed = 0) {
  const key = String(bid || 'anon');
  const st = lade();
  const spiel = st.bj[key];
  if (!spiel || !spiel.läuft) return { fehler: 'Keine Runde läuft — starte mit $bj <einsatz>.' };

  const rnd = mulberry(strHash(key + '|bjhit|' + seed + '|' + spiel.kartenU.length));
  spiel.kartenU.push(bjKarte(rnd));
  const summe = bjSumme(spiel.kartenU);
  if (summe > 21) {
    spiel.ergebnis = 'verloren';
    spiel.läuft = false;
    spiel.bVerdeckt = false;
  }
  st.bj[key] = spiel;
  speichere(st);
  return bjBild(spiel);
}

export function bjStand(bid, seed = 0) {
  const key = String(bid || 'anon');
  const st = lade();
  const spiel = st.bj[key];
  if (!spiel || !spiel.läuft) return { fehler: 'Keine Runde läuft — starte mit $bj <einsatz>.' };

  const rnd = mulberry(strHash(key + '|bjdealer|' + seed + '|' + (spiel.kartenB.length)));
  spiel.bVerdeckt = false;
  while (bjSumme(spiel.kartenB) < 17) spiel.kartenB.push(bjKarte(rnd));

  const u = bjSumme(spiel.kartenU);
  const b = bjSumme(spiel.kartenB);
  if (u === 21 && spiel.kartenU.length === 2 && b !== 21) {
    spiel.ergebnis = 'blackjack';
    spiel.chips += Math.round(spiel.einsatz * 2.5);
  } else if (b > 21 || u > b) {
    spiel.ergebnis = 'sieg';
    spiel.chips += spiel.einsatz * 2;
  } else if (u === b) {
    spiel.ergebnis = 'unentschieden';
    spiel.chips += spiel.einsatz;
  } else {
    spiel.ergebnis = 'verloren';
  }
  spiel.läuft = false;
  st.bj[key] = spiel;
  speichere(st);
  return bjBild(spiel);
}

export function bjStatus(bid) {
  const st = lade();
  const s = st.bj[String(bid || 'anon')];
  if (!s) return { chips: BJ_START_CHIPS, läuft: false };
  if (!s.läuft) return { chips: s.chips ?? BJ_START_CHIPS, läuft: false };
  return { ...bjBild(s), läuft: true };
}

/* ═══════════════════════════════════════════════════════════════════════
   5 · STOPPUHR — Start/Stop/Reset ⏱️
   ═══════════════════════════════════════════════════════════════════════ */

export function stopuhrStart(bid) {
  const key = String(bid || 'anon');
  const st = lade();
  const s = st.stopuhr[key] || { gelaufen: 0 };
  if (s.startet) return { läuft: true, ms: s.gelaufen + (Date.now() - s.startet), hinweis: 'Läuft schon.' };
  s.startet = Date.now();
  s.gelaufen = s.gelaufen || 0;
  st.stopuhr[key] = s;
  speichere(st);
  return { läuft: true, ms: 0 };
}

export function stopuhrStop(bid) {
  const key = String(bid || 'anon');
  const st = lade();
  const s = st.stopuhr[key];
  if (!s || !s.startet) return { läuft: false, ms: s?.gelaufen || 0, hinweis: 'Die Uhr läuft nicht.' };
  s.gelaufen += Date.now() - s.startet;
  s.startet = null;
  st.stopuhr[key] = s;
  speichere(st);
  return { läuft: false, ms: s.gelaufen };
}

export function stopuhrStatus(bid) {
  const st = lade();
  const s = st.stopuhr[String(bid || 'anon')];
  if (!s) return { läuft: false, ms: 0 };
  return { läuft: !!s.startet, ms: (s.gelaufen || 0) + (s.startet ? Date.now() - s.startet : 0) };
}

export function stopuhrReset(bid) {
  const st = lade();
  delete st.stopuhr[String(bid || 'anon')];
  speichere(st);
  return true;
}

/** Millisekunden → „1:23,45 h" / „2:05" / „0:07,3" */
export function stopuhrText(ms) {
  const total = Math.max(0, Math.floor(ms || 0));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const zs = Math.floor((total % 1000) / 100);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} h`;
  return `${m}:${String(s).padStart(2, '0')},${zs}`;
}

/* ═══════════════════════════════════════════════════════════════════════
   6 · ALTER — exaktes Alter + Tage bis zum Geburtstag 🎂
   ═══════════════════════════════════════════════════════════════════════ */

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

/**
 * Alter berechnen. Eingabe: '04.10.1990', '4.10.1990', '1990-10-04', '04.10.90'
 * @returns {{jahre,monate,tage,geburtstag:string,wochentag:string,naechsterGebIn:number,naechsterGeburtstag:string}|null}
 */
export function alter(gebDat, heute = new Date()) {
  const roh = String(gebDat || '').trim();
  const m = roh.match(/^(\d{1,4})[.\-/](\d{1,2})[.\-/](\d{1,4})$/);
  if (!m) return null;
  let jahr, monat, tag;
  if (m[1].length === 4) { jahr = Number(m[1]); monat = Number(m[2]); tag = Number(m[3]); }
  else {
    tag = Number(m[1]); monat = Number(m[2]);
    jahr = Number(m[3]);
    if (jahr < 100) jahr += jahr > 30 ? 1900 : 2000;
  }
  if (monat < 1 || monat > 12 || tag < 1 || tag > 31) return null;
  const geb = new Date(jahr, monat - 1, tag);
  if (geb.getDate() !== tag || geb.getMonth() !== monat - 1 || geb.getFullYear() !== jahr) return null;
  const jetzt = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate());
  if (geb > jetzt) return null;

  let jahre = jetzt.getFullYear() - jahr;
  let monate = jetzt.getMonth() - (monat - 1);
  let tage = jetzt.getDate() - tag;
  if (tage < 0) {
    monate--;
    const vorigerMonat = new Date(jetzt.getFullYear(), jetzt.getMonth(), 0).getDate();
    tage += vorigerMonat;
  }
  if (monate < 0) { monate += 12; jahre--; }

  /* nächster Geburtstag */
  let naechster = new Date(jetzt.getFullYear(), monat - 1, tag);
  if (naechster < jetzt) naechster = new Date(jetzt.getFullYear() + 1, monat - 1, tag);
  const tageBis = Math.round((naechster - jetzt) / 86400000);

  return {
    jahre, monate, tage,
    geburtstag: `${tag}. ${MONATE[monat - 1]} ${jahr}`,
    wochentag: WOCHENTAGE[geb.getDay()],
    naechsterGebIn: tageBis,
    naechsterGeburtstag: `${tag}. ${MONATE[monat - 1]} ${naechster.getFullYear()}`
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   7 · TODO — persönliche Aufgabenliste ✅
   ═══════════════════════════════════════════════════════════════════════ */

const TODO_MAX = 30;

function todoBild(spiel) {
  const liste = (spiel.liste || []).map((t, i) => ({
    nr: i + 1, text: t.text, fertig: !!t.fertig, seit: t.seit
  }));
  return {
    liste,
    offen: liste.filter((t) => !t.fertig).length,
    erledigt: liste.filter((t) => t.fertig).length,
    gesamt: liste.length
  };
}

export function todoAdd(bid, text) {
  const key = String(bid || 'anon');
  const t = String(text || '').trim().slice(0, 120);
  if (!t) return { fehler: 'Was möchtest du dir notieren? z. B. $todo Blumen gießen' };
  const st = lade();
  let spiel = st.todo[key];
  if (!spiel) spiel = { liste: [] };
  if (spiel.liste.length >= TODO_MAX) return { fehler: `Maximal ${TODO_MAX} Aufgaben — räum erst mal auf ($todo clear).` };
  spiel.liste.push({ text: t, fertig: false, seit: new Date().toISOString() });
  st.todo[key] = spiel;
  speichere(st);
  return { ...todoBild(spiel), hinweis: `„${t}" hinzugefügt.` };
}

export function todoFertig(bid, nr) {
  const key = String(bid || 'anon');
  const st = lade();
  const spiel = st.todo[key];
  const i = Number(nr) - 1;
  if (!spiel || !spiel.liste[i]) return { fehler: 'Diese Aufgabe gibt es nicht — $todo zeigt deine Liste.' };
  spiel.liste[i].fertig = !spiel.liste[i].fertig;
  st.todo[key] = spiel;
  speichere(st);
  return { ...todoBild(spiel), hinweis: spiel.liste[i].fertig ? 'Erledigt — stark! 💪' : 'Wieder offen.' };
}

export function todoLoeschen(bid, nr) {
  const key = String(bid || 'anon');
  const st = lade();
  const spiel = st.todo[key];
  const i = Number(nr) - 1;
  if (!spiel || !spiel.liste[i]) return { fehler: 'Diese Aufgabe gibt es nicht.' };
  const weg = spiel.liste.splice(i, 1)[0];
  st.todo[key] = spiel;
  speichere(st);
  return { ...todoBild(spiel), hinweis: `„${weg.text}" gelöscht.` };
}

export function todoListe(bid) {
  const st = lade();
  const spiel = st.todo[String(bid || 'anon')];
  if (!spiel || !spiel.liste.length) return { liste: [], offen: 0, erledigt: 0, gesamt: 0 };
  return todoBild(spiel);
}

export function todoLeeren(bid) {
  const st = lade();
  delete st.todo[String(bid || 'anon')];
  speichere(st);
  return { liste: [], offen: 0, erledigt: 0, gesamt: 0 };
}
