// Wires data loading, search, the segmented control and the add sheet together.
import { loadBaseList, loadCommunityList, mergeLists } from "./data.js";
import { filterEntries, countByGender, renderList } from "./search.js";
import { createSheet } from "./sheet.js";
import { createAddForm } from "./add-form.js";
import { CONFIG } from "./config.js";

const GENDER_LABELS = { m: "גברים", f: "נשים" };
const COPY_FEEDBACK_MS = 1600;
// Without a search, only a preview is shown so the add form and kaparot card stay within reach.
const PREVIEW_COUNT = 12;

const els = {
  search: document.querySelector("#search"),
  clear: document.querySelector("#search-clear"),
  count: document.querySelector("#result-count"),
  segmented: document.querySelector("#gender-tabs"),
  list: document.querySelector("#names-list"),
  empty: document.querySelector("#empty-state"),
  emptyQuery: document.querySelector("#empty-query"),
  emptyAdd: document.querySelector("#empty-add"),
  showMore: document.querySelector("#show-more"),
  showMoreBtn: document.querySelector("#show-more-btn"),
  shownCount: document.querySelector("#shown-count"),
  totalCount: document.querySelector("#total-count"),
  loading: document.querySelector("#loading-state"),
  loadError: document.querySelector("#load-error"),
  communityWarning: document.querySelector("#community-warning"),
  addButtons: document.querySelectorAll("[data-open-add]"),
  copyBit: document.querySelector("#copy-bit"),
};

const state = { entries: [], gender: "m", query: "", highlightKey: null, expanded: false };

function visibleSlice(shown) {
  const preview = !state.query.trim() && !state.expanded && shown.length > PREVIEW_COUNT;
  els.showMore.hidden = !preview;
  if (!preview) return shown;
  els.shownCount.textContent = PREVIEW_COUNT;
  els.totalCount.textContent = shown.length;
  return shown.slice(0, PREVIEW_COUNT);
}

function updateTabs() {
  const counts = countByGender(state.entries);
  els.segmented.querySelectorAll("[data-gender]").forEach((tab) => {
    const g = tab.dataset.gender;
    tab.querySelector(".tab-count").textContent = counts[g];
    tab.setAttribute("aria-selected", String(g === state.gender));
  });
  els.segmented.style.setProperty("--active-index", state.gender === "m" ? 0 : 1);
}

function describeCount(shown) {
  const label = GENDER_LABELS[state.gender];
  if (!state.query) return `${shown} ${label} ברשימה`;
  return shown === 0 ? "לא נמצאו שמות" : `נמצאו ${shown} מתוך ${label}`;
}

function render() {
  const shown = filterEntries(state.entries, state.gender, state.query);
  renderList(els.list, visibleSlice(shown), state.highlightKey);
  state.highlightKey = null;
  els.count.textContent = describeCount(shown.length);
  const isEmpty = shown.length === 0 && state.query.trim().length > 0;
  els.empty.hidden = !isEmpty;
  els.emptyQuery.textContent = state.query.trim();
  els.clear.hidden = state.query.length === 0;
  updateTabs();
}

function setGender(gender) {
  if (state.gender === gender) return;
  state.gender = gender;
  state.expanded = false;
  render();
}

function onAdded(entry) {
  state.entries = mergeLists(state.entries, [entry]);
  state.gender = entry.gender;
  state.query = "";
  els.search.value = "";
  state.expanded = true;
  state.highlightKey = `${entry.gender}|${entry.key}`;
  render();
}

async function loadData() {
  els.loading.hidden = false;
  try {
    const base = await loadBaseList();
    state.entries = base;
    render();
  } catch (error) {
    els.loadError.hidden = false;
    els.loadError.textContent = `לא הצלחנו לטעון את הרשימה (${error.message}). רענן את הדף ונסה שוב.`;
    return;
  } finally {
    els.loading.hidden = true;
  }
  try {
    const community = await loadCommunityList();
    state.entries = mergeLists(state.entries, community);
    render();
  } catch {
    els.communityWarning.hidden = false;
  }
}

async function copyBitNumber() {
  try {
    await navigator.clipboard.writeText(CONFIG.bitPhone);
    els.copyBit.classList.add("is-copied");
    window.setTimeout(() => els.copyBit.classList.remove("is-copied"), COPY_FEEDBACK_MS);
  } catch {
    window.prompt("העתק את המספר:", CONFIG.bitPhone);
  }
}

function bindEvents(addForm) {
  els.search.addEventListener("input", () => { state.query = els.search.value; render(); });
  els.clear.addEventListener("click", () => { els.search.value = ""; state.query = ""; render(); els.search.focus(); });
  els.segmented.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-gender]");
    if (tab) setGender(tab.dataset.gender);
  });
  els.addButtons.forEach((btn) => btn.addEventListener("click", () => addForm.openWith("", state.gender)));
  els.emptyAdd.addEventListener("click", () => addForm.openWith(state.query.trim(), state.gender));
  els.showMoreBtn.addEventListener("click", () => { state.expanded = true; render(); });
  els.copyBit?.addEventListener("click", copyBitNumber);
}

function init() {
  const sheetRoot = document.querySelector("#add-sheet");
  const sheet = createSheet(sheetRoot);
  const addForm = createAddForm({ root: sheetRoot, getEntries: () => state.entries, onAdded, sheet });
  bindEvents(addForm);
  loadData();
}

init();
