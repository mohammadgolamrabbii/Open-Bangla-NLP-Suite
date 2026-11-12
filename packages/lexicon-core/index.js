"use strict";

function toBanglaCanonical(input) {
  if (input == null) return "";
  return String(input)
    .normalize("NFC")
    .replace(/\u09AF\u09BC/g, "\u09DF")
    .replace(/\u09A1\u09BC/g, "\u09DC")
    .replace(/\u09A2\u09BC/g, "\u09DD")
    .trim();
}

/**
 * Phonetic skeleton for Bangla confusable letters (শ/ষ/স, ন/ণ, য/জ, ই/ঈ, উ/ঊ, ড়/ঢ/র, ং/ঙ)
 */
function phoneticKey(word) {
  return toBanglaCanonical(word)
    .replace(/[শষস]/g, "স")
    .replace(/[নণ]/g, "ন")
    .replace(/[জয]/g, "জ")
    .replace(/[ইীিী]/g, "ি")
    .replace(/[উূুূ]/g, "ু")
    .replace(/[ড়ঢ়]/g, "ড়")
    .replace(/[ংঙ]/g, "ং")
    .replace(/[ৎত]/g, "ত")
    .replace(/\u0981/g, "");
}

function editDistance(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 3) return 99;
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i++) {
      const tmp = dp[i];
      dp[i] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[i], dp[i - 1]);
      prev = tmp;
    }
  }
  return dp[m];
}

class BanglaLexiconIndex {
  constructor(words = []) {
    this.wordSet = new Set();
    this.phoneticBuckets = new Map();
    if (words.length) this.addWords(words);
  }

  addWords(words) {
    for (const raw of words) {
      const w = toBanglaCanonical(raw);
      if (!w) continue;
      this.wordSet.add(w);
      const pk = phoneticKey(w);
      let list = this.phoneticBuckets.get(pk);
      if (!list) {
        list = [];
        this.phoneticBuckets.set(pk, list);
      }
      if (list.length < 12) list.push(w);
    }
  }

  has(word) {
    return this.wordSet.has(toBanglaCanonical(word));
  }

  suggest(word, limit = 5) {
    const clean = toBanglaCanonical(word);
    if (!clean) return [];
    if (this.wordSet.has(clean)) return [clean];
    const pk = phoneticKey(clean);
    const exactPhonetic = this.phoneticBuckets.get(pk) || [];
    if (exactPhonetic.length >= limit) return exactPhonetic.slice(0, limit);
    const results = new Set(exactPhonetic);
    const first = clean[0];
    for (const cand of this.wordSet) {
      if (cand[0] !== first) continue;
      if (Math.abs(cand.length - clean.length) <= 1 && editDistance(clean, cand) === 1) {
        results.add(cand);
        if (results.size >= limit) break;
      }
    }
    return Array.from(results).slice(0, limit);
  }
}

module.exports = {
  BanglaLexiconIndex,
  toBanglaCanonical,
  phoneticKey,
  editDistance
};
