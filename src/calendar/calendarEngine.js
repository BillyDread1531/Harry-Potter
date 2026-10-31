/**
 * Lógica de dominio de los quince expedientes: disponibilidad por
 * fecha, y los estados de acertijo/regalo. Todo puro y sin DOM —
 * recibe la fecha de referencia y el progreso guardado como
 * parámetros, nunca lee el reloj del sistema ni `localStorage`
 * directamente, así se puede probar con `node:test` sin levantar un
 * navegador.
 *
 * Los contenidos de los acertijos NO viven aquí todavía: esta fase
 * solo construye el motor de fechas y estados. El texto del acertijo
 * y su validación llegan en la fase siguiente.
 */
import { guatemalaMidnightUTC, guatemalaWallTimeToUTC, isValidInstant } from './guatemalaTime.js';

export const CALENDAR_YEAR = 2026;
export const CALENDAR_MONTH = 11; // noviembre
export const FIRST_DAY = 1;
export const LAST_DAY = 15;

// El último día tiene un desbloqueo especial: no a medianoche como los
// demás, sino a las 20:00 hora de Guatemala — la hora prevista para la
// experiencia final. Se mantiene como el único caso especial, sin
// convertir esto en un sistema general de horarios por día.
const FINAL_DAY_UNLOCK_HOUR = 20;

export function getExpedienteDays() {
  return Array.from({ length: LAST_DAY - FIRST_DAY + 1 }, (_, i) => FIRST_DAY + i);
}

export function isValidDay(day) {
  return Number.isInteger(day) && day >= FIRST_DAY && day <= LAST_DAY;
}

export function createExpedienteId(day) {
  return `expediente-${String(day).padStart(2, '0')}`;
}

const DAY_FROM_ID = new Map(getExpedienteDays().map((day) => [createExpedienteId(day), day]));

export function getDayFromId(id) {
  return DAY_FROM_ID.get(id);
}

/**
 * Instante (UTC) en el que se desbloquea un día concreto: medianoche
 * de ese día de noviembre, en la hora de Guatemala — salvo el último
 * día, que se desbloquea a las 20:00 de Guatemala en vez de medianoche.
 */
export function getUnlockInstant(day) {
  if (!isValidDay(day)) return null;
  if (day === LAST_DAY) {
    return guatemalaWallTimeToUTC(CALENDAR_YEAR, CALENDAR_MONTH, day, FINAL_DAY_UNLOCK_HOUR, 0, 0);
  }
  return guatemalaMidnightUTC(CALENDAR_YEAR, CALENDAR_MONTH, day);
}

/**
 * ¿Está disponible un día dado un instante de referencia? El instante
 * se recibe como parámetro (nunca `new Date()` implícito en el
 * dominio) para que la disponibilidad sea 100% determinista en las
 * pruebas. Una fecha de referencia inválida nunca desbloquea nada.
 */
export function isDayAvailable(day, referenceInstant) {
  const unlockInstant = getUnlockInstant(day);
  if (!unlockInstant || !isValidInstant(referenceInstant)) return false;
  return referenceInstant.getTime() >= unlockInstant.getTime();
}

function emptyEntry() {
  return { solved: false };
}

function getEntry(progress, id) {
  const entry = progress?.[id];
  if (!entry || typeof entry !== 'object') return emptyEntry();
  return {
    solved: entry.solved === true
  };
}

/**
 * Estado completo y derivado de un expediente: disponibilidad (del
 * instante), más lo que haya en el progreso guardado (acertijo).
 * `unlockInstant` se calcula siempre a partir del día — nunca se
 * guarda como dato aparte, para no duplicar lo que ya es calculable.
 * El regalo físico no tiene estado propio: resolver el acertijo ES la
 * señal de que ya corresponde entregarlo, no hay un segundo paso que
 * registrar.
 */
export function getExpedienteState(day, { referenceInstant, progress } = {}) {
  if (!isValidDay(day)) return null;
  const id = createExpedienteId(day);
  const entry = getEntry(progress, id);
  return {
    id,
    day,
    unlockInstant: getUnlockInstant(day),
    isAvailable: isDayAvailable(day, referenceInstant),
    solved: entry.solved
  };
}

/**
 * El estado de los quince expedientes, en orden, para un instante de
 * referencia y un progreso guardado dados.
 */
export function getCalendarState({ referenceInstant, progress } = {}) {
  return getExpedienteDays().map((day) => getExpedienteState(day, { referenceInstant, progress }));
}

/**
 * Marca un acertijo como resuelto — y, con él, el regalo de ese día
 * como correspondido: no hay un segundo gesto que registrar aparte.
 * Si el día está bloqueado (o `day`/el progreso no son válidos), no
 * hace nada y devuelve el MISMO objeto de progreso que recibió (misma
 * referencia), para que sea trivial comprobar en una prueba que de
 * verdad no cambió nada.
 */
export function markSolved(progress, day, referenceInstant) {
  if (!isValidDay(day) || !isDayAvailable(day, referenceInstant)) return progress;
  const id = createExpedienteId(day);
  const current = getEntry(progress, id);
  if (current.solved) return progress; // ya estaba resuelto: nada que cambiar
  return { ...progress, [id]: { ...current, solved: true } };
}
