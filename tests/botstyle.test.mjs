/* ═══════════════════════════════════════════════════════════════════════
   🎀  TESTS  —  Bot-Stil (sachlich · pink · Mädchen-Stil)
   ───────────────────────────────────────────────────────────────────────
   Läuft in einem eigenen Verzeichnis, damit Database/ unberührt bleibt.

   Vorgabe seit 02.10.2026:  Stimmung „neutral" = SACHLICH, ohne Gefühle,
   dazu pinker Mädchen-Stil und eine Schleife am Anfang jeder Nachricht.
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'botstyle-'));
process.env.BOTSTYLE_DB_DIR = TMP;      /* VOR dem Import setzen */

const bs = await import('../botStyle.js');
const {
  MOODS, loadStyle, setMood, setAutoReactions, setHelloKitty, setDeko,
  isAutoReactionsOn, isDekoOn, polishText, polishContent, reactionEmoji, styleStatus
} = bs;

/* Schleife am Anfang abziehen — für Vergleiche des reinen Inhalts */
const kern = (t) => (typeof t === 'string' && t.startsWith('🎀 ') ? t.slice(2) : t);

/* ── Vorgaben ───────────────────────────────────────────────────────── */
test('Vorgabe: sachlich, Auto-Reaktionen aus, pink an, Schleife an', () => {
  const s = loadStyle();
  assert.equal(s.mood, 'neutral', 'sachlich ist die Vorgabe');
  assert.equal(s.autoReactions, false, 'Auto-Reaktionen sind standardmäßig AUS');
  assert.equal(s.helloKitty, true, 'pinker Mädchen-Stil an');
  assert.equal(s.deko, true, 'Schleife vor jeder Nachricht');
});

test('Auto-Reaktionen lassen sich umschalten und bleiben gespeichert', () => {
  assert.equal(isAutoReactionsOn(), false);
  setAutoReactions(true);
  assert.equal(isAutoReactionsOn(), true);
  assert.equal(loadStyle().autoReactions, true);
  setAutoReactions(false);
  assert.equal(isAutoReactionsOn(), false, 'und wieder aus');
});

test('Stimmung umstellen — nur gültige Werte', () => {
  setMood('happy');
  assert.equal(loadStyle().mood, 'happy');
  setMood('aus');
  assert.equal(loadStyle().mood, 'aus');
  assert.equal(setMood(' Quatsch '), false, 'Unfug wird abgelehnt');
  assert.equal(loadStyle().mood, 'aus', 'bleibt beim alten Wert');
  setMood('neutral');
  assert.equal(loadStyle().mood, 'neutral');
  for (const k of Object.keys(MOODS)) assert.ok(MOODS[k].length > 5, k + ' hat eine Beschreibung');
});

/* ── SACHLICH: Gefühle raus, Aussage bleibt ─────────────────────────── */
test('sachlich: Trauer und Schmerz sind raus', () => {
  setMood('neutral'); setHelloKitty(true); setDeko(false);
  const faelle = [
    ['♡ _hellokitty baby maxi by maxichen · mit Tränen gebaut_ ♡', 'ordentlich gebaut'],
    ['🥀 HelloKitty Baby Maxi 💔 — der traurigste WhatsApp-Bot der Welt', 'ein WhatsApp-Bot'],
    ['der traurigste Ort auf WhatsApp', 'ein Ort auf WhatsApp'],
    ['╭───〔 🕯️ *TRAURIGER START* 〕───╮', 'START'],
    ['🎪 Kitty-Zirkus · traurige Clowns', 'Kitty-Zirkus · Clowns'],
    ['🌫️ frag später nochmal. ich bin noch nicht fertig traurig.', 'noch nicht so weit'],
    ['alles tut weh · trotzdem online', 'alles läuft'],
    ['signiert: by maxichen · es tut weh', 'wie immer']
  ];
  for (const [eingabe, erwartet] of faelle) {
    const aus = polishText(eingabe);
    assert.ok(aus.includes(erwartet), `"${erwartet}" fehlt in: ${aus}`);
    assert.ok(!/traurig/i.test(aus), 'noch „traurig" enthalten: ' + aus);
    assert.ok(!/Tränen|weh/i.test(aus), 'noch Schmerz enthalten: ' + aus);
  }
});

test('sachlich: „niemand …" wird zur nüchternen Feststellung', () => {
  setMood('neutral'); setDeko(false);
  const faelle = [
    ['Niemand schreibt zurück', 'Keine Rückmeldung'],
    ['niemand schreibt zurück', 'keine Rückmeldung'],
    ['keiner schreibt zurück', 'keine Rückmeldung'],
    ['niemand schaut zu', 'keine Zuschauer'],
    ['niemand hat geantwortet', 'keine Antwort'],
    ['niemand antwortet hier', 'keine Antwort']
  ];
  for (const [eingabe, erwartet] of faelle) {
    assert.ok(polishText(eingabe).includes(erwartet), `"${erwartet}" fehlt in: ${polishText(eingabe)}`);
  }
});

test('sachlich: Liebessprache und Kitsch verschwinden', () => {
  setMood('neutral'); setDeko(false);
  assert.ok(polishText('• *$kiss @user* — einen Kuss schicken 💋').includes('einen Gruß schicken'));
  assert.ok(polishText('• *$hug @user* — eine Umarmung vortäuschen').includes('einen Gruß senden'));
  assert.ok(polishText('gibt einen kuss auf die stirn. es bedeutet nichts').includes('Zeichen ohne Bedeutung'));
  assert.ok(polishText('küsst 💔 … aber ohne gefühl').includes('ohne Hintergedanken'));
  assert.match(polishText('Sende deiner Mama „Ich liebe dich“!'), /einen Gruß/i);
  assert.ok(polishText('💔 emo · verletzt · einsam · Hello-Kitty-Baby').includes('Hello-Kitty-Baby'));
  assert.ok(!/kuss|küss|liebe/i.test(polishText('einen Kuss schicken · Ich liebe dich')));
});

test('sachlich: Kosenamen aus Datenbeständen werden neutral', () => {
  setMood('neutral'); setDeko(false);
  assert.ok(!/Schatzi|Schatz|Herzblatt/i.test(polishText('Hallo Schatzi, hier ist dein Schatz.')));
  assert.ok(polishText('Küsschen zurück').includes('Gruß'));
});

/* ── PINK: der Mädchen-Stil ─────────────────────────────────────────── */
test('Symbole werden pink: 💔→💗 · 🥀→🎀 · 🌧→🌸 · 💋→🎀', () => {
  setMood('neutral'); setHelloKitty(true); setDeko(false);
  assert.ok(polishText('💔').includes('💗'));
  assert.ok(polishText('🥀').includes('🎀'));
  assert.ok(polishText('🌧️').includes('🌸'), 'Regen wird zur Kirschblüte');
  assert.ok(polishText('💋').includes('🎀'));
  assert.ok(polishText('😭').includes('🌸'));
  /* Achtung: [💔🥀🌧] als Zeichenklasse würde auch 💗 treffen (Surrogat-
     Paare!) — deshalb einzeln prüfen. */
  const fertig = polishText('💔 🥀 🌧️ 😭 💋');
  for (const duester of ['\u{1F494}', '\u{1F940}', '\u{1F327}', '\u{1F62D}', '\u{1F48B}']) {
    assert.ok(!fertig.includes(duester), `Symbol ${duester} ist noch da: ${fertig}`);
  }
});

test('funktionale Symbole bleiben unangetastet (Wetter, Geld, Musik)', () => {
  setMood('neutral'); setHelloKitty(true); setDeko(false);
  const wetter = '🌡️ *14 °C* _(gefühlt 12 °C)_ · 💨 Wind 9 km/h · ☔ Regen möglich';
  assert.equal(polishText(wetter), wetter, 'Wetter ist Technik, kein Gefühl');
  assert.equal(polishText('💰 250 Coins · 🎵 Lied · ✅ erledigt'), '💰 250 Coins · 🎵 Lied · ✅ erledigt');
});

test('pink aus: Symbole bleiben, aber sachlich bleibt sachlich', () => {
  setMood('neutral'); setHelloKitty(false); setDeko(false);
  assert.equal(polishText('💔'), '💔', 'Symbol bleibt');
  assert.ok(polishText('mit Tränen gebaut').includes('ordentlich gebaut'), 'Wendung trotzdem neutral');
  setHelloKitty(true);
});

/* ── Schleife (Deko) ────────────────────────────────────────────────── */
test('Schleife: steht voran, lässt sich abschalten, doppelt nie', () => {
  setMood('neutral'); setHelloKitty(true); setDeko(true);
  assert.ok(polishText('Tagesgeschenk abgeholt.').startsWith('🎀 '), 'Schleife voran');
  assert.equal(polishText('🎁 schon ein Symbol').startsWith('🎀 '), false, 'kein zweites Symbol');
  assert.equal(polishText('♡ Signatur').startsWith('🎀 '), false);
  setDeko(false);
  assert.equal(isDekoOn(), false);
  assert.ok(!polishText('Tagesgeschenk abgeholt.').startsWith('🎀 '), 'abgeschaltet');
  setDeko(true);
});

/* ── Stimmung „aus" und Stabilität ──────────────────────────────────── */
test('Stimmung „aus": alles bleibt, wie es ist', () => {
  setMood('aus'); setDeko(true);
  const roh = '💔 🥀 mit Tränen gebaut — niemand schaut zu';
  assert.equal(polishText(roh), roh, 'auch die Schleife entfällt');
  setMood('neutral');
});

test('zweimal angewendet ändert nichts mehr (stabil)', () => {
  setMood('neutral'); setDeko(true);
  for (const t of ['💔 🥀 mit Tränen gebaut', 'niemand schaut zu', '🌧️ Regen', 'Niemand ist blockiert.']) {
    const einmal = polishText(t);
    assert.equal(polishText(einmal), einmal, 'unerwartete Schleife bei: ' + t);
  }
});

/* ── Schutz: Inhalt darf nicht verfälscht werden ────────────────────── */
test('Aussagen bleiben inhaltlich richtig (kein sinnentstellender Tausch)', () => {
  setMood('neutral'); setDeko(false);
  const sicher = [
    'Niemand ist blockiert. 💜',
    'Niemand ist gemutet.',
    'Niemand ist aktuell AFK. 🎉',
    'der Owner kann den Bot die Gruppe verlassen lassen.',
    'gemeinsamer Konverter-Kern',
    'Nur du kannst das — niemand sonst.',
    '$stimmung traurig · $stimmung glücklich'
  ];
  for (const t of sicher) {
    assert.equal(polishText(t), t, `verändert: ${t}`);
  }
});

test('Befehle bleiben aufrufbar (Texte mit $-Befehlen werden nicht verfälscht)', () => {
  setMood('neutral'); setDeko(false);
  const zeile = '• *$kiss @user* — einen Gruß schicken';
  assert.match(polishText('• *$kiss @user* — einen Kuss schicken 💋'), /\$kiss/, 'Befehl bleibt stehen');
  assert.ok(polishText(zeile).includes('$kiss'));
});

/* ── Versandweg ─────────────────────────────────────────────────────── */
test('nur Textfelder werden angefasst — Medien und Strukturen nie', () => {
  setMood('neutral'); setHelloKitty(true); setDeko(false);
  const bild = polishContent({ image: { url: '💔.png' }, caption: '🥀 Titel' });
  assert.equal(bild.image.url, '💔.png', 'Medien unberührt');
  assert.ok(bild.caption.includes('🎀'), 'nur die Überschrift wird rosa');

  const nurText = polishContent({ text: '💔' });
  assert.ok(nurText.text.includes('💗'));

  const fremd = { react: { text: '💔', key: {} } };
  assert.equal(polishContent(fremd).react.text, '💔', 'Reaktionen laufen über den Schalter, nicht über den Filter');

  assert.equal(polishContent(null), null);
  assert.equal(polishContent(42), 42);
  assert.doesNotThrow(() => polishContent(Object.create(null)));
});

test('Reaktionen im Mädchen-Stil', () => {
  setHelloKitty(true);
  assert.equal(reactionEmoji('✅'), '💗');
  assert.equal(reactionEmoji('❌'), '🙀');
  assert.equal(reactionEmoji('⏳'), '🎀');
  assert.equal(reactionEmoji('❔'), '❔', 'unbekannte bleiben');
  setHelloKitty(false);
  assert.equal(reactionEmoji('✅'), '✅');
  setHelloKitty(true);
});

test('Statusausgabe ist vollständig', () => {
  const st = styleStatus();
  assert.ok(st.mood && st.moodText && typeof st.autoReactions === 'boolean');
  assert.equal(typeof st.deko, 'boolean', 'Schleife wird mit angezeigt');
  assert.ok(st.datei.includes('botstyle.json'));
});

test('der Schalter ist im Versandweg verdrahtet (waApi.js)', () => {
  const src = fs.readFileSync(new URL('../waApi.js', import.meta.url), 'utf8');
  assert.match(src, /import \{ isAutoReactionsOn, reactionEmoji \} from '\.\/botStyle\.js';/);
  const fn = src.slice(src.indexOf('async function sendReaction'));
  assert.match(fn.slice(0, 400), /isAutoReactionsOn\(\)/, 'Schalter muss am Anfang stehen');
  assert.match(fn, /reactionEmoji\(/, 'Mädchen-Symbole werden angewendet');
});

test('der Stilfilter sitzt am Versand (Love.js)', () => {
  const src = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
  assert.match(src, /polishContent\(inhalt\)/, 'alle ausgehenden Nachrichten laufen durch');
  assert.match(src, /setDeko/, 'Schleife ist schaltbar');
});

test('kein Test-Müll in der echten Database', () => {
  assert.ok(fs.existsSync(path.join(TMP, 'botstyle.json')), 'Stand liegt im Temp-Verzeichnis');
});

/* ── Alternative „happy" bleibt erhalten ────────────────────────────── */
test('Stimmung „happy" bleibt als Alternative verfügbar', () => {
  setMood('happy'); setHelloKitty(true); setDeko(false);
  assert.ok(polishText('mit Tränen gebaut').includes('mit Herz gebaut'));
  assert.ok(polishText('niemand schaut zu').includes('alle schauen zu'));
  setMood('neutral');
});

test('Groß-/Kleinschreibung passt sich dem Text an', () => {
  setMood('neutral'); setDeko(false);
  assert.equal(polishText('der traurigste WhatsApp-Bot der Welt.'), 'ein WhatsApp-Bot.');
  assert.equal(polishText('Der traurigste WhatsApp-Bot der Welt.'), 'Ein WhatsApp-Bot.');
  assert.equal(polishText('niemand schreibt zurück'), 'keine Rückmeldung');
  assert.equal(polishText('Niemand schreibt zurück.'), 'Keine Rückmeldung.');
  assert.equal(polishText('TRAURIGER START'), 'START', 'durchgehende Großschrift bleibt groß');
  assert.ok(!/traurigste|trauriger/i.test(polishText('Der traurigste WhatsApp-Bot der Welt.')));
});

/* ── Gefühls-Wörterbuch (sachlich) ──────────────────────────────────── */
test('Gefühls-Wörter werden sachlich (Liebe · Herz · Kuss)', () => {
  setMood('neutral'); setDeko(false); setHelloKitty(true);
  assert.equal(polishText('Manchmal braucht Liebe keine großen Worte.'), 'Manchmal braucht Beziehung keine großen Worte.');
  assert.equal(polishText('Deine Art zu lieben ist selten.'), 'Deine Art zu schätzen ist selten.');
  assert.equal(polishText('Eine wichtige Entscheidung im Herzen steht an.'), 'Eine wichtige Entscheidung im Sinn steht an.');
  assert.ok(polishText('Küsse: 12 · Umarmungen: 4').includes('Grüße: 12'));
  assert.ok(polishText('Küsse: 12 · Umarmungen: 4').includes('Begegnungen: 4'), 'Zähler bleiben unterscheidbar');
});

test('Zitate bleiben unangetastet (Literatur wird nicht umgeschrieben)', () => {
  setMood('neutral'); setDeko(false);
  const rilke = '„Liebe besteht aus zwei Einsamkeiten, die sich schützen und begrenzen.“ — Rainer Maria Rilke';
  assert.equal(polishText(rilke), rilke);
  const exupery = '„Man sieht nur mit dem Herzen gut.“ — Antoine de Saint-Exupéry';
  assert.equal(polishText(exupery), exupery);
});

test('feste Grußformeln bleiben korrekt', () => {
  setMood('neutral'); setDeko(false);
  assert.equal(polishText('Liebe Grüße vom Team'), 'Liebe Grüße vom Team');
  assert.equal(polishText('Herzliche Grüße und einen schönen Tag'), 'Herzliche Grüße und einen schönen Tag');
});

test('Befehle und Fachbegriffe werden nicht verfälscht', () => {
  setMood('neutral'); setDeko(false);
  assert.equal(polishText('$liebe @user · $liebesbrief · $kuss @user'), '$liebe @user · $liebesbrief · $kuss @user');
  assert.equal(polishText('🌡️ gefühlt 12 °C · Herzlichen Glückwunsch!'), '🌡️ gefühlt 12 °C · Herzlichen Glückwunsch!');
  assert.equal(polishText('Lieblingslied und Lieblingsgetränk'), 'Lieblingslied und Lieblingsgetränk');
});

test('Gefühls-Wörterbuch gilt nur für die sachliche Stimmung', () => {
  setMood('happy'); setDeko(false);
  assert.equal(polishText('Manchmal braucht Liebe keine großen Worte.'), 'Manchmal braucht Liebe keine großen Worte.');
  setMood('aus');
  assert.equal(polishText('Liebe und Herzen überall'), 'Liebe und Herzen überall');
  setMood('neutral');
});
