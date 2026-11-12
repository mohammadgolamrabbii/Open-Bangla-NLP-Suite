"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const stats = JSON.parse(fs.readFileSync(path.join(DIST, "stats.json"), "utf8"));
const morph = JSON.parse(fs.readFileSync(path.join(DIST, "morphology", "bangla_root_families.json"), "utf8"));
const idioms = JSON.parse(fs.readFileSync(path.join(DIST, "idioms-proverbs", "idioms_proverbs.json"), "utf8"));
const homos = JSON.parse(fs.readFileSync(path.join(DIST, "idioms-proverbs", "homophones_oneword.json"), "utf8"));
const etym = JSON.parse(fs.readFileSync(path.join(DIST, "etymology", "bangla_etymology.json"), "utf8"));
const ocr = JSON.parse(fs.readFileSync(path.join(DIST, "ocr", "ocr_corpus.json"), "utf8"));
const bench = JSON.parse(fs.readFileSync(path.join(DIST, "eval-suite", "bangla_eval_benchmark.json"), "utf8"));

assert.ok(morph.length >= 2000, "Morphology preview families >= 2000");
assert.ok(idioms.length >= 5000, "Idioms/proverbs >= 5000");
assert.ok(homos.homophones.length >= 30, "Homophones >= 30");
assert.ok(homos.one_word_substitutions.length >= 20, "One-word substitutions >= 20");
assert.ok(etym.length >= 6000, "Etymology words >= 6000");
assert.ok(etym.some(e => e.hindi_cognate), "Etymology cross-linked with Hindi cognates");
assert.ok(ocr.conjuncts.length >= 100 && ocr.sample_words.length >= 4000, "OCR corpus populated");
assert.strictEqual(bench.length, stats.eval_suite.total_benchmark_tasks, "Benchmark count matches stats");
assert.ok(bench.some(t => t.category === "bilingual_cognates"), "Bilingual cognate benchmark tasks present");

// Ensure every file in dist/ is < 25 MB for GitHub upload safety
function checkSizes(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) checkSizes(p);
    else {
      const mb = fs.statSync(p).size / 1048576;
      assert.ok(mb < 25, `File ${p} exceeds 25 MB (${mb.toFixed(2)} MB)`);
    }
  }
}
checkSizes(DIST);

// Verify no broken NFC decompositions in benchmark expected answers
for (const item of bench) {
  assert.ok(!/[\u09AF\u09A1\u09A2]\u09BC/.test(item.expected), `Uncomposed nukta in ${item.id}: ${item.expected}`);
}

console.log(`✅ Validation Passed! Morph=${stats.morphology.root_families} families, Idioms=${idioms.length}, Etymology=${etym.length}, OCR words=${ocr.sample_words.length}, Eval tasks=${bench.length}`);
