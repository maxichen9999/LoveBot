/* ═══════════════════════════════════════════════════════════════════════
   🎂  HOLIDAY-BOT  —  Geburtstage & Feiertage automatisch feiern
   ─────────────────────────────────────────────────────────────────────
   Was dieses Modul macht:

   1. 🎂 Geburtstage der Owner
        03.10  Maxichen   (+4915155894714)
        10.03  Lilli      (+491771845451)
      → um 00:00 eine Nachricht in ALLE Gruppen, alle werden markiert
      → den ganzen Tag über: Owner nicht erreichbar, Team nur teilweise
        (Auto-Antwort im Privat-Chat, einmal pro Person und Tag)

   2. 🎄 Feiertage (ebenso um 00:00 in alle Gruppen)
        Neujahr · Karfreitag · Ostersonntag · Ostermontag · Halloween
        Heiligabend · 1. & 2. Weihnachtstag · Silvester

   Wichtig:
   · Es wird pro Tag und Ereignis NUR EINMAL gesendet — der Stand liegt in
     Database/holidaybot.json, ein Neustart löst also nichts doppelt aus.
   · Die Owner selbst bekommen keine Abwesenheits-Antwort.
   · Zwischen den Gruppen liegt eine Pause (WhatsApp-Spam-Schutz).

   Einbindung (Love.js):
     import { startHolidayScheduler, awayReplyFor, holidayStatus } from './holidaybot.js';
     startHolidayScheduler(sock);
   ═══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = process.env.HOLIDAY_DB_DIR || path.join(process.cwd(), 'Database');
const DB_FILE = path.join(DB_DIR, 'holidaybot.json');
const SIGN = '♡ _hellokitty baby maxi by maxichen_ ♡';

/* ── Owner ────────────────────────────────────────────────────────────
   Geburtstage als MM-DD, damit sie jedes Jahr wiederkehren (kein Alter,
   keine Jahreszahl — das wäre geraten und nicht belegt). */
export const OWNERS = [
  {
    id: 'maxichen',
    name: 'Maxichen',
    number: '4915155894714',
    md: '10-03',
    emoji: '🎉',
    role: 'Owner',
    line: 'Unser Owner *Maxichen* hat heute Geburtstag!'
  },
  {
    id: 'lilli',
    name: 'Lilli',
    number: '491771845451',
    md: '03-10',
    emoji: '🌸',
    role: 'Ownerin',
    line: 'Unsere Ownerin *Lilli* hat heute Geburtstag!'
  }
];

/* ── Datums-Helfer (lokale Zeit des Servers) ───────────────────────── */
const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const mdKey = (d = new Date()) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function addDays(date, n) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

/* Ostersonntag nach Meeus/Jones/Butcher (gregorianisch) — offiziell und
   für alle Jahre korrekt, deshalb keine feste Liste nötig. */
export function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/* ── Feiertage eines Jahres ────────────────────────────────────────── */
export function holidaysForYear(year) {
  const easter = easterSunday(year);
  const list = [
    { id: 'neujahr', name: 'Neujahr', emoji: '🎆', date: new Date(year, 0, 1), wish: 'Guten Rutsch und ein starkes neues Jahr!' },
    { id: 'karfreitag', name: 'Karfreitag', emoji: '✝️', date: addDays(easter, -2), wish: 'Ruhigen Karfreitag euch allen.' },
    { id: 'ostersonntag', name: 'Ostersonntag', emoji: '🐰', date: easter, wish: 'Frohe Ostern — viel Glück beim Eiersuchen!' },
    { id: 'ostermontag', name: 'Ostermontag', emoji: '🐣', date: addDays(easter, 1), wish: 'Entspannten Ostermontag!' },
    { id: 'halloween', name: 'Halloween', emoji: '🎃', date: new Date(year, 9, 31), wish: 'Süßes oder Saures? Habt eine gruselig schöne Nacht!' },
    { id: 'heiligabend', name: 'Heiligabend', emoji: '🎄', date: new Date(year, 11, 24), wish: 'Schönen Heiligabend mit den Menschen, die ihr mögt.' },
    { id: 'weihnachten1', name: '1. Weihnachtstag', emoji: '🎁', date: new Date(year, 11, 25), wish: 'Frohe Weihnachten! 🎄' },
    { id: 'weihnachten2', name: '2. Weihnachtstag', emoji: '🕯️', date: new Date(year, 11, 26), wish: 'Noch einen gemütlichen Weihnachtstag.' },
    { id: 'silvester', name: 'Silvester', emoji: '🥂', date: new Date(year, 11, 31), wish: 'Guten Rutsch ins neue Jahr! 🎆' }
  ];
  return list.map((h) => ({ ...h, key: dayKey(h.date), kind: 'holiday' }));
}

/* ── Was ist heute los? ────────────────────────────────────────────── */
export function eventsForDate(date = new Date()) {
  const md = mdKey(date);
  const year = date.getFullYear();
  const birthdays = OWNERS.filter((o) => o.md === md)
    .map((o) => ({ ...o, key: dayKey(date), kind: 'birthday', title: `${o.name}s Geburtstag` }));
  const holidays = holidaysForYear(year).filter((h) => h.key === dayKey(date));
  return [...birthdays, ...holidays];
}

/* Geburtstage heute (für den Abwesenheits-Modus) */
export function birthdaysToday(date = new Date()) {
  return eventsForDate(date).filter((e) => e.kind === 'birthday');
}

/* ── Texte ─────────────────────────────────────────────────────────── */
export function buildEventText(event) {
  if (event.kind === 'birthday') {
    return [
      `${event.emoji} *GEBURTSTAG!* ${event.emoji}`,
      '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄',
      event.line,
      '',
      'Heute wird gefeiert — deshalb bin *ich* heute nicht erreichbar,',
      'und das Team ist nur teilweise da. 💜',
      '',
      '🎁 Schreib gern eine Grußnachricht in die Gruppe,',
      '    ich richte alles aus, wenn ich zurück bin.',
      '',
      SIGN
    ].join('\n');
  }
  return [
    `${event.emoji} *${event.name.toUpperCase()}* ${event.emoji}`,
    '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄',
    event.wish,
    '',
    '💜 Euch allen einen schönen Tag — feiert schön!',
    '',
    SIGN
  ].join('\n');
}

/* Abwesenheits-Antwort im Privat-Chat (Geburtstage) */
export function buildAwayText(events, date = new Date()) {
  const names = events.map((e) => e.name).join(' und ');
  const again = new Date(date.getTime());
  again.setDate(again.getDate() + 1);
  const back = `${pad(again.getDate())}.${pad(again.getMonth() + 1)}`;
  return [
    `${events[0]?.emoji || '🎂'} *HEUTE WIRD GEFEIERT* ${events[0]?.emoji || '🎂'}`,
    '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄',
    `${names} hat heute Geburtstag — deshalb bin ich heute`,
    '*nicht erreichbar*, und das Team ist nur teilweise da.',
    '',
    `🕛 Ab morgen (${back}) bin ich wieder für dich da.`,
    '💌 Bis dahin: alles Gute richte ich gern aus!',
    '',
    SIGN
  ].join('\n');
}

/* ── Stand (was wurde schon gesendet?) ─────────────────────────────── */
function readState() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    return {
      sent: data.sent && typeof data.sent === 'object' ? data.sent : {},
      replies: data.replies && typeof data.replies === 'object' ? data.replies : {}
    };
  } catch (e) {
    return { sent: {}, replies: {} };
  }
}

function writeState(state) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    /* Nur die letzten 90 Tage an Antworten aufheben */
    const days = Object.keys(state.replies || {}).sort();
    while (days.length > 90) delete state.replies[days.shift()];
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, DB_FILE);
    return true;
  } catch (e) {
    return false;
  }
}

/* ── Senden ────────────────────────────────────────────────────────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function sendToAllGroups(sock, { text, mentionAll = true, maxMentions = 150, pauseMs = 1200, onLog = null } = {}) {
  if (!sock || typeof sock.groupFetchAllParticipating !== 'function') {
    return { sent: 0, failed: 0, groups: 0, error: 'kein WhatsApp-Socket' };
  }
  let groups = {};
  try { groups = await sock.groupFetchAllParticipating() || {}; } catch (e) { return { sent: 0, failed: 0, groups: 0, error: e.message }; }
  const jids = Object.keys(groups);
  let sent = 0, failed = 0;

  for (const jid of jids) {
    try {
      let body = text;
      let mentions = [];
      if (mentionAll) {
        let meta = null;
        try { meta = await sock.groupMetadata(jid); } catch (e) { /* Gruppe ohne Metadaten */ }
        const ids = (meta?.participants || []).map((p) => p.id || p.jid || p.lid).filter(Boolean);
        mentions = ids.slice(0, maxMentions);
        if (mentions.length) {
          body = `${text}\n\n${mentions.map((id) => '@' + String(id).split('@')[0]).join(' ')}`;
        }
      }
      await sock.sendMessage(jid, { text: body, mentions });
      sent++;
      if (pauseMs) await sleep(pauseMs);        // Spam-Schutz von WhatsApp
    } catch (e) {
      failed++;
      if (onLog) onLog(`Gruppe ${jid}: ${e?.message || e}`);
    }
  }
  return { sent, failed, groups: jids.length };
}

/* ── Fällige Ereignisse senden (einmal pro Tag und Ereignis) ───────── */
export async function runDueEvents(sock, { now = new Date(), windowMinutes = 120, dryRun = false, pauseMs = 1200, onLog = null } = {}) {
  const state = readState();
  const today = dayKey(now);
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const results = [];

  /* Fenster: 00:00 bis windowMinutes danach. Startet der Bot später,
     wird nicht nachträglich gesendet — sonst käme der Gruß mittags. */
  if (minutesSinceMidnight > windowMinutes) return results;

  for (const event of eventsForDate(now)) {
    const id = `${today}|${event.kind}|${event.id}`;
    if (state.sent[id]) continue;
    if (dryRun) { results.push({ id, event, dryRun: true }); continue; }

    const text = buildEventText(event);
    const res = await sendToAllGroups(sock, { text, pauseMs, onLog });
    state.sent[id] = { at: new Date().toISOString(), ...res };
    writeState(state);
    results.push({ id, event, ...res });
    if (onLog) onLog(`🎊 ${event.title || event.name} → ${res.sent} Gruppen (${res.failed} fehlgeschlagen)`);
  }
  return results;
}

/* ── Zeitsteuerung ─────────────────────────────────────────────────── */
let timer = null;
export function startHolidayScheduler(sock, { intervalMs = 30000, windowMinutes = 120, onLog = null } = {}) {
  if (timer) return timer;
  const tick = async () => {
    try { await runDueEvents(sock, { windowMinutes, onLog }); } catch (e) { /* nie den Bot stoppen */ }
  };
  tick();
  timer = setInterval(tick, intervalMs);
  if (typeof timer.unref === 'function') timer.unref();
  return timer;
}
export function stopHolidayScheduler() {
  if (timer) { clearInterval(timer); timer = null; }
}

/* ── Abwesenheits-Antwort (Geburtstage) ────────────────────────────── */
export function awayReplyFor(senderJid, { now = new Date(), dryRun = false } = {}) {
  const events = birthdaysToday(now);
  if (!events.length) return null;

  const digits = String(senderJid || '').replace(/\D/g, '');
  /* Die Owner selbst bekommen keine Abwesenheits-Nachricht */
  if (OWNERS.some((o) => o.number && digits.endsWith(o.number.slice(-9)))) return null;

  const today = dayKey(now);
  const state = readState();
  const done = state.replies[today] || [];
  const key = String(senderJid || '').split('@')[0];
  if (done.includes(key)) return null;

  if (!dryRun) {
    state.replies[today] = [...done, key].slice(-5000);
    writeState(state);
  }
  return buildAwayText(events, now);
}

/* ── Status (für $holiday status / Website) ────────────────────────── */
export function holidayStatus(now = new Date()) {
  const events = eventsForDate(now);
  const birthdays = events.filter((e) => e.kind === 'birthday');
  const state = readState();
  return {
    date: dayKey(now),
    awayActive: birthdays.length > 0,
    owners: birthdays.map((b) => b.name),
    events: events.map((e) => ({ kind: e.kind, name: e.title || e.name, emoji: e.emoji })),
    sentToday: Object.keys(state.sent).filter((k) => k.startsWith(dayKey(now)))
  };
}

/* Alle Termine eines Jahres (Vorschau, z. B. für die Doku) */
export function previewYear(year = new Date().getFullYear()) {
  const easter = easterSunday(year);
  const bd = OWNERS.map((o) => {
    const [m, d] = o.md.split('-');
    return { date: new Date(year, Number(m) - 1, Number(d)), name: `${o.name}s Geburtstag`, emoji: o.emoji, kind: 'birthday' };
  });
  return [...bd, ...holidaysForYear(year)]
    .sort((a, b) => a.date - b.date)
    .map((e) => ({ datum: dayKey(e.date), name: e.name, emoji: e.emoji, kind: e.kind, wochentag: e.date.toLocaleDateString('de-DE', { weekday: 'long' }) }));
}

export default {
  OWNERS, easterSunday, holidaysForYear, eventsForDate, birthdaysToday,
  buildEventText, buildAwayText, sendToAllGroups, runDueEvents,
  startHolidayScheduler, stopHolidayScheduler, awayReplyFor, holidayStatus, previewYear
};
