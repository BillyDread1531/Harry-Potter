/**
 * Capa delgada con estado que une el motor de dominio (puro) con la
 * persistencia: carga una vez, expone el estado derivado y las
 * acciones válidas, y guarda después de cada cambio que de verdad
 * ocurrió. No contiene lógica de fechas, validación de respuestas ni
 * contenido de acertijos propios — eso vive en `calendarEngine.js`,
 * `riddleValidator.js` y `riddlesData.js`; aquí solo se orquesta.
 */
import { getCalendarState, markSolved } from './calendarEngine.js';
import { loadProgress, saveProgress } from './calendarStorage.js';
import { getRiddleForDay } from './riddlesData.js';
import { validateRiddleAnswer } from './riddleValidator.js';

export function createCalendarStore() {
  let entries = loadProgress();
  let lastSaveOk = true;

  function getState(referenceInstant) {
    return getCalendarState({ referenceInstant, progress: entries });
  }

  function applyChange(nextEntries) {
    if (nextEntries === entries) return lastSaveOk; // no-op real: nada que guardar
    entries = nextEntries;
    lastSaveOk = saveProgress(entries);
    return lastSaveOk;
  }

  function solve(day, referenceInstant) {
    return applyChange(markSolved(entries, day, referenceInstant));
  }

  /**
   * Evalúa una respuesta contra el acertijo de ese día y, solo si es
   * correcta, marca el expediente como resuelto (reutilizando `solve`,
   * que ya rechaza por sí solo cualquier día bloqueado). Una respuesta
   * incorrecta o vacía nunca llega a tocar el progreso.
   */
  function submitAnswer(day, rawInput, referenceInstant) {
    const riddle = getRiddleForDay(day);
    if (!riddle) return { status: 'incorrect' };

    const result = validateRiddleAnswer(rawInput, riddle);
    if (result.status === 'correct') {
      solve(day, referenceInstant);
    }
    return result;
  }

  return {
    getState,
    solve,
    submitAnswer,
    get lastSaveOk() {
      return lastSaveOk;
    }
  };
}
