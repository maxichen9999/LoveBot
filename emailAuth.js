import crypto from 'node:crypto';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

export function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return '';
  const [local, domain] = email.split('@');
  if (!local || local.length > 64 || !domain || domain.length > 253) return '';
  if (domain.split('.').some((label) => !label || label.length > 63 || label.startsWith('-') || label.endsWith('-'))) return '';
  return email;
}

export function resetDeliveryFor(account) {
  const email = account?.emailVerifiedAt ? normalizeEmail(account.email) : '';
  return email ? { channel: 'email', email } : { channel: 'whatsapp', email: '' };
}

export class EmailCodeManager {
  constructor({ ttlMs = 10 * 60 * 1000, maxAttempts = 5, secret = crypto.randomBytes(32) } = {}) {
    this.ttlMs = ttlMs;
    this.maxAttempts = maxAttempts;
    this.secret = Buffer.from(secret);
    this.challenges = new Map();
  }

  issue({ purpose, subject, email, now = Date.now() }) {
    this.sweep(now);
    if (this.challenges.size >= 10000) return null;
    const id = crypto.randomBytes(24).toString('hex');
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAt = now + this.ttlMs;
    this.challenges.set(id, {
      purpose: String(purpose), subject: String(subject), email: String(email),
      digest: this.digest(id, purpose, subject, code), attempts: 0, expiresAt
    });
    return { id, code, expiresAt };
  }

  verify({ id, code, purpose, now = Date.now() }) {
    const challenge = this.challenges.get(String(id || ''));
    if (!challenge || challenge.purpose !== String(purpose)) return { ok: false, reason: 'invalid' };
    if (challenge.expiresAt <= now) {
      this.challenges.delete(String(id));
      return { ok: false, reason: 'expired' };
    }
    if (challenge.attempts >= this.maxAttempts) {
      this.challenges.delete(String(id));
      return { ok: false, reason: 'locked' };
    }
    challenge.attempts++;
    const actual = Buffer.from(this.digest(id, purpose, challenge.subject, String(code || '').trim()), 'hex');
    const expected = Buffer.from(challenge.digest, 'hex');
    if (actual.length === expected.length && crypto.timingSafeEqual(actual, expected)) {
      this.challenges.delete(String(id));
      return { ok: true, challenge: { purpose: challenge.purpose, subject: challenge.subject, email: challenge.email } };
    }
    const exhausted = challenge.attempts >= this.maxAttempts;
    if (exhausted) this.challenges.delete(String(id));
    return { ok: false, reason: exhausted ? 'locked' : 'invalid', attemptsLeft: Math.max(0, this.maxAttempts - challenge.attempts) };
  }

  sweep(now = Date.now()) {
    for (const [id, challenge] of this.challenges) {
      if (challenge.expiresAt <= now) this.challenges.delete(id);
    }
  }

  discard(id) {
    return this.challenges.delete(String(id || ''));
  }

  digest(id, purpose, subject, code) {
    return crypto.createHmac('sha256', this.secret)
      .update(`${id}\0${purpose}\0${subject}\0${code}`)
      .digest('hex');
  }
}