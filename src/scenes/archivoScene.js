import { createSceneFrameMarkup, mountSceneAmbience } from '../components/sceneFrame.js';
import { createIconMarkup } from '../components/icons.js';
import { createSceneBackgroundMarkup, mountSceneBackground } from './sceneBackground.js';
import { getUnlockedSecrets, getSolvedDays } from '../calendar/discoveries.js';
import { createDiscoveryListMarkup } from '../calendar/discoveriesView.js';
import { loadProgress } from '../calendar/calendarStorage.js';
import { isArchiveChestAwake } from '../calendar/castleEvents.js';
import { scheduleOccasionalEvents, DEFAULT_AMBIENT_EFFECTS } from '../ambient/occasionalEvents.js';
import { createMagicRevealMarkup, mountMagicReveal } from '../components/magicReveal.js';
import { getCardById } from '../collectibles/cardsData.js';
import { createCardRevealText, createCollectedCardsListMarkup } from '../collectibles/cardsView.js';
import { isCardUnlocked, getCollectedCards } from '../collectibles/cardsProgress.js';
import { loadCollectedCardIds, markCardCollected } from '../collectibles/cardsStorage.js';
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import { onProgressChanged, emitProgressChanged } from '../utils/progressEvents.js';
import { getCurrentAct } from '../calendar/actProgress.js';
import { createCreatureMarkup, mountCreature } from '../components/creature.js';
import { getPortraitLineForAct } from '../discoveries/portraitContent.js';
import { PORTRAIT_TOPICS, getPortraitTopicById } from '../discoveries/portraitTopics.js';
import { CASTLE_COLLECTIBLE } from '../discoveries/castleCollectible.js';
import {
  loadCastleSecretsState,
  markPortraitMet,
  markThreeMarksRecognized
} from '../discoveries/castleSecretsStorage.js';
import { ARCHIVE_MARKS_VAGUE_TEXT, ARCHIVE_MARKS_RECOGNIZED_TEXT } from '../discoveries/mothTrailContent.js';
import { createReadingPanelMarkup, mountReadingPanel } from '../components/readingPanel.js';
import { getChestText } from '../discoveries/examinableObjectsContent.js';
import { getCompletedStories } from '../discoveries/completedStoriesContent.js';
import { loadMothLockState } from '../games/mothLockStorage.js';
import { loadCatalogState } from '../games/catalogStorage.js';
import { loadHiddenPathState } from '../games/hiddenPathStorage.js';
import { loadSealState } from '../games/sealStorage.js';
import { loadRunesState } from '../games/runesStorage.js';
import { createSealMarkup, mountSealGame } from '../games/sealView.js';

// Posiciones `mobile`: desde que `.scene-frame__content` tiene un
// tope de altura propio en móvil (ver la regla junto a
// `.scene-frame__content` en `styles/scene.css`), el Archivo ya no
// necesita "esquinas de riesgo aceptado" — puede usar la misma
// cuadrícula fija por debajo del contenido que el resto de las
// escenas. Ocho puntos posibles (los cuatro de aquí más los cuatro de
// «el sello correcto», ver `games/sealView.js`) en una cuadrícula 4×2,
// x ≈ 15/38/62/85%, y ≈ 78/93%.
const FLAMEL_CARD = getCardById('flamel');
const FLAMEL_POSITION = {
  desktop: { x: 75, y: 42 },
  mobile: { x: 15, y: 93 }
};

const PORTRAIT_HOTSPOT_POSITION = {
  desktop: { x: 68, y: 40 },
  mobile: { x: 15, y: 78 }
};

const ARCHIVE_MARKS_POSITION = {
  desktop: { x: 40, y: 61 },
  mobile: { x: 38, y: 93 }
};

const CHEST_HOTSPOT_POSITION = {
  desktop: { x: 50, y: 85 },
  mobile: { x: 38, y: 78 }
};

// Pila de pergaminos: puramente decorativa, crece con el acto. Se
// coloca lejos de cualquier otro punto interactivo (esquina inferior
// izquierda), y con el mismo z-index ya usado por `.archivo-portrait`/
// `.scene-moth` para quedar SIEMPRE por encima de la foto real, nunca
// oculta detrás de ella (ver `scene.css`).
const PAPERS_OVERLAY_POSITION = { left: '10%', top: '66%', width: '16%', height: '22%' };
const PAPER_COUNT_BY_ACT = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5 };

// Reutiliza el mismo recurso gráfico que ya aparece en el Vestíbulo: el
// mismo retrato mágico, visto en otra sala — coherente con el propio
// mundo (los retratos de Hogwarts se mueven entre marcos), no una
// casualidad de recursos disponibles.
const PORTRAIT_SRC = {
  pngSrc: '/assets/creatures/retrato.png'
};

// Reunido en un único lugar para los dos puntos de `getCompletedStories`
// de abajo (al montar y al refrescar tras reconocer la marca): el
// estado de cada minijuego, estén resueltos en esta escena (el sello)
// o en otra (la cerradura, el catálogo, los pasos ocultos, las runas).
function loadAllGameStates() {
  return {
    mothLockState: loadMothLockState(),
    catalogState: loadCatalogState(),
    hiddenPathState: loadHiddenPathState(),
    sealState: loadSealState(),
    runesState: loadRunesState()
  };
}

const BACKGROUND_SRC = {
  desktopSrc: '/assets/backgrounds/archivo-desktop.jpg',
  mobileSrc: '/assets/backgrounds/archivo-mobile.jpg'
};

export function renderArchivo(section) {
  // El Archivo reúne TODOS los secretos ya desbloqueados (no solo los
  // suyos propios): es el lugar pensado para volver a consultar lo ya
  // descubierto, a diferencia de la Biblioteca, donde cada secreto
  // aparece por primera vez.
  const solvedDays = getSolvedDays(loadProgress());
  const unlockedSecrets = getUnlockedSecrets({ progress: loadProgress() });
  const chestAwake = isArchiveChestAwake(solvedDays);
  const flamelUnlocked = isCardUnlocked(FLAMEL_CARD, solvedDays);
  const collectedCards = getCollectedCards(loadCollectedCardIds());
  const act = getCurrentAct(solvedDays);
  const castleSecrets = loadCastleSecretsState();
  // El hallazgo coleccionable de esta fase (encontrado en el Mapa) se
  // suma al mismo registro, sin ser uno de los seis hallazgos
  // canónicos: `createDiscoveryListMarkup` ya solo necesita
  // `{ label, body }`, así que no hace falta duplicar ese componente.
  const allDiscoveries = castleSecrets.collectibleFound ? [...unlockedSecrets, CASTLE_COLLECTIBLE] : unlockedSecrets;
  const completedStories = getCompletedStories({
    solvedDays,
    castleSecrets,
    ...loadAllGameStates()
  });

  const html = `
    <div data-scene-root>
      ${createSceneFrameMarkup({
        id: section.id,
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        pendingItems: section.pendingItems,
        backdropMarkup: createArchivoBackdrop(),
        extraContent:
          createDiscoveryListMarkup(allDiscoveries, { heading: 'Registro de hallazgos' }) +
          `<div data-card-collection-slot>${createCollectedCardsListMarkup(collectedCards)}</div>` +
          `<div data-completed-stories-slot>${createDiscoveryListMarkup(completedStories, { heading: 'Historias completas' })}</div>`,
        overlayContent:
          createPortraitMarkup(castleSecrets.portraitMet) +
          createArchiveMarksMarkup(castleSecrets.mothWingNoticed, castleSecrets.threeMarksRecognized) +
          createChestHotspotMarkup() +
          createPapersOverlayMarkup(act) +
          (flamelUnlocked ? createFlamelHotspotMarkup() : '') +
          createMagicRevealMarkup() +
          createReadingPanelMarkup() +
          createSealMarkup()
      })}
    </div>
  `;

  function onMount(panelEl) {
    mountSceneAmbience(panelEl);

    const controller = new AbortController();
    const backdropEl = panelEl.querySelector('.scene-frame__backdrop');
    mountSceneBackground(backdropEl, BACKGROUND_SRC, { signal: controller.signal });

    if (chestAwake) {
      panelEl.querySelector('[data-archive-lock-glow]')?.classList.add('archive-lock-glow--active');
    }

    // El panel mágico ahora lo usa también el retrato, así que se monta
    // siempre (antes solo existía si el cromo de Flamel estaba
    // desbloqueado).
    const reveal = mountMagicReveal(panelEl, { signal: controller.signal });

    const portraitFrame = panelEl.querySelector('[data-portrait-frame]');
    mountCreature(portraitFrame?.querySelector('[data-creature]'), PORTRAIT_SRC, { signal: controller.signal });
    const portraitHotspot = panelEl.querySelector('[data-portrait-hotspot]');

    // La conversación del retrato: un saludo fijo por acto (reutilizado
    // de `discoveries/portraitContent.js`, nunca duplicado) seguido de
    // tres temas fijos (`discoveries/portraitTopics.js`). Se puede
    // repetir sin límite y sin perder coherencia, porque cada respuesta
    // se recalcula siempre desde el progreso real guardado — nunca
    // desde un estado de conversación que haya que recordar a mano.
    const reading = mountReadingPanel(panelEl, { signal: controller.signal });

    function openPortraitPanel(selectedTopicId = null) {
      const currentCastleSecrets = loadCastleSecretsState();
      reading.open(createPortraitPanelMarkup({ act, castleSecrets: currentCastleSecrets, selectedTopicId }), {
        triggerEl: portraitHotspot
      });
      reading.bodyEl?.querySelectorAll('[data-portrait-topic]').forEach((topicButton) => {
        topicButton.addEventListener(
          'click',
          () => openPortraitPanel(topicButton.dataset.portraitTopic),
          { signal: controller.signal }
        );
      });
    }

    portraitHotspot?.addEventListener(
      'click',
      () => {
        openPortraitPanel();
        const wasAlreadyMet = loadCastleSecretsState().portraitMet;
        markPortraitMet();
        if (!wasAlreadyMet) {
          portraitFrame?.classList.remove('archivo-portrait--awake');
          void portraitFrame?.offsetWidth;
          portraitFrame?.classList.add('archivo-portrait--awake');
          portraitHotspot.querySelector('.hotspot__caption').textContent = 'El retrato ya habló contigo';
          portraitHotspot.setAttribute('aria-label', 'Volver a hablar con el retrato');
        }
      },
      { signal: controller.signal }
    );

    // Segunda parada del recorrido secreto de la polilla: siempre
    // presente (no es un candado independiente), pero su texto solo se
    // enriquece una vez que la primera parada (Biblioteca) ya se
    // examinó — lo que cambia es si Andrea RECONOCE la marca, no si el
    // punto existe.
    const archiveMarksHotspot = panelEl.querySelector('[data-archive-marks-hotspot]');
    archiveMarksHotspot?.addEventListener(
      'click',
      () => {
        const currentCastleSecrets = loadCastleSecretsState();
        const recognized = currentCastleSecrets.mothWingNoticed;
        reveal.open(recognized ? ARCHIVE_MARKS_RECOGNIZED_TEXT : ARCHIVE_MARKS_VAGUE_TEXT, {
          triggerEl: archiveMarksHotspot
        });
        if (recognized && !currentCastleSecrets.threeMarksRecognized) {
          markThreeMarksRecognized();
          archiveMarksHotspot.querySelector('.hotspot__caption').textContent = 'Ya reconociste la marca';
          archiveMarksHotspot.setAttribute('aria-label', 'Volver a ver las tres marcas junto a la cerradura');
          refreshCompletedStories();
        }
      },
      { signal: controller.signal }
    );

    // Objeto mágico examinable: el cofre cerrado. Siempre explorable;
    // su lectura cambia una vez reconocido el patrón del recorrido
    // secreto de la polilla (`threeMarksRecognized`, de la fase
    // anterior) — un objeto, dos lecturas, sin inventar una bandera
    // nueva solo para esto.
    const chestHotspot = panelEl.querySelector('[data-chest-hotspot]');
    chestHotspot?.addEventListener(
      'click',
      () => {
        reveal.open(getChestText(loadCastleSecretsState()), { triggerEl: chestHotspot });
        chestHotspot.classList.remove('archivo-chest--examined-pulse');
        void chestHotspot.offsetWidth;
        chestHotspot.classList.add('archivo-chest--examined-pulse');
      },
      { signal: controller.signal }
    );

    if (flamelUnlocked) {
      const cardHotspot = panelEl.querySelector('[data-card-hotspot]');
      cardHotspot?.addEventListener(
        'click',
        () => {
          reveal.open(createCardRevealText(FLAMEL_CARD), { triggerEl: cardHotspot });
          markCardCollected(FLAMEL_CARD.id);
          emitProgressChanged({ type: 'card-collected', id: FLAMEL_CARD.id });
        },
        { signal: controller.signal }
      );
    }

    // El contador y la lista de cromos dependen de qué se haya
    // encontrado — incluido lo que se encuentre aquí mismo (Flamel).
    // En vez de reconstruir toda la escena, solo se vuelve a dibujar
    // este bloque concreto; la lista no tiene listeners propios (usa
    // `<details>` nativo), así que no hay nada que perder al
    // reemplazar su contenido.
    function refreshCardCollection() {
      const slot = panelEl.querySelector('[data-card-collection-slot]');
      if (!slot) return;
      slot.innerHTML = createCollectedCardsListMarkup(getCollectedCards(loadCollectedCardIds()));
    }
    onProgressChanged(refreshCardCollection, { signal: controller.signal });

    // Igual que la colección de cromos: reconocer la marca aquí mismo
    // (ver el hotspot de arriba) puede cerrar «el rastro de la polilla»
    // sin salir de esta escena, así que la lista de historias completas
    // también se vuelve a dibujar en el momento, no solo al reabrir el
    // Archivo.
    function refreshCompletedStories() {
      const slot = panelEl.querySelector('[data-completed-stories-slot]');
      if (!slot) return;
      slot.innerHTML = createDiscoveryListMarkup(
        getCompletedStories({ solvedDays, castleSecrets: loadCastleSecretsState(), ...loadAllGameStates() }),
        { heading: 'Historias completas' }
      );
    }

    // Cuarto minijuego real del proyecto: «el sello correcto». Reutiliza
    // el `reading` y el `reveal` ya montados arriba para el retrato, en
    // vez de un panel propio (ver la nota en `games/sealView.js`).
    const sceneFrameEl = panelEl.querySelector('.scene-frame');
    let sealPulseTimeoutId = null;
    controller.signal.addEventListener('abort', () => clearTimeout(sealPulseTimeoutId));
    mountSealGame(panelEl, {
      signal: controller.signal,
      reveal,
      reading,
      onSolved: () => {
        if (sceneFrameEl) {
          clearTimeout(sealPulseTimeoutId);
          sceneFrameEl.classList.remove('scene-frame--riddle-pulse');
          void sceneFrameEl.offsetWidth;
          sceneFrameEl.classList.add('scene-frame--riddle-pulse');
          sealPulseTimeoutId = setTimeout(() => sceneFrameEl.classList.remove('scene-frame--riddle-pulse'), 1200);
        }
        refreshCompletedStories();
      }
    });

    scheduleOccasionalEvents(panelEl, DEFAULT_AMBIENT_EFFECTS, { signal: controller.signal });

    return () => controller.abort();
  }

  return { html, onMount };
}

// El retrato: siempre presente (no depende de ningún expediente
// resuelto, a diferencia del cromo de Flamel). Su diálogo sí cambia
// con el progreso real (ver `getPortraitLineForAct`), pero eso se
// decide al abrir el panel, nunca en este marcado estático.
function createPortraitMarkup(alreadyMet) {
  const positionStyle = hotspotPositionStyle(PORTRAIT_HOTSPOT_POSITION.desktop, PORTRAIT_HOTSPOT_POSITION.mobile);
  return `
    <div
      class="archivo-portrait${alreadyMet ? ' archivo-portrait--awake' : ''}"
      style="left: 63%; top: 20%; width: 11%; height: 28%;"
      data-portrait-frame
      aria-hidden="true"
    >
      ${createCreatureMarkup({ id: 'retrato-archivo', label: 'Un retrato antiguo, colgado junto a la hornacina' })}
    </div>
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-portrait-hotspot
      aria-label="${alreadyMet ? 'Volver a hablar con el retrato' : 'El retrato parece a punto de decir algo'}"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">${alreadyMet ? 'El retrato ya habló contigo' : 'Un retrato observa'}</span>
    </button>
  `;
}

// Contenido del panel de conversación del retrato. Función pura
// (acto + banderas + tema elegido -> HTML), igual que
// `calendarView.createDetailMarkup`: el saludo es siempre
// `getPortraitLineForAct(act)` (nunca se reescribe aquí), y cada tema
// resuelve su propia respuesta a partir del mismo contexto real.
function createPortraitPanelMarkup({ act, castleSecrets, selectedTopicId }) {
  const topicButtons = PORTRAIT_TOPICS.map(
    (topic) => `
      <button
        type="button"
        class="btn-arcane btn-arcane--ghost portrait-panel__topic"
        data-portrait-topic="${topic.id}"
      >
        ${topic.prompt}
      </button>
    `
  ).join('');

  const selectedTopic = selectedTopicId ? getPortraitTopicById(selectedTopicId) : null;
  const responseMarkup = selectedTopic
    ? `<p class="portrait-panel__response">${selectedTopic.resolve({ act, castleSecrets })}</p>`
    : '';

  return `
    <div class="portrait-panel">
      <p class="portrait-panel__eyebrow">El retrato</p>
      <h3 class="portrait-panel__heading">Una conversación breve</h3>
      <p class="portrait-panel__greeting">${getPortraitLineForAct(act)}</p>
      <div class="portrait-panel__topics">${topicButtons}</div>
      ${responseMarkup}
    </div>
  `;
}

// Segunda parada del recorrido: existe desde el principio, no depende
// de ningún expediente resuelto. `recognized` (haber notado ya la
// primera parada) solo decide qué tan rico es el texto, nunca si el
// hotspot está disponible.
function createArchiveMarksMarkup(mothWingNoticed, alreadyRecognized) {
  const positionStyle = hotspotPositionStyle(ARCHIVE_MARKS_POSITION.desktop, ARCHIVE_MARKS_POSITION.mobile);
  const label = alreadyRecognized
    ? 'Volver a ver las tres marcas junto a la cerradura'
    : mothWingNoticed
      ? 'Unas marcas junto a la cerradura del cofre — algo te suena'
      : 'Unos arañazos finos junto a la cerradura del cofre';
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-archive-marks-hotspot
      aria-label="${label}"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">${alreadyRecognized ? 'Ya reconociste la marca' : 'Unas marcas en la madera'}</span>
    </button>
  `;
}

// El cofre: siempre explorable, sin depender de ningún expediente.
// Reacciona con un breve pulso visual propio al tocarlo (no solo un
// panel de texto), coherente con el resto de objetos interactivos del
// proyecto (el retrato "despierta", el cofre "responde").
function createChestHotspotMarkup() {
  const positionStyle = hotspotPositionStyle(CHEST_HOTSPOT_POSITION.desktop, CHEST_HOTSPOT_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot archivo-chest"
      style="${positionStyle}"
      data-chest-hotspot
      aria-label="El cofre cerrado, en el centro de la hornacina"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Examinar el cofre</span>
    </button>
  `;
}

// Evolución visual persistente: la pila de pergaminos archivados crece
// con el acto narrativo alcanzado (derivada siempre del progreso real,
// nunca un estado aparte que guardar). Puramente decorativa — no es un
// hotspot, no intercepta clics.
function createPapersOverlayMarkup(act) {
  const count = PAPER_COUNT_BY_ACT[act] ?? 0;
  if (count === 0) return '';

  const scrolls = Array.from({ length: count }, (_, i) => {
    const x = (i % 3) * 22;
    const y = Math.floor(i / 3) * 34;
    const tilt = (i % 2 === 0 ? -1 : 1) * (4 + i * 2);
    return `
      <g transform="translate(${x} ${70 - y}) rotate(${tilt})">
        <rect x="0" y="0" width="58" height="16" rx="8" fill="#c9bb9c" stroke="#8c6a3f" stroke-width="1.5" />
      </g>
    `;
  }).join('');

  const { left, top, width, height } = PAPERS_OVERLAY_POSITION;
  return `
    <div
      class="archivo-papers-overlay"
      style="left: ${left}; top: ${top}; width: ${width}; height: ${height};"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">${scrolls}</svg>
    </div>
  `;
}

// Solo existe tras resolver el día 10: antes de eso, ni el hotspot se
// renderiza (no solo se oculta con CSS), para que su destino nunca
// esté en el HTML antes de tiempo.
function createFlamelHotspotMarkup() {
  const positionStyle = hotspotPositionStyle(FLAMEL_POSITION.desktop, FLAMEL_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-card-hotspot
      aria-label="Un cajón entreabierto entre los estantes"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Un cajón entreabierto</span>
    </button>
  `;
}

function createArchivoBackdrop() {
  return `
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <linearGradient id="chest-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a2a18" />
          <stop offset="100%" stop-color="#180f07" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="#0a0c17" />

      <!-- Hornacina de piedra -->
      <path d="M260 500 V240 Q400 150 540 240 V500 Z" fill="#141226" opacity="0.8" />
      <path d="M260 500 V240 Q400 150 540 240 V500" fill="none" stroke="#2a2440" stroke-width="3" opacity="0.6" />

      <!-- Cofre cerrado -->
      <rect x="310" y="380" width="180" height="100" rx="8" fill="url(#chest-wood)" />
      <rect x="310" y="380" width="180" height="24" rx="6" fill="#241708" opacity="0.9" />
      <rect x="388" y="410" width="24" height="28" rx="3" fill="#120a04" stroke="#8c6a3f" stroke-width="1.5" />
      <circle cx="400" cy="422" r="4" fill="#d8b85a" />
    </svg>
    ${createSceneBackgroundMarkup()}
    <span class="scene-key-glint" aria-hidden="true">${createIconMarkup('key')}</span>
    <span class="archive-lock-glow" data-archive-lock-glow aria-hidden="true"></span>
  `;
}
