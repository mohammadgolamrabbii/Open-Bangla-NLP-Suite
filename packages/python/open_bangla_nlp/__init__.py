"""Open Bangla NLP: Canonical NFC normalizer and Bangla morphological stemmer."""
import re
import unicodedata
from typing import Dict, List, Optional, Set


def to_bangla_canonical(text: str) -> str:
    """Normalize to NFC and recompose য়/ড়/ঢ় excluded by Unicode NFC rules."""
    if not text:
        return ""
    s = unicodedata.normalize("NFC", text)
    s = (
        s.replace("\u09AF\u09BC", "\u09DF")
        .replace("\u09A1\u09BC", "\u09DC")
        .replace("\u09A2\u09BC", "\u09DD")
        .replace("\u200B", "")
        .replace("\uFEFF", "")
        .replace("\u09C7\u09BE", "\u09CB")
        .replace("\u09C7\u09D7", "\u09CC")
    )
    return re.sub(r"([\u09BE-\u09CC\u09D7])\1+", r"\1", s).strip()


NOMINAL_SUFFIXES = [
    "গুলোরই", "গুলোরও", "গুলিরই", "গুলোতে", "গুলিতে", "গুলোর", "গুলির", "গুলোকে",
    "গুলিকে", "গুলো", "গুলি", "গুলা", "দেরকে", "দের", "সমূহের", "সমূহকে", "সমূহে",
    "সমূহ", "খানাকে", "খানাতে", "খানায়", "খানার", "খানা", "খানি", "টাকে", "টাতে",
    "টার", "টা", "টিকে", "টিতে", "টির", "টি", "টুকু", "য়ের", "ের", "র", "কে", "রে",
    "তে", "এতে", "য়ে", "য়", "ে",
]

VERBAL_SUFFIXES = [
    "ইতেছিলেন", "ইতেছিলাম", "ইতেছিল", "ইতেছেন", "ইতেছি", "ইতেছে",
    "িয়েছিলেন", "িয়েছিলাম", "িয়েছিল", "িয়েছেন", "িয়েছি", "িয়েছে",
    "য়েছিলেন", "য়েছিলাম", "য়েছিল", "য়েছেন", "য়েছি", "য়েছে",
    "েছিলেন", "েছিলাম", "েছিল", "েছেন", "েছি", "েছে",
    "ছিলেন", "ছিলাম", "ছিল", "ছেন", "ছি", "ছে", "বেন", "বে", "বো", "তাম", "তেন", "তে", "ানো", "িয়ে"
]

IRREGULAR_VERBS = {
    "গি": "যাওয়া", "গে": "যাওয়া", "গ": "যাওয়া", "যা": "যাওয়া",
    "দি": "দেওয়া", "দে": "দেওয়া", "দ": "দেওয়া",
    "নি": "নেওয়া", "নে": "নেওয়া", "ন": "নেওয়া",
    "কর": "করা", "পড়": "পড়া", "লিখ": "লেখা", "দেখ": "দেখা", "হ": "হওয়া"
}


class BanglaStemmer:
    def __init__(self, lexicon: Optional[Set[str]] = None):
        self.lexicon = lexicon

    def analyze(self, word: str) -> Dict[str, object]:
        w = to_bangla_canonical(word)
        suffixes: List[str] = []
        cur = w
        is_verb = False

        for vs in VERBAL_SUFFIXES:
            if cur.endswith(vs) and len(cur) > len(vs):
                stem = cur[: -len(vs)]
                if len(stem) >= 1 and (stem in IRREGULAR_VERBS or not self.lexicon or (stem + "া") in self.lexicon or len(vs) >= 3):
                    suffixes.insert(0, vs)
                    cur = stem
                    is_verb = True
                    break

        if not is_verb:
            for _ in range(2):
                for ns in NOMINAL_SUFFIXES:
                    if cur.endswith(ns) and len(cur) > len(ns):
                        stem = cur[: -len(ns)]
                        if self.lexicon is None or stem in self.lexicon or len(ns) >= 2:
                            suffixes.insert(0, ns)
                            cur = stem
                            break
                else:
                    break

        lemma = IRREGULAR_VERBS.get(cur, cur + "া" if is_verb and (not self.lexicon or (cur + "া") in self.lexicon) else cur)
        return {"word": w, "root": cur, "lemma": lemma, "suffixes": suffixes}

    def stem(self, word: str) -> str:
        return str(self.analyze(word)["root"])


_BASE_NLP = "https://mohammadgolamrabbii.github.io/Open-Bangla-NLP-Suite"
_BASE_LEX = "https://mohammadgolamrabbii.github.io/Bangla-Lexicon-Mega-Archive"


def load_bangla_lexicon(url: str = f"{_BASE_LEX}/dist/bangla_wordlist_verified.txt") -> Set[str]:
    """Fetch the 587,464-word verified Canonical NFC Bangla wordlist from GitHub Pages."""
    import urllib.request
    with urllib.request.urlopen(url, timeout=30) as resp:
        text = resp.read().decode("utf-8")
    return {line.strip() for line in text.splitlines() if line.strip()}


def load_idioms(url: str = f"{_BASE_NLP}/dist/idioms-proverbs/idioms_proverbs.json") -> List[Dict[str, object]]:
    """Fetch 5,445+ Bangla idioms & proverbs JSON from Open-Bangla-NLP-Suite."""
    import json
    import urllib.request
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def load_etymology(url: str = f"{_BASE_NLP}/dist/etymology/bangla_etymology.json") -> List[Dict[str, object]]:
    """Fetch 6,101 origin-tagged Bangla etymology entries."""
    import json
    import urllib.request
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def create_stemmer_with_lexicon() -> "BanglaStemmer":
    """Return a BanglaStemmer grounded with the live 587k Bangla Lexicon."""
    return BanglaStemmer(load_bangla_lexicon())

