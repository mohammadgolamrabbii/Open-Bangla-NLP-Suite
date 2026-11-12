"use strict";
const assert = require("assert");
const norm = require("./index");

// 1. Precomposition exclusion fix: য + ় = য়
const decomposed = "আমা\u09AF\u09BC \u09A1\u09BC \u09A2\u09BC";
const canon = norm.toBanglaCanonical(decomposed);
assert.strictEqual(canon, "আমা\u09DF \u09DC \u09DD");
assert.strictEqual(canon.includes("\u09BC"), false);

// 2. Digit conversion
assert.strictEqual(norm.toBanglaDigits("2026"), "২০২৬");
assert.strictEqual(norm.toEnglishDigits("২০২৬"), "2026");

// 3. Bijoy conversion basics
assert.strictEqual(norm.bijoyToUnicode("evsjv"), "বাংলা");
assert.strictEqual(norm.bijoyToUnicode("Avwg"), "আমি");

// 4. Sanitizer & Conjunct extractor
assert.strictEqual(norm.sanitizeBanglaText("আমি ভালো আছি ।তুমি কেমন?"), "আমি ভালো আছি। তুমি কেমন?");
assert.deepStrictEqual(norm.extractConjuncts("বাংলাদেশ স্বাধীন রাষ্ট্র"), ["স্ব", "ষ্ট্র"]);

console.log("✅ @open-bangla/normalizer all tests passed!");
