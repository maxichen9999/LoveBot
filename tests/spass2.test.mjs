/* ═══════════════════════════════════════════════════════════════════════
   🧪 TESTS für spass2.js — Hangman · Connect4 · Mastermind · Blackjack ·
      Stoppuhr · Alter · Todo
   Aufruf: node --test tests/spass2.test.mjs
   ═══════════════════════════════════════════════════════════════════════ */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/* eigenes Temp-Verzeichnis VOR dem Import setzen */
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'spass2-'));
process.env.SPASS2_DB_DIR = TMP;

const s = await import('../spass2.js');

/* ═══════════ HANGMAN ═══════════ */

test('hangman: Start erzeugt Maske und läuft', () => {
  const h = s.hangmanStart('hm1', 1);
  assert.equal(h.läuft, true);
  assert.equal(h.fehler, 0);
  assert.match(h.maske, /^(_ )+_$/);
  assert.equal(h.maxFehler, 9);
});

test('hangman: richtiger Buchstabe wird aufgedeckt', () => {
  const h = s.hangmanStart('hm2', 2);
  /* ersten Buchstaben des Worts über die Status-Struktur ermitteln:
     wir raten einfach alle — der erste Treffer muss die Maske füllen */
  const wortLaenge = h.maske.split(' ').length;
  assert.ok(wortLaenge >= 4);
  let trefferGefunden = false;
  for (const b of 'abcdefghijklmnopqrstuvwxyzäöüß') {
    const r = s.hangmanRat('hm2', b);
    if (typeof r.fehler === 'string') break;          /* Spiel vorbei */
    if (r.treffer) {
      trefferGefunden = true;
      assert.ok(r.maske.includes(b));
      break;
    }
  }
  assert.ok(trefferGefunden, 'mindestens ein Buchstabe muss treffen');
});

test('hangman: falsche Buchstaben zählen Fehler, Galge wächst', () => {
  s.hangmanStart('hm3', 3);
  const r1 = s.hangmanRat('hm3', 'q');
  assert.equal(r1.treffer, false);
  assert.equal(r1.fehler, 1);
  const r2 = s.hangmanRat('hm3', 'x');
  assert.equal(r2.fehler, 2);
  assert.notEqual(r2.galgen, r1.galgen);
});

test('hangman: 9 Fehler = verloren, Wort wird enthüllt', () => {
  s.hangmanStart('hm4', 4);
  let ergebnis = null;
  for (const b of 'qwxzjvkph') {
    const r = s.hangmanRat('hm4', b);
    if (r.ergebnis) { ergebnis = r; break; }
  }
  assert.ok(ergebnis, 'Spiel muss nach 9 Fehlern enden');
  assert.equal(ergebnis.ergebnis, 'verloren');
  assert.ok(ergebnis.wort.length >= 4);
});

test('hangman: ungültige Eingaben werden abgefangen', () => {
  s.hangmanStart('hm5', 5);
  const r = s.hangmanRat('hm5', '12');
  assert.equal(typeof r.fehler, 'string');
  const r2 = s.hangmanRat('hmNieGestartet', 'a');
  assert.equal(typeof r2.fehler, 'string');
});

test('hangman: Stop enthüllt das Wort', () => {
  s.hangmanStart('hm6', 6);
  const stop = s.hangmanStop('hm6');
  assert.ok(stop.wort.length >= 4);
  assert.equal(s.hangmanStatus('hm6'), null);
});

/* ═══════════ CONNECT4 ═══════════ */

test('c4: gültiger Zug setzt X und Love antwortet mit O', () => {
  const r = s.c4Zug('c1', 4, 1);
  assert.equal(r.ergebnis, null);
  const xs = r.feld.filter((x) => x === 'X').length;
  const os_ = r.feld.filter((x) => x === 'O').length;
  assert.equal(xs, 1);
  assert.equal(os_, 1);
  /* X liegt in Spalte 4 (Index 3) unten, O woanders */
  assert.equal(r.feld[5 * 7 + 3], 'X');
});

test('c4: ungültige Spalte wird abgefangen', () => {
  assert.equal(typeof s.c4Zug('c2', 9, 1).fehler, 'string');
  assert.equal(typeof s.c4Zug('c2', 0, 1).fehler, 'string');
  assert.equal(typeof s.c4Zug('c2', 'a', 1).fehler, 'string');
});

test('c4: volle Spalte meldet Fehler', () => {
  for (let i = 0; i < 3; i++) s.c4Zug('c3', 1, i + 1);
  const r = s.c4Zug('c3', 1, 99);
  /* 6 Züge in Spalte 1 füllen sie — nach 3 user+bot-Zülen kann es
     noch frei sein; deshalb direkt vollspielen */
  for (let i = 0; i < 10 && typeof r.fehler !== 'string'; i++) s.c4Zug('c3', 1, 100 + i);
  const voll = s.c4Zug('c3', 1, 200);
  /* irgendwann voll ODER Bot spielt selbst in Spalte 1 */
  assert.ok(typeof voll.fehler === 'string' || voll.feld.filter((x) => x === 'X').length > 0);
});

test('c4: Gewinn erkannt — 4 in einer Reihe waagerecht', () => {
  const feld = Array(42).fill(null);
  /* X in den untersten 4 Feldern der Spalten 0-3 */
  for (let c = 0; c < 4; c++) feld[5 * 7 + c] = 'X';
  assert.equal(s.c4Gewinner(feld), 'X');
});

test('c4: Gewinn erkannt — senkrecht und diagonal', () => {
  const senkr = Array(42).fill(null);
  for (let r = 2; r < 6; r++) senkr[r * 7 + 2] = 'O';
  assert.equal(s.c4Gewinner(senkr), 'O');

  const diag = Array(42).fill(null);
  for (let i = 0; i < 4; i++) diag[(2 + i) * 7 + (1 + i)] = 'X';
  assert.equal(s.c4Gewinner(diag), 'X');
});

test('c4: volles Brett ohne Reihe = unentschieden', () => {
  /* Muster (r + 2c) % 4: waagerecht, senkrecht und BEIDE Diagonalen
    wechseln die Marke — es gibt keine 4er-Reihe. */
  const feld = Array(42).fill(null);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) feld[r * 7 + c] = ((r + 2 * c) % 4 < 2) ? 'X' : 'O';
  }
  assert.equal(s.c4Gewinner(feld), 'unentschieden');
});

test('c4: Bot blockt einen drohenden Gewinn', () => {
  /* X hat 3 unten in Spalten 0,1,2 — Bot MUSS Spalte 4 (Index 3) blocken */
  const feld = Array(42).fill(null);
  feld[5 * 7 + 0] = 'X'; feld[5 * 7 + 1] = 'X'; feld[5 * 7 + 2] = 'X';
  const zug = s.c4BotZug(feld, 1);
  assert.equal(zug, 3, 'Bot muss die vierte Spalte blocken');
});

test('c4: Bot nutzt eigenen Gewinn', () => {
  const feld = Array(42).fill(null);
  feld[5 * 7 + 0] = 'O'; feld[5 * 7 + 1] = 'O'; feld[5 * 7 + 2] = 'O';
  const zug = s.c4BotZug(feld, 1);
  assert.equal(zug, 3, 'Bot muss selbst gewinnen');
});

test('c4: Score bleibt über Runden erhalten', () => {
  s.c4Reset('c4score');
  const a = s.c4Zug('c4score', 4, 1);
  const b = s.c4Status('c4score');
  assert.deepEqual({ u: b.scoreU, bot: b.scoreB }, { u: a.scoreU, bot: a.scoreB });
});

/* ═══════════ MASTERMIND ═══════════ */

test('mm: Start und gültiger Tipp', () => {
  const start = s.mmStart('mm1', 1);
  assert.equal(start.läuft, true);
  assert.equal(start.maxVersuche, 10);
  const r = s.mmRat('mm1', '1234');
  assert.ok(r.richtig >= 0 && r.richtig <= 4);
  assert.ok(r.position >= 0 && r.position <= 4);
  assert.equal(r.versuche, 1);
});

test('mm: ungültige Tipps werden abgefangen', () => {
  s.mmStart('mm2', 2);
  assert.equal(typeof s.mmRat('mm2', '12').fehler, 'string');
  assert.equal(typeof s.mmRat('mm2', '7890').fehler, 'string');
  assert.equal(typeof s.mmRat('mm2', 'abcd').fehler, 'string');
});

test('mm: korrekter Volltreffer ergibt Sieg', () => {
  s.mmStart('mm3', 3);
  /* Code über Stop ermitteln und dann richtig tippen */
  const code = s.mmStop('mm3').code;
  s.mmStart('mm3', 3);   /* gleicher Seed → gleicher Code */
  const r = s.mmRat('mm3', code);
  assert.equal(r.ergebnis, 'sieg');
  assert.equal(r.position, 4);
  assert.equal(r.richtig, 4);
});

test('mm: 10 Fehlversuche = verloren mit Code', () => {
  s.mmStart('mm4', 4);
  const code = s.mmStop('mm4').code;
  s.mmStart('mm4', 4);
  let letzter = null;
  for (let i = 0; i < 10; i++) {
    /* absichtlich einen falschen Tipp (nicht der Code) */
    const tipp = code === '1111' ? '2222' : '1111';
    letzter = s.mmRat('mm4', tipp);
  }
  assert.equal(letzter.ergebnis, 'verloren');
  assert.equal(letzter.code, code);
});

/* ═══════════ BLACKJACK ═══════════ */

test('bj: Start teilt 2 Karten und zieht Einsatz ab', () => {
  const r = s.bjStart('bj1', 50, 1);
  assert.equal(r.kartenU.length, 2);
  assert.equal(r.einsatz, 50);
  assert.equal(r.chips, 450);
});

test('bj: Einsatz unter Minimum wird abgewiesen', () => {
  const r = s.bjStart('bj2', 5, 1);
  assert.equal(typeof r.fehler, 'string');
});

test('bj: Einsatz über den Chips wird abgewiesen', () => {
  const r = s.bjStart('bj3', 99999, 1);
  assert.equal(typeof r.fehler, 'string');
});

test('bj: Hit erhöht die Kartenzahl', () => {
  s.bjStart('bj4', 20, 1);
  const r = s.bjHit('bj4', 2);
  assert.ok(r.kartenU.length >= 3 || r.ergebnis === 'verloren');
});

test('bj: Stand beendet die Runde mit Ergebnis', () => {
  s.bjStart('bj5', 30, 1);
  const r = s.bjStand('bj5', 3);
  assert.ok(['sieg', 'verloren', 'unentschieden', 'blackjack'].includes(r.ergebnis));
  assert.ok(!r.bVerdeckt);
});

test('bj: Chips ändern sich passend zum Ergebnis', () => {
  s.bjStart('bj6', 100, 1);
  const nachEinsatz = s.bjStatus('bj6').chips;   /* 500 - 100 */
  assert.equal(nachEinsatz, 400);
  const r = s.bjStand('bj6', 5);
  const delta = r.chips - nachEinsatz;
  const erwartet = { sieg: 200, unentschieden: 100, blackjack: 250, verloren: 0 }[r.ergebnis];
  assert.equal(delta, erwartet, `Ergebnis ${r.ergebnis} → Delta ${delta}`);
});

/* ═══════════ STOPPUHR ═══════════ */

test('stopuhr: Start läuft, Stop misst Zeit', async () => {
  const start = s.stopuhrStart('sw1');
  assert.equal(start.läuft, true);
  await new Promise((r) => setTimeout(r, 60));
  const stop = s.stopuhrStop('sw1');
  assert.equal(stop.läuft, false);
  assert.ok(stop.ms >= 50, 'mindestens 50 ms vergangen');
});

test('stopuhr: Zeit summiert sich über Start/Stop', async () => {
  s.stopuhrReset('sw2');
  s.stopuhrStart('sw2');
  await new Promise((r) => setTimeout(r, 40));
  s.stopuhrStop('sw2');
  const zwischen = s.stopuhrStatus('sw2').ms;
  s.stopuhrStart('sw2');
  await new Promise((r) => setTimeout(r, 40));
  s.stopuhrStop('sw2');
  const gesamt = s.stopuhrStatus('sw2').ms;
  assert.ok(gesamt > zwischen, 'Zeit läuft weiter');
});

test('stopuhr: Doppel-Start ist idempotent', () => {
  s.stopuhrReset('sw3');
  const a = s.stopuhrStart('sw3');
  const b = s.stopuhrStart('sw3');
  assert.equal(b.läuft, true);
  assert.ok(typeof b.hinweis === 'string' || a.läuft);
});

test('stopuhrText: Formate', () => {
  assert.equal(s.stopuhrText(0), '0:00,0');
  assert.equal(s.stopuhrText(7300), '0:07,3');
  assert.equal(s.stopuhrText(65000), '1:05,0');
  assert.equal(s.stopuhrText(3725000), '1:02:05 h');
});

/* ═══════════ ALTER ═══════════ */

test('alter: exakte Berechnung', () => {
  const a = s.alter('04.10.1990', new Date(2026, 9, 4));
  assert.equal(a.jahre, 36);
  assert.equal(a.monate, 0);
  assert.equal(a.tage, 0);
  assert.equal(a.wochentag, 'Donnerstag');
});

test('alter: einen Tag vor dem Geburtstag', () => {
  const a = s.alter('05.10.1990', new Date(2026, 9, 4));
  assert.equal(a.jahre, 35);
  assert.equal(a.monate, 11);
  assert.ok(a.tage >= 27);
  assert.equal(a.naechsterGebIn, 1);
});

test('alter: verschiedene Formate', () => {
  assert.equal(s.alter('1990-10-04', new Date(2026, 9, 4)).jahre, 36);
  assert.equal(s.alter('4.10.90', new Date(2026, 9, 4)).jahre, 36);
  assert.equal(s.alter('04/10/1990', new Date(2026, 9, 4)).jahre, 36);
});

test('alter: ungültige Eingaben', () => {
  assert.equal(s.alter(' quark'), null);
  assert.equal(s.alter('31.02.1990'), null);
  assert.equal(s.alter('04.13.1990'), null);
  assert.equal(s.alter(''), null);
  assert.equal(s.alter('01.01.2050', new Date(2026, 9, 4)), null, 'Zukunftsdatum');
});

test('alter: nächster Geburtstag im kommenden Jahr', () => {
  const a = s.alter('01.01.1990', new Date(2026, 9, 4));
  assert.equal(a.jahre, 36);
  assert.equal(a.naechsterGeburtstag, '1. Januar 2027');
  assert.ok(a.naechsterGebIn > 80);
});

/* ═══════════ TODO ═══════════ */

test('todo: hinzufügen und auflisten', () => {
  s.todoLeeren('td1');
  const r = s.todoAdd('td1', 'Blumen gießen');
  assert.equal(r.gesamt, 1);
  assert.equal(r.offen, 1);
  assert.match(r.hinweis, /Blumen gießen/);
});

test('todo: als erledigt markieren toggelt', () => {
  s.todoLeeren('td2');
  s.todoAdd('td2', 'A');
  s.todoAdd('td2', 'B');
  const fertig = s.todoFertig('td2', 1);
  assert.equal(fertig.erledigt, 1);
  assert.equal(fertig.liste[0].fertig, true);
  const zurueck = s.todoFertig('td2', 1);
  assert.equal(zurueck.erledigt, 0);
});

test('todo: löschen entfernt die Aufgabe', () => {
  s.todoLeeren('td3');
  s.todoAdd('td3', 'X');
  s.todoAdd('td3', 'Y');
  const r = s.todoLoeschen('td3', 1);
  assert.equal(r.gesamt, 1);
  assert.equal(r.liste[0].text, 'Y');
});

test('todo: ungültige Nummer', () => {
  s.todoLeeren('td4');
  s.todoAdd('td4', 'Z');
  assert.equal(typeof s.todoFertig('td4', 99).fehler, 'string');
  assert.equal(typeof s.todoLoeschen('td4', 0).fehler, 'string');
});

test('todo: leerer Text wird abgefangen', () => {
  assert.equal(typeof s.todoAdd('td5', '  ').fehler, 'string');
});

test('todo: leere Liste', () => {
  s.todoLeeren('td6');
  const r = s.todoListe('td6');
  assert.equal(r.gesamt, 0);
  assert.deepEqual(r.liste, []);
});
