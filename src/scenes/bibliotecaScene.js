import { createSceneFrameMarkup, mountSceneAmbience } from '../components/sceneFrame.js';
import { createSceneBackgroundMarkup, mountSceneBackground } from './sceneBackground.js';
import { renderCandles } from '../ambient/candles.js';
import { getUnlockedSecrets, getSolvedDays } from '../calendar/discoveries.js';
import { createDiscoveryListMarkup } from '../calendar/discoveriesView.js';
import { loadProgress } from '../calendar/calendarStorage.js';
import { isMothVisibleInBiblioteca } from '../calendar/castleEvents.js';
import { createCreatureMarkup, mountCreature } from '../components/creature.js';
import { scheduleOccasionalEvents, DEFAULT_AMBIENT_EFFECTS } from '../ambient/occasionalEvents.js';
import { createMagicRevealMarkup, mountMagicReveal } from '../components/magicReveal.js';
import { getCardById } from '../collectibles/cardsData.js';
import { createCardRevealText } from '../collectibles/cardsView.js';
import { markCardCollected } from '../collectibles/cardsStorage.js';
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';
import { BOOK_ANNOTATION, LIBRARY_PORTRAIT_ECHO_TEXT } from '../discoveries/libraryBookContent.js';
import {
  loadCastleSecretsState,
  markBookDiscovered,
  markMothWingNoticed,
  markColdDraftFeltLibrary
} from '../discoveries/castleSecretsStorage.js';
import { MOTH_WING_DETAIL_TEXT } from '../discoveries/mothTrailContent.js';
import { getCurrentAct } from '../calendar/actProgress.js';
import { LAMP_REVEAL_TEXT } from '../discoveries/examinableObjectsContent.js';
import { COLD_DRAFT_LIBRARY_TEXT } from '../discoveries/coldDraftContent.js';
import { createCatalogMarkup, mountCatalogGame } from '../games/catalogView.js';

// Posiciones `mobile` rediseñadas en conjunto (mismo criterio ya
// aplicado al Vestíbulo, el Mapa, el Archivo y la Sala de los
// Menesteres): en pantallas angostas `.scene-frame__content`
// (eyebrow + título + descripción, con su propio fondo opaco) cubre
// más de la mitad superior de la escena — los nueve puntos de la
// Biblioteca (cinco ya existentes más los cuatro del «catálogo
// imposible») se reparten ahora en una cuadrícula de hasta 4×3 por
// debajo de ese panel, con ≥18% de separación entre cualquier par.
const RAVENCLAW_CARD = getCardById('ravenclaw');
const RAVENCLAW_POSITION = {
  desktop: { x: 88, y: 28 },
  mobile: { x: 38, y: 60 }
};

const BOOK_POSITION = {
  desktop: { x: 40, y: 56 },
  mobile: { x: 15, y: 76 }
};

const PORTRAIT_ECHO_POSITION = {
  desktop: { x: 65, y: 63 },
  mobile: { x: 85, y: 60 }
};

const MOTH_WING_DETAIL_POSITION = {
  desktop: { x: 15, y: 50 },
  mobile: { x: 62, y: 60 }
};

const LAMP_HOTSPOT_POSITION = {
  desktop: { x: 50, y: 16 },
  mobile: { x: 15, y: 60 }
};
// Puramente decorativo (el resplandor de la lámpara): se queda en su
// posición original, junto al techo donde está la lámpara en la foto
// — a diferencia del botón, no necesita moverse para seguir siendo
// visible, porque no compite por espacio de lectura con el texto.
const LAMP_GLOW_POSITION = { left: '50%', top: '16%', width: '7%', height: '12%' };
// Opacidad del resplandor de la lámpara: crece con el acto, evolución
// visual persistente (no solo texto ni partículas) derivada siempre
// del progreso real.
const LAMP_GLOW_OPACITY_BY_ACT = { 0: 0.18, 1: 0.32, 2: 0.48, 3: 0.66, 4: 0.85 };

const COLD_DRAFT_HOTSPOT_POSITION = {
  desktop: { x: 25, y: 40 },
  mobile: { x: 38, y: 76 }
};

const BACKGROUND_SRC = {
  desktopSrc: '/assets/backgrounds/biblioteca-desktop.jpg',
  mobileSrc: '/assets/backgrounds/biblioteca-mobile.jpg'
};

const MOTH_SRC = {
  webmSrc: '/assets/creatures/polilla.webm',
  pngSrc: '/assets/creatures/polilla.png'
};

export function renderBiblioteca(section) {
  const solvedDays = getSolvedDays(loadProgress());
  const unlockedSecrets = getUnlockedSecrets({ location: 'biblioteca' });
  const mothVisible = isMothVisibleInBiblioteca(solvedDays);
  const castleSecrets = loadCastleSecretsState();
  const act = getCurrentAct(solvedDays);

  const html = `
    <div data-scene-root>
      ${createSceneFrameMarkup({
        id: section.id,
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        pendingItems: section.pendingItems,
        backdropMarkup: createBibliotecaBackdrop(),
        extraContent: createDiscoveryListMarkup(unlockedSecrets),
        overlayContent:
          (mothVisible ? createBibliotecaMothMarkup() : '') +
          createCardHotspotMarkup() +
          createBookHotspotMarkup(castleSecrets.bookDiscovered) +
          (castleSecrets.portraitMet ? createPortraitEchoHotspotMarkup() : '') +
          createMothWingDetailMarkup(castleSecrets.mothWingNoticed) +
          createLampMarkup(act) +
          createColdDraftHotspotMarkup(castleSecrets.coldDraftFeltLibrary) +
          createMagicRevealMarkup() +
          createCatalogMarkup()
      })}
    </div>
  `;

  function onMount(panelEl) {
    mountSceneAmbience(panelEl, { count: 10 });

    // Velas de lectura: calidez discreta sobre las mesas, reutilizando
    // el mismo componente ya usado en el resto del proyecto.
    const readingCandles = panelEl.querySelector('[data-reading-candles]');
    renderCandles(readingCandles, { count: 2 });

    const controller = new AbortController();
    const backdropEl = panelEl.querySelector('.scene-frame__backdrop');
    mountSceneBackground(backdropEl, BACKGROUND_SRC, { signal: controller.signal });

    if (mothVisible) {
      const mothEl = panelEl.querySelector('[data-creature="polilla-biblioteca"]');
      mountCreature(mothEl, MOTH_SRC, { signal: controller.signal });
    }

    const reveal = mountMagicReveal(panelEl, { signal: controller.signal });
    const cardHotspot = panelEl.querySelector('[data-card-hotspot]');
    cardHotspot?.addEventListener(
      'click',
      () => {
        reveal.open(createCardRevealText(RAVENCLAW_CARD), { triggerEl: cardHotspot });
        markCardCollected(RAVENCLAW_CARD.id);
      },
      { signal: controller.signal }
    );

    const bookHotspot = panelEl.querySelector('[data-book-hotspot]');
    bookHotspot?.addEventListener(
      'click',
      () => {
        reveal.open(BOOK_ANNOTATION, { triggerEl: bookHotspot });
        const wasAlreadyDiscovered = loadCastleSecretsState().bookDiscovered;
        markBookDiscovered();
        if (!wasAlreadyDiscovered) {
          bookHotspot.querySelector('.hotspot__caption').textContent = 'Ya leíste este libro';
          bookHotspot.setAttribute('aria-label', 'Volver a leer el libro sin título');
        }
      },
      { signal: controller.signal }
    );

    const portraitEchoHotspot = panelEl.querySelector('[data-portrait-echo-hotspot]');
    portraitEchoHotspot?.addEventListener(
      'click',
      () => reveal.open(LIBRARY_PORTRAIT_ECHO_TEXT, { triggerEl: portraitEchoHotspot }),
      { signal: controller.signal }
    );

    // Primera parada del recorrido secreto de la polilla (ver
    // `discoveries/mothTrailContent.js`): siempre explorable, nunca
    // depende de los expedientes. Lo que ves aquí ayuda a reconocer
    // algo en el Archivo Secreto.
    const mothWingHotspot = panelEl.querySelector('[data-moth-wing-hotspot]');
    mothWingHotspot?.addEventListener(
      'click',
      () => {
        reveal.open(MOTH_WING_DETAIL_TEXT, { triggerEl: mothWingHotspot });
        const wasAlreadyNoticed = loadCastleSecretsState().mothWingNoticed;
        markMothWingNoticed();
        if (!wasAlreadyNoticed) {
          mothWingHotspot.querySelector('.hotspot__caption').textContent = 'Ya examinaste el ala';
          mothWingHotspot.setAttribute('aria-label', 'Volver a examinar el ala de la polilla en el margen');
        }
      },
      { signal: controller.signal }
    );

    // Objeto mágico examinable: la lámpara de latón. Siempre presente;
    // reacciona con un breve destello (no solo un panel de texto) al
    // tocarla.
    const lampGlow = panelEl.querySelector('[data-lamp-glow]');
    const lampHotspot = panelEl.querySelector('[data-lamp-hotspot]');
    lampHotspot?.addEventListener(
      'click',
      () => {
        reveal.open(LAMP_REVEAL_TEXT, { triggerEl: lampHotspot });
        lampGlow?.classList.remove('biblioteca-lamp-glow--flare');
        void lampGlow?.offsetWidth;
        lampGlow?.classList.add('biblioteca-lamp-glow--flare');
      },
      { signal: controller.signal }
    );

    // Segunda manifestación de «la corriente fría» (ver
    // `discoveries/coldDraftContent.js`): siempre presente, nunca un
    // candado. La primera manifestación es puramente ambiental, en el
    // Vestíbulo (`vestibuloScene.js`); esta es la primera que se puede
    // examinar de verdad.
    const coldDraftHotspot = panelEl.querySelector('[data-cold-draft-hotspot]');
    coldDraftHotspot?.addEventListener(
      'click',
      () => {
        reveal.open(COLD_DRAFT_LIBRARY_TEXT, { triggerEl: coldDraftHotspot });
        markColdDraftFeltLibrary();
      },
      { signal: controller.signal }
    );

    // Segundo minijuego real del proyecto: «el catálogo imposible».
    // Misma estructura que `mountMothLockGame` en la Sala de los
    // Menesteres (hotspots de pista + hotspot central que abre un
    // panel propio), con su propio pulso de castillo al resolverse.
    const sceneFrameEl = panelEl.querySelector('.scene-frame');
    let catalogPulseTimeoutId = null;
    controller.signal.addEventListener('abort', () => clearTimeout(catalogPulseTimeoutId));
    mountCatalogGame(panelEl, {
      signal: controller.signal,
      reveal,
      onSolved: () => {
        if (!sceneFrameEl) return;
        clearTimeout(catalogPulseTimeoutId);
        sceneFrameEl.classList.remove('scene-frame--riddle-pulse');
        void sceneFrameEl.offsetWidth;
        sceneFrameEl.classList.add('scene-frame--riddle-pulse');
        catalogPulseTimeoutId = setTimeout(() => sceneFrameEl.classList.remove('scene-frame--riddle-pulse'), 1200);
      }
    });

    scheduleOccasionalEvents(panelEl, DEFAULT_AMBIENT_EFFECTS, { signal: controller.signal });

    return () => controller.abort();
  }

  return { html, onMount };
}

// La polilla se posa en el rincón de la balconada izquierda, entre los
// libros — el mismo tipo de lugar donde ya se la describe en el
// capítulo del día 4 ("la misma silueta de polilla"). Si el recurso
// gráfico (`polilla.webm`/`.png`) todavía no existe, `mountCreature`
// la deja oculta por completo: no hay nada roto que mostrar.
function createBibliotecaMothMarkup() {
  return `
    <div class="scene-moth" style="left: 11%; top: 34%; width: 5%; height: 5%;">
      ${createCreatureMarkup({ id: 'polilla-biblioteca', label: 'Una polilla plateada, posada entre los libros' })}
    </div>
  `;
}

// Un cromo de rana de chocolate, perdido entre los libros de la
// balconada derecha — explorable desde el principio, sin depender del
// progreso de los expedientes.
function createCardHotspotMarkup() {
  const positionStyle = hotspotPositionStyle(RAVENCLAW_POSITION.desktop, RAVENCLAW_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-card-hotspot
      aria-label="Algo asoma entre los libros de la balconada"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Algo asoma aquí</span>
    </button>
  `;
}

// Un libro sin título, fuera de su estante — explorable desde el
// principio, igual que el cromo. Su anotación original menciona un
// detalle que luego tiene una consecuencia real en el Mapa (ver
// `data/mapLocations.js`, lugar `eco-del-libro`, y
// `discoveries/castleSecretsStorage.js`).
function createBookHotspotMarkup(alreadyDiscovered) {
  const positionStyle = hotspotPositionStyle(BOOK_POSITION.desktop, BOOK_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-book-hotspot
      aria-label="${alreadyDiscovered ? 'Volver a leer el libro sin título' : 'Un libro sin título, fuera de su estante'}"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">${alreadyDiscovered ? 'Ya leíste este libro' : 'Un libro fuera de lugar'}</span>
    </button>
  `;
}

// Solo existe tras hablar con el retrato del Archivo Secreto (ver
// `archivoScene.js`): la consecuencia real, en otra escena, de esa
// conversación. No se renderiza en absoluto antes de esa condición,
// igual que el resto de contenido gateado del proyecto.
function createPortraitEchoHotspotMarkup() {
  const positionStyle = hotspotPositionStyle(PORTRAIT_ECHO_POSITION.desktop, PORTRAIT_ECHO_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-portrait-echo-hotspot
      aria-label="Una vela que no debería estar encendida"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Una vela encendida</span>
    </button>
  `;
}

// Primera parada del recorrido secreto (ver `discoveries/mothTrailContent.js`):
// un detalle que ya podría haber notado cualquiera que haya visto el
// dibujo de la polilla en los márgenes de los libros (secreto del día
// 4, `calendar/secretsData.js`), llevado un poco más lejos.
function createMothWingDetailMarkup(alreadyNoticed) {
  const positionStyle = hotspotPositionStyle(MOTH_WING_DETAIL_POSITION.desktop, MOTH_WING_DETAIL_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-moth-wing-hotspot
      aria-label="${alreadyNoticed ? 'Volver a examinar el ala de la polilla en el margen' : 'Un dibujo de polilla en el margen de un libro'}"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">${alreadyNoticed ? 'Ya examinaste el ala' : 'Mirar más de cerca'}</span>
    </button>
  `;
}

// La lámpara: evolución visual persistente (su resplandor crece con el
// acto, ver `LAMP_GLOW_OPACITY_BY_ACT`) y objeto mágico examinable a
// la vez — un único elemento coherente, no dos mecanismos distintos.
// El resplandor es un overlay con el mismo z-index ya usado por
// `.archivo-portrait`/`.scene-moth`, para quedar por encima de la foto
// real cuando ya cargó.
function createLampMarkup(act) {
  const positionStyle = hotspotPositionStyle(LAMP_HOTSPOT_POSITION.desktop, LAMP_HOTSPOT_POSITION.mobile);
  const opacity = LAMP_GLOW_OPACITY_BY_ACT[act] ?? LAMP_GLOW_OPACITY_BY_ACT[0];
  const { left, top, width, height } = LAMP_GLOW_POSITION;
  return `
    <div
      class="biblioteca-lamp-glow"
      data-lamp-glow
      style="left: ${left}; top: ${top}; width: ${width}; height: ${height}; --lamp-glow-opacity: ${opacity};"
      aria-hidden="true"
    ></div>
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-lamp-hotspot
      aria-label="Una lámpara de latón, colgada sobre las mesas de lectura"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">Examinar la lámpara</span>
    </button>
  `;
}

// Segunda manifestación de la corriente fría: siempre explorable.
function createColdDraftHotspotMarkup(alreadyFelt) {
  const positionStyle = hotspotPositionStyle(COLD_DRAFT_HOTSPOT_POSITION.desktop, COLD_DRAFT_HOTSPOT_POSITION.mobile);
  return `
    <button
      type="button"
      class="hotspot hotspot--mystery map-hotspot"
      style="${positionStyle}"
      data-cold-draft-hotspot
      aria-label="${alreadyFelt ? 'Volver a sentir el frío entre los estantes' : 'Un frío inexplicable entre dos estantes'}"
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__caption" aria-hidden="true">${alreadyFelt ? 'Ya sentiste este frío' : 'Hace frío aquí'}</span>
    </button>
  `;
}

function createBibliotecaBackdrop() {
  const shelfRows = [120, 200, 280, 360, 440];
  const books = shelfRows
    .map((y, rowIndex) => {
      let x = 40;
      const cells = [];
      const count = 14 + (rowIndex % 3);
      for (let i = 0; i < count; i += 1) {
        const w = 10 + ((i * 7 + rowIndex * 3) % 10);
        const h = 34 + ((i * 5) % 14);
        const tone = ['#8c6a3f', '#5a4a2e', '#3a3350', '#6b5530', '#242038'][i % 5];
        cells.push(`<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${tone}" opacity="0.85" />`);
        x += w + 2;
        if (x > 760) break;
      }
      return cells.join('');
    })
    .join('');

  return `
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <radialGradient id="lib-lamp" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#d8b85a" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#d8b85a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="#0c0f1c" />
      <circle cx="400" cy="120" r="220" fill="url(#lib-lamp)" />

      ${shelfRows
        .map((y) => `<rect x="20" y="${y}" width="760" height="8" fill="#1c1833" opacity="0.9" />`)
        .join('')}
      ${books}

      <line x1="620" y1="500" x2="700" y2="140" stroke="#3a3350" stroke-width="4" opacity="0.5" />
      <line x1="636" y1="500" x2="716" y2="140" stroke="#3a3350" stroke-width="4" opacity="0.5" />
      <line x1="620" y1="440" x2="716" y2="420" stroke="#3a3350" stroke-width="4" opacity="0.4" />
      <line x1="620" y1="320" x2="716" y2="300" stroke="#3a3350" stroke-width="4" opacity="0.4" />
    </svg>
    ${createSceneBackgroundMarkup()}
    <div class="scene-reading-candles" data-reading-candles aria-hidden="true"></div>
  `;
}
