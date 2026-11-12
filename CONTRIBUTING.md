# 🤝 Contributing to Bangla Lexicon Mega-Archive

Thank you for helping preserve and enrich the open-source Bangla language dataset!

## 📜 Core Rules
1. **Canonical Unicode:** Every Bangla entry MUST be Unicode NFC normalized with precomposed characters (`য়` `\u09DF`, `ড়` `\u09DC`, `ঢ়` `\u09DD`, `ো` `\u09CB`, `ৌ` `\u09CC`).
2. **Schema Compliance:** All entries must conform to `schema/lexicon.schema.json`.
3. **No Duplicates:** Check `dist/bangla_lexicon_rich.jsonl` before submitting.
4. **Automated Validation:** Always run the validator before committing:
   ```bash
   node scripts/validate_lexicon.js
   ```

## 🌟 Easy Contribution (No Coding Required)
Use the **GitHub Issues** tab and select **"✨ Add New Word"** or **"🔧 Fix Spelling or Meaning"**.
