import { createSceneFrameMarkup, mountSceneAmbience } from '../components/sceneFrame.js';
import { renderCandles } from '../ambient/candles.js';
import { createSceneBackgroundMarkup, mountSceneBackground } from './sceneBackground.js';
import { createMagicRevealMarkup, mountMagicReveal } from '../components/magicReveal.js';
import { MAP_LOCATIONS } from '../data/mapLocations.js';
import { createMapHotspotsMarkup } from '../data/mapHotspotsView.js';
import { getSolvedDays } from '../calendar/discoveries.js';
import { loadProgress } from '../calendar/calendarStorage.js';
import { scheduleOccasionalEvents, DEFAULT_AMBIENT_EFFECTS } from '../ambient/occasionalEvents.js';
import { markCardCollected } from '../collectibles/cardsStorage.js';
import { loadCastleSecretsState, markCollectibleFound } from '../discoveries/castleSecretsStorage.js';
import { MAP_PATTERN_VAGUE_TEXT, MAP_PATTERN_COMPLETE_TEXT } from '../discoveries/mothTrailContent.js';
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import { markColdDraftFeltMap } from '../discoveries/castleSecretsStorage.js';
import { COLD_DRAFT_MAP_VAGUE_TEXT, COLD_DRAFT_MAP_CONNECTED_TEXT } from '../discoveries/coldDraftContent.js';
import { createHiddenPathMarkup, mountHiddenPathGame } from '../games/hiddenPathView.js';

const BACKGROUND_SRC = {
  desktopSrc: '/assets/backgrounds/mapa-desktop.jpg',
  mobileSrc: '/assets/backgrounds/mapa-mobile.jpg'
};

// Posiciones `mobile`: parte de la cuadrícula 6×3 compartida descrita
// en `data/mapLocations.js` (ampliada de 4×3 a 6×3 al añadir «los
// pasos ocultos», ver `games/hiddenPathView.js`).
const PATTERN_POSITION = {
  desktop: { x: 58, y: 88 },
  mobile: { x: 58, y: 79 }
};

const COLD_DRAFT_HOTSPOT_POSITION = {
  desktop: { x: 30, y: 70 },
  mobile: { x: 75, y: 79 }
};

/**
 * El Mapa como espacio explorable: los lugares de `data/mapLocations.js`
 * se colocan como hotspots sobre la fotografía ya existente
 * (reutilizando `.hotspot`, el mismo componente del vestíbulo), no como
 * una cuadrícula de tarjetas aparte. Los lugares "navigate" llevan a
 * otra escena; los "ambient" revelan una línea breve mediante el panel
 * compartido `magicReveal.js`. El desbloqueo se calcula una vez al
 * montar, a partir del progreso real ya guardado — por fecha de
 * expediente (mismo mecanismo que ya usan Biblioteca y Archivo) o por
 * una bandera de descubrimiento propia (`castleSecretsStorage.js`,
 * ver `mapHotspotsView.isLocationUnlocked`) — nunca se duplica ni se
 * vuelve a guardar nada.
 */
export function renderMapa(section, { onNavigate } = {}) {
  const solvedDays = getSolvedDays(loadProgress());
  const castleSecrets = loadCastleSecretsState();
  const flags = { bookDiscovered: castleSecrets.bookDiscovered };

  const html = `
    <div data-scene-root>
      ${createSceneFrameMarkup({
        id: section.id,
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        pendingItems: section.pendingItems,
        backdropMarkup: createMapaBackdrop(),
        overlayContent:
          createMapHotspotsMarkup(MAP_LOCATIONS, solvedDays, flags) +
          createPatternHotspotMarkup(castleSecrets.threeMarksRecognized) +
          createColdDraftHotspotMarkup(castleSecrets.coldDraftFeltMap) +
          createMagicRevealMarkup() +
          createHiddenPathMarkup()
      })}
    </div>
  `;

  function onMount(panelEl) {
    const candleLayer = panelEl.querySelector('[data-table-candles]');
    renderCandles(candleLayer, { count: 2 });
    mountSceneAmbience(panelEl);

    const controller = new AbortController();
    const backdropEl = panelEl.querySelector('.scene-frame__backdrop');
    mountSceneBackground(backdropEl, BACKGROUND_SRC, { signal: controller.signal });

    const reveal = mountMagicReveal(panelEl, { signal: controller.signal });

    panelEl.querySelectorAll('[data-map-hotspot]').forEach((hotspotEl) => {
      hotspotEl.addEventListener(
        'click',
        () => {
          if (hotspotEl.dataset.goto) {
            onNavigate?.(hotspotEl.dataset.goto);
            return;
          }
          const flavorText = hotspotEl.dataset.flavorText;
          if (flavorText) {
            reveal.open(flavorText, { triggerEl: hotspotEl });
          }
          if (hotspotEl.dataset.cardId) {
            markCardCollected(hotspotEl.dataset.cardId);
          }
          if (hotspotEl.dataset.collectibleId) {
            markCollectibleFound();
          }
        },
        { signal: controller.signal }
      );
    });

    // Tercera y última parada del recorrido secreto de la polilla (ver
    // `discoveries/mothTrailContent.js`): siempre presente, igual que
    // las otras dos, pero solo tiene sentido completo una vez
    // reconocida la marca en el Archivo.
    const patternHotspot = panelEl.querySelector('[data-pattern-hotspot]');
    patternHotspot?.addEventListener(
      'click',
      () => {
        const recognized = loadCastleSecretsState().threeMarksRecognized;
        reveal.open(recognized ? MAP_PATTERN_COMPLETE_TEXT : MAP_PATTERN_VAGUE_TEXT, { triggerEl: patternHotspot });
      },
      { signal: controller.signal }
    );

    // Tercera manifestación de «la corriente fría» (ver
    // `discoveries/coldDraftContent.js`): siempre presente, igual que
    // las otras. Se enriquece una vez sentida ya en la Biblioteca.
    const coldDraftHotspot = panelEl.querySelector('[data-cold-draft-hotspot]');
    coldDraftHotspot?.addEventListener(
      'click',
      () => {
        const feltInLibrary = loadCastleSecretsState().coldDraftFeltLibrary;
        reveal.open(feltInLibrary ? COLD_DRAFT_MAP_CONNECTED_TEXT : COLD_DRAFT_MAP_VAGUE_TEXT, {
          triggerEl: coldDraftHotspot
        });
        markColdDraftFeltMap();
      },
      { signal: controller.signal }
    );

    // Tercer minijuego real del proyecto: «los pasos ocultos». A
    // diferencia de los otros dos, el mecanismo en sí no abre un panel
    // propio — son marcas que se tocan directamente sobre el
    // pergamino, con su propio pulso de castillo al completarse.
    const sceneFrameEl = panelEl.querySelector('.scene-frame');
    let hiddenPathPulseTimeoutId = null;
    controller.signal.addEventListener('abort', () => clearTimeout(hiddenPathPulseTimeoutId));
    mountHiddenPathGame(panelEl, {
      signal: controller.signal,
      reveal,
      onSolved: () => {
        if (!sceneFrameEl) return;
        clearTimeout(hiddenPathPulseTimeoutId);
        sceneFrameEl.classList.remove('scene-frame--riddle-pulse');
        void sceneFrameEl.offsetWidth;
        sceneFrameEl.classList.add('scene-frame--riddle-pulse');
        hiddenPathPulseTimeoutId = setTimeout(() => sceneFrameEl.classList.remove('scene-frame--riddle-pulse'), 1200);
      }
    });

    scheduleOccasionalEvents(panelEl, DEFAULT_AMBIENT_EFFECTS, { signal: controller.signal });

    return () => controller.abort();
  }

  return { html, onMount };
}

// Tercera parada del recorrido: siempre explorable, nunca uno de los
// "tres candados independientes" que pide evitar el diseño — el mismo
// punto da una línea genérica o la revelación completa según si la
// segunda parada (Archivo) ya se reconoció.
function createPatternHotspotMarkup(recognized) {
  const positionStyle = hotspotPositionStyle(PATTERN_POSITION.desktop, PATTERN_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot${recognized ? ' map-hotspot--pattern-complete' : ''}"
      style="${positionStyle}"
      data-pattern-hotspot
      aria-label="${recognized ? 'El patrón en la esquina del pergamino, ya completo' : 'Unos puntos de tinta en una esquina del pergamino'}"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">${recognized ? 'El patrón está completo' : 'Unos puntos sueltos'}</span>
    </button>
  `;
}

// Tercera manifestación de la corriente fría: siempre explorable.
function createColdDraftHotspotMarkup(alreadyFelt) {
  const positionStyle = hotspotPositionStyle(COLD_DRAFT_HOTSPOT_POSITION.desktop, COLD_DRAFT_HOTSPOT_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-cold-draft-hotspot
      aria-label="${alreadyFelt ? 'Volver a sentir la corriente fría sobre el pergamino' : 'El pergamino tiembla sin ninguna razón aparente'}"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">${alreadyFelt ? 'Ya sentiste esta corriente' : 'Algo lo agita'}</span>
    </button>
  `;
}

function createMapaBackdrop() {
  return `
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <radialGradient id="map-table" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#3a2a18" />
          <stop offset="100%" stop-color="#190f08" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="#0b0d18" />
      <ellipse cx="400" cy="420" rx="380" ry="90" fill="url(#map-table)" />
      <ellipse cx="400" cy="400" rx="300" ry="68" fill="#30221244" />

      <!-- Pergamino en blanco sobre la mesa -->
      <g>
        <rect x="220" y="320" width="360" height="160" rx="6" fill="#e8dcc3" opacity="0.92" />
        <rect x="220" y="320" width="360" height="160" rx="6" fill="none" stroke="#c9bb9c" stroke-width="2" />
        <circle cx="400" cy="400" r="42" fill="none" stroke="#2a2013" stroke-width="1" opacity="0.35" />
        <path d="M400 358 L400 442 M358 400 L442 400" stroke="#2a2013" stroke-width="1" opacity="0.3" />
        <path d="M374 374 L426 426 M426 374 L374 426" stroke="#2a2013" stroke-width="0.8" opacity="0.2" />
      </g>
    </svg>
    ${createSceneBackgroundMarkup()}
    <div class="scene-table-candles" data-table-candles aria-hidden="true"></div>
  `;
}
