import nodemailer from 'nodemailer';

const FROM = 'LoveBot Support <contact@maxichen.de>';
const TO = 'owner@maxichen.de';

export async function sendTransactionalEmail({ to, subject, text, replyTo = 'contact@maxichen.de' }, {
  env = process.env,
  createTransport = nodemailer.createTransport
} = {}) {
  const host = String(env.TICKET_SMTP_HOST || '').trim();
  const user = String(env.TICKET_SMTP_USER || '').trim();
  const pass = String(env.TICKET_SMTP_PASS || '');
  if (!host || !user || !pass) return { ok: false, reason: 'not-configured' };

  const port = Number.parseInt(String(env.TICKET_SMTP_PORT || '465'), 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, reason: 'invalid-config' };
  }
  const secureValue = String(env.TICKET_SMTP_SECURE || '').trim();
  const secure = secureValue
    ? /^(1|true|yes)$/i.test(secureValue)
    : port === 465;

  const transport = createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
  const result = await transport.sendMail({
    from: FROM,
    to,
    replyTo,
    subject,
    text
  });
  return { ok: true, messageId: result?.messageId || '' };
}

export async function sendTicketNotificationEmail(ticket, options = {}) {
  const phone = String(ticket.creatorJid || '').split('@')[0];
  const text = [
    `Neues LoveBot-Support-Ticket: ${ticket.id}`,
    '',
    `Von: ${ticket.creatorName || 'Unbekannt'}`,
    `WhatsApp: ${phone || 'unbekannt'}`,
    `Interne Benutzer-ID: ${ticket.bid || 'nicht hinterlegt'}`,
    `Erstellt: ${ticket.createdAt || 'unbekannt'}`,
    `Status: ${ticket.status || 'open'}`,
    '',
    'Anliegen:',
    String(ticket.text || ''),
    ...(Array.isArray(ticket.answers) && ticket.answers.length
      ? ['', 'Bisherige Antworten:', ...ticket.answers.map((answer) => `- ${answer.byName || answer.by || 'Team'} (${answer.role || 'Team'}): ${answer.text || ''} [${answer.at || 'ohne Zeitangabe'}]`)]
      : []),
    '',
    `Im Bot antworten: $ticket answer ${ticket.id} <Antwort>`
  ].join('\n');

  return sendTransactionalEmail({
    to: TO,
    subject: `[LoveBot Ticket ${ticket.id}] Neue Support-Anfrage`,
    text
  }, options);
}

export async function sendContactNotificationEmail({ name, email, subject, message }, options = {}) {
  const text = [
    'Neue Kontaktanfrage über maxichen.de',
    '',
    `Von: ${name}`,
    `E-Mail: ${email}`,
    `Betreff: ${subject}`,
    '',
    'Nachricht:',
    message
  ].join('\n');

  return sendTransactionalEmail({
    to: TO,
    replyTo: email,
    subject: `[Website] ${subject}`,
    text
  }, options);
}