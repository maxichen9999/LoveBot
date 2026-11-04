/* ═══════════════════════════════════════════════════════════════════════
   🧮  TESTS  —  rechner.js  (Terme rechnen · Einheiten umrechnen)
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const r = await import('../rechner.js');

/* ── Terme ──────────────────────────────────────────────────────────── */
test('Rechner: Punkt vor Strich und Klammern', () => {
  assert.equal(r.rechne('2+3*4').ergebnis, 14);
  assert.equal(r.rechne('(2+3)*4').ergebnis, 20);
  assert.equal(r.rechne('((2+3)*(4-1))/5').ergebnis, 3);
});

test('Rechner: Potenzen, Rest, Vorzeichen', () => {
  assert.equal(r.rechne('2^10').ergebnis, 1024);
  assert.equal(r.rechne('2**10').ergebnis, 1024, 'auch Python-Schreibweise');
  assert.equal(r.rechne('2^3^2').ergebnis, 512, 'von rechts geklammert');
  assert.equal(r.rechne('7%3').ergebnis, 1);
  assert.equal(r.rechne('-5+8').ergebnis, 3);
});

test('Rechner: Funktionen und Konstanten', () => {
  assert.equal(r.rechne('wurzel(144)').ergebnis, 12);
  assert.equal(r.rechne('abs(-7)').ergebnis, 7);
  assert.equal(r.rechne('runden(2.4)').ergebnis, 2);
  assert.equal(r.rechne('aufrunden(2.1)').ergebnis, 3);
  assert.equal(r.rechne('abrunden(2.9)').ergebnis, 2);
  assert.equal(r.rechne('runden(pi * 100) / 100').ergebnis, 3.14);
  assert.equal(r.rechne('ln(e)').ergebnis, 1);
});

test('Rechner: deutsche Komma-Zahlen und Malzeichen', () => {
  assert.equal(r.rechne('2,5 + 2,5').ergebnis, 5);
  assert.equal(r.rechne('3 × 4').ergebnis, 12);
  assert.equal(r.rechne('12 ÷ 4').ergebnis, 3);
});

test('Rechner: Fehler werden freundlich gemeldet, nicht als Absturz', () => {
  assert.equal(r.rechne('1/0').ok, false);
  assert.equal(r.rechne('(2+3').ok, false, 'offene Klammer');
  assert.equal(r.rechne('').ok, false);
  assert.equal(r.rechne('   ').ok, false);
  assert.equal(r.rechne('2 + ').ok, false);
  assert.match(r.rechne('1/0').fehler, /null/);
});

/* 🔒 Wichtig: aus einem Befehl heraus darf kein Code laufen */
test('Rechner: Sicherheitsprobe — kein Code läuft mit', () => {
  const gefaehrlich = [
    'process.exit(1)',
    'console.log(1)',
    'require("fs")',
    'globalThis',
    'eval(1+1)',
    'constructor',
    'function(){}',
    '1;process.exit(1)',
    'while(1){}',
    'import("fs")'
  ];
  for (const b of gefaehrlich) {
    const erg = r.rechne(b);
    assert.equal(erg.ok, false, `"${b}" darf nicht gerechnet werden`);
    assert.equal(erg.ergebnis, undefined);
  }
});

test('Rechner: Ausgabe ist deutsch formatiert', () => {
  assert.equal(r.formatiereZahl(1234567.891), '1.234.567,891');
  assert.equal(r.formatiereZahl(2.5), '2,5');
  assert.equal(r.formatiereZahl(3), '3');
  assert.equal(r.formatiereZahl(Infinity), '—');
  assert.equal(r.rechne('2^10').text, '1.024');
});

/* ── Einheiten ──────────────────────────────────────────────────────── */
test('Umrechner: Länge und Gewicht', () => {
  assert.equal(r.umrechneText('5 km in m').text, '5 km = 5.000 m');
  assert.equal(r.umrechneText('1000 g in kg').text, '1.000 g = 1 kg');
  assert.equal(r.umrechneText('1,80 m in fuss').ergebnis.toFixed(2), '5.91');
  assert.equal(r.umrechneText('10 cm in mm').ergebnis, 100);
  assert.equal(r.umrechneText('1 meile in m').ergebnis, 1609.344);
});

test('Umrechner: Temperatur rechnet richtig herum', () => {
  assert.equal(r.umrechneText('20 °C in F').ergebnis, 68);
  assert.equal(r.umrechneText('0 c in f').ergebnis, 32);
  assert.equal(r.umrechneText('0 c in k').ergebnis, 273.15);
  assert.equal(r.umrechneText('100 f in c').ergebnis.toFixed(1), '37.8');
  assert.equal(r.umrechneText('20 °C in F').text, '20 °C = 68 °F');
});

test('Umrechner: Zeit, Volumen, Geschwindigkeit', () => {
  assert.equal(r.umrechneText('2,5 h in min').ergebnis, 150);
  assert.equal(r.umrechneText('2 wochen in stunden').ergebnis, 336);
  assert.equal(r.umrechneText('3 l in ml').ergebnis, 3000);
  assert.equal(r.umrechneText('90 km/h in mph').ergebnis.toFixed(1), '55.9');
});

test('Umrechner: Schreibweise der Nutzerin bleibt erhalten', () => {
  const erg = r.umrechneText('2 wochen in stunden');
  assert.match(erg.text, /^2 wochen = 336 stunden$/);
});

test('Umrechner: Unsinn und Falschkombinationen', () => {
  assert.equal(r.umrechneText('5 km in kg').ok, false, 'Länge in Gewicht geht nicht');
  assert.match(r.umrechneText('5 km in kg').fehler, /passen nicht zusammen/);
  assert.equal(r.umrechneText('5 quatsch in m').ok, false);
  assert.equal(r.umrechneText('').ok, false);
  assert.equal(r.umrechneText('5 km').ok, false, 'Zieleinheit fehlt');
  assert.equal(r.umrechneText('abc in m').ok, false);
});

test('Umrechner: Übersicht listet alle Bereiche', () => {
  const ue = r.einheitenUebersicht();
  const namen = ue.map((k) => k.name);
  for (const erwartet of ['Länge', 'Gewicht', 'Temperatur', 'Zeit', 'Volumen', 'Geschwindigkeit']) {
    assert.ok(namen.includes(erwartet), erwartet + ' fehlt in der Übersicht');
  }
  for (const kat of ue) assert.ok(kat.einheiten.length > 0, kat.name + ' hat keine Einheiten');
});

/* ── Verdrahtung ────────────────────────────────────────────────────── */
test('$rechner und $umrechnen sind im Bot verdrahtet', () => {
  const src = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
  for (const fall of ["case 'rechner':", "case 'umrechnen':"]) assert.ok(src.includes(fall), fall + ' fehlt');
  assert.match(src, /import \* as rech from '\.\/rechner\.js';/);
  assert.ok(!src.includes('argsRaw'), 'keine unbekannte Variable mehr im Code');
});

test('die zwei Befehle stehen in der Registry', () => {
  const reg = JSON.parse(fs.readFileSync(new URL('../registry/commands.json', import.meta.url), 'utf8'));
  const alle = [];
  for (const kat of reg.categories) for (const c of kat.cmds || []) alle.push(c.name);
  for (const n of ['rechner', 'umrechnen']) assert.ok(alle.includes(n), n + ' fehlt in der Registry');
});
