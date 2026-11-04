import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as rbac from './night/rbac.js';

const IDENTITY_FILE = path.join('Database', 'oauth-identities.json');
const pendingStates = new Map();
const loginHandoffs = new Map();

const DEFINITIONS = {
  google: {
    label: 'Google',
    clientIdEnv: 'GOOGLE_OAUTH_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_OAUTH_CLIENT_SECRET',
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    userinfo: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
    pkce: true
  },
  discord: {
    label: 'Discord',
    clientIdEnv: 'DISCORD_OAUTH_CLIENT_ID',
    clientSecretEnv: 'DISCORD_OAUTH_CLIENT_SECRET',
    authorize: 'https://discord.com/oauth2/authorize',
    token: 'https://discord.com/api/oauth2/token',
    userinfo: 'https://discord.com/api/users/@me',
    scope: 'identify email',
    pkce: false
  },
  github: {
    label: 'GitHub',
    clientIdEnv: 'GITHUB_OAUTH_CLIENT_ID',
    clientSecretEnv: 'GITHUB_OAUTH_CLIENT_SECRET',
    authorize: 'https://github.com/login/oauth/authorize',
    token: 'https://github.com/login/oauth/access_token',
    userinfo: 'https://api.github.com/user',
    emails: 'https://api.github.com/user/emails',
    scope: 'read:user user:email',
    pkce: false
  }
};

function configuredProviders() {
  const baseUrl = String(process.env.OAUTH_BASE_URL || '').trim().replace(/\/$/, '');
  if (!baseUrl || !/^https:\/\//i.test(baseUrl)) return [];
  return Object.entries(DEFINITIONS).flatMap(([id, definition]) => {
    const clientId = String(process.env[definition.clientIdEnv] || '').trim();
    const clientSecret = String(process.env[definition.clientSecretEnv] || '').trim();
    if (!clientId || !clientSecret) return [];
    return [{ id, label: definition.label, clientId, clientSecret, callback: baseUrl, ...definition }];
  });
}

export function listOAuthProviders() {
  const configured = new Set(configuredProviders().map(({ id }) => id));
  return Object.entries(DEFINITIONS).map(([id, definition]) => ({
    id,
    label: definition.label,
    enabled: configured.has(id)
  }));
}

export function listLinkedOAuthProviders(accountId) {
  const store = readIdentityStore();
  return Object.entries(DEFINITIONS).map(([id, definition]) => ({
    id,
    label: definition.label,
    linked: Object.values(store[id] || {}).some((linkedId) => linkedId === accountId)
  }));
}

function randomValue(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function readIdentityStore() {
  try {
    const store = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf8'));
    return store && typeof store === 'object' ? store : {};
  } catch {
    return {};
  }
}

function saveIdentityStore(store) {
  fs.mkdirSync(path.dirname(IDENTITY_FILE), { recursive: true });
  const tempPath = `${IDENTITY_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(store, null, 2), { mode: 0o600 });
  fs.renameSync(tempPath, IDENTITY_FILE);
}

export function beginOAuth(providerId, { allowSignup = false, linkAccountId = '' } = {}) {
  const provider = configuredProviders().find((item) => item.id === providerId);
  if (!provider) return null;

  const state = randomValue();
  const verifier = provider.pkce ? randomValue(48) : '';
  pendingStates.set(state, {
    providerId,
    verifier,
    allowSignup: allowSignup === true,
    linkAccountId: String(linkAccountId || ''),
    expiresAt: Date.now() + 10 * 60_000
  });
  const url = new URL(provider.authorize);
  url.searchParams.set('client_id', provider.clientId);
  url.searchParams.set('redirect_uri', provider.callback);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', provider.scope);
  url.searchParams.set('state', state);
  if (provider.id === 'google') url.searchParams.set('access_type', 'online');
  if (verifier) {
    url.searchParams.set('code_challenge', crypto.createHash('sha256').update(verifier).digest('base64url'));
    url.searchParams.set('code_challenge_method', 'S256');
  }
  return { url: url.toString(), state };
}

export function providerForOAuthState(state) {
  const entry = pendingStates.get(String(state || ''));
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.providerId;
}

export function oauthFlowForState(state) {
  const entry = pendingStates.get(String(state || ''));
  if (!entry || entry.expiresAt < Date.now()) return '';
  return entry.linkAccountId ? 'link' : 'login';
}

async function requestJson(url, options) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(12_000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorCode = typeof data.error === 'string' ? data.error.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 48) : '';
    const detail = errorCode ? ` (${errorCode})` : '';
    throw new Error(`OAuth bei ${new URL(url).hostname}: HTTP ${response.status}${detail}. Client-ID, Secret und Redirect-URI prüfen.`);
  }
  return data;
}

async function exchangeCode(provider, code, stateData) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: provider.callback,
    client_id: provider.clientId,
    client_secret: provider.clientSecret
  });
  if (stateData.verifier) params.set('code_verifier', stateData.verifier);
  return requestJson(provider.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: params
  });
}

async function fetchIdentity(provider, tokens, stateData) {
  if (!tokens.access_token) throw new Error('OAuth-Anbieter hat kein Zugriffstoken zurückgegeben.');
  const headers = { Authorization: `Bearer ${tokens.access_token}`, Accept: 'application/json' };
  if (provider.id === 'github') headers['User-Agent'] = 'LoveBot';
  const profile = await requestJson(provider.userinfo, { headers });
  if (provider.id === 'google') return { id: profile.sub, email: profile.email, name: profile.name, email_verified: profile.email_verified === true };
  if (provider.id === 'discord') return { id: profile.id, email: profile.email, name: profile.global_name || profile.username, email_verified: profile.verified === true };
  if (provider.id === 'github') {
    const emails = await requestJson(provider.emails, { headers });
    const verifiedEmail = Array.isArray(emails) ? emails.find((item) => item.primary === true && item.verified === true)?.email : '';
    return { id: profile.id, email: verifiedEmail, name: profile.name || profile.login, email_verified: !!verifiedEmail };
  }
  throw new Error('Unbekannter OAuth-Anbieter.');
}

export async function finishOAuth(providerId, { state, code, error } = {}) {
  const stateData = pendingStates.get(String(state || ''));
  pendingStates.delete(String(state || ''));
  if (!stateData || stateData.providerId !== providerId || stateData.expiresAt < Date.now()) {
    throw new Error('OAuth-Anmeldung abgelaufen oder ungültig. Bitte erneut versuchen.');
  }
  if (error || !code) throw new Error('Anmeldung beim Anbieter wurde abgebrochen.');
  const provider = configuredProviders().find((item) => item.id === providerId);
  if (!provider) throw new Error('Dieser OAuth-Anbieter ist nicht eingerichtet.');
  const tokens = await exchangeCode(provider, String(code), stateData);
  const identity = await fetchIdentity(provider, tokens, stateData);
  const subject = String(identity.id || '').trim();
  const email = String(identity.email || '').trim().toLowerCase();
  if (!subject || !email || !identity.email_verified) throw new Error('Der Anbieter hat keine bestätigte E-Mail-Adresse geliefert.');

  const store = readIdentityStore();
  const providerIdentities = store[providerId] || {};
  if (stateData.linkAccountId) {
    const account = rbac.getAccount(stateData.linkAccountId);
    const status = account ? (rbac.STATUSES[account.status] || rbac.STATUSES.active) : null;
    if (!account || !status?.loginAllowed || account.role === 'banned') {
      throw new Error('Das zu verknüpfende Konto ist nicht aktiv. Bitte melde dich erneut an.');
    }
    if (account.role === 'owner') throw new Error('Owner-OAuth ist aus Sicherheitsgründen deaktiviert.');
    const existingAccountId = providerIdentities[subject];
    if (existingAccountId && existingAccountId !== account.id) {
      throw new Error('Dieses Anbieter-Konto ist bereits mit einem anderen LoveBot-Konto verknüpft.');
    }
    const existingSubject = Object.entries(providerIdentities).find(([linkedSubject, linkedAccountId]) =>
      linkedAccountId === account.id && linkedSubject !== subject
    );
    if (existingSubject) {
      throw new Error('Für dieses Konto ist bereits ein anderes ' + provider.label + '-Konto verknüpft.');
    }
    const handoff = randomValue(24);
    loginHandoffs.set(handoff, { accountId: account.id, providerId, subject, linked: true, expiresAt: Date.now() + 60_000 });
    return { code: handoff, linked: true, providerId };
  }
  let account = providerIdentities[subject] ? rbacAccount(providerIdentities[subject]) : null;
  let createdAccount = false;
  if (!account) {
    const matches = rbac.listAccounts().filter((item) =>
      String(item.email || '').trim().toLowerCase() === email
    );
    if (matches.length > 1) throw new Error('Mehrere LoveBot-Konten verwenden diese E-Mail. Bitte wende dich an den Support.');
    if (matches.length === 1) {
      account = matches[0];
      if (!account.emailVerifiedAt) {
        rbac.setAccountEmail(account.id, email);
        account = rbac.getAccount(account.id);
      }
    } else if (stateData.allowSignup) {
      const acceptedAt = new Date().toISOString();
      account = rbac.createAccount({
        username: identity.name || email.split('@')[0],
        number: '',
        role: 'user',
        mustChange: false,
        email,
        emailVerifiedAt: acceptedAt,
        privacyAcceptedAt: acceptedAt
      }).account;
      createdAccount = true;
    } else {
      throw new Error('Noch kein Konto mit dieser E-Mail. Aktiviere die Datenschutzzustimmung und versuche es erneut, um ein USER-Konto anzulegen.');
    }
  }
  if (!account || account.role === 'owner' || account.role === 'banned' || account.status !== 'active') {
    throw new Error('Dieses Konto darf sich nicht über OAuth anmelden.');
  }
  if (!providerIdentities[subject]) {
    providerIdentities[subject] = account.id;
    store[providerId] = providerIdentities;
    saveIdentityStore(store);
  }
  const handoff = randomValue(24);
  loginHandoffs.set(handoff, { accountId: account.id, providerId, createdAccount, linked: false, expiresAt: Date.now() + 60_000 });
  return { code: handoff, linked: false, providerId };
}

function rbacAccount(accountId) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join('Database', 'accounts.json'), 'utf8'));
    return data.accounts?.[accountId] || null;
  } catch {
    return null;
  }
}

export function consumeOAuthHandoff(code, { accountId = '' } = {}) {
  const entry = loginHandoffs.get(String(code || ''));
  if (!entry || entry.expiresAt < Date.now()) {
    loginHandoffs.delete(String(code || ''));
    return null;
  }
  if (entry.linked && String(accountId) !== entry.accountId) return null;
  loginHandoffs.delete(String(code || ''));
  const account = rbacAccount(entry.accountId);
  if (!account || account.role === 'owner' || account.role === 'banned' || account.status !== 'active') return null;
  if (entry.linked) {
    const store = readIdentityStore();
    const providerIdentities = store[entry.providerId] || {};
    const existingAccountId = providerIdentities[entry.subject];
    if (existingAccountId && existingAccountId !== account.id) return null;
    const existingSubject = Object.entries(providerIdentities).find(([subject, linkedAccountId]) =>
      linkedAccountId === account.id && subject !== entry.subject
    );
    if (existingSubject) return null;
    providerIdentities[entry.subject] = account.id;
    store[entry.providerId] = providerIdentities;
    saveIdentityStore(store);
  }
  return { account, providerId: entry.providerId, createdAccount: entry.createdAccount === true, linked: entry.linked === true };
}