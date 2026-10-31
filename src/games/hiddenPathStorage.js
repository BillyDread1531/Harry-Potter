/**
 * Persistencia de «Los pasos ocultos», en su propia clave de
 * `localStorage` — igual criterio defensivo que el resto de
 * `games/*Storage.js`. El intento de orden en curso NO se persiste a
 * propósito (igual que la combinación de la cerradura de la polilla):
 * reabrir el Mapa siempre empieza desde cero, nunca desde un intento a
 * medias de una visita anterior.
 */
import { CLUES } from './hiddenPathData.js';

const STORAGE_KEY = 'hogwarts:hiddenPath';
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

export function loadHiddenPathState() {
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

function saveHiddenPathState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: sanitizeState(state) }));
    return true;
  } catch {
    return false;
  }
}

export function markHiddenPathClueDiscovered(clueId) {
  const current = loadHiddenPathState();
  if (!VALID_CLUE_IDS.has(clueId) || current.discoveredClueIds.includes(clueId)) return current;
  const next = { ...current, discoveredClueIds: [...current.discoveredClueIds, clueId] };
  saveHiddenPathState(next);
  return next;
}

export function markHiddenPathSolved() {
  const current = loadHiddenPathState();
  if (current.solved) return current;
  const next = { ...current, solved: true };
  saveHiddenPathState(next);
  return next;
}
