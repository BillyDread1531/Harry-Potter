/**
 * Marcado de la lista de hallazgos ya desbloqueados. Función pura
 * (lista de secretos -> HTML), igual que `calendarView.createDetailMarkup`:
 * así se puede probar con `node:test`, sin DOM, que nunca se muestra
 * un secreto cuyo día no está resuelto. Usa `<details>` nativo para la
 * revelación progresiva, sin necesitar manejadores de clic propios.
 *
 * Cada entrada admite `body` (un único párrafo, el caso de siempre) o
 * `bodyParagraphs` (un array, para una historia completa ya armada a
 * partir de varios fragmentos — ver `discoveries/completedStoriesContent.js`);
 * son mutuamente excluyentes. `icon` es opcional (por defecto 'scroll').
 */
import { createIconMarkup } from '../components/icons.js';

function createDiscoveryBodyMarkup(secret) {
  if (Array.isArray(secret.bodyParagraphs)) {
    return secret.bodyParagraphs.map((paragraph) => `<p class="discovery-list__body">${paragraph}</p>`).join('');
  }
  return `<p class="discovery-list__body">${secret.body}</p>`;
}

export function createDiscoveryListMarkup(secrets, { heading = 'Hallazgos' } = {}) {
  if (!secrets?.length) return '';

  const items = secrets
    .map(
      (secret) => `
        <li class="discovery-list__item">
          <details class="discovery-list__entry">
            <summary class="discovery-list__summary">
              <span class="discovery-list__icon" aria-hidden="true">${createIconMarkup(secret.icon ?? 'scroll')}</span>
              ${secret.label}
            </summary>
            ${createDiscoveryBodyMarkup(secret)}
          </details>
        </li>
      `
    )
    .join('');

  return `
    <div class="discovery-list" data-discovery-list>
      <h3 class="discovery-list__heading">${heading}</h3>
      <ul class="discovery-list__items">${items}</ul>
    </div>
  `;
}
