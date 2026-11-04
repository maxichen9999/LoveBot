import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('only the configured main owner retains the owner role', async (t) => {
  const originalCwd = process.cwd();
  const originalOwnerNumber = process.env.OWNER_NUMBER;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lovebot-owner-ranks-'));
  t.after(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (originalOwnerNumber === undefined) delete process.env.OWNER_NUMBER;
    else process.env.OWNER_NUMBER = originalOwnerNumber;
  });

  process.chdir(tempDir);
  process.env.OWNER_NUMBER = '4915155894714';
  fs.mkdirSync('Database', { recursive: true });
  fs.writeFileSync(path.join('Database', 'accounts.json'), JSON.stringify({
    accounts: {
      main: { id: 'main', number: '4915155894714', role: 'admin' },
      formerOwner: { id: 'formerOwner', number: '4917625006811', role: 'owner' },
      formerDeputy: { id: 'formerDeputy', number: '4917000000001', role: 'deputy' }
    },
    history: []
  }));

  const rbac = await import(new URL('../night/rbac.js?owner-rank-test', import.meta.url));
  const accounts = rbac.listAccounts();
  assert.equal(rbac.ROLES.deputy, undefined);
  assert.equal(accounts.find((account) => account.id === 'main').role, 'owner');
  assert.equal(accounts.find((account) => account.id === 'formerOwner').role, 'admin');
  assert.equal(accounts.find((account) => account.id === 'formerDeputy').role, 'admin');
  const persisted = JSON.parse(fs.readFileSync(path.join('Database', 'accounts.json'), 'utf8')).accounts;
  assert.equal(persisted.main.role, 'owner');
  assert.equal(persisted.formerOwner.role, 'admin');
  assert.equal(persisted.formerDeputy.role, 'admin');
  assert.equal(rbac.canAssignRole('owner', 'deputy'), false);
  assert.equal(rbac.setRole('formerOwner', 'owner', 'test'), null);
  assert.equal(rbac.syncRoleFromBot('4917000000002', 'deputy', 'test'), null);
  assert.equal(rbac.createAccount({
    username: 'not-owner', number: '4917000000003', role: 'owner'
  }).account.role, 'user');
});
