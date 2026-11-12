# 🧠 Open Bangla NLP & AI Suite

> **A unified open-source Bangla Language Engineering platform by [Mohammad Golamrabbii](https://github.com/mohammadgolamrabbii) — connecting Morphology, Idioms & Proverbs, Etymology, Synthetic OCR Generation, LLM Evaluation Benchmarks, Developer SDKs, and a No-Code Community Portal.**

🌐 **Live Web Studio:** https://mohammadgolamrabbii.github.io/Open-Bangla-NLP-Suite/

---

## 📦 What Is Included

| Module | Verified Scale | Export Formats |
| :--- | :--- | :--- |
| **🔬 Bangla Morphology & Stemmer** (`@open-bangla/stemmer`) | `218,414` analyzed inflected words grouped into `30,752` root families across the 495k lexicon | `dist/morphology/bangla_root_families.jsonl` + JS/Python SDK |
| **📚 Idioms, Proverbs & Homophones Vault** | `5,445` verified idioms, proverbs & phrases (`4,883` with Bangla meanings) + `36` homophone pairs + `24` one-word substitutions | `dist/idioms-proverbs/*.json`, `.jsonl`, `.csv` + Interactive Quiz |
| **🧭 Bangla Etymology Origin Map** | `6,101` unique origin-tagged words (`3,803` Sanskrit/Tatsama, `1,155` Persian, `971` Arabic, `617` English, `421` Prakrit, `122` Hindi/Urdu, `61` Portuguese) cross-linked with Hindi cognates | `dist/etymology/bangla_etymology.json`, `.jsonl`, `.csv` |
| **🖼️ Synthetic Bangla OCR Studio** | `160` conjunct clusters (যুক্তাক্ষর) + `5,000` verified Bangla words + 9 WebFonts & custom `.ttf`/`.otf` loader + ZIP exporter | `dist/ocr/ocr_corpus.json` + Browser ZIP (`images/*.png` + `labels.tsv`) |
| **🤖 Bangla LLM Benchmark (`Bangla-Eval-Suite`)** | `460` deterministic tasks across Orthography NFC (`100`), Morphology (`100`), Idioms (`100`), Homophones & 1-Word (`60`), and Bangla-Hindi Cognates (`100`) | `dist/eval-suite/bangla_eval_benchmark.jsonl` |
| **📦 Developer SDKs (`npm` / `PyPI` / Hugging Face)** | `@open-bangla/normalizer`, `@open-bangla/stemmer`, `@open-bangla/lexicon-core`, `open-bangla-nlp` (Python), + `huggingface/push_datasets.py` | `packages/` & `huggingface/` |
| **✍️ No-Code Contribution Portal** | Browser form for non-developers generating pre-filled GitHub Issues across the ecosystem | `https://mohammadgolamrabbii.github.io/Open-Bangla-NLP-Suite/?tab=contribute` |

---

## 🔗 Unified Open Bangla Ecosystem

- 🔤 **Typography (5,020+ Bangla Fonts & 500,337+ Global Fonts):** https://mohammadgolamrabbii.github.io/typography/
- 🇧🇩 **Bangla Lexicon (495,209 Verified NFC Words):** https://mohammadgolamrabbii.github.io/Bangla-Lexicon-Mega-Archive/
- 🇮🇳 **Hindi Lexicon (411,241 Verified NFC Words):** https://mohammadgolamrabbii.github.io/Hindi-Lexicon-Mega-Archive/
- 🌉 **Bangla ↔ Hindi ↔ English Bilingual Bridge (41,904 Cognates):** https://mohammadgolamrabbii.github.io/Bangla-Hindi-Bilingual-Bridge/

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
- `@open-bangla/stemmer` + 495k Lexicon on `morphology_lemma`: `100/100 (100.0%)`

## 📜 License & Attribution
- Software & packaged lexicon derivatives: **GNU GPL-3.0** (matching upstream `Bangla-Lexicon-Mega-Archive` / `MinhasKamal/BengaliDictionary`).
- Idioms, proverbs, phrases, and etymology categories sourced via Wiktionary API (`en.wiktionary.org`, `bn.wiktionary.org`) & `bn-en-dictionary`: **CC BY-SA 3.0 / 4.0**.
