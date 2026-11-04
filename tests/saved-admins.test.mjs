import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('save.json verwaltet Adminschutz gruppenbezogen über JID und LID', async (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lovebot-saved-admins-'));
  const previousPath = process.env.LOVEBOT_SAVE_FILE;
  process.env.LOVEBOT_SAVE_FILE = path.join(tempDir, 'save.json');
  t.after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (previousPath === undefined) delete process.env.LOVEBOT_SAVE_FILE;
    else process.env.LOVEBOT_SAVE_FILE = previousPath;
  });

  const store = await import('../savedAdmins.js');
  const groupA = '120363123@g.us';
  const groupB = '120363456@g.us';
  const identity = {
    jid: '4915123456789@s.whatsapp.net',
    lid: '269574108926096@lid',
    key: '4915123456789jid269574108926096lid',
    name: 'Mika'
  };

  assert.equal(store.saveAdmin(groupA, identity, 'owner').added, true);
  assert.equal(store.isSavedAdmin(groupA, { jid: identity.jid }), true);
  assert.equal(store.isSavedAdmin(groupA, { lid: identity.lid }), true);
  assert.equal(store.isProtectedAdmin(groupA, { lid: identity.lid }), true);
  assert.equal(store.isProtectedAdmin(groupA, { jid: identity.jid }, true), true);
  assert.equal(store.isProtectedAdmin(groupA, { jid: '4915000000000@s.whatsapp.net' }), false);
  assert.equal(store.isSavedAdmin(groupB, identity), false);
  assert.equal(store.listSavedAdmins(groupA).length, 1);
  assert.equal(store.listSavedAdmins(groupA)[0].name, 'Mika');
  assert.ok(store.removeSavedAdmin(groupA, { lid: identity.lid }));
  assert.equal(store.isSavedAdmin(groupA, identity), false);

  const { resolve } = await import('../commandRegistry.js');
  assert.equal(resolve('save')?.perms, 'owner');
  assert.equal(resolve('unsave')?.perms, 'owner');
  assert.equal(resolve('unsafe')?.name, 'unsave');
  assert.equal(resolve('savelist')?.perms, 'owner');
});