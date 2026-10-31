import { createSceneFrameMarkup, mountSceneAmbience } from '../components/sceneFrame.js';
import { createSceneBackgroundMarkup, mountSceneBackground } from './sceneBackground.js';
import { renderCandles } from '../ambient/candles.js';
import { createMagicRevealMarkup, mountMagicReveal } from '../components/magicReveal.js';
import { getSolvedDays } from '../calendar/discoveries.js';
import { loadProgress } from '../calendar/calendarStorage.js';
import { getCurrentAct } from '../calendar/actProgress.js';
import { getRoomLineForAct, ROOM_HOTSPOT_POSITION } from '../data/roomOfRequirementContent.js';
import { isMothVisibleInSala, isExceptionalMothOmenReady } from '../calendar/castleEvents.js';
import { createCreatureMarkup, mountCreature } from '../components/creature.js';
import { scheduleOccasionalEvents, DEFAULT_AMBIENT_EFFECTS } from '../ambient/occasionalEvents.js';
import { getCardById } from '../collectibles/cardsData.js';
import { createCardRevealText } from '../collectibles/cardsView.js';
import { isCardUnlocked } from '../collectibles/cardsProgress.js';
import { loadCollectedCardIds, markCardCollected } from '../collectibles/cardsStorage.js';
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import { createMothLockMarkup, mountMothLockGame } from '../games/mothLockView.js';
import { createRunesMarkup, mountRunesGame } from '../games/runesView.js';
import { createReadingPanelMarkup, mountReadingPanel } from '../components/readingPanel.js';
import { loadCastleSecretsState, markColdDraftResolved } from '../discoveries/castleSecretsStorage.js';
import {
  getColdDraftPhase,
  COLD_DRAFT_ROOM_WAITING_TEXT,
  COLD_DRAFT_ROOM_READY_TEXT,
  COLD_DRAFT_RESOLUTION_TEXT,
  COLD_DRAFT_RESOLUTION_BUTTON_LABEL
} from '../discoveries/coldDraftContent.js';

const ROOM_CARD = getCardById('longbottom');

const MOTH_SRC = {
  webmSrc: '/assets/creatures/polilla.webm',
  pngSrc: '/assets/creatures/polilla.png'
};

const BACKGROUND_SRC = {
  desktopSrc: '/assets/backgrounds/desafios-desktop.jpg',
  mobileSrc: '/assets/backgrounds/desafios-mobile.jpg'
};

// Cuántas velas flotantes y motas de polvo mágico hay, según cuánto ha
// avanzado Andrea (acto 0-4, ver `calendar/actProgress.js`). La sala
// no gana objetos nuevos literales (la fotografía es fija), pero sí se
// va iluminando y llenando de un poco más de magia — el mismo recurso
// visual que ya usa el resto del proyecto (`renderCandles`,
// `renderParticles`), sin inventar un sistema nuevo.
const CANDLE_COUNT_BY_ACT = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 6 };
const PARTICLE_COUNT_BY_ACT = { 0: 10, 1: 14, 2: 18, 3: 24, 4: 30 };

// Evolución visual persistente: la sábana que cubre parte de la sala
// se retira poco a poco con el acto (el propio texto de
// `ROOM_ACT_LINES` ya lo anuncia: "las sábanas cubren todo... según
// avances"). No es un cambio de texto ni de partículas: es una capa de
// composición real que cambia de tamaño y opacidad.
const SHEET_OPACITY_BY_ACT = { 0: 0.92, 1: 0.8, 2: 0.6, 3: 0.38, 4: 0.16 };
const SHEET_SCALE_BY_ACT = { 0: 1, 1: 0.94, 2: 0.86, 3: 0.76, 4: 0.6 };

// `mobile` forma parte de la misma cuadrícula 3×2 rediseñada para toda
// la sala (ver el comentario en `games/mothLockView.js`).
const COLD_DRAFT_ROOM_POSITION = {
  desktop: { x: 25, y: 62 },
  mobile: { x: 82, y: 78 }
};

/**
 * La Sala de los Menesteres: reactiva, no una lista. Su aspecto
 * (velas, partículas, calidez de la viñeta) cambia según el acto que
 * ya alcanzó Andrea con el progreso real guardado, y un único punto
 * interactivo —apenas insinuado, como el resto de la sala en el
 * vestíbulo— revela una sola línea ambiental acorde a ese momento de
 * la historia. Sin minijuego, sin lista de hallazgos: la experiencia
 * principal es visual y ambiental.
 */
export function renderDesafios(section) {
  const solvedDays = getSolvedDays(loadProgress());
  const act = getCurrentAct(solvedDays);
  const mothVisible = isMothVisibleInSala(solvedDays);
  const omenReady = isExceptionalMothOmenReady(solvedDays);
  const castleSecrets = loadCastleSecretsState();
  const coldDraftPhase = getColdDraftPhase(castleSecrets);

  const html = `
    <div data-scene-root>
      ${createSceneFrameMarkup({
        id: section.id,
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        pendingItems: section.pendingItems,
        backdropMarkup: createDesafiosBackdrop(),
        overlayContent:
          createSheetOverlayMarkup(act) +
          createRoomHotspotMarkup() +
          createColdDraftRoomHotspotMarkup(coldDraftPhase) +
          createMagicRevealMarkup() +
          (mothVisible ? createSalaMothMarkup() : '') +
          createMothLockMarkup() +
          createRunesMarkup() +
          createReadingPanelMarkup()
      })}
    </div>
  `;

  function onMount(panelEl) {
    const sceneFrameEl = panelEl.querySelector('.scene-frame');
    sceneFrameEl?.classList.add(`scene-frame--act-${act}`);
    if (castleSecrets.coldDraftResolved) {
      sceneFrameEl?.classList.add('scene-frame--draft-resolved');
    }

    const candleLayer = panelEl.querySelector('[data-corridor-candles]');
    renderCandles(candleLayer, { count: CANDLE_COUNT_BY_ACT[act] });
    mountSceneAmbience(panelEl, { count: PARTICLE_COUNT_BY_ACT[act] });

    const controller = new AbortController();
    const backdropEl = panelEl.querySelector('.scene-frame__backdrop');
    mountSceneBackground(backdropEl, BACKGROUND_SRC, { signal: controller.signal });

    let lockPulseTimeoutId = null;
    controller.signal.addEventListener('abort', () => clearTimeout(lockPulseTimeoutId));

    const reveal = mountMagicReveal(panelEl, { signal: controller.signal });
    // Panel de lectura compartido por los dos minijuegos de esta sala
    // (la cerradura de la polilla y las runas): una sola instancia,
    // nunca dos paneles duplicados en el DOM.
    const reading = mountReadingPanel(panelEl, { signal: controller.signal });
    const roomHotspot = panelEl.querySelector('[data-room-hotspot]');
    roomHotspot?.addEventListener(
      'click',
      () => {
        const lines = [getRoomLineForAct(act)];
        // El cromo de este lugar se suma a la misma revelación (no es
        // un segundo punto interactivo): la sala sigue teniendo un
        // único hotspot, como pide su diseño.
        if (isCardUnlocked(ROOM_CARD, solvedDays) && !loadCollectedCardIds().includes(ROOM_CARD.id)) {
          lines.push(createCardRevealText(ROOM_CARD));
          markCardCollected(ROOM_CARD.id);
        }
        reveal.open(lines.join('\n\n'), { triggerEl: roomHotspot });
      },
      { signal: controller.signal }
    );

    if (mothVisible) {
      const mothEl = panelEl.querySelector('[data-creature="polilla-sala"]');
      mountCreature(mothEl, MOTH_SRC, { signal: controller.signal });
    }

    // El mismo pulso de castillo que ya usa `calendarView.pulseCastle`
    // al acertar un expediente: reutilizado aquí, no reinventado, para
    // que resolver el mecanismo se sienta coherente con el resto del
    // mundo reaccionando a un logro real.
    mountMothLockGame(panelEl, {
      signal: controller.signal,
      reveal,
      reading,
      onSolved: () => {
        if (!sceneFrameEl) return;
        clearTimeout(lockPulseTimeoutId);
        sceneFrameEl.classList.remove('scene-frame--riddle-pulse');
        void sceneFrameEl.offsetWidth;
        sceneFrameEl.classList.add('scene-frame--riddle-pulse');
        lockPulseTimeoutId = setTimeout(() => sceneFrameEl.classList.remove('scene-frame--riddle-pulse'), 1200);
      }
    });

    // Quinto minijuego real del proyecto: «las runas», en la misma
    // sala. Mismo pulso de castillo que el resto al resolverse.
    let runesPulseTimeoutId = null;
    controller.signal.addEventListener('abort', () => clearTimeout(runesPulseTimeoutId));
    mountRunesGame(panelEl, {
      signal: controller.signal,
      reveal,
      reading,
      onSolved: () => {
        if (!sceneFrameEl) return;
        clearTimeout(runesPulseTimeoutId);
        sceneFrameEl.classList.remove('scene-frame--riddle-pulse');
        void sceneFrameEl.offsetWidth;
        sceneFrameEl.classList.add('scene-frame--riddle-pulse');
        runesPulseTimeoutId = setTimeout(() => sceneFrameEl.classList.remove('scene-frame--riddle-pulse'), 1200);
      }
    });

    scheduleOccasionalEvents(panelEl, DEFAULT_AMBIENT_EFFECTS, { signal: controller.signal });

    // Presagio excepcional: solo posible a partir del Acto IV (día 13),
    // y como mucho una vez por visita — nunca se repite dentro del
    // mismo montaje, a diferencia de las apariciones ambientales
    // normales de `occasionalEvents.js`, que sí pueden repetirse. Un
    // retraso largo y aleatorio (no instantáneo) para que se sienta
    // como una rareza, no como parte de la decoración habitual. Respeta
    // `prefers-reduced-motion` no programando nada en absoluto.
    let omenTimeoutId = null;
    let omenClearTimeoutId = null;
    if (omenReady && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      omenTimeoutId = setTimeout(() => {
        const vignetteEl = panelEl.querySelector('.scene-frame__vignette');
        vignetteEl?.classList.add('scene-frame__vignette--omen');
        omenClearTimeoutId = setTimeout(() => vignetteEl?.classList.remove('scene-frame__vignette--omen'), 2600);
      }, 15000 + Math.random() * 20000);
    }
    controller.signal.addEventListener('abort', () => {
      clearTimeout(omenTimeoutId);
      clearTimeout(omenClearTimeoutId);
    });

    // Cuarta manifestación y resolución de «la corriente fría» (ver
    // `discoveries/coldDraftContent.js`): el mismo punto, siempre
    // presente, da la versión de espera hasta que la conexión ya se
    // reconoció en la Biblioteca y el Mapa — entonces, un único clic
    // más la resuelve. No es una pregunta con respuesta correcta: es
    // una acción, y solo puede tomarse una vez (después, el mismo
    // punto solo recuerda lo que pasó).
    const coldDraftRoomHotspot = panelEl.querySelector('[data-cold-draft-room-hotspot]');
    coldDraftRoomHotspot?.addEventListener(
      'click',
      () => {
        const phase = getColdDraftPhase(loadCastleSecretsState());
        if (phase === 'ready-to-resolve') {
          reveal.open(COLD_DRAFT_RESOLUTION_TEXT, { triggerEl: coldDraftRoomHotspot });
          markColdDraftResolved();
          sceneFrameEl?.classList.add('scene-frame--draft-resolved');
          coldDraftRoomHotspot.querySelector('.hotspot__caption').textContent = 'El frío ya se asentó';
          coldDraftRoomHotspot.setAttribute('aria-label', 'El frío ya se asentó, hace tiempo');
        } else if (phase === 'resolved') {
          reveal.open(COLD_DRAFT_RESOLUTION_TEXT, { triggerEl: coldDraftRoomHotspot });
        } else {
          reveal.open(COLD_DRAFT_ROOM_WAITING_TEXT, { triggerEl: coldDraftRoomHotspot });
        }
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }

  return { html, onMount };
}

// La polilla reaparece aquí al llegar al Acto IV (día 13): el mismo
// símbolo reconociéndose entre escenas distintas, como pide la
// continuidad narrativa. Posición discreta, al fondo del pasillo.
function createSalaMothMarkup() {
  return `
    <div class="scene-moth" style="left: 56%; top: 34%; width: 6%; height: 6%;">
      ${createCreatureMarkup({ id: 'polilla-sala', label: 'Una polilla plateada, al fondo del pasillo' })}
    </div>
  `;
}

// La sábana: composición real, no decoración suelta. Un overlay con el
// mismo z-index ya usado por el resto de esta familia de elementos
// (por encima de la foto real), que se encoge y se desvanece con el
// acto — nunca un estado aparte que guardar, siempre derivado del
// progreso real.
function createSheetOverlayMarkup(act) {
  const opacity = SHEET_OPACITY_BY_ACT[act] ?? SHEET_OPACITY_BY_ACT[0];
  const scale = SHEET_SCALE_BY_ACT[act] ?? SHEET_SCALE_BY_ACT[0];
  return `
    <div
      class="desafios-sheet"
      style="--sheet-opacity: ${opacity}; --sheet-scale: ${scale};"
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 150 Q0 80 40 40 Q90 0 150 20 Q200 38 190 90 Q180 150 120 155 Q60 160 10 150 Z"
          fill="#d9d2c3"
        />
        <path d="M30 60 Q70 40 120 55" stroke="#b8ae99" stroke-width="3" fill="none" opacity="0.5" />
        <path d="M45 110 Q90 95 150 108" stroke="#b8ae99" stroke-width="3" fill="none" opacity="0.5" />
      </svg>
    </div>
  `;
}

function createRoomHotspotMarkup() {
  const positionStyle = hotspotPositionStyle(ROOM_HOTSPOT_POSITION.desktop, ROOM_HOTSPOT_POSITION.mobile);

  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-room-hotspot
      aria-label="Algo en este pasillo no es lo que parece"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Algo cambió aquí</span>
    </button>
  `;
}

// Cuarta manifestación/resolución de la corriente fría: siempre
// presente, nunca deshabilitada. El aria-label cambia con la fase para
// que quien use lector de pantalla sepa, sin adivinar, qué va a pasar
// al activarlo.
function createColdDraftRoomHotspotMarkup(phase) {
  const positionStyle = hotspotPositionStyle(COLD_DRAFT_ROOM_POSITION.desktop, COLD_DRAFT_ROOM_POSITION.mobile);
  const label =
    phase === 'resolved'
      ? 'El frío ya se asentó, hace tiempo'
      : phase === 'ready-to-resolve'
        ? COLD_DRAFT_RESOLUTION_BUTTON_LABEL
        : 'Un frío que se concentra al fondo del pasillo';
  const caption =
    phase === 'resolved' ? 'El frío ya se asentó' : phase === 'ready-to-resolve' ? 'Prestarle atención' : 'Frío, al fondo';
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-cold-draft-room-hotspot
      aria-label="${label}"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">${caption}</span>
    </button>
  `;
}

function createDesafiosBackdrop() {
  const silhouettes = [120, 240, 560, 680]
    .map(
      (x, i) => `
        <rect x="${x - 14}" y="${340 - i * 10}" width="28" height="${140 + i * 10}" fill="#171226" opacity="0.6" />
      `
    )
    .join('');

  return `
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <radialGradient id="room-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stop-color="#2e4e8c" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#05060c" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="#06070d" />
      <ellipse cx="400" cy="470" rx="420" ry="60" fill="url(#room-glow)" />
      ${silhouettes}
      <circle cx="400" cy="230" r="3" fill="#d8b85a" opacity="0.8" />
      <circle cx="400" cy="230" r="18" fill="#d8b85a" opacity="0.12" />
    </svg>
    ${createSceneBackgroundMarkup()}
    <div class="scene-corridor-candles" data-corridor-candles aria-hidden="true"></div>
  `;
}
