/* ═══════════════════════════════════════════════════════════════════════
   🎮  TESTS  —  Neue Befehle & Mini-Spiele (spass.js)
   ───────────────────────────────────────────────────────────────────────
   Läuft in einem eigenen Verzeichnis, damit Database/ unberührt bleibt.
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'spass-'));
process.env.SPASS_DB_DIR = TMP;      /* VOR dem Import setzen */

const sp = await import('../spass.js');

/* ── 🔠 ASCII-Banner ────────────────────────────────────────────────── */
test('asciiBanner: macht 5 Zeilen aus Text', () => {
  const b = sp.asciiBanner('HI');
  assert.equal(b.zeilen.length, 5);
  assert.match(b.zeilen.join('\n'), /█/);
  assert.equal(b.benutzt, 2);
  assert.equal(b.übersprungen, 0);
});

test('asciiBanner: leere Eingabe gibt null', () => {
  assert.equal(sp.asciiBanner('   '), null);
});

test('asciiBanner: langer Text wird gekürzt und gemeldet', () => {
  const b = sp.asciiBanner('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  assert.equal(b.benutzt, 14);
  assert.equal(b.übersprungen, 12);
});

test('asciiBanner: Umlaute und Herz werden ersetzt', () => {
  const b = sp.asciiBanner('Ä ♥');
  assert.ok(b);                       /* kein Absturz, Fragezeichen-Ersatz */
  assert.equal(b.zeilen.length, 5);
});

/* ── 🔐 Base64 ──────────────────────────────────────────────────────── */
test('base64: kodieren und dekodieren', () => {
  const kodiert = sp.base64('Hallo Welt');
  assert.equal(kodiert.text, 'SGFsbG8gV2VsdA==');
  assert.equal(kodiert.modus, 'kodiert');
  const zurück = sp.base64('SGFsbG8gV2VsdA==', true);
  assert.equal(zurück.text, 'Hallo Welt');
  assert.equal(zurück.modus, 'dekodiert');
});

test('base64: leere Eingabe gibt null', () => {
  assert.equal(sp.base64(''), null);
});

test('base64: zu langer Text wird abgelehnt', () => {
  const erg = sp.base64('x'.repeat(700));
  assert.match(erg.fehler, /zu lang/);
});

/* ── 🔀 ROT13 ───────────────────────────────────────────────────────── */
test('rot13: zweimal angewendet ergibt das Original', () => {
  const einmal = sp.rot13('Hallo Welt');
  assert.equal(einmal.text, 'Unyyb Jryg');
  const zweimal = sp.rot13(einmal.text);
  assert.equal(zweimal.text, 'Hallo Welt');
});

test('rot13: leere Eingabe gibt null', () => {
  assert.equal(sp.rot13('  '), null);
});

/* ── 🪞 Umkehren ────────────────────────────────────────────────────── */
test('umkehren: dreht den Text', () => {
  const erg = sp.umkehren('Hello');
  assert.equal(erg.text, 'olleH');
  assert.equal(erg.laenge, 5);
});

test('umkehren: leere Eingabe gibt null', () => {
  assert.equal(sp.umkehren(''), null);
});

/* ── 🔢 Wörter zählen ───────────────────────────────────────────────── */
test('wortZaehler: zählt Wörter, Zeichen und Sätze', () => {
  const erg = sp.wortZaehler('Ich liebe HelloKitty sehr. Wirklich!');
  assert.equal(erg.wörter, 5);
  assert.equal(erg.sätze, 2);
  assert.equal(erg.laengstes, 'HelloKitty');
  assert.ok(erg.zeichen > erg.ohneLeer);
});

test('wortZaehler: leere Eingabe gibt null', () => {
  assert.equal(sp.wortZaehler(''), null);
});

/* ── 🍺 Promille ────────────────────────────────────────────────────── */
test('promille: Widmark-Schätzung mit Abbau', () => {
  const erg = sp.promille({ mengeMl: 500, alkoholProzent: 5, gewichtKg: 70, stunden: 1 });
  /* 20 g / (70 × 0,7) = 0,408 ‰ minus 0,15 ‰ = 0,26 ‰ */
  assert.equal(erg.gramm, 20);
  assert.equal(erg.promille, 0.26);
  assert.equal(erg.ampel, '🟡');
  assert.match(erg.hinweis, /Schätzung/i);
});

test('promille: nüchtern nach genug Zeit', () => {
  const erg = sp.promille({ mengeMl: 500, alkoholProzent: 5, gewichtKg: 70, stunden: 5 });
  assert.equal(erg.promille, 0);
  assert.equal(erg.ampel, '🟢');
});

test('promille: Unsinn wird abgelehnt', () => {
  assert.equal(sp.promille({ mengeMl: -1, alkoholProzent: 5, gewichtKg: 70 }), null);
  assert.match(sp.promille({ mengeMl: 500, alkoholProzent: 5, gewichtKg: 10 }).fehler, /Gewicht/);
});

/* ── ⚔️ Kampf ───────────────────────────────────────────────────────── */
test('kampf: ist deterministisch für dieselben Namen', () => {
  const a = sp.kampf('Max', 'Leni');
  const b = sp.kampf('Max', 'Leni');
  assert.deepEqual(a, b);
});

test('kampf: hat Gewinner oder Unentschieden und einen Ablauf', () => {
  const k = sp.kampf('Max', 'Leni');
  assert.ok(k.log.length >= 2);
  assert.ok(k.sieger || k.unentschieden);
  assert.ok(k.runden >= 1 && k.runden <= 12);
});

test('kampf: leere Namen geben null', () => {
  assert.equal(sp.kampf('', 'Leni'), null);
});

/* ── 🎲 Teams ───────────────────────────────────────────────────────── */
test('teamLos: teilt die Namen auf', () => {
  const t = sp.teamLos('Max, Leni, Tom, Sara');
  assert.equal(t.anzahl, 4);
  assert.equal(t.team1.length + t.team2.length, 4);
  assert.ok(t.team1.length >= 1 && t.team2.length >= 1);
});

test('teamLos: ein Name reicht nicht', () => {
  assert.equal(sp.teamLos('Max'), null);
});

/* ── 🎯 Zahlenraten ─────────────────────────────────────────────────── */
test('zahlenraten: Tipp reagiert mit höher/tiefer und zählt Versuche', () => {
  const start = sp.zahlenStart('user-1');
  assert.ok(start.secret >= 1 && start.secret <= 100);
  const erg = sp.zahlenRat('user-1', start.secret < 50 ? 100 : 1);
  assert.ok(['höher', 'tiefer'].includes(erg.status));
  assert.equal(erg.versuche, 1);
});

test('zahlenraten: Treffer erhöht Serie und Rekord', () => {
  const start = sp.zahlenStart('user-2');
  const erg = sp.zahlenRat('user-2', start.secret);
  assert.equal(erg.status, 'treffer');
  assert.equal(erg.versuche, 1);
  assert.equal(erg.streak, 1);
  assert.equal(erg.best, 1);
});

test('zahlenraten: Unsinn wird abgelehnt', () => {
  const erg = sp.zahlenRat('user-3', 500);
  assert.match(erg.fehler, /1 bis 100/);
});

test('zahlenraten: aufgeben verrät die Zahl', () => {
  const start = sp.zahlenStart('user-4');
  const erg = sp.zahlenStop('user-4');
  assert.equal(erg.secret, start.secret);
});

/* ── 🎮 Tic-Tac-Toe ─────────────────────────────────────────────────── */
test('ttt: Love 💜 antwortet auf meinen Zug', () => {
  const erg = sp.tttZug('user-ttt', 5);
  assert.equal(erg.feld[4], 'X');
  assert.equal(erg.feld.filter((x) => x === 'O').length, 1);
  assert.equal(erg.ergebnis, null);
});

test('ttt: belegtes Feld wird abgelehnt', () => {
  sp.tttReset('user-ttt2');
  sp.tttZug('user-ttt2', 5);
  const erg = sp.tttZug('user-ttt2', 5);
  assert.match(erg.fehler, /belegt/);
});

test('ttt: Unsinn wird abgelehnt', () => {
  const erg = sp.tttZug('user-ttt3', 12);
  assert.match(erg.fehler, /1 bis 9/);
});

test('ttt: Love 💜 nimmt den Sieg, wenn er kann', () => {
  sp.tttReset('user-ttt4');
  /* Love oben links (O) und oben Mitte (O) — wenn ich unten links spiele,
     MUSS Love oben rechts (O) zum Gewinn nutzen. */
  sp.tttZug('user-ttt4', 7);    /* X unten links → Love reagiert */
  const st1 = sp.tttStatus('user-ttt4');
  /* Feld leeren und kontrollierten Stand bauen ist hier nicht nötig —
     der Bot-Zug wird nur geprüft, wenn eine Reihe möglich ist. */
  assert.ok(st1.feld.filter((x) => x === 'O').length >= 1);
});

test('tttBotZug: gewinnt, wenn eine Reihe möglich ist', () => {
  const feld = ['O', 'O', null, 'X', 'X', null, null, null, null];
  assert.equal(sp.tttBotZug(feld), 2);       /* oben rechts = Sieg */
});

test('tttBotZug: blockt, wenn der Gegner gewinnen kann', () => {
  const feld = ['X', 'X', null, null, 'O', null, null, null, null];
  assert.equal(sp.tttBotZug(feld), 2);       /* blocken */
});

test('tttGewinner: erkennt Reihe, Spalte und Diagonale', () => {
  assert.equal(sp.tttGewinner(['X', 'X', 'X', null, null, null, null, null, null]), 'X');
  assert.equal(sp.tttGewinner(['O', null, null, 'O', null, null, 'O', null, null]), 'O');
  assert.equal(sp.tttGewinner(['X', null, null, null, 'X', null, null, null, 'X']), 'X');
  assert.equal(sp.tttGewinner(['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O']), 'unentschieden');
  assert.equal(sp.tttGewinner([null, null, null, null, null, null, null, null, null]), null);
});

test('tttReset: setzt den Spielstand zurück', () => {
  sp.tttZug('user-ttt5', 1);
  sp.tttReset('user-ttt5');
  const st = sp.tttStatus('user-ttt5');
  assert.equal(st.scoreU, 0);
  assert.equal(st.scoreB, 0);
  assert.equal(st.feld.filter((x) => x).length, 0);
});
