/**
 * Vista e interacción de «Las runas»: un único hotspot que abre un
 * panel con dos modos — revelar la secuencia (texto, a ritmo propio,
 * nunca una animación cronometrada) y adivinarla tocando runas en
 * orden. A diferencia de los otros cuatro minijuegos, NO incluye su
 * propio `createReadingPanelMarkup()`: la Sala de los Menesteres ya
 * monta uno para «la cerradura de la polilla»
 * (`games/mothLockView.js`), y un segundo panel duplicado dejaría un
 * elemento huérfano en el DOM. `mountRunesGame` recibe esa misma
 * instancia ya montada (`reading`), igual que `games/sealView.js` en
 * el Archivo.
 */
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import { RUNES, SEQUENCE_LENGTH, TARGET_SEQUENCE, isSequenceCorrect, VICTORY_TEXT } from './runesData.js';
import { createRuneSymbolMarkup } from './runeSymbols.js';
import { loadRunesState, markRunesSolved } from './runesStorage.js';

const HOTSPOT_POSITION = { desktop: { x: 50, y: 91 }, mobile: { x: 50, y: 91 } };

export function createRunesMarkup() {
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot mini-game-hotspot"
      style="${hotspotPositionStyle(HOTSPOT_POSITION.desktop, HOTSPOT_POSITION.mobile)}"
      data-runes-hotspot
      aria-label="Cuatro runas talladas en la pared, apagadas, esperando un orden"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Las runas</span>
    </button>
  `;
}

function createSequenceRevealMarkup() {
  const ordered = TARGET_SEQUENCE.map((id, index) => `${index + 1}. ${RUNES.find((rune) => rune.id === id).label}`).join(
    ' · '
  );
  return `
    <p class="rune-sequence-text">${ordered}</p>
    <div class="mini-game-panel__actions">
      <button type="button" class="btn-arcane" data-runes-hide>Ocultar y empezar a adivinar</button>
    </div>
  `;
}

function createPickedTrailMarkup(picked) {
  const slots = Array.from(
    { length: SEQUENCE_LENGTH },
    (_, index) => `<div class="rune-picked-trail__slot">${picked[index] ? createRuneSymbolMarkup(picked[index]) : ''}</div>`
  ).join('');
  return `<div class="rune-picked-trail" aria-hidden="true">${slots}</div>`;
}

function createRuneGridMarkup() {
  const buttons = RUNES.map(
    (rune) => `
      <button type="button" class="rune-button" data-rune-pick="${rune.id}" aria-label="${rune.label}">
        ${createRuneSymbolMarkup(rune.id)}
        <span class="rune-button__label">${rune.label}</span>
      </button>
    `
  ).join('');
  return `<div class="rune-grid">${buttons}</div>`;
}

export function createRunesPanelMarkup(
  state,
  { mode = 'guessing', picked = [], feedback = null, justSolved = false } = {}
) {
  const feedbackMarkup = feedback
    ? `<p class="mini-game-panel__feedback mini-game-panel__feedback--${feedback.type}">${feedback.message}</p>`
    : '';

  const victoryMarkup = state.solved
    ? `
      <div class="mini-game-panel__victory${justSolved ? ' mini-game-panel__victory--event' : ''}">
        <p class="mini-game-panel__victory-tag">Las runas se apagan</p>
        <p class="mini-game-panel__victory-text">${VICTORY_TEXT}</p>
      </div>
    `
    : '';

  const interactiveMarkup = state.solved
    ? ''
    : mode === 'revealing'
      ? createSequenceRevealMarkup()
      : `
        ${createPickedTrailMarkup(picked)}
        ${feedbackMarkup}
        ${createRuneGridMarkup()}
        <div class="mini-game-panel__actions">
          <button type="button" class="btn-arcane btn-arcane--ghost" data-runes-reveal>Ver la secuencia</button>
          <button type="button" class="btn-arcane btn-arcane--ghost" data-runes-reset>Reiniciar intento</button>
        </div>
      `;

  return `
    <div class="mini-game-panel">
      <p class="mini-game-panel__eyebrow">Las runas</p>
      <h3 class="mini-game-panel__heading">Cuatro runas, un orden que recordar</h3>
      <p class="mini-game-panel__intro">Mira la secuencia con calma, sin prisa. Ocúltala cuando estés lista y repítela tocando las runas en el mismo orden.</p>
      ${victoryMarkup}
      ${interactiveMarkup}
    </div>
  `;
}

export function mountRunesGame(panelEl, { signal, reveal, reading, onSolved } = {}) {
  if (!panelEl || !reveal || !reading) return;

  const hotspot = panelEl.querySelector('[data-runes-hotspot]');
  let justSolvedThisMount = false;

  function refreshHotspot(solved) {
    if (!hotspot) return;
    hotspot.classList.toggle('mini-game-hotspot--solved', solved);
    const captionEl = hotspot.querySelector('.hotspot__caption');
    if (captionEl) captionEl.textContent = solved ? 'Runas apagadas' : 'Las runas';
    hotspot.setAttribute(
      'aria-label',
      solved
        ? 'Las runas ya están apagadas. Toca para volver a verlas.'
        : 'Cuatro runas talladas en la pared, apagadas, esperando un orden'
    );
  }
  refreshHotspot(loadRunesState().solved);

  function wirePanelContent(bodyEl, picked) {
    bodyEl.querySelector('[data-runes-hide]')?.addEventListener('click', () => openPanel({ mode: 'guessing', picked }), {
      signal
    });
    bodyEl
      .querySelector('[data-runes-reveal]')
      ?.addEventListener('click', () => openPanel({ mode: 'revealing', picked }), { signal });
    bodyEl
      .querySelector('[data-runes-reset]')
      ?.addEventListener('click', () => openPanel({ mode: 'guessing', picked: [] }), { signal });

    bodyEl.querySelectorAll('[data-rune-pick]').forEach((buttonEl) => {
      buttonEl.addEventListener(
        'click',
        () => {
          const nextPicked = [...picked, buttonEl.dataset.runePick];
          if (nextPicked.length < SEQUENCE_LENGTH) {
            openPanel({ mode: 'guessing', picked: nextPicked });
            return;
          }
          if (isSequenceCorrect(nextPicked)) {
            markRunesSolved();
            justSolvedThisMount = true;
            refreshHotspot(true);
            onSolved?.();
            openPanel({});
          } else {
            openPanel({
              mode: 'guessing',
              picked: [],
              feedback: { type: 'incorrect', message: 'Ese no era el orden. Las runas vuelven a esperar.' }
            });
          }
        },
        { signal }
      );
    });
  }

  function openPanel({ mode = 'guessing', picked = [], feedback = null } = {}) {
    const state = loadRunesState();
    reading.open(createRunesPanelMarkup(state, { mode, picked, feedback, justSolved: justSolvedThisMount }), {
      triggerEl: hotspot
    });
    justSolvedThisMount = false;
    if (reading.bodyEl) wirePanelContent(reading.bodyEl, picked);
  }

  hotspot?.addEventListener('click', () => openPanel({}), { signal });
}
