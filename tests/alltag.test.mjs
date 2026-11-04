/* ═══════════════════════════════════════════════════════════════════════
   🌸  TESTS  —  alltag.js (Entscheiden · Teilen · Farben · Prozent · Glück)
       und die fröhliche Stimmung des Bots
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'botstyle-'));
process.env.BOTSTYLE_DB = TMP;      /* wird von botStyle.js gelesen (falls unterstützt) */

const a = await import('../alltag.js');
const look = await import('../botLook.js');

/* ── 🌸 Entscheiden ─────────────────────────────────────────────────── */
test('Entscheiden: eine aus der Liste, und wirklich eine davon', () => {
  const optionen = ['Pizza', 'Pasta', 'Salat'];
  for (let i = 0; i < 25; i++) {
    const erg = a.entscheide(optionen);
    assert.ok(optionen.includes(erg.wahl), 'die Wahl muss aus der Liste stammen');
    assert.equal(erg.anzahl, 3);
  }
  assert.equal(a.entscheide(['nur eine']), null, 'eine Möglichkeit ist keine Entscheidung');
  assert.equal(a.entscheide([]), null);
});

/* ── 💶 Rechnung teilen ─────────────────────────────────────────────── */
test('Teilen: Betrag, Personen und Trinkgeld', () => {
  const erg = a.teile('45,60', 3, 10);
  assert.equal(erg.betrag, 45.6);
  assert.equal(erg.trinkgeld, 4.56);
  assert.equal(erg.gesamt, 50.16);
  assert.equal(erg.proPerson, 16.72);
  assert.match(erg.text, /16,72/);
});

test('Teilen: ohne Trinkgeld passt es trotzdem', () => {
  const erg = a.teile(30, 4);
  assert.equal(erg.proPerson, 7.5);
  assert.equal(erg.trinkgeld, 0);
});

test('Teilen: Unsinn wird abgewiesen', () => {
  assert.equal(a.teile('abc', 3), null);
  assert.equal(a.teile(30, 0), null, 'null Personen geht nicht');
  assert.equal(a.teile(-5, 3), null);
  assert.equal(a.teile(30, 'x'), null);
});

/* ── 🎨 Farben ──────────────────────────────────────────────────────── */
test('Farbe: Namen, Hex und RGB werden verstanden', () => {
  const rosa = a.farbeInfo('rosa');
  assert.equal(rosa.hex, '#ffc0cb');
  assert.deepEqual(rosa.rgb, { r: 255, g: 192, b: 203 });
  assert.equal(rosa.textAufFarhe, 'schwarz', 'auf hellem Rosa liest man schwarz');

  const blau = a.farbeInfo('#1e3a8a');
  assert.equal(blau.hex, '#1e3a8a');
  assert.equal(blau.hsl.h, 224);
  assert.equal(blau.textAufFarhe, 'weiß', 'auf Dunkelblau liest man weiß');

  const rgb = a.farbeInfo('rgb(255, 0, 128)');
  assert.equal(rgb.hex, '#ff0080');
  assert.equal(a.farbeInfo('#abc').hex, '#aabbcc', 'Kurzform #abc wird ergänzt');
});

test('Farbe: Unbekanntes ergibt keine Farbe', () => {
  for (const wert of ['', 'lila-gelb-gestreift', '#xyz', 'rgb(300,0,0)', '   ']) {
    assert.equal(a.farbeInfo(wert), null, `"${wert}" darf keine Farbe ergeben`);
  }
});

/* ── 📊 Prozent ─────────────────────────────────────────────────────── */
test('Prozent: die drei häufigsten Rechnungen', () => {
  assert.equal(a.prozentText('19 % von 84').text, '19 % von 84 = 15,96');
  assert.equal(a.prozentText('wie viel prozent sind 12 von 80').text, '12 von 80 = 15 %');
  assert.equal(a.prozentText('84 + 19 %').text, '84 + 19 % = 99,96');
  /* keine Sternchen — das Fette macht die Karte, sonst verschachtelt es */
  assert.equal(/\*/.test(a.prozentText('19 % von 84').text), false);
  assert.match(a.prozentText('84 minus 19%').text, /68,04/);
  assert.equal(a.prozentText('quatsch').ok, false);
  assert.equal(a.prozentText('').ok, false);
});

/* ── 🍀 Glück ───────────────────────────────────────────────────────── */
test('Glück: fester Spruch bleibt am selben Tag gleich', () => {
  const datum = new Date(2026, 9, 2);
  assert.equal(a.glueck({ datum, fest: true }), a.glueck({ datum, fest: true }));
  const morgen = new Date(2026, 9, 3);
  const spruchHeute = a.glueck({ datum, fest: true });
  const spruchMorgen = a.glueck({ datum: morgen, fest: true });
  assert.equal(spruchHeute === spruchMorgen, false, 'am nächsten Tag ein anderer Spruch');
});

test('Glück: alle Sprüche sind freundlich und nicht leer', () => {
  assert.ok(a.ALLE_SPRUECHE.length >= 10);
  for (const s of a.ALLE_SPRUECHE) {
    assert.ok(s.trim().length > 10, 'kein leerer Spruch');
    assert.equal(/\btraurig\b|\beinsam\b|\bverletzt\b|niemand antwortet|keiner schreibt|alles tut weh|\bweint\b|hoffnungslos/i.test(s), false, 'keine traurigen Wörter: ' + s);
  }
});

/* ── 🌸 Fröhliche Stimmung ──────────────────────────────────────────── */
test('Der Bot ist auf „happy“ gestellt', () => {
  const datei = new URL('../Database/botstyle.json', import.meta.url);
  const stil = JSON.parse(fs.readFileSync(datei, 'utf8'));
  assert.equal(stil.mood, 'happy', 'der Bot soll fröhlich sein');
  assert.equal(stil.autoReactions, false, 'automatische Reaktionen bleiben aus (Runde 3)');
  assert.equal(stil.helloKitty, true, 'Hello Kitty bleibt an');
});

test('Erfolgsmeldungen klingen fröhlich', () => {
  const text = look.ok('Notiz gespeichert');
  assert.match(text, /Notiz gespeichert/, 'die Aussage bleibt erhalten');
  assert.match(text, /Geschafft|Erledigt|Gemacht|Klar/, 'fröhlicher Auftakt fehlt');
});

test('Fehlermeldungen bleiben freundlich', () => {
  const text = look.fehler('Das habe ich nicht verstanden.');
  assert.match(text, /Das habe ich nicht verstanden/);
  assert.match(text, /nochmal versuchen|🌸/, 'freundlicher Ton fehlt');
});

test('Karten können eine Aufmunterung anhängen', () => {
  const mit = look.karte({ titel: 'Test', inhalte: ['x'], froh: true, fusszeile: 'Fuss' });
  const ohne = look.karte({ titel: 'Test', inhalte: ['x'], fusszeile: 'Fuss' });
  assert.ok(mit.length > ohne.length, 'fröhliche Karte ist länger');
  assert.match(mit, /🌸|☀️|🎀|⭐|🌷|🍀|💗/);
  const gruss = look.gruss();
  assert.ok(gruss.length > 0, 'ein Gruß wird erzeugt');
});

test('Die Listen im Bot sind fröhlich, nicht traurig', () => {
  const src = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
  const verboten = /niemand antwortet|keiner schreibt|alles tut weh|\beinsam\b|\bverletzt\b|\btraurig\b|\bweint\b|hoffnungslos/i;
  for (const name of ['EIGHTBALL_ANSWERS', 'LOVEBOT_COMPLIMENTS', 'KISS_PHRASES', 'HUG_PHRASES', 'KILL_PHRASES', 'SLAP_PHRASES', 'ROAST_LINES', 'CUDDLE_IDEAS']) {
    const treffer = src.match(new RegExp('const ' + name + ' = \\[([\\s\\S]*?)\\];'));
    assert.ok(treffer, name + ' nicht gefunden');
    assert.equal(verboten.test(treffer[1]), false, name + ' enthält noch traurige Wörter');
  }
});

/* ── Verdrahtung ────────────────────────────────────────────────────── */
test('die fünf neuen Befehle sind im Bot verdrahtet', () => {
  const src = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
  for (const fall of ["case 'entscheide':", "case 'teile':", "case 'farbe':", "case 'prozent':", "case 'glück':"]) {
    assert.ok(src.includes(fall), fall + ' fehlt');
  }
  assert.match(src, /import \* as alltag from '\.\/alltag\.js';/);
});

test('die neuen Befehle stehen in der Registry', () => {
  const reg = JSON.parse(fs.readFileSync(new URL('../registry/commands.json', import.meta.url), 'utf8'));
  const alle = [];
  for (const kat of reg.categories) for (const c of kat.cmds || []) alle.push(c.name);
  for (const n of ['entscheide', 'teile', 'farbe', 'prozent', 'glück']) {
    assert.ok(alle.includes(n), n + ' fehlt in der Registry');
  }
});

test('WhatsApp-Upserts werden pro Session dedupliziert', () => {
  const src = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
  const handler = src.indexOf("sock.ev.on('messages.upsert'");
  const dedupe = src.indexOf("seenOnce(msg, 'upsert:' + SESSION_ID)", handler);
  const ownerSideEffect = src.indexOf('rememberOwnerGroup(msg)', handler);
  assert.ok(handler >= 0 && dedupe > handler && dedupe < ownerSideEffect, 'Dedupe muss vor Upsert-Nebenwirkungen laufen');
});

test('WhatsApp-Steuerereignisse erzeugen keine leeren Auto-Antworten', () => {
  const src = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
  const handler = src.indexOf("sock.ev.on('messages.upsert'");
  const filter = src.indexOf('contentTypes.every((type) => SKIP_CONTENT_TYPES.has(type))', handler);
  const emptyReply = src.indexOf("kittyAlwaysReply(sock, msg, from, ''", handler);
  assert.ok(filter > handler && filter < emptyReply, 'Steuerereignisse müssen vor dem leeren Medien-Fallback herausfallen');
});

test('Kitty-Auto-Reaktionen nutzen den zentralen Reaktionsschalter', () => {
  const src = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
  const start = src.indexOf('async function kittyAlwaysReply(');
  const end = src.indexOf('function kittyActionImage(', start);
  const kittyReply = src.slice(start, end);
  assert.match(kittyReply, /await sendReaction\(sock, from, emoji, msg\.key\)/);
  assert.doesNotMatch(kittyReply, /sock\.sendMessage\(from, \{ react:/);
});

