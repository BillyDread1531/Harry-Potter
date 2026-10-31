/**
 * Vista e interacción de «La cerradura de la polilla»: tres puntos de
 * exploración (pistas) y un mecanismo central con cuatro posiciones,
 * todo dentro de la escena de la Sala de los Menesteres. Reutiliza por
 * completo los patrones ya existentes del proyecto — `.hotspot`/
 * `.map-hotspot` para los puntos interactivos, `magicReveal` para el
 * texto breve de cada pista, `readingPanel` para el panel más grande
 * del mecanismo — en vez de inventar componentes nuevos.
 *
 * Igual que `calendar/calendarView.js`, el panel del mecanismo se
 * vuelve a dibujar entero (`reading.open` reemplaza su HTML por
 * completo) cada vez que algo cambia de verdad (comprobar, reiniciar,
 * pedir la pista): así nunca quedan listeners duplicados de una
 * apertura a otra, sin necesidad de un sistema de estado aparte.
 *
 * NO incluye su propio `createReadingPanelMarkup()`: desde que la
 * Sala de los Menesteres también tiene «las runas»
 * (`games/runesView.js`), el panel de lectura se monta una sola vez
 * en `scenes/desafiosScene.js` y ambos minijuegos reciben esa misma
 * instancia (`reading`) ya montada, para no dejar un segundo panel
 * huérfano en el DOM.
 */
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import {
  SYMBOLS,
  CLUES,
  SEQUENCE_LENGTH,
  DEFAULT_SEQUENCE,
  SOLUTION_SEQUENCE,
  OPTIONAL_HINT_TEXT,
  VICTORY_TEXT,
  isSequenceCorrect,
  getMothLockPhase,
  PHASE_LABELS
} from './mothLockData.js';
import { createMothLockSymbolMarkup } from './mothLockSymbols.js';
import { loadMothLockState, markClueDiscovered, markMothLockSolved, markHintUsed } from './mothLockStorage.js';

// Posiciones `mobile` rediseñadas en conjunto (como ya se hizo para el
// Vestíbulo y el Mapa): en pantallas angostas `.scene-frame__content`
// (título + descripción) cubre más de la mitad superior de la escena,
// así que las seis posiciones interactivas de esta sala (mecanismo +
// tres pistas + el hotspot ambiental de la sala + la corriente fría)
// se reparten ahora en una cuadrícula 3×2 por debajo de ese panel,
// con ≥20% de separación entre cualquier par — el mismo mínimo que ya
// evita que los halos táctiles se fundan entre sí en otras escenas.
// Posiciones `mobile`: cuadrícula 3×3 compartida con el resto de la
// Sala de los Menesteres (ambiental, corriente fría, y ahora también
// «las runas», ver `games/runesView.js`) — ampliada de 3×2 a 3×3 al
// añadir ese quinto minijuego.
const CLUE_POSITIONS = {
  'pluma-final': { desktop: { x: 20, y: 64 }, mobile: { x: 18, y: 65 } },
  'llave-antes-luna': { desktop: { x: 80, y: 60 }, mobile: { x: 82, y: 65 } },
  'vela-tras-llave': { desktop: { x: 50, y: 82 }, mobile: { x: 18, y: 78 } }
};

const MECHANISM_POSITION = { desktop: { x: 50, y: 26 }, mobile: { x: 50, y: 65 } };

/** Marcado estático (hotspots + contenedor del panel). No depende del estado: cada hotspot se etiqueta correctamente al montar y al reaccionar a clics, nunca aquí. */
export function createMothLockMarkup() {
  const clueHotspots = CLUES.map(
    (clue) => `
      <button
        type="button"
        class="hotspot hotspot--mystery map-hotspot"
        style="${hotspotPositionStyle(CLUE_POSITIONS[clue.id].desktop, CLUE_POSITIONS[clue.id].mobile)}"
        data-moth-clue="${clue.id}"
        aria-label="${clue.label}"
      >
        <span class="hotspot__glow" aria-hidden="true"></span>
        <span class="hotspot__caption" aria-hidden="true">Examinar</span>
      </button>
    `
  ).join('');

  const mechanismHotspot = `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot moth-lock-hotspot"
      style="${hotspotPositionStyle(MECHANISM_POSITION.desktop, MECHANISM_POSITION.mobile)}"
      data-moth-mechanism
      aria-label="Una cerradura antigua, con cuatro posiciones para símbolos mágicos"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">La cerradura</span>
    </button>
  `;

  return clueHotspots + mechanismHotspot;
}

function createClueListMarkup(discoveredClueIds) {
  const discovered = CLUES.filter((clue) => discoveredClueIds.includes(clue.id));
  if (!discovered.length) {
    return '<p class="moth-lock-panel__clues-empty">Todavía no has encontrado ninguna inscripción. Explora la sala.</p>';
  }
  const items = discovered.map((clue) => `<li class="moth-lock-panel__clue">${clue.text}</li>`).join('');
  return `<ul class="moth-lock-panel__clues-list">${items}</ul>`;
}

function createDialMarkup(index, selectedId, { disabled = false } = {}) {
  const options = SYMBOLS.map(
    (symbol) => `<option value="${symbol.id}"${symbol.id === selectedId ? ' selected' : ''}>${symbol.label}</option>`
  ).join('');

  return `
    <div class="moth-lock-dial">
      <div class="moth-lock-dial__preview" data-moth-position-preview="${index}" aria-hidden="true">
        ${createMothLockSymbolMarkup(selectedId)}
      </div>
      <label class="moth-lock-dial__label" for="moth-lock-position-${index}">Posición ${index + 1}</label>
      <select
        class="moth-lock-dial__select"
        id="moth-lock-position-${index}"
        data-moth-position="${index}"
        ${disabled ? 'disabled aria-label="Secuencia ya encontrada, de solo consulta"' : ''}
      >
        ${options}
      </select>
    </div>
  `;
}

/**
 * Contenido del panel del mecanismo. `selection` es el intento en
 * curso (nunca persistido); `feedback`/`justSolved`/`hintVisible`
 * controlan la retroalimentación efímera del último clic. Función
 * pura (estado real + estado efímero → HTML), igual que
 * `calendarView.createDetailMarkup`.
 */
export function createMothLockPanelMarkup(
  state,
  { selection = DEFAULT_SEQUENCE, feedback = null, justSolved = false, hintVisible = false } = {}
) {
  const phase = getMothLockPhase(state);
  const feedbackMarkup = feedback
    ? `<p class="moth-lock-panel__feedback moth-lock-panel__feedback--${feedback.type}">${feedback.message}</p>`
    : '';
  const hintMarkup = hintVisible
    ? `<p class="moth-lock-panel__hint">${OPTIONAL_HINT_TEXT}</p>`
    : '';

  const interactiveMarkup = state.solved
    ? `
      <div class="moth-lock-panel__solution" aria-label="Secuencia que abrió la cerradura">
        ${SOLUTION_SEQUENCE.map((symbolId, index) => createDialMarkup(index, symbolId, { disabled: true })).join('')}
      </div>
    `
    : `
      <form class="moth-lock-panel__form" data-moth-lock-form novalidate>
        <div class="moth-lock-panel__dials">
          ${selection.map((symbolId, index) => createDialMarkup(index, symbolId)).join('')}
        </div>
        ${feedbackMarkup}
        <div class="moth-lock-panel__actions">
          <button type="submit" class="btn-arcane" data-moth-lock-submit>Comprobar combinación</button>
          <button type="button" class="btn-arcane btn-arcane--ghost" data-moth-lock-reset>Reiniciar</button>
          <button type="button" class="btn-arcane btn-arcane--ghost" data-moth-lock-hint>Pedir una pista</button>
        </div>
        ${hintMarkup}
      </form>
    `;

  const victoryMarkup = state.solved
    ? `
      <div class="moth-lock-panel__victory${justSolved ? ' moth-lock-panel__victory--event' : ''}">
        <p class="moth-lock-panel__victory-tag">El mecanismo se abre</p>
        <p class="moth-lock-panel__victory-text">${VICTORY_TEXT}</p>
      </div>
    `
    : '';

  return `
    <div class="moth-lock-panel">
      <p class="moth-lock-panel__eyebrow">La cerradura de la polilla</p>
      <h3 class="moth-lock-panel__heading">Un mecanismo con cuatro símbolos</h3>
      <p class="mini-game-panel__intro">Busca las tres inscripciones escondidas por la sala — cada una es un verso con una regla. Reúnelas las tres y el orden correcto se vuelve evidente.</p>
      <p class="moth-lock-panel__phase">Estado: <strong>${PHASE_LABELS[phase]}</strong> (${state.discoveredClueIds.length} de ${CLUES.length} inscripciones encontradas)</p>

      <div class="moth-lock-panel__clues">
        <h4 class="moth-lock-panel__clues-heading">Inscripciones descubiertas</h4>
        ${createClueListMarkup(state.discoveredClueIds)}
      </div>

      ${victoryMarkup}
      ${interactiveMarkup}
    </div>
  `;
}

/**
 * Cablea los hotspots de pista, el hotspot del mecanismo y el panel
 * (reabriéndolo entero en cada acción, igual que `calendarView.js`).
 * `reveal` es la instancia de `magicReveal` que ya monta la propia
 * escena (reutilizada, no una segunda); `onSolved` es un callback
 * opcional para que la escena reaccione visualmente (p. ej. el mismo
 * pulso de castillo que ya usa `calendarView.pulseCastle`).
 */
export function mountMothLockGame(panelEl, { signal, reveal, reading, onSolved } = {}) {
  if (!panelEl || !reveal || !reading) return;

  const mechanismHotspot = panelEl.querySelector('[data-moth-mechanism]');

  let justSolvedThisMount = false;

  function refreshClueHotspot(hotspotEl, clue, discovered) {
    const captionEl = hotspotEl.querySelector('.hotspot__caption');
    if (captionEl) captionEl.textContent = discovered ? 'Volver a leer' : 'Examinar';
    hotspotEl.setAttribute('aria-label', discovered ? `${clue.label} (ya leída, toca para volver a leerla)` : clue.label);
  }

  function refreshMechanismHotspot(solved) {
    if (!mechanismHotspot) return;
    mechanismHotspot.classList.toggle('moth-lock-hotspot--solved', solved);
    const captionEl = mechanismHotspot.querySelector('.hotspot__caption');
    if (captionEl) captionEl.textContent = solved ? 'Cerradura abierta' : 'La cerradura';
    mechanismHotspot.setAttribute(
      'aria-label',
      solved ? 'La cerradura ya está abierta. Toca para volver a verla.' : 'Una cerradura antigua, con cuatro posiciones para símbolos mágicos'
    );
  }

  panelEl.querySelectorAll('[data-moth-clue]').forEach((hotspotEl) => {
    const clueId = hotspotEl.dataset.mothClue;
    const clue = CLUES.find((c) => c.id === clueId);
    if (!clue) return;
    const alreadyDiscovered = loadMothLockState().discoveredClueIds.includes(clue.id);
    refreshClueHotspot(hotspotEl, clue, alreadyDiscovered);

    hotspotEl.addEventListener(
      'click',
      () => {
        markClueDiscovered(clue.id);
        reveal.open(clue.text, { triggerEl: hotspotEl });
        refreshClueHotspot(hotspotEl, clue, true);
      },
      { signal }
    );
  });

  refreshMechanismHotspot(loadMothLockState().solved);

  function readSelection(bodyEl) {
    const selection = Array.from({ length: SEQUENCE_LENGTH }, () => DEFAULT_SEQUENCE[0]);
    bodyEl.querySelectorAll('[data-moth-position]').forEach((selectEl) => {
      selection[Number(selectEl.dataset.mothPosition)] = selectEl.value;
    });
    return selection;
  }

  function wirePanelContent(bodyEl) {
    bodyEl.querySelectorAll('[data-moth-position]').forEach((selectEl) => {
      selectEl.addEventListener(
        'change',
        () => {
          const index = Number(selectEl.dataset.mothPosition);
          const previewEl = bodyEl.querySelector(`[data-moth-position-preview="${index}"]`);
          if (previewEl) previewEl.innerHTML = createMothLockSymbolMarkup(selectEl.value);
        },
        { signal }
      );
    });

    bodyEl.querySelector('[data-moth-lock-form]')?.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        const currentSelection = readSelection(bodyEl);
        if (isSequenceCorrect(currentSelection)) {
          markMothLockSolved();
          justSolvedThisMount = true;
          refreshMechanismHotspot(true);
          onSolved?.();
          openPanel({ selection: currentSelection });
        } else {
          openPanel({
            selection: currentSelection,
            feedback: {
              type: 'incorrect',
              message: 'El mecanismo no reconoce esta combinación. Algo, en algún punto, no encaja.'
            }
          });
        }
      },
      { signal }
    );

    bodyEl.querySelector('[data-moth-lock-reset]')?.addEventListener('click', () => openPanel({}), { signal });

    bodyEl.querySelector('[data-moth-lock-hint]')?.addEventListener(
      'click',
      () => {
        markHintUsed();
        openPanel({ selection: readSelection(bodyEl), hintVisible: true });
      },
      { signal }
    );
  }

  function openPanel({ selection = DEFAULT_SEQUENCE, feedback = null, hintVisible = null } = {}) {
    const state = loadMothLockState();
    const resolvedHintVisible = hintVisible ?? state.hintUsed;
    reading.open(
      createMothLockPanelMarkup(state, {
        selection,
        feedback,
        justSolved: justSolvedThisMount,
        hintVisible: resolvedHintVisible
      }),
      { triggerEl: mechanismHotspot }
    );
    justSolvedThisMount = false;
    if (reading.bodyEl) wirePanelContent(reading.bodyEl);
  }

  mechanismHotspot?.addEventListener('click', () => openPanel({}), { signal });
}
