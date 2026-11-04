/* ═══════════════════════════════════════════════════════════════════════
   🎂  TESTS  —  Geburtstage & Feiertage (holidaybot.js)
   ───────────────────────────────────────────────────────────────────────
   Die Tests schreiben in ein eigenes Verzeichnis, damit die echte
   Database/ unberührt bleibt.
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'holidaybot-'));
process.env.HOLIDAY_DB_DIR = TMP;          // VOR dem Import setzen!

const hb = await import('../holidaybot.js');
const {
  OWNERS, easterSunday, holidaysForYear, eventsForDate, birthdaysToday,
  buildEventText, buildAwayText, sendToAllGroups, runDueEvents,
  awayReplyFor, holidayStatus, previewYear
} = hb;

const at = (y, m, d, hh = 0, mm = 0) => new Date(y, m - 1, d, hh, mm, 0, 0);

/* ── Ostern ────────────────────────────────────────────────────────── */
test('Ostersonntag stimmt mit den offiziellen Daten überein', () => {
  const expected = { 2024: [3, 31], 2025: [4, 20], 2026: [4, 5], 2027: [3, 28], 2028: [4, 16], 2030: [4, 21] };
  for (const [year, [m, d]] of Object.entries(expected)) {
    const e = easterSunday(Number(year));
    assert.equal(e.getMonth() + 1, m, `${year}: Monat`);
    assert.equal(e.getDate(), d, `${year}: Tag`);
  }
});

test('Karfreitag und Ostermontag liegen richtig um Ostern herum', () => {
  const list = holidaysForYear(2026);
  const kar = list.find((h) => h.id === 'karfreitag');
  const ost = list.find((h) => h.id === 'ostersonntag');
  const mon = list.find((h) => h.id === 'ostermontag');
  assert.equal(kar.key, '2026-04-03', 'Ostern 05.04. → Karfreitag 03.04.');
  assert.equal(ost.key, '2026-04-05');
  assert.equal(mon.key, '2026-04-06');
});

/* ── Feste Feiertage ───────────────────────────────────────────────── */
test('die großen Feste sind alle dabei', () => {
  const keys = holidaysForYear(2026).map((h) => h.key);
  for (const datum of ['2026-01-01', '2026-10-31', '2026-12-24', '2026-12-25', '2026-12-26', '2026-12-31']) {
    assert.ok(keys.includes(datum), datum + ' fehlt');
  }
  assert.equal(keys.length, 9, 'Neujahr · Karfreitag · Ostern · Ostermontag · Halloween · Hl. Abend · 2× Weihnachten · Silvester');
});

/* ── Geburtstage ───────────────────────────────────────────────────── */
test('Maxichen: 3. Oktober — Lilli: 10. März', () => {
  const maxichen = OWNERS.find((o) => o.id === 'maxichen');
  const lilli = OWNERS.find((o) => o.id === 'lilli');
  assert.equal(maxichen.md, '10-03', '03.10. = 3. Oktober');
  assert.equal(lilli.md, '03-10', '10.03. = 10. März');
  assert.equal(maxichen.number, '4915155894714');
  assert.equal(lilli.number, '491771845451');
});

test('Geburtstage wiederkehren jedes Jahr', () => {
  for (const year of [2026, 2027, 2030]) {
    const max = eventsForDate(at(year, 10, 3)).filter((e) => e.kind === 'birthday');
    const lil = eventsForDate(at(year, 3, 10)).filter((e) => e.kind === 'birthday');
    assert.equal(max.length, 1, `${year}: Maxichen`);
    assert.equal(lil.length, 1, `${year}: Lilli`);
    assert.equal(max[0].id, 'maxichen');
    assert.equal(lil[0].id, 'lilli');
  }
});

test('Geburtstag + Halloween am selben Tag? (3.10 ist nur Geburtstag)', () => {
  const e = eventsForDate(at(2026, 10, 3));
  assert.equal(e.length, 1);
  assert.equal(e[0].kind, 'birthday');
});

/* ── Texte ─────────────────────────────────────────────────────────── */
test('Geburtstagstext nennt den Namen und die Abwesenheit', () => {
  const ev = eventsForDate(at(2026, 10, 3))[0];
  const t = buildEventText(ev);
  assert.match(t, /Maxichen/);
  assert.match(t, /GEBURTSTAG/);
  assert.match(t, /nicht erreichbar/);
  assert.match(t, /Team/);
});

test('Feiertagstext enthält den Wunsch', () => {
  const ev = holidaysForYear(2026).find((h) => h.id === 'silvester');
  const t = buildEventText(ev);
  assert.match(t, /SILVESTER/);
  assert.match(t, /Guten Rutsch/);
  assert.ok(!/nicht erreichbar/.test(t), 'nur Geburtstage bedeuten Abwesenheit');
});

test('Abwesenheitstext nennt den nächsten Tag', () => {
  const t = buildAwayText(birthdaysToday(at(2026, 10, 3)), at(2026, 10, 3));
  assert.match(t, /Maxichen/);
  assert.match(t, /nicht erreichbar/);
  assert.match(t, /04\.10/, 'Rückkehr am 04.10.');
});

/* ── Abwesenheits-Antwort ──────────────────────────────────────────── */
test('Abwesenheit greift nur am Geburtstag der Owner', () => {
  assert.ok(awayReplyFor('491234567890@s.whatsapp.net', { now: at(2026, 10, 3, 12, 0) }), '3.10.');
  assert.equal(awayReplyFor('491234567890@s.whatsapp.net', { now: at(2026, 10, 4, 12, 0) }), null, '4.10. → nichts');
  assert.equal(awayReplyFor('491234567890@s.whatsapp.net', { now: at(2026, 12, 25, 12, 0) }), null, 'Feiertag → keine Abwesenheit');
});

test('die Owner selbst bekommen keine Abwesenheits-Nachricht', () => {
  for (const o of OWNERS) {
    assert.equal(
      awayReplyFor(o.number + '@s.whatsapp.net', { now: at(2026, 10, 3, 12, 0), dryRun: true }),
      null,
      o.name + ' soll keine Abwesenheits-Nachricht bekommen'
    );
  }
});

test('jede Person bekommt sie nur einmal am Tag', () => {
  const jid = '4999887766@s.whatsapp.net';
  assert.ok(awayReplyFor(jid, { now: at(2026, 10, 3, 10, 0) }), 'erste Nachricht');
  assert.equal(awayReplyFor(jid, { now: at(2026, 10, 3, 11, 0) }), null, 'zweite am selben Tag');
  assert.ok(awayReplyFor(jid, { now: at(2027, 10, 3, 11, 0) }), 'nächstes Jahr wieder');
});

/* ── Rundsendung ───────────────────────────────────────────────────── */
function mockSock(gruppen = {}) {
  const sent = [];
  return {
    sent,
    async groupFetchAllParticipating() { return gruppen; },
    async groupMetadata(jid) { return { participants: gruppen[jid] || [] }; },
    async sendMessage(jid, payload) { sent.push({ jid, ...payload }); }
  };
}

const ZWEI_GRUPPEN = {
  '111@g.us': [{ id: '49111@s.whatsapp.net' }, { id: '49222@s.whatsapp.net' }],
  '222@g.us': [{ id: '49333@s.whatsapp.net' }]
};

test('Rundsendung erreicht jede Gruppe und markiert alle', async () => {
  const sock = mockSock(ZWEI_GRUPPEN);
  const res = await sendToAllGroups(sock, { text: 'Hallo', pauseMs: 0 });
  assert.equal(res.groups, 2);
  assert.equal(res.sent, 2);
  assert.equal(res.failed, 0);

  const erste = sock.sent.find((m) => m.jid === '111@g.us');
  assert.equal(erste.mentions.length, 2, 'beide Teilnehmer markiert');
  assert.match(erste.text, /@49111/, 'Markierung steht im Text');

  const zweite = sock.sent.find((m) => m.jid === '222@g.us');
  assert.equal(zweite.mentions.length, 1);
});

test('eine kaputte Gruppe hält die Runde nicht auf', async () => {
  const sock = mockSock(ZWEI_GRUPPEN);
  sock.sendMessage = async (jid, p) => {
    if (jid === '111@g.us') throw new Error('Blockiert');
    sock.sent.push({ jid, ...p });
  };
  const res = await sendToAllGroups(sock, { text: 'Hallo', pauseMs: 0 });
  assert.equal(res.sent, 1);
  assert.equal(res.failed, 1, 'Fehler wird gezählt, nicht geworfen');
});

test('ohne Socket gibt es keinen Absturz', async () => {
  const res = await sendToAllGroups(null, { text: 'x' });
  assert.equal(res.sent, 0);
  assert.ok(res.error);
});

/* ── Zeitfenster & einmaliges Senden ───────────────────────────────── */
test('um 00:05 wird gesendet, mittags nicht nachgeholt', async () => {
  const sock = mockSock(ZWEI_GRUPPEN);
  const frueh = await runDueEvents(sock, { now: at(2026, 10, 3, 0, 5), pauseMs: 0, onLog: () => {} });
  assert.equal(frueh.length, 1, 'Geburtstag ist fällig');
  assert.equal(sock.sent.length, 2, 'in beide Gruppen');

  /* Stand wurde gemerkt → kein zweites Mal */
  const nochmal = await runDueEvents(mockSock(ZWEI_GRUPPEN), { now: at(2026, 10, 3, 0, 20) });
  assert.equal(nochmal.length, 0, 'bereits gesendet');
});

test('nach dem Zeitfenster wird nicht mehr gesendet', async () => {
  const sock = mockSock(ZWEI_GRUPPEN);
  const spaet = await runDueEvents(sock, { now: at(2026, 12, 25, 14, 0) });
  assert.equal(spaet.length, 0, '14 Uhr ist zu spät für den 00:00-Gruß');
  assert.equal(sock.sent.length, 0);
});

test('Silvester um 00:00 wird gesendet', async () => {
  const sock = mockSock(ZWEI_GRUPPEN);
  const res = await runDueEvents(sock, { now: at(2026, 12, 31, 0, 1) });
  assert.equal(res.length, 1);
  assert.match(sock.sent[0].text, /SILVESTER/);
});

test('Probelauf sendet nichts', async () => {
  const sock = mockSock(ZWEI_GRUPPEN);
  const res = await runDueEvents(sock, { now: at(2026, 3, 10, 0, 5), dryRun: true });
  assert.equal(res.length, 1, 'Lillis Geburtstag wäre fällig');
  assert.equal(sock.sent.length, 0, 'aber es ging nichts raus');
});

/* ── Status & Vorschau ─────────────────────────────────────────────── */
test('Status zeigt Abwesenheit und heutige Anlässe', () => {
  const st = holidayStatus(at(2026, 10, 3, 9, 0));
  assert.equal(st.date, '2026-10-03');
  assert.equal(st.awayActive, true);
  assert.deepEqual(st.owners, ['Maxichen']);
  assert.equal(holidayStatus(at(2026, 10, 4)).awayActive, false);
});

test('Jahresvorschau ist vollständig und sortiert', () => {
  const liste = previewYear(2026);
  assert.equal(liste.length, 11, '9 Feiertage + 2 Geburtstage');
  for (let i = 1; i < liste.length; i++) {
    assert.ok(liste[i].datum >= liste[i - 1].datum, 'chronologisch');
  }
  assert.equal(liste[0].datum, '2026-01-01', 'Neujahr zuerst');
  assert.equal(liste[liste.length - 1].datum, '2026-12-31', 'Silvester zuletzt');
});

test('kein Test-Müll in der echten Database', () => {
  assert.ok(!fs.existsSync(path.join(process.cwd(), 'Database', 'holidaybot-test')), 'Tests schreiben ins Temp-Verzeichnis');
  assert.ok(fs.existsSync(path.join(TMP, 'holidaybot.json')), 'Stand wurde im Temp-Verzeichnis angelegt');
});
