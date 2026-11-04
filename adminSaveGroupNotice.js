import fs from 'node:fs';
import path from 'node:path';

export async function sendGroupNoticeOnce(groupJid, send, directory = path.join('Database', 'adminsave-onboarding')) {
  const groupId = String(groupJid || '').trim().toLowerCase().replace(/@g\.us$/, '').split(':')[0];
  if (!/^\d+$/.test(groupId) || typeof send !== 'function') return false;

  fs.mkdirSync(directory, { recursive: true });
  const sentPath = path.join(directory, `${groupId}.sent.json`);
  const lockPath = path.join(directory, `${groupId}.lock`);
  let lockFd;

  try {
    lockFd = fs.openSync(lockPath, 'wx');
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    try {
      const lockAge = Date.now() - fs.statSync(lockPath).mtimeMs;
      if (lockAge < 5 * 60 * 1000) return false;
      fs.unlinkSync(lockPath);
      lockFd = fs.openSync(lockPath, 'wx');
    } catch (lockError) {
      if (lockError?.code === 'EEXIST' || lockError?.code === 'ENOENT') return false;
      throw lockError;
    }
  }

  try {
    if (fs.existsSync(sentPath)) return false;
    await send();
    const tempPath = `${sentPath}.${process.pid}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify({ groupJid, sentAt: new Date().toISOString() }), 'utf8');
    fs.renameSync(tempPath, sentPath);
    return true;
  } finally {
    fs.closeSync(lockFd);
    try {
      fs.unlinkSync(lockPath);
    } catch (lockError) {
      if (lockError?.code !== 'ENOENT') throw lockError;
    }
  }
}
