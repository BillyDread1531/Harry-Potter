import { renderParticles } from '../ambient/particles.js';

/**
 * Envoltorio compartido por los cinco lugares secundarios: un fondo
 * propio de la escena, una capa de destellos que flota por encima de
 * esa foto (no detrás, como una capa de página aparte), una viñeta
 * para profundidad y una placa con el contenido (todavía en
 * preparación en esta fase). El vestíbulo no usa este componente:
 * tiene su propia composición, con su propia capa de destellos.
 */
export function createSceneFrameMarkup({
  id,
  eyebrow,
  title,
  description,
  pendingItems = [],
  backdropMarkup,
  extraContent = '',
  overlayContent = ''
}) {
  const items = pendingItems.map((item) => `<li>${item}</li>`).join('');

  return `
    <div class="scene-frame scene-frame--${id}">
      <div class="scene-frame__backdrop" aria-hidden="true">${backdropMarkup}</div>
      <div class="scene-frame__sparkles" data-scene-sparkles aria-hidden="true"></div>
      <div class="scene-frame__vignette" aria-hidden="true"></div>
      <div class="scene-frame__shadow-pass" data-scene-shadow aria-hidden="true"></div>
      ${overlayContent}
      <div class="scene-frame__content">
        <p class="eyebrow">${eyebrow}</p>
        <h2>${title}</h2>
        <div class="scene-frame__plaque">
          <p>${description}</p>
          ${items ? `<ul class="scene-frame__list">${items}</ul>` : ''}
          ${
            items
              ? `<span class="status-badge status-badge--pending" style="margin-top: var(--space-3);">
            En preparación para una fase posterior
          </span>`
              : ''
          }
        </div>
        ${extraContent}
      </div>
    </div>
  `;
}

/**
 * Monta los destellos de una escena por encima de su fondo. Todas las
 * escenas que usan `createSceneFrameMarkup` llaman a esto desde su
 * `onMount` para que el efecto se sienta consistente en todo el mundo.
 */
export function mountSceneAmbience(panelEl, { count = 12 } = {}) {
  const layer = panelEl?.querySelector('[data-scene-sparkles]');
  renderParticles(layer, { count });
}
