"use strict";
const assert = require("assert");
const { BanglaMorphAnalyzer } = require("./index");

// Seed sample lexicon words to verify lexicon-grounded mode
const sampleLexicon = new Set([
  "বই", "মানুষ", "কবিতা", "গাছ", "বাংলাদেশ", "বাড়ি", "সময়",
  "করা", "পড়া", "লেখা", "যাওয়া", "আসা", "হওয়া", "মানব", "সুন্দর", "জ্ঞান"
]);

const analyzer = new BanglaMorphAnalyzer(sampleLexicon);

assert.strictEqual(analyzer.stem("বইগুলোরই"), "বই");
assert.strictEqual(analyzer.stem("মানুষদেরকে"), "মানুষ");
assert.strictEqual(analyzer.stem("কবিতার"), "কবিতা");
assert.strictEqual(analyzer.stem("গাছটিতে"), "গাছ");
assert.strictEqual(analyzer.lemmatize("করেছিলেন"), "করা");
assert.strictEqual(analyzer.lemmatize("পড়াবেন"), "পড়া");
assert.strictEqual(analyzer.lemmatize("গিয়েছিল"), "যাওয়া");
assert.strictEqual(analyzer.analyze("সুন্দর").root, "সুন্দর");
assert.strictEqual(analyzer.analyze("অজ্ঞান").root, "জ্ঞান");

console.log("✅ @open-bangla/stemmer all unit tests passed!");
