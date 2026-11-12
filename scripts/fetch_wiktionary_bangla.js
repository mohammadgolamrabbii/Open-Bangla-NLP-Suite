const fs = require("fs");
const path = require("path");
const https = require("https");

const OUT_DIR = path.join(__dirname, "..", "raw_wiktionary");
fs.mkdirSync(OUT_DIR, { recursive: true });

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { "User-Agent": "Open-Bangla-NLP-Suite/1.0 (https://github.com/mohammadgolamrabbii)" }
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${e.message}`)); }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("Timeout")));
  });
}

function toBanglaCanonical(str) {
  if (!str) return "";
  return String(str)
    .normalize("NFC")
    .replace(/\u09AF\u09BC/g, "\u09DF") // য়
    .replace(/\u09A1\u09BC/g, "\u09DC") // ড়
    .replace(/\u09A2\u09BC/g, "\u09DD") // ঢ়
    .trim();
}

const BANGLA_RE = /^[\u0980-\u09FF][\u0980-\u09FF\s\-\u200C]*$/;

async function fetchCategoryMembers(host, category, maxPages = 15) {
  const results = [];
  let cmcontinue = null;
  for (let i = 0; i < maxPages; i++) {
    let url = `https://${host}/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmtype=page|subcat&cmlimit=500&format=json`;
    if (cmcontinue) url += `&cmcontinue=${encodeURIComponent(cmcontinue)}`;
    const json = await fetchJson(url);
    const members = (json.query && json.query.categorymembers) || [];
    for (const m of members) results.push(m);
    if (json.continue && json.continue.cmcontinue) {
      cmcontinue = json.continue.cmcontinue;
    } else {
      break;
    }
  }
  return results;
}

async function fetchExtracts(host, titles) {
  const out = {};
  for (let i = 0; i < titles.length; i += 20) {
    const chunk = titles.slice(i, i + 20);
    const url = `https://${host}/w/api.php?action=query&titles=${encodeURIComponent(chunk.join("|"))}&prop=extracts&explaintext=1&exsectionformat=plain&format=json`;
    try {
      const json = await fetchJson(url);
      if (json.query && json.query.pages) {
        for (const p of Object.values(json.query.pages)) {
          if (p.title && p.extract) out[p.title] = p.extract;
        }
      }
    } catch (e) {
      console.error("Extract batch error:", e.message);
    }
  }
  return out;
}

(async () => {
  const etymologySpecs = [
    { origin: "Sanskrit (তৎসম / সংস্কৃত উদ্ভূত)", code: "sanskrit", host: "en.wiktionary.org", cats: ["Category:Bengali_learned_borrowings_from_Sanskrit", "Category:Bengali_terms_derived_from_Sanskrit"] },
    { origin: "Prakrit / Tadbhava (প্রাকৃত / তদ্ভব)", code: "prakrit", host: "en.wiktionary.org", cats: ["Category:Bengali_terms_derived_from_Prakrit", "Category:Bengali_terms_inherited_from_Prakrit"] },
    { origin: "Arabic (আরবি)", code: "arabic", host: "en.wiktionary.org", cats: ["Category:Bengali_terms_borrowed_from_Arabic", "Category:Bengali_terms_derived_from_Arabic"] },
    { origin: "Persian (ফারসি)", code: "persian", host: "en.wiktionary.org", cats: ["Category:Bengali_terms_borrowed_from_Classical_Persian", "Category:Bengali_terms_derived_from_Persian"] },
    { origin: "English (ইংরেজি)", code: "english", host: "en.wiktionary.org", cats: ["Category:Bengali_terms_borrowed_from_English", "Category:Bengali_terms_derived_from_English"] },
    { origin: "Portuguese (পর্তুগিজ)", code: "portuguese", host: "en.wiktionary.org", cats: ["Category:Bengali_terms_borrowed_from_Portuguese", "Category:Bengali_terms_derived_from_Portuguese"] },
    { origin: "Hindi / Urdu (হিন্দি / উর্দু)", code: "hindi_urdu", host: "en.wiktionary.org", cats: ["Category:Bengali_terms_derived_from_Hindi", "Category:Bengali_terms_derived_from_Urdu"] }
  ];

  const etymologyWords = {};
  for (const spec of etymologySpecs) {
    const wordSet = new Set();
    for (const cat of spec.cats) {
      const members = await fetchCategoryMembers(spec.host, cat, 10);
      for (const m of members) {
        if (m.ns === 0) {
          const clean = toBanglaCanonical(m.title);
          if (BANGLA_RE.test(clean) && !clean.startsWith("-") && !clean.endsWith("-")) {
            wordSet.add(clean);
          }
        } else if (m.ns === 14 && m.title.includes("Persian")) {
          const subMembers = await fetchCategoryMembers(spec.host, m.title, 4);
          for (const sm of subMembers) {
            if (sm.ns === 0) {
              const clean = toBanglaCanonical(sm.title);
              if (BANGLA_RE.test(clean)) wordSet.add(clean);
            }
          }
        }
      }
    }
    etymologyWords[spec.code] = { origin: spec.origin, count: wordSet.size, words: Array.from(wordSet).sort() };
    console.log(`[Etymology] ${spec.code}: ${wordSet.size} Bangla words fetched`);
  }
  fs.writeFileSync(path.join(OUT_DIR, "wiktionary_etymology.json"), JSON.stringify(etymologyWords, null, 2));

  // Fetch Idioms & Proverbs from en.wiktionary + bn.wiktionary
  const enIdioms = await fetchCategoryMembers("en.wiktionary.org", "Category:Bengali_idioms", 5);
  const enProverbs = await fetchCategoryMembers("en.wiktionary.org", "Category:Bengali_proverbs", 5);
  const enPhrases = await fetchCategoryMembers("en.wiktionary.org", "Category:Bengali_phrases", 5);
  const bnIdioms = await fetchCategoryMembers("bn.wiktionary.org", "বিষয়শ্রেণী:বাংলা_বাগধারা", 5);
  const bnProverbs = await fetchCategoryMembers("bn.wiktionary.org", "বিষয়শ্রেণী:বাংলা_প্রবাদ", 5);

  const enTitles = [...new Set([...enIdioms, ...enProverbs, ...enPhrases].filter(x => x.ns === 0).map(x => x.title))];
  const bnTitles = [...new Set([...bnIdioms, ...bnProverbs].filter(x => x.ns === 0).map(x => x.title))];
  console.log(`Fetching extracts: ${enTitles.length} en.wiktionary + ${bnTitles.length} bn.wiktionary titles`);

  const enExtracts = await fetchExtracts("en.wiktionary.org", enTitles);
  const bnExtracts = await fetchExtracts("bn.wiktionary.org", bnTitles);

  fs.writeFileSync(path.join(OUT_DIR, "wiktionary_idioms_raw.json"), JSON.stringify({
    enIdioms: enIdioms.filter(x => x.ns === 0).map(x => x.title),
    enProverbs: enProverbs.filter(x => x.ns === 0).map(x => x.title),
    enPhrases: enPhrases.filter(x => x.ns === 0).map(x => x.title),
    bnIdioms: bnIdioms.filter(x => x.ns === 0).map(x => x.title),
    bnProverbs: bnProverbs.filter(x => x.ns === 0).map(x => x.title),
    enExtracts,
    bnExtracts
  }, null, 2));
  console.log("Saved raw_wiktionary data cleanly.");
})();
