/**
 * Notificación mínima y explícita de que el progreso guardado cambió
 * de verdad (un acertijo resuelto o un cromo encontrado), para que una
 * escena que sigue abierta en ese momento pueda refrescar lo que
 * depende de ese progreso sin temporizadores propios ni recargar la
 * página.
 *
 * Deliberadamente NO usa `document` como bus (eso acoplaría cualquier
 * emisor/receptor a tener un DOM real disponible, y es justo lo que
 * hace que el resto del proyecto no se pueda probar con `node:test`
 * sin instalar algo nuevo). En vez de eso, usa un `EventTarget` propio
 * — una clase global de la plataforma, disponible tanto en el
 * navegador como en Node sin ninguna librería — así este módulo se
 * puede probar exactamente igual que cualquier otro.
 *
 * `onProgressChanged` se desuscribe a través del mismo `AbortSignal`
 * que ya limpia el resto de cada escena (Fase 0): nunca hay que
 * recordar quitar el listener a mano, y nunca se duplica al volver a
 * montar la misma escena, porque cada montaje usa su propio
 * `AbortController`.
 */
const PROGRESS_CHANGED_EVENT = 'progress-changed';

const progressEventTarget = new EventTarget();

/**
 * `detail` es informativo (p. ej. `{ type: 'riddle-solved', day: 3 }`
 * o `{ type: 'card-collected', id: 'mcgonagall' }`); quien escucha no
 * necesita confiar en él — siempre puede volver a leer el progreso real
 * desde `calendarStorage`/`cardsStorage`, que es la única fuente de
 * verdad.
 */
export function emitProgressChanged(detail) {
  progressEventTarget.dispatchEvent(new CustomEvent(PROGRESS_CHANGED_EVENT, { detail }));
}

export function onProgressChanged(handler, { signal } = {}) {
  progressEventTarget.addEventListener(PROGRESS_CHANGED_EVENT, handler, { signal });
}
