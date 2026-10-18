import { createCastleSilhouetteMarkup } from '../components/castleSilhouette.js';
import { createSigilMarkup } from '../components/sigil.js';
import { createIconMarkup } from '../components/icons.js';
import { renderCandles } from '../ambient/candles.js';

/**
 * Vestíbulo: primera pantalla. Es la única vista "terminada" de la Fase 1;
 * el resto se marca explícitamente como contenido en preparación.
 */
export function renderVestibulo({ onNavigate } = {}) {
  const html = `
    <section class="hero">
      <div class="hero__scene" data-hero-scene>
        <div class="hero__castle">${createCastleSilhouetteMarkup()}</div>
        <span class="hero__secret-sigil" data-decorative title="Algo antiguo aguarda en el castillo">
          ${createSigilMarkup()}
        </span>
      </div>

      <div class="hero__body">
        <p class="eyebrow">Fase 1 · Fundación</p>
        <h1 class="hero__title">Bienvenida al vestíbulo</h1>
        <p class="lede">
          Las antorchas ya están encendidas y el castillo sabe que te acercas.
          Todavía guarda sus historias bajo llave, pero algunos pasillos
          ya están abiertos para quien quiera explorarlos.
        </p>

        <div class="hero__actions">
          <div class="hero__cta-row">
            <button type="button" class="btn-arcane" data-goto="expedientes">
              Explorar los Expedientes
            </button>
            <button type="button" class="btn-arcane" data-goto="mapa">
              Ver el Mapa del Castillo
            </button>
          </div>

          <button type="button" class="link-discreet" data-goto="archivo">
            <span class="link-discreet__icon" aria-hidden="true">${createIconMarkup('letter')}</span>
            Carta de bienvenida e instrucciones
          </button>
        </div>
      </div>
    </section>
  `;

  function onMount(panelEl) {
    const scene = panelEl.querySelector('[data-hero-scene]');
    renderCandles(scene, { count: 3 });

    panelEl.querySelectorAll('[data-goto]').forEach((button) => {
      button.addEventListener('click', () => onNavigate?.(button.dataset.goto));
    });
  }

  return { html, onMount };
}
