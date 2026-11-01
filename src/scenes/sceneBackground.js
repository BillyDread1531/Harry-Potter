const MOBILE_QUERY = '(max-width: 640px)';

/**
 * Capa de fondo fotográfico de una escena, con selección responsive
 * (composición horizontal en escritorio, vertical en móvil) y respaldo
 * silencioso al arte provisional cuando el recurso todavía no existe.
 * No es específico del vestíbulo: cualquier escena puede usarlo pasando
 * sus propias rutas de escritorio/móvil.
 */
export function createSceneBackgroundMarkup({ depth = -3 } = {}) {
  return `
    <img
      class="scene-photo"
      data-scene-photo
      data-depth="${depth}"
      alt=""
      aria-hidden="true"
      loading="eager"
      fetchpriority="high"
    />
  `;
}

/**
 * Monta el fondo fotográfico de una escena. Acepta un `AbortSignal`
 * opcional (`{ signal }`): quien llama debe pasar uno ligado al ciclo
 * de vida de la escena y abortarlo cuando esta se desmonte. Eso quita,
 * de una sola vez, el listener de `change` del `matchMedia` y los de
 * `load`/`error` de la imagen — sin eso, cada visita a una escena con
 * foto dejaba un listener vivo para siempre (la fuga que corrige esta
 * fase), porque el `MediaQueryList` no es parte del árbol del DOM y no
 * se limpia solo cuando `stageEl.innerHTML` se reemplaza.
 */
export function mountSceneBackground(root, { desktopSrc, mobileSrc }, { signal } = {}) {
  const imgEl = root.querySelector('[data-scene-photo]');
  if (!imgEl) return;
  if (signal?.aborted) return;

  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  const listenerOptions = signal ? { signal } : undefined;
  let currentSrc = null;

  imgEl.addEventListener(
    'load',
    () => {
      root.classList.add('has-photo-background');
      root.classList.remove('is-photo-missing');
    },
    listenerOptions
  );

  imgEl.addEventListener(
    'error',
    () => {
      root.classList.remove('has-photo-background');
      root.classList.add('is-photo-missing');
    },
    listenerOptions
  );

  function applyBestSource() {
    const targetSrc = mobileQuery.matches ? mobileSrc : desktopSrc;
    if (targetSrc === currentSrc) return;
    currentSrc = targetSrc;
    // Se asigna directo, sin comprobar antes con una petición HEAD aparte:
    // esa comprobación previa duplicaba la espera (una ida y vuelta de
    // red solo para confirmar que existe, y luego otra para traerla de
    // verdad). El propio `<img>` ya informa si falla, vía el listener
    // `error` de arriba.
    imgEl.src = targetSrc;
  }

  mobileQuery.addEventListener('change', applyBestSource, listenerOptions);
  applyBestSource();
}
