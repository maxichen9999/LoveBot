import test from 'node:test';
import assert from 'node:assert/strict';
import { qrToPng } from '../qrpng.js';

test('QR renderer returns a valid PNG with square dimensions and a quiet zone', () => {
  const png = qrToPng('2@ABCD1234,EFGH5678,0123456789abcdef0123456789abcdef', { scale: 8 });

  assert.ok(Buffer.isBuffer(png));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert.equal(width, height);
  assert.ok(width >= (21 + 8) * 8);
});
