import test from 'node:test';
import assert from 'node:assert/strict';
import { isIpBlockExempt, normalizeIpAddress } from '../ipBlockPolicy.js';

test('configured IP is exempt from IP blocks in common address formats', () => {
  assert.equal(isIpBlockExempt('87.106.245.164'), true);
  assert.equal(isIpBlockExempt('::ffff:87.106.245.164'), true);
  assert.equal(isIpBlockExempt(' 87.106.245.164 '), true);
});

test('unrelated IP addresses are not exempt', () => {
  assert.equal(isIpBlockExempt('87.106.245.165'), false);
  assert.equal(isIpBlockExempt(''), false);
});

test('IP normalization handles IPv4-mapped addresses', () => {
  assert.equal(normalizeIpAddress('::ffff:87.106.245.164'), '87.106.245.164');
});
