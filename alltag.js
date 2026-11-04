/* ═══════════════════════════════════════════════════════════════════════
   🌸  ALLTAGS-HELFER  ·  alltag.js
   ───────────────────────────────────────────────────────────────────────
   Kleine Werkzeuge für jeden Tag — alle ohne Netz, alle prüfbar:

     entscheide(...)        →  zwischen Möglichkeiten wählen
     teile(...)             →  Rechnung aufteilen
     farbeInfo(...)         →  Farben erklären (Hex · RGB · HSL)
     prozentText(...)       →  Prozent rechnen
     glueck(...)            →  ein freundlicher Spruch für heute

   Kein Zufall, wo er nicht hingehört: „entscheide" und „glueck" würfeln
   wirklich, alles andere rechnet genau.
   ═══════════════════════════════════════════════════════════════════════ */

import { formatiereZahl } from './rechner.js';

/* ── 🌸 Entscheiden ─────────────────────────────────────────────────── */
export function entscheide(optionen = []) {
  const sauber = optionen.map((o) => String(o || '').trim()).filter(Boolean);
  if (sauber.length < 2) return null;
  const wahl = sauber[Math.floor(Math.random() * sauber.length)];
  return { wahl, alle: sauber, anzahl: sauber.length };
}

/* ── 💶 Rechnung teilen ─────────────────────────────────────────────── */
export function teile(betrag, personen, trinkgeldProzent = 0) {
  const summe = typeof betrag === 'number' ? betrag : Number(String(betrag ?? '').replace(',', '.').replace(/[^0-9.\-]/g, ''));
  const leute = Math.floor(Number(personen));
  const tg = Math.max(0, Number(String(trinkgeldProzent ?? 0).replace(',', '.')) || 0);

  if (!Number.isFinite(summe) || summe <= 0) return null;
  if (!Number.isFinite(leute) || leute < 1 || leute > 999) return null;

  const trinkgeld = Math.round(summe * (tg / 100) * 100) / 100;
  const gesamt = Math.round((summe + trinkgeld) * 100) / 100;
  const proPerson = Math.round((gesamt / leute) * 100) / 100;

  return {
    betrag: summe, trinkgeld, gesamt, personen: leute, proPerson,
    text: `${formatiereZahl(summe)} + ${formatiereZahl(trinkgeld)} Trinkgeld = ${formatiereZahl(gesamt)} · ${leute} × ${formatiereZahl(proPerson)}`
  };
}

/* ── 🎨 Farben ──────────────────────────────────────────────────────── */
const FARBNAMEN = {
  rosa: '#ffc0cb', pink: '#e8608f', rot: '#d81b60', dunkelrot: '#8b0000',
  orange: '#f97316', gelb: '#fbbf24', gold: '#d4af37', gruen: '#22c55e',
  grün: '#22c55e', dunkelgruen: '#166534', tuerkis: '#14b8a6', türkis: '#14b8a6',
  cyan: '#06b6d4', blau: '#2563eb', hellblau: '#60a5fa', dunkelblau: '#1e3a8a',
  lila: '#8b5cf6', violett: '#7c3aed', flieder: '#c4b5fd', braun: '#8b5a2b',
  weiss: '#ffffff', weiß: '#ffffff', schwarz: '#000000', grau: '#808080',
  silber: '#c0c0c0', mint: '#a7f3d0', pfirsich: '#ffd3b6', lavendel: '#e6e6fa'
};

function hexZuRgb(hex) {
  const h = String(hex).replace('#', '').trim();
  const voll = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-f]{6}$/i.test(voll)) return null;
  return { r: parseInt(voll.slice(0, 2), 16), g: parseInt(voll.slice(2, 4), 16), b: parseInt(voll.slice(4, 6), 16) };
}
function rgbZuHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
/** relative Helligkeit 0..1 (für die Entscheidung „schwarzer oder weißer Text") */
export function helligkeit({ r, g, b }) {
  const kanal = (c) => {
    const c2 = c / 255;
    return c2 <= 0.03928 ? c2 / 12.92 : Math.pow((c2 + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

export function farbeInfo(eingabe) {
  const text = String(eingabe ?? '').trim().toLowerCase();
  if (!text) return null;

  let rgb = null;
  let name = '';

  if (text.startsWith('#') || /^[0-9a-f]{3,6}$/.test(text.replace('#', ''))) {
    rgb = hexZuRgb(text);
  } else if (FARBNAMEN[text]) {
    rgb = hexZuRgb(FARBNAMEN[text]);
    name = text;
  } else {
    const m = text.match(/^rgb\s*\(?\s*(\d{1,3})\s*[,;.\s]\s*(\d{1,3})\s*[,;.\s]\s*(\d{1,3})\s*\)?$/);
    if (m) {
      const w = [Number(m[1]), Number(m[2]), Number(m[3])];
      if (w.every((v) => v >= 0 && v <= 255)) rgb = { r: w[0], g: w[1], b: w[2] };
    }
  }
  if (!rgb) return null;

  const hex = '#' + [rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, '0')).join('');
  const hsl = rgbZuHsl(rgb);
  const hell = helligkeit(rgb);
  if (!name) {
    for (const [kandidat, wert] of Object.entries(FARBNAMEN)) {
      if (wert.toLowerCase() === hex) { name = kandidat; break; }
    }
  }
  return {
    hex, rgb, hsl, hell,
    name: name || '',
    textAufFarhe: hell > 0.45 ? 'schwarz' : 'weiß',
    text: [
      `${name ? name + ' · ' : ''}*${hex.toUpperCase()}*`,
      `RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`,
      `HSL: ${hsl.h}°, ${hsl.s} %, ${hsl.l} %`,
      `Darauf lesbar: *${hell > 0.45 ? 'schwarze' : 'weiße'} Schrift*`
    ].join('\n')
  };
}

/* ── 📊 Prozent rechnen ─────────────────────────────────────────────── */
/**
 * Versteht: „19 % von 84" · „wie viel prozent sind 12 von 80" · „84 + 19 %"
 * @returns {{ok:boolean, text?:string, fehler?:string}}
 */
export function prozentText(eingabe) {
  const text = String(eingabe ?? '').toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ').trim();
  if (!text) return { ok: false, fehler: 'Schreib mir zum Beispiel: 19 % von 84' };

  const zahl = (s) => Number(String(s).replace(/[^0-9.\-]/g, ''));

  /* „Wie viel Prozent sind 12 von 80?" */
  let m = text.match(/([\d.]+)\s*(?:von|aus)\s*([\d.]+)/);
  if (m && /(prozent|%|anteil)/.test(text) && !/von\s*[\d.]+\s*%/.test(text)) {
    const teil = zahl(m[1]);
    const ganzes = zahl(m[2]);
    if (!Number.isFinite(teil) || !Number.isFinite(ganzes) || ganzes === 0) return { ok: false, fehler: 'Diese Zahlen kann ich nicht teilen.' };
    return { ok: true, text: `${formatiereZahl(teil)} von ${formatiereZahl(ganzes)} = ${formatiereZahl(Math.round((teil / ganzes) * 10000) / 100)} %` };
  }

  /* „84 + 19 %" / „84 minus 19 %" / „84 erhöhen um 19 %" */
  m = text.match(/^([\d.]+)\s*(\+|plus|erhöhen|erhoehen|mehr|minus|-|reduzieren|weniger)\s*(?:um\s*)?([\d.]+)\s*%?/);
  if (m && /(plus|\+|erhöhen|erhoehen|mehr|minus|-|reduzieren|weniger|um)/.test(text)) {
    const basis = zahl(m[1]);
    const anteil = zahl(m[3]);
    const plus = !/minus|-|reduzieren|weniger/.test(m[2]);
    if (!Number.isFinite(basis) || !Number.isFinite(anteil)) return { ok: false, fehler: 'Mit diesen Zahlen komme ich nicht weiter.' };
    const faktor = plus ? 1 + anteil / 100 : 1 - anteil / 100;
    const erg = Math.round(basis * faktor * 100) / 100;
    return { ok: true, text: `${formatiereZahl(basis)} ${plus ? '+' : '−'} ${formatiereZahl(anteil)} % = ${formatiereZahl(erg)}` };
  }

  /* „19 % von 84" (auch „19% von 84 euro") */
  m = text.match(/([\d.]+)\s*%\s*(?:von|aus|auf)?\s*([\d.]+)/);
  if (m) {
    const anteil = zahl(m[1]);
    const basis = zahl(m[2]);
    if (!Number.isFinite(anteil) || !Number.isFinite(basis)) return { ok: false, fehler: 'Mit diesen Zahlen komme ich nicht weiter.' };
    return { ok: true, text: `${formatiereZahl(anteil)} % von ${formatiereZahl(basis)} = ${formatiereZahl(Math.round(basis * (anteil / 100) * 100) / 100)}` };
  }

  return { ok: false, fehler: 'So lese ich das nicht. Versuch: 19 % von 84 · 12 von 80 in Prozent · 84 + 19 %' };
}

/* ── 🍀 Ein freundlicher Spruch ─────────────────────────────────────── */
const SPRUECHE = [
  'Heute ist ein guter Tag, um nett zu dir selbst zu sein. 🌸',
  'Du hast mehr geschafft, als du denkst — ernsthaft. ☀️',
  'Kleine Schritte zählen auch. Und zwar doppelt. 🎀',
  'Jemand freut sich heute über eine Nachricht von dir. 💌',
  'Tief durchatmen. Es muss nicht alles auf einmal. 🌿',
  'Du bist hier, und das ist schon die halbe Miete. ⭐',
  'Mach heute etwas, das dir gut tut — ohne Grund. 🍰',
  'Fehler sind nur Umwege mit Aussicht. 🗺️',
  'Irgendwo freut sich gerade jemand, dass es dich gibt. 💗',
  'Morgen kannst du neu anfangen. Heute reicht auch schon. 🌅',
  'Du musst niemandem etwas beweisen. Schon gar nicht heute. 🎈',
  'Ein Tag ohne Lachen ist ein verschwendeter Tag. 😄',
  'Dein Tempo ist genau richtig. 🐢',
  'Gute Dinge brauchen manchmal etwas länger. Warte sie ab. ⏳',
  'Du bist gut so, wie du bist. Punkt. 🌸'
];

/** Stabil über den Tag (gleicher Tag = gleicher Spruch), wenn gewünscht. */
export function glueck({ datum = new Date(), fest = false } = {}) {
  if (fest) {
    const start = new Date(datum.getFullYear(), 0, 0);
    const tag = Math.floor((datum - start) / 86400000);
    return SPRUECHE[tag % SPRUECHE.length];
  }
  return SPRUECHE[Math.floor(Math.random() * SPRUECHE.length)];
}

export const ALLE_SPRUECHE = SPRUECHE;
