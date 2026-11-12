"use strict";

/**
 * Canonicalize Bangla Unicode text:
 * Fixes Unicode Composition Exclusion decomposition of য় (\u09DF), ড় (\u09DC), ঢ় (\u09DD)
 * after standard NFC normalization, plus normalizes zero-width noise and duplicate kars.
 */
function toBanglaCanonical(input) {
  if (input == null) return "";
  return String(input)
    .normalize("NFC")
    .replace(/\u09AF\u09BC/g, "\u09DF") // য + ় -> য়
    .replace(/\u09A1\u09BC/g, "\u09DC") // ড + ় -> ড়
    .replace(/\u09A2\u09BC/g, "\u09DD") // ঢ + ় -> ঢ়
    .replace(/[\u200B\uFEFF]/g, "")     // remove zero-width spaces & BOM
    .replace(/\u09C7\u09BE/g, "\u09CB") // ে + া -> ো
    .replace(/\u09C7\u09D7/g, "\u09CC") // ে + ৗ -> ৌ
    .replace(/([\u09BE-\u09CC\u09D7])\1+/g, "$1") // collapse duplicate vowel signs
    .trim();
}

/**
 * Convert broken or legacy Bangla sequences + ASCII/Bangla digits helpers.
 */
const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBanglaDigits(str) {
  return String(str).replace(/[0-9]/g, d => BANGLA_DIGITS[Number(d)]);
}
function toEnglishDigits(str) {
  return String(str).replace(/[০-৯]/g, d => String(BANGLA_DIGITS.indexOf(d)));
}

/**
 * Standard phonetic Bijoy ANSI (SutonnyMJ) -> Canonical Unicode mapping
 * Covers vowels, consonants, kars, folas, digits, punctuation, and key conjuncts.
 */
const BIJOY_MAP = {
  "Av": "আ", "A": "অ", "B": "ই", "C": "ঈ", "D": "উ", "E": "ঊ", "F": "ঋ",
  "G": "এ", "H": "ঐ", "I": "ও", "J": "ঔ",
  "K": "ক", "L": "খ", "M": "গ", "N": "ঘ", "O": "ঙ",
  "P": "চ", "Q": "ছ", "R": "জ", "S": "ঝ", "T": "ঞ",
  "U": "ট", "V": "ঠ", "W": "ড", "X": "ঢ", "Y": "ণ",
  "Z": "ত", "_": "থ", "`": "দ", "a": "ধ", "b": "ন",
  "c": "প", "d": "ফ", "e": "ব", "f": "ভ", "g": "ম",
  "h": "য", "i": "র", "j": "ল", "k": "শ", "l": "ষ",
  "m": "স", "n": "হ", "o": "ড়", "p": "ঢ়", "q": "য়",
  "r": "ৎ", "s": "ং", "t": "ঃ", "u": "ঁ",
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  "v": "া", "w": "ি", "x": "ী", "y": "ু", "z": "ু",
  "~": "ূ", "„": "ৃ", "‡": "ে", "†": "ে", "‰": "ৈ",
  "Š": "ৗ", "Ô": "‘", "Õ": "’", "Ò": "“", "Ó": "”",
  "|": "।", "¥": "৳", "Ö": "্র", "ª": "্র", "¨": "্য",
  "&": "্", "©": "র্"
};

const BIJOY_PRE_KAR = new Set(["ি", "ে", "ৈ"]);
const BANGLA_CONSONANT_RE = /[\u0995-\u09B9\u09DC\u09DD\u09DF]/;

function bijoyToUnicode(ansi) {
  if (!ansi) return "";
  let raw = String(ansi);
  // Multi-char tokens first
  raw = raw
    .replace(/Av/g, "আ")
    .replace(/‡(.?)v/g, "ো$1").replace(/†(.?)v/g, "ো$1")
    .replace(/‡(.?)Š/g, "ৌ$1").replace(/†(.?)Š/g, "ৌ$1");

  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    out += BIJOY_MAP[ch] !== undefined ? BIJOY_MAP[ch] : ch;
  }

  // Reorder pre-base kars (ি, ে, ৈ) placed before a consonant/conjunct cluster in Bijoy visual order
  const chars = Array.from(out);
  for (let i = 0; i < chars.length - 1; i++) {
    if (BIJOY_PRE_KAR.has(chars[i]) && BANGLA_CONSONANT_RE.test(chars[i + 1])) {
      const kar = chars[i];
      let j = i + 1;
      while (j + 2 < chars.length && chars[j + 1] === "\u09CD" && BANGLA_CONSONANT_RE.test(chars[j + 2])) {
        j += 2;
      }
      chars.splice(i, 1);
      chars.splice(j, 0, kar);
      i = j;
    }
  }
  return toBanglaCanonical(chars.join("").replace(/\u09C7([^\u0995-\u09B9\u09CD]*)\u09BE/g, "$1\u09CB"));
}

/**
 * Clean mixed Bangla punctuation, spacing before danda, and check pure Bangla token ratio.
 */
function sanitizeBanglaText(text) {
  return toBanglaCanonical(text)
    .replace(/\s+([।,?!:;])/g, "$1")
    .replace(/([।?!])([^\s"”’)\]])/g, "$1 $2")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isPureBanglaWord(word) {
  return /^[\u0980-\u09FF]+$/.test(toBanglaCanonical(word));
}

function extractConjuncts(text) {
  const canon = toBanglaCanonical(text);
  const matches = canon.match(/[\u0995-\u09B9\u09DC-\u09DF](?:\u09CD[\u0995-\u09B9\u09DC-\u09DF\u09AF\u09AC\u09B0])+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

module.exports = {
  toBanglaCanonical,
  toBanglaDigits,
  toEnglishDigits,
  bijoyToUnicode,
  sanitizeBanglaText,
  isPureBanglaWord,
  extractConjuncts
};
