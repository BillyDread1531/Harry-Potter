import { assetExists } from '../utils/assetProbe.js';

/**
 * Criatura mágica reutilizable con fondo transparente. `<video>` no
 * puede mostrar transparencia aunque el archivo tenga canal alfa
 * (limitación real de todos los navegadores) — por eso el video se
 * reproduce OCULTO y se dibuja, cuadro a cuadro, en un `<canvas>`
 * quitándole el fondo oscuro a mano (`CHROMA_KEY`). PNG estático como
 * respaldo si no hay video, si falla la reproducción, o si el
 * visitante pidió movimiento reducido.
 */
const CHROMA_KEY = { r: 20, g: 20, b: 20 };
const CHROMA_TOLERANCE = 60;
const CANVAS_WIDTH = 320;

export function createCreatureMarkup({ id, label, depth } = {}) {
  const depthAttr = depth !== undefined ? ` data-depth="${depth}"` : '';
  return `
    <div class="creature" data-creature="${id}" hidden${depthAttr} aria-hidden="true">
      <video class="creature__video" data-creature-video muted loop playsinline preload="none" hidden></video>
      <canvas class="creature__canvas" data-creature-canvas hidden></canvas>
      <img class="creature__still" data-creature-still alt="${label ?? ''}" loading="lazy" />
    </div>
  `;
}

function startChromaKeyLoop(videoEl, canvasEl, signal) {
  const ctx = canvasEl.getContext('2d', { willReadFrequently: true });

  function draw() {
    if (signal?.aborted) return;
    if (!canvasEl.width && videoEl.videoWidth) {
      canvasEl.width = CANVAS_WIDTH;
      canvasEl.height = Math.round(CANVAS_WIDTH * (videoEl.videoHeight / videoEl.videoWidth || 1));
    }
    if (canvasEl.width) {
      ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
      const frame = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      const d = frame.data;
      for (let i = 0; i < d.length; i += 4) {
        const dr = d[i] - CHROMA_KEY.r;
        const dg = d[i + 1] - CHROMA_KEY.g;
        const db = d[i + 2] - CHROMA_KEY.b;
        if (dr * dr + dg * dg + db * db < CHROMA_TOLERANCE * CHROMA_TOLERANCE) d[i + 3] = 0;
      }
      ctx.putImageData(frame, 0, 0);
    }
    requestAnimationFrame(draw);
  }

  const rafId = requestAnimationFrame(draw);
  signal?.addEventListener('abort', () => cancelAnimationFrame(rafId));
}

/**
 * Monta la criatura. Acepta un `AbortSignal` opcional (`{ signal }`):
 * si la escena se desmonta mientras las comprobaciones de red siguen
 * en curso, cada punto de espera revisa `signal.aborted` antes de
 * tocar el DOM.
 */
export async function mountCreature(rootEl, { webmSrc, pngSrc }, { signal } = {}) {
  if (!rootEl) return;

  const videoEl = rootEl.querySelector('[data-creature-video]');
  const canvasEl = rootEl.querySelector('[data-creature-canvas]');
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
    videoEl.src = webmSrc;
    try {
      await videoEl.play();
      if (signal?.aborted) return;
      startChromaKeyLoop(videoEl, canvasEl, signal);
      canvasEl.hidden = false;
      imgEl.hidden = true;
    } catch {
      // El navegador bloqueó la reproducción automática: nos quedamos
      // con el respaldo estático en vez de mostrar un canvas vacío.
      canvasEl.hidden = true;
      imgEl.hidden = false;
    }
  } else if (pngOk) {
    canvasEl.hidden = true;
    imgEl.hidden = false;
  }

  rootEl.hidden = !(webmOk || pngOk);
}
