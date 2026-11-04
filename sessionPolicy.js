export function resolveSessionMode(sessionId, configuredMode = '') {
  const id = String(sessionId || '').trim().toLowerCase();
  if (id === 'main') return 'commands';

  const requested = String(configuredMode || '').trim().toLowerCase();
  if (requested === 'admin-save' || requested === 'commands') return requested;

  const isAdminSaveName = (value) => /^admin[-_]?save(?:[_-]\d+)?$/.test(value);
  if (isAdminSaveName(requested)) return 'admin-save';
  return isAdminSaveName(id) ? 'admin-save' : 'commands';
}

export function sessionCanProcessMessages(mode) {
  return mode !== 'admin-save';
}

export function sessionCanProtectSavedAdmins(mode) {
  return mode === 'admin-save';
}

export function isAdminSaveSession(session) {
  return resolveSessionMode(session?.id, session?.sessionMode || session?.name) === 'admin-save';
}

export function sessionsVisibleToRole(sessions, role) {
  const all = Array.isArray(sessions) ? sessions : [];
  return role === 'owner' ? [...all] : all.filter((session) => !isAdminSaveSession(session));
}