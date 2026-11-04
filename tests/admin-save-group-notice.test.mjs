import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sendGroupNoticeOnce } from '../adminSaveGroupNotice.js';

test('group notice is sent only once and normalized group ids share the marker', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lovebot-adminsave-notice-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  let sent = 0;
  const send = async () => { sent++; };
  assert.equal(await sendGroupNoticeOnce('12345@g.us', send, directory), true);
  assert.equal(await sendGroupNoticeOnce('12345:7@g.us', send, directory), false);
  assert.equal(sent, 1);
});

test('failed sends can be retried without leaving a sent marker', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lovebot-adminsave-retry-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  await assert.rejects(
    sendGroupNoticeOnce('67890@g.us', async () => { throw new Error('send failed'); }, directory),
    /send failed/
  );
  assert.equal(await sendGroupNoticeOnce('67890@g.us', async () => {}, directory), true);
});

test('concurrent callers cannot send duplicate group notices', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lovebot-adminsave-lock-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  let release;
  let sent = 0;
  const pendingSend = new Promise((resolve) => { release = resolve; });
  const first = sendGroupNoticeOnce('24680@g.us', async () => {
    sent++;
    await pendingSend;
  }, directory);
  await new Promise((resolve) => setTimeout(resolve, 10));
  const second = await sendGroupNoticeOnce('24680@g.us', async () => { sent++; }, directory);
  release();

  assert.equal(await first, true);
  assert.equal(second, false);
  assert.equal(sent, 1);
});
