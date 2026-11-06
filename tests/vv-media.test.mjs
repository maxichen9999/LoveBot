import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  getRememberedMediaMessage,
  rememberMediaMessage,
  saveAndSendMedia
} from '../vvMedia.js';

for (const scenario of [
  { type: 'imageMessage', field: 'image', mimetype: 'image/jpeg', extension: '.jpg' },
  { type: 'videoMessage', field: 'video', mimetype: 'video/mp4', extension: '.mp4' },
  { type: 'audioMessage', field: 'audio', mimetype: 'audio/ogg; codecs=opus', extension: '.ogg' }
]) {
  test(`vv saves and sends ${scenario.type} as a normal message`, async (t) => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lovebot-vv-'));
    t.after(() => fs.rm(directory, { recursive: true, force: true }));

    const buffer = Buffer.from('sample media');
    let sent;
    const result = await saveAndSendMedia({
      sock: {
        async sendMessage(...args) {
          sent = args;
        }
      },
      chat: 'test-chat',
      type: scenario.type,
      buffer,
      caption: 'Testcaption',
      mimetype: scenario.mimetype,
      directory,
      quoted: { key: 'quoted' }
    });

    assert.equal(path.extname(result.fileName), scenario.extension);
    assert.deepEqual(await fs.readFile(result.filePath), buffer);
    assert.equal(sent[0], 'test-chat');
    assert.deepEqual(sent[1][scenario.field], buffer);
    assert.equal(sent[1].caption, scenario.type === 'audioMessage' ? undefined : 'Testcaption');
    assert.equal(Object.hasOwn(sent[1], 'viewOnce'), false);
    assert.deepEqual(sent[2], { quoted: { key: 'quoted' } });
  });
}

test('vv rejects invalid media before sending or writing a file', async () => {
  let sendCount = 0;
  await assert.rejects(
    saveAndSendMedia({
      sock: { async sendMessage() { sendCount++; } },
      chat: 'test-chat',
      type: 'stickerMessage',
      buffer: Buffer.from('not supported'),
      directory: os.tmpdir()
    }),
    /Nicht unterstützter Medientyp/
  );
  assert.equal(sendCount, 0);
});

test('vv retrieves the full original media message by chat and stanza id', () => {
  const original = {
    key: { remoteJid: 'chat-cache-test', id: 'media-cache-test' },
    message: { viewOnceMessageV2: { message: { imageMessage: { mediaKey: Buffer.from('key') } } } }
  };
  assert.equal(rememberMediaMessage(original), true);
  assert.equal(getRememberedMediaMessage('chat-cache-test', 'media-cache-test'), original);
  assert.equal(getRememberedMediaMessage('other-chat', 'media-cache-test'), null);
});

test('vv does not return cached original media after its retention window', () => {
  const original = {
    key: { remoteJid: 'chat-expired-test', id: 'media-expired-test' },
    message: { imageMessage: { mediaKey: Buffer.from('key') } }
  };
  const savedAt = 1_000_000;
  rememberMediaMessage(original, savedAt);
  assert.equal(getRememberedMediaMessage('chat-expired-test', 'media-expired-test', savedAt + 10 * 60 * 1000 + 1), null);
});
