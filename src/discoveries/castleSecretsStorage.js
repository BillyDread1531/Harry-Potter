/**
 * Persistencia de los descubrimientos opcionales del castillo (el
 * libro de la Biblioteca, haber hablado con el retrato del Archivo, el
 * hallazgo coleccionable del Mapa, y —desde «Los habitantes invisibles
 * de Hogwarts»— los dos pasos del recorrido secreto de la polilla), en
 * una clave propia de `localStorage` — nunca `hogwarts:calendarProgress`,
 * `hogwarts:cardsCollected` ni `hogwarts:mothLock`. Mismo criterio
 * defensivo que el resto del proyecto: nunca lanza, ignora datos
 * corruptos o desconocidos en silencio, y una versión de esquema
 * futura no se interpreta ni se sobrescribe.
 *
 * Todas son banderas independientes y deliberadamente simples: cada
 * una solo registra SI algo ya ocurrió, nunca CUÁNDO ni con qué
 * progreso — el contenido que depende del progreso real (el diálogo
 * del retrato, el desbloqueo por fecha de los expedientes) se sigue
 * derivando siempre de `calendarStorage`, nunca se duplica aquí.
 *
 * Cada fase ha ido añadiendo banderas nuevas (más recientemente,
 * `coldDraftFeltLibrary`/`coldDraftFeltMap`/`coldDraftResolved`, para
 * el misterio ambiental de «El castillo tiene sus propias reglas») sin
 * subir `SCHEMA_VERSION`: un estado guardado por una fase anterior
 * simplemente no tiene las claves más nuevas todavía, y `sanitizeState`
 * ya las trata como "false" por defecto — ninguna versión antigua se
 * interpreta mal ni se pierde.
 */
const STORAGE_KEY = 'hogwarts:castleSecrets';
const SCHEMA_VERSION = 1;

function emptyState() {
  return {
    bookDiscovered: false,
    portraitMet: false,
    collectibleFound: false,
    mothWingNoticed: false,
    threeMarksRecognized: false,
    coldDraftFeltLibrary: false,
    coldDraftFeltMap: false,
    coldDraftResolved: false
  };
}

function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object') return emptyState();
  return {
    bookDiscovered: raw.bookDiscovered === true,
    portraitMet: raw.portraitMet === true,
    collectibleFound: raw.collectibleFound === true,
    mothWingNoticed: raw.mothWingNoticed === true,
    threeMarksRecognized: raw.threeMarksRecognized === true,
    coldDraftFeltLibrary: raw.coldDraftFeltLibrary === true,
    coldDraftFeltMap: raw.coldDraftFeltMap === true,
    coldDraftResolved: raw.coldDraftResolved === true
  };
}

export function loadCastleSecretsState() {
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

function saveCastleSecretsState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state: sanitizeState(state) }));
    return true;
  } catch {
    return false;
  }
}

function markFlag(flagName) {
  const current = loadCastleSecretsState();
  if (current[flagName]) return current;
  const next = { ...current, [flagName]: true };
  saveCastleSecretsState(next);
  return next;
}

export function markBookDiscovered() {
  return markFlag('bookDiscovered');
}

export function markPortraitMet() {
  return markFlag('portraitMet');
}

export function markCollectibleFound() {
  return markFlag('collectibleFound');
}

export function markMothWingNoticed() {
  return markFlag('mothWingNoticed');
}

export function markThreeMarksRecognized() {
  return markFlag('threeMarksRecognized');
}

export function markColdDraftFeltLibrary() {
  return markFlag('coldDraftFeltLibrary');
}

export function markColdDraftFeltMap() {
  return markFlag('coldDraftFeltMap');
}

export function markColdDraftResolved() {
  return markFlag('coldDraftResolved');
}
