/* ═══════════════════════════════════════════════════════════════════════
   🎀  TESTS  —  Aussehen: hell/dunkel + Akzentfarbe (Pink · Rosa · Türkis)
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'look-'));
process.env.LOOK_DB = TMP;      /* VOR dem Import setzen */

const store = await import('../lookStore.js');

/* ── Stand ──────────────────────────────────────────────────────────── */
test('Aussehen: Standard ist hell und pink', () => {
  assert.deepEqual(store.lookFuer(''), { modus: 'hell', akzent: 'pink' });
  assert.deepEqual(store.MODI, ['hell', 'dunkel']);
  assert.deepEqual(store.AKZENTE, ['pink', 'rosa', 'tuerkis']);
});

test('Aussehen: Wahl wird pro Nutzer gemerkt', () => {
  const erg = store.setzeLook('nutzerA', { modus: 'dunkel', akzent: 'tuerkis' });
  assert.equal(erg.look.modus, 'dunkel');
  assert.equal(erg.look.akzent, 'tuerkis');
  assert.deepEqual(store.lookFuer('nutzerA'), { modus: 'dunkel', akzent: 'tuerkis' });
  assert.deepEqual(store.lookFuer('nutzerB'), { modus: 'hell', akzent: 'pink' }, 'andere bleiben unberührt');
});

test('Aussehen: Teil-Änderungen überschreiben nur das eine Feld', () => {
  store.setzeLook('nutzerC', { modus: 'hell', akzent: 'rosa' });
  store.setzeLook('nutzerC', { modus: 'dunkel' });
  assert.deepEqual(store.lookFuer('nutzerC'), { modus: 'dunkel', akzent: 'rosa' });
});

test('Aussehen: Unzulässiges wird abgewiesen', () => {
  assert.equal(store.setzeLook('nutzerD', { modus: 'lila' }), null);
  assert.equal(store.setzeLook('nutzerD', { akzent: 'neon' }), null);
  assert.equal(store.setzeLook('nutzerD', {}), null);
  assert.equal(store.setzeLook('nutzerD', { modus: 'DUNKEL' }), null, 'Groß-/Kleinschreibung zählt');
  assert.deepEqual(store.lookFuer('nutzerD'), { modus: 'hell', akzent: 'pink' }, 'nichts gespeichert');
});

test('Aussehen: nur der Owner darf den Standard für alle setzen', () => {
  const alsNutzer = store.setzeLook('nutzerE', { akzent: 'tuerkis' }, { fuerAlle: true, istOwner: false });
  assert.equal(alsNutzer.fuerAlleGesetzt, false);
  assert.deepEqual(store.lookFuer(''), { modus: 'hell', akzent: 'pink' }, 'Gäste sehen weiter den Standard');

  const alsOwner = store.setzeLook('owner', { modus: 'dunkel', akzent: 'rosa' }, { fuerAlle: true, istOwner: true });
  assert.equal(alsOwner.fuerAlleGesetzt, true);
  assert.deepEqual(store.lookFuer(''), { modus: 'dunkel', akzent: 'rosa' }, 'jetzt gilt es für alle');
  assert.deepEqual(store.lookFuer('nutzerA'), { modus: 'dunkel', akzent: 'tuerkis' }, 'eigene Wahl bleibt vorne');
});

test('Aussehen: Gäste speichern nichts', () => {
  assert.equal(store.setzeLook('', { modus: 'dunkel' }), null);
});

test('Aussehen: Stand überlebt einen Neustart', () => {
  store.setzeLook('nutzerF', { akzent: 'tuerkis' });
  const roh = JSON.parse(fs.readFileSync(path.join(TMP, 'look.json'), 'utf8'));
  assert.equal(roh.users.nutzerF.akzent, 'tuerkis');
  assert.ok(roh.geaendert, 'Zeitstempel ist gesetzt');
});

/* ── Aussehen im Browser ────────────────────────────────────────────── */
test('theme.js: kennt Modus und Akzent und spricht mit dem Server', () => {
  const src = fs.readFileSync(new URL('../public/js/theme.js', import.meta.url), 'utf8');
  for (const teil of ['getAkzent', 'setAkzent', 'setLook', 'fuerAlle', "'/api/look'", "data-akzent"]) {
    assert.ok(src.includes(teil), 'theme.js: ' + teil + ' fehlt');
  }
  assert.match(src, /lovebot-akzent/, 'eigener Speicherplatz für den Akzent');
  assert.match(src, /window\.LoveBotTheme\s*=\s*api/, 'die alte Schnittstelle bleibt erhalten');
});

test('Navigation: Dark Mode ist fest und drei Akzentfarben bleiben wählbar', () => {
  const src = fs.readFileSync(new URL('../public/js/site-shell.js', import.meta.url), 'utf8');
  assert.match(src, /look-switch/, 'der Umschalter ist eingebaut');
  assert.match(src, /data-akzent="pink"/);
  assert.match(src, /data-akzent="rosa"/);
  assert.match(src, /data-akzent="tuerkis"/);
  assert.match(src, /setAkzent/, 'die Punkte sind verdrahtet');
  assert.doesNotMatch(src, /#themeToggle/, 'es gibt keinen Hell/Dunkel-Umschalter');
});

test('style.css: alle drei Akzente sind für hell UND dunkel definiert', () => {
  const css = fs.readFileSync(new URL('../public/css/style.css', import.meta.url), 'utf8');
  const felder = ['--brand-1', '--brand-2', '--brand-3', '--grad'];
  for (const akzent of ['pink', 'rosa', 'tuerkis']) {
    const hell = css.match(new RegExp('\\n\\[data-akzent="' + akzent + '"\\]\\s*\\{([^}]*)\\}'));
    const dunkel = css.match(new RegExp('\\n\\[data-theme="dark"\\]\\[data-akzent="' + akzent + '"\\]\\s*\\{([^}]*)\\}'));
    assert.ok(hell, 'heller Block für ' + akzent + ' fehlt');
    assert.ok(dunkel, 'dunkler Block für ' + akzent + ' fehlt');
    for (const feld of felder) {
      assert.ok(hell[1].includes(feld), akzent + ' (hell): ' + feld + ' fehlt');
      assert.ok(dunkel[1].includes(feld), akzent + ' (dunkel): ' + feld + ' fehlt');
    }
  }
});

/* ── Endpunkt ───────────────────────────────────────────────────────── */
test('server.js: /api/look ist eingebaut und prüft die Anmeldung', () => {
  const src = fs.readFileSync(new URL('../server.js', import.meta.url), 'utf8');
  assert.match(src, /pathname === '\/api\/look'/, 'der Endpunkt fehlt');
  assert.match(src, /roleOf\(session\) === 'owner'/, 'nur der Owner setzt den Standard');
  assert.match(src, /Nicht eingeloggt/, 'ohne Anmeldung wird nichts gespeichert');
});
