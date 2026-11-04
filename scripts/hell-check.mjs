/* ═══════════════════════════════════════════════════════════════════════
   🌗  HELLIGKEITS-PRÜFUNG  ·  scripts/hell-check.mjs
   ───────────────────────────────────────────────────────────────────────
   Lädt die echten Seiten (über den laufenden Server), rechnet die
   tatsächlich gültigen Hintergrund- und Textfarben zusammen und warnt,
   wenn eine Fläche zu dunkel ist.

   Aufruf:   node scripts/hell-check.mjs  [http://127.0.0.1:7777]
             SEITEN=/cmd.html,/status.html node scripts/hell-check.mjs

   Hinweis: jsdom löst CSS-Variablen (var(--…)) nicht auf. Solche Werte
   werden übersprungen — geprüft werden vor allem hart kodierte Farben.
   ═══════════════════════════════════════════════════════════════════════ */
import { JSDOM, VirtualConsole } from 'jsdom';

const BASIS = (process.argv[2] || process.env.BASIS || 'http://127.0.0.1:7777').replace(/\/$/, '');
const SEITEN = (process.env.SEITEN ||
  '/,/cmd.html,/status.html,/login.html,/docs.html,/datenschutz.html,/app.html,/control.html,/test.html,/kaputt.html')
  .split(',').map((s) => s.trim()).filter(Boolean);

/* ── Farb-Rechnung ──────────────────────────────────────────────────── */
function parseFarble(text) {
  if (!text) return null;
  const t = text.trim();
  let m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i.exec(t);
  if (m) {
    const a = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(t);
  if (m) {
    const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  if (t === 'transparent') return { r: 255, g: 255, b: 255, a: 0 };
  return null;
}
function mischen(vg, hg) {                       /* vg über hg */
  if (vg.a >= 1) return vg;
  const a = vg.a;
  return { r: vg.r * a + hg.r * (1 - a), g: vg.g * a + hg.g * (1 - a), b: vg.b * a + hg.b * (1 - a), a: 1 };
}
function helligkeit(c) { return Math.round((0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b)); }
function name(el) {
  const id = el.id ? '#' + el.id : '';
  const cls = el.classList && el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '';
  return el.tagName.toLowerCase() + id + cls;
}

let gesamt = 0, geprueft = 0, dunkel = [], warnungen = [];

for (const seite of SEITEN) {
  let dom;
  try {
    const vc = new VirtualConsole();                        /* Seitenlärm schlucken */
    dom = await JSDOM.fromURL(BASIS + seite, {
      runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc
    });
    await new Promise((r) => { if (dom.window.document.readyState === 'complete') r(); else dom.window.addEventListener('load', r); });
    await new Promise((r) => setTimeout(r, 400));
  } catch (e) {
    warnungen.push(`${seite}: nicht ladbar (${e.message.split('\n')[0]})`);
    continue;
  }
  const { window } = dom, d = window.document;
  const thema = d.documentElement.getAttribute('data-theme') || 'light';
  if (seite === '/') {
    console.log(`\n🌗 Helligkeits-Prüfung gegen ${BASIS}`);
    console.log(`   Thema der Seite: ${thema}${thema === 'dark' ? '  (⚠️  erwartet: light)' : '  ✅'}`);
    console.log(`   Umschalter da:   ${d.querySelector('#themeToggle') ? 'ja ✅' : 'nein ⚠️'}`);
    console.log(`   Schleife da:     ${d.querySelector('.brand .hk-bow') ? 'ja 🎀' : 'nein'}\n`);
  }

  /* 2) Farb-Variablen: jsdom löst sie auf — dunkle Hintergründe fallen so auf */
  const rootCs = window.getComputedStyle(d.documentElement);
  const HINTERGRUENDE = ['--bg', '--bg0', '--bg1', '--bg2', '--panel', '--surface', '--surface-solid', '--card'];
  const TEXTE = ['--text', '--txt', '--muted', '--mut', '--faint'];
  for (const v of HINTERGRUENDE) {
    const wert = rootCs.getPropertyValue(v).trim();
    if (!wert || wert.includes('var(')) continue;
    const c = parseFarble(wert);
    if (!c || c.a < 0.05) continue;
    const eff = mischen(c, { r: 255, g: 247, b: 251, a: 1 });
    const h = helligkeit(eff);
    geprueft++;
    if (h < 150) dunkel.push({ seite, el: 'Variable ' + v, wert, h });
  }
  for (const v of TEXTE) {
    const wert = rootCs.getPropertyValue(v).trim();
    if (!wert || wert.includes('var(')) continue;
    const c = parseFarble(wert);
    if (!c || c.a < 0.05) continue;
    const eff = mischen(c, { r: 255, g: 247, b: 251, a: 1 });
    const h = helligkeit(eff);
    geprueft++;
    if (h > 150) dunkel.push({ seite, el: 'Variable ' + v + ' (zu hell für hellen Grund)', wert, h });
  }

  const alle = [...d.querySelectorAll('body *')];
  for (const el of alle) {
    gesamt++;
    let cs;
    try { cs = window.getComputedStyle(el); } catch { continue; }
    const rohBg = cs.backgroundColor, rohFg = cs.color;
    if (!rohBg || rohBg.includes('var(')) continue;         /* Variable → jsdom kann das nicht */
    const bg = parseFarble(rohBg);
    if (!bg || bg.a < 0.05) continue;
    const effektiv = mischen(bg, { r: 255, g: 247, b: 251, a: 1 });   /* über Seiten-Rosa */
    geprueft++;
    const h = helligkeit(effektiv);
    if (h < 90) {
      const fg = parseFarble(rohFg);
      dunkel.push({ seite, el: name(el), wert: rohBg, h });
    }
  }
  dom.window.close();
  await new Promise((r) => setTimeout(r, Number(process.env.PAUSE) || 2500));   /* höflich bleiben: der Server begrenzt Anfragen */
}

console.log(`   Geprüfte Flächen: ${geprueft} (von ${gesamt} Elementen)`);
if (dunkel.length === 0) {
  console.log('\n   ✅ Keine dunkle Fläche mehr gefunden — die Seite ist hell.\n');
} else {
  console.log(`\n   ⚠️  ${dunkel.length} Flächen sind dunkler als 90/255:`);
  const gesehen = new Set();
  for (const f of dunkel) {
    const k = f.el + f.wert;
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    console.log(`      ${String(f.h).padStart(3)}/255  ${f.seite.padEnd(20)} ${f.el.padEnd(34)} ${f.wert}`);
    if (gesehen.size >= 25) { console.log('      … und weitere'); break; }
  }
  console.log('');
}
for (const w of warnungen) console.log('   ⚠️  ' + w);
process.exit(dunkel.length === 0 ? 0 : 1);
