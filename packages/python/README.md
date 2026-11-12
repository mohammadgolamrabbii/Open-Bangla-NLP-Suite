# open-bangla-nlp

Zero-dependency **Canonical NFC Bangla Normalizer** (`য়/ড়/ঢ়`), **Morphological Stemmer & Lemmatizer**, and 1-line data loaders for **587,464** verified Bangla words, **5,445** idioms/proverbs, and **6,101** etymology entries.

## Direct Installation (No PyPI Required)

```bash
pip install "git+https://github.com/mohammadgolamrabbii/Open-Bangla-NLP-Suite.git#subdirectory=packages/python"
```

## Quick Usage

```python
from open_bangla_nlp import (
    to_bangla_canonical,
    BanglaStemmer,
    load_bangla_lexicon,
    load_idioms,
    load_etymology,
)

# 1. Fix decomposed nukta (য+় -> য়, ড+় -> ড়, ঢ+় -> ঢ়)
print(to_bangla_canonical("প\u09a1\u09bcা"))  # পড়া

# 2. Stem & lemmatize Bangla words
stemmer = BanglaStemmer(load_bangla_lexicon())
print(stemmer.analyze("বইগুলোরই"))  # {'word': 'বইগুলোরই', 'root': 'বই', 'lemma': 'বই', 'suffixes': [...]}

# 3. Load 5,445 idioms or 6,101 etymology entries
idioms = load_idioms()
origins = load_etymology()
```
