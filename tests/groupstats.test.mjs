import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMembersCard, findMemberProfile, indexMemberProfiles } from '../groupstats.js';

const users = {
  '49123456789jid123456789012345lid': {
    identity: {
      bid: '49123456789jid123456789012345lid',
      jid: '49123456789@s.whatsapp.net',
      lid: '123456789012345@lid'
    },
    registration: { name: 'Luna' }
  }
};

test('Mitgliederprofile werden über zusammengesetzte BID, JID und LID gefunden', () => {
  const index = indexMemberProfiles(users);
  const byJid = findMemberProfile({ id: '49123456789@s.whatsapp.net' }, index);
  const byLid = findMemberProfile({ id: '123456789012345@lid' }, index);
  assert.equal(byJid?.registration?.name, 'Luna');
  assert.equal(byLid?.registration?.name, 'Luna');
});

test('Mitgliederliste kennzeichnet Admins und paginiert lange Gruppen', () => {
  const members = Array.from({ length: 27 }, (_, i) => ({
    id: String(49100000000 + i),
    name: `Mitglied ${i + 1}`,
    admin: i === 25 ? 'superadmin' : undefined
  }));
  const first = buildMembersCard(members, [], { limit: 25, page: 1, pref: '$' });
  const second = buildMembersCard(members, [], { limit: 25, page: 2, pref: '$' });
  assert.match(first, /MITGLIEDER \(27\).*1\/2/);
  assert.match(first, /\$members 2/);
  assert.doesNotMatch(first, /Mitglied 26/);
  assert.match(second, /👑 Mitglied 26/);
  assert.match(second, /\$members 1/);
});