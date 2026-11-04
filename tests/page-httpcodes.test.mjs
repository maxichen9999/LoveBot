/* ═══════════════════════════════════════════════════════════════════════
   🧪  SEITENTEST  —  /http-codes.html wirklich bedienen
   ───────────────────────────────────────────────────────────────────────
   Lädt die Seite in einer echten DOM-Engine, führt ihre Skripte aus und
   prüft Suche, Filter und Zurücksetzen — also das, was Besucher tun.
   ═══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.HTTPPAGE_PORT || 8098);
const BASE = `http://127.0.0.1:${PORT}`;

async function loadJsdom() {
  const tries = [
    () => import('jsdom'),
    () => { const p = process.env.JSDOM_PATH; return p ? import(pathToFileURL(p).href) : Promise.reject(); },
    () => import('/home/user/.shot/node_modules/jsdom/lib/api.js')
  ];
  for (const t of tries) { try { const m = await t(); if (m?.JSDOM) return m; } catch (e) { /* nächster */ } }
  return null;
}
const jsdom = await loadJsdom();

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const c = [];
      res.on('data', (d) => c.push(d));
      res.on('end', () => resolve({ status: res.statusCode, text: Buffer.concat(c).toString('utf8') }));
    }).on('error', reject);
  });
}

let srv = null;
let page = null;

test.before(async () => {
  srv = spawn(process.execPath, [path.join(ROOT, 'tools', 'preview-server.cjs')], {
    env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore'
  });
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try { const r = await get(BASE + '/http-codes.html'); if (r.status === 200) { page = r.text; break; } } catch (e) { /* noch nicht */ }
  }
});

test.after(() => { try { srv?.kill('SIGKILL'); } catch (e) { /* schon weg */ } });

/* Baut die Seite im DOM auf und gibt praktische Helfer zurück */
async function aufbauen() {
  /* fromURL + resources:'usable' — sonst lädt jsdom die externen Skripte
     (/js/http-codes-data.js, site-shell.js, common.js) gar nicht erst. */
  const dom = await jsdom.JSDOM.fromURL(BASE + '/http-codes.html', {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(win) {
      win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
      win.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    }
  });
  const doc = dom.window.document;
  const deadline = Date.now() + 5000;
  while (!doc.querySelector('.codebox, .leer') && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 25));
  }
  const boxen = () => [...doc.querySelectorAll('.codebox')];
  const zahlen = () => boxen().map((b) => Number(b.querySelector('.num').textContent));
  const tippen = async (text) => {
    const q = doc.getElementById('q');
    q.value = text;
    q.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 250));   // kurze Verzögerung im Skript
  };
  return { dom, doc, boxen, zahlen, tippen };
}

test('alle 63 Codes werden angezeigt', { skip: jsdom ? false : 'jsdom fehlt (npm i -D jsdom)' }, async () => {
  assert.ok(page, 'Seite konnte nicht geladen werden');
  const { dom, boxen } = await aufbauen();
  assert.equal(boxen().length, 63, 'alle Codes sichtbar');
  dom.window.close();
});

test('Suche findet einen Code (404) und filtert die Liste', { skip: jsdom ? false : 'jsdom fehlt (npm i -D jsdom)' }, async () => {
  const { dom, zahlen, tippen } = await aufbauen();
  await tippen('404');
  assert.deepEqual(zahlen(), [404], 'nur der 404 bleibt');
  dom.window.close();
});

test('Suche über die Beschreibung funktioniert („Weiterleitung“)', { skip: jsdom ? false : 'jsdom fehlt (npm i -D jsdom)' }, async () => {
  const { dom, zahlen, tippen } = await aufbauen();
  await tippen('Weiterleitung');
  const treffer = zahlen();
  assert.ok(treffer.includes(307) && treffer.includes(308), '307 und 308 beschreiben Weiterleitungen');
  /* 508 („Weiterleitung im Kreis“) enthält das Wort auch — das ist korrekt,
     deshalb hier keine strenge Bereichsprüfung. */
  assert.ok(treffer.length >= 2 && treffer.length <= 4, `Treffer: ${treffer.join(', ')}`);
  dom.window.close();
});

test('Kategorie-Filter zeigt nur 4xx', { skip: jsdom ? false : 'jsdom fehlt (npm i -D jsdom)' }, async () => {
  const { dom, zahlen, doc } = await aufbauen();
  const chip = [...doc.querySelectorAll('#filter .chip')].find((c) => c.getAttribute('data-g') === '4');
  assert.ok(chip, 'Filter-Chip vorhanden');
  chip.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 150));
  const treffer = zahlen();
  assert.ok(treffer.length > 20, 'viele 4xx-Codes');
  assert.ok(treffer.every((c) => c >= 400 && c < 500), 'nur 4xx');
  dom.window.close();
});

test('„Alle zeigen“ setzt Suche und Filter zurück', { skip: jsdom ? false : 'jsdom fehlt (npm i -D jsdom)' }, async () => {
  const { dom, doc, boxen, tippen } = await aufbauen();
  await tippen('teapot');
  assert.equal(boxen().length, 1);
  doc.getElementById('reset').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 150));
  assert.equal(boxen().length, 63, 'wieder alles');
  dom.window.close();
});

test('Unsinn in der Suche zeigt einen Hinweis statt einer leeren Seite', { skip: jsdom ? false : 'jsdom fehlt (npm i -D jsdom)' }, async () => {
  const { dom, doc, boxen, tippen } = await aufbauen();
  await tippen('zzzzzz');
  assert.equal(boxen().length, 0);
  assert.ok(doc.querySelector('.leer'), 'Hinweis „Kein Code gefunden“');
  dom.window.close();
});
