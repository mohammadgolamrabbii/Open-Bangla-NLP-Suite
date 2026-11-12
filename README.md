# 🧠 Open Bangla NLP & AI Suite

[![Live Web Studio](https://img.shields.io/badge/Live%20Web%20Studio-GitHub%20Pages-10B981?style=for-the-badge)](https://mohammadgolamrabbii.github.io/Open-Bangla-NLP-Suite/)
[![Python Install](https://img.shields.io/badge/Python-pip%20install%20from%20GitHub-3776AB?style=for-the-badge&logo=python&logoColor=white)](#1-python-direct-install-zero-dependencies)
[![Train Bangla LLM](https://img.shields.io/badge/Bangla%20LLM-Training%20Core-8B5CF6?style=for-the-badge)](https://github.com/mohammadgolamrabbii/Bangla-LLM-Training-Core)

> **A unified open-source Bangla Language Engineering platform by [Mohammad Golamrabbii](https://github.com/mohammadgolamrabbii) — connecting Morphology, Idioms & Proverbs, Etymology, Synthetic OCR Generation, LLM Evaluation Benchmarks, Python/JS SDKs, and a No-Code Community Portal.**

---

## ⚡ Anyone Can Use It in 30 Seconds

### 1. Python Direct Install (Zero Dependencies)
```bash
pip install "git+https://github.com/mohammadgolamrabbii/Open-Bangla-NLP-Suite.git#subdirectory=packages/python"
```
```python
from open_bangla_nlp import to_bangla_canonical, BanglaStemmer, load_bangla_lexicon, load_idioms

lexicon = load_bangla_lexicon()  # 587,464 verified NFC Bangla words
stemmer = BanglaStemmer(lexicon)
print(stemmer.analyze("করেছিলেন"))
```

### 2. Browser / JavaScript / Node.js Direct Fetch (CDN / CORS-Ready)
```js
// Normalizer via jsDelivr CDN:
// https://cdn.jsdelivr.net/gh/mohammadgolamrabbii/Open-Bangla-NLP-Suite@main/packages/normalizer/index.js

const idioms = await fetch("https://mohammadgolamrabbii.github.io/Open-Bangla-NLP-Suite/dist/idioms-proverbs/idioms_proverbs.json").then(r => r.json());
const etymology = await fetch("https://mohammadgolamrabbii.github.io/Open-Bangla-NLP-Suite/dist/etymology/bangla_etymology.json").then(r => r.json());
```

---

## 📦 What Is Included (`dist/stats.json` Verified)

| Module | Verified Scale | Export Formats |
| :--- | :--- | :--- |
| **🔬 Bangla Morphology & Stemmer** (`@open-bangla/stemmer`) | `232,486` analyzed inflected words grouped into `32,381` root families across the `587k` lexicon | `dist/morphology/bangla_root_families.jsonl` + Python/JS SDK |
| **📚 Idioms, Proverbs & Homophones Vault** | `5,445` verified idioms, proverbs & phrases (`4,883` with Bangla meanings) + `36` homophone pairs + `24` one-word substitutions | `dist/idioms-proverbs/*.json`, `.jsonl`, `.csv` + Interactive Quiz |
| **🧭 Bangla Etymology Origin Map** | `6,101` unique origin-tagged words (`3,803` Sanskrit/Tatsama, `1,155` Persian, `971` Arabic, `617` English, `421` Prakrit, `122` Hindi/Urdu, `61` Portuguese) | `dist/etymology/bangla_etymology.json`, `.jsonl`, `.csv` |
| **🖼️ Synthetic Bangla OCR Studio** | `160` conjunct clusters (যুক্তাক্ষর) + `5,000` verified Bangla words + WebFonts & custom `.ttf`/`.otf` loader + ZIP exporter | `dist/ocr/ocr_corpus.json` + Browser ZIP (`images/*.png` + `labels.tsv`) |
| **🤖 Bangla LLM Benchmark (`Bangla-Eval-Suite`)** | `460` deterministic tasks across Orthography NFC (`100`), Morphology (`100`), Idioms (`100`), Homophones & 1-Word (`60`), and Bangla-Hindi Cognates (`100`) | `dist/eval-suite/bangla_eval_benchmark.jsonl` |
| **📦 Developer SDKs (`npm` / `Python` / Hugging Face)** | `@open-bangla/normalizer`, `@open-bangla/stemmer`, `@open-bangla/lexicon-core`, `open-bangla-nlp` (Python), + `huggingface/push_datasets.py` | `packages/` & `huggingface/` |
| **✍️ No-Code Contribution Portal** | Browser form for non-developers generating pre-filled GitHub Issues across the ecosystem | `https://mohammadgolamrabbii.github.io/Open-Bangla-NLP-Suite/?tab=contribute` |

---

## 🔗 Unified Open Bangla & AI Ecosystem

- 🧬 **Bangla LLM Training Core (88k Pretrain, 373k SFT, 8k DPO, Colab):** https://mohammadgolamrabbii.github.io/Bangla-LLM-Training-Core/
- 🇧🇩 **Bangla Lexicon (587,464 Verified NFC Words, 119,630 Rich Entries):** https://mohammadgolamrabbii.github.io/Bangla-Lexicon-Mega-Archive/
- 🌉 **Bangla ↔ Hindi ↔ English Bilingual Bridge (48,250 Cognates):** https://mohammadgolamrabbii.github.io/Bangla-Hindi-Bilingual-Bridge/
- 🇮🇳 **Hindi Lexicon (411,241 Verified NFC Words):** https://mohammadgolamrabbii.github.io/Hindi-Lexicon-Mega-Archive/
- 🔤 **Typography Vault (5,020+ Bangla Fonts & 500,337+ Global Fonts):** https://mohammadgolamrabbii.github.io/typography/

---

## 🧪 Run Build, Validation & Benchmark Checks

```bash
node scripts/build_suite.js
node scripts/validate_suite.js
node scripts/evaluate_benchmark.js
node packages/normalizer/test.js
node packages/stemmer/test.js
node packages/lexicon-core/test.js
```

Baseline verified metrics:
- `@open-bangla/normalizer` on `orthography_nfc`: `100/100 (100.0%)`
- `@open-bangla/stemmer` standalone on `morphology_lemma`: `82/100 (82.0%)`
- `@open-bangla/stemmer` + 587k Lexicon on `morphology_lemma`: `100/100 (100.0%)`

## 📜 License & Attribution
- Software & packaged lexicon derivatives: **GNU GPL-3.0**.
- Idioms, proverbs, phrases, and etymology categories sourced via Wiktionary API (`en.wiktionary.org`, `bn.wiktionary.org`) & `bn-en-dictionary`: **CC BY-SA 3.0 / 4.0**.
