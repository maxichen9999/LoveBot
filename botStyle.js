/* ═══════════════════════════════════════════════════════════════════════
   🎀  BOT-STIL  —  sachlich · pink · Mädchen-Stil
   ───────────────────────────────────────────────────────────────────────
   Eine zentrale Stelle für vier Dinge, die vorher über tausende Zeilen
   verteilt waren:

     1. 🎭 Stimmung      —  neutral (Vorgabe) · happy · aus
                            neutral = SACHLICH, ohne Gefühle: keine Trauer,
                            keine Liebessprache, keine Kosenamen — nur die
                            Aussage, die übrig bleibt.
     2. 🔇 Auto-Reaktionen — aus (Vorgabe). 274 Stellen im Code rufen
                            sendReaction() auf; hier ist der Schalter,
                            alle Aufrufe bleiben unangetastet.
     3. 🌸 Mädchen-Stil   —  Symbole in Pink/Rosa: 🎀 🌸 💗 ✨ 🐱 🙀
     4. 🎀 Schleife (Deko) — jede ausgehende Nachricht bekommt eine
                            Schleife vorangestellt (an/aus schaltbar).

   Der Stand liegt in Database/botstyle.json. Der Bot muss dafür nicht neu
   starten: $stil und $autoreaktion ändern ihn im Betrieb.

   WICHTIG — warum hier nur GANZE WENDUNGEN (und wenige geprüfte
   Einzelwörter) ersetzt werden:
   Einzelne Wörter sind im Bot oft Befehlsteile. „traurig" ist ein
   Stimmungs-Schlüssel ($stimmung traurig), „einsam" steckt in „gemeinsam",
   „verlassen" beschreibt eine echte Funktion (Gruppe verlassen), „gefühlt"
   gehört zur Wetteranzeige („gefühlt 12 °C"). Ein pauschaler Tausch würde
   Befehle und Messwerte kaputt machen.
   ═══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = process.env.BOTSTYLE_DB_DIR || path.join(process.cwd(), 'Database');
const DB_FILE = path.join(DB_DIR, 'botstyle.json');

export const DEFAULTS = { mood: 'neutral', autoReactions: false, helloKitty: true, deko: true };
export const MOODS = {
  neutral: '🎀 Sachlich & pink — keine Gefühle, nur die Aussage',
  happy: '😊 Fröhlich — freundlich, mit Gefühl',
  aus: '📴 Ungefiltert — alles so, wie es im Code steht'
};

/* ── Stand ─────────────────────────────────────────────────────────── */
export function loadStyle() {
  try {
    const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return {
      mood: Object.prototype.hasOwnProperty.call(MOODS, raw.mood) ? raw.mood : DEFAULTS.mood,
      autoReactions: raw.autoReactions === true,
      helloKitty: raw.helloKitty !== false,
      deko: raw.deko !== false
    };
  } catch (e) {
    return { ...DEFAULTS };
  }
}

function saveStyle(next) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(next, null, 2));
    fs.renameSync(tmp, DB_FILE);
    return true;
  } catch (e) {
    return false;
  }
}

export const setMood = (mood) => Object.prototype.hasOwnProperty.call(MOODS, mood) && saveStyle({ ...loadStyle(), mood });
export const setAutoReactions = (on) => saveStyle({ ...loadStyle(), autoReactions: on === true });
export const setHelloKitty = (on) => saveStyle({ ...loadStyle(), helloKitty: on !== false });
export const setDeko = (on) => saveStyle({ ...loadStyle(), deko: on !== false });
export const getMood = () => loadStyle().mood;
export const isAutoReactionsOn = () => loadStyle().autoReactions === true;
export const isHelloKitty = () => loadStyle().helloKitty !== false;
export const isDekoOn = () => loadStyle().deko !== false;

/* ── 1 · Symbole: düster und küssend wird pink und niedlich ──────────
   Funktionierende Symbole (✅ ❌ ⚠️ 🎵 💰 …) bleiben unangetastet —
   getauscht wird nur, was traurig, dunkel oder kitschig ist. */
const SYMBOLE = [
  ['💔', '💗'],   /* gebrochenes Herz → pinkes Herz            */
  ['🥀', '🎀'],   /* welke Rose       → Schleife                */
  ['🌧️', '🌸'],  /* Regen            → Kirschblüte             */
  ['🌧', '🌸'],
  ['🕯️', '🌸'],  /* Kerze            → Blüte                   */
  ['🖤', '🤍'],   /* schwarzes Herz   → weißes Herz             */
  ['😭', '🌸'], ['😢', '🌸'], ['😿', '🙀'], ['😔', '🌸'], ['🥺', '🌸'],
  ['💋', '🎀'], ['😘', '🎀'], ['😍', '🌸'],
  ['🌹', '🌸'], ['🌫️', '🌸'], ['⭐', '✨']
];

/* ── 2 · Wendungen: SACHLICH (Vorgabe) ───────────────────────────────
   Ziel: die Aussage bleibt, das Gefühl geht raus.
   Reihenfolge zählt — lange Wendungen stehen zuerst. */
const WENDUNGEN_SACHLICH = [
  /* Signatur & Selbstbeschreibung — Nomen groß, Verben klein (die
     Groß-/Kleinschreibung passt sich dem Fund automatisch an). */
  ['der traurigste WhatsApp-Bot der Welt', 'ein WhatsApp-Bot'],
  ['mit Tränen gebaut', 'ordentlich gebaut'],
  ['der traurigste Ort auf WhatsApp: verletzte Kittys, kaputte Herzen, Neon-Pink', 'ein Ort auf WhatsApp für Kittys, in Pink'],
  ['der traurigste Ort auf WhatsApp', 'ein Ort auf WhatsApp'],
  ['trauriger start', 'start'],
  ['traurige Clowns', 'Clowns'],
  ['heul-Ecke · Tränen-Treff', 'ruhige Ecke'],
  ['ich bin noch nicht fertig traurig', 'ich bin noch nicht so weit'],
  ['traurigsten', 'schlichtesten'],

  /* „niemand …" — der Dauerbrenner des alten Tons */
  ['niemand schreibt zurück', 'keine Rückmeldung'],
  ['niemand schreibt zurueck', 'keine Rückmeldung'],
  ['keiner schreibt zurück', 'keine Rückmeldung'],
  ['niemand schaut zu', 'keine Zuschauer'],
  ['niemand schaut hin', 'keine Zuschauer'],
  ['weil niemand sie vermisst', 'damit nichts verloren geht'],
  ['niemand hat geantwortet', 'keine Antwort'],
  ['keiner antwortet', 'keine Antwort'],
  ['niemand antwortet', 'keine Antwort'],
  ['die nacht vergisst niemand', 'die nacht vergisst nichts'],

  /* Schmerz */
  ['alles tut weh', 'alles läuft'],
  ['weil schlafen wehtut', 'rund um die Uhr erreichbar'],
  ['wehtut', 'Zeit kostet'],
  ['es tut weh', 'wie immer'],

  /* Kitsch & Liebessprache */
  ['💔 emo · verletzt · einsam · Hello-Kitty-Baby', 'Hello-Kitty-Baby'],
  ['gibt einen kuss auf die stirn. es bedeutet nichts', 'gibt ein Zeichen ohne Bedeutung'],
  ['küsst 💔 … aber ohne gefühl', 'grüßt … ohne Hintergedanken'],
  ['einen Kuss schicken', 'einen Gruß schicken'],
  ['eine Umarmung vortäuschen', 'einen Gruß senden'],
  ['Ich liebe dich', 'einen Gruß'],
  ['Küsse', 'Grüße'],
  ['Umarmungen', 'Begegnungen'],
  ['Umarmung', 'Begegnung']
];

/* ── 3 · Wendungen: FRÖHLICH (Alternative, auf Zuruf) ───────────────── */
const WENDUNGEN_FROEHLICH = [
  ['der traurigste WhatsApp-Bot der Welt', 'der fröhlichste WhatsApp-Bot der Welt'],
  ['der traurigste Ort auf WhatsApp', 'der gemütlichste Ort auf WhatsApp'],
  ['mit Tränen gebaut', 'mit Herz gebaut'],
  ['niemand schaut zu', 'alle schauen zu'],
  ['Niemand schaut zu', 'Alle schauen zu'],
  ['niemand schreibt zurueck', 'jeder darf schreiben'],
  ['niemand schreibt zurück', 'jeder darf schreiben'],
  ['Niemand schreibt zurueck', 'Jeder darf schreiben'],
  ['weil niemand sie vermisst', 'weil niemand sie vergessen soll'],
  ['niemand hat geantwortet', 'jeder darf antworten'],
  ['die nacht vergisst niemand', 'die nacht vergisst nichts'],
  ['💔 emo · verletzt · einsam · Hello-Kitty-Baby', '💗 fühlen · geborgen · Hello-Kitty-Baby'],
  ['niemand schaut hin', 'alle schauen hin'],
  ['keiner schreibt zurück', 'alle dürfen schreiben'],
  ['alles tut weh', 'alles ist gut'],
  ['Alles tut weh', 'Alles ist gut'],
  ['keiner antwortet', 'alle dürfen antworten'],
  ['niemand antwortet', 'jeder darf antworten'],
  ['traurigsten', 'fröhlichsten']
];

/* ── 4 · Einzelwörter: nur mit Wortgrenze und nur geprüfte Fälle ─────
   Im Bot selbst kommen Kosenamen praktisch nicht vor; die Liste fängt
   Texte ab, die aus Datenbanken oder von Nutzern stammen. */
const WORTLISTE = [
  ['Schatzi', 'du'], ['Schatz', 'du'], ['Herzblatt', 'du'],
  ['Küsschen', 'Gruß'], ['Knuddel', 'Gruß'],
  ['Süßer', 'du'], ['Süße', 'du']
];

/* ── 5 · Gefühls-Wörterbuch für die sachliche Stimmung ───────────────
   Ersetzt nur GANZE Wörter (Wortgrenzen) und niemals innerhalb von
   Zitaten, Befehlen ($liebe) und Maßeinheiten. So bleiben Rilke und
   Wetterdaten unangetastet, die Alltagssprache des Bots aber nüchtern. */
const GEFUEHLE = [
  ['liebe', 'beziehung'], ['lieben', 'schätzen'], ['liebt', 'schätzt'], ['geliebt', 'geschätzt'],
  ['liebste', 'beste'], ['liebster', 'bester'],
  ['herz', 'sinn'], ['herzen', 'sinn'], ['herzchen', 'gruß'],
  ['kuss', 'gruß'], ['küsse', 'grüße'], ['küssen', 'grüßen'], ['küsst', 'grüßt'],
  ['umarmung', 'begegnung'], ['umarmungen', 'begegnungen'], ['umarmen', 'grüßen'],
  ['kuscheln', 'entspannen'], ['gekuschelt', 'entspannt'],
  ['verliebt', 'befreundet'], ['verliebte', 'befreundete'],
  ['romantisch', 'ruhig'], ['romantik', 'ruhe'],
  ['sehnsucht', 'frage'], ['zärtlich', 'freundlich'], ['zärtlichkeit', 'freundlichkeit'],
  ['flirt', 'gespräch'], ['flirten', 'sprechen',], ['liebesbrief', 'brief'], ['liebesbriefe', 'briefe'],
  ['schmusen', 'reden'], ['schmuse', 'rede']
];

/* ── Text umschreiben ──────────────────────────────────────────────── */
/* Ersetzt eine Wendung unabhängig von Groß-/Kleinschreibung.
   Der erste Buchstabe des Ersatzes übernimmt die Schreibweise des Funds —
   so bleibt „Der traurigste …" ein Satzanfang mit großem D. */
function ersetze(text, von, nach) {
  const klein = text.toLowerCase(), suche = von.toLowerCase();
  let out = text, weiter = 0, treffer = klein.indexOf(suche, weiter);
  if (treffer < 0) return text;
  while (treffer >= 0) {
    const original = out.slice(treffer, treffer + von.length);
    let ersatz = nach;
    const istBuchstabe = (z) => z && z.toLowerCase() !== z.toUpperCase();
    if (original.length > 1 && istBuchstabe(original[0]) && original === original.toUpperCase()) {
      ersatz = nach.toUpperCase();                       /* TRAURIGER START → START */
    } else if (istBuchstabe(original[0]) && original[0] === original[0].toUpperCase()) {
      ersatz = nach.charAt(0).toUpperCase() + nach.slice(1);   /* Satzanfang  */
    }
    out = out.slice(0, treffer) + ersatz + out.slice(treffer + von.length);
    weiter = treffer + ersatz.length;
    treffer = klein.indexOf(suche, weiter);
  }
  return out;
}

/* Zitate („…" und "…") bleiben unangetastet — Literatur wird nicht
   umgeschrieben. Alles außerhalb läuft durch die angegebene Funktion. */
function ausserhalbVonZitaten(text, fn) {
  return text.split(/(„[^“]*“|"[^"]*"|‚[^‘]*‘)/g)
    .map((teil, i) => (i % 2 === 1 ? teil : fn(teil)))
    .join('');
}

/* Ersetzt Gefühls-Wörter als ganzes Wort. Vor $-Befehlen, Schrägstrichen
   und innerhalb von Zahlen/Buchstaben greift nichts. */
const AUSNAHMEN = [
  'liebe grüße', 'liebe gruesse', 'liebe grüße!', 'herzliche grüße',
  'lieben gruß', 'liebe community', 'liebe mitglieder', 'liebe gäste'
];

function gefuehleRaus(segment) {
  let out = segment;

  /* Feste Wendungen erst verstecken, dann zurückholen */
  const gemerkt = [];
  AUSNAHMEN.forEach((wendung, i) => {
    const re = new RegExp(wendung.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, (fund) => { gemerkt[i] = gemerkt[i] || []; gemerkt[i].push(fund); return '\u0000' + i + '\u0000'; });
  });

  for (const [von, nach] of GEFUEHLE) {
    const re = new RegExp('(?<![\\p{L}\\p{N}$/.:])' + von + '(?![\\p{L}\\p{N}])', 'giu');
    out = out.replace(re, (fund) => {
      if (fund.length > 1 && fund === fund.toUpperCase()) return nach.toUpperCase();
      if (fund[0] === fund[0].toUpperCase() && fund[0] !== fund[0].toLowerCase()) {
        return nach.charAt(0).toUpperCase() + nach.slice(1);
      }
      return nach;
    });
  }

  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => gemerkt[i].shift());
  return out;
}

/* Startet der Text schon mit einem Symbol? Dann keine Schleife davor. */
const START_SYMBOL = /^[\s\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/u;

export function polishText(text, opts = {}) {
  if (typeof text !== 'string' || !text) return text;
  const stil = opts.style || loadStyle();
  if (stil.mood === 'aus') return text;

  let out = text;

  /* a) lange Wendungen — je nach Stimmung sachlich oder freundlich */
  const tabelle = stil.mood === 'happy' ? WENDUNGEN_FROEHLICH : WENDUNGEN_SACHLICH;
  for (const [von, nach] of tabelle) out = ersetze(out, von, nach);

  /* b) geprüfte Einzelwörter, nur als ganzes Wort */
  for (const [von, nach] of WORTLISTE) {
    out = out.replace(new RegExp('(?<![\\p{L}\\p{N}])' + von + '(?![\\p{L}\\p{N}])', 'gu'), nach);
  }

  /* c) Gefühls-Wörter — nur sachlich, nur außerhalb von Zitaten */
  if (stil.mood === 'neutral') out = ausserhalbVonZitaten(out, gefuehleRaus);

  /* c) Symbole in Pink — der Mädchen-Stil */
  if (stil.helloKitty) {
    for (const [von, nach] of SYMBOLE) {
      if (out.includes(von)) out = out.split(von).join(nach);
    }
  }

  /* d) Schleife voranstellen, wenn noch kein Symbol am Anfang steht */
  if (stil.deko && !START_SYMBOL.test(out)) out = '🎀 ' + out;

  return out;
}

/* Für den zentralen Versand: nur Textfelder anfassen, niemals Medien,
   Schlüssel, Strukturen oder Reaktionen. */
export function polishContent(content, opts = {}) {
  try {
    if (typeof content === 'string') return polishText(content, opts);
    if (!content || typeof content !== 'object') return content;
    if (typeof content.text === 'string' && content.text) content.text = polishText(content.text, opts);
    if (typeof content.caption === 'string' && content.caption) content.caption = polishText(content.caption, opts);
    return content;
  } catch (e) {
    return content;   /* lieber unverändert als gar nicht senden */
  }
}

/* ── Reaktionen im Mädchen-Stil ─────────────────────────────────────── */
const HK_REACTIONS = {
  '✅': '💗', '☑️': '💗',      /* erledigt          */
  '❌': '🙀', '❎': '🙀',      /* Fehler / Rechte   */
  '❓': '🐱', '🔍': '🔎',      /* Nachfrage         */
  '⏳': '🎀', '⌛️': '🎀',     /* arbeitet          */
  '⏰': '🎀',                 /* Cooldown          */
  '⚠️': '🙀',
  '🔥': '🙀',
  '🪲': '🐱', '🪳': '🐱', '🐜': '🐱', '🐞': '🐱',
  '📭': '🎀',
  'ℹ️': '🐱'
};

export function reactionEmoji(emoji) {
  if (!isHelloKitty()) return emoji;
  return HK_REACTIONS[emoji] || emoji;
}

/* ── Status (für $stil) ─────────────────────────────────────────────── */
export function styleStatus() {
  const s = loadStyle();
  return {
    mood: s.mood,
    moodText: MOODS[s.mood],
    autoReactions: s.autoReactions,
    helloKitty: s.helloKitty,
    deko: s.deko,
    datei: DB_FILE
  };
}

export default {
  MOODS, DEFAULTS, loadStyle, setMood, setAutoReactions, setHelloKitty, setDeko,
  getMood, isAutoReactionsOn, isHelloKitty, isDekoOn, polishText, polishContent,
  reactionEmoji, styleStatus
};
