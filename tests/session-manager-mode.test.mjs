import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const originalCwd = process.cwd();
const testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'lovebot-session-mode-'));
process.chdir(testRoot);
const sessions = await import('../sessionManager.js');

test.after(async () => {
  process.chdir(originalCwd);
  await fs.rm(testRoot, { recursive: true, force: true });
});

test('AdminSave purpose persists in the raw and public session registry views', () => {
  const created = sessions.createSession('AdminSave', { sessionMode: 'admin-save', actor: 'test' });
  const raw = sessions.getSessionRaw(created.id);
  const visible = sessions.listSessions().find((entry) => entry.id === created.id);

  assert.equal(created.id, 'adminsave');
  assert.equal(raw.sessionMode, 'admin-save');
  assert.equal(visible.sessionMode, 'admin-save');
});

test('a session named AdminSave is inferred as security-only after old registry migration', async () => {
  const created = sessions.createSession('AdminSave Legacy', { actor: 'test' });
  const raw = sessions.getSessionRaw(created.id);
  raw.sessionMode = undefined;
  raw.name = 'AdminSave';
  await fs.writeFile(path.join('Database', 'sessions.json'), JSON.stringify({
    config: { spawn: { enabled: false, command: 'node', args: ['Love.js'] } },
    sessions: { [created.id]: raw }, activity: [], locks: {}, audit: []
  }, null, 2));

  assert.equal(sessions.listSessions().find((entry) => entry.id === created.id).sessionMode, 'admin-save');
});

test('new sessions default to local-only QR visibility and do not auto-broadcast to groups', () => {
  const created = sessions.createSession('QR-Test', { actor: 'test' });
  const raw = sessions.getSessionRaw(created.id);

  assert.equal(raw.announceOnConnect, false);
  assert.equal(raw.sessionMode, 'commands');
});
