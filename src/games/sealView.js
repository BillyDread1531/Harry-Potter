/**
 * Vista e interacción de «El sello correcto»: tres hotspots de pista y
 * un hotspot central que abre un panel con tres mandos — uno por cada
 * entrada del archivo, cada uno elige qué sello le corresponde.
 * Mismo patrón que `games/mothLockView.js` (mandos `<select>` dentro
 * de un panel propio), pero la pregunta es «qué sello va en esta
 * entrada», no «qué símbolo va en esta posición».
 *
 * A diferencia de los otros minijuegos, NO incluye su propio
 * `createReadingPanelMarkup()`: el Archivo ya monta uno propio para la
 * conversación del retrato (`scenes/archivoScene.js`), y un segundo
 * panel duplicado en la misma escena dejaría un elemento huérfano en
 * el DOM. `mountSealGame` recibe esa misma instancia ya montada
 * (`reading`) en vez de crear la suya.
 */
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import {
  SEALS,
  ENTRIES,
  CLUES,
  SOLUTION_ASSIGNMENT,
  isValidAssignment,
  isCorrectAssignment,
  getSealPhase,
  PHASE_LABELS,
  VICTORY_TEXT,
  COMPARTMENT_CONTENTS_TEXT
} from './sealData.js';
import { loadSealState, markSealClueDiscovered, markSealSolved, markSealContentsViewed } from './sealStorage.js';

const DEFAULT_ASSIGNMENT = Object.fromEntries(ENTRIES.map((entry, index) => [entry.id, SEALS[index % SEALS.length].id]));

// `SOLUTION_ASSIGNMENT` va de sello -> entrada (así se declara el
// acertijo en `sealData.js`); la vista necesita el sentido contrario
// (entrada -> sello) para rellenar el mando de cada entrada.
const SOLUTION_BY_ENTRY = Object.fromEntries(SEALS.map((seal) => [SOLUTION_ASSIGNMENT[seal.id], seal.id]));

// Posiciones `mobile`: parte de la cuadrícula 4×2 compartida con el
// resto de hotspots del Archivo (ver el comentario junto a
// `PORTRAIT_HOTSPOT_POSITION` en `scenes/archivoScene.js`), posible
// desde que `.scene-frame__content` tiene un tope de altura propio en
// móvil (`styles/scene.css`).
const CLUE_POSITIONS = {
  'sol-no-primera': { desktop: { x: 18, y: 58 }, mobile: { x: 62, y: 78 } },
  'estrella-no-primera': { desktop: { x: 82, y: 58 }, mobile: { x: 85, y: 78 } },
  'sol-no-ultima': { desktop: { x: 50, y: 80 }, mobile: { x: 62, y: 93 } }
};

const COMPARTMENT_POSITION = { desktop: { x: 50, y: 70 }, mobile: { x: 85, y: 93 } };

export function createSealMarkup() {
  const clueHotspots = CLUES.map(
    (clue) => `
      <button
        type="button"
        class="hotspot hotspot--mystery map-hotspot"
        style="${hotspotPositionStyle(CLUE_POSITIONS[clue.id].desktop, CLUE_POSITIONS[clue.id].mobile)}"
        data-seal-clue="${clue.id}"
        aria-label="${clue.label}"
      >
        <span class="hotspot__glow" aria-hidden="true"></span>
        <span class="hotspot__caption" aria-hidden="true">Examinar</span>
      </button>
    `
  ).join('');

  const compartmentHotspot = `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot mini-game-hotspot"
      style="${hotspotPositionStyle(COMPARTMENT_POSITION.desktop, COMPARTMENT_POSITION.mobile)}"
      data-seal-compartment
      aria-label="Un segundo compartimento, con tres sellos sueltos junto a él"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Los sellos</span>
    </button>
  `;

  return clueHotspots + compartmentHotspot;
}

function createClueListMarkup(discoveredClueIds) {
  const discovered = CLUES.filter((clue) => discoveredClueIds.includes(clue.id));
  if (!discovered.length) {
    return '<p class="mini-game-panel__clues-empty">Todavía no has encontrado ninguna pista. Explora el Archivo.</p>';
  }
  const items = discovered.map((clue) => `<li class="mini-game-panel__clue">${clue.text}</li>`).join('');
  return `<ul class="mini-game-panel__clues-list">${items}</ul>`;
}

function createEntryDialMarkup(entry, selectedSealId, { disabled = false } = {}) {
  const options = SEALS.map(
    (seal) => `<option value="${seal.id}"${seal.id === selectedSealId ? ' selected' : ''}>${seal.label}</option>`
  ).join('');
  return `
    <div class="mini-game-dial">
      <label class="mini-game-dial__label" for="seal-entry-${entry.id}">${entry.label}</label>
      <select
        class="mini-game-dial__select"
        id="seal-entry-${entry.id}"
        data-seal-entry="${entry.id}"
        ${disabled ? 'disabled aria-label="Emparejamiento ya encontrado, de solo consulta"' : ''}
      >
        ${options}
      </select>
    </div>
  `;
}

export function createSealPanelMarkup(state, { assignment = DEFAULT_ASSIGNMENT, feedback = null, justSolved = false } = {}) {
  const phase = getSealPhase(state);
  const feedbackMarkup = feedback
    ? `<p class="mini-game-panel__feedback mini-game-panel__feedback--${feedback.type}">${feedback.message}</p>`
    : '';

  const contentsMarkup = state.solved
    ? state.contentsViewed
      ? `<p class="mini-game-panel__victory-text">${COMPARTMENT_CONTENTS_TEXT}</p>`
      : `
        <div class="mini-game-panel__actions">
          <button type="button" class="btn-arcane btn-arcane--ghost" data-seal-look-inside>Mirar dentro</button>
        </div>
      `
    : '';

  const interactiveMarkup = state.solved
    ? `
      <div class="mini-game-dials">
        ${ENTRIES.map((entry) => createEntryDialMarkup(entry, SOLUTION_BY_ENTRY[entry.id], { disabled: true })).join('')}
      </div>
      ${contentsMarkup}
    `
    : `
      <form class="mini-game-panel__form" data-seal-form novalidate>
        <div class="mini-game-dials">
          ${ENTRIES.map((entry) => createEntryDialMarkup(entry, assignment[entry.id])).join('')}
        </div>
        ${feedbackMarkup}
        <div class="mini-game-panel__actions">
          <button type="submit" class="btn-arcane" data-seal-submit>Colocar los sellos</button>
        </div>
      </form>
    `;

  const victoryMarkup = state.solved
    ? `
      <div class="mini-game-panel__victory${justSolved ? ' mini-game-panel__victory--event' : ''}">
        <p class="mini-game-panel__victory-tag">Los sellos encajan</p>
        <p class="mini-game-panel__victory-text">${VICTORY_TEXT}</p>
      </div>
    `
    : '';

  return `
    <div class="mini-game-panel">
      <p class="mini-game-panel__eyebrow">El sello correcto</p>
      <h3 class="mini-game-panel__heading">Tres sellos, tres entradas</h3>
      <p class="mini-game-panel__intro">Tres versos esperan, escondidos por el Archivo. Cada uno descarta un lugar equivocado — júntalos y sabrás dónde va cada sello.</p>
      <p class="mini-game-panel__phase">Estado: <strong>${PHASE_LABELS[phase]}</strong> (${state.discoveredClueIds.length} de ${CLUES.length} pistas encontradas)</p>

      <div class="mini-game-panel__clues">
        <h4 class="mini-game-panel__clues-heading">Pistas descubiertas</h4>
        ${createClueListMarkup(state.discoveredClueIds)}
      </div>

      ${victoryMarkup}
      ${interactiveMarkup}
    </div>
  `;
}

export function mountSealGame(panelEl, { signal, reveal, reading, onSolved } = {}) {
  if (!panelEl || !reveal || !reading) return;

  const compartmentHotspot = panelEl.querySelector('[data-seal-compartment]');

  let justSolvedThisMount = false;

  function refreshClueHotspot(hotspotEl, clue, discovered) {
    const captionEl = hotspotEl.querySelector('.hotspot__caption');
    if (captionEl) captionEl.textContent = discovered ? 'Volver a leer' : 'Examinar';
    hotspotEl.setAttribute('aria-label', discovered ? `${clue.label} (ya leída, toca para volver a leerla)` : clue.label);
  }

  function refreshCompartmentHotspot(solved) {
    if (!compartmentHotspot) return;
    compartmentHotspot.classList.toggle('mini-game-hotspot--solved', solved);
    const captionEl = compartmentHotspot.querySelector('.hotspot__caption');
    if (captionEl) captionEl.textContent = solved ? 'Sellos colocados' : 'Los sellos';
    compartmentHotspot.setAttribute(
      'aria-label',
      solved ? 'Los sellos ya están en su sitio. Toca para volver a verlos.' : 'Un segundo compartimento, con tres sellos sueltos junto a él'
    );
  }

  panelEl.querySelectorAll('[data-seal-clue]').forEach((hotspotEl) => {
    const clueId = hotspotEl.dataset.sealClue;
    const clue = CLUES.find((c) => c.id === clueId);
    if (!clue) return;
    refreshClueHotspot(hotspotEl, clue, loadSealState().discoveredClueIds.includes(clue.id));

    hotspotEl.addEventListener(
      'click',
      () => {
        markSealClueDiscovered(clue.id);
        reveal.open(clue.text, { triggerEl: hotspotEl });
        refreshClueHotspot(hotspotEl, clue, true);
      },
      { signal }
    );
  });

  refreshCompartmentHotspot(loadSealState().solved);

  // Lee el formulario en el mismo sentido en que lo rellena la propia
  // vista (entrada -> sello, una `<select>` por entrada) — el inverso
  // de `SOLUTION_ASSIGNMENT` (sello -> entrada, ver `sealData.js`).
  function readAssignment(bodyEl) {
    const assignment = { ...DEFAULT_ASSIGNMENT };
    bodyEl.querySelectorAll('[data-seal-entry]').forEach((selectEl) => {
      assignment[selectEl.dataset.sealEntry] = selectEl.value;
    });
    return assignment;
  }

  // `isValidAssignment`/`isCorrectAssignment` (sealData.js) esperan el
  // sentido sello -> entrada; invierte el resultado de `readAssignment`
  // (entrada -> sello) antes de validar.
  function toSealAssignment(entryAssignment) {
    return Object.fromEntries(Object.entries(entryAssignment).map(([entryId, sealId]) => [sealId, entryId]));
  }

  function wirePanelContent(bodyEl) {
    bodyEl.querySelector('[data-seal-form]')?.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        const assignment = readAssignment(bodyEl);
        const sealAssignment = toSealAssignment(assignment);
        if (!isValidAssignment(sealAssignment)) {
          openPanel({
            assignment,
            feedback: { type: 'incorrect', message: 'Dos sellos no pueden ir en la misma entrada. Revisa tu elección.' }
          });
          return;
        }
        if (isCorrectAssignment(sealAssignment)) {
          markSealSolved();
          justSolvedThisMount = true;
          refreshCompartmentHotspot(true);
          onSolved?.();
          openPanel({});
        } else {
          openPanel({
            assignment,
            feedback: { type: 'incorrect', message: 'Ninguno de los tres encaja todavía. Algo, en algún punto, no corresponde.' }
          });
        }
      },
      { signal }
    );

    bodyEl.querySelector('[data-seal-look-inside]')?.addEventListener(
      'click',
      () => {
        markSealContentsViewed();
        openPanel({});
      },
      { signal }
    );
  }

  function openPanel({ assignment = DEFAULT_ASSIGNMENT, feedback = null } = {}) {
    const state = loadSealState();
    reading.open(createSealPanelMarkup(state, { assignment, feedback, justSolved: justSolvedThisMount }), {
      triggerEl: compartmentHotspot
    });
    justSolvedThisMount = false;
    if (reading.bodyEl) wirePanelContent(reading.bodyEl);
  }

  compartmentHotspot?.addEventListener('click', () => openPanel({}), { signal });
}
