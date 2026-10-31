import { getTransitionMarkup } from './variants.js';

const COVER_MS = 650;
const REVEAL_MS = 700;
const REDUCED_MS = 160;

/**
 * Orquesta el cambio de escena en dos fases: "cover" (la transición
 * cubre por completo la pantalla) y "reveal" (se abre para mostrar la
 * nueva escena). El intercambio real del DOM ocurre entre ambas fases,
 * mientras el overlay oculta la pantalla, así que nunca se ve un corte
 * instantáneo de contenido.
 */
export function createTransitionManager(overlayEl) {
  let isRunning = false;

  async function run(variant, swap) {
    if (isRunning) {
      swap();
      return;
    }
    isRunning = true;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coverMs = reduced ? REDUCED_MS : COVER_MS;
    const revealMs = reduced ? REDUCED_MS : REVEAL_MS;
    const effectiveVariant = reduced ? 'fade-dust' : variant;

    overlayEl.dataset.variant = effectiveVariant;
    overlayEl.innerHTML = getTransitionMarkup(effectiveVariant);
    overlayEl.style.setProperty('--cover-duration', `${coverMs}ms`);
    overlayEl.style.setProperty('--reveal-duration', `${revealMs}ms`);

    overlayEl.classList.add('is-active');
    // Fuerza reflow para que la siguiente clase dispare su animación.
    void overlayEl.offsetHeight;
    overlayEl.classList.add('is-covering');

    await wait(coverMs);

    swap();

    overlayEl.classList.remove('is-covering');
    overlayEl.classList.add('is-revealing');

    await wait(revealMs);

    overlayEl.classList.remove('is-active', 'is-revealing');
    overlayEl.innerHTML = '';
    delete overlayEl.dataset.variant;
    isRunning = false;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return {
    run,
    get isRunning() {
      return isRunning;
    }
  };
}
