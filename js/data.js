// Loads the static base list and the community additions from Supabase, and merges them.
import { CONFIG } from "./config.js";
import { normalizeName, cleanForStorage } from "./normalize.js";

const SOURCE_BASE = "base";
const SOURCE_COMMUNITY = "community";
const HTTP_CONFLICT = 409;

function restUrl(query = "") {
  return `${CONFIG.supabaseUrl}/rest/v1/${CONFIG.table}${query}`;
}

function restHeaders(extra = {}) {
  return {
    apikey: CONFIG.supabaseKey,
    Authorization: `Bearer ${CONFIG.supabaseKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function toEntry(name, gender, source, extra = {}) {
  return { name, gender, source, key: normalizeName(name), ...extra };
}

export async function loadBaseList() {
  const response = await fetch(CONFIG.baseListPath, { cache: "no-cache" });
  if (!response.ok) throw new Error(`base list HTTP ${response.status}`);
  const json = await response.json();
  return [
    ...json.men.map((name) => toEntry(name, "m", SOURCE_BASE)),
    ...json.women.map((name) => toEntry(name, "f", SOURCE_BASE)),
  ];
}

export async function loadCommunityList() {
  const query = "?select=id,name,gender,created_at&order=created_at.asc";
  const response = await fetch(restUrl(query), { headers: restHeaders() });
  if (!response.ok) throw new Error(`community list HTTP ${response.status}`);
  const rows = await response.json();
  return rows.map((row) =>
    toEntry(row.name, row.gender, SOURCE_COMMUNITY, { id: row.id, createdAt: row.created_at }),
  );
}

export function mergeLists(base, community) {
  const seen = new Set(base.map((entry) => `${entry.gender}|${entry.key}`));
  const merged = [...base];
  for (const entry of community) {
    const id = `${entry.gender}|${entry.key}`;
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(entry);
  }
  return merged;
}

export function findDuplicate(entries, name, gender) {
  const key = normalizeName(name);
  if (!key) return null;
  return entries.find((entry) => entry.gender === gender && entry.key === key) ?? null;
}

export class DuplicateError extends Error {}

export async function submitName({ name, gender, submittedBy }) {
  const body = {
    name: cleanForStorage(name),
    gender,
    submitted_by: cleanForStorage(submittedBy) || null,
  };
  const response = await fetch(restUrl(), {
    method: "POST",
    headers: restHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(body),
  });
  if (response.status === HTTP_CONFLICT) throw new DuplicateError("duplicate");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const [row] = await response.json();
  return toEntry(row.name, row.gender, SOURCE_COMMUNITY, { id: row.id, createdAt: row.created_at });
}

export { SOURCE_BASE, SOURCE_COMMUNITY };
