import { loadEnv } from '../siteSecurity.js';
import nodemailer from 'nodemailer';

loadEnv();

const host = String(process.env.TICKET_SMTP_HOST || '').trim();
const user = String(process.env.TICKET_SMTP_USER || '').trim();
const pass = String(process.env.TICKET_SMTP_PASS || '');
const port = Number.parseInt(String(process.env.TICKET_SMTP_PORT || '465'), 10);
if (!host || !user || !pass || !Number.isInteger(port)) {
  console.error('SMTP-Konfiguration unvollständig. TICKET_SMTP_HOST/USER/PASS/PORT in .env prüfen.');
  process.exitCode = 2;
} else {
  const secureValue = String(process.env.TICKET_SMTP_SECURE || '').trim();
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: secureValue ? /^(1|true|yes)$/i.test(secureValue) : port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
  try {
    await transport.verify();
    if (process.argv.includes('--send-test')) {
      await transport.sendMail({
        from: 'LoveBot Support <contact@maxichen.de>',
        to: 'owner@maxichen.de',
        replyTo: 'contact@maxichen.de',
        subject: 'LoveBot SMTP-Verbindungstest',
        text: 'Der SMTP-Versand von contact@maxichen.de an owner@maxichen.de funktioniert.'
      });
      console.log('SMTP-Testmail wurde vom Mailserver angenommen.');
    } else {
      console.log('SMTP-Anmeldung erfolgreich. Es wurde keine E-Mail versendet.');
    }
  } catch (error) {
    console.error('SMTP-Anmeldung fehlgeschlagen:', error.code || 'UNKNOWN');
    process.exitCode = 1;
  } finally {
    transport.close();
  }
}
