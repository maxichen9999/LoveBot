import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSessionMode, sessionCanProcessMessages, sessionCanProtectSavedAdmins, sessionsVisibleToRole } from '../sessionPolicy.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('main session remains command-capable and does not own AdminSave events', () => {
  const mode = resolveSessionMode('main');
  assert.equal(mode, 'commands');
  assert.equal(sessionCanProcessMessages(mode), true);
  assert.equal(sessionCanProtectSavedAdmins(mode), false);
});

test('AdminSave session is security-only and never processes incoming messages', () => {
  for (const id of ['AdminSave', 'admin-save', 'admin_save', 'adminsave_2']) {
    const mode = resolveSessionMode(id);
    assert.equal(mode, 'admin-save', id);
    assert.equal(sessionCanProcessMessages(mode), false, id);
    assert.equal(sessionCanProtectSavedAdmins(mode), true, id);
  }
});

test('explicit session mode overrides inferred mode', () => {
  assert.equal(resolveSessionMode('main', 'admin-save'), 'commands');
  assert.equal(resolveSessionMode('adminsave', 'commands'), 'commands');
  assert.equal(resolveSessionMode('1', 'AdminSave'), 'admin-save');
  assert.equal(resolveSessionMode('main', 'AdminSave'), 'commands');
});

test('AdminSave is hidden from public session lists but visible to the owner', () => {
  const sessions = [
    { id: 'main', name: 'MainBot', sessionMode: 'commands' },
    { id: 'adminsave', name: 'AdminSave', sessionMode: 'admin-save' },
    { id: '2', name: 'AdminSave', sessionMode: undefined }
  ];
  assert.deepEqual(sessionsVisibleToRole(sessions, 'public').map((session) => session.id), ['main']);
  assert.deepEqual(sessionsVisibleToRole(sessions, 'owner'), sessions);
});

test('Love.js gates message commands and automatic saved-admin protection by session mode', () => {
  const source = fs.readFileSync(path.join(ROOT, 'Love.js'), 'utf8');
  assert.match(source, /if \(!sessionCanProcessMessages\(SESSION_MODE\)\) return;/);
  assert.match(source, /action === 'demote' && sessionCanProtectSavedAdmins\(SESSION_MODE\)/);
});