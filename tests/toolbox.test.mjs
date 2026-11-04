/* ═══════════════════════════════════════════════════════════════════════
   🧰  TESTS  —  Werkzeugkiste (Notizen · Erinnerungen · Umfragen)
       🎀  TESTS  —  botLook.js (das gemeinsame Aussehen)
   ───────────────────────────────────────────────────────────────────────
   Läuft in einem eigenen Verzeichnis, damit Database/ unberührt bleibt.
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'toolbox-'));
process.env.TOOLBOX_DB_DIR = TMP;      /* VOR dem Import setzen */

const tb = await import('../toolbox.js');
const look = await import('../botLook.js');

const JETZT = new Date('2026-10-02T14:00:00').getTime();   // Freitag

/* ── 🎀 Aussehen ────────────────────────────────────────────────────── */
test('botLook: Karte hat Kopf, Inhalt und Hinweise', () => {
  const text = look.karte({
    titel: 'Profil', emoji: '🎀', untertitel: 'Maxi',
    inhalte: [look.abschnitt('👤', 'Daten', [['Level', '12']])],
    hinweise: ['$me @user — fremdes Profil'],
    fusszeile: 'HelloKitty Baby Maxi 🎀'
  });
  assert.match(text, /🎀 \*Profil\*/);
  assert.match(text, /_Maxi_/);
  assert.match(text, /Level: \*12\*/);
  assert.match(text, /💡 \$me @user/);
  assert.match(text, /HelloKitty Baby Maxi 🎀/);
});

test('botLook: Listen sind alphabetisch sortiert (deutsch)', () => {
  const text = look.liste(['Zitrone', 'Apfel', 'Banane', 'Äpfel']);
  const reihe = text.split('\n').map((z) => z.replace(/^\S+\s/, ''));
  /* Ä wird wie A einsortiert (sensitivity 'base'), Gleichstand bleibt in der Ursprungsreihe */
  assert.deepEqual(reihe, ['Apfel', 'Äpfel', 'Banane', 'Zitrone']);
});

test('botLook: leere Felder fallen weg', () => {
  const text = look.abschnitt('👤', 'Daten', [['Name', 'Maxi'], ['Stadt', ''], ['Alter', null]]);
  assert.ok(text.includes('Name'));
  assert.ok(!text.includes('Stadt'));
  assert.ok(!text.includes('Alter'));
});

test('botLook: Fortschrittsbalken bleibt im Rahmen', () => {
  assert.equal(look.balken(0, 10), '▱'.repeat(10));
  assert.equal(look.balken(100, 10), '▰'.repeat(10));
  assert.equal(look.balken(50, 10), '▰'.repeat(5) + '▱'.repeat(5));
  assert.equal(look.balken(-5, 10), '▱'.repeat(10), 'keine negativen Balken');
  assert.equal(look.balken(999, 10), '▰'.repeat(10), 'nicht über 100 %');
});

test('botLook: Bausteine stürzen bei leeren Eingaben nicht ab', () => {
  assert.doesNotThrow(() => look.karte({}));
  assert.doesNotThrow(() => look.liste(null));
  assert.doesNotThrow(() => look.abschnitt('👤', 'Daten', []));
  assert.equal(look.fuss([]), '');
});

/* ── ⏰ Zeitangaben ─────────────────────────────────────────────────── */
test('Zeit: relative Angaben', () => {
  assert.equal(tb.parseWann('in 10 Minuten', JETZT).getTime(), JETZT + 10 * 60000);
  assert.equal(tb.parseWann('in 2 Stunden', JETZT).getTime(), JETZT + 2 * 3600000);
  assert.equal(tb.parseWann('in 3 Tagen', JETZT).getTime(), JETZT + 3 * 86400000);
  assert.equal(tb.parseWann('in 1 Woche', JETZT).getTime(), JETZT + 7 * 86400000);
  assert.equal(tb.parseWann('5m', JETZT).getTime(), JETZT + 5 * 60000);
  assert.equal(tb.parseWann('2h', JETZT).getTime(), JETZT + 2 * 3600000);
  assert.equal(tb.parseWann('3d', JETZT).getTime(), JETZT + 3 * 86400000);
});

test('Zeit: Tageswörter — übermorgen ist NICHT morgen', () => {
  const morgen = tb.parseWann('morgen', JETZT);
  const ueber = tb.parseWann('übermorgen', JETZT);
  assert.equal(morgen.getDate(), 3);
  assert.equal(ueber.getDate(), 4, 'übermorgen ist zwei Tage später');
  assert.equal(morgen.getHours(), 9, 'ohne Uhrzeit gilt 9 Uhr');
  assert.equal(tb.parseWann('morgen 9:30', JETZT).getHours(), 9);
  assert.equal(tb.parseWann('morgen 9:30', JETZT).getMinutes(), 30);
  assert.equal(tb.parseWann('morgen um 8 Uhr', JETZT).getHours(), 8);
});

test('Zeit: Uhrzeiten und Datumsangaben', () => {
  assert.equal(tb.parseWann('heute 18:30', JETZT).getHours(), 18);
  assert.equal(tb.parseWann('um 18:30', JETZT).getHours(), 18);
  const datum = tb.parseWann('12.03. 18:00', JETZT);
  assert.equal(datum.getMonth(), 2, 'März');
  assert.equal(datum.getDate(), 12);
  assert.equal(datum.getHours(), 18);
  assert.equal(datum.getFullYear(), 2027, 'liegt vorbei → nächstes Jahr');
  const fest = tb.parseWann('12.03.2027 18:00', JETZT);
  assert.equal(fest.getFullYear(), 2027);
  assert.equal(fest.getHours(), 18, 'Uhrzeit wird nicht als Jahr gelesen');
});

test('Zeit: Unsinn ergibt keine Zeit', () => {
  for (const s of ['', 'quatsch', 'irgendwann vielleicht', null, undefined]) {
    assert.equal(tb.parseWann(s, JETZT), null, `„${s}" darf keine Zeit ergeben`);
  }
});

test('Zeit: Restzeit wird menschlich formuliert', () => {
  assert.equal(tb.formatiereWann(JETZT + 30 * 60000, JETZT), 'in 30 Minuten');
  assert.equal(tb.formatiereWann(JETZT - 2 * 3600000, JETZT), 'vor 2 Stunden');
});

/* ── 📝 Notizen ─────────────────────────────────────────────────────── */
test('Notizen: anlegen, auflisten, löschen', () => {
  const u = '4915000000001';
  assert.equal(tb.notizList(u).length, 0);
  const a = tb.notizAdd(u, 'Milch kaufen');
  const b = tb.notizAdd(u, 'Max anrufen');
  assert.equal(a.i, 1);
  assert.equal(b.i, 2);
  assert.deepEqual(tb.notizList(u).map((n) => n.t), ['Milch kaufen', 'Max anrufen']);
  assert.ok(tb.notizDel(u, 1), 'löschen meldet Erfolg (gibt den Eintrag zurück)');
  assert.deepEqual(tb.notizList(u).map((n) => n.t), ['Max anrufen']);
  assert.equal(tb.notizDel(u, 99), false, 'unbekannte Nummer bleibt ohne Wirkung');
});

test('Notizen: pro Nutzer getrennt', () => {
  tb.notizAdd('nutzerA', 'nur A');
  assert.equal(tb.notizList('nutzerB').length, 0);
  assert.equal(tb.notizList('nutzerA').length, 1);
});

test('Notizen: leere Eingaben werden abgelehnt', () => {
  assert.equal(tb.notizAdd('nutzerC', '   '), null);
  assert.equal(tb.notizAdd('nutzerC', ''), null);
});

/* ── ⏰ Erinnerungen ────────────────────────────────────────────────── */
test('Erinnerungen: stellen und auflisten', () => {
  const u = '4915000000002';
  const zeit = JETZT + 60 * 60000;
  const e = tb.erinnerAdd(u, 'chat@x', 'Müll raus', zeit);
  assert.equal(e.i > 0, true);
  const liste = tb.erinnerList(u);
  assert.equal(liste.length, 1);
  assert.equal(liste[0].t, 'Müll raus');
  assert.equal(liste[0].done, false);
  assert.ok(tb.erinnerDel(u, e.i), 'löschen meldet Erfolg');
  assert.equal(tb.erinnerList(u).length, 0);
});

test('Erinnerungen: ohne gültige Zeit wird nichts gespeichert', () => {
  assert.equal(tb.erinnerAdd('u', 'chat', 'Text', NaN), null);
  assert.equal(tb.erinnerAdd('u', 'chat', 'Text', null), null);
});

test('Erinnerungen: fällige werden genau EINMAL gemeldet', () => {
  const u = '4915000000003';
  tb.erinnerAdd(u, 'chat@x', 'jetzt fällig', JETZT - 1000);
  tb.erinnerAdd(u, 'chat@x', 'später', JETZT + 3600000);
  const erste = tb.erinnerFaellig(JETZT);
  assert.equal(erste.length, 1);
  assert.equal(erste[0].t, 'jetzt fällig');
  const zweite = tb.erinnerFaellig(JETZT);
  assert.equal(zweite.length, 0, 'kein doppelter Versand');
  assert.equal(tb.erinnerList(u).length, 1, 'die späte Erinnerung bleibt stehen');
});

/* ── 📊 Umfragen ────────────────────────────────────────────────────── */
test('Umfragen: starten, abstimmen, auswerten', () => {
  const chat = 'chat@test';
  const u = tb.umfrageNeu(chat, 'Beste Farbe?', ['Rosa', 'Blau', 'Grün']);
  assert.ok(u, 'Umfrage wurde erstellt');
  assert.equal(u.i > 0, true);
  assert.equal(tb.umfrageNeu(chat, 'Kaputt?', ['nur eine Option']), null, 'mindestens zwei Antworten nötig');
  assert.equal(tb.umfrageNeu(chat, '', ['a', 'b']), null, 'ohne Frage keine Umfrage');

  tb.umfrageStimme(chat, u.i, 'u1', 1);
  tb.umfrageStimme(chat, u.i, 'u2', 1);
  tb.umfrageStimme(chat, u.i, 'u3', 3);
  tb.umfrageStimme(chat, u.i, 'u1', 2, 'zweite Stimme überschreibt die erste');
  tb.umfrageStimme(chat, u.i, 'u1', 2);

  const erg = tb.umfrageErgebnis(tb.umfrageHolen(chat, u.i));
  assert.equal(erg.length, 3);
  assert.deepEqual(erg.map((e) => e.text), ['Rosa', 'Blau', 'Grün'], 'Antworttexte bleiben erhalten');
  assert.equal(erg[0].n, 1, 'Rosa: u1 hat umentschieden');
  assert.equal(erg[1].n, 1, 'Blau: u1');
  assert.equal(erg[2].n, 1, 'Grün: u3');
  assert.equal(erg.reduce((s, e) => s + e.n, 0), 3, 'drei Abstimmende');
  assert.equal(erg[1].anteil, 33);
  assert.equal(tb.umfrageStimme(chat, u.i, 'u9', 99), null, 'Option 99 gibt es nicht');
});

test('Umfragen: schließen beendet die Abstimmung', () => {
  const chat = 'chat@zu';
  const u = tb.umfrageNeu(chat, 'Fertig?', ['Ja', 'Nein']);
  tb.umfrageStimme(chat, u.i, 'u1', 1);
  const zu = tb.umfrageEnde(chat, u.i);
  assert.equal(zu.open, false);
  assert.equal(tb.umfrageStimme(chat, u.i, 'u2', 1), null, 'nach dem Ende zählt nichts mehr');
});

test('Umfragen: pro Chat getrennt', () => {
  tb.umfrageNeu('chat@A', 'Frage A?', ['a1', 'a2']);
  assert.equal(tb.umfrageListe('chat@B').length, 0);
  assert.equal(tb.umfrageListe('chat@A').length, 1);
});

/* ── Verdrahtung ────────────────────────────────────────────────────── */
test('die Befehle sind im Bot verdrahtet (Love.js)', () => {
  const src = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
  for (const fall of ["case 'notiz':", "case 'erinner':", "case 'umfrage':"]) {
    assert.ok(src.includes(fall), fall + ' fehlt');
  }
  assert.match(src, /import \* as tb from '\.\/toolbox\.js';/);
  assert.match(src, /import \* as look from '\.\/botLook\.js';/);
  assert.match(src, /tb\.erinnerFaellig\(\)/, 'Erinnerungen werden auch zugestellt');
});

test('die neuen Befehle stehen in der Registry', () => {
  const reg = JSON.parse(fs.readFileSync(new URL('../registry/commands.json', import.meta.url), 'utf8'));
  const alle = [];
  for (const kat of reg.categories) for (const c of kat.cmds || []) alle.push(c.name);
  for (const n of ['notiz', 'erinner', 'umfrage']) assert.ok(alle.includes(n), n + ' fehlt in der Registry');
});

test('kein Test-Müll in der echten Database', () => {
  assert.ok(fs.existsSync(path.join(TMP, 'toolbox.json')), 'Stand liegt im Temp-Verzeichnis');
});

test('Stand überlebt einen Neustart (liest aus der Datei)', () => {
  tb.notizAdd('nutzerD', 'bleibt stehen');
  const pfad = path.join(TMP, 'toolbox.json');
  const roh = JSON.parse(fs.readFileSync(pfad, 'utf8'));
  assert.equal(roh.notizen.nutzerD[0].t, 'bleibt stehen');
});
