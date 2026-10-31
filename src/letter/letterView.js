/**
 * Marcado del contenido que entra en el panel de lectura compartido
 * (`components/readingPanel.js`). Funciones puras: texto -> HTML, así
 * se pueden probar con `node:test` sin DOM, igual que
 * `calendarView.createDetailMarkup`.
 */
import { LETTER_PARAGRAPHS, INSTRUCTIONS_ITEMS } from './letterContent.js';

export function createLetterBodyMarkup() {
  const paragraphs = LETTER_PARAGRAPHS.map((text) => `<p>${text}</p>`).join('');
  return `
    <div class="letter-sheet">
      <p class="letter-sheet__salutation">Querida Andrea,</p>
      ${paragraphs}
      <button type="button" class="letter-sheet__finish" data-letter-finish>
        Terminar de leer
      </button>
    </div>
  `;
}

export function createInstructionsBodyMarkup() {
  const items = INSTRUCTIONS_ITEMS.map(
    (item) => `
      <li class="instructions-sheet__item">
        <p class="instructions-sheet__item-title">${item.title}</p>
        <p class="instructions-sheet__item-body">${item.body}</p>
      </li>
    `
  ).join('');
  return `
    <div class="instructions-sheet">
      <h3 class="instructions-sheet__heading">Instrucciones de la aventura</h3>
      <ul class="instructions-sheet__list">${items}</ul>
    </div>
  `;
}
