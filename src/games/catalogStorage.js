/**
 * Persistencia de «El catálogo imposible», en su propia clave de
 * `localStorage` — igual criterio defensivo que `games/mothLockStorage.js`:
 * nunca lanza, ignora datos corruptos o desconocidos en silencio, y una
 * versión de esquema futura no se interpreta ni se sobrescribe.
 */
import { CLUES } from './catalogData.js';

const STORAGE_KEY = 'hogwarts:catalog';
const SCHEMA_VERSION = 1;

const VALID_CLUE_IDS = new Set(CLUES.map((clue) => clue.id));

function emptyState() {
  return { discoveredClueIds: [], solved: false };
}

function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object') return emptyState();

  const discoveredClueIds = Array.isArray(raw.discoveredClueIds)
    ? Array.from(new Set(raw.discoveredClueIds.filter((id) => typeof id === 'string' && VALID_CLUE_IDS.has(id))))
    : [];

  return {
    discoveredClueIds,
    solved: raw.solved === true
  };
}

export function loadCatalogState() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return emptyState();
  }
  if (!raw) return emptyState();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyState();
  }

  if (!parsed || typeof parsed !== 'object' || typeof parsed.version !== 'number') return emptyState();
  if (parsed.version > SCHEMA_VERSION) return emptyState();

  return sanitizeState(parsed.state);
}

function saveCatalogState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: sanitizeState(state) }));
    return true;
  } catch {
    return false;
  }
}

export function markCatalogClueDiscovered(clueId) {
  const current = loadCatalogState();
  if (!VALID_CLUE_IDS.has(clueId) || current.discoveredClueIds.includes(clueId)) return current;
  const next = { ...current, discoveredClueIds: [...current.discoveredClueIds, clueId] };
  saveCatalogState(next);
  return next;
}

export function markCatalogSolved() {
  const current = loadCatalogState();
  if (current.solved) return current;
  const next = { ...current, solved: true };
  saveCatalogState(next);
  return next;
}
