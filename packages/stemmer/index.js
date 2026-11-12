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

// Irregular high-frequency verb stems -> verbal noun lemma (ক্রিয়া-বিশেষ্য / মূল ধাতু)
const IRREGULAR_VERB_LEMMAS = new Map([
  ["গি", "যাওয়া"], ["গে", "যাওয়া"], ["যাই", "যাওয়া"], ["যা", "যাওয়া"], ["যাব", "যাওয়া"], ["যাবে", "যাওয়া"],
  ["এসে", "আসা"], ["আসি", "আসা"], ["আস", "আসা"], ["এল", "আসা"], ["এলেন", "আসা"],
  ["দি", "দেওয়া"], ["দে", "দেওয়া"], ["দেন", "দেওয়া"], ["দিয়ে", "দেওয়া"],
  ["নি", "নেওয়া"], ["নে", "নেওয়া"], ["নেন", "নেওয়া"], ["নিয়ে", "নেওয়া"],
  ["গ", "যাওয়া"], ["দ", "দেওয়া"], ["ন", "নেওয়া"],
  ["হ", "হওয়া"], ["হয়", "হওয়া"], ["হয়ে", "হওয়া"], ["হল", "হওয়া"], ["হলো", "হওয়া"], ["হবে", "হওয়া"],
  ["কর", "করা"], ["করে", "করা"], ["করি", "করা"], ["করব", "করা"], ["করবে", "করা"], ["করান", "করানো"],
  ["পড়", "পড়া"], ["পড়ে", "পড়া"], ["পড়ি", "পড়া"], ["পড়াব", "পড়ানো"], ["পড়া", "পড়া"],
  ["লিখ", "লেখা"], ["লিখে", "লেখা"], ["লেখ", "লেখা"], ["লেখা", "লেখা"],
  ["দেখ", "দেখা"], ["দেখে", "দেখা"], ["দেখি", "দেখা"],
  ["খেল", "খেলা"], ["খেলে", "খেলা"],
  ["বল", "বলা"], ["বলে", "বলা"], ["বলি", "বলা"],
  ["থাক", "থাকা"], ["থাকে", "থাকা"],
  ["খা", "খাওয়া"], ["খেয়ে", "খাওয়া"], ["খাই", "খাওয়া"], ["খাব", "খাওয়া"],
  ["শুয়ে", "শোয়া"], ["শো", "শোয়া"], ["শুন", "শোনা"], ["শুনে", "শোনা"],
  ["বুঝ", "বোঝা"], ["বুঝে", "বোঝা"], ["বোঝ", "বোঝা"],
  ["জান", "জানা"], ["জানে", "জানা"],
  ["পার", "পারা"], ["পারে", "পারা"],
  ["চাই", "চাওয়া"], ["চাও", "চাওয়া"], ["চেয়ে", "চাওয়া"],
  ["পাই", "পাওয়া"], ["পাও", "পাওয়া"], ["পেয়ে", "পাওয়া"]
]);

// Ordered longest-first emphatic particles (বলাবলি/জোর-প্রত্যয়)
const EMPHATIC_SUFFIXES = ["ওই", "ই", "ও"];

// Ordered longest-first nominal / case / classifier suffixes
const NOMINAL_SUFFIXES = [
  // Plural + Case combinations
  { s: "গুলোরই", tag: "PL+GEN+EMP" }, { s: "গুলোরও", tag: "PL+GEN+EMP" },
  { s: "গুলিরই", tag: "PL+GEN+EMP" }, { s: "গুলোতে", tag: "PL+LOC" },
  { s: "গুলিতে", tag: "PL+LOC" }, { s: "গুলোর", tag: "PL+GEN" },
  { s: "গুলির", tag: "PL+GEN" }, { s: "গুলোকে", tag: "PL+ACC" },
  { s: "গুলিকে", tag: "PL+ACC" }, { s: "গুলো", tag: "PL" },
  { s: "গুলি", tag: "PL" }, { s: "গুলা", tag: "PL" },
  { s: "দেরকে", tag: "PL_ANIM+ACC" }, { s: "দের", tag: "PL_ANIM+GEN" },
  { s: "এদেরকে", tag: "PL_ANIM+ACC", restore: "" }, { s: "এদের", tag: "PL_ANIM+GEN", restore: "" },
  { s: "সমূহের", tag: "PL_FORMAL+GEN" }, { s: "সমূহকে", tag: "PL_FORMAL+ACC" },
  { s: "সমূহে", tag: "PL_FORMAL+LOC" }, { s: "সমূহ", tag: "PL_FORMAL" },
  { s: "বৃন্দের", tag: "PL_HUMAN+GEN" }, { s: "বৃন্দ", tag: "PL_HUMAN" },
  { s: "গণের", tag: "PL_HUMAN+GEN" }, { s: "গণ", tag: "PL_HUMAN" },
  // Classifiers + Case
  { s: "খানাকে", tag: "CLF+ACC" }, { s: "খানাতে", tag: "CLF+LOC" },
  { s: "খানায়", tag: "CLF+LOC" }, { s: "খানার", tag: "CLF+GEN" }, { s: "খানা", tag: "CLF" },
  { s: "খানিকে", tag: "CLF+ACC" }, { s: "খানির", tag: "CLF+GEN" }, { s: "খানি", tag: "CLF" },
  { s: "টাকে", tag: "CLF+ACC" }, { s: "টাতে", tag: "CLF+LOC" },
  { s: "টায়", tag: "CLF+LOC" }, { s: "টার", tag: "CLF+GEN" }, { s: "টা", tag: "CLF" },
  { s: "টিকে", tag: "CLF+ACC" }, { s: "টিতে", tag: "CLF+LOC" },
  { s: "টির", tag: "CLF+GEN" }, { s: "টি", tag: "CLF" },
  { s: "টুকুর", tag: "DIM+GEN" }, { s: "টুকু", tag: "DIM" },
  { s: "জনের", tag: "CLF_HUM+GEN" }, { s: "জনকে", tag: "CLF_HUM+ACC" }, { s: "জন", tag: "CLF_HUM" },
  // Case endings (বিভক্তি)
  { s: "য়েদের", tag: "PL+GEN" }, { s: "য়েরা", tag: "PL+NOM" },
  { s: "য়ের", tag: "GEN" }, { s: "ের", tag: "GEN" }, { s: "র", tag: "GEN" },
  { s: "এতে", tag: "LOC" }, { s: "য়েতে", tag: "LOC" }, { s: "তে", tag: "LOC" },
  { s: "কে", tag: "ACC/DAT" }, { s: "রে", tag: "ACC/DAT" },
  { s: "য়ে", tag: "LOC/INS" }, { s: "য়", tag: "LOC" }, { s: "ে", tag: "LOC/INS" },
  { s: "রা", tag: "PL_NOM" }, { s: "েরা", tag: "PL_NOM" }
];

// Ordered longest-first verbal endings (ক্রিয়া বিভক্তি)
const VERBAL_SUFFIXES = [
  // Sadhu progressive/perfective
  { s: "ইতেছিলেন", tag: "PROG_PAST_HON" }, { s: "ইতেছিলাম", tag: "PROG_PAST_1" },
  { s: "ইতেছিলে", tag: "PROG_PAST_2" }, { s: "ইতেছিলি", tag: "PROG_PAST_2_INF" },
  { s: "ইতেছিল", tag: "PROG_PAST_3" }, { s: "ইতেছেন", tag: "PROG_PRES_HON" },
  { s: "ইতেছো", tag: "PROG_PRES_2" }, { s: "ইতেছি", tag: "PROG_PRES_1" },
  { s: "ইতেছে", tag: "PROG_PRES_3" },
  { s: "ইয়াছিলেন", tag: "PERF_PAST_HON" }, { s: "ইয়াছিলাম", tag: "PERF_PAST_1" },
  { s: "ইয়াছিল", tag: "PERF_PAST_3" }, { s: "ইয়াছেন", tag: "PERF_PRES_HON" },
  { s: "ইয়াছি", tag: "PERF_PRES_1" }, { s: "ইয়াছে", tag: "PERF_PRES_3" },
  // Cholito perfective/causative-perfective
  { s: "িয়েছিলেন", tag: "CAUS_PERF_PAST_HON" }, { s: "িয়েছিলাম", tag: "CAUS_PERF_PAST_1" },
  { s: "িয়েছিলে", tag: "CAUS_PERF_PAST_2" }, { s: "িয়েছিল", tag: "CAUS_PERF_PAST_3" },
  { s: "িয়েছেন", tag: "CAUS_PERF_PRES_HON" }, { s: "িয়েছো", tag: "CAUS_PERF_PRES_2" },
  { s: "িয়েছি", tag: "CAUS_PERF_PRES_1" }, { s: "িয়েছে", tag: "CAUS_PERF_PRES_3" },
  { s: "য়েছিলেন", tag: "PERF_PAST_HON" }, { s: "য়েছিলাম", tag: "PERF_PAST_1" },
  { s: "য়েছিলে", tag: "PERF_PAST_2" }, { s: "য়েছিলি", tag: "PERF_PAST_2_INF" },
  { s: "য়েছিল", tag: "PERF_PAST_3" }, { s: "য়েছেন", tag: "PERF_PRES_HON" },
  { s: "য়েছো", tag: "PERF_PRES_2" }, { s: "য়েছি", tag: "PERF_PRES_1" },
  { s: "য়েছে", tag: "PERF_PRES_3" },
  { s: "েছিলেন", tag: "PERF_PAST_HON" }, { s: "েছিলাম", tag: "PERF_PAST_1" },
  { s: "েছিলে", tag: "PERF_PAST_2" }, { s: "েছিল", tag: "PERF_PAST_3" },
  { s: "েছেন", tag: "PERF_PRES_HON" }, { s: "েছো", tag: "PERF_PRES_2" },
  { s: "েছি", tag: "PERF_PRES_1" }, { s: "েছে", tag: "PERF_PRES_3" },
  // Progressive / Simple Past / Habitual / Future
  { s: "ছিলেন", tag: "PROG_PAST_HON" }, { s: "ছিলাম", tag: "PROG_PAST_1" },
  { s: "ছিলে", tag: "PROG_PAST_2" }, { s: "ছিলি", tag: "PROG_PAST_2_INF" },
  { s: "ছিলো", tag: "PROG_PAST_3" }, { s: "ছিল", tag: "PROG_PAST_3" },
  { s: "ছেন", tag: "PROG_PRES_HON" }, { s: "ছো", tag: "PROG_PRES_2" },
  { s: "ছি", tag: "PROG_PRES_1" }, { s: "ছিস", tag: "PROG_PRES_2_INF" },
  { s: "ছে", tag: "PROG_PRES_3" },
  { s: "আবেন", tag: "CAUS_FUT_HON" }, { s: "াবেন", tag: "CAUS_FUT_HON" },
  { s: "আবে", tag: "CAUS_FUT" }, { s: "াবে", tag: "CAUS_FUT" },
  { s: "াবো", tag: "CAUS_FUT_1" }, { s: "াব", tag: "CAUS_FUT_1" },
  { s: "বেন", tag: "FUT_HON" }, { s: "বি", tag: "FUT_2_INF" },
  { s: "বে", tag: "FUT_2/3" }, { s: "বো", tag: "FUT_1" },
  { s: "তেন", tag: "HAB_PAST_HON" }, { s: "তাম", tag: "HAB_PAST_1" },
  { s: "তিস", tag: "HAB_PAST_2_INF" }, { s: "তে", tag: "INF/HAB_PAST" },
  { s: "লেন", tag: "PAST_HON" }, { s: "লাম", tag: "PAST_1" },
  { s: "লি", tag: "PAST_2_INF" }, { s: "লো", tag: "PAST_3" },
  { s: "আনোর", tag: "CAUS_VN+GEN" }, { s: "ানো", tag: "CAUS_VN" },
  { s: "িয়ে", tag: "CAUS_PART" }, { s: "য়ে", tag: "CONJ_PART" }
];

// Derivational prefixes & suffixes (উপসর্গ ও প্রত্যয়)
const DERIVATIONAL_PREFIXES = ["প্রতি", "পরি", "পরা", "অতি", "অধি", "অনু", "অনা", "উপ", "নির্", "দুর্", "প্র", "বি", "সু", "কু", "অ", "স"];
const DERIVATIONAL_SUFFIXES = [
  { s: "শীলতা", tag: "DRV_N" }, { s: "পনা", tag: "DRV_N" }, { s: "গিরি", tag: "DRV_N" },
  { s: "ত্ব", tag: "DRV_N" }, { s: "তা", tag: "DRV_N" }, { s: "হীন", tag: "DRV_ADJ" },
  { s: "ময়", tag: "DRV_ADJ" }, { s: "যুক্ত", tag: "DRV_ADJ" }, { s: "শীল", tag: "DRV_ADJ" },
  { s: "বান", tag: "DRV_ADJ" }, { s: "মান", tag: "DRV_ADJ" }, { s: "ীয়", tag: "DRV_ADJ" },
  { s: "ইক", tag: "DRV_ADJ" }, { s: "আলি", tag: "DRV_N" }
];

function stripKarPrefix(suffix, stem) {
  // Handle leading matra when stripping e.g. েছে -> ধাতু endings
  return stem;
}

function minBanglaSyllableCheck(stem) {
  const chars = Array.from(stem);
  if (chars.length === 0) return false;
  // Stem cannot begin with a dependent matra/hasant or end with a dangling hasant (\u09CD)
  if (/^[\u09BE-\u09CD\u0981-\u0983]/.test(chars[0])) return false;
  if (chars[chars.length - 1] === "\u09CD") return false;
  if (chars.length === 1) return IRREGULAR_VERB_LEMMAS.has(stem);
  return true;
}

class BanglaMorphAnalyzer {
  constructor(lexiconSet = null) {
    this.lexiconSet = lexiconSet instanceof Set ? lexiconSet : null;
  }

  hasWord(w) {
    return this.lexiconSet ? this.lexiconSet.has(w) : false;
  }

  /**
   * Generate candidate stems by stripping a suffix cleanly (handling kar equivalences like ি -> ী or +া)
   */
  applySuffixStrip(word, suffix) {
    if (!word.endsWith(suffix) || word.length <= suffix.length) return null;
    // Handle leading vowel kar inside suffix matching word's attached kar:
    // Notice in Unicode: "করেছে" ends with "ে" (\u09C7) + "ছে" -> suffix "েছে" already ends with \u09C7\u099B\u09C7!
    const rawStem = word.slice(0, word.length - suffix.length);
    if (!minBanglaSyllableCheck(rawStem)) return null;
    return rawStem;
  }

  /**
   * Analyze a single canonical Bangla word into { word, root, lemma, posGuess, prefixes, suffixes, lexicalMatch }
   */
  analyze(inputWord) {
    const word = toBanglaCanonical(inputWord);
    if (!word || !/^[\u0980-\u09FF]+$/.test(word)) {
      return { word, root: word, lemma: word, prefixes: [], suffixes: [], lexicalMatch: false };
    }

    const suffixes = [];
    const prefixes = [];
    let cur = word;

    // Step 1: Strip outer emphatic particle if still valid
    for (const p of EMPHATIC_SUFFIXES) {
      if (cur.endsWith(p) && cur.length > p.length + 2) {
        const cand = cur.slice(0, cur.length - p.length);
        // Only strip 'ই'/'ও' if either remainder is in lexicon or precedes another recognizable nominal/verbal suffix
        const endsWithInflection = NOMINAL_SUFFIXES.some(x => cand.endsWith(x.s)) || VERBAL_SUFFIXES.some(x => cand.endsWith(x.s));
        if ((this.lexiconSet && this.lexiconSet.has(cand)) || endsWithInflection) {
          suffixes.unshift({ suffix: p, tag: "EMP" });
          cur = cand;
          break;
        }
      }
    }

    // Step 2: Check verbal conjugations (prioritize longest match)
    let matchedVerb = false;
    for (const rule of VERBAL_SUFFIXES) {
      // Also support suffixes whose leading 'আ' represents 'া' (\u09BE) or 'ই' represents 'ি' (\u09BF) or 'ে' (\u09C7)
      const variants = [rule.s];
      if (rule.s.startsWith("আ")) variants.push("\u09BE" + rule.s.slice(1));
      if (rule.s.startsWith("ই")) variants.push("\u09BF" + rule.s.slice(1));

      for (const vs of variants) {
        const stem = this.applySuffixStrip(cur, vs);
        if (!stem) continue;
        // Validate against irregular map OR lexicon OR reasonable verb stem (>=2 chars)
        const irr = IRREGULAR_VERB_LEMMAS.get(stem);
        const verbalNounA = stem + "া";
        const verbalNounAno = stem + "ানো";
        const verbalNounOa = stem + "ওয়া";
        const lexHit = this.hasWord(stem) || this.hasWord(verbalNounA) || this.hasWord(verbalNounAno) || this.hasWord(verbalNounOa);
        if (irr || lexHit || (!this.lexiconSet && Array.from(stem).length >= 2) || vs.length >= 3) {
          suffixes.unshift({ suffix: vs, tag: rule.tag });
          cur = stem;
          matchedVerb = true;
          break;
        }
      }
      if (matchedVerb) break;
    }

    // Step 3: Strip layered nominal case / classifier / plural suffixes (up to 2 passes)
    if (!matchedVerb) {
      for (let pass = 0; pass < 2; pass++) {
        let strippedInPass = false;
        for (const rule of NOMINAL_SUFFIXES) {
          const stem = this.applySuffixStrip(cur, rule.s);
          if (!stem) continue;
          // If rule ends in single short kar like 'ে'/'র'/'য়', validate carefully when lexicon is present
          const isShortAmbiguous = rule.s.length === 1;
          if (this.lexiconSet) {
            if (this.lexiconSet.has(stem)) {
              suffixes.unshift({ suffix: rule.s, tag: rule.tag });
              cur = stem;
              strippedInPass = true;
              break;
            }
            // Also check trailing 'ে' -> might have eaten final 'া' or 'য়'? Actually 'কবিতার' - 'র' = 'কবিতা' (in lexicon!).
            // What if 'গাছটি' - 'টি' = 'গাছ' (in lexicon!). What if short rule without exact hit? Try only if length >= 3 and pass 0 had longer suffix or not shortAmbiguous
            if (!isShortAmbiguous && Array.from(stem).length >= 2) {
              // Accept multi-char classifier/plural like গুলো, দের, সমূহ even if root is compound
              suffixes.unshift({ suffix: rule.s, tag: rule.tag });
              cur = stem;
              strippedInPass = true;
              break;
            }
          } else if (!isShortAmbiguous || Array.from(stem).length >= 3) {
            suffixes.unshift({ suffix: rule.s, tag: rule.tag });
            cur = stem;
            strippedInPass = true;
            break;
          }
        }
        if (!strippedInPass) break;
      }
    }

    // Step 4: Check derivational suffixes (if stem + stripped becomes cleaner)
    let derivRoot = cur;
    for (const rule of DERIVATIONAL_SUFFIXES) {
      const stem = this.applySuffixStrip(derivRoot, rule.s);
      if (stem && (!this.lexiconSet || this.lexiconSet.has(stem))) {
        suffixes.unshift({ suffix: rule.s, tag: rule.tag });
        derivRoot = stem;
        break;
      }
    }

    // Step 5: Check prefix only when remainder is verified in lexicon
    let root = derivRoot;
    for (const pre of DERIVATIONAL_PREFIXES) {
      if (root.startsWith(pre) && Array.from(root).length > Array.from(pre).length + 1) {
        const rem = root.slice(pre.length);
        if (this.lexiconSet && this.lexiconSet.has(rem)) {
          prefixes.push(pre);
          root = rem;
          break;
        }
      }
    }

    // Compute clean Lemma
    let lemma = root;
    if (IRREGULAR_VERB_LEMMAS.has(root)) {
      lemma = IRREGULAR_VERB_LEMMAS.get(root);
    } else if (matchedVerb) {
      if (this.hasWord(root + "া")) lemma = root + "া";
      else if (this.hasWord(root + "ানো")) lemma = root + "ানো";
      else if (this.hasWord(root + "ওয়া")) lemma = root + "ওয়া";
    }

    return {
      word,
      root,
      lemma,
      posGuess: matchedVerb ? "verb" : (suffixes.some(x => x.tag.includes("PL") || x.tag.includes("GEN") || x.tag.includes("CLF")) ? "noun/pron" : "other"),
      prefixes,
      suffixes,
      lexicalMatch: this.hasWord(root) || this.hasWord(lemma) || this.hasWord(word)
    };
  }

  stem(word) {
    return this.analyze(word).root;
  }

  lemmatize(word) {
    return this.analyze(word).lemma;
  }
}

module.exports = {
  BanglaMorphAnalyzer,
  toBanglaCanonical,
  IRREGULAR_VERB_LEMMAS,
  NOMINAL_SUFFIXES,
  VERBAL_SUFFIXES,
  DERIVATIONAL_PREFIXES,
  DERIVATIONAL_SUFFIXES
};
