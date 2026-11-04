/* ═══════════════════════════════════════════════════════════════════════
   🧪 TESTS für spass3.js — Glückskeks · Zungenbrecher · Sprüche ·
      Motivation · Changelog · Kalenderwoche · Farbverlauf
   Aufruf: node --test tests/spass3.test.mjs
   ═══════════════════════════════════════════════════════════════════════ */

import test from 'node:test';
import assert from 'node:assert/strict';

const s = await import('../spass3.js');

/* ═══════════ GLÜCKSKEKS ═══════════ */

test('glueckskeks: Spruch, Glück und 6 eindeutige Zahlen 1–49', () => {
  const k = s.glueckskeks('maxi');
  assert.ok(k.spruch.length > 10);
  assert.match(k.glueck, /:/);
  assert.equal(k.zahlen.length, 6);
  assert.equal(new Set(k.zahlen).size, 6, 'keine Doppelten');
  assert.ok(k.zahlen.every((z) => z >= 1 && z <= 49));
  assert.deepEqual([...k.zahlen].sort((a, b) => a - b), k.zahlen, 'aufsteigend sortiert');
});

test('glueckskeks: gleicher Tag + Schlüssel → gleicher Keks', () => {
  const tag = new Date(2026, 9, 4);
  const a = s.glueckskeks('maxi', tag);
  const b = s.glueckskeks('maxi', tag);
  assert.equal(a.spruch, b.spruch);
  assert.deepEqual(a.zahlen, b.zahlen);
  assert.equal(a.datum, '2026-10-04');
});

test('glueckskeks: anderer Tag → anderer Keks (fast immer)', () => {
  const a = s.glueckskeks('maxi', new Date(2026, 9, 4));
  const b = s.glueckskeks('maxi', new Date(2026, 9, 5));
  assert.notEqual(a.datum, b.datum);
  /* statistisch kann beides mal gleich sein — dann Zahlen vergleichen */
  assert.ok(a.spruch !== b.spruch || JSON.stringify(a.zahlen) !== JSON.stringify(b.zahlen));
});

/* ═══════════ ZUNGENBRECHER ═══════════ */

test('zungenbrecher: gibt einen Satz zurück', () => {
  const z = s.zungenbrecher('r1');
  assert.ok(z.length > 15);
  assert.match(z, /[a-zäöüß]/i);
});

test('zungenbrecher: verschiedene Runden können verschieden sein', () => {
  const alle = new Set();
  for (let i = 0; i < 30; i++) alle.add(s.zungenbrecher('r' + i));
  assert.ok(alle.size >= 3, `nur ${alle.size} verschiedene — zu wenig Abwechselung`);
});

/* ═══════════ SPRÜCHE ═══════════ */

test('spruch: Text und Quelle', () => {
  const p = s.spruch('tag');
  assert.ok(p.text.length > 10);
  assert.ok(p.von.length > 2);
});

test('spruch: stabil pro Tag', () => {
  const tag = new Date(2026, 9, 4);
  assert.equal(s.spruch('tag', tag).text, s.spruch('tag', tag).text);
});

/* ═══════════ MOTIVATION ═══════════ */

test('motivation: lang und kurz', () => {
  assert.ok(s.motivation().length > 15);
  assert.ok(s.motivation(true).length > 5);
});

test('motivation: kurze sind kürzer als lange', () => {
  /* über mehrere Runden prüfen */
  for (let i = 0; i < 20; i++) {
    assert.ok(s.motivation(true).length < 60);
  }
});

/* ═══════════ CHANGELOG ═══════════ */

test('changelog: neueste Einträge zuerst', () => {
  const c = s.changelog();
  assert.ok(c.length >= 3);
  assert.equal(c[0].titel, 'Love wird schlauer');
  assert.ok(c[0].punkte.length >= 4);
  assert.match(c[0].datum, /\d{2}\.\d{2}\.\d{4}/);
});

test('changelog: Filter nach Version', () => {
  const c = s.changelog('7.2');
  assert.ok(c.length >= 1);
  assert.ok(c.every((e) => e.version === '7.2'));
  assert.deepEqual(s.changelog('9.9'), []);
});

test('changelog: exportierte Konstante ist ein Array', () => {
  assert.ok(Array.isArray(s.CHANGELOG));
  assert.ok(s.CHANGELOG.length >= 4);
});

/* ═══════════ KALENDERWOCHE ═══════════ */

test('kalenderwoche: 04.10.2026 ist KW 40, Sonntag', () => {
  const kw = s.kalenderwoche(new Date(2026, 9, 4));
  assert.equal(kw.kw, 40);
  assert.equal(kw.jahr, 2026);
  assert.equal(kw.wochenTag, 'So');
  assert.equal(kw.tagDerWoche, 7);
  assert.equal(kw.wochenFortschritt, 100);
  assert.equal(kw.restTage, 0);
});

test('kalenderwoche: 01.01.2026 (Donnerstag) ist KW 1', () => {
  const kw = s.kalenderwoche(new Date(2026, 0, 1));
  assert.equal(kw.kw, 1);
  assert.equal(kw.wochenTag, 'Do');
  assert.equal(kw.tagDerWoche, 4);
  assert.equal(kw.tageVergangen, 1);
});

test('kalenderwoche: Jahresfortschritt plausibel', () => {
  const kw = s.kalenderwoche(new Date(2026, 9, 4));
  assert.equal(kw.tageImJahr, 365);
  assert.equal(kw.tageVergangen, 277);
  assert.equal(kw.jahresFortschritt, 76);
  assert.equal(kw.tageRestImJahr, kw.tageImJahr - kw.tageVergangen);
});

test('kalenderwoche: Montag ist Wochenstart', () => {
  const kw = s.kalenderwoche(new Date(2026, 9, 5));   /* Montag */
  assert.equal(kw.tagDerWoche, 1);
  assert.equal(kw.wochenFortschritt, 14);
  assert.equal(kw.restTage, 6);
});

/* ═══════════ FARBVERLAUF ═══════════ */

test('farbverlauf: gültiger CSS-Gradient', () => {
  const f = s.farbverlauf('x');
  assert.match(f.css, /^linear-gradient\(\d+deg, #[0-9a-f]{6}, #[0-9a-f]{6}\)$/i);
  assert.match(f.von, /^#[0-9a-f]{6}$/i);
  assert.match(f.zu, /^#[0-9a-f]{6}$/i);
  assert.ok(f.name.length > 2);
});

test('farbverlaufAlle: 12 Paletten mit Namen', () => {
  const alle = s.farbverlaufAlle();
  assert.equal(alle.length, 12);
  assert.equal(new Set(alle.map((p) => p.name)).size, 12);
  assert.ok(alle.every((p) => /^linear-gradient/.test(p.css)));
});
