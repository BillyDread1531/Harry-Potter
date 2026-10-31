import { assetExists } from '../utils/assetProbe.js';

/**
 * Criatura mágica reutilizable con fondo transparente: WebM con canal
 * alfa cuando existe y el visitante no pidió movimiento reducido, PNG
 * estático como respaldo, y oculta por completo si no hay ningún
 * recurso disponible todavía. Nunca reproduce audio (el <video> va
 * siempre silenciado) ni se autoreproduce fuera de esta capa decorativa.
 */
export function createCreatureMarkup({ id, label, depth } = {}) {
  const depthAttr = depth !== undefined ? ` data-depth="${depth}"` : '';
  return `
    <div class="creature" data-creature="${id}" hidden${depthAttr} aria-hidden="true">
      <video class="creature__video" data-creature-video muted loop playsinline preload="none"></video>
      <img class="creature__still" data-creature-still alt="${label ?? ''}" loading="lazy" />
    </div>
  `;
}

/**
 * Monta la criatura. Acepta un `AbortSignal` opcional (`{ signal }`):
 * si la escena se desmonta mientras las comprobaciones de red siguen
 * en curso, cada punto de espera revisa `signal.aborted` antes de
 * tocar el DOM, así una promesa obsoleta nunca termina modificando una
 * escena que el visitante ya dejó atrás.
 */
export async function mountCreature(rootEl, { webmSrc, pngSrc }, { signal } = {}) {
  if (!rootEl) return;

  const videoEl = rootEl.querySelector('[data-creature-video]');
  const imgEl = rootEl.querySelector('[data-creature-still]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pngOk = await assetExists(pngSrc, { signal });
  if (signal?.aborted) return;
  if (pngOk) {
    imgEl.src = pngSrc;
  }

  const webmOk = !reducedMotion && (await assetExists(webmSrc, { signal }));
  if (signal?.aborted) return;

  if (webmOk) {
    const source = document.createElement('source');
    source.src = webmSrc;
    source.type = 'video/webm';
    videoEl.appendChild(source);
    videoEl.hidden = false;
    imgEl.hidden = true;

    try {
      await videoEl.play();
    } catch {
      // El navegador bloqueó la reproducción automática: nos quedamos
      // con el respaldo estático en vez de mostrar un vídeo congelado.
      videoEl.hidden = true;
      imgEl.hidden = false;
    }
    if (signal?.aborted) return;
  } else if (pngOk) {
    videoEl.hidden = true;
    imgEl.hidden = false;
  }

  rootEl.hidden = !(webmOk || pngOk);
}
