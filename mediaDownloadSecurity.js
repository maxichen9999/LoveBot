import fs from 'node:fs';
import dns from 'node:dns/promises';
import net from 'node:net';
import { createWriteStream } from 'node:fs';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const PRIVATE_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.test', '.example', '.invalid'];
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function isPublicIp(address) {
  const version = net.isIP(address);
  if (version === 4) {
    const octets = address.split('.').map(Number);
    const [first, second, third] = octets;
    return !(
      first === 0 || first === 10 || first === 127 || first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && (second === 0 || second === 168)) ||
      (first === 192 && second === 88 && third === 99) ||
      (first === 198 && (second === 18 || second === 19)) ||
      (first === 198 && second === 51 && third === 100) ||
      (first === 203 && second === 0 && third === 113)
    );
  }
  if (version === 6) {
    const normalized = address.toLowerCase();
    return !(
      normalized === '::' || normalized === '::1' || normalized.startsWith('::ffff:') ||
      /^[f][c-d]/.test(normalized) || /^fe[89ab]/.test(normalized) ||
      normalized.startsWith('ff') || normalized.startsWith('2001:db8:')
    );
  }
  return false;
}

export async function validateDownloadUrl(value, resolveHost = dns.lookup) {
  let url;
  try { url = new URL(String(value)); }
  catch (error) { throw new Error('Ungültige Download-Adresse.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Nur öffentliche HTTP(S)-Download-Adressen sind erlaubt.');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '');
  if (!hostname || hostname === 'localhost' || PRIVATE_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw new Error('Interne Download-Ziele sind gesperrt.');
  }

  if (net.isIP(hostname)) {
    if (!isPublicIp(hostname)) throw new Error('Interne Download-Ziele sind gesperrt.');
    return url;
  }

  let records;
  try { records = await resolveHost(hostname, { all: true, verbatim: true }); }
  catch (error) { throw new Error('Download-Host konnte nicht sicher aufgelöst werden.'); }
  if (!records?.length || records.some((record) => !isPublicIp(record.address))) {
    throw new Error('Download-Host verweist auf ein nicht öffentliches Ziel.');
  }
  return url;
}

export async function downloadMediaFile(value, targetPath, options = {}) {
  const maxBytes = options.maxBytes ?? 128 * 1024 * 1024;
  const timeoutMs = options.timeoutMs ?? 45_000;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const resolveHost = options.resolveHost ?? dns.lookup;
  const signal = AbortSignal.timeout(timeoutMs);
  let current = String(value);

  for (let redirects = 0; redirects <= 4; redirects++) {
    const url = await validateDownloadUrl(current, resolveHost);
    const response = await fetchImpl(url, {
      redirect: 'manual',
      signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
        referer: 'https://www.youtube.com/',
        accept: '*/*'
      }
    });

    if (REDIRECT_STATUSES.has(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel().catch(() => {});
      if (!location || redirects === 4) throw new Error('Zu viele oder ungültige Weiterleitungen beim Download.');
      current = new URL(location, url).href;
      continue;
    }
    if (!response.ok) throw new Error(`Download fehlgeschlagen: HTTP ${response.status}`);
    if (!response.body) throw new Error('Der Download lieferte keine Datei.');

    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      await response.body.cancel().catch(() => {});
      throw new Error(`Datei überschreitet das Limit von ${Math.floor(maxBytes / 1024 / 1024)} MB.`);
    }

    let received = 0;
    try {
      await pipeline(
        Readable.fromWeb(response.body),
        new Transform({
          transform(chunk, encoding, callback) {
            received += chunk.length;
            if (received > maxBytes) return callback(new Error(`Datei überschreitet das Limit von ${Math.floor(maxBytes / 1024 / 1024)} MB.`));
            callback(null, chunk);
          }
        }),
        createWriteStream(targetPath),
        { signal }
      );
      if (!received) throw new Error('Der Download lieferte eine leere Datei.');
      return targetPath;
    } catch (error) {
      await fs.promises.rm(targetPath, { force: true }).catch(() => {});
      throw error;
    }
  }

  throw new Error('Zu viele Weiterleitungen beim Download.');
}