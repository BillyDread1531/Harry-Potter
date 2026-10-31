/**
 * Vista e interacción de «Los pasos ocultos»: tres hotspots de pista
 * (igual patrón que los otros dos minijuegos) y, a diferencia de
 * ellos, el propio mecanismo no abre un panel aparte — son cuatro
 * marcas pulsables directamente sobre el pergamino del Mapa, que hay
 * que tocar en el orden correcto. Reutiliza `magicReveal` (ya montado
 * por `scenes/mapaScene.js`) tanto para cada pista como para la
 * retroalimentación de cada intento, en vez de un panel propio.
 */
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import { MARKS, CLUES, SEQUENCE_LENGTH, SOLUTION_SEQUENCE, VICTORY_TEXT } from './hiddenPathData.js';
import { loadHiddenPathState, markHiddenPathClueDiscovered, markHiddenPathSolved } from './hiddenPathStorage.js';

// Posiciones `mobile`: parte de la cuadrícula 6×3 compartida con
// `data/mapLocations.js` y `scenes/mapaScene.js` (ver el comentario en
// `data/mapLocations.js` — un único plano de coordenadas entre los
// tres archivos para que ningún punto del Mapa quede superpuesto).
const CLUE_POSITIONS = {
  'puente-ultimo': { desktop: { x: 15, y: 20 }, mobile: { x: 92, y: 79 } },
  'norte-antes-torre': { desktop: { x: 85, y: 20 }, mobile: { x: 8, y: 93 } },
  'pozo-tras-norte': { desktop: { x: 50, y: 90 }, mobile: { x: 25, y: 93 } }
};

const MARK_POSITIONS = {
  norte: { desktop: { x: 15, y: 60 }, mobile: { x: 42, y: 93 } },
  pozo: { desktop: { x: 38, y: 85 }, mobile: { x: 58, y: 93 } },
  torre: { desktop: { x: 62, y: 60 }, mobile: { x: 75, y: 93 } },
  puente: { desktop: { x: 85, y: 85 }, mobile: { x: 92, y: 93 } }
};

export function createHiddenPathMarkup() {
  const clueHotspots = CLUES.map(
    (clue) => `
      <button
        type="button"
        class="hotspot hotspot--mystery map-hotspot"
        style="${hotspotPositionStyle(CLUE_POSITIONS[clue.id].desktop, CLUE_POSITIONS[clue.id].mobile)}"
        data-hidden-path-clue="${clue.id}"
        aria-label="${clue.label}"
      >
        <span class="hotspot__glow" aria-hidden="true"></span>
        <span class="hotspot__caption" aria-hidden="true">Examinar</span>
      </button>
    `
  ).join('');

  const markHotspots = MARKS.map(
    (mark) => `
      <button
        type="button"
        class="hotspot hotspot--mystery map-hotspot mini-game-hotspot hidden-path-mark"
        style="${hotspotPositionStyle(MARK_POSITIONS[mark.id].desktop, MARK_POSITIONS[mark.id].mobile)}"
        data-hidden-path-mark="${mark.id}"
        aria-label="${mark.label}"
      >
        <span class="hotspot__glow" aria-hidden="true"></span>
        <span class="hidden-path-mark__order" data-hidden-path-order aria-hidden="true"></span>
        <span class="hotspot__caption" aria-hidden="true">${mark.label}</span>
      </button>
    `
  ).join('');

  return clueHotspots + markHotspots;
}

/**
 * `reveal` es la instancia de `magicReveal` ya montada por la propia
 * escena (reutilizada, no una segunda): se usa tanto para cada pista
 * como para la retroalimentación de cada intento del camino.
 */
export function mountHiddenPathGame(panelEl, { signal, reveal, onSolved } = {}) {
  if (!panelEl || !reveal) return;

  panelEl.querySelectorAll('[data-hidden-path-clue]').forEach((hotspotEl) => {
    const clueId = hotspotEl.dataset.hiddenPathClue;
    const clue = CLUES.find((c) => c.id === clueId);
    if (!clue) return;

    function refresh(discovered) {
      const captionEl = hotspotEl.querySelector('.hotspot__caption');
      if (captionEl) captionEl.textContent = discovered ? 'Volver a leer' : 'Examinar';
      hotspotEl.setAttribute('aria-label', discovered ? `${clue.label} (ya leída, toca para volver a leerla)` : clue.label);
    }
    refresh(loadHiddenPathState().discoveredClueIds.includes(clue.id));

    hotspotEl.addEventListener(
      'click',
      () => {
        markHiddenPathClueDiscovered(clue.id);
        reveal.open(clue.text, { triggerEl: hotspotEl });
        refresh(true);
      },
      { signal }
    );
  });

  const markHotspots = Array.from(panelEl.querySelectorAll('[data-hidden-path-mark]'));
  let attempt = [];
  let alreadySolved = loadHiddenPathState().solved;

  function setMarksSolvedAppearance() {
    markHotspots.forEach((hotspotEl) => {
      hotspotEl.classList.add('mini-game-hotspot--solved', 'hidden-path-mark--done');
      const orderEl = hotspotEl.querySelector('[data-hidden-path-order]');
      if (orderEl) orderEl.textContent = String(SOLUTION_SEQUENCE.indexOf(hotspotEl.dataset.hiddenPathMark) + 1);
    });
  }

  function resetAttemptAppearance() {
    attempt = [];
    markHotspots.forEach((hotspotEl) => {
      hotspotEl.classList.remove('hidden-path-mark--done');
      const orderEl = hotspotEl.querySelector('[data-hidden-path-order]');
      if (orderEl) orderEl.textContent = '';
    });
  }

  if (alreadySolved) setMarksSolvedAppearance();

  markHotspots.forEach((hotspotEl) => {
    hotspotEl.addEventListener(
      'click',
      () => {
        if (alreadySolved) {
          reveal.open(VICTORY_TEXT, { triggerEl: hotspotEl });
          return;
        }

        const markId = hotspotEl.dataset.hiddenPathMark;
        const candidate = [...attempt, markId];
        const isValidPrefix = candidate.every((id, index) => id === SOLUTION_SEQUENCE[index]);

        if (!isValidPrefix) {
          resetAttemptAppearance();
          reveal.open('Ese no era el siguiente paso. El camino vuelve a empezar.', { triggerEl: hotspotEl });
          return;
        }

        attempt = candidate;
        hotspotEl.classList.add('hidden-path-mark--done');
        const orderEl = hotspotEl.querySelector('[data-hidden-path-order]');
        if (orderEl) orderEl.textContent = String(attempt.length);

        if (attempt.length < SEQUENCE_LENGTH) {
          reveal.open('Vas por buen camino. Todavía falta.', { triggerEl: hotspotEl });
          return;
        }

        // `isValidPrefix` ya garantizó, paso a paso, que cada marca
        // coincide con `SOLUTION_SEQUENCE` en su posición: llegar aquí
        // con cuatro marcas significa que la secuencia es correcta.
        alreadySolved = true;
        markHiddenPathSolved();
        setMarksSolvedAppearance();
        onSolved?.();
        reveal.open(VICTORY_TEXT, { triggerEl: hotspotEl });
      },
      { signal }
    );
  });
}
