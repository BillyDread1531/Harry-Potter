/**
 * Persistencia de «Las runas», en su propia clave de `localStorage` —
 * igual criterio defensivo que el resto de `games/*Storage.js`. Más
 * simple que las otras tres: no hay pistas que descubrir, solo si ya
 * se recordó la secuencia correcta.
 */
const STORAGE_KEY = 'hogwarts:runes';
const SCHEMA_VERSION = 1;

function emptyState() {
  return { solved: false };
}

function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object') return emptyState();
  return { solved: raw.solved === true };
}

export function loadRunesState() {
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

export function markRunesSolved() {
  const current = loadRunesState();
  if (current.solved) return current;
  const next = { solved: true };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: next }));
  } catch {
    // Igual que el resto de `games/*Storage.js`: si no se puede
    // guardar, la sesión sigue funcionando igual, solo sin persistir.
  }
  return next;
}
