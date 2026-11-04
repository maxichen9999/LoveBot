/* ═══════════════════════════════════════════════════════════════════════
   🧮  RECHNER  ·  rechner.js
   ───────────────────────────────────────────────────────────────────────
   Zwei nützliche Werkzeuge, ganz ohne Netz und ohne Nebenwirkungen:

     rechne(ausdruck)                  →  sicheres Ausrechnen von Termen
     umrechnen(wert, von, zu)          →  Einheiten umrechnen

   Bewusst KEIN eval() und kein Function(): der Ausdruck wird zuerst in
   einzelne Bausteine zerlegt und dann selbst ausgewertet. Damit kann aus
   einem Befehl heraus niemals Code ausgeführt werden.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Zahlen hübsch machen (deutsch: 1.234,56) ─────────────────────── */
export function formatiereZahl(wert, { stellen = 6 } = {}) {
  if (!Number.isFinite(wert)) return '—';
  const gerundet = Number(wert.toFixed(stellen));
  const text = String(gerundet).replace('.', ',');
  const [vor, nach] = text.split(',');
  const mitPunkten = vor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return nach ? `${mitPunkten},${nach}` : mitPunkten;
}

/* ═════════════════ 1 · Terme ausrechnen ═════════════════════════════ */

/* Erlaubte Funktionen — nichts davon kommt an den JavaScript-Kern heran */
const FUNKTIONEN = {
  wurzel: Math.sqrt, sqrt: Math.sqrt,
  abs: Math.abs, betr: Math.abs,
  ln: Math.log, log: Math.log10, lg: Math.log10,
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  aufrunden: Math.ceil, abrunden: Math.floor, runden: Math.round,
  rund: Math.round, ceil: Math.ceil, floor: Math.floor
};

const KONSTANTEN = {
  pi: Math.PI, π: Math.PI, tau: Math.PI * 2,
  e: Math.E, phi: (1 + Math.sqrt(5)) / 2
};

/* Was im Text vorkommen darf — alles andere wird abgelehnt */
const ERLAUBT = /^[0-9+\-*/^%().,a-zA-ZäöüÄÖÜßπ\s]+$/;

function zerlege(text) {
  const sauber = String(text).toLowerCase().replace(/,/g, '.').replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, ' pi ').replace(/\*\*/g, '^');
  if (!ERLAUBT.test(sauber)) return null;
  const muster = /\s*(\d+(?:\.\d+)?|[a-zäöüß]+|[+\-*/^%()])/g;
  const teile = [];
  let treffer;
  while ((treffer = muster.exec(sauber)) !== null) teile.push(treffer[1]);
  if (teile.join('').length !== sauber.replace(/\s+/g, '').length) return null;  /* Rest enthält Unzulässiges */
  return teile;
}

/* --- Kleiner Rechner: Term → Zahl (von unten nach oben aufgebaut) --- */
function auswerten(teile) {
  let pos = 0;

  function schau() { return teile[pos]; }
  function nimm() { return teile[pos++]; }
  function pruefe(zeichen) { if (schau() === zeichen) { pos++; return true; } return false; }

  /* ausdruck: 1 + 2 - 3 */
  function ausdruck() {
    let wert = term();
    while (schau() === '+' || schau() === '-') {
      const op = nimm();
      const rechts = term();
      wert = op === '+' ? wert + rechts : wert - rechts;
    }
    return wert;
  }

  /* term: 2 * 3 / 4 % 5   (2(3) gilt als 2*(3)) */
  function term() {
    let wert = faktor();
    for (;;) {
      if (schau() === '*') { pos++; wert *= faktor(); } else if (schau() === '/') { pos++; const d = faktor(); if (d === 0) throw new Error('Durch null teilen geht nicht.'); wert /= d; } else if (schau() === '%') { pos++; const d = faktor(); if (d === 0) throw new Error('Rest durch null geht nicht.'); wert %= d; } else if (schau() === '(' || /^\d/.test(String(schau() || '')) || (schau() && /^[a-zäöüß]/.test(schau()) && !(schau() in FUNKTIONEN))) { wert *= faktor(); } else break;
    }
    return wert;
  }

  /* faktor: 2 ^ 3   — rechts geklammert, wie es sich gehört */
  function faktor() {
    const basis = vorzeichen();
    if (pruefe('^')) {
      const exp = faktor();
      const erg = basis ** exp;
      if (!Number.isFinite(erg)) throw new Error('Das Ergebnis ist zu groß.');
      return erg;
    }
    return basis;
  }

  /* vorzeichen: -5, +5, 5 */
  function vorzeichen() {
    if (pruefe('-')) return -vorzeichen();
    if (pruefe('+')) return vorzeichen();
    return kleinteil();
  }

  /* kleinteil: Zahl, Konstante, Funktion(...) oder (Ausdruck) */
  function kleinteil() {
    const zeichen = schau();
    if (zeichen === undefined) throw new Error('Hier fehlt noch etwas.');

    if (zeichen === '(') {
      pos++;
      const wert = ausdruck();
      if (!pruefe(')')) throw new Error('Eine Klammer ist offen.');
      return wert;
    }

    if (/^\d/.test(zeichen)) { pos++; return Number(zeichen); }

    if (/^[a-zäöüß]/.test(zeichen)) {
      pos++;
      if (zeichen in FUNKTIONEN) {
        if (!pruefe('(')) throw new Error(`Nach ${zeichen} fehlt eine Klammer.`);
        const wert = FUNKTIONEN[zeichen](ausdruck());
        if (!pruefe(')')) throw new Error(`Nach ${zeichen} fehlt eine Klammer.`);
        if (!Number.isFinite(wert)) throw new Error('Das Ergebnis ist keine Zahl.');
        return wert;
      }
      if (zeichen in KONSTANTEN) return KONSTANTEN[zeichen];
      throw new Error(`„${zeichen}" kenne ich nicht.`);
    }

    throw new Error(`„${zeichen}" kann ich nicht lesen.`);
  }

  const ergebnis = ausdruck();
  if (pos < teile.length) throw new Error('Der Rest der Aufgabe ist unverständlich.');
  return ergebnis;
}

/**
 * Rechnet einen Term aus.
 * @returns {{ok:boolean, ergebnis?:number, text?:string, fehler?:string}}
 */
export function rechne(eingabe) {
  const roh = String(eingabe ?? '').trim();
  if (!roh) return { ok: false, fehler: 'Schreib mir eine Aufgabe, zum Beispiel 12 * (3 + 4).' };
  if (roh.length > 200) return { ok: false, fehler: 'Die Aufgabe ist zu lang (höchstens 200 Zeichen).' };

  const teile = zerlege(roh);
  if (!teile || !teile.length) return { ok: false, fehler: 'Ich verstehe nur Zahlen, + - * / % ^ , Klammern und Funktionen.' };

  try {
    const wert = auswerten(teile);
    if (!Number.isFinite(wert)) return { ok: false, fehler: 'Dabei kommt keine sinnvolle Zahl heraus.' };
    if (Math.abs(wert) > 1e15) return { ok: false, fehler: 'Das Ergebnis ist zu groß für mich.' };
    return { ok: true, ergebnis: wert, text: formatiereZahl(wert) };
  } catch (fehler) {
    return { ok: false, fehler: fehler.message || 'Diesen Term kann ich nicht rechnen.' };
  }
}

/* ═════════════════ 2 · Einheiten umrechnen ══════════════════════════ */

/* Jede Kategorie rechnet auf eine Grundeinheit um:
   Länge → Meter, Gewicht → Kilogramm, Volumen → Liter,
   Geschwindigkeit → km/h, Zeit → Sekunden                            */
const EINHEITEN = {
  laenge: {
    name: 'Länge', grund: 'm',
    werte: { mm: 0.001, cm: 0.01, dm: 0.1, m: 1, meter: 1, km: 1000, zoll: 0.0254, inch: 0.0254, fuss: 0.3048, fuß: 0.3048, ft: 0.3048, yard: 0.9144, meile: 1609.344, meilen: 1609.344, mile: 1609.344 }
  },
  gewicht: {
    name: 'Gewicht', grund: 'kg',
    werte: { mg: 0.000001, g: 0.001, gramm: 0.001, kg: 1, kilo: 1, t: 1000, tonne: 1000, pfund: 0.45359237, lb: 0.45359237, oz: 0.02834952, unze: 0.02834952 }
  },
  volumen: {
    name: 'Volumen', grund: 'l',
    werte: { ml: 0.001, cl: 0.01, dl: 0.1, l: 1, liter: 1, hl: 100, m3: 1000, gallon: 3.78541, pint: 0.473176, tasse: 0.24, essloeffel: 0.015, teeloeffel: 0.005 }
  },
  geschwindigkeit: {
    name: 'Geschwindigkeit', grund: 'km/h',
    werte: { kmh: 1, 'km/h': 1, mph: 1.609344, ms: 3.6, 'm/s': 3.6, knoten: 1.852, kn: 1.852 }
  },
  zeit: {
    name: 'Zeit', grund: 's',
    werte: { ms: 0.001, s: 1, sek: 1, sekunde: 1, sekunden: 1, min: 60, minute: 60, minuten: 60, h: 3600, std: 3600, stunde: 3600, stunden: 3600, tag: 86400, tage: 86400, woche: 604800, monat: 2629800, jahr: 31557600, jahre: 31557600 }
  },
  temperatur: {
    name: 'Temperatur', temperatur: true,
    werte: { c: 1, '°c': 1, celsius: 1, f: 1, '°f': 1, fahrenheit: 1, k: 1, kelvin: 1 }
  }
};

/* Namen und Schreibweisen, die auf eine Einheit zeigen */
const ALIAS = {
  meter: 'm', kilometern: 'km', kilometers: 'km', zentimeter: 'cm', cm: 'cm',
  pounds: 'pfund', kilogramm: 'kg', kilogram: 'kg', gramme: 'g', gramm: 'g',
  liter: 'l', milliliter: 'ml', 'stunden-km': 'kmh', stundenkilometer: 'kmh',
  sekunden: 's', minute: 'min', minuten: 'min', stunden: 'h', tage: 'tag',
  'c°': 'c', 'f°': 'k'
};

function findeEinheit(wort) {
  const sauber = String(wort ?? '').trim().toLowerCase()
    .replace(/^°|°$/g, (t) => t)
    .replace(/[³]/g, '3');
  const kandidaten = [sauber, ALIAS[sauber], sauber.replace(/n$/, ''), sauber.replace(/s$/, '')].filter(Boolean);

  for (const k of kandidaten) {
    for (const [kat, daten] of Object.entries(EINHEITEN)) {
      if (k in daten.werte) return { kategorie: kat, einheit: k, daten };
    }
  }
  /* Gradangaben wie „20 °C" oder „20C" */
  const grad = sauber.match(/^([-+]?\d+(?:[.,]\d+)?)\s*(°?\s*[cfk])$/);
  if (grad) return null;
  return null;
}

function temperatur(wert, von, zu) {
  let celsius;
  if (von === 'c' || von === '°c' || von === 'celsius') celsius = wert;
  else if (von === 'f' || von === '°f' || von === 'fahrenheit') celsius = (wert - 32) * 5 / 9;
  else celsius = wert - 273.15;

  if (zu === 'c' || zu === '°c' || zu === 'celsius') return celsius;
  if (zu === 'f' || zu === '°f' || zu === 'fahrenheit') return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

function schoen(name) {
  return ({ c: '°C', '°c': '°C', celsius: '°C', f: '°F', '°f': '°F', fahrenheit: '°F', k: 'K', kelvin: 'K' })[name] || name;
}

/**
 * Rechnet eine Zahl von einer Einheit in eine andere um.
 * @returns {{ok:boolean, text?:string, fehler?:string, kategorie?:string, vorschlaege?:string[]}}
 */
export function umrechnen(wert, von, zu, optionen = {}) {
  const zahl = typeof wert === 'number' ? wert : Number(String(wert ?? '').replace(',', '.').trim());
  if (!Number.isFinite(zahl)) return { ok: false, fehler: 'Die Zahl vorne habe ich nicht verstanden.' };
  if (Math.abs(zahl) > 1e15) return { ok: false, fehler: 'Die Zahl ist zu groß.' };

  const quelle = findeEinheit(von);
  const ziel = findeEinheit(zu);
  if (!quelle) return { ok: false, fehler: `Die Einheit „${von}" kenne ich nicht.` };
  if (!ziel) return { ok: false, fehler: `Die Einheit „${zu}" kenne ich nicht.` };
  if (quelle.kategorie !== ziel.kategorie) {
    return {
      ok: false,
      fehler: `${schoen(quelle.einheit)} und ${schoen(ziel.einheit)} passen nicht zusammen (${quelle.daten.name} ↔ ${ziel.daten.name}).`
    };
  }

  let ergebnis;
  if (ziel.daten.temperatur) {
    ergebnis = temperatur(zahl, quelle.einheit, ziel.einheit);
  } else {
    const inGrund = zahl * quelle.daten.werte[quelle.einheit];
    ergebnis = inGrund / ziel.daten.werte[ziel.einheit];
  }
  if (!Number.isFinite(ergebnis)) return { ok: false, fehler: 'Dabei kommt keine sinnvolle Zahl heraus.' };

  /* Anzeige: bei Temperatur immer °C/°F/K, sonst die Schreibweise der Nutzerin */
  const vonName = quelle.daten.temperatur ? schoen(quelle.einheit) : (optionen.anzeigeVon || schoen(quelle.einheit));
  const zuName = ziel.daten.temperatur ? schoen(ziel.einheit) : (optionen.anzeigeZu || schoen(ziel.einheit));

  return {
    ok: true,
    kategorie: quelle.daten.name,
    ergebnis,
    text: `${formatiereZahl(zahl)} ${vonName} = ${formatiereZahl(ergebnis)} ${zuName}`
  };
}

/**
 * Nimmt eine ganze Eingabe auseinander: „5 km in m", „20 c in f", „1,80 m in fuss"
 * @returns {{ok:boolean, text?:string, fehler?:string}}
 */
export function umrechneText(eingabe) {
  const roh = String(eingabe ?? '').trim();
  if (!roh) return { ok: false, fehler: 'Schreib mir zum Beispiel: 5 km in m' };

  const muster = /^([-+]?\d+(?:[.,]\d+)?)\s*([a-zäöüß°/³]+)?\s*(?:in|nach|to|zu|→|->|=)?\s*([a-zäöüß°/³]+)$/i;
  const treffer = roh.match(muster);
  if (!treffer) return { ok: false, fehler: 'So lese ich das nicht. Versuch: 5 km in m' };

  const [, zahl, von, zu] = treffer;
  if (!von) return { ok: false, fehler: 'Mir fehlt die Zieleinheit. Versuch: 5 km in m' };
  return umrechnen(zahl, von, zu, { anzeigeVon: von, anzeigeZu: zu });
}

/** Alle Kategorien mit ihren Einheiten — für die Übersicht */
export function einheitenUebersicht() {
  return Object.entries(EINHEITEN).map(([id, daten]) => ({
    id,
    name: daten.name,
    einheiten: Object.keys(daten.werte).filter((k, i, a) => a.indexOf(k) === i).map(schoen).sort((a, b) => a.localeCompare(b, 'de'))
  }));
}
