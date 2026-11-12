const fs = require("fs");
const path = require("path");
const https = require("https");

const RAW_PATH = path.join(__dirname, "..", "raw_wiktionary", "wiktionary_idioms_raw.json");
const OUT_PATH = path.join(__dirname, "..", "raw_wiktionary", "wiktionary_idioms_enriched.json");

function postQuery(host, paramsObj) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(paramsObj).toString();
    const req = https.request({
      hostname: host,
      path: "/w/api.php",
      method: "POST",
      headers: {
        "User-Agent": "Open-Bangla-NLP-Suite/1.0 (https://github.com/mohammadgolamrabbii)",
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body)
      }
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        if (res.statusCode === 429 || res.statusCode >= 500) {
          return reject(new Error(`HTTP_${res.statusCode}`));
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`HTTP_${res.statusCode}_JSON: ${e.message}`)); }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("Timeout")));
    req.write(body);
    req.end();
  });
}

function stripWikitext(line) {
  return line
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/'''?/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBnWikitext(title, wt) {
  const lines = wt.split(/\r?\n/);
  const meanings = [];
  const synonyms = [];
  let inSyn = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^=+\s*সমার্থক/.test(line)) { inSyn = true; continue; }
    if (/^=+/.test(line)) { inSyn = false; continue; }
    if (line.startsWith("#") && !line.startsWith("#*") && !line.startsWith("#:") && !line.startsWith("##")) {
      const clean = stripWikitext(line.replace(/^#+/, ""));
      if (clean && clean !== title && clean.length >= 2) meanings.push(clean);
    } else if (inSyn && (line.startsWith("*") || line.startsWith("#"))) {
      const s = stripWikitext(line.replace(/^[*#]+/, ""));
      if (s && s.length >= 2) synonyms.push(s);
    }
  }
  // Fallback if definitions are plain lines under বাগধারা / প্রবাদ heading
  if (meanings.length === 0) {
    let capture = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (/^===+\s*(বাগধারা|প্রবাদ|বিশেষ্য|অর্থ|বাক্যাংশ)/.test(line)) { capture = true; continue; }
      if (/^==/.test(line)) { capture = false; continue; }
      if (capture && line && !line.startsWith("{{") && !line.startsWith("[[বিষয়শ্রেণী") && !line.startsWith("*")) {
        const clean = stripWikitext(line);
        if (clean && clean !== title && clean.length >= 3) {
          meanings.push(clean);
          if (meanings.length >= 3) break;
        }
      }
    }
  }
  return { meanings: [...new Set(meanings)].slice(0, 4), synonyms: [...new Set(synonyms)].slice(0, 6) };
}

function parseEnWikitext(title, wt) {
  // Isolate ==Bengali== section
  const secMatch = wt.match(/==\s*Bengali\s*==([\s\S]*?)(?=\n==[^=]|$)/);
  const sec = secMatch ? secMatch[1] : wt;
  const meanings = [];
  for (const raw of sec.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("# ") && !line.startsWith("#*") && !line.startsWith("#:")) {
      const clean = stripWikitext(line.slice(2));
      if (clean && clean.length >= 2) meanings.push(clean);
    }
  }
  return { meanings: [...new Set(meanings)].slice(0, 4) };
}

async function fetchBatchRevisions(host, titles, parser) {
  const batches = [];
  for (let i = 0; i < titles.length; i += 45) batches.push(titles.slice(i, i + 45));
  const out = {};
  let idx = 0;
  let errors = 0;
  async function worker() {
    while (idx < batches.length) {
      const b = batches[idx++];
      for (let retry = 0; retry < 3; retry++) {
        try {
          const json = await postQuery(host, {
            action: "query",
            titles: b.join("|"),
            prop: "revisions",
            rvprop: "content",
            rvslots: "main",
            format: "json"
          });
          const pages = (json.query && json.query.pages) || {};
          for (const p of Object.values(pages)) {
            const wt = p.revisions && p.revisions[0] && p.revisions[0].slots && p.revisions[0].slots.main && p.revisions[0].slots.main["*"];
            if (p.title && wt) out[p.title] = parser(p.title, wt);
          }
          break;
        } catch (e) {
          if (retry === 2) errors++;
          else await new Promise(r => setTimeout(r, 1200 * (retry + 1)));
        }
      }
      await new Promise(r => setTimeout(r, 80));
    }
  }
  await Promise.all(Array.from({ length: 3 }, () => worker()));
  console.log(`[${host}] done: ${Object.keys(out).length} parsed, errors=${errors}`);
  return out;
}

(async () => {
  const raw = JSON.parse(fs.readFileSync(RAW_PATH, "utf8"));
  const bnTitles = [...new Set([...raw.bnIdioms, ...raw.bnProverbs])];
  const enTitles = [...new Set([...raw.enIdioms, ...raw.enProverbs, ...raw.enPhrases])];
  console.log(`Fetching wikitext revisions: ${bnTitles.length} bn + ${enTitles.length} en...`);
  const [bnParsed, enParsed] = await Promise.all([
    fetchBatchRevisions("bn.wiktionary.org", bnTitles, parseBnWikitext),
    fetchBatchRevisions("en.wiktionary.org", enTitles, parseEnWikitext)
  ]);
  console.log(`Parsed bn: ${Object.keys(bnParsed).length}, en: ${Object.keys(enParsed).length}`);
  fs.writeFileSync(OUT_PATH, JSON.stringify({ raw, bnParsed, enParsed }));
  console.log("Saved", OUT_PATH);
})();
