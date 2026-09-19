// Name normalisation shared by search and duplicate detection.
const NIQQUD = /[֑-ׇ]/g;
const GERESH_VARIANTS = /[׳‘’'`]/g;
const GERSHAYIM_VARIANTS = /[״“”"]/g;
const PUNCTUATION = /[.,;:!?()\[\]{}\-_/\\]/g;
const WHITESPACE = /\s+/g;
const SON_OF_ARAMAIC = /(^|\s)בר(\s|$)/g;
const FEMININE_MARKERS = /(^|\s)בת(\s|$)/;
const MASCULINE_MARKERS = /(^|\s)(בן|בר)(\s|$)/;

export function normalizeName(text) {
  return String(text ?? "")
    .replace(NIQQUD, "")
    .replace(GERESH_VARIANTS, "")
    .replace(GERSHAYIM_VARIANTS, "")
    .replace(PUNCTUATION, " ")
    .replace(SON_OF_ARAMAIC, "$1בן$2")
    .replace(WHITESPACE, " ")
    .trim()
    .toLowerCase();
}

export function cleanForStorage(text) {
  return String(text ?? "").replace(WHITESPACE, " ").trim();
}

export function tokens(query) {
  return normalizeName(query).split(" ").filter(Boolean);
}

export function matchesQuery(normalizedName, queryTokens) {
  return queryTokens.every((token) => normalizedName.includes(token));
}

export function hasLineageWord(text, gender) {
  const marker = gender === "f" ? FEMININE_MARKERS : MASCULINE_MARKERS;
  return marker.test(normalizeName(text));
}

export function hebrewCompare(a, b) {
  return a.localeCompare(b, "he");
}
