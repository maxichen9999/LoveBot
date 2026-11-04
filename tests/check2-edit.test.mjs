import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCheck2EditSvg } from '../check2Edit.js';

test('check2 artwork reports only directory signals, not an asserted ban verdict', () => {
  const svg = buildCheck2EditSvg({
    phone: '+491234567890',
    signals: { exists: true, onWhatsAppExists: true, deviceCount: 2 },
    checkedAt: new Date('2026-11-03T20:00:00.000Z')
  });

  assert.match(svg, /BAN STATUS/);
  assert.match(svg, /NICHT VERIFIZIERBAR/);
  assert.match(svg, /NUMMER GEFUNDEN/);
  assert.match(svg, /2 GERÄTE GEMELDET/);
  assert.match(svg, /APK-BAN-CHECK/);
  assert.match(svg, /by 𓆩♡𓆪 910maxi 𓆩♡𓆪/);
});

test('check2 artwork safely escapes user-controlled text', () => {
  const svg = buildCheck2EditSvg({
    phone: '<script>&',
    signals: { exists: false, onWhatsAppExists: false, usyncOk: true, onWhatsAppOk: true, deviceCount: null }
  });

  assert.match(svg, /&lt;script&gt;&amp;/);
  assert.doesNotMatch(svg, /<script>/);
});

test('check2 command creates and sends both the result image and edit video', () => {
  const source = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
  const check2Case = source.slice(source.indexOf("case 'check2':"), source.indexOf("case 'kanal':", source.indexOf("case 'check2':")));

  assert.match(check2Case, /createCheck2Edit\(/);
  assert.match(check2Case, /outputDirectory: path\.resolve\('edit'\)/);
  assert.match(check2Case, /image: editResult\.imageBuffer/);
  assert.match(check2Case, /video: editResult\.videoBuffer/);
  assert.match(check2Case, /verdict\.verdict/);
});
