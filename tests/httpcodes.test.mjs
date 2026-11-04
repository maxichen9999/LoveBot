/* ═══════════════════════════════════════════════════════════════════════
   🌐  TESTS  —  HTTP-Statuscodes (httpCodes.js)
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HTTP_CODES, HTTP_GROUPS, findCode, searchCodes, formatCodeForChat, handleHttpCodeCommand
} from '../httpCodes.js';

test('alle Codes sind vollständig und eindeutig', () => {
  assert.equal(HTTP_CODES.length, 63, '63 offizielle Codes');
  const seen = new Set(HTTP_CODES.map((e) => e.code));
  assert.equal(seen.size, HTTP_CODES.length, 'kein Code doppelt');
  for (let i = 1; i < HTTP_CODES.length; i++) {
    assert.ok(HTTP_CODES[i].code > HTTP_CODES[i - 1].code, 'aufsteigend sortiert');
  }
});

test('jeder Code hat Name, Erklärung und eine gültige Gruppe', () => {
  for (const e of HTTP_CODES) {
    assert.match(String(e.code), /^[1-5]\d{2}$/, `Code ${e.code}`);
    assert.ok(e.name && e.name.length >= 2, `Name fehlt bei ${e.code}`);
    assert.ok(e.desc && e.desc.length > 10, `Erklärung fehlt bei ${e.code}`);
    assert.ok(HTTP_GROUPS[e.group], `Gruppe ${e.group} existiert nicht`);
  }
});

test('jede Kategorie ist belegt', () => {
  for (const g of [1, 2, 3, 4, 5]) {
    const n = HTTP_CODES.filter((e) => e.group === g).length;
    assert.ok(n > 0, `${g}xx hat keine Codes`);
  }
});

test('Suche nach Zahl, Name und Beschreibung', () => {
  assert.equal(findCode('404').name, 'Not Found');
  assert.equal(findCode('418').name, "I'm a teapot");
  assert.equal(findCode('teapot').code, 418);
  assert.equal(findCode('TEAPOT').code, 418, 'Groß/Klein egal');
  assert.equal(findCode(' 500 ').code, 500, 'Leerzeichen werden ignoriert');
  assert.equal(findCode('Weiterleitung').group, 3, 'Treffer über die Beschreibung');
  assert.equal(findCode('999'), null, 'unbekannter Code');
  assert.equal(findCode(''), null, 'leere Eingabe');
});

test('Filter nach Kategorie', () => {
  const v = searchCodes('', '4');
  assert.ok(v.length > 20);
  assert.ok(v.every((e) => e.group === 4));
  const suche = searchCodes('zeit');
  assert.ok(suche.some((e) => e.code === 429), '429 „in kurzer Zeit“');
  assert.ok(searchCodes('zu lange').some((e) => e.code === 408), '408 Request Timeout');
});

test('Textausgabe für den Chat', () => {
  const t = formatCodeForChat(findCode('404'), '$');
  assert.match(t, /404/);
  assert.match(t, /Not Found/);
  assert.match(t, /existiert nicht/);
  assert.match(t, /\$http/);
  assert.equal(formatCodeForChat(null), null, 'kein Eintrag → kein Text');
});

/* ── Bot-Befehl mit einem Spielzeug-Socket ─────────────────────────── */
function mockSock() {
  const sent = [];
  return {
    sent,
    async sendMessage(jid, payload) { sent.push({ jid, ...payload }); return { key: {} }; }
  };
}

test('$http 404 erklärt den Code', async () => {
  const sock = mockSock();
  await handleHttpCodeCommand({ sock, from: 'x@s.whatsapp.net', msg: {}, args: ['404'], pref: '$' });
  assert.equal(sock.sent.length, 1);
  assert.match(sock.sent[0].text, /404 · Not Found/);
  assert.match(sock.sent[0].text, /existiert nicht/);
});

test('$http ohne Argument zeigt die Übersicht', async () => {
  const sock = mockSock();
  await handleHttpCodeCommand({ sock, from: 'x', msg: {}, args: [], pref: '$' });
  const t = sock.sent[0].text;
  for (const g of ['1xx', '2xx', '3xx', '4xx', '5xx']) assert.match(t, new RegExp(g), g + ' fehlt');
  assert.match(t, /\$http 404/);
});

test('$http mit Unsinn antwortet freundlich statt zu scheitern', async () => {
  const sock = mockSock();
  await handleHttpCodeCommand({ sock, from: 'x', msg: {}, args: ['blabla'], pref: '$' });
  assert.match(sock.sent[0].text, /NICHT GEFUNDEN/);
});

test('$http ist gegen zu lange Eingaben sicher', async () => {
  const sock = mockSock();
  await handleHttpCodeCommand({ sock, from: 'x', msg: {}, args: ['a'.repeat(500)], pref: '$' });
  assert.equal(sock.sent.length, 1, 'eine Antwort, kein Absturz');
  assert.ok(sock.sent[0].text.length < 400, 'Eingabe wird gekürzt');
});
