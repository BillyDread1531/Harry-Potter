/**
 * El mensaje personal en primera persona, reconstruido a partir de
 * `riddle.fragment` (ver `riddlesData.js`) — deliberadamente separado
 * de los capítulos narrativos (`riddle.chapter`), que ya se muestran
 * en `calendarView.createDetailMarkup` al resolver cada expediente.
 * Este módulo nunca inventa texto: cada fragmento es exactamente el
 * que ya existe y está aprobado; esto solo decide CÓMO presentarlos
 * juntos, en orden, con huecos donde todavía falta algo por resolver.
 *
 * Fuente de verdad: el mismo `calendarState` que ya produce
 * `calendarEngine.getCalendarState` (progreso real guardado). No se
 * crea ningún almacenamiento nuevo — un fragmento está "ganado" si y
 * solo si `state.solved` lo dice, exactamente el mismo criterio que ya
 * usa `getEarnedFragments`.
 */
import { RIDDLES } from './riddlesData.js';
import { escapeHtml } from '../utils/escapeHtml.js';

const GAP = '···';

/**
 * Los quince fragmentos, en orden de día, cada uno con si ya se ganó
 * o no. A diferencia de `getEarnedFragments` (que solo devuelve los
 * textos ya ganados), esto conserva el lugar de los que faltan, para
 * poder dibujar el mensaje completo con huecos en vez de una lista
 * de fragmentos sueltos.
 */
export function getFragmentsWithStatus(calendarState) {
  const solvedDays = new Set((calendarState ?? []).filter((state) => state.solved).map((state) => state.day));
  return RIDDLES.slice()
    .sort((a, b) => a.day - b.day)
    .map((riddle) => ({ day: riddle.day, fragment: riddle.fragment, earned: solvedDays.has(riddle.day) }));
}

/**
 * Marcado del panel de lectura (`components/readingPanel.js`) para el
 * mensaje personal. Función pura: estado del calendario -> HTML, igual
 * que `letterView.createLetterBodyMarkup`, para poder probarla con
 * `node:test` sin DOM.
 */
export function createPersonalMessageBodyMarkup(calendarState) {
  const items = getFragmentsWithStatus(calendarState);
  const earnedCount = items.filter((item) => item.earned).length;

  if (earnedCount === 0) {
    return `
      <div class="personal-message">
        <p class="personal-message__eyebrow">Un mensaje aparte</p>
        <p class="personal-message__empty">Todavía no hay nada que leer aquí. Cada expediente que resuelvas añadirá una palabra más a algo que no pertenece del todo a la historia del castillo.</p>
      </div>
    `;
  }

  const spans = items
    .map((item) =>
      item.earned
        ? `<span class="personal-message__piece">${escapeHtml(item.fragment)}</span>`
        : `<span class="personal-message__gap">${GAP}</span>`
    )
    .join(' ');

  return `
    <div class="personal-message">
      <p class="personal-message__eyebrow">Un mensaje aparte</p>
      <p class="personal-message__hint">${earnedCount} de ${items.length} fragmentos encontrados.</p>
      <p class="personal-message__text">${spans}</p>
    </div>
  `;
}
