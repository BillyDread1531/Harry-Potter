/**
 * Vista e interacción de «El catálogo imposible»: tres hotspots de
 * pista y un hotspot de estante que abre el panel de elección, dentro
 * de la escena de la Biblioteca. Mismo patrón que `games/mothLockView.js`
 * (`.hotspot`/`.map-hotspot` para los puntos, `magicReveal` para cada
 * pista, `readingPanel` para el panel grande), pero la interacción
 * central es distinta: aquí se ELIGE un libro de una cuadrícula, no se
 * ordenan símbolos en mandos.
 */
import { mountReadingPanel, createReadingPanelMarkup } from '../components/readingPanel.js';
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import { BOOKS, CLUES, isCorrectBook, getCatalogPhase, PHASE_LABELS, VICTORY_TEXT } from './catalogData.js';
import { loadCatalogState, markCatalogClueDiscovered, markCatalogSolved } from './catalogStorage.js';

// Posiciones `mobile`: parte de la misma cuadrícula 4×3 rediseñada
// para toda la Biblioteca (ver el comentario en `scenes/bibliotecaScene.js`).
const CLUE_POSITIONS = {
  material: { desktop: { x: 18, y: 58 }, mobile: { x: 62, y: 76 } },
  color: { desktop: { x: 82, y: 58 }, mobile: { x: 85, y: 76 } },
  posicion: { desktop: { x: 50, y: 80 }, mobile: { x: 15, y: 92 } }
};

const SHELF_POSITION = { desktop: { x: 50, y: 30 }, mobile: { x: 38, y: 92 } };

export function createCatalogMarkup() {
  const clueHotspots = CLUES.map(
    (clue) => `
      <button
        type="button"
        class="hotspot hotspot--mystery map-hotspot"
        style="${hotspotPositionStyle(CLUE_POSITIONS[clue.id].desktop, CLUE_POSITIONS[clue.id].mobile)}"
        data-catalog-clue="${clue.id}"
        aria-label="${clue.label}"
      >
        <span class="hotspot__glow" aria-hidden="true"></span>
        <span class="hotspot__caption" aria-hidden="true">Examinar</span>
      </button>
    `
  ).join('');

  const shelfHotspot = `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot mini-game-hotspot"
      style="${hotspotPositionStyle(SHELF_POSITION.desktop, SHELF_POSITION.mobile)}"
      data-catalog-shelf
      aria-label="Un estante con ocho libros casi idénticos"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">El catálogo</span>
    </button>
  `;

  return clueHotspots + shelfHotspot + createReadingPanelMarkup();
}

function createClueListMarkup(discoveredClueIds) {
  const discovered = CLUES.filter((clue) => discoveredClueIds.includes(clue.id));
  if (!discovered.length) {
    return '<p class="mini-game-panel__clues-empty">Todavía no has encontrado ninguna pista. Explora la biblioteca.</p>';
  }
  const items = discovered.map((clue) => `<li class="mini-game-panel__clue">${clue.text}</li>`).join('');
  return `<ul class="mini-game-panel__clues-list">${items}</ul>`;
}

function createBookOptionsMarkup({ disabled = false } = {}) {
  const options = BOOKS.map(
    (book) => `
      <button
        type="button"
        class="mini-game-option"
        data-catalog-book="${book.id}"
        ${disabled ? 'disabled' : ''}
      >${book.label}</button>
    `
  ).join('');
  return `<div class="mini-game-options" data-catalog-options>${options}</div>`;
}

export function createCatalogPanelMarkup(state, { feedback = null, justSolved = false } = {}) {
  const phase = getCatalogPhase(state);
  const feedbackMarkup = feedback
    ? `<p class="mini-game-panel__feedback mini-game-panel__feedback--${feedback.type}">${feedback.message}</p>`
    : '';

  const interactiveMarkup = state.solved ? '' : createBookOptionsMarkup();

  const victoryMarkup = state.solved
    ? `
      <div class="mini-game-panel__victory${justSolved ? ' mini-game-panel__victory--event' : ''}">
        <p class="mini-game-panel__victory-tag">El libro correcto</p>
        <p class="mini-game-panel__victory-text">${VICTORY_TEXT}</p>
      </div>
    `
    : '';

  return `
    <div class="mini-game-panel">
      <p class="mini-game-panel__eyebrow">El catálogo imposible</p>
      <h3 class="mini-game-panel__heading">Ocho libros casi idénticos</h3>
      <p class="mini-game-panel__intro">Tres lugares de la Biblioteca guardan un verso cada uno. Léelos los tres y sabrás, sin dudar, cuál de los ocho libros es el verdadero.</p>
      <p class="mini-game-panel__phase">Estado: <strong>${PHASE_LABELS[phase]}</strong> (${state.discoveredClueIds.length} de ${CLUES.length} pistas encontradas)</p>

      <div class="mini-game-panel__clues">
        <h4 class="mini-game-panel__clues-heading">Pistas descubiertas</h4>
        ${createClueListMarkup(state.discoveredClueIds)}
      </div>

      ${victoryMarkup}
      ${feedbackMarkup}
      ${interactiveMarkup}
    </div>
  `;
}

export function mountCatalogGame(panelEl, { signal, reveal, onSolved } = {}) {
  if (!panelEl || !reveal) return;

  const reading = mountReadingPanel(panelEl, { signal });
  const shelfHotspot = panelEl.querySelector('[data-catalog-shelf]');

  let justSolvedThisMount = false;

  function refreshClueHotspot(hotspotEl, clue, discovered) {
    const captionEl = hotspotEl.querySelector('.hotspot__caption');
    if (captionEl) captionEl.textContent = discovered ? 'Volver a leer' : 'Examinar';
    hotspotEl.setAttribute('aria-label', discovered ? `${clue.label} (ya leída, toca para volver a leerla)` : clue.label);
  }

  function refreshShelfHotspot(solved) {
    if (!shelfHotspot) return;
    shelfHotspot.classList.toggle('mini-game-hotspot--solved', solved);
    const captionEl = shelfHotspot.querySelector('.hotspot__caption');
    if (captionEl) captionEl.textContent = solved ? 'Libro encontrado' : 'El catálogo';
    shelfHotspot.setAttribute(
      'aria-label',
      solved ? 'Ya encontraste el libro correcto. Toca para volver a verlo.' : 'Un estante con ocho libros casi idénticos'
    );
  }

  panelEl.querySelectorAll('[data-catalog-clue]').forEach((hotspotEl) => {
    const clueId = hotspotEl.dataset.catalogClue;
    const clue = CLUES.find((c) => c.id === clueId);
    if (!clue) return;
    const alreadyDiscovered = loadCatalogState().discoveredClueIds.includes(clue.id);
    refreshClueHotspot(hotspotEl, clue, alreadyDiscovered);

    hotspotEl.addEventListener(
      'click',
      () => {
        markCatalogClueDiscovered(clue.id);
        reveal.open(clue.text, { triggerEl: hotspotEl });
        refreshClueHotspot(hotspotEl, clue, true);
      },
      { signal }
    );
  });

  refreshShelfHotspot(loadCatalogState().solved);

  function wirePanelContent(bodyEl) {
    bodyEl.querySelectorAll('[data-catalog-book]').forEach((bookButton) => {
      bookButton.addEventListener(
        'click',
        () => {
          const bookId = bookButton.dataset.catalogBook;
          if (isCorrectBook(bookId)) {
            markCatalogSolved();
            justSolvedThisMount = true;
            refreshShelfHotspot(true);
            onSolved?.();
            openPanel({});
          } else {
            openPanel({
              feedback: {
                type: 'incorrect',
                message: 'No. Este libro no es el que buscas — algo en él no encaja con lo que ya sabes.'
              }
            });
          }
        },
        { signal }
      );
    });
  }

  function openPanel({ feedback = null } = {}) {
    const state = loadCatalogState();
    reading.open(createCatalogPanelMarkup(state, { feedback, justSolved: justSolvedThisMount }), {
      triggerEl: shelfHotspot
    });
    justSolvedThisMount = false;
    if (reading.bodyEl) wirePanelContent(reading.bodyEl);
  }

  shelfHotspot?.addEventListener('click', () => openPanel({}), { signal });
}
