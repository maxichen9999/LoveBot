/* ═══════════════════════════════════════════════════════════════════════
    🎀  AUSSEHEN  —  dunkles Theme + Akzentfarbe (Pink · Rosa)
   ───────────────────────────────────────────────────────────────────────
   Läuft im <head>, bevor die Seite gemalt wird — damit nichts kurz
   aufblitzt.

   • Die Website bleibt immer dunkel; nur die Akzentfarbe ist wählbar.
   • Die Akzentfarbe wird im Browser gespeichert und für eingeloggte
     Personen zusätzlich mit dem Server (/api/look) synchronisiert.
   • Kein Inline-Skript, damit die strenge CSP unangetastet bleibt.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEY_AKZENT = 'lovebot-akzent';
  var AKZENTE = ['pink', 'rosa'];
  var root = document.documentElement;

  function anwenden() {
    root.setAttribute('data-theme', 'dark');
  }
  function akzentAnwenden(wert) {
    root.setAttribute('data-akzent', AKZENTE.indexOf(wert) >= 0 ? wert : 'pink');
  }

  function lies(schluessel, fallbacke) {
    try {
      var v = localStorage.getItem(schluessel);
      return v || fallbacke;
    } catch (e) { return fallbacke; }
  }
  function merke(schluessel, wert) {
    try { localStorage.setItem(schluessel, wert); } catch (e) { /* Speicher gesperrt */ }
  }

  /* ── Start: dauerhaft dunkel ──────────────────────────────────────── */
  anwenden();
  akzentAnwenden(lies(KEY_AKZENT, 'pink'));

  /* ── Server: eigene Wahl nachziehen (nur wenn eingeloggt) ─────────── */
  function zumServer(patch) {
    try {
      fetch('/api/look', {
        method: patch ? 'POST' : 'GET',
        credentials: 'same-origin',
        headers: patch ? { 'Content-Type': 'application/json' } : undefined,
        body: patch ? JSON.stringify(patch) : undefined
      }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d || !d.ok || !d.look) return;
        if (d.look.akzent) { akzentAnwenden(d.look.akzent); merke(KEY_AKZENT, d.look.akzent); }
        /* der Umschalter soll es mitbekommen */
        try { document.dispatchEvent(new CustomEvent('look:geaendert')); } catch (e) {}
      }).catch(function () { /* nicht eingeloggt oder offline — Browser-Wahl gilt */ });
    } catch (e) {}
  }

  var api = {
    akzente: AKZENTE,

    get: function () { return 'dark'; },
    set: function () { anwenden(); zumServer({ modus: 'dunkel' }); return 'dark'; },
    toggle: function () { anwenden(); return 'dark'; },

    getAkzent: function () {
      var a = root.getAttribute('data-akzent');
      return AKZENTE.indexOf(a) >= 0 ? a : 'pink';
    },
    setAkzent: function (wert) {
      var neu = AKZENTE.indexOf(wert) >= 0 ? wert : 'pink';
      akzentAnwenden(neu);
      merke(KEY_AKZENT, neu);
      zumServer({ akzent: neu });
      return neu;
    },

    /* { modus:'dunkel', akzent:'pink'|… } */
    getLook: function () {
      return { modus: 'dunkel', akzent: api.getAkzent() };
    },
    setLook: function (o) {
      if (!o) return api.getLook();
      if (o.modus) api.set(o.modus === 'dunkel' ? 'dark' : 'light');
      if (o.akzent) api.setAkzent(o.akzent);
      return api.getLook();
    },

    /* Als Standard für alle übernehmen (nur der Owner darf das) */
    fuerAlle: function () {
      var look = api.getLook();
      zumServer(Object.assign({}, look, { fuerAlle: true }));
      return look;
    },

    lade: function () { zumServer(null); }
  };

  window.LoveBotTheme = api;

  /* Einmalig beim Laden die Server-Wahl holen (nur wenn schon gemalt). */
  try {
    document.addEventListener('DOMContentLoaded', function () { api.lade(); });
  } catch (e) {}
})();
