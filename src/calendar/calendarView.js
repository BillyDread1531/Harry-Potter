/**
 * Integración visual del calendario dentro de la escena de
 * Expedientes: una cuadrícula de los quince días y una ficha por día
 * con su acertijo y un campo para responder. No hay pistas
 * progresivas (se quitaron a propósito: la dificultad es parte de la
 * experiencia). No es una escena nueva ni una ruta nueva: vive dentro
 * del panel de contenido que ya existe en `expedientesScene.js`.
 */
import { createIconMarkup } from '../components/icons.js';
import { createCalendarStore } from './calendarStore.js';
import { getRiddleForDay } from './riddlesData.js';
import { getGuatemalaDateParts, GUATEMALA_TIME_ZONE } from './guatemalaTime.js';
import { emitProgressChanged } from '../utils/progressEvents.js';

const MONTH_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

function formatGuatemalaDateLabel(instant) {
  if (!instant) return '';
  const { month, day, hour, minute } = getGuatemalaDateParts(instant);
  const dateLabel = `${day} de ${MONTH_LABELS[month - 1]}`;
  // La mayoría de los días desbloquean a medianoche, así que basta con
  // la fecha. El último día desbloquea a una hora concreta (20:00): ahí
  // sí hace falta decirlo, para no confundir a quien lo intente apenas
  // empiece el día.
  if (hour === 0 && minute === 0) return dateLabel;
  const period = hour < 12 ? 'a. m.' : 'p. m.';
  const hour12 = ((hour + 11) % 12) + 1;
  return `${dateLabel} a las ${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

export function createCalendarMarkup() {
  return `
    <div class="expedientes-calendar" data-calendar-root>
      <h3 class="expedientes-calendar__heading">Los quince expedientes</h3>
      <p class="expedientes-calendar__hint">
        Cada expediente se desbloquea a medianoche, hora de Guatemala.
      </p>
      <ul class="expedientes-calendar__grid" data-calendar-grid role="list" aria-label="Expedientes del 1 al 15 de noviembre"></ul>
      <div class="expedientes-calendar__detail" data-calendar-detail hidden tabindex="-1"></div>
    </div>
  `;
}

function createTileMarkup(state) {
  const { day, isAvailable, solved, unlockInstant } = state;

  if (!isAvailable) {
    const dateLabel = formatGuatemalaDateLabel(unlockInstant);
    return `
      <li class="calendar-tile calendar-tile--locked">
        <button
          type="button"
          class="calendar-tile__button"
          disabled
          aria-label="Expediente ${day}, bloqueado hasta el ${dateLabel}"
        >
          <span class="calendar-tile__day">${day}</span>
          <span class="calendar-tile__icon" aria-hidden="true">${createIconMarkup('lock')}</span>
          <span class="calendar-tile__status">Bloqueado hasta el ${dateLabel}</span>
        </button>
      </li>
    `;
  }

  const stateClass = solved ? 'calendar-tile--solved' : 'calendar-tile--available';
  const statusText = solved ? 'Resuelto' : 'Disponible';

  return `
    <li class="calendar-tile ${stateClass}">
      <button
        type="button"
        class="calendar-tile__button"
        data-open-day="${day}"
        aria-label="Expediente ${day}, ${statusText.toLowerCase()}"
      >
        <span class="calendar-tile__day">${day}</span>
        <span class="calendar-tile__icon" aria-hidden="true">${createIconMarkup(solved ? 'check' : 'scroll')}</span>
        <span class="calendar-tile__status">${statusText}</span>
      </button>
    </li>
  `;
}

/**
 * Marcado de la ficha de un día disponible. Función pura (estado +
 * acertijo + retroalimentación efímera → HTML) a propósito: así se
 * puede probar con `node:test`, sin DOM, que la respuesta canónica y
 * la explicación interna NUNCA aparecen en el texto devuelto mientras
 * el acertijo sigue sin resolver. `plannedGift` nunca se interpola
 * aquí: es solo para un futuro mecanismo administrativo.
 */
export function createDetailMarkup(dayState, riddle, { feedback = null, justSolved = false } = {}) {
  if (!dayState || !riddle) return '';

  const { day, solved } = dayState;

  const bodyMarkup = riddle.body
    .split('\n\n')
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join('');

  const feedbackMarkup = feedback
    ? `<p class="expedientes-riddle__feedback expedientes-riddle__feedback--${feedback.type}">${feedback.message}</p>`
    : '';

  const formOrSolvedMarkup = solved
    ? `<p class="expedientes-riddle__solved-note">Ya encontraste la respuesta a este expediente.</p>`
    : `
      <form class="expedientes-riddle__form" data-answer-form novalidate>
        <label class="expedientes-riddle__label" for="riddle-answer-${day}">Tu respuesta</label>
        <div class="expedientes-riddle__row">
          <input
            type="text"
            id="riddle-answer-${day}"
            class="expedientes-riddle__input"
            data-answer-input
            autocomplete="off"
            aria-describedby="riddle-feedback-${day}"
          />
          <button type="submit" class="btn-arcane expedientes-riddle__submit">Enviar</button>
        </div>
      </form>
    `;

  // La explicación, la referencia a la película y el capítulo narrativo
  // solo se muestran una vez resuelto: antes de eso serían pistas
  // adicionales no pedidas (y en más de un caso, el propio texto de la
  // explicación nombra el objeto sin rodeos). `justSolved` solo es
  // true en el primer render inmediatamente después de acertar: activa
  // la animación de acierto una única vez, no cada vez que se reabre
  // un expediente ya resuelto.
  const revealMarkup = solved
    ? `
      <div class="expedientes-riddle__reveal${justSolved ? ' expedientes-riddle__reveal--event' : ''}" data-tone="${riddle.reactionTone ?? 'gold'}">
        <p class="expedientes-riddle__chapter">${riddle.chapter}</p>
        <p class="expedientes-riddle__explanation">${riddle.explanation}</p>
        <p class="expedientes-riddle__film-reference">${riddle.filmReference}</p>
      </div>
    `
    : '';

  return `
    <button type="button" class="expedientes-calendar__back" data-close-detail>
      <span aria-hidden="true">‹</span> Volver a los expedientes
    </button>
    <p class="eyebrow">Expediente ${day}</p>
    <h4 class="expedientes-calendar__case-label">${riddle.caseLabel}</h4>
    ${solved ? '<p class="expedientes-riddle__solved-note expedientes-riddle__solved-note--tag">Resuelto</p>' : ''}
    <div class="expedientes-riddle__body">${bodyMarkup}</div>
    <div id="riddle-feedback-${day}">${feedbackMarkup}</div>
    ${formOrSolvedMarkup}
    ${revealMarkup}
  `;
}

function buildFeedback(result, riddle) {
  if (result.status === 'empty') {
    return { type: 'empty', message: 'Escribe una respuesta antes de enviarla.' };
  }
  if (result.status === 'correct') {
    return { type: 'correct', message: riddle.reactions.correct };
  }
  return { type: 'incorrect', message: riddle.reactions.incorrect };
}

/**
 * Monta el calendario dentro de `rootEl` (el nodo que devolvió
 * `createCalendarMarkup`). Acepta el mismo `AbortSignal` que ya usa el
 * resto de la escena (`sceneBackground.js`, `creature.js`): al
 * abortarlo se detiene el refresco periódico que revela el paso de
 * medianoche sin tener que recargar la página.
 */
export function mountCalendar(rootEl, { signal, now = () => new Date() } = {}) {
  if (!rootEl) return;

  const gridEl = rootEl.querySelector('[data-calendar-grid]');
  const detailEl = rootEl.querySelector('[data-calendar-detail]');
  const sceneFrameEl = rootEl.closest('.scene-frame');
  const store = createCalendarStore();

  let openDay = null;
  let feedback = null;
  let lastFocusedTileDay = null;
  let pulseTimeoutId = null;

  // El castillo reacciona brevemente (una viñeta que se ilumina) cada
  // vez que se acierta un expediente — el mismo elemento compartido por
  // toda la escena, no uno nuevo por día, para no multiplicar DOM ni
  // animaciones. Respeta `prefers-reduced-motion` desde el propio CSS.
  function pulseCastle() {
    if (!sceneFrameEl) return;
    clearTimeout(pulseTimeoutId);
    sceneFrameEl.classList.remove('scene-frame--riddle-pulse');
    // Fuerza un reflow para poder reiniciar la animación si ya estaba
    // activa (acertar dos expedientes en rápida sucesión).
    void sceneFrameEl.offsetWidth;
    sceneFrameEl.classList.add('scene-frame--riddle-pulse');
    pulseTimeoutId = setTimeout(() => sceneFrameEl.classList.remove('scene-frame--riddle-pulse'), 1200);
  }

  function getDayState(day) {
    return store.getState(now()).find((entry) => entry.day === day) ?? null;
  }

  function renderGrid() {
    const state = store.getState(now());
    gridEl.innerHTML = state.map(createTileMarkup).join('');
    gridEl.querySelectorAll('[data-open-day]').forEach((button) => {
      button.addEventListener('click', () => openDetail(Number(button.dataset.openDay)));
    });
  }

  function renderDetail({ focusInput = false, justSolved = false } = {}) {
    const dayState = getDayState(openDay);
    const riddle = getRiddleForDay(openDay);
    if (!dayState || !riddle) return;

    detailEl.innerHTML = createDetailMarkup(dayState, riddle, { feedback, justSolved });

    detailEl.querySelector('[data-close-detail]')?.addEventListener('click', closeDetail);

    const form = detailEl.querySelector('[data-answer-form]');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('[data-answer-input]');
      const result = store.submitAnswer(openDay, input.value, now());
      feedback = buildFeedback(result, riddle);
      const wasSolved = result.status === 'correct';
      renderDetail({ focusInput: !wasSolved, justSolved: wasSolved });
      if (wasSolved) {
        renderGrid();
        pulseCastle();
        // Notifica a quien esté escuchando (p. ej. el hotspot de un
        // cromo que depende de este mismo día) que el progreso real
        // cambió — sin que tengan que sondear nada por su cuenta.
        emitProgressChanged({ type: 'riddle-solved', day: openDay });
      }
    });

    if (focusInput) {
      detailEl.querySelector('[data-answer-input]')?.focus();
    }
  }

  function openDetail(day) {
    const dayState = getDayState(day);
    if (!dayState || !dayState.isAvailable) return; // defensa: nunca abrir un día bloqueado

    lastFocusedTileDay = day;
    openDay = day;
    feedback = null;

    renderDetail();
    detailEl.hidden = false;
    gridEl.hidden = true;
    detailEl.focus();
  }

  function closeDetail() {
    detailEl.hidden = true;
    gridEl.hidden = false;
    detailEl.innerHTML = '';
    openDay = null;
    const tileButton = gridEl.querySelector(`[data-open-day="${lastFocusedTileDay}"]`);
    tileButton?.focus();
  }

  renderGrid();

  // Revisa cada minuto si cambió la disponibilidad (paso de medianoche
  // de Guatemala, o las 20:00 del último día) sin exigir que se
  // recargue la página. Un minuto es un margen más que aceptable para
  // una pestaña en primer plano. No refresca la cuadrícula mientras
  // hay una ficha abierta, para no interrumpir a quien está escribiendo
  // una respuesta.
  const intervalId = setInterval(() => {
    if (detailEl.hidden) renderGrid();
  }, 60000);

  // El intervalo de arriba no basta por sí solo: los navegadores pausan
  // o espacian mucho los temporizadores de una pestaña en segundo
  // plano, así que si alguien deja la pestaña oculta mientras cruza la
  // medianoche de Guatemala, el intervalo podría no haber disparado
  // ni una vez para cuando vuelve a mirarla. `visibilitychange` cubre
  // exactamente ese caso: en el instante en que la pestaña vuelve a
  // ser visible, se revisa la disponibilidad de inmediato, sin esperar
  // al siguiente tick del intervalo. Solo actúa en la transición hacia
  // "visible" (nunca al ocultarse) y respeta el mismo criterio que el
  // intervalo (no interrumpir una ficha abierta).
  function handleVisibilityChange() {
    if (document.visibilityState !== 'visible') return;
    if (detailEl.hidden) renderGrid();
  }
  document.addEventListener('visibilitychange', handleVisibilityChange, { signal });

  signal?.addEventListener('abort', () => {
    clearInterval(intervalId);
    clearTimeout(pulseTimeoutId);
  });
}
