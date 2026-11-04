import test from 'node:test';
import assert from 'node:assert/strict';
import { EmailCodeManager, normalizeEmail, resetDeliveryFor } from '../emailAuth.js';

test('E-Mail wird normalisiert und syntaktisch unbrauchbare Eingaben abgelehnt', () => {
  assert.equal(normalizeEmail('  User+Tag@Example.COM '), 'user+tag@example.com');
  assert.equal(normalizeEmail('not-an-email'), '');
  assert.equal(normalizeEmail('user@@example.com'), '');
  assert.equal(normalizeEmail('a'.repeat(250) + '@example.com'), '');
});

test('E-Mail-Code ist einmalig, zweckgebunden und zeitlich begrenzt', () => {
  const manager = new EmailCodeManager({ ttlMs: 1000, secret: Buffer.alloc(32, 7) });
  const challenge = manager.issue({ purpose: 'register', subject: '49123', email: 'user@example.com', now: 10 });
  assert.match(challenge.code, /^\d{6}$/);
  assert.equal(manager.verify({ id: challenge.id, code: challenge.code, purpose: 'reset', now: 20 }).ok, false);
  const verified = manager.verify({ id: challenge.id, code: challenge.code, purpose: 'register', now: 20 });
  assert.equal(verified.ok, true);
  assert.equal(verified.challenge.email, 'user@example.com');
  assert.equal(manager.verify({ id: challenge.id, code: challenge.code, purpose: 'register', now: 21 }).ok, false);

  const expired = manager.issue({ purpose: 'reset', subject: 'user@example.com', email: 'user@example.com', now: 10 });
  assert.equal(manager.verify({ id: expired.id, code: expired.code, purpose: 'reset', now: 1010 }).reason, 'expired');
});

test('E-Mail-Code wird nach fünf falschen Versuchen gesperrt', () => {
  const manager = new EmailCodeManager({ secret: Buffer.alloc(32, 9) });
  const challenge = manager.issue({ purpose: 'reset', subject: 'user@example.com', email: 'user@example.com' });
  for (let attempt = 0; attempt < 4; attempt++) {
    assert.equal(manager.verify({ id: challenge.id, code: 'wrong', purpose: 'reset' }).reason, 'invalid');
  }
  assert.equal(manager.verify({ id: challenge.id, code: 'wrong', purpose: 'reset' }).reason, 'locked');
  assert.equal(manager.verify({ id: challenge.id, code: challenge.code, purpose: 'reset' }).reason, 'invalid');
});

test('Passwort-Reset-Code kann ohne E-Mail an eine WhatsApp-Nummer gebunden werden', () => {
  const manager = new EmailCodeManager({ secret: Buffer.alloc(32, 11) });
  const challenge = manager.issue({
    purpose: 'password-reset', subject: '49123456789', email: ''
  });
  const result = manager.verify({
    id: challenge.id, code: challenge.code, purpose: 'password-reset'
  });
  assert.equal(result.ok, true);
  assert.equal(result.challenge.subject, '49123456789');
  assert.equal(result.challenge.email, '');
});

test('Resetcode geht an die persönliche verifizierte Adresse, nie pauschal an den Owner', () => {
  assert.deepEqual(resetDeliveryFor({ email: 'person@example.com', emailVerifiedAt: '2026-10-05T12:00:00Z' }), {
    channel: 'email', email: 'person@example.com'
  });
  assert.deepEqual(resetDeliveryFor({ email: 'person@example.com', emailVerifiedAt: null }), {
    channel: 'whatsapp', email: ''
  });
});