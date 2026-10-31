import { createSceneFrameMarkup, mountSceneAmbience } from '../components/sceneFrame.js';
import { renderCandles } from '../ambient/candles.js';
import { createSceneBackgroundMarkup, mountSceneBackground } from './sceneBackground.js';
import { createCalendarMarkup, mountCalendar } from '../calendar/calendarView.js';
import { scheduleOccasionalEvents, DEFAULT_AMBIENT_EFFECTS } from '../ambient/occasionalEvents.js';
import { createMagicRevealMarkup, mountMagicReveal } from '../components/magicReveal.js';
import { getCardById } from '../collectibles/cardsData.js';
import { createCardRevealText } from '../collectibles/cardsView.js';
import { isCardUnlocked } from '../collectibles/cardsProgress.js';
import { markCardCollected } from '../collectibles/cardsStorage.js';
import { getSolvedDays } from '../calendar/discoveries.js';
import { loadProgress } from '../calendar/calendarStorage.js';
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import { onProgressChanged, emitProgressChanged } from '../utils/progressEvents.js';
import { createReadingPanelMarkup, mountReadingPanel } from '../components/readingPanel.js';
import { createPersonalMessageBodyMarkup, getFragmentsWithStatus } from '../calendar/personalMessageView.js';
import { getCalendarState } from '../calendar/calendarEngine.js';

const MCGONAGALL_CARD = getCardById('mcgonagall');
const MCGONAGALL_POSITION = {
  desktop: { x: 74, y: 22 },
  mobile: { x: 70, y: 18 }
};

const FRAGMENTS_POSITION = {
  desktop: { x: 27, y: 18 },
  mobile: { x: 25, y: 15 }
};

const BACKGROUND_SRC = {
  desktopSrc: '/assets/backgrounds/expedientes-desktop.jpg',
  mobileSrc: '/assets/backgrounds/expedientes-mobile.jpg'
};

export function renderExpedientes(section) {
  const html = `
    <div data-scene-root>
      ${createSceneFrameMarkup({
        id: section.id,
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        pendingItems: section.pendingItems,
        backdropMarkup: createExpedientesBackdrop(),
        extraContent: createCalendarMarkup(),
        overlayContent: createFragmentsHotspotMarkup() + createMagicRevealMarkup() + createReadingPanelMarkup()
      })}
    </div>
  `;

  function onMount(panelEl) {
    const candleLayer = panelEl.querySelector('[data-desk-candle]');
    renderCandles(candleLayer, { count: 1 });
    mountSceneAmbience(panelEl);

    const controller = new AbortController();
    const backdropEl = panelEl.querySelector('.scene-frame__backdrop');
    mountSceneBackground(backdropEl, BACKGROUND_SRC, { signal: controller.signal });

    const calendarEl = panelEl.querySelector('[data-calendar-root]');
    mountCalendar(calendarEl, { signal: controller.signal });

    // El cromo de McGonagall depende de resolver el día 3, que se
    // resuelve en esta misma escena (el calendario de arriba). Se
    // comprueba una vez al montar (cubre el caso de llegar ya con el
    // día 3 resuelto) y de nuevo cada vez que el progreso cambia de
    // verdad (cubre resolverlo sin salir de Expedientes) — misma
    // función en ambos casos, nunca inserta ni cablea el hotspot dos
    // veces, porque primero comprueba si ya existe en el DOM.
    const reveal = mountMagicReveal(panelEl, { signal: controller.signal });
    ensureMcGonagallHotspot(panelEl, { signal: controller.signal, reveal });

    // El mensaje personal siempre está ahí (no depende de ningún día
    // concreto para EXISTIR, a diferencia del cromo de McGonagall):
    // el panel se vuelve a calcular desde el progreso real cada vez
    // que se abre, así que nunca hace falta "insertarlo" de forma
    // condicional. El contador del propio hotspot sí se refresca con
    // el progreso, para que se note sin tener que abrir el panel.
    const reading = mountReadingPanel(panelEl, { signal: controller.signal });
    const fragmentsHotspot = panelEl.querySelector('[data-fragments-hotspot]');
    fragmentsHotspot?.addEventListener(
      'click',
      () => {
        const calendarState = getCalendarState({ referenceInstant: new Date(), progress: loadProgress() });
        reading.open(createPersonalMessageBodyMarkup(calendarState), { triggerEl: fragmentsHotspot });
      },
      { signal: controller.signal }
    );
    refreshFragmentsHotspotCaption(panelEl);

    onProgressChanged(
      () => {
        ensureMcGonagallHotspot(panelEl, { signal: controller.signal, reveal });
        refreshFragmentsHotspotCaption(panelEl);
      },
      { signal: controller.signal }
    );

    scheduleOccasionalEvents(panelEl, DEFAULT_AMBIENT_EFFECTS, { signal: controller.signal });

    return () => controller.abort();
  }

  return { html, onMount };
}

function ensureMcGonagallHotspot(panelEl, { signal, reveal }) {
  if (panelEl.querySelector('[data-card-hotspot]')) return; // ya insertado y cableado

  const solvedDays = getSolvedDays(loadProgress());
  if (!isCardUnlocked(MCGONAGALL_CARD, solvedDays)) return;

  const sceneFrameEl = panelEl.querySelector('.scene-frame');
  sceneFrameEl?.insertAdjacentHTML('beforeend', createMcGonagallHotspotMarkup());

  const cardHotspot = panelEl.querySelector('[data-card-hotspot]');
  cardHotspot?.addEventListener(
    'click',
    () => {
      reveal.open(createCardRevealText(MCGONAGALL_CARD), { triggerEl: cardHotspot });
      markCardCollected(MCGONAGALL_CARD.id);
      emitProgressChanged({ type: 'card-collected', id: MCGONAGALL_CARD.id });
    },
    { signal }
  );
}

// El contador del hotspot ("N de 15 encontrados") es el único trozo
// que se refresca solo; el contenido del panel se recalcula entero
// cada vez que se abre, así que nunca queda desactualizado.
function refreshFragmentsHotspotCaption(panelEl) {
  const captionEl = panelEl.querySelector('[data-fragments-hotspot] .hotspot__caption');
  if (!captionEl) return;
  const calendarState = getCalendarState({ referenceInstant: new Date(), progress: loadProgress() });
  const earnedCount = getFragmentsWithStatus(calendarState).filter((item) => item.earned).length;
  captionEl.textContent = earnedCount === 0 ? 'Un mensaje aparte' : `${earnedCount} de 15 encontrados`;
}

// Siempre presente, desde la primera visita (a diferencia del cromo de
// McGonagall): el panel mismo explica que todavía no hay nada que leer
// cuando el progreso está vacío, así que no hace falta ocultar el
// propio hotspot.
function createFragmentsHotspotMarkup() {
  const positionStyle = hotspotPositionStyle(FRAGMENTS_POSITION.desktop, FRAGMENTS_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-fragments-hotspot
      aria-label="Un mensaje aparte, formado por lo que ya has resuelto"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Un mensaje aparte</span>
    </button>
  `;
}

// Solo existe tras resolver el día 3 (el Sombrero Seleccionador, el
// propio terreno de McGonagall): antes de eso ni se renderiza.
function createMcGonagallHotspotMarkup() {
  const positionStyle = hotspotPositionStyle(MCGONAGALL_POSITION.desktop, MCGONAGALL_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-card-hotspot
      aria-label="Uno de los pergaminos suspendidos tiene algo enrollado dentro"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Algo está enrollado aquí</span>
    </button>
  `;
}

function createExpedientesBackdrop() {
  return `
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <linearGradient id="desk-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4a3420" />
          <stop offset="100%" stop-color="#241708" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="#0b0d18" />

      <!-- Pergaminos suspendidos -->
      <g opacity="0.85">
        <line x1="220" y1="40" x2="220" y2="140" stroke="#5a4e3a" stroke-width="1.5" />
        <path d="M190 140 Q220 120 250 140 L246 220 Q220 236 194 220 Z" fill="#e8dcc3" opacity="0.85" />
        <line x1="420" y1="20" x2="420" y2="110" stroke="#5a4e3a" stroke-width="1.5" />
        <path d="M392 110 Q420 92 448 110 L444 200 Q420 214 396 200 Z" fill="#c9bb9c" opacity="0.8" />
        <line x1="580" y1="50" x2="580" y2="130" stroke="#5a4e3a" stroke-width="1.5" />
        <path d="M554 130 Q580 114 606 130 L602 196 Q580 208 558 196 Z" fill="#e8dcc3" opacity="0.75" />
      </g>

      <!-- Escritorio -->
      <polygon points="80,500 720,500 660,360 140,360" fill="url(#desk-wood)" />
      <rect x="140" y="352" width="520" height="14" fill="#5a3f22" />
      <rect x="320" y="300" width="160" height="60" fill="#1c140c" opacity="0.9" />
      <rect x="330" y="308" width="140" height="44" fill="#e8dcc3" opacity="0.9" />
      <line x1="340" y1="320" x2="460" y2="320" stroke="#2a2013" stroke-width="1.5" opacity="0.5" />
      <line x1="340" y1="332" x2="440" y2="332" stroke="#2a2013" stroke-width="1.5" opacity="0.5" />
    </svg>
    ${createSceneBackgroundMarkup()}
    <div class="scene-desk-candle" data-desk-candle aria-hidden="true"></div>
  `;
}
