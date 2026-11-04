import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = () => process.env.LOVEBOT_SAVE_FILE || path.join('Database', 'save.json');

function groupKey(groupJid) {
  return String(groupJid || '').trim().toLowerCase().replace(/@g\.us$/, '').split(':')[0];
}

function identityValues(identity) {
  const values = typeof identity === 'string'
    ? [identity]
    : [identity?.jid, identity?.lid, identity?.key, identity?.phoneNumber, ...(Array.isArray(identity?.ids) ? identity.ids : [])];
  return [...new Set(values.map((value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (!raw.includes('@')) return raw.replace(/[^a-z0-9_-]/g, '');
    const [user, server] = raw.split('@');
    return `${user.split(':')[0]}@${server}`;
  }).filter(Boolean))];
}

function readStore() {
  try {
    const value = JSON.parse(fs.readFileSync(STORE_PATH(), 'utf8'));
    if (value && typeof value === 'object' && value.groups && typeof value.groups === 'object') return value;
  } catch (error) {}
  return { version: 1, groups: {} };
}

function writeStore(store) {
  const file = STORE_PATH();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(temp, file);
}

function matchingEntry(entries, values) {
  const wanted = new Set(values);
  return Object.entries(entries || {}).find(([, entry]) =>
    (entry.ids || []).some((value) => wanted.has(value))
  ) || null;
}

export function getSavedAdmin(groupJid, identity) {
  const gid = groupKey(groupJid);
  const values = identityValues(identity);
  if (!gid || !values.length) return null;
  const found = matchingEntry(readStore().groups[gid]?.admins, values);
  return found ? { id: found[0], ...found[1] } : null;
}

export function isSavedAdmin(groupJid, identity) {
  return !!getSavedAdmin(groupJid, identity);
}

export function isProtectedAdmin(groupJid, identity, ownerMatch = false) {
  return ownerMatch === true || isSavedAdmin(groupJid, identity);
}

export function listSavedAdmins(groupJid) {
  const gid = groupKey(groupJid);
  if (!gid) return [];
  return Object.entries(readStore().groups[gid]?.admins || {})
    .map(([id, entry]) => ({ id, ...entry, ids: [...(entry.ids || [])] }))
    .sort((a, b) => String(a.savedAt || '').localeCompare(String(b.savedAt || '')));
}

export function saveAdmin(groupJid, identity, savedBy = 'owner') {
  const gid = groupKey(groupJid);
  const ids = identityValues(identity);
  if (!gid || !ids.length) return { added: false, error: 'invalid_identity' };
  const store = readStore();
  const group = store.groups[gid] || { admins: {} };
  group.admins = group.admins || {};
  const existing = matchingEntry(group.admins, ids);
  const id = existing ? existing[0] : ids[0];
  const previous = existing ? existing[1] : {};
  group.admins[id] = {
    ids: [...new Set([...(previous.ids || []), ...ids])],
    name: String(identity?.name || previous.name || '').trim().slice(0, 80),
    savedBy: String(savedBy || 'owner').trim().slice(0, 80),
    savedAt: previous.savedAt || new Date().toISOString()
  };
  store.version = 1;
  store.groups[gid] = group;
  writeStore(store);
  return { added: !existing, entry: { id, ...group.admins[id] } };
}

export function removeSavedAdmin(groupJid, identity) {
  const gid = groupKey(groupJid);
  const values = identityValues(identity);
  if (!gid || !values.length) return null;
  const store = readStore();
  const group = store.groups[gid];
  const found = matchingEntry(group?.admins, values);
  if (!found) return null;
  delete group.admins[found[0]];
  if (!Object.keys(group.admins).length) delete store.groups[gid];
  writeStore(store);
  return { id: found[0], ...found[1] };
}