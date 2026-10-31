/**
 * Decide qué debe hacer el router ante una petición de navegación
 * (clic en un hotspot o cambio de hash, incluido el que disparan los
 * botones atrás/adelante del navegador), dado el estado actual del
 * gestor de transiciones.
 *
 * Es una función pura sin DOM a propósito: el router la usa tal cual
 * en `renderCurrentSection`, no es una maqueta aparte, así que probarla
 * con `node:test` cubre la regla real que evita que dos transiciones
 * intenten modificar el DOM a la vez.
 *
 * - Si ya hay una transición en curso, nunca se inicia una segunda:
 *   se encola el destino más reciente (`queue`) y, cuando la transición
 *   vigente termine, el router decide si hace falta ir a ese destino.
 * - Si no hay transición en curso y el destino pedido ya es el actual,
 *   no hay nada que hacer (`noop`).
 * - En cualquier otro caso, se puede iniciar la transición (`transition`).
 */
export function resolveNavigationIntent({ requestedId, currentId, isTransitionRunning }) {
  if (isTransitionRunning) {
    return { action: 'queue' };
  }
  if (requestedId === currentId) {
    return { action: 'noop' };
  }
  return { action: 'transition' };
}
