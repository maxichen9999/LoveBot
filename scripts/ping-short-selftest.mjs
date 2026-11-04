/* ═══════════════════════════════════════════════════════════════════════
   SELFTEST — $ping (kurz)
   ─────────────────────────────────────────────────────────────────────
   Lässt den KURZ-Ping wirklich laufen, ohne WhatsApp:
     · WhatsApp-API (sock)      → Mock
     · Bot-Latenz (WS/IQ/RTT)   → Mock (realistische Verzögerung)
     · Website-Messung          → ECHT (netping.js → httpProbe/dnsPing)
   Ausgabe: genau der Text, den der Bot in den Chat schreibt.

   Aufruf:  node scripts/ping-short-selftest.mjs [full]
   ═══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = process.argv.slice(2).join(' ') || 'kurz';
const ARGS = process.argv.slice(2);
const TMP = path.join(ROOT, 'scripts', '.ping-selftest.tmp.mjs');

/* ── pingcmd.js einlesen und die echten Imports durch Mocks ersetzen ── */
let src = fs.readFileSync(path.join(ROOT, 'pingcmd.js'), 'utf8');
src = src.replace(/^import[\s\S]*?from '[^']+';$/gm, '');

/* Test-Haken: andere Websites prüfen (z. B. von hier aus erreichbare).
   Betrifft NUR die temporäre Test-Kopie — pingcmd.js bleibt unberührt.
   PING_TEST_SITES="cloudflare.com,github.com" node scripts/ping-short-selftest.mjs */
if (process.env.PING_TEST_SITES) {
  const hosts = process.env.PING_TEST_SITES.split(',').map((h) => h.trim()).filter(Boolean);
  src = src.replace(/const DEFAULT_SITES = \[[^\]]*\];/,
    `const DEFAULT_SITES = ${JSON.stringify(hosts)};`);
}

const HEADER = `
import { icmpPing, tcpPing, dnsPing, httpProbe, speedTest, edgeTrace, sysSnapshot, statsOf, sample } from '../netping.js';
const generateWAMessageFromContent = (jid, content) => ({ message: content, key: { id: 'mock' } });
const proto = { Message: { fromObject: (o) => o } };
const reactions = {
  completion: { reactions: { withoutAnyProblems: '✅', partial: '🤔' } },
  errors: { reactions: { warning: '⚠️' } }
};
const sendReaction = async () => {};
const readDb = () => ({ users: {}, groups: {} });
const systemStats = () => ({ totalUsers: 42, totalGroups: 3, totalBans: 0 });
const formatDuration = (ms) => Math.round(ms / 1000) + 's';
const c = new Proxy({}, { get: () => '' });
const renderPingCard = async () => null;
const renderWebsiteCard = async () => null;

/* Bot-Latenz simulieren (kein WhatsApp nötig): ~40 ms + Jitter */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (base) => Math.round(base + Math.random() * 25);
const wsPing = async () => { await sleep(jitter(35)); return { ok: true, ms: jitter(35) }; };
const iqPing = async () => { await sleep(jitter(45)); return { ok: true, ms: jitter(45) }; };
const sendEchoPing = async () => { await sleep(jitter(40)); return { ok: true, echoMs: jitter(40), sendMs: 12 }; };
`;

/* pingcmd.js exportiert bereits handlePingCommand — hier nicht doppelt exportieren. */
fs.writeFileSync(TMP, HEADER + src);

const mod = await import(pathToFileURL(TMP).href);
fs.unlinkSync(TMP);

/* ── Fake-sock ─────────────────────────────────────────────────────── */
const sent = [];
const sock = {
  ws: { readyState: 1 },
  user: { id: '0000@s.whatsapp.net' },
  query: async () => ({}),
  sendMessage: async (jid, obj) => { sent.push({ jid, obj }); return { key: { id: 'k' + sent.length } }; },
  relayMessage: async (jid, msg) => { sent.push({ jid, edit: msg }); return { key: { id: 'edit' } }; }
};
const msg = { key: { id: 'KURZ', fromMe: false, remoteJid: 'g.us' }, messageTimestamp: Math.floor(Date.now() / 1000) - 1 };

await mod.handlePingCommand({
  sock, msg, from: '120363@g.us',
  args: ARGS,
  pref: '$'
});

console.log('\n' + '═'.repeat(64));
console.log(`  AUSGABE  $ping ${MODE === 'full' ? 'full' : ''}`.trimEnd() + `  (${sent.length} Nachrichten)`);
console.log('═'.repeat(64));
const final = sent.filter((s) => s.edit || s.obj?.text).pop();
const text = final?.edit?.protocolMessage?.editedMessage?.conversation || final?.obj?.text || '(nichts)';
console.log(text);
console.log('═'.repeat(64));
console.log(`Zeilen: ${text.split('\n').length} · Zeichen: ${text.length}`);
