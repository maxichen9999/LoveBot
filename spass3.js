/* ═══════════════════════════════════════════════════════════════════════
   ✨ S P A S S 3 (spass3.js) — kleine Freuden & praktische Helfer
   ─────────────────────────────────────────────────────────────────────
   Dritter Spaß-Block (nach spass.js und spass2.js), gleiche Konventionen:
     · reine Funktionen, State in Database/spass3.json
     · SPASS3_DB_DIR überschreibt das Verzeichnis (für Tests)
     · alles offline — keine API, kein Key, kein Zufall aus dem Netz

   Enthaltene Befehle:
     · glueckskeks   — Keks des Tages + Glückszahlen 🥠
     · zzungenbrecher — Zungenbrecher der Runde 👅
     · sprueche      — deutsche Sprichwörter & Weisheiten 📜
     · motivation    — kleiner Motivations-Kick ⚡
     · changelog     — was ist neu im Bot? 🆕
     · kw            — Kalenderwoche mit Fortschritt 📅
     · farbverlauf   — CSS-Gradienten zum Kopieren 🎨
   ═══════════════════════════════════════════════════════════════════════ */

/* ── deterministischer Zufall pro (schlüssel, tag) ──────────────────── */
function strHash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Heutiger Tagesschlüssel — gleicher Tag → gleicher Spruch */
function tagSchluessel(heute = new Date()) {
  return `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}-${String(heute.getDate()).padStart(2, '0')}`;
}

/* ═══════════════════════════════════════════════════════════════════════
   1 · GLÜCKSKEKS 🥠 — Sprichwort des Tages + 6 Glückszahlen
   ═══════════════════════════════════════════════════════════════════════ */

const KEKSE = [
  'Wer langsam geht, kommt auch an — und sieht mehr.',
  'Das beste Werkzeug ist der Mut, es zu benutzen.',
  'Ein gutes Wort wiegt mehr als ein ganzes Buch.',
  'Heute ist ein guter Tag, um anzufangen.',
  'Wer teilt, hat doppelt — besonders bei Kuchen.',
  'Manchmal ist der Umweg der schönste Weg.',
  'Sterne kann man nicht kaufen, aber man kann sie verschenken.',
  'Die besten Geschichten beginnen mit „und dann".',
  'Geduld ist der Schlüssel, der fast jedes Schloss öffnet.',
  'Wenn dir etwas wichtig ist, mach es — auch wenn du zitterst.',
  'Jeder Tag bringt eine neue Chance, freundlich zu sein.',
  'Wer fragt, findet — wer wartet, wird gefunden.',
  'Das Glück mag die, die es weitergeben.',
  'Kleine Schritte sind auch Schritte.',
  'Ein Lächeln kostet nichts und ist unbezahlbar.',
  'Hör auf dein Herz — es kennt den Weg.',
  'Auch der längste Weg beginnt mit einer Nachricht.',
  'Was du heute säst, erntet dein Ich von morgen.',
  'Die schönsten Dinge im Leben sind nicht käuflich.',
  'Trau dich — die meisten Chancen verstecken sich hinter Türen.'
];

const KEKS_GLUECK = [
  'Deine Glücksfarbe heute: Rosa 💗',
  'Dein Glücksmoment: die erste Tasse Kaffee ☕',
  'Dein Glückszahl-Tag: heute zählt die 7 🎰',
  'Dein Glücksgefühl: wenn jemand dir zuerst schreibt 💬',
  'Dein Glücksbringer: ein offenes Fenster 🌬️',
  'Dein Glücksstern: der hellste am Himmel ⭐'
];

export function glueckskeks(schlussel = 'heute', heute = new Date()) {
  const seed = strHash(tagSchluessel(heute) + '|keks|' + schlussel);
  const rnd = mulberry(seed);
  const spruch = KEKSE[Math.floor(rnd() * KEKSE.length) % KEKSE.length];
  const glueck = KEKS_GLUECK[Math.floor(rnd() * KEKS_GLUECK.length) % KEKS_GLUECK.length];
  const zahlen = [];
  while (zahlen.length < 6) {
    const z = 1 + Math.floor(rnd() * 49);
    if (!zahlen.includes(z)) zahlen.push(z);
  }
  zahlen.sort((a, b) => a - b);
  return { spruch, glueck, zahlen, datum: tagSchluessel(heute) };
}

/* ═══════════════════════════════════════════════════════════════════════
   2 · ZUNGENBRECHER 👅 — dreimal schnell gesagt
   ═══════════════════════════════════════════════════════════════════════ */

const ZUNGENBRECHER = [
  'Fischers Fritze fischt frische Fische.',
  'Blaukraut bleibt Blaukraut und Brautkleid bleibt Brautkleid.',
  'Wenn Fliegen hinter Fliegen fliegen, fliegen Fliegen Fliegen nach.',
  'Am zehnten Zehnten zehn Uhr zehn zogen zehn zahme Ziegen zehn Zentner Zucker zum Zoo.',
  'Schnecken erschrecken nicht, wenn Schnecken an Schnecken schlecken.',
  'Der Whiskymixer mixt den Whiskey mit dem Wodka mixer.',
  'Kleine Kinder können keinen Kaffee kochen.',
  'Rhabarberbarbarabarbaren machen Barbaren das Bartrasieren madig.',
  'Ein plappernder Schneider plappert beim Plätten.',
  'Hinter Hermann Hansens Haus hängen hundert Hemden hinaus.',
  'Der Kuckuck und die Nachtigall streiten sich um den schönsten Schlag.',
  'Brautkleider bleiben Brautkleider und Blaukraut bleibt Blaukraut.',
  'Zehn zahme Ziegen zogen zehn Zentner Zucker zum Zoo.',
  'Es saßen zwei schwarze Schnecken auf dem sonnigen Stein.',
  'Wir Wiener Waschweiber würden weiße Wäsche waschen, wenn wir wüssten, wo warmes Wasser wächst.'
];

export function zungenbrecher(schlussel = 'runde') {
  const rnd = mulberry(strHash(schlussel + '|' + Date.now()));
  return pick(ZUNGENBRECHER, rnd);
}

function pick(liste, rnd) {
  return liste[Math.floor(rnd() * liste.length) % liste.length];
}

/* ═══════════════════════════════════════════════════════════════════════
   3 · SPRÜCHE 📜 — Weisheiten für den Tag
   ═══════════════════════════════════════════════════════════════════════ */

const SPRUECHE = [
  { text: 'Auch aus Steinen, die dir in den Weg gelegt werden, kann man Schönes bauen.', von: 'Johann Wolfgang von Goethe' },
  { text: 'Das Leben ist zu kurz für später.', von: 'unbekannt' },
  { text: 'Wer sich selbst kennt, kann andere nicht verlieren.', von: 'chinesisches Sprichwort' },
  { text: 'Freundlichkeit ist eine Sprache, die Taube und Blinde verstehen.', von: 'unbekannt' },
  { text: 'Der beste Zeitpunkt, einen Baum zu pflanzen, war vor zwanzig Jahren. Der zweitbeste ist heute.', von: 'chinesisches Sprichwort' },
  { text: 'Man sieht nur mit dem Herzen gut.', von: 'Antoine de Saint-Exupéry' },
  { text: 'Es ist nicht genug, zu wissen — man muss auch anwenden.', von: 'Johann Wolfgang von Goethe' },
  { text: 'Die einzige Konstante im Leben ist die Veränderung.', von: 'Heraklit' },
  { text: 'Ein Freund ist jemand, der deine Lieder singt, wenn du deine Stimme verlierst.', von: 'unbekannt' },
  { text: 'Handle so, dass die Maxime deines Willens jederzeit zugleich als Prinzip einer allgemeinen Gesetzgebung gelten könnte.', von: 'Immanuel Kant' },
  { text: 'Wenn der Wind der Veränderung weht, bauen die einen Mauern und die anderen Windmühlen.', von: 'chinesisches Sprichwort' },
  { text: 'Phantasie ist wichtiger als Wissen, denn Wissen ist begrenzt.', von: 'Albert Einstein' },
  { text: 'Nicht die Jahre in unserem Leben zählen, sondern das Leben in unseren Jahren.', von: 'Abraham Lincoln' },
  { text: 'In der Mitte von Schwierigkeiten liegen die Möglichkeiten.', von: 'Albert Einstein' },
  { text: 'Was wir lieben, lässt uns nicht los.', von: 'unbekannt' },
  { text: 'Der kürzeste Weg zu sich selbst führt um die Welt.', von: 'unbekannt' },
  { text: 'Zwei Dinge erfüllen das Gemüt mit immer neuer Bewunderung: der bestirnte Himmel über mir und das moralische Gesetz in mir.', von: 'Immanuel Kant' },
  { text: 'Auch der weiteste Weg beginnt mit einem ersten Schritt.', von: 'Laotse' },
  { text: 'Wer anderen eine Grube gräbt, hat selbst ein Grab verdient.', von: 'deutsches Sprichwort' },
  { text: 'Jeder Mensch hat ein Laster: beim einen ist es das eine, beim anderen das Gegenteil.', von: 'unbekannt' }
];

export function spruch(schlussel = 'tag', heute = new Date()) {
  const rnd = mulberry(strHash(tagSchluessel(heute) + '|spruch|' + schlussel));
  return pick(SPRUECHE, rnd);
}

/* ═══════════════════════════════════════════════════════════════════════
   4 · MOTIVATION ⚡ — kleiner Kick für zwischendurch
   ═══════════════════════════════════════════════════════════════════════ */

const MOTIVATION = [
  'Du musst nicht perfekt sein — du musst nur anfangen. 🌱',
  'Jeder Profi war mal ein Anfänger, der nicht aufgegeben hat. 💪',
  'Ein schlechter Tag macht noch kein schlechtes Leben. ☀️',
  'Vergleiche dich mit dem Menschen, der du gestern warst. 📈',
  'Du darfst langsam sein — du darfst nur nicht stehen bleiben. 🐢',
  'Deine Energie folgt deiner Aufmerksamkeit. Wähl sie weise. ⚡',
  'Auch ein Rückschlag ist ein Schritt — nur rückwärts, und das ist auch okay. 🔄',
  'Mach heute eine Sache, für die dein Zukunfts-Ich dir danken wird. 🙏',
  'Der beste Code, den du je schreiben wirst, ist der, mit dem du heute anfängst. 💻',
  'Trink Wasser, sei nett, bleib neugierig. 💧'
];

const MOTIVATION_MINI = [
  'Atme tief. Du schaffst das. 🌬️',
  'Ein Schritt reicht für heute. 👣',
  'Du bist weiter, als du denkst. 🌟',
  'Pause ist auch produktiv. ☕'
];

export function motivation(kurz = false) {
  const rnd = mulberry(strHash('motivation|' + Date.now()));
  return kurz ? pick(MOTIVATION_MINI, rnd) : pick(MOTIVATION, rnd);
}

/* ═══════════════════════════════════════════════════════════════════════
   5 · CHANGELOG 🆕 — was ist neu im Bot?
   ═══════════════════════════════════════════════════════════════════════ */

export const CHANGELOG = [
  {
    version: '7.2', datum: '04.10.2026', titel: 'Love wird schlauer',
    punkte: [
      'KI „Love" behält Erklärungen — „wie bekomme ich XP?" kommt jetzt mit Anleitung',
      'Mathe in Alltagssprache: „15% von 230", „Wurzel aus 16", „5 hoch 3"',
      'Befehlssuche findet keine Fantasie-Treffer mehr („haus" ≠ „haustier")',
      'Folgefragen behalten den Kontext („und was kostet das?")'
    ]
  },
  {
    version: '7.2', datum: '04.10.2026', titel: 'Sieben neue Spiele & Tools',
    punkte: [
      '$hangman — Galgenmännchen rund um die Liebe 🪢',
      '$connect4 — Vier gewinnt gegen Love 💜',
      '$mastermind — Code aus 4 Ziffern knacken 🧠',
      '$bj — Blackjack mit Spielchips 🂱',
      '$stopuhr · $alter · $todo — Stoppuhr, Alter, Aufgabenliste'
    ]
  },
  {
    version: '7.1', datum: '04.10.2026', titel: 'Zehn Spaß-Befehle',
    punkte: [
      '$kampf — Kampf-Simulation mit HP-Log ⚔️',
      '$teams — zufällige Teams losen 🎲',
      '$zahlenraten — Zahl erraten mit Rekord 🔢',
      '$ttt — Tic-Tac-Toe gegen Love 💜',
      '$ascii · $rot13 · $umkehren · $wortzaehler · $promille'
    ]
  },
  {
    version: '7.0', datum: '02.10.2026', titel: 'Neuer Website-Stil',
    punkte: [
      'Frische Optik für alle Seiten — heller, runder, schneller',
      'Live-Statistiken direkt auf der Startseite',
      'maxichen.de ist die Hauptadresse'
    ]
  }
];

export function changelog(version = null) {
  if (version) {
    const eintrag = CHANGELOG.find((c) => c.version === version);
    return eintrag ? [eintrag] : [];
  }
  return CHANGELOG.slice(0, 3);
}

/* ═══════════════════════════════════════════════════════════════════════
   6 · KALENDERWOCHE 📅 — KW + Fortschritt + Resttage
   ═══════════════════════════════════════════════════════════════════════ */

export function kalenderwoche(heute = new Date()) {
  const d = new Date(Date.UTC(heute.getFullYear(), heute.getMonth(), heute.getDate()));
  const tag = d.getUTCDay() || 7;                      /* Montag = 1 */
  d.setUTCDate(d.getUTCDate() + 4 - tag);              /* Donnerstag dieser Woche */
  const jahrStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const kw = Math.ceil((((d - jahrStart) / 86400000) + 1) / 7);

  const tage = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const wochenTag = tage[tag - 1];
  const fortschritt = Math.round((tag / 7) * 100);
  const rest = 7 - tag;

  /* Jahresfortschritt */
  const jahr = heute.getFullYear();
  const tageImJahr = ((jahr % 4 === 0 && jahr % 100 !== 0) || jahr % 400 === 0) ? 366 : 365;
  const jahresStart = Date.UTC(jahr, 0, 1);
  const heuteUtc = Date.UTC(jahr, heute.getMonth(), heute.getDate());
  const tageVergangen = Math.floor((heuteUtc - jahresStart) / 86400000) + 1;
  const jahresProzent = Math.round((tageVergangen / tageImJahr) * 100);

  return {
    kw,
    jahr,
    wochenTag,
    tagDerWoche: tag,
    wochenFortschritt: fortschritt,
    restTage: rest,
    tageVergangen,
    tageImJahr,
    jahresFortschritt: jahresProzent,
    tageRestImJahr: tageImJahr - tageVergangen
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   7 · FARBVERLAUF 🎨 — CSS-Gradienten zum Kopieren
   ═══════════════════════════════════════════════════════════════════════ */

const PALETTEN = [
  { name: 'Kirschblüte', von: '#ff9a9e', zu: '#fecfef', winkel: 135 },
  { name: 'Himbeereis', von: '#ee9ca7', zu: '#ffdde1', winkel: 120 },
  { name: 'Lavendel', von: '#a18cd1', zu: '#fbc2eb', winkel: 135 },
  { name: 'Ozean', von: '#209cff', zu: '#68e0cf', winkel: 120 },
  { name: 'Sonnenaufgang', von: '#ff9a56', zu: '#ffd26f', winkel: 100 },
  { name: 'Minze', von: '#43e97b', zu: '#38f9d7', winkel: 135 },
  { name: 'Traum', von: '#667eea', zu: '#764ba2', winkel: 135 },
  { name: 'Pfirsich', von: '#ffecd2', zu: '#fcb69f', winkel: 120 },
  { name: 'Nacht', von: '#30cfd0', zu: '#330867', winkel: 135 },
  { name: 'Flammenkuss', von: '#f83600', zu: '#f9d423', winkel: 120 },
  { name: 'Eisblau', von: '#e0c3fc', zu: '#8ec5fc', winkel: 135 },
  { name: 'Rosengold', von: '#ffe29f', zu: '#ffa99f', winkel: 120 }
];

export function farbverlauf(schlussel = 'zufall') {
  const rnd = mulberry(strHash(schlussel + '|' + Date.now()));
  const p = pick(PALETTEN, rnd);
  return {
    name: p.name,
    von: p.von,
    zu: p.zu,
    winkel: p.winkel,
    css: `linear-gradient(${p.winkel}deg, ${p.von}, ${p.zu})`,
    tipp: 'Perfekt für Buttons, Überschriften oder WhatsApp-Status 🌈'
  };
}

export function farbverlaufAlle() {
  return PALETTEN.map((p) => ({ name: p.name, css: `linear-gradient(${p.winkel}deg, ${p.von}, ${p.zu})` }));
}
