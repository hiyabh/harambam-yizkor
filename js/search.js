// Client-side filtering and list rendering.
import { tokens, matchesQuery } from "./normalize.js";
import { SOURCE_COMMUNITY } from "./data.js";

const NEW_BADGE_TEXT = "נוסף השנה";
const HIGHLIGHT_MS = 2400;

export function filterEntries(entries, gender, query) {
  const queryTokens = tokens(query);
  return entries.filter(
    (entry) => entry.gender === gender && matchesQuery(entry.key, queryTokens),
  );
}

export function countByGender(entries) {
  return entries.reduce(
    (acc, entry) => ({ ...acc, [entry.gender]: (acc[entry.gender] ?? 0) + 1 }),
    { m: 0, f: 0 },
  );
}

function renderItem(entry, highlightKey) {
  const li = document.createElement("li");
  li.className = "name-item";
  li.dataset.key = `${entry.gender}|${entry.key}`;
  const text = document.createElement("span");
  text.className = "name-text";
  text.textContent = entry.name;
  li.append(text);
  if (entry.source === SOURCE_COMMUNITY) {
    const badge = document.createElement("span");
    badge.className = "badge-new";
    badge.textContent = NEW_BADGE_TEXT;
    li.append(badge);
  }
  if (highlightKey && li.dataset.key === highlightKey) li.classList.add("is-highlighted");
  return li;
}

export function renderList(listEl, entries, highlightKey = null) {
  const fragment = document.createDocumentFragment();
  entries.forEach((entry) => fragment.append(renderItem(entry, highlightKey)));
  listEl.replaceChildren(fragment);
  if (!highlightKey) return;
  const target = listEl.querySelector(".is-highlighted");
  if (!target) return;
  target.scrollIntoView({ block: "center", behavior: "smooth" });
  window.setTimeout(() => target.classList.remove("is-highlighted"), HIGHLIGHT_MS);
}
