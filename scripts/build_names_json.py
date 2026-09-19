"""Build data/names.json from last year's Word list.

Usage: python scripts/build_names_json.py "<path to docx>"
Men are the paragraphs between the men header and the women header;
women follow the women header. Exact duplicates (after whitespace
normalisation) are merged, keeping first occurrence order.
"""
import json
import re
import sys
from pathlib import Path

from docx import Document

MEN_HEADER = "גברים"
WOMEN_HEADER = "נשים"
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "names.json"


def normalise(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def is_header(text: str, word: str) -> bool:
    return text.startswith('לע"נ') and word in text


def split_sections(paragraphs):
    men, women, current = [], [], None
    for raw in paragraphs:
        text = normalise(raw)
        if is_header(text, MEN_HEADER):
            current = men
            continue
        if is_header(text, WOMEN_HEADER):
            current = women
            continue
        if text and current is not None:
            current.append(text)
    return men, women


def dedupe(items):
    seen, out = set(), []
    for item in items:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out


def main(docx_path: str):
    doc = Document(docx_path)
    men, women = split_sections(p.text for p in doc.paragraphs)
    data = {"men": dedupe(men), "women": dedupe(women)}
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"men {len(men)}->{len(data['men'])}, women {len(women)}->{len(data['women'])}")
    print(f"wrote {OUT_PATH}")


if __name__ == "__main__":
    main(sys.argv[1])
