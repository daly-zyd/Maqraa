"""Arabic name normalisation (aliases) used to resolve "ش/ يوسف المديحي" and "يوسف مديحي" to one person."""
import re
import unicodedata

_DIACRITICS = re.compile(r"[ؐ-ًؚ-ٰٟۖ-ۭ]")
_TATWEEL = "ـ"
_TITLE = re.compile(r"^\s*(ش\s*/|د\s*/|أ\s*/|ا\s*/|الشيخ|فضيلة الشيخ|الدكتور|الأستاذ|الاستاذ|الاخ|الأخ)\s*")
_PAREN = re.compile(r"\([^)]*\)")
_SPACES = re.compile(r"\s+")

_CHAR_MAP = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ى": "ي", "ة": "ه", "ؤ": "و", "ئ": "ي"})


def strip_titles(text: str) -> str:
    text = _PAREN.sub(" ", text or "")
    previous = None
    while previous != text:
        previous = text
        text = _TITLE.sub("", text)
    return text


def normalize_arabic(text: str) -> str:
    """Strip titles/diacritics/tatweel/extra spaces; normalise alef, yaa, taa-marbuta."""
    text = unicodedata.normalize("NFKC", strip_titles(text))
    text = _DIACRITICS.sub("", text).replace(_TATWEEL, "")
    text = text.translate(_CHAR_MAP)
    return _SPACES.sub(" ", text).strip()


def name_key(text: str) -> str:
    """Matching key: normalised tokens with the leading definite article removed (المديحي == مديحي)."""
    tokens = []
    for token in normalize_arabic(text).split(" "):
        if len(token) > 3 and token.startswith("ال"):
            token = token[2:]
        if token:
            tokens.append(token)
    return " ".join(tokens)
