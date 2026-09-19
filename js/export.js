// Export page: merged, sorted list with copy / print / DOCX / JSON actions.
import { CONFIG } from "./config.js";
import { loadBaseList, loadCommunityList, mergeLists, SOURCE_COMMUNITY } from "./data.js";
import { hebrewCompare } from "./normalize.js";
import { buildDocx } from "./docx-builder.js";

const COPY_FEEDBACK_MS = 1600;
// Browsers replace a straight quote in a download name with "_", so the year uses Hebrew gershayim.
const DOCX_FILE_NAME = `שמות לאזכרה לנפטרים ליום כיפור ${CONFIG.yearLabel.replace('"', "״")}.docx`;
const JSON_FILE_NAME = "names.json";
const NEW_BADGE_TEXT = "נוסף השנה";

const els = {
  summary: document.querySelector("#export-summary"),
  error: document.querySelector("#export-error"),
  men: document.querySelector("#list-men"),
  women: document.querySelector("#list-women"),
  countMen: document.querySelector("#count-men"),
  countWomen: document.querySelector("#count-women"),
  docx: document.querySelector("#btn-docx"),
  print: document.querySelector("#btn-print"),
  copy: document.querySelector("#btn-copy"),
  json: document.querySelector("#btn-json"),
};

let lists = { men: [], women: [] };

function sorted(entries, gender) {
  return entries.filter((e) => e.gender === gender).sort((a, b) => hebrewCompare(a.name, b.name));
}

function renderColumn(listEl, entries) {
  const fragment = document.createDocumentFragment();
  for (const entry of entries) {
    const li = document.createElement("li");
    li.textContent = entry.name;
    if (entry.source === SOURCE_COMMUNITY) {
      const badge = document.createElement("span");
      badge.className = "badge-new";
      badge.textContent = NEW_BADGE_TEXT;
      li.append(badge);
    }
    fragment.append(li);
  }
  listEl.replaceChildren(fragment);
}

function render(newCount) {
  renderColumn(els.men, lists.men);
  renderColumn(els.women, lists.women);
  els.countMen.textContent = `(${lists.men.length})`;
  els.countWomen.textContent = `(${lists.women.length})`;
  els.summary.textContent = `${lists.men.length} גברים · ${lists.women.length} נשים · ${newCount} נוספו השנה`;
  Object.values(els).filter((el) => el instanceof HTMLButtonElement).forEach((btn) => { btn.disabled = false; });
}

function download(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function plainText() {
  const men = ['לע"נ - גברים:', ...lists.men.map((e) => e.name)].join("\n");
  const women = ['לע"נ - נשים:', ...lists.women.map((e) => e.name)].join("\n");
  return `${men}\n\n${women}\n`;
}

async function copyAll() {
  await navigator.clipboard.writeText(plainText());
  els.copy.classList.add("is-copied");
  window.setTimeout(() => els.copy.classList.remove("is-copied"), COPY_FEEDBACK_MS);
}

function downloadJson() {
  const payload = { men: lists.men.map((e) => e.name), women: lists.women.map((e) => e.name) };
  download(new Blob([JSON.stringify(payload, null, 1)], { type: "application/json" }), JSON_FILE_NAME);
}

async function downloadDocx() {
  if (!window.docx) {
    els.error.hidden = false;
    els.error.textContent = "ספריית Word לא נטענה. בדוק את החיבור לאינטרנט ורענן את הדף.";
    return;
  }
  els.docx.disabled = true;
  try {
    const blob = await buildDocx(window.docx, lists, CONFIG);
    download(blob, DOCX_FILE_NAME);
  } finally {
    els.docx.disabled = false;
  }
}

async function load() {
  try {
    const base = await loadBaseList();
    let entries = base;
    let community = [];
    try {
      community = await loadCommunityList();
      entries = mergeLists(base, community);
    } catch (error) {
      els.error.hidden = false;
      els.error.textContent = `השמות שנוספו השנה לא נטענו (${error.message}). מוצגת רק הרשימה של שנה שעברה.`;
    }
    lists = { men: sorted(entries, "m"), women: sorted(entries, "f") };
    render(entries.filter((e) => e.source === SOURCE_COMMUNITY).length);
  } catch (error) {
    els.summary.textContent = `לא הצלחנו לטעון את הרשימה (${error.message}).`;
  }
}

els.copy.addEventListener("click", copyAll);
els.print.addEventListener("click", () => window.print());
els.json.addEventListener("click", downloadJson);
els.docx.addEventListener("click", downloadDocx);
load();
