/**
 * Apariciones ambientales ocasionales y discretas: una sombra que
 * cruza, una luz que fluctúa, una ráfaga de polvo mágico. No están
 * ligadas al progreso (ver `calendar/castleEvents.js` para eso) — dan
 * vida al castillo en cualquier momento, con un intervalo largo e
 * irregular para que nunca se sientan como un bucle. Respeta
 * `prefers-reduced-motion`: con esa preferencia, no se programa nada
 * (la escena se queda igual de bien en su estado estático).
 */

const DEFAULT_MIN_DELAY_MS = 25000;
const DEFAULT_MAX_DELAY_MS = 65000;

/**
 * Elige un efecto al azar. Recibe la función aleatoria como parámetro
 * (`Math.random` por defecto) para poder probar esto de forma
 * determinista sin depender de temporizadores ni del DOM.
 */
export function pickRandomEffect(effects, random = Math.random) {
  if (!effects?.length) return null;
  const index = Math.floor(random() * effects.length);
  return effects[Math.min(index, effects.length - 1)];
}

/**
 * Programa apariciones repetidas dentro de `panelEl` mientras `signal`
 * no se aborte. Cada `effect` es una función `(panelEl, track) => void`
 * que aplica un cambio visual transitorio; debe envolver cualquier
 * `setTimeout` propio (para quitar su propia clase) con `track(...)`,
 * así el programador puede cancelarlos todos de una vez si la escena
 * se desmonta a mitad de una animación.
 */
export function scheduleOccasionalEvents(
  panelEl,
  effects,
  { signal, minDelayMs = DEFAULT_MIN_DELAY_MS, maxDelayMs = DEFAULT_MAX_DELAY_MS, random = Math.random } = {}
) {
  if (!panelEl || !effects?.length) return;
  if (signal?.aborted) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pendingTimeouts = new Set();
  function track(timeoutId) {
    pendingTimeouts.add(timeoutId);
    return timeoutId;
  }

  function scheduleNext() {
    const delay = minDelayMs + random() * (maxDelayMs - minDelayMs);
    track(
      setTimeout(() => {
        if (signal?.aborted) return;
        const effect = pickRandomEffect(effects, random);
        effect?.(panelEl, track);
        scheduleNext();
      }, delay)
    );
  }

  scheduleNext();
  signal?.addEventListener('abort', () => {
    pendingTimeouts.forEach(clearTimeout);
    pendingTimeouts.clear();
  });
}

/** Una sombra breve y difusa cruza la escena, de lado a lado. */
export function triggerShadowPass(panelEl, track) {
  const shadowEl = panelEl.querySelector('[data-scene-shadow]');
  if (!shadowEl) return;
  shadowEl.classList.add('scene-frame__shadow-pass--active');
  track(setTimeout(() => shadowEl.classList.remove('scene-frame__shadow-pass--active'), 2700));
}

/** Las luces de la escena fluctúan un instante, como con una corriente de aire. */
export function triggerLightFlicker(panelEl, track) {
  const vignetteEl = panelEl.querySelector('.scene-frame__vignette');
  if (!vignetteEl) return;
  vignetteEl.classList.add('scene-frame__vignette--flicker');
  track(setTimeout(() => vignetteEl.classList.remove('scene-frame__vignette--flicker'), 950));
}

/** Una ráfaga breve de polvo/motas mágicas se intensifica y se apaga. */
export function triggerDustBurst(panelEl, track) {
  const sparklesEl = panelEl.querySelector('[data-scene-sparkles]');
  if (!sparklesEl) return;
  sparklesEl.classList.add('scene-frame__sparkles--burst');
  track(setTimeout(() => sparklesEl.classList.remove('scene-frame__sparkles--burst'), 1900));
}

export const DEFAULT_AMBIENT_EFFECTS = [triggerShadowPass, triggerLightFlicker, triggerDustBurst];
