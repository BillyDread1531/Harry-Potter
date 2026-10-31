/**
 * Marcado de los cromos: el texto que se revela al encontrar uno
 * (reutilizado por `components/magicReveal.js`, con su propio prefijo
 * de título para distinguirlo de una revelación ambiental cualquiera),
 * y la lista de colección ya encontrada, con identidad visual propia
 * (no es una copia de `discoveriesView.createDiscoveryListMarkup`).
 */
import { CARDS } from './cardsData.js';
import { escapeHtml } from '../utils/escapeHtml.js';

// Deliberadamente sin nombrar aquí el objeto que ya es la respuesta
// aprobada del día 2: el nombre de la colección ya aparece una vez,
// en el encabezado del Archivo (`createCollectedCardsListMarkup`).
const FOUND_CARD_INTRO = 'Un cromo coleccionable, olvidado entre otras cosas.';

/** El texto completo a mostrar en el panel mágico al encontrar un cromo. */
export function createCardRevealText(card) {
  return `${FOUND_CARD_INTRO}\n\n${card.name.toUpperCase()}\n${card.blurb}`;
}

export function createCollectedCardsListMarkup(collectedCards) {
  if (!collectedCards?.length) return '';

  const items = collectedCards
    .map(
      (card) => `
        <li class="card-collection__item">
          <details class="card-collection__entry">
            <summary class="card-collection__summary">${escapeHtml(card.name)}</summary>
            <p class="card-collection__body">${escapeHtml(card.blurb)}</p>
          </details>
        </li>
      `
    )
    .join('');

  return `
    <div class="card-collection" data-card-collection>
      <h3 class="card-collection__heading">Cromos de Rana de Chocolate</h3>
      <p class="card-collection__hint">${collectedCards.length} de ${CARDS.length} encontrados.</p>
      <ul class="card-collection__items">${items}</ul>
    </div>
  `;
}
