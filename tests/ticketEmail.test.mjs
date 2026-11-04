import test from 'node:test';
import assert from 'node:assert/strict';
import { sendContactNotificationEmail, sendTicketNotificationEmail } from '../ticketEmail.js';

const ticket = {
  id: 'T-0001',
  creatorJid: '49123456789@s.whatsapp.net',
  creatorName: 'Test User',
  bid: 'user-42',
  createdAt: '2026-10-05T12:00:00.000Z',
  status: 'open',
  text: 'Bitte helft mir.',
  answers: [{ byName: 'Support', role: 'supporter', text: 'Wir prüfen das.', at: '2026-10-05T12:05:00.000Z' }]
};

test('Ticket-Mail bleibt ohne SMTP-Zugangsdaten aus', async () => {
  const result = await sendTicketNotificationEmail(ticket, {
    env: {},
    createTransport() { throw new Error('Transport darf nicht erstellt werden'); }
  });
  assert.deepEqual(result, { ok: false, reason: 'not-configured' });
});

test('Ticket-Mail geht von contact an owner und enthält Ticketdetails', async () => {
  let smtpOptions;
  let message;
  const result = await sendTicketNotificationEmail(ticket, {
    env: {
      TICKET_SMTP_HOST: 'smtp.example.test',
      TICKET_SMTP_PORT: '465',
      TICKET_SMTP_USER: 'contact@maxichen.de',
      TICKET_SMTP_PASS: 'test-secret'
    },
    createTransport(options) {
      smtpOptions = options;
      return {
        async sendMail(outgoing) {
          message = outgoing;
          return { messageId: 'mail-123' };
        }
      };
    }
  });

  assert.deepEqual(result, { ok: true, messageId: 'mail-123' });
  assert.equal(smtpOptions.secure, true);
  assert.equal(smtpOptions.auth.user, 'contact@maxichen.de');
  assert.equal(message.from, 'LoveBot Support <contact@maxichen.de>');
  assert.equal(message.to, 'owner@maxichen.de');
  assert.match(message.text, /Test User/);
  assert.match(message.text, /Bitte helft mir\./);
  assert.match(message.text, /user-42/);
  assert.match(message.text, /Wir prüfen das\./);
  assert.match(message.text, /\$ticket answer T-0001/);
});

test('Kontakt-Mail geht an owner und setzt die Absenderadresse als Reply-To', async () => {
  let message;
  const result = await sendContactNotificationEmail({
    name: 'Max Mustermann',
    email: 'max@example.test',
    subject: 'Frage zum Bot',
    message: 'Wie kann ich den Bot in meine Gruppe holen?'
  }, {
    env: {
      TICKET_SMTP_HOST: 'smtp.example.test',
      TICKET_SMTP_USER: 'contact@maxichen.de',
      TICKET_SMTP_PASS: 'test-secret'
    },
    createTransport() {
      return { async sendMail(outgoing) { message = outgoing; return { messageId: 'contact-123' }; } };
    }
  });

  assert.deepEqual(result, { ok: true, messageId: 'contact-123' });
  assert.equal(message.to, 'owner@maxichen.de');
  assert.equal(message.replyTo, 'max@example.test');
  assert.equal(message.subject, '[Website] Frage zum Bot');
  assert.match(message.text, /Wie kann ich den Bot in meine Gruppe holen\?/);
});