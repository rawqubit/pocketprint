/* pocketprint — the small, testable half of browser fingerprinting.
 * Pure functions only: hashing, bit counting, and the wording for the verdict.
 * Everything that touches a browser API lives in index.html. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PocketPrint = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* FNV-1a, 32 bit, in hex. Fast enough to run on a canvas dump of 20 KB. */
  function fnv1a(input) {
    var str = String(input);
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }

  /* Rough entropy of one signal: how much a value narrows the population.
   * `buckets` is the number of plausible values for that signal, so
   * log2(buckets) is what a tracker gains by reading it. */
  function bitsFor(buckets) {
    if (!buckets || buckets < 2) return 0;
    return Math.log(buckets) / Math.LN2;
  }

  /* Sum the bits. This is an upper bound on identifiability (signals
   * correlate), which is the honest way to present it. */
  function totalBits(signals) {
    return signals.reduce(function (sum, s) { return sum + bitsFor(s.buckets); }, 0);
  }

  /* "1 in N" for a bit count, clamped so the page never prints nonsense. */
  function oneIn(bits) {
    if (!isFinite(bits) || bits <= 0) return 1;
    var n = Math.pow(2, bits);
    if (n < 2) return 2;
    if (n > 1e12) return Infinity;
    return Math.round(n);
  }

  function formatOneIn(bits) {
    var n = oneIn(bits);
    if (!isFinite(n)) return 'more than a trillion';
    if (n < 10000) return n.toLocaleString('en-US');
    if (n < 1e6) return Math.round(n / 1000) + ' thousand';
    if (n < 1e9) return Math.round(n / 1e6) + ' million';
    return Math.round(n / 1e9) + ' billion';
  }

  /* A stable 4x4 signature for the share card, built from the signal hash. */
  function avatarCells(seed) {
    var cells = [];
    var value = parseInt(fnv1a(seed), 16);
    for (var i = 0; i < 16; i++) {
      value = (value * 1103515245 + 12345) >>> 0;
      cells.push((value >>> 16) % 2 === 0);
    }
    return cells;
  }

  return { fnv1a: fnv1a, bitsFor: bitsFor, totalBits: totalBits, oneIn: oneIn, formatOneIn: formatOneIn, avatarCells: avatarCells };
});
