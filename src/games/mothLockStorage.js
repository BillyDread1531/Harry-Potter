/**
 * Persistencia de «La cerradura de la polilla», en una clave propia de
 * `localStorage` — nunca `hogwarts:calendarProgress` ni ninguna otra
 * clave existente: este minijuego es un sistema de progreso
 * completamente independiente del calendario, los cromos o los
 * hallazgos. Mismo criterio defensivo que el resto del proyecto
 * (`calendar/calendarStorage.js`, `collectibles/cardsStorage.js`):
 * nunca lanza, ignora datos corruptos o desconocidos en silencio, y una
 * versión de esquema futura no se interpreta ni se sobrescribe.
 *
 * Solo se guarda lo mínimo para reconstruir la partida: qué pistas se
 * han descubierto, si ya se resolvió el mecanismo y si ya se pidió la
 * pista opcional. La combinación que Andrea tiene seleccionada en los
 * cuatro mandos NO se persiste a propósito: es un intento en curso, no
 * progreso real — reabrir el mecanismo siempre empieza desde la
 * combinación neutra (`DEFAULT_SEQUENCE`), nunca desde un intento a
 * medias de una visita anterior.
 */
import { CLUES } from './mothLockData.js';

const STORAGE_KEY = 'hogwarts:mothLock';
const SCHEMA_VERSION = 1;

const VALID_CLUE_IDS = new Set(CLUES.map((clue) => clue.id));

function emptyState() {
  return { discoveredClueIds: [], solved: false, hintUsed: false };
}

function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object') return emptyState();

  const discoveredClueIds = Array.isArray(raw.discoveredClueIds)
    ? Array.from(new Set(raw.discoveredClueIds.filter((id) => typeof id === 'string' && VALID_CLUE_IDS.has(id))))
    : [];

  return {
    discoveredClueIds,
    solved: raw.solved === true,
    hintUsed: raw.hintUsed === true
  };
}

export function loadMothLockState() {
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

function saveMothLockState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: sanitizeState(state) }));
    return true;
  } catch {
    return false;
  }
}

/** Registra una pista como descubierta. Idempotente: si ya estaba, no vuelve a guardar. */
export function markClueDiscovered(clueId) {
  const current = loadMothLockState();
  if (!VALID_CLUE_IDS.has(clueId) || current.discoveredClueIds.includes(clueId)) return current;
  const next = { ...current, discoveredClueIds: [...current.discoveredClueIds, clueId] };
  saveMothLockState(next);
  return next;
}

/** Marca el mecanismo como resuelto. Idempotente, igual que `calendarEngine.markSolved`. */
export function markMothLockSolved() {
  const current = loadMothLockState();
  if (current.solved) return current;
  const next = { ...current, solved: true };
  saveMothLockState(next);
  return next;
}

/** Marca la pista opcional como ya pedida, para que siga visible al reabrir el mecanismo. */
export function markHintUsed() {
  const current = loadMothLockState();
  if (current.hintUsed) return current;
  const next = { ...current, hintUsed: true };
  saveMothLockState(next);
  return next;
}
