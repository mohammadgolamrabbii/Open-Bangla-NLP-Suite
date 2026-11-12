"use strict";
const fs = require("fs");
const path = require("path");
const { toBanglaCanonical } = require("../packages/normalizer");
const { BanglaMorphAnalyzer } = require("../packages/stemmer");

const ROOT = path.join(__dirname, "..");
const bench = JSON.parse(fs.readFileSync(path.join(ROOT, "dist", "eval-suite", "bangla_eval_benchmark.json"), "utf8"));
const wordlistPath = path.join(ROOT, "..", "Bangla-Lexicon-Mega-Archive", "dist", "bangla_wordlist_verified.txt");
const lexSet = new Set(fs.readFileSync(wordlistPath, "utf8").split(/\r?\n/).map(toBanglaCanonical).filter(Boolean));
const standaloneAnalyzer = new BanglaMorphAnalyzer();
const lexiconAnalyzer = new BanglaMorphAnalyzer(lexSet);

let orthPass = 0, orthTotal = 0;
let morphStandalonePass = 0, morphLexPass = 0, morphTotal = 0;

for (const t of bench) {
  if (t.category === "orthography_nfc") {
    orthTotal++;
    if (toBanglaCanonical(t.input) === t.expected) orthPass++;
  } else if (t.category === "morphology_lemma") {
    morphTotal++;
    const alts = [t.expected, ...(t.alt_expected || [])];
    const r1 = standaloneAnalyzer.analyze(t.input);
    const r2 = lexiconAnalyzer.analyze(t.input);
    if (alts.includes(r1.lemma) || alts.includes(r1.root)) morphStandalonePass++;
    if (alts.includes(r2.lemma) || alts.includes(r2.root)) morphLexPass++;
  }
}

console.log(`Bangla-Eval-Suite Baseline Self-Check:`);
console.log(`- Orthography NFC (@open-bangla/normalizer): ${orthPass}/${orthTotal} (${((orthPass / orthTotal) * 100).toFixed(1)}%)`);
console.log(`- Morphology Stem/Lemma (@open-bangla/stemmer standalone): ${morphStandalonePass}/${morphTotal} (${((morphStandalonePass / morphTotal) * 100).toFixed(1)}%)`);
console.log(`- Morphology Stem/Lemma (@open-bangla/stemmer + 587k lexicon): ${morphLexPass}/${morphTotal} (${((morphLexPass / morphTotal) * 100).toFixed(1)}%)`);
console.log(`- Total Eval Tasks Available for LLM Evaluation: ${bench.length}`);
