import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const MEDIA_EXTENSIONS = {
  imageMessage: {
    jpeg: 'jpg',
    jpg: 'jpg',
    png: 'png',
    webp: 'webp',
    gif: 'gif',
    avif: 'avif'
  },
  videoMessage: {
    mp4: 'mp4',
    '3gpp': '3gp',
    quicktime: 'mov',
    webm: 'webm'
  },
  audioMessage: {
    ogg: 'ogg',
    opus: 'ogg',
    mpeg: 'mp3',
    mp3: 'mp3',
    aac: 'aac',
    mp4: 'm4a',
    'x-m4a': 'm4a',
    wav: 'wav',
    amr: 'amr'
  }
};

const DEFAULT_EXTENSIONS = {
  imageMessage: 'jpg',
  videoMessage: 'mp4',
  audioMessage: 'ogg'
};

const rememberedMedia = new Map();
const REMEMBERED_MEDIA_TTL_MS = 10 * 60 * 1000;
const MAX_REMEMBERED_MEDIA = 200;

function mediaCacheKey(remoteJid, messageId) {
  if (!remoteJid || !messageId) return null;
  return `${remoteJid}\0${messageId}`;
}

export function rememberMediaMessage(message, now = Date.now()) {
  const key = mediaCacheKey(message?.key?.remoteJid, message?.key?.id);
  if (!key || !message?.message) return false;

  for (const [cachedKey, entry] of rememberedMedia) {
    if (now - entry.savedAt > REMEMBERED_MEDIA_TTL_MS) {
      rememberedMedia.delete(cachedKey);
    }
  }
  rememberedMedia.delete(key);
  rememberedMedia.set(key, { message, savedAt: now });
  while (rememberedMedia.size > MAX_REMEMBERED_MEDIA) {
    rememberedMedia.delete(rememberedMedia.keys().next().value);
  }
  return true;
}

export function getRememberedMediaMessage(remoteJid, messageId, now = Date.now()) {
  const key = mediaCacheKey(remoteJid, messageId);
  if (!key) return null;
  const entry = rememberedMedia.get(key);
  if (!entry) return null;
  if (now - entry.savedAt > REMEMBERED_MEDIA_TTL_MS) {
    rememberedMedia.delete(key);
    return null;
  }
  return entry.message;
}

export async function saveAndSendMedia({
  sock,
  chat,
  type,
  buffer,
  caption,
  mimetype,
  ptt,
  directory,
  quoted
}) {
  const extensions = MEDIA_EXTENSIONS[type];
  if (!extensions) {
    throw new TypeError(`Nicht unterstützter Medientyp: ${type}`);
  }
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new TypeError('Das Medium muss ein nicht leerer Buffer sein.');
  }
  if (!directory) {
    throw new TypeError('Ein Speicherordner ist erforderlich.');
  }

  const subtype = String(mimetype || '').split(';', 1)[0].split('/')[1]?.toLowerCase();
  const extension = extensions[subtype] || DEFAULT_EXTENSIONS[type];
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(directory, fileName);
  await mkdir(directory, { recursive: true });
  await writeFile(filePath, buffer, { flag: 'wx' });

  const payload = type === 'imageMessage'
    ? { image: buffer, caption: caption || undefined }
    : type === 'videoMessage'
      ? { video: buffer, caption: caption || undefined }
      : {
          audio: buffer,
          mimetype: mimetype || 'audio/ogg; codecs=opus',
          ptt: ptt !== false
        };

  await sock.sendMessage(chat, payload, { quoted });
  return { fileName, filePath };
}
