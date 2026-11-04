/* ═══════════════════════════════════════════════════════════════════════
   🎀  AUSSEHEN-Stand  ·  lookStore.js
   ───────────────────────────────────────────────────────────────────────
   Merkt, wie die Webseite aussehen soll:

     · modus   →  hell | dunkel
     · akzent  →  pink | rosa | tuerkis

   Jeder eingeloggte Nutzer hat seine eigene Wahl. Der Owner kann seine
   Wahl zusätzlich ALS STANDARD für alle festlegen (gilt dann auch für
   Gäste). Alles liegt in Database/look.json — reine Daten, kein Netz.
   ═══════════════════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';

const VERZEICHNIS = process.env.LOOK_DB || 'Database';
const DATEI = path.join(VERZEICHNIS, 'look.json');

export const MODI = ['hell', 'dunkel'];
export const AKZENTE = ['pink', 'rosa', 'tuerkis'];
export const STANDARD = { modus: 'hell', akzent: 'pink' };

export function ladeStand() {
  try {
    const stand = JSON.parse(fs.readFileSync(DATEI, 'utf8'));
    return {
      default: stand.default || null,
      users: stand.users && typeof stand.users === 'object' ? stand.users : {}
    };
  } catch (e) {
    return { default: null, users: {} };
  }
}

export function speichereStand(stand) {
  const sauber = {
    default: stand.default || null,
    users: stand.users || {},
    geaendert: new Date().toISOString()
  };
  try {
    fs.mkdirSync(VERZEICHNIS, { recursive: true });
    fs.writeFileSync(DATEI, JSON.stringify(sauber, null, 1));
    return true;
  } catch (e) {
    return false;
  }
}

/** Was gilt für diesen Nutzer? (leer = Gast) */
export function lookFuer(nutzer = '') {
  const stand = ladeStand();
  const eigene = nutzer ? stand.users[String(nutzer)] : null;
  if (eigene) return { modus: eigene.modus || STANDARD.modus, akzent: eigene.akzent || STANDARD.akzent };
  if (stand.default) return { modus: stand.default.modus || STANDARD.modus, akzent: stand.default.akzent || STANDARD.akzent };
  return Object.assign({}, STANDARD);
}

/**
 * Wahl speichern.
 * @returns {{look:{modus:string,akzent:string},fuerAlleGesetzt:boolean}|null}
 *          null, wenn ein Wert nicht erlaubt ist oder nichts zu speichern war.
 */
export function setzeLook(nutzer = '', patch = {}, { fuerAlle = false, istOwner = false } = {}) {
  const sauber = {};
  if (patch.modus !== undefined) {
    if (MODI.indexOf(String(patch.modus)) < 0) return null;
    sauber.modus = String(patch.modus);
  }
  if (patch.akzent !== undefined) {
    if (AKZENTE.indexOf(String(patch.akzent)) < 0) return null;
    sauber.akzent = String(patch.akzent);
  }
  if (!Object.keys(sauber).length) return null;

  const stand = ladeStand();
  const schluessel = nutzer ? String(nutzer) : '';
  if (schluessel) {
    stand.users[schluessel] = Object.assign({}, stand.users[schluessel] || {}, sauber);
  }
  const darfAlle = fuerAlle === true && istOwner === true;
  if (darfAlle) {
    stand.default = Object.assign({}, stand.default || {}, sauber);
  } else if (!schluessel) {
    return null;      /* Gäste dürfen nichts speichern */
  }
  if (!speichereStand(stand)) return null;
  return { look: lookFuer(schluessel), fuerAlleGesetzt: darfAlle };
}

/** Nur für Tests: Stand zurücksetzen */
export function zuruecksetzen() {
  try { fs.unlinkSync(DATEI); return true; } catch (e) { return false; }
}
