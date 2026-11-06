import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSetupDescription } from '../features.js';

test('$setup zeigt Name, JID und LID getrennt in der Gruppenbeschreibung', () => {
  const description = buildSetupDescription(
    { groups: { '123@g.us': { subject: 'Testgruppe' } } },
    '123@g.us',
    '2026-11-05T00:00:00.000Z',
    'Maxichen',
    '491234567890@s.whatsapp.net',
    '123456789012345@lid'
  );

  assert.match(description, /Von: Maxichen/);
  assert.match(description, /JID: 491234567890@s\.whatsapp\.net/);
  assert.match(description, /LID: 123456789012345@lid/);
});
