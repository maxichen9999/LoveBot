import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ReadableStream } from 'node:stream/web';
import { downloadMediaFile, validateDownloadUrl } from '../mediaDownloadSecurity.js';

const publicResolver = async () => [{ address: '8.8.8.8', family: 4 }];

test('blockiert lokale und private Download-Ziele', async () => {
  for (const url of ['http://127.0.0.1/file', 'http://10.1.2.3/file', 'http://localhost/file', 'file:///etc/passwd']) {
    await assert.rejects(validateDownloadUrl(url), /Interne|HTTP/);
  }
  await assert.rejects(
    validateDownloadUrl('https://media.example.org/file', async () => [{ address: '192.168.1.4', family: 4 }]),
    /nicht öffentlich/
  );
});

test('folgt Weiterleitungen erst nach erneuter Zielprüfung', async () => {
  let requests = 0;
  await assert.rejects(downloadMediaFile('https://media.example.org/start', 'unused', {
    resolveHost: publicResolver,
    fetchImpl: async () => {
      requests++;
      return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } });
    }
  }), /Interne/);
  assert.equal(requests, 1);
});

test('streamt eine öffentliche Datei auf Platte', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lovebot-media-'));
  const target = path.join(directory, 'media.bin');
  try {
    await downloadMediaFile('https://media.example.org/file', target, {
      maxBytes: 16,
      resolveHost: publicResolver,
      fetchImpl: async (url, options) => {
        assert.equal(url.hostname, 'media.example.org');
        assert.equal(options.redirect, 'manual');
        return new Response('media', { status: 200, headers: { 'content-length': '5' } });
      }
    });
    assert.equal(await fs.readFile(target, 'utf8'), 'media');
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('stoppt übergroße Streams und entfernt die unvollständige Datei', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lovebot-media-limit-'));
  const target = path.join(directory, 'oversize.bin');
  try {
    await assert.rejects(downloadMediaFile('https://media.example.org/file', target, {
      maxBytes: 5,
      resolveHost: publicResolver,
      fetchImpl: async () => new Response(new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(4));
          controller.enqueue(new Uint8Array(4));
          controller.close();
        }
      }))
    }), /überschreitet das Limit/);
    await assert.rejects(fs.access(target));
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});