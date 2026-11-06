import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCheck2EditSvg, buildDatabaseBanCheckSvg } from '../check2Edit.js';

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

test('database-ban edit has a branded, bot-only status layout', () => {
  const svg = buildDatabaseBanCheckSvg({
    target: '+491234567890',
    ban: null,
    checkedAt: new Date('2026-11-03T20:00:00.000Z')
  });

  assert.match(svg, /HELLOKITTY BABY MAXI/);
  assert.match(svg, /BOT BAN CHECK/);
  assert.match(svg, /NICHT GEBANNT/);
  assert.match(svg, /Nur der interne LoveBot-Ban wird geprüft/);
  assert.match(svg, /3:22 EDIT/);
  assert.match(svg, /#72e6b1/);
});

test('database-ban video overlay is transparent for the tomp4 background image', () => {
  const svg = buildDatabaseBanCheckSvg({
    target: '+491234567890',
    ban: null,
    checkedAt: new Date('2026-11-03T20:00:00.000Z'),
    videoOverlay: true
  });

  assert.doesNotMatch(svg, /<rect width="720" height="1280" fill="url\(#banBackground\)"/);
  assert.match(svg, /fill-opacity=".32"/);
  assert.match(svg, /stop-opacity=".84"/);
  assert.match(svg, /BOT BAN CHECK/);
});

test('database-ban edit shows escaped ban details and wraps long targets', () => {
  const svg = buildDatabaseBanCheckSvg({
    target: '1234567890123456789012345678901234567890@lid',
    ban: {
      reason: '<script>& langes Fehlverhalten',
      bannedAt: '2026-11-03T20:00:00.000Z',
      bannedBy: '491234567890@s.whatsapp.net',
      bannedByName: 'Owner & Team'
    }
  });

  assert.match(svg, /BAN AKTIV/);
  assert.match(svg, /BAN-GRUND/);
  assert.match(svg, /&lt;script&gt;&amp;/);
  assert.match(svg, /GEBANNT VON · JID/);
  assert.match(svg, /491234567890@s\.whatsapp\.net/);
  assert.doesNotMatch(svg, /Owner &amp; Team/);
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /123456789012345678901234567/);
  assert.match(svg, /8901234567890@lid/);
});

test('database-ban edit never displays a LID as the banning actor identity', () => {
  const svg = buildDatabaseBanCheckSvg({
    target: '491234567890@s.whatsapp.net',
    ban: {
      reason: 'Spam',
      bannedByLid: '123456789012345@lid',
      bannedByName: '123456789012345'
    }
  });

  assert.match(svg, /JID nicht gespeichert/);
  assert.doesNotMatch(svg, /123456789012345@lid/);
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
