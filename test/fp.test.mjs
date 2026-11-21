import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { fnv1a, bitsFor, totalBits, oneIn, formatOneIn, avatarCells } = require('../src/fp.js');

test('fnv1a is stable and 8 hex characters', () => {
  assert.equal(fnv1a('hello'), '4f9f2cab');
  assert.equal(fnv1a('hello'), fnv1a('hello'));
  assert.notEqual(fnv1a('hello'), fnv1a('hellp'));
  assert.match(fnv1a(''), /^[0-9a-f]{8}$/);
});

test('bitsFor rejects impossible bucket counts', () => {
  assert.equal(bitsFor(0), 0);
  assert.equal(bitsFor(1), 0);
  assert.equal(bitsFor(-4), 0);
  assert.equal(Math.round(bitsFor(2)), 1);
  assert.equal(Math.round(bitsFor(1024)), 10);
});

test('totalBits sums independent signals', () => {
  const bits = totalBits([{ buckets: 2 }, { buckets: 1024 }, { buckets: 1 }]);
  assert.equal(Math.round(bits), 11);
  assert.equal(totalBits([]), 0);
});

test('oneIn clamps the tail instead of overflowing', () => {
  assert.equal(oneIn(0), 1);
  assert.equal(oneIn(1), 2);
  assert.equal(oneIn(10), 1024);
  assert.equal(oneIn(200), Infinity);
});

test('formatOneIn stays readable at every scale', () => {
  assert.equal(formatOneIn(1), '2');
  assert.equal(formatOneIn(10), '1,024');
  assert.equal(formatOneIn(13), '8,192');
  assert.equal(formatOneIn(20), '1 million');
  assert.equal(formatOneIn(60), 'more than a trillion');
});

test('avatarCells is a deterministic 16-cell grid', () => {
  const a = avatarCells('seed-one');
  assert.equal(a.length, 16);
  assert.deepEqual(a, avatarCells('seed-one'));
  assert.notDeepEqual(a, avatarCells('seed-two'));
  assert.ok(a.every((c) => typeof c === 'boolean'));
});
