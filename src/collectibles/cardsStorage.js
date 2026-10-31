/**
 * Persistencia de los cromos ya encontrados, en una clave propia de
 * `localStorage` (nunca en `calendarStorage`, que documenta
 * explícitamente que solo guarda el progreso de los expedientes).
 * Mismo criterio defensivo que `calendar/calendarStorage.js`: nunca
 * lanza, ignora datos desconocidos o corruptos en silencio, y una
 * versión de esquema más nueva que esta build no se sobrescribe.
 */
import { CARDS } from './cardsData.js';

const STORAGE_KEY = 'hogwarts:cardsCollected';
const SCHEMA_VERSION = 1;

const VALID_IDS = new Set(CARDS.map((card) => card.id));

function sanitizeIds(rawIds) {
  if (!Array.isArray(rawIds)) return [];
  const unique = new Set(rawIds.filter((id) => typeof id === 'string' && VALID_IDS.has(id)));
  return Array.from(unique);
}

export function loadCollectedCardIds() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!parsed || typeof parsed !== 'object' || typeof parsed.version !== 'number') return [];
  if (parsed.version > SCHEMA_VERSION) return [];

  return sanitizeIds(parsed.collectedIds);
}

export function saveCollectedCardIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, collectedIds: sanitizeIds(ids) }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Marca un cromo como encontrado. Si ya lo estaba, devuelve la MISMA
 * lista (sin volver a guardar), igual que `calendarEngine.markSolved`
 * con los expedientes.
 */
export function markCardCollected(id) {
  const current = loadCollectedCardIds();
  if (!VALID_IDS.has(id) || current.includes(id)) return current;
  const next = [...current, id];
  saveCollectedCardIds(next);
  return next;
}
