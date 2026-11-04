import fs from 'node:fs';
import assert from 'node:assert/strict';

const src = fs.readFileSync(new URL('../Love.js', import.meta.url), 'utf8');
assert.match(src, /const\s+SessionManager\s*=\s*SM\s*;/, 'Love.js must expose the SessionManager alias used by QR/session tracking code.');
console.log('sessionmanager alias check passed');
