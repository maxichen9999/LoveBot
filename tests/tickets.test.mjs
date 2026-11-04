import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  _resetTickets,
  answerTicket,
  closeTicket,
  createTicket,
  getTicket,
  normalizeTicketJid,
  reopenTicket
} from '../tickets.js';

const originalCwd = process.cwd();
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lovebot-tickets-'));
process.chdir(tempDir);

test.after(() => {
  _resetTickets();
  process.chdir(originalCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('Ticket-DM behält Domain und entfernt nur die Gerätekennung', () => {
  const created = createTicket({
    creatorJid: '49123456789:4@s.whatsapp.net',
    creatorName: 'Luna',
    text: 'Ich brauche Hilfe.'
  });

  assert.equal(created.ok, true);
  assert.equal(created.ticket.creatorJid, '49123456789@s.whatsapp.net');
  assert.match(created.ticket.creatorJid, /^\d+@s\.whatsapp\.net$/);
  assert.equal(normalizeTicketJid('49123456789:9@s.whatsapp.net'), '49123456789@s.whatsapp.net');
  assert.equal(normalizeTicketJid('123456789012345@lid'), '123456789012345@lid');
  assert.equal(normalizeTicketJid('49123456789'), '49123456789@s.whatsapp.net');
  assert.equal(normalizeTicketJid('invalid@bad-server'), '');
});

test('Ticket kann beantwortet, geschlossen und wieder geöffnet werden', () => {
  const created = createTicket({
    creatorJid: '49123456789@s.whatsapp.net',
    creatorName: 'Luna',
    text: 'Bitte prüft mein Konto.'
  });
  const answered = answerTicket({ id: created.ticket.id, byName: 'Support', text: 'Wir kümmern uns.' });
  assert.equal(answered.ok, true);
  assert.equal(answered.ticket.answers.length, 1);
  assert.equal(getTicket(created.ticket.id).ticket.status, 'open');

  const closed = closeTicket({ id: created.ticket.id, byName: 'Support', reason: 'Gelöst' });
  assert.equal(closed.ok, true);
  assert.equal(getTicket(created.ticket.id).ticket.status, 'closed');

  const reopened = reopenTicket({ id: created.ticket.id, byName: 'Owner' });
  assert.equal(reopened.ok, true);
  assert.equal(getTicket(created.ticket.id).ticket.status, 'open');
});