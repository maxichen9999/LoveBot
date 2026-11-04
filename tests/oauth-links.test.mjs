import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('OAuth-Verknüpfung bindet Identität an die eingeloggte Account-ID', async (t) => {
  const originalCwd = process.cwd();
  const originalFetch = globalThis.fetch;
  const envNames = ['OAUTH_BASE_URL', 'GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET'];
  const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lovebot-oauth-links-'));
  t.after(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
    globalThis.fetch = originalFetch;
    for (const name of envNames) {
      if (originalEnv[name] === undefined) delete process.env[name];
      else process.env[name] = originalEnv[name];
    }
  });

  process.chdir(tempDir);
  process.env.OAUTH_BASE_URL = 'https://lovebot.example/api/oauth/callback/google';
  process.env.GOOGLE_OAUTH_CLIENT_ID = 'oauth-test-client';
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = 'oauth-test-secret';

  const rbac = await import('../night/rbac.js');
  const oauth = await import('../oauth.js');
  const firstAccount = rbac.createAccount({
    username: 'first-link', number: '', role: 'user', mustChange: false,
    email: 'first@example.test', emailVerifiedAt: new Date().toISOString()
  }).account;
  const secondAccount = rbac.createAccount({
    username: 'second-link', number: '', role: 'user', mustChange: false,
    email: 'second@example.test', emailVerifiedAt: new Date().toISOString()
  }).account;

  globalThis.fetch = async (url) => {
    if (String(url) === 'https://oauth2.googleapis.com/token') {
      return { ok: true, status: 200, json: async () => ({ access_token: 'test-access-token' }) };
    }
    if (String(url) === 'https://openidconnect.googleapis.com/v1/userinfo') {
      return { ok: true, status: 200, json: async () => ({
        sub: 'google-subject-1', email: 'google@example.test', name: 'Google User', email_verified: true
      }) };
    }
    throw new Error('Unexpected OAuth URL: ' + String(url));
  };

  const started = oauth.beginOAuth('google', { linkAccountId: firstAccount.id });
  assert.ok(started?.url);
  const state = new URL(started.url).searchParams.get('state');
  assert.equal(oauth.oauthFlowForState(state), 'link');
  const result = await oauth.finishOAuth('google', { state, code: 'test-code' });
  assert.equal(result.linked, true);
  assert.equal(result.providerId, 'google');
  assert.equal(oauth.listLinkedOAuthProviders(firstAccount.id).find((item) => item.id === 'google').linked, false);
  assert.equal(oauth.consumeOAuthHandoff(result.code, { accountId: secondAccount.id }), null);
  assert.equal(oauth.listLinkedOAuthProviders(firstAccount.id).find((item) => item.id === 'google').linked, false);

  const handoff = oauth.consumeOAuthHandoff(result.code, { accountId: firstAccount.id });
  assert.equal(handoff.linked, true);
  assert.equal(handoff.account.id, firstAccount.id);
  assert.equal(oauth.listLinkedOAuthProviders(firstAccount.id).find((item) => item.id === 'google').linked, true);

  const conflictingStart = oauth.beginOAuth('google', { linkAccountId: secondAccount.id });
  const conflictingState = new URL(conflictingStart.url).searchParams.get('state');
  await assert.rejects(
    oauth.finishOAuth('google', { state: conflictingState, code: 'test-code' }),
    /bereits mit einem anderen LoveBot-Konto verknüpft/
  );
});