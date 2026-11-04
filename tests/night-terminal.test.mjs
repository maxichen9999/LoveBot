import test from 'node:test';
import assert from 'node:assert/strict';
import { formatNightLine } from '../night/terminal.js';

test('formats log tags into a consistent column without terminal colors', () => {
  const line = formatNightLine('security', 'ready', new Date(0), false);

  assert.match(line, /^\d{2}:\d{2}:\d{2} │ security   › ready$/);
  assert.equal(line.includes('\x1b['), false);
});

test('keeps long log tags intact', () => {
  const line = formatNightLine('dashboard', 'online', new Date(0), false);

  assert.match(line, / │ dashboard  › online$/);
});
