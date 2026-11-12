"use strict";
const assert = require("assert");
const { BanglaLexiconIndex, phoneticKey } = require("./index");

const idx = new BanglaLexiconIndex(["সকাল", "বাংলা", "বাংলাদেশ", "আশীর্বাদ", "ভাষা", "মানুষ"]);
assert.strictEqual(idx.has("বাংলাদেশ"), true);
assert.strictEqual(phoneticKey("শাল"), phoneticKey("সাল"));
assert.ok(idx.suggest("আসির্বাদ").includes("আশীর্বাদ"));
assert.ok(idx.suggest("বাংল").includes("বাংলা"));
console.log("✅ @open-bangla/lexicon-core all unit tests passed!");
