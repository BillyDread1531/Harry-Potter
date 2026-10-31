/**
 * Persistencia del progreso del calendario en `localStorage`, con
 * clave propia y esquema versionado.
 *
 * Importante: aquí NUNCA se guarda la disponibilidad por fecha (eso se
 * recalcula siempre a partir del instante de referencia, ver
 * `calendarEngine.js`). Solo se guarda lo que de verdad es estado
 * propio del progreso: si cada acertijo está resuelto. El regalo
 * físico no tiene un estado aparte que guardar — resolver el
 * acertijo ya corresponde a entregarlo.
 */
import { getExpedienteDays, createExpedienteId } from './calendarEngine.js';

const STORAGE_KEY = 'hogwarts:calendarProgress';
const SCHEMA_VERSION = 1;

const VALID_IDS = new Set(getExpedienteDays().map(createExpedienteId));

function emptyProgress() {
  return {};
}

/**
 * Filtra cualquier dato recibido (de `localStorage`, o de una versión
 * de esquema futura cuyo formato no conocemos) para quedarnos
 * únicamente con entradas de los quince expedientes reales, con tipos
 * correctos. Cualquier otra cosa se ignora en silencio: un id
 * desconocido o un tipo inválido no debe romper nada.
 */
function sanitizeEntries(rawEntries) {
  const clean = {};
  if (!rawEntries || typeof rawEntries !== 'object') return clean;

  for (const [id, value] of Object.entries(rawEntries)) {
    if (!VALID_IDS.has(id)) continue;
    if (!value || typeof value !== 'object') continue;
    clean[id] = {
      solved: value.solved === true
    };
  }

  return clean;
}

/**
 * Carga el progreso guardado. Nunca lanza: ante almacenamiento vacío,
 * JSON corrupto, un esquema que este código no reconoce, o
 * `localStorage` inaccesible (modo privado, política del navegador,
 * cuota excedida, etc.), devuelve progreso vacío en vez de reventar la
 * sesión.
 */
export function loadProgress() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return emptyProgress();
  }

  if (!raw) return emptyProgress();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyProgress();
  }

  if (!parsed || typeof parsed !== 'object' || typeof parsed.version !== 'number') {
    return emptyProgress();
  }

  if (parsed.version > SCHEMA_VERSION) {
    // Una versión de esquema más nueva que esta build no conoce. No la
    // interpretamos (no sabemos su forma) y, sobre todo, no la
    // sobrescribimos: si el visitante vuelve con una versión más
    // reciente del sitio, sus datos siguen intactos en el storage.
    return emptyProgress();
  }

  // parsed.version <= SCHEMA_VERSION: hoy solo existe la versión 1, así
  // que esto cubre tanto el caso actual como el de versiones antiguas
  // ya retiradas (ninguna todavía, pero el chequeo queda listo).
  return sanitizeEntries(parsed.entries);
}

/**
 * Guarda el progreso. Devuelve `true`/`false` según si se pudo guardar
 * de verdad, para que quien llama pueda avisar de forma discreta si no
 * — nunca lanza, nunca impide que la sesión siga funcionando.
 */
export function saveProgress(entries) {
  try {
    const payload = JSON.stringify({ version: SCHEMA_VERSION, entries: sanitizeEntries(entries) });
    localStorage.setItem(STORAGE_KEY, payload);
    return true;
  } catch {
    return false;
  }
}
