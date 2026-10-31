/**
 * Qué días de progreso disparan un cambio ambiental PERSISTENTE y
 * concreto en el castillo (no decorativo al azar, ver
 * `ambient/occasionalEvents.js` para eso). Centralizado aquí, en vez
 * de repartir números de día sueltos por los archivos de cada escena,
 * para que el umbral de cada suceso tenga un único lugar de verdad y
 * se pueda probar sin DOM. Deliberadamente pocos sucesos, repartidos
 * a lo largo de los quince días en vez de uno por expediente.
 *
 * Todas las funciones son puras: reciben el mismo Set de días
 * resueltos que ya produce `calendar/discoveries.getSolvedDays`, así
 * que recargar la página con el mismo progreso siempre devuelve el
 * mismo resultado.
 */

/** Día 4 (fin del Acto I): la polilla plateada se deja ver por primera
 * vez, posada en la Biblioteca — el chapter de ese día ya la menciona. */
export function isMothVisibleInBiblioteca(solvedDays) {
  return Boolean(solvedDays?.has(4));
}

/** Día 13 (inicio del Acto IV): la polilla reaparece en la Sala de los
 * Menesteres, reforzando que el símbolo se repite entre escenas. */
export function isMothVisibleInSala(solvedDays) {
  return Boolean(solvedDays?.has(13));
}

/** Día 12 (Reliquias de la Muerte): el cofre del Archivo reacciona con
 * un brillo más intenso en su cerradura, coherente con el capítulo de
 * ese día ("todo este recorrido fue construido... para ti"). */
export function isArchiveChestAwake(solvedDays) {
  return Boolean(solvedDays?.has(12));
}

/** Acto IV (día 13 en adelante): la Sala de los Menesteres puede, muy
 * de vez en cuando, dejar ver un presagio excepcional (no la aparición
 * fija de la polilla, que ya existe desde antes) — nunca antes de este
 * punto de la historia, para que se sienta como una señal de que algo
 * se acerca, no como una animación decorativa cualquiera. */
export function isExceptionalMothOmenReady(solvedDays) {
  return Boolean(solvedDays?.has(13));
}
