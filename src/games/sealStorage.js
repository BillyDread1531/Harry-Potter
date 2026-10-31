/**
 * Persistencia de «El sello correcto», en su propia clave de
 * `localStorage` — igual criterio defensivo que el resto de
 * `games/*Storage.js`.
 */
import { CLUES } from './sealData.js';

const STORAGE_KEY = 'hogwarts:seal';
const SCHEMA_VERSION = 1;

const VALID_CLUE_IDS = new Set(CLUES.map((clue) => clue.id));

function emptyState() {
  return { discoveredClueIds: [], solved: false, contentsViewed: false };
}

function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object') return emptyState();

  const discoveredClueIds = Array.isArray(raw.discoveredClueIds)
    ? Array.from(new Set(raw.discoveredClueIds.filter((id) => typeof id === 'string' && VALID_CLUE_IDS.has(id))))
    : [];

  return {
    discoveredClueIds,
    solved: raw.solved === true,
    contentsViewed: raw.contentsViewed === true
  };
}

export function loadSealState() {
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

function saveSealState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: sanitizeState(state) }));
    return true;
  } catch {
    return false;
  }
}

export function markSealClueDiscovered(clueId) {
  const current = loadSealState();
  if (!VALID_CLUE_IDS.has(clueId) || current.discoveredClueIds.includes(clueId)) return current;
  const next = { ...current, discoveredClueIds: [...current.discoveredClueIds, clueId] };
  saveSealState(next);
  return next;
}

export function markSealSolved() {
  const current = loadSealState();
  if (current.solved) return current;
  const next = { ...current, solved: true };
  saveSealState(next);
  return next;
}

/** Solo tiene efecto una vez resuelto: ver el contenido del compartimento es un segundo gesto, no algo que se regale solo al resolver. */
export function markSealContentsViewed() {
  const current = loadSealState();
  if (!current.solved || current.contentsViewed) return current;
  const next = { ...current, contentsViewed: true };
  saveSealState(next);
  return next;
}
