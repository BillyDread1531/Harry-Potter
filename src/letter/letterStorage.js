/**
 * Persistencia mínima de la carta de bienvenida: solo distingue
 * "todavía no leída" de "leída". Clave propia de `localStorage`,
 * versionada, totalmente separada del progreso de los expedientes
 * (`calendarStorage.js`) y de los cromos (`cardsStorage.js`) — ni
 * comparte clave ni se deriva de esos otros estados. Mismo criterio
 * defensivo que el resto del proyecto: nunca lanza, y una versión de
 * esquema futura no se interpreta ni se sobrescribe.
 */
const STORAGE_KEY = 'hogwarts:welcomeLetter';
const SCHEMA_VERSION = 1;

export function isLetterRead() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }

  if (!parsed || typeof parsed !== 'object' || typeof parsed.version !== 'number') return false;
  if (parsed.version > SCHEMA_VERSION) return false;

  return parsed.read === true;
}

/**
 * Marca la carta como leída de verdad (solo se llama al terminar de
 * leerla, nunca al cerrarla a medias). Devuelve si se pudo guardar.
 */
export function markLetterRead() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, read: true }));
    return true;
  } catch {
    return false;
  }
}
