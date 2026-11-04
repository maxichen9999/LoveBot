import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const CREDIT = 'by 𓆩♡𓆪 910maxi 𓆩♡𓆪';
const APK_WEBSITE = 'baron0.com';

/**
 * Ermittelt die Dauer einer Audio-Datei in Sekunden.
 * Nutzt ffprobe, falls vorhanden, sonst ffmpeg (Dauer steht in stderr).
 * Gibt null zurück, wenn die Dauer nicht ermittelt werden konnte.
 */
export async function getAudioDuration(ffmpegPath, audioPath) {
  const ffprobeCandidates = new Set();
  if (ffmpegPath) {
    ffprobeCandidates.add(ffmpegPath.replace(/ffmpeg(\\.exe)?$/i, (match) => match.replace(/ffmpeg/i, 'ffprobe')));
    ffprobeCandidates.add(path.join(path.dirname(ffmpegPath), process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'));
  }
  ffprobeCandidates.add('ffprobe');

  for (const candidate of ffprobeCandidates) {
    if (!candidate) continue;
    try {
      const { stdout } = await execFileAsync(candidate, [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        audioPath
      ], { timeout: 15000, maxBuffer: 4 * 1024 * 1024 });
      const parsed = parseFloat(String(stdout || '').trim());
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    } catch (e) {
      /* Kandidat nicht verfügbar — nächsten versuchen. */
    }
  }

  /* Fallback: ffmpeg -i liefert die Dauer in stderr. */
  try {
    await execFileAsync(ffmpegPath, ['-i', audioPath], { timeout: 15000, maxBuffer: 4 * 1024 * 1024 });
  } catch (error) {
    const text = String(error?.stderr || error?.stdout || error?.message || '');
    const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (match) {
      const seconds = (Number(match[1]) * 3600) + (Number(match[2]) * 60) + parseFloat(match[3]);
      if (Number.isFinite(seconds) && seconds > 0) return seconds;
    }
  }
  return null;
}
function escapeXml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  })[char]);
}

function getDirectoryStatus(signals) {
  if (signals.exists === true || signals.onWhatsAppExists === true) return 'NUMMER GEFUNDEN';
  if (signals.usyncOk && signals.onWhatsAppOk) return 'NICHT GEFUNDEN';
  return 'NICHT ERMITTELBAR';
}

function getBanStatus(signals) {
  const exists = signals?.exists === true || signals?.onWhatsAppExists === true;
  const apk = signals?.apkBanSignal;
  if (apk?.checked && (apk.availableCount || 0) > 0) {
    return exists ? 'NICHT GEBANNT (APK-BANALYSE)' : 'BAN VERDACHT (APK-BANALYSE)';
  }
  return 'NICHT VERIFIZIERBAR';
}

function getBanDetail(signals) {
  const exists = signals?.exists === true || signals?.onWhatsAppExists === true;
  const apk = signals?.apkBanSignal;
  if (apk?.checked && (apk.availableCount || 0) > 0) {
    return exists
      ? 'Nummer im WhatsApp-Verzeichnis gefunden; banchecker-APK-Analyse bestätigt keine Sperre.'
      : 'Nummer nicht im WhatsApp-Verzeichnis gefunden. banchecker-APK-Analyse deutet auf mögliche Sperre hin.';
  }
  return 'Kein offizielles Ban-Signal von WhatsApp verfügbar.';
}

export function buildCheck2EditSvg({ phone, signals, checkedAt = new Date(), videoOverlay = false, songText = null, audioDuration = null, apkSignal = null }) {
  const directoryStatus = getDirectoryStatus(signals);
  const banStatus = getBanStatus(signals);
  const banDetail = getBanDetail(signals);
  const deviceStatus = Number.isInteger(signals.deviceCount)
    ? `${signals.deviceCount} verknüpfte Geräte gemeldet`
    : 'Geräte-Signal nicht verfügbar';
  const timestamp = new Date(checkedAt).toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin'
  });
  const durationText = audioDuration != null
    ? `${Math.floor(audioDuration / 60)}:${String(Math.floor(audioDuration % 60)).padStart(2, '0')}`
    : '--:--';

  const backdrop = videoOverlay ? '' : `
    <rect width="720" height="1280" fill="url(#bg)"/>
    <circle cx="640" cy="170" r="220" fill="#d946ef" opacity=".14"/>
    <circle cx="76" cy="1090" r="280" fill="#6366f1" opacity=".12"/>
    <path d="M0 315H720M0 965H720" stroke="#fff" stroke-opacity=".035"/>
    <path d="M48 0V1280M672 0V1280" stroke="#fff" stroke-opacity=".035"/>
  `;
  const outerPanel = videoOverlay
    ? '<rect x="34" y="146" width="652" height="988" rx="38" fill="#090d19" fill-opacity=".86" stroke="url(#accent)" stroke-opacity=".8" stroke-width="2"/>'
    : '<rect x="34" y="42" width="652" height="1120" rx="40" fill="#090d19" fill-opacity=".82" stroke="#f0abfc" stroke-opacity=".42" stroke-width="2"/>';
  const contentTop = videoOverlay ? 207 : 103;
  const claimY = videoOverlay ? 950 : 905;
  const detailsY = videoOverlay ? 833 : 800;
  const numberY = videoOverlay ? 414 : 345;
  const statusY = videoOverlay ? 514 : 455;
  const signalY = videoOverlay ? 718 : 665;
  const songY = videoOverlay ? 620 : 565;

  /* APK-Sektion: nur verfügbare APKs anzeigen, baron0.com als Quelle */
  const availableApks = apkSignal?.apks?.filter((a) => a.exists) || [];
  const apkSectionY = songY + 80;
  const apkSection = availableApks.length > 0
    ? `
    <rect x="74" y="${apkSectionY}" width="572" height="${60 + availableApks.length * 18}" rx="18" fill="#0f172a" fill-opacity=".78" stroke="#fb7185" stroke-opacity=".35"/>
    <path d="M99 ${apkSectionY + 22}l7 13 7-13M107 ${apkSectionY + 35}v11" stroke="#fb7185" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="131" y="${apkSectionY + 28}" fill="#fbcfe8" font-family="Arial,sans-serif" font-size="15" font-weight="700">APK-BAN-CHECK · ${availableApks.length} banchecker-APK · ${APK_WEBSITE}</text>
    ${availableApks.map((a, i) => `
      <text x="131" y="${apkSectionY + 48 + (i * 16)}" fill="#e2e8f0" font-family="Consolas,monospace" font-size="12">${escapeXml(a.name)} · ${a.architecture} · ${escapeXml(a.source || APK_WEBSITE)}</text>
    `).join('')}
    `
    : `
    <rect x="74" y="${apkSectionY}" width="572" height="56" rx="18" fill="#0f172a" fill-opacity=".4" stroke="#64748b" stroke-opacity=".2"/>
    <text x="99" y="${apkSectionY + 28}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="13">APK-BAN-CHECK: keine banchecker-APK verfügbar</text>
    `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#090d1b"/>
        <stop offset=".52" stop-color="#17122d"/>
        <stop offset="1" stop-color="#090d18"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fb7185"/>
        <stop offset=".52" stop-color="#d879ff"/>
        <stop offset="1" stop-color="#67e8f9"/>
      </linearGradient>
      <linearGradient id="statusFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fbbf24" stop-opacity=".18"/>
        <stop offset="1" stop-color="#f97316" stop-opacity=".06"/>
      </linearGradient>
      <radialGradient id="glow">
        <stop offset="0" stop-color="#e879f9" stop-opacity=".32"/>
        <stop offset="1" stop-color="#e879f9" stop-opacity="0"/>
      </radialGradient>
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="18"/>
      </filter>
    </defs>
    ${backdrop}
    <circle cx="610" cy="220" r="120" fill="url(#glow)" filter="url(#softGlow)"/>
    ${outerPanel}
    <path d="M74 151H646" stroke="url(#accent)" stroke-width="5" stroke-linecap="round"/>
    <rect x="75" y="${contentTop - 48}" width="43" height="43" rx="13" fill="url(#accent)"/>
    <path d="M87 ${contentTop - 26}l8 8 13-16" fill="none" stroke="#0b1020" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="132" y="${contentTop - 19}" fill="#f5d0fe" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="2">HELLOKITTY BABY MAXI</text>
    <text x="132" y="${contentTop + 9}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="14" letter-spacing="2">SECURITY CHECK  /  #2</text>
    <rect x="515" y="${contentTop - 38}" width="126" height="35" rx="17" fill="#22c55e" fill-opacity=".11" stroke="#4ade80" stroke-opacity=".42"/>
    <circle cx="535" cy="${contentTop - 21}" r="5" fill="#4ade80"/>
    <text x="550" y="${contentTop - 15}" fill="#bbf7d0" font-family="Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="1">LIVE CHECK</text>

    <text x="76" y="${contentTop + 95}" fill="#fff" font-family="Arial,sans-serif" font-size="47" font-weight="800" letter-spacing="-1">WHATSAPP</text>
    <text x="76" y="${contentTop + 144}" fill="url(#accent)" font-family="Arial,sans-serif" font-size="38" font-weight="800" letter-spacing="1">ACCOUNT SCAN</text>
    <text x="78" y="${contentTop + 180}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="16">Verzeichnis-Signale · APK-Ban-Check</text>

    <rect x="74" y="${numberY}" width="572" height="91" rx="22" fill="#fff" fill-opacity=".045" stroke="#c4b5fd" stroke-opacity=".22"/>
    <text x="99" y="${numberY + 31}" fill="#a5b4fc" font-family="Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="2">GEPRÜFTE NUMMER</text>
    <text x="99" y="${numberY + 68}" fill="#fff" font-family="Consolas,monospace" font-size="29" font-weight="700">${escapeXml(phone)}</text>
    <text x="613" y="${numberY + 60}" text-anchor="end" fill="#c4b5fd" font-family="Arial,sans-serif" font-size="20">✦</text>

    <rect x="74" y="${statusY}" width="572" height="171" rx="25" fill="url(#statusFill)" stroke="#fbbf24" stroke-opacity=".62" stroke-width="1.5"/>
    <rect x="75" y="${statusY + 1}" width="5" height="169" rx="3" fill="#fbbf24"/>
    <text x="103" y="${statusY + 39}" fill="#fcd34d" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="3">BAN STATUS</text>
    <text x="103" y="${statusY + 91}" fill="#fff7ed" font-family="Arial,sans-serif" font-size="29" font-weight="800" letter-spacing=".4">${escapeXml(banStatus)}</text>
    <text x="103" y="${statusY + 125}" fill="#fde68a" font-family="Arial,sans-serif" font-size="16">${escapeXml(banDetail)}</text>
    <text x="103" y="${statusY + 151}" fill="#fcd34d" font-family="Arial,sans-serif" font-size="14">Temporär · permanent · Verifizierung · Mod-Ban: offen</text>

    <rect x="74" y="${songY}" width="572" height="66" rx="18" fill="#0f172a" fill-opacity=".78" stroke="#fb7185" stroke-opacity=".35"/>
    <path d="M99 ${songY + 22}l7 13 7-13M107 ${songY + 35}v11" stroke="#fb7185" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="131" y="${songY + 28}" fill="#fbcfe8" font-family="Arial,sans-serif" font-size="15" font-weight="700">SONG · ${escapeXml(songText || 'Kein Songtext hinterlegt')}</text>
    <text x="131" y="${songY + 47}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="13">Check2 · Audio-Sync · maxichen 2026 · ${durationText}</text>

    ${apkSection}

    <text x="77" y="${signalY}" fill="#a5b4fc" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="2.5">LIVE SIGNATURES</text>
    <rect x="74" y="${signalY + 20}" width="274" height="86" rx="18" fill="#fff" fill-opacity=".045" stroke="#fff" stroke-opacity=".1"/>
    <circle cx="103" cy="${signalY + 51}" r="6" fill="${directoryStatus === 'NUMMER GEFUNDEN' ? '#4ade80' : directoryStatus === 'NICHT GEFUNDEN' ? '#fbbf24' : '#94a3b8'}"/>
    <text x="121" y="${signalY + 55}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">VERZEICHNIS</text>
    <text x="98" y="${signalY + 86}" fill="#fff" font-family="Arial,sans-serif" font-size="17" font-weight="700">${escapeXml(directoryStatus)}</text>
    <rect x="364" y="${signalY + 20}" width="282" height="86" rx="18" fill="#fff" fill-opacity=".045" stroke="#fff" stroke-opacity=".1"/>
    <text x="389" y="${signalY + 55}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">VERKNÜPFTE GERÄTE</text>
    <text x="389" y="${signalY + 86}" fill="#fff" font-family="Arial,sans-serif" font-size="17" font-weight="700">${escapeXml(Number.isInteger(signals.deviceCount) ? `${signals.deviceCount} GERÄTE GEMELDET` : 'NICHT VERFÜGBAR')}</text>

    <rect x="74" y="${detailsY}" width="572" height="79" rx="18" fill="#0f172a" fill-opacity=".72" stroke="#a78bfa" stroke-opacity=".25"/>
    <path d="M99 ${detailsY + 26}l8 14 8-14M107 ${detailsY + 40}v13" stroke="#c4b5fd" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="131" y="${detailsY + 32}" fill="#e2e8f0" font-family="Arial,sans-serif" font-size="15" font-weight="700">NUR EINE VERZEICHNIS-ABFRAGE</text>
    <text x="131" y="${detailsY + 57}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="14">Existenz sagt nichts Sicheres über einen Bann aus.</text>

    <path d="M76 ${claimY}H644" stroke="url(#accent)" stroke-opacity=".55"/>
    <text x="77" y="${claimY + 31}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="13">GEPRÜFT · ${escapeXml(timestamp)}</text>
    <text x="77" y="${claimY + 62}" fill="#c4b5fd" font-family="Arial,sans-serif" font-size="14" font-weight="700">${escapeXml(CREDIT)}</text>
    <text x="643" y="${claimY + 62}" text-anchor="end" fill="#64748b" font-family="Arial,sans-serif" font-size="12" letter-spacing="1">NO FALSE CLAIMS</text>
    ${videoOverlay ? '' : `<text x="360" y="${claimY + 104}" text-anchor="middle" fill="#64748b" font-family="Arial,sans-serif" font-size="12" letter-spacing="1">WHATSAPP-VERZEICHNIS · APK-BAN-CHECK · ${APK_WEBSITE}</text>`}
  </svg>`;
}

export async function createCheck2Edit({
  phone,
  signals,
  videoPath,
  audioPath,
  outputDirectory = path.resolve('edit'),
  ffmpegPath,
  checkedAt = new Date(),
  songText = null,
  apkSignal = null
}) {
  for (const [label, filePath] of [['Audio', audioPath]]) {
    if (!filePath) throw new Error(`${label}-Datei ist nicht konfiguriert.`);
    await fs.access(filePath);
  }
  if (videoPath) await fs.access(videoPath);
  if (!ffmpegPath) throw new Error('FFmpeg ist für die Erstellung des Check2-Edits nicht verfügbar.');

  /* Audio-Dauer ermitteln – das Edit läuft so lang wie der Song. */
  let audioDuration = await getAudioDuration(ffmpegPath, audioPath);
  if (!Number.isFinite(audioDuration) || audioDuration <= 0) {
    audioDuration = 12;
  }

  const timestamp = checkedAt.toISOString().replace(/[-:.]/g, '').replace('T', '-').replace('Z', '');
  const safePhone = String(phone).replace(/\D/g, '');
  const stem = `check2-${safePhone}-${timestamp}`;
  const imagePath = path.join(outputDirectory, `${stem}.png`);
  const videoPathOut = path.join(outputDirectory, `${stem}.mp4`);
  const svg = buildCheck2EditSvg({ phone: `+${safePhone}`, signals, checkedAt, songText, audioDuration, apkSignal });
  const videoSvg = buildCheck2EditSvg({ phone: `+${safePhone}`, signals, checkedAt, videoOverlay: true, songText, audioDuration, apkSignal });

  await fs.mkdir(outputDirectory, { recursive: true });
  const [image, videoOverlay] = await Promise.all([
    sharp(Buffer.from(svg)).png().toBuffer(),
    sharp(Buffer.from(videoSvg)).png().toBuffer()
  ]);
  await fs.writeFile(imagePath, image);
  const overlayPath = path.join(outputDirectory, `${stem}.overlay.png`);
  await fs.writeFile(overlayPath, videoOverlay);

  const ffmpegArgs = [
    '-y'
  ];

  if (videoPath) {
    ffmpegArgs.push('-stream_loop', '-1', '-i', videoPath, '-stream_loop', '-1', '-i', audioPath);
  } else {
    ffmpegArgs.push('-stream_loop', '-1', '-i', audioPath);
  }
  ffmpegArgs.push('-loop', '1', '-i', overlayPath);

  if (videoPath) {
    ffmpegArgs.push('-filter_complex', `[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,eq=brightness=-0.08:saturation=1.12[bg];[bg][2:v]overlay=0:0:eof_action=repeat:shortest=0,format=yuv420p[v]`);
    ffmpegArgs.push('-map', '[v]', '-map', '1:a:0');
  } else {
    ffmpegArgs.push('-filter_complex', `[1:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,format=yuv420p[v]`);
    ffmpegArgs.push('-map', '[v]', '-map', '0:a:0');
  }

  ffmpegArgs.push(
    '-t', String(audioDuration),
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-profile:v', 'baseline',
    '-level', '3.0',
    '-r', '30',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-ac', '2',
    '-movflags', '+faststart',
    videoPathOut
  );

  try {
    await execFileAsync(ffmpegPath, ffmpegArgs, { timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
  } catch (error) {
    await fs.rm(imagePath, { force: true });
    await fs.rm(overlayPath, { force: true });
    await fs.rm(videoPathOut, { force: true });
    throw new Error(`FFmpeg konnte das Check2-Edit nicht erstellen: ${String(error?.message || error).slice(0, 240)}`);
  }

  await fs.rm(overlayPath, { force: true });
  const [imageBuffer, videoBuffer] = await Promise.all([
    fs.readFile(imagePath),
    fs.readFile(videoPathOut)
  ]);
  return { imagePath, videoPath: videoPathOut, imageBuffer, videoBuffer };
}

/* ─────────────────────────────────────────────────────────────────────
   CHECKBAN — eigenes Hello Kitty Baby Maxi (LoveBot) Design (pink)
   ───────────────────────────────────────────────────────────────────── */

function buildCheckBanSvg({ phone, signals, checkedAt = new Date(), videoOverlay = false, songText = null, audioDuration = null, apkSignal = null, isSelfCheck = false }) {
  const directoryStatus = getDirectoryStatus(signals);
  const banStatus = getBanStatus(signals);
  const banDetail = getBanDetail(signals);
  const deviceStatus = Number.isInteger(signals.deviceCount)
    ? `${signals.deviceCount} verknüpfte Geräte gemeldet`
    : 'Geräte-Signal nicht verfügbar';
  const timestamp = new Date(checkedAt).toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin'
  });
  const durationText = audioDuration != null
    ? `${Math.floor(audioDuration / 60)}:${String(Math.floor(audioDuration % 60)).padStart(2, '0')}`
    : '--:--';

  const backdrop = videoOverlay ? '' : `
    <rect width="720" height="1280" fill="url(#bg)"/>
    <circle cx="640" cy="170" r="220" fill="#f472b6" opacity=".14"/>
    <circle cx="76" cy="1090" r="280" fill="#ec4899" opacity=".12"/>
    <path d="M0 315H720M0 965H720" stroke="#fff" stroke-opacity=".035"/>
    <path d="M48 0V1280M672 0V1280" stroke="#fff" stroke-opacity=".035"/>
  `;
  const outerPanel = videoOverlay
    ? '<rect x="34" y="146" width="652" height="988" rx="38" fill="#090d19" fill-opacity=".86" stroke="url(#accent)" stroke-opacity=".8" stroke-width="2"/>'
    : '<rect x="34" y="42" width="652" height="1120" rx="40" fill="#090d19" fill-opacity=".82" stroke="#f472b6" stroke-opacity=".42" stroke-width="2"/>';
  const contentTop = videoOverlay ? 207 : 103;
  const claimY = videoOverlay ? 950 : 905;
  const detailsY = videoOverlay ? 833 : 800;
  const numberY = videoOverlay ? 414 : 345;
  const statusY = videoOverlay ? 514 : 455;
  const signalY = videoOverlay ? 718 : 665;
  const songY = videoOverlay ? 620 : 565;

  const availableApks = apkSignal?.apks?.filter((a) => a.exists) || [];
  const apkSectionY = songY + 80;
  const apkSection = availableApks.length > 0
    ? `
    <rect x="74" y="${apkSectionY}" width="572" height="${60 + availableApks.length * 18}" rx="18" fill="#0f172a" fill-opacity=".78" stroke="#f472b6" stroke-opacity=".35"/>
    <path d="M99 ${apkSectionY + 22}l7 13 7-13M107 ${apkSectionY + 35}v11" stroke="#f472b6" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="131" y="${apkSectionY + 28}" fill="#fbcfe8" font-family="Arial,sans-serif" font-size="15" font-weight="700">APK-BAN-CHECK · ${availableApks.length} banchecker-APK · baron0.com</text>
    ${availableApks.map((a, i) => `
      <text x="131" y="${apkSectionY + 48 + (i * 16)}" fill="#e2e8f0" font-family="Consolas,monospace" font-size="12">${escapeXml(a.name)} · ${a.architecture} · https://baron0.com/free</text>
    `).join('')}
    `
    : `
    <rect x="74" y="${apkSectionY}" width="572" height="56" rx="18" fill="#0f172a" fill-opacity=".4" stroke="#64748b" stroke-opacity=".2"/>
    <text x="99" y="${apkSectionY + 28}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="13">APK-BAN-CHECK: keine lokalen APK · https://baron0.com/free</text>
    `;

  const selfCheckLabel = isSelfCheck ? '· EIGENE NUMMER' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#090d1b"/>
        <stop offset=".52" stop-color="#17122d"/>
        <stop offset="1" stop-color="#090d18"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#f472b6"/>
        <stop offset=".52" stop-color="#ec4899"/>
        <stop offset="1" stop-color="#fbcfe8"/>
      </linearGradient>
      <linearGradient id="statusFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fbbf24" stop-opacity=".18"/>
        <stop offset="1" stop-color="#f97316" stop-opacity=".06"/>
      </linearGradient>
      <radialGradient id="glow">
        <stop offset="0" stop-color="#f472b6" stop-opacity=".32"/>
        <stop offset="1" stop-color="#f472b6" stop-opacity="0"/>
      </radialGradient>
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="18"/>
      </filter>
    </defs>
    ${backdrop}
    <circle cx="610" cy="220" r="120" fill="url(#glow)" filter="url(#softGlow)"/>
    ${outerPanel}
    <path d="M74 151H646" stroke="url(#accent)" stroke-width="5" stroke-linecap="round"/>
    <rect x="75" y="${contentTop - 48}" width="43" height="43" rx="13" fill="url(#accent)"/>
    <path d="M87 ${contentTop - 26}l8 8 13-16" fill="none" stroke="#0b1020" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="132" y="${contentTop - 19}" fill="#fbcfe8" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="2">HELLOKITTY BABY MAXI</text>
    <text x="132" y="${contentTop + 9}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="14" letter-spacing="2">CHECKBAN  /  LOVEBOT${selfCheckLabel}</text>
    <rect x="515" y="${contentTop - 38}" width="126" height="35" rx="17" fill="#22c55e" fill-opacity=".11" stroke="#4ade80" stroke-opacity=".42"/>
    <circle cx="535" cy="${contentTop - 21}" r="5" fill="#4ade80"/>
    <text x="550" y="${contentTop - 15}" fill="#bbf7d0" font-family="Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="1">LIVE CHECK</text>

    <text x="76" y="${contentTop + 95}" fill="#fff" font-family="Arial,sans-serif" font-size="47" font-weight="800" letter-spacing="-1">WHATSAPP</text>
    <text x="76" y="${contentTop + 144}" fill="url(#accent)" font-family="Arial,sans-serif" font-size="38" font-weight="800" letter-spacing="1">BAN STATUS</text>
    <text x="78" y="${contentTop + 180}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="16">Verzeichnis-Signale · APK-Ban-Check · baron0.com</text>

    <rect x="74" y="${numberY}" width="572" height="91" rx="22" fill="#fff" fill-opacity=".045" stroke="#f472b6" stroke-opacity=".22"/>
    <text x="99" y="${numberY + 31}" fill="#a5b4fc" font-family="Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="2">GEPRÜFTE NUMMER</text>
    <text x="99" y="${numberY + 68}" fill="#fff" font-family="Consolas,monospace" font-size="29" font-weight="700">${escapeXml(phone)}</text>
    <text x="613" y="${numberY + 60}" text-anchor="end" fill="#f472b6" font-family="Arial,sans-serif" font-size="20">✦</text>

    <rect x="74" y="${statusY}" width="572" height="171" rx="25" fill="url(#statusFill)" stroke="#fbbf24" stroke-opacity=".62" stroke-width="1.5"/>
    <rect x="75" y="${statusY + 1}" width="5" height="169" rx="3" fill="#fbbf24"/>
    <text x="103" y="${statusY + 39}" fill="#fcd34d" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="3">BAN STATUS</text>
    <text x="103" y="${statusY + 91}" fill="#fff7ed" font-family="Arial,sans-serif" font-size="29" font-weight="800" letter-spacing=".4">${escapeXml(banStatus)}</text>
    <text x="103" y="${statusY + 125}" fill="#fde68a" font-family="Arial,sans-serif" font-size="16">${escapeXml(banDetail)}</text>
    <text x="103" y="${statusY + 151}" fill="#fcd34d" font-family="Arial,sans-serif" font-size="14">Temporär · permanent · Verifizierung · Mod-Ban: offen</text>

    <rect x="74" y="${songY}" width="572" height="66" rx="18" fill="#0f172a" fill-opacity=".78" stroke="#f472b6" stroke-opacity=".35"/>
    <path d="M99 ${songY + 22}l7 13 7-13M107 ${songY + 35}v11" stroke="#f472b6" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="131" y="${songY + 28}" fill="#fbcfe8" font-family="Arial,sans-serif" font-size="15" font-weight="700">SONG · ${escapeXml(songText || 'Kein Songtext hinterlegt')}</text>
    <text x="131" y="${songY + 47}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="13">Checkban · Audio-Sync · Hello Kitty Baby Maxi (LoveBot) · ${durationText}</text>

    ${apkSection}

    <text x="77" y="${signalY}" fill="#a5b4fc" font-family="Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="2.5">LIVE SIGNATURES</text>
    <rect x="74" y="${signalY + 20}" width="274" height="86" rx="18" fill="#fff" fill-opacity=".045" stroke="#fff" stroke-opacity=".1"/>
    <circle cx="103" cy="${signalY + 51}" r="6" fill="${directoryStatus === 'NUMMER GEFUNDEN' ? '#4ade80' : directoryStatus === 'NICHT GEFUNDEN' ? '#fbbf24' : '#94a3b8'}"/>
    <text x="121" y="${signalY + 55}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">VERZEICHNIS</text>
    <text x="98" y="${signalY + 86}" fill="#fff" font-family="Arial,sans-serif" font-size="17" font-weight="700">${escapeXml(directoryStatus)}</text>
    <rect x="364" y="${signalY + 20}" width="282" height="86" rx="18" fill="#fff" fill-opacity=".045" stroke="#fff" stroke-opacity=".1"/>
    <text x="389" y="${signalY + 55}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">VERKNÜPFTE GERÄTE</text>
    <text x="389" y="${signalY + 86}" fill="#fff" font-family="Arial,sans-serif" font-size="17" font-weight="700">${escapeXml(Number.isInteger(signals.deviceCount) ? `${signals.deviceCount} GERÄTE GEMELDET` : 'NICHT VERFÜGBAR')}</text>

    <rect x="74" y="${detailsY}" width="572" height="79" rx="18" fill="#0f172a" fill-opacity=".72" stroke="#f472b6" stroke-opacity=".25"/>
    <path d="M99 ${detailsY + 26}l8 14 8-14M107 ${detailsY + 40}v13" stroke="#f472b6" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="131" y="${detailsY + 32}" fill="#e2e8f0" font-family="Arial,sans-serif" font-size="15" font-weight="700">NUR EINE VERZEICHNIS-ABFRAGE</text>
    <text x="131" y="${detailsY + 57}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="14">Existenz sagt nichts Sicheres über einen Bann aus.</text>

    <path d="M76 ${claimY}H644" stroke="url(#accent)" stroke-opacity=".55"/>
    <text x="77" y="${claimY + 31}" fill="#94a3b8" font-family="Arial,sans-serif" font-size="13">GEPRÜFT · ${escapeXml(timestamp)}</text>
    <text x="77" y="${claimY + 62}" fill="#fbcfe8" font-family="Arial,sans-serif" font-size="14" font-weight="700">${escapeXml(CREDIT)}</text>
    <text x="643" y="${claimY + 62}" text-anchor="end" fill="#64748b" font-family="Arial,sans-serif" font-size="12" letter-spacing="1">NO FALSE CLAIMS</text>
    ${videoOverlay ? '' : `<text x="360" y="${claimY + 104}" text-anchor="middle" fill="#64748b" font-family="Arial,sans-serif" font-size="12" letter-spacing="1">WHATSAPP-VERZEICHNIS · APK-BAN-CHECK · https://baron0.com/free</text>`}
  </svg>`;
}

export async function createCheckBanEdit({
  phone,
  signals,
  videoPath,
  audioPath,
  outputDirectory = path.resolve('edit'),
  ffmpegPath,
  checkedAt = new Date(),
  songText = null,
  apkSignal = null,
  isSelfCheck = false
}) {
  for (const [label, filePath] of [['Audio', audioPath]]) {
    if (!filePath) throw new Error(`${label}-Datei ist nicht konfiguriert.`);
    await fs.access(filePath);
  }
  if (videoPath) await fs.access(videoPath);
  if (!ffmpegPath) throw new Error('FFmpeg ist für die Erstellung des Checkban-Edits nicht verfügbar.');

  /* Audio-Dauer ermitteln (mit ffprobe) – das Edit läuft so lang wie der Song. */
  let audioDuration = 12;
  try {
    const ffprobePath = ffmpegPath.replace('ffmpeg', 'ffprobe') || 'ffprobe';
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      audioPath
    ], { timeout: 15000, maxBuffer: 4 * 1024 * 1024 });
    const parsed = parseFloat(String(stdout || '').trim());
    if (Number.isFinite(parsed) && parsed > 0) audioDuration = parsed;
  } catch (e) {
    /* Fallback auf 12s, falls ffprobe nicht verfügbar. */
  }

  const timestamp = checkedAt.toISOString().replace(/[-:.]/g, '').replace('T', '-').replace('Z', '');
  const safePhone = String(phone).replace(/\D/g, '');
  const stem = `checkban-${safePhone}-${timestamp}`;
  const imagePath = path.join(outputDirectory, `${stem}.png`);
  const videoPathOut = path.join(outputDirectory, `${stem}.mp4`);
  const svg = buildCheckBanSvg({ phone: `+${safePhone}`, signals, checkedAt, songText, audioDuration, apkSignal, isSelfCheck });
  const videoSvg = buildCheckBanSvg({ phone: `+${safePhone}`, signals, checkedAt, videoOverlay: true, songText, audioDuration, apkSignal, isSelfCheck });

  await fs.mkdir(outputDirectory, { recursive: true });
  const [image, videoOverlay] = await Promise.all([
    sharp(Buffer.from(svg)).png().toBuffer(),
    sharp(Buffer.from(videoSvg)).png().toBuffer()
  ]);
  await fs.writeFile(imagePath, image);
  const overlayPath = path.join(outputDirectory, `${stem}.overlay.png`);
  await fs.writeFile(overlayPath, videoOverlay);

  const ffmpegArgs = [
    '-y'
  ];

  if (videoPath) {
    ffmpegArgs.push('-stream_loop', '-1', '-i', videoPath, '-stream_loop', '-1', '-i', audioPath);
  } else {
    ffmpegArgs.push('-stream_loop', '-1', '-i', audioPath);
  }
  ffmpegArgs.push('-loop', '1', '-i', overlayPath);

  if (videoPath) {
    ffmpegArgs.push('-filter_complex', `[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,eq=brightness=-0.08:saturation=1.12[bg];[bg][2:v]overlay=0:0:eof_action=repeat:shortest=0,format=yuv420p[v]`);
    ffmpegArgs.push('-map', '[v]', '-map', '1:a:0');
  } else {
    ffmpegArgs.push('-filter_complex', `[1:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,format=yuv420p[v]`);
    ffmpegArgs.push('-map', '[v]', '-map', '0:a:0');
  }

  ffmpegArgs.push(
    '-t', String(audioDuration),
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-profile:v', 'baseline',
    '-level', '3.0',
    '-r', '30',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-ac', '2',
    '-movflags', '+faststart',
    videoPathOut
  );

  try {
    await execFileAsync(ffmpegPath, ffmpegArgs, { timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
  } catch (error) {
    await fs.rm(imagePath, { force: true });
    await fs.rm(overlayPath, { force: true });
    await fs.rm(videoPathOut, { force: true });
    throw new Error(`FFmpeg konnte das Checkban-Edit nicht erstellen: ${String(error?.message || error).slice(0, 240)}`);
  }

  await fs.rm(overlayPath, { force: true });
  const [imageBuffer, videoBuffer] = await Promise.all([
    fs.readFile(imagePath),
    fs.readFile(videoPathOut)
  ]);
  return { imagePath, videoPath: videoPathOut, imageBuffer, videoBuffer };
}
