#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════════╗
║  PATCH: $ping wird KURZ  —  Standard = Latenz + Webseiten                ║
╠══════════════════════════════════════════════════════════════════════════╣
║  $ping            → KURZ:  Bot-Latenz (WS/IQ/RTT) + beide Websites       ║
║  $ping <url>      → Website-Ping (wie vorher)                            ║
║  $ping full|lang|komplett|ausfuehrlich|speed → kompletter Report          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Der Patch wird auf BEIDE Stellen angewendet, weil das Projekt zwei       ║
║  Kopien dieses Moduls hat:                                               ║
║    · pingcmd.js                 → sauberes Modul (Exporte, Imports)      ║
║    · Love.js (MERGE-Block)      → die Kopie, die der Bot wirklich nutzt  ║
║  Beide Kopien haben unterschiedliches Wording (Love.js ist im Emo-        ║
║  Stil), deshalb wird der neue Code in je einer passenden Fassung         ║
║  eingefügt — die Logik ist identisch.                                    ║
║                                                                          ║
║  Idempotent: Already-Patched wird erkannt und übersprungen.              ║
╚══════════════════════════════════════════════════════════════════════════╝
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SHORT_SAMPLES_CONST = """
/* ═══════════════════════════════════════════════════════════════════════
   STICHPROBEN — wie viele HTTP-Läufe pro Website?
   · FULL_SAMPLES  → kompletter Report ($ping full)
   · SHORT_SAMPLES → Kurz-Ping ($ping): schneller, trotzdem echt gemessen
   ═══════════════════════════════════════════════════════════════════════ */
const FULL_SAMPLES = 3;
const SHORT_SAMPLES = 2;
"""

# ─────────────────────────────────────────────────────────────────────────
# 1) pingcmd.js — saubere Fassung
# ─────────────────────────────────────────────────────────────────────────
PINGCMD_SHORT = '''
/* ═══════════════════════════════════════════════════════════════════════
   KURZ-PING — $ping (Standard)
   ─────────────────────────────────────────────────────────────────────
   Nur das, was man sofort wissen will:
     · ⚡ LATENZ    — Bot-Roundtrip (WebSocket · IQ · Sende-RTT)
     · 🌐 WEBSITES — maxichen.de & maxichen.de (Ø Gesamtzeit)
   Kein ICMP, kein Speedtest, keine Systemwerte, keine Glas-Karte.
   Der komplette Report bleibt unter $ping full erreichbar.
   Alle Werte sind weiterhin ECHT gemessen (netping.js) — nie geschätzt.
   ═══════════════════════════════════════════════════════════════════════ */
async function pingShort({ sock, msg, from, pref = '$' }) {
  await sendReaction(sock, from, '🏓', msg.key);

  let key = null;
  try {
    const s = await sock.sendMessage(from, {
      text: `> 🏓 *PING* ⏳ _messe Latenz & ${DEFAULT_SITES.length} Websites …_`
    }, { quoted: msg });
    key = s?.key || null;
  } catch (e) {}

  /* Latenz + Websites parallel — der Rest wird bewusst nicht gemessen. */
  const [bot, siteResults] = await Promise.all([
    measureBot(sock),
    measureSites(SHORT_SAMPLES)
  ]);

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const L = [];
  const issues = [];

  L.push(`🏓 *PING* · ${timeStr} Uhr`);
  L.push(RULE);

  /* ── ⚡ LATENZ ─────────────────────────────────────────────────── */
  const latValues = [];
  if (bot.wsStats) latValues.push(bot.wsStats.avg);
  if (bot.iqStats) latValues.push(bot.iqStats.avg);
  if (bot.echo.ok) latValues.push(bot.echo.echoMs);
  const latAvg = latValues.length ? latValues.reduce((a, b) => a + b, 0) / latValues.length : null;
  const latR = latAvg != null ? rateLowIsGood(latAvg, TH.bot) : null;

  L.push('⚡ *LATENZ*');
  L.push(latAvg != null
    ? `│ ${dot(latR)} Bot › *${fmtMs(latAvg)}*  _(WS ${bot.wsStats ? fmtMs(bot.wsStats.avg) : '—'} · IQ ${bot.iqStats ? fmtMs(bot.iqStats.avg) : '—'} · RTT ${bot.echo.ok ? fmtMs(bot.echo.echoMs) : '—'})_`
    : `│ 🔴 Bot › nicht messbar _(${bot.echo.error || '—'})_`);
  if (latAvg == null) {
    issues.push({ sev: '🔴', text: 'Bot-Latenz nicht messbar' });
  } else if (latR && latR.score <= RATINGS.slow.score) {
    issues.push({ sev: latR === RATINGS.critical ? '🔴' : '🟠', text: `Bot-Latenz ${latR.label.toLowerCase()} _(Ø ${Math.round(latAvg)} ms)_` });
  }

  /* ── 🌐 WEBSITES ───────────────────────────────────────────────── */
  L.push('🌐 *WEBSITES*');
  const siteScores = [];
  for (const res of siteResults) {
    const total = res.probes.length || SHORT_SAMPLES;
    if (!res.okProbes.length) {
      const err = res.probes?.[0]?.error || 'unbekannter Fehler';
      L.push(`│ 🔴 *${res.host}* › OFFLINE _(${err})_`);
      issues.push({ sev: '🔴', text: `*${res.host}* — OFFLINE _(${err})_` });
      siteScores.push(0);
      continue;
    }
    const st = statsOf(res.okProbes.map((p) => p.totalMs));
    const r = st ? rateLowIsGood(st.avg, TH.siteTotal) : null;
    const last = res.okProbes[res.okProbes.length - 1];
    const flag = res.okProbes.length < total ? '🟡' : dot(r);
    L.push(`│ ${flag} *${res.host}* › *${st ? fmtMs(st.avg) : '—'}*  _(${last.status} · ${res.okProbes.length}/${total} ok)_`);
    siteScores.push(r ? Math.round(r.score * (res.okProbes.length / total)) : 0);
    if (res.okProbes.length < total) {
      issues.push({ sev: '🟠', text: `*${res.host}* — instabil _(${res.okProbes.length}/${total} Versuche ok)_` });
    } else if (r && r.score <= RATINGS.slow.score) {
      issues.push({ sev: r === RATINGS.critical ? '🔴' : '🟠', text: `*${res.host}* — langsam _(${r.label}, Ø ${Math.round(st.avg)} ms)_` });
    }
  }
  L.push(RULE);

  /* ── ❤️ KURZ-HEALTH (nur Latenz + Websites) ────────────────────── */
  const botScore = latR ? Math.round(latR.score * (latValues.length / 3)) : 0;
  const health = computeHealth([
    { id: 'bot', label: 'Bot', weight: 50, score: botScore },
    { id: 'websites', label: 'Websites', weight: 50, score: avgScores(siteScores) }
  ]);
  L.push(`${health.rating.emoji} *${health.score}% · ${health.rating.label}*`);
  for (const it of issues.slice(0, 3)) L.push(`│ ${it.sev} ${it.text}`);
  L.push(`💡 _${pref}ping full = kompletter Report · ${pref}ping <url> = eine Website prüfen_`);

  await put(sock, from, msg, key, L.join('\\n'));

  try {
    const finalEmoji = health.score >= 75
      ? reactions.completion.reactions.withoutAnyProblems
      : health.score >= 55
        ? reactions.completion.reactions.partial
        : reactions.errors.reactions.warning;
    await sendReaction(sock, from, finalEmoji, msg.key);
  } catch (e) {}

  console.log(c.bold + c.brightGreen +
    `[ping] Kurz-Report gesendet (Latenz ${latAvg != null ? Math.round(latAvg) : '—'} ms · ` +
    `Sites ${siteResults.map((r) => `${r.host} ${r.okProbes.length}/${r.probes.length || SHORT_SAMPLES}`).join(', ')} · ` +
    `Health ${health.score}% ${health.rating.label}).` + c.reset);
}

'''

# ─────────────────────────────────────────────────────────────────────────
# 2) Love.js (MERGE-Block) — Emo-Fassung, gleiche Logik
# ─────────────────────────────────────────────────────────────────────────
LOVE_SHORT = '''
/* ═══════════════════════════════════════════════════════════════════════
   KURZ-PING — $ping (standard)
   ─────────────────────────────────────────────────────────────────────
   Nur das, was man sofort wissen will:
     · ⚡ latenz    — bot-roundtrip (websocket · iq · sende-rtt)
     · 🌐 websites — maxichen.de & maxichen.de (Ø gesamtzeit)
   Kein icmp, kein speedtest, keine systemwerte, keine glas-karte.
   Der komplette report bleibt unter $ping full. niemand will ihn.
   Alle werte sind weiterhin ECHT gemessen (netping.js) — nie geschätzt.
   ═══════════════════════════════════════════════════════════════════════ */
async function pingShort({ sock, msg, from, pref = '$' }) {
  await sendReaction(sock, from, '💔', msg.key);

  let key = null;
  try {
    const s = await sock.sendMessage(from, {
      text: `> 🥀 *ping.* 🌧️ _kurz. latenz & ${DEFAULT_SITES.length} websites. mehr schafft niemand._`
    }, { quoted: msg });
    key = s?.key || null;
  } catch (e) {}

  /* latenz + websites parallel — der rest wird bewusst nicht gemessen. */
  const [bot, siteResults] = await Promise.all([
    measureBot(sock),
    measureSites(SHORT_SAMPLES)
  ]);

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const L = [];
  const issues = [];

  L.push(`🥀 *ping.* · ${timeStr} · kurz. wie alles.`);
  L.push(RULE);

  /* ── ⚡ LATENZ ─────────────────────────────────────────────────── */
  const latValues = [];
  if (bot.wsStats) latValues.push(bot.wsStats.avg);
  if (bot.iqStats) latValues.push(bot.iqStats.avg);
  if (bot.echo.ok) latValues.push(bot.echo.echoMs);
  const latAvg = latValues.length ? latValues.reduce((a, b) => a + b, 0) / latValues.length : null;
  const latR = latAvg != null ? rateLowIsGood(latAvg, TH.bot) : null;

  L.push('⚡ *latenz*');
  L.push(latAvg != null
    ? `│ ${dot(latR)} bot › *${fmtMs(latAvg)}*  _(ws ${bot.wsStats ? fmtMs(bot.wsStats.avg) : '—'} · iq ${bot.iqStats ? fmtMs(bot.iqStats.avg) : '—'} · rtt ${bot.echo.ok ? fmtMs(bot.echo.echoMs) : '—'})_`
    : `│ 🖤 bot › nicht messbar. wie alles. _(${bot.echo.error || '—'})_`);
  if (latAvg == null) {
    issues.push({ sev: '🔴', text: 'bot-latenz nicht messbar. passt.' });
  } else if (latR && latR.score <= RATINGS.slow.score) {
    issues.push({ sev: latR === RATINGS.critical ? '🔴' : '🟠', text: `bot-latenz ${latR.label.toLowerCase()} _(Ø ${Math.round(latAvg)} ms). niemand wartet._` });
  }

  /* ── 🌐 WEBSITES ───────────────────────────────────────────────── */
  L.push('🌐 *websites*');
  const siteScores = [];
  for (const res of siteResults) {
    const total = res.probes.length || SHORT_SAMPLES;
    if (!res.okProbes.length) {
      const err = res.probes?.[0]?.error || 'unbekannter Fehler';
      L.push(`│ 🖤 *${res.host}* › offline. wie immer. _(${err})_`);
      issues.push({ sev: '🔴', text: `*${res.host}* — offline. _(${err})_` });
      siteScores.push(0);
      continue;
    }
    const st = statsOf(res.okProbes.map((p) => p.totalMs));
    const r = st ? rateLowIsGood(st.avg, TH.siteTotal) : null;
    const last = res.okProbes[res.okProbes.length - 1];
    const flag = res.okProbes.length < total ? '🟡' : dot(r);
    L.push(`│ ${flag} *${res.host}* › *${st ? fmtMs(st.avg) : '—'}*  _(${last.status} · ${res.okProbes.length}/${total} ok. wenigstens das)_`);
    siteScores.push(r ? Math.round(r.score * (res.okProbes.length / total)) : 0);
    if (res.okProbes.length < total) {
      issues.push({ sev: '🟠', text: `*${res.host}* — instabil. _(${res.okProbes.length}/${total} versuche ok)_` });
    } else if (r && r.score <= RATINGS.slow.score) {
      issues.push({ sev: r === RATINGS.critical ? '🔴' : '🟠', text: `*${res.host}* — langsam. wie alles. _(${r.label}, Ø ${Math.round(st.avg)} ms)_` });
    }
  }
  L.push(RULE);

  /* ── 💔 KURZ-HEALTH (nur latenz + websites) ────────────────────── */
  const botScore = latR ? Math.round(latR.score * (latValues.length / 3)) : 0;
  const health = computeHealth([
    { id: 'bot', label: 'bot', weight: 50, score: botScore },
    { id: 'websites', label: 'websites', weight: 50, score: avgScores(siteScores) }
  ]);
  L.push(`${health.rating.emoji} *${health.score}% · ${health.rating.label.toLowerCase()}*`);
  for (const it of issues.slice(0, 3)) L.push(`│ ${it.sev} ${it.text}`);
  L.push(`🕯️ _${pref}ping full = der komplette report. niemand will ihn._`);

  await put(sock, from, msg, key, L.join('\\n'));

  try {
    const finalEmoji = health.score >= 75
      ? reactions.completion.reactions.withoutAnyProblems
      : health.score >= 55
        ? reactions.completion.reactions.partial
        : reactions.errors.reactions.warning;
    await sendReaction(sock, from, finalEmoji, msg.key);
  } catch (e) {}

  console.log(c.bold + c.brightGreen +
    `[ping] Kurz-Report gesendet (Latenz ${latAvg != null ? Math.round(latAvg) : '—'} ms · ` +
    `Sites ${siteResults.map((r) => `${r.host} ${r.okProbes.length}/${r.probes.length || SHORT_SAMPLES}`).join(', ')} · ` +
    `Health ${health.score}% ${health.rating.label}).` + c.reset);
}

'''


def sub_once(text, old, new, what):
    """Ersetzt old genau einmal — sonst harter Fehler (kein stilles Verstümmeln)."""
    n = text.count(old)
    if n != 1:
        raise SystemExit(f'❌ {what}: {n} Treffer (erwartet 1) — Patch abgebrochen.')
    return text.replace(old, new, 1)


def patch(text, short_fn, rule_line, name):
    log = []

    if 'async function pingShort(' in text:
        print(f'⏭️  {name}: schon gepatcht — übersprungen.')
        return text, log

    # 1) Trennlinie + Stichproben-Konstanten
    if "const RULE = " not in text:
        text = sub_once(text, rule_line[0], rule_line[1], f'{name}: RULE')
        log.append('RULE-Trennlinie ergänzt')
    if 'const SHORT_SAMPLES' not in text:
        text = sub_once(text, '/* Die Websites, die bei $ping', SHORT_SAMPLES_CONST.lstrip('\n') + '\n/* Die Websites, die bei $ping', f'{name}: SHORT_SAMPLES')
        log.append('FULL_SAMPLES/SHORT_SAMPLES ergänzt')

    # 2) probeSite bekommt eine Stichproben-Zahl
    text = sub_once(text,
        'async function probeSite(rawHost) {',
        'async function probeSite(rawHost, samples = FULL_SAMPLES) {',
        f'{name}: probeSite-Signatur')
    text = sub_once(text,
        'sample(() => httpProbe(url, { timeoutMs: 12000 }), 3, 200)',
        'sample(() => httpProbe(url, { timeoutMs: 12000 }), samples, 200)',
        f'{name}: probeSite-Samples')
    log.append('probeSite(host, samples)')

    # 3) measureSites gibt die Zahl weiter
    text = sub_once(text,
        'async function measureSites() {',
        'async function measureSites(samples = FULL_SAMPLES) {',
        f'{name}: measureSites-Signatur')
    text = sub_once(text,
        'safeBlock(() => probeSite(h),',
        'safeBlock(() => probeSite(h, samples),',
        f'{name}: measureSites-Übergabe')
    log.append('measureSites(samples)')

    # 4) Flags: neue Aliase für den langen Report
    text = sub_once(text,
        "const FLAGS = new Set(['full', 'speed', 'nospeed', 'kurz', 'schnell', 'web', 'site']);",
        "const FLAGS = new Set(['full', 'lang', 'komplett', 'ausfuehrlich', 'speed', 'nospeed', 'kurz', 'schnell', 'short', 'web', 'site']);",
        f'{name}: FLAGS')
    log.append('Flags lang/komplett/ausfuehrlich/short')

    # 5) Kurz-Ping-Funktion einhängen (export-Präfix bleibt an handlePingCommand)
    anchor_re = re.compile(r"(export\s+)?async function handlePingCommand\(\{ sock, msg, from, args = \[\], pref = '\$' \}\) \{")
    m = anchor_re.search(text)
    if not m:
        raise SystemExit(f'❌ {name}: handlePingCommand nicht gefunden — Patch abgebrochen.')
    prefix = m.group(1) or ''
    text = text[:m.start()] + short_fn.lstrip('\n') + prefix + m.group(0)[len(prefix):] + text[m.end():]
    log.append('pingShort() ergänzt')

    # 6) Standard = kurz, nur mit full/lang/... der lange Report
    old_flags = "flags.includes('full') || flags.includes('speed')"
    new_flags = ("flags.includes('full') || flags.includes('speed') || flags.includes('lang') || "
                 "flags.includes('komplett') || flags.includes('ausfuehrlich')")
    text = sub_once(text, old_flags, new_flags, f'{name}: full-Flags')
    text = sub_once(text,
        "  if (target) return websitePing(sock, from, msg, target);\n",
        "  if (target) return websitePing(sock, from, msg, target);\n\n"
        "  /* Standard ist KURZ: Latenz + Websites. Der komplette Report\n"
        "     bleibt bewusst hinter $ping full / lang / komplett erreichbar. */\n"
        "  const isLong = ['full', 'lang', 'komplett', 'ausfuehrlich', 'speed', 'nospeed'].some((f) => flags.includes(f));\n"
        "  if (!isLong) return pingShort({ sock, msg, from, pref });\n",
        f'{name}: Kurz-Zweig')
    log.append('$ping → kurz, $ping full → komplett')

    return text, log


def main():
    changed = []

    # ── pingcmd.js ──────────────────────────────────────────────────────
    p = os.path.join(ROOT, 'pingcmd.js')
    src = io.open(p, encoding='utf-8').read()
    new, log = patch(src, PINGCMD_SHORT,
                     ("const dot = (rating) => (rating ? rating.emoji : '⚪');",
                      "const dot = (rating) => (rating ? rating.emoji : '⚪');\n\n"
                      "/* Trennlinie für den Text-Report (dezent, bricht nicht um) */\n"
                      "const RULE = '┄'.repeat(26);"),
                     'pingcmd.js')
    if new != src:
        io.open(p, 'w', encoding='utf-8').write(new)
        changed.append(('pingcmd.js', log))

    # ── Love.js (nur im MERGE-Block) ────────────────────────────────────
    p = os.path.join(ROOT, 'Love.js')
    love = io.open(p, encoding='utf-8').read()
    m_start = love.index('/* ── MERGE-START pingcmd ── */')
    m_end = love.index('/* ── MERGE-END pingcmd ── */')
    block = love[m_start:m_end]
    new_block, log = patch(block, LOVE_SHORT, (None, None), 'Love.js')
    if new_block != block:
        io.open(p, 'w', encoding='utf-8').write(love[:m_start] + new_block + love[m_end:])
        changed.append(('Love.js (MERGE-Block)', log))

    if not changed:
        print('✅ Nichts zu tun — beide Dateien sind bereits gepatcht.')
        return

    for name, log in changed:
        print(f'\n✅ {name}')
        for l in log:
            print(f'   · {l}')


if __name__ == '__main__':
    main()
