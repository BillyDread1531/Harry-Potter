import { createIconMarkup } from '../components/icons.js';
import { renderCandles } from '../ambient/candles.js';
import { renderParticles } from '../ambient/particles.js';
import { createSceneBackgroundMarkup, mountSceneBackground } from './sceneBackground.js';
import { createCreatureMarkup, mountCreature } from '../components/creature.js';
import { createMagicRevealMarkup, mountMagicReveal } from '../components/magicReveal.js';
import { getCardById } from '../collectibles/cardsData.js';
import { createCardRevealText } from '../collectibles/cardsView.js';
import { markCardCollected } from '../collectibles/cardsStorage.js';
import { createReadingPanelMarkup, mountReadingPanel } from '../components/readingPanel.js';
import { createLetterBodyMarkup, createInstructionsBodyMarkup } from '../letter/letterView.js';
import { isLetterRead, markLetterRead } from '../letter/letterStorage.js';
import { isNightInGuatemala } from '../calendar/guatemalaTime.js';
import { loadCastleSecretsState } from '../discoveries/castleSecretsStorage.js';
import { getOwlLine } from '../discoveries/owlContent.js';
import { getColdDraftPhase } from '../discoveries/coldDraftContent.js';
import { getSolvedDays } from '../calendar/discoveries.js';
import { loadProgress } from '../calendar/calendarStorage.js';

const DUMBLEDORE_CARD = getCardById('dumbledore');

const BACKGROUND_SRC = {
  desktopSrc: '/assets/backgrounds/vestibule-desktop.jpg',
  mobileSrc: '/assets/backgrounds/vestibule-mobile.jpg'
};

const PATRONUS_SRC = {
  webmSrc: '/assets/creatures/patronus.webm',
  pngSrc: '/assets/creatures/patronus.png'
};

const PORTRAIT_SRC = {
  pngSrc: '/assets/creatures/retrato.png'
};

// Todavía no existe ningún recurso gráfico para la lechuza (ver el
// prompt para Gemini en el informe de esta fase): `mountCreature` la
// deja oculta por completo mientras tanto, sin romper nada — el
// hotspot que la acompaña es un botón independiente, así que la
// interacción ya funciona hoy mismo, aunque la imagen todavía no.
const OWL_SRC = {
  webmSrc: '/assets/creatures/lechuza.webm',
  pngSrc: '/assets/creatures/lechuza.png'
};

const MOTH_SRC = {
  webmSrc: '/assets/creatures/polilla.webm',
  pngSrc: '/assets/creatures/polilla.png'
};

/**
 * El vestíbulo es el único lugar sin `scene-frame`: una composición
 * propia, a pantalla completa y sin borde, en primera persona, por
 * capas (fondo, arquitectura, iluminación, niebla, destellos, objetos
 * interactivos, criaturas). Los destellos viven en la misma capa que
 * la foto, por encima de ella, no en un fondo de página aparte.
 *
 * El fondo fotográfico definitivo (`sceneBackground.js`) y la criatura
 * de ejemplo (`creature.js`) ya están conectados, pero mientras esos
 * recursos no existan en `public/assets/`, la capa procedimental en
 * SVG/CSS de la Fase 1.5 sigue siendo lo que se ve: ese arte queda
 * debajo del fondo fotográfico (z-index más bajo) y solo se tapa
 * cuando la foto carga con éxito, nunca se elimina del DOM.
 */
export function renderVestibulo(section, { onNavigate } = {}) {
  const letterAlreadyRead = isLetterRead();
  const night = isNightInGuatemala(new Date());
  const castleSecrets = loadCastleSecretsState();
  const coldDraftResolved = getColdDraftPhase(castleSecrets) === 'resolved';
  const solvedDays = getSolvedDays(loadProgress());
  const highestSolvedDay = solvedDays.size ? Math.max(...solvedDays) : 0;

  const html = `
    <section class="vestibulo-scene" data-vestibulo-scene>
      <div
        class="vestibulo-scene__layer vestibulo-scene__layer--window"
        data-depth="-3"
        aria-hidden="true"
      >
        ${createWindowMarkup(night)}
      </div>

      <div
        class="vestibulo-scene__layer vestibulo-scene__layer--hall"
        data-depth="8"
        aria-hidden="true"
      >
        ${createHallMarkup()}
      </div>

      ${createSceneBackgroundMarkup({ depth: -3 })}

      <div
        class="vestibulo-scene__time-tint vestibulo-scene__time-tint--${night ? 'night' : 'day'}"
        aria-hidden="true"
      ></div>

      <div
        class="vestibulo-scene__draft-overlay${coldDraftResolved ? ' vestibulo-scene__draft-overlay--resolved' : ''}"
        data-draft-overlay
        aria-hidden="true"
      ></div>

      <div
        class="vestibulo-scene__layer vestibulo-scene__layer--architecture"
        data-depth="12"
        data-scene-architecture
        aria-hidden="true"
      ></div>

      <div
        class="vestibulo-scene__layer vestibulo-scene__layer--lighting"
        data-depth="5"
        data-scene-lighting
        aria-hidden="true"
      ></div>

      <div class="vestibulo-scene__fog" aria-hidden="true">
        <span class="vestibulo-scene__fog-blob vestibulo-scene__fog-blob--a"></span>
        <span class="vestibulo-scene__fog-blob vestibulo-scene__fog-blob--b"></span>
      </div>

      <div class="vestibulo-scene__candles" data-vestibulo-candles aria-hidden="true"></div>

      <div
        class="vestibulo-scene__sparkles"
        data-vestibulo-sparkles
        data-depth="6"
        aria-hidden="true"
      ></div>

      ${createHotspot({
        id: 'biblioteca',
        icon: 'book',
        label: 'Entrar a la Biblioteca',
        className: 'hotspot vestibulo-scene__hotspot vestibulo-scene__hotspot--biblioteca'
      })}
      ${createHotspot({
        id: 'archivo',
        icon: 'key',
        label: 'Examinar el compartimento cerrado',
        className: 'hotspot vestibulo-scene__hotspot vestibulo-scene__hotspot--archivo'
      })}
      ${createHotspot({
        id: 'expedientes',
        icon: 'scroll',
        label: 'Acercarse al escritorio de los Expedientes',
        className: 'hotspot vestibulo-scene__hotspot vestibulo-scene__hotspot--expedientes'
      })}
      ${createHotspot({
        id: 'mapa',
        icon: 'map',
        label: 'Desenrollar el Mapa del Castillo',
        className: 'hotspot vestibulo-scene__hotspot vestibulo-scene__hotspot--mapa'
      })}
      ${createHotspot({
        id: 'desafios',
        icon: 'wand',
        label: 'Algo en este muro no es lo que parece',
        className: 'hotspot hotspot--mystery vestibulo-scene__hotspot vestibulo-scene__hotspot--desafios'
      })}

      <div class="vestibulo-scene__creatures" aria-hidden="true">
        ${createCreatureMarkup({ id: 'patronus', label: 'Un Patronus protector', depth: 14 })}
      </div>

      <div class="vestibulo-scene__portrait-frame" aria-hidden="true">
        ${createCreatureMarkup({ id: 'retrato', label: 'Un retrato antiguo que parece seguirte con la mirada' })}
      </div>

      <div class="vestibulo-scene__owl" aria-hidden="true">
        ${createCreatureMarkup({ id: 'lechuza', label: 'Una lechuza posada en el alféizar de la ventana' })}
      </div>
      <button
        type="button"
        class="hotspot hotspot--mystery vestibulo-scene__hotspot vestibulo-scene__hotspot--owl"
        data-owl-hotspot
        aria-label="Una lechuza parece observar desde la ventana"
      >
        <span class="hotspot__glow" aria-hidden="true"></span>
        <span class="hotspot__caption" aria-hidden="true">Mirar a la lechuza</span>
      </button>

      <div class="vestibulo-scene__moth-crossing" data-moth-crossing aria-hidden="true">
        ${createCreatureMarkup({ id: 'polilla-cruce', label: '' })}
      </div>

      <button
        type="button"
        class="hotspot hotspot--mystery vestibulo-scene__hotspot vestibulo-scene__hotspot--patronus-glint"
        data-card-hotspot
        aria-label="El retrato del rincón parece observarte"
      >
        <span class="hotspot__glow" aria-hidden="true"></span>
        <span class="hotspot__caption" aria-hidden="true">Mirar el retrato</span>
      </button>

      <button
        type="button"
        class="hotspot vestibulo-scene__hotspot vestibulo-scene__hotspot--letter${
          letterAlreadyRead ? ' vestibulo-scene__hotspot--letter-read' : ''
        }"
        data-letter-hotspot
        aria-label="${letterAlreadyRead ? 'Volver a leer la carta de bienvenida' : 'Una carta parece esperarte'}"
      >
        <span class="hotspot__glow" aria-hidden="true"></span>
        ${createEnvelopeMarkup()}
        <span class="hotspot__caption" aria-hidden="true">${letterAlreadyRead ? 'Releer la carta' : 'Una carta te espera'}</span>
      </button>

      <button
        type="button"
        class="hotspot vestibulo-scene__hotspot vestibulo-scene__hotspot--instructions"
        data-instructions-hotspot
        aria-label="Consultar las instrucciones de la aventura"
      >
        <span class="hotspot__glow" aria-hidden="true"></span>
        <span class="hotspot__badge" aria-hidden="true">
          <span class="hotspot__badge-icon">${createIconMarkup('scroll')}</span>
        </span>
        <span class="hotspot__caption" aria-hidden="true">
          <span class="hotspot__caption-icon">${createIconMarkup('scroll')}</span>
          Instrucciones
        </span>
      </button>

      ${createMagicRevealMarkup()}
      ${createReadingPanelMarkup()}
    </section>
  `;

  function onMount(panelEl) {
    const scene = panelEl.querySelector('[data-vestibulo-scene]');
    const candleLayer = panelEl.querySelector('[data-vestibulo-candles]');
    renderCandles(candleLayer, { count: 4 });

    const sparkleLayer = panelEl.querySelector('[data-vestibulo-sparkles]');
    renderParticles(sparkleLayer, { count: 16 });

    panelEl.querySelectorAll('[data-goto]').forEach((hotspot) => {
      hotspot.addEventListener('click', () => onNavigate?.(hotspot.dataset.goto));
    });

    const controller = new AbortController();
    mountSceneBackground(scene, BACKGROUND_SRC, { signal: controller.signal });
    mountCreature(scene.querySelector('[data-creature="patronus"]'), PATRONUS_SRC, {
      signal: controller.signal
    });
    mountCreature(scene.querySelector('[data-creature="retrato"]'), PORTRAIT_SRC, {
      signal: controller.signal
    });
    mountCreature(scene.querySelector('[data-creature="lechuza"]'), OWL_SRC, {
      signal: controller.signal
    });

    const reveal = mountMagicReveal(panelEl, { signal: controller.signal });
    const cardHotspot = panelEl.querySelector('[data-card-hotspot]');
    const portraitFrame = panelEl.querySelector('.vestibulo-scene__portrait-frame');
    cardHotspot?.addEventListener(
      'click',
      () => {
        // El retrato "responde": un breve resplandor, no solo el panel
        // de texto. Respeta `prefers-reduced-motion` desde el propio CSS.
        portraitFrame?.classList.remove('vestibulo-scene__portrait-frame--awake');
        void portraitFrame?.offsetWidth;
        portraitFrame?.classList.add('vestibulo-scene__portrait-frame--awake');
        reveal.open(createCardRevealText(DUMBLEDORE_CARD), { triggerEl: cardHotspot });
        markCardCollected(DUMBLEDORE_CARD.id);
      },
      { signal: controller.signal }
    );

    // Carta de bienvenida e instrucciones comparten el mismo panel de
    // lectura (más grande que `magicReveal`, pensado para texto largo).
    const reading = mountReadingPanel(panelEl, { signal: controller.signal });
    const letterHotspot = panelEl.querySelector('[data-letter-hotspot]');
    letterHotspot?.addEventListener(
      'click',
      () => {
        reading.open(createLetterBodyMarkup(), { triggerEl: letterHotspot });
        // El botón "Terminar de leer" vive dentro del HTML que se acaba
        // de insertar: se cablea aquí, cada vez, porque `reading.open`
        // reemplaza por completo el contenido anterior (nunca queda un
        // botón viejo con un listener duplicado).
        reading.bodyEl
          ?.querySelector('[data-letter-finish]')
          ?.addEventListener(
            'click',
            () => {
              markLetterRead();
              letterHotspot.classList.add('vestibulo-scene__hotspot--letter-read');
              letterHotspot.setAttribute('aria-label', 'Volver a leer la carta de bienvenida');
              reading.close();
            },
            { signal: controller.signal }
          );
      },
      { signal: controller.signal }
    );

    const instructionsHotspot = panelEl.querySelector('[data-instructions-hotspot]');
    instructionsHotspot?.addEventListener(
      'click',
      () => reading.open(createInstructionsBodyMarkup(), { triggerEl: instructionsHotspot }),
      { signal: controller.signal }
    );

    // La lechuza: interacción breve y opcional. Reacciona visualmente al
    // tocarla (igual que el retrato), y su línea cambia si ya se
    // descubrió el libro de la Biblioteca — la "reacción especial"
    // ligada a algo que Andrea ya encontró en otra escena.
    const owlEl = panelEl.querySelector('.vestibulo-scene__owl');
    const owlHotspot = panelEl.querySelector('[data-owl-hotspot]');
    owlHotspot?.addEventListener(
      'click',
      () => {
        owlEl?.classList.remove('vestibulo-scene__owl--awake');
        void owlEl?.offsetWidth;
        owlEl?.classList.add('vestibulo-scene__owl--awake');
        reveal.open(
          getOwlLine({ day: highestSolvedDay, bookDiscovered: loadCastleSecretsState().bookDiscovered }),
          { triggerEl: owlHotspot }
        );
      },
      { signal: controller.signal }
    );

    // Vida ambiental contextual: una criatura que, de vez en cuando,
    // cruza el vestíbulo — nunca gatea nada (es puramente decorativa),
    // nunca se repite dentro de la misma visita, respeta
    // `prefers-reduced-motion` y no reproduce ningún sonido.
    let mothCrossingTimeoutId = null;
    let mothCrossingClearId = null;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const mothCrossingEl = panelEl.querySelector('[data-moth-crossing]');
      mountCreature(mothCrossingEl?.querySelector('[data-creature]'), MOTH_SRC, { signal: controller.signal });
      mothCrossingTimeoutId = setTimeout(() => {
        mothCrossingEl?.classList.add('vestibulo-scene__moth-crossing--active');
        mothCrossingClearId = setTimeout(
          () => mothCrossingEl?.classList.remove('vestibulo-scene__moth-crossing--active'),
          6000
        );
      }, 18000 + Math.random() * 22000);
    }
    controller.signal.addEventListener('abort', () => {
      clearTimeout(mothCrossingTimeoutId);
      clearTimeout(mothCrossingClearId);
    });

    // Primera manifestación de «la corriente fría» (ver
    // `discoveries/coldDraftContent.js`): puramente ambiental, sin
    // texto ni clic — las velas y la niebla destellan un instante en
    // frío plateado en vez del dorado habitual. Se repite, pero poco
    // (igual de infrecuente que el resto de apariciones ambientales),
    // y deja de programarse para siempre en cuanto se resuelve en la
    // Sala de los Menesteres — la consecuencia persistente de
    // resolverla, no solo un texto.
    let coldDraftFlickerTimeoutId = null;
    let coldDraftFlickerClearId = null;
    if (!coldDraftResolved && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const draftOverlayEl = panelEl.querySelector('[data-draft-overlay]');
      const scheduleColdDraftFlicker = () => {
        coldDraftFlickerTimeoutId = setTimeout(() => {
          draftOverlayEl?.classList.add('vestibulo-scene__draft-overlay--flicker');
          coldDraftFlickerClearId = setTimeout(() => {
            draftOverlayEl?.classList.remove('vestibulo-scene__draft-overlay--flicker');
            scheduleColdDraftFlicker();
          }, 2200);
        }, 20000 + Math.random() * 25000);
      };
      scheduleColdDraftFlicker();
    }
    controller.signal.addEventListener('abort', () => {
      clearTimeout(coldDraftFlickerTimeoutId);
      clearTimeout(coldDraftFlickerClearId);
    });

    initParallax(scene);

    return () => controller.abort();
  }

  return { html, onMount };
}

/**
 * Sobre cerrado con sello de cera, dibujado en SVG (sin recurso nuevo):
 * papel envejecido, solapa triangular y un sello circular con un
 * pequeño brillo, consistente con la paleta dorado/pergamino del resto
 * del proyecto.
 */
function createEnvelopeMarkup() {
  return `
    <svg class="letter-envelope" viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="4" width="60" height="40" rx="2" fill="#e8dcc3" stroke="#8c6a3f" stroke-width="1.5" />
      <path d="M2 6 L32 28 L62 6" fill="none" stroke="#8c6a3f" stroke-width="1.5" stroke-linejoin="round" />
      <circle cx="32" cy="26" r="7" fill="#7a2a2a" stroke="#5a1d1d" stroke-width="1" />
      <circle cx="32" cy="26" r="7" fill="none" stroke="#9a3a3a" stroke-width="0.6" opacity="0.6" />
      <circle cx="29.5" cy="23.5" r="1.6" fill="#b96060" opacity="0.5" />
    </svg>
  `;
}

function createHotspot({ id, icon, label, className }) {
  return `
    <button type="button" class="${className}" data-goto="${id}" aria-label="${label}">
      <span class="hotspot__glow" aria-hidden="true"></span>
      <span class="hotspot__badge" aria-hidden="true">
        <span class="hotspot__badge-icon">${createIconMarkup(icon)}</span>
      </span>
      <span class="hotspot__caption" aria-hidden="true">
        <span class="hotspot__caption-icon">${createIconMarkup(icon)}</span>
        ${label}
      </span>
    </button>
  `;
}

// La ventana muestra una variante distinta según sea de noche o de día
// en Guatemala (`calendar/guatemalaTime.isNightInGuatemala`), calculada
// siempre a partir de esa zona horaria concreta, nunca del reloj del
// dispositivo de quien visita — así da igual desde dónde se abra el
// sitio. Es un cambio de ambientación discreto, sin animación, sin
// audio y sin que nada dependa de él: la escena funciona igual de bien
// en cualquiera de las dos variantes.
function createWindowMarkup(night = true) {
  const skyTop = night ? '#1a2244' : '#4d6fb3';
  const skyBottom = night ? '#0a0d1a' : '#9fb8dd';
  const celestialBody = night
    ? `<circle cx="545" cy="240" r="26" fill="#e7edf4" opacity="0.92" />
       <circle cx="552" cy="234" r="23" fill="#0a0d1a" opacity="0.5" />`
    : `<circle cx="545" cy="240" r="24" fill="#f6e3a8" opacity="0.95" />
       <circle cx="545" cy="240" r="34" fill="#f6e3a8" opacity="0.18" />`;

  return `
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${skyTop}" />
          <stop offset="100%" stop-color="${skyBottom}" />
        </linearGradient>
        <clipPath id="window-clip">
          <path d="M430 560 V300 Q430 190 500 190 Q570 190 570 300 V560 Z" />
        </clipPath>
      </defs>

      <g clip-path="url(#window-clip)">
        <rect x="400" y="140" width="200" height="440" fill="url(#sky-grad)" />
        ${celestialBody}
        <g opacity="0.8" fill="#121833">
          <path d="M430 560 L430 470 L450 470 L450 440 L470 440 L470 470 L500 470 L500 400 L520 400 L520 370 L540 370 L540 400 L560 400 L560 470 L570 470 L570 560 Z" />
        </g>
        <g fill="#d8b85a" opacity="0.8">
          <rect x="462" y="452" width="4" height="7" />
          <rect x="524" y="382" width="4" height="7" />
        </g>
      </g>

      <path
        d="M430 560 V300 Q430 190 500 190 Q570 190 570 300 V560"
        fill="none"
        stroke="#6a5a33"
        stroke-width="6"
        opacity="0.55"
      />
      <path
        d="M430 560 V300 Q430 190 500 190 Q570 190 570 300 V560"
        fill="none"
        stroke="#d8b85a"
        stroke-width="1.4"
        opacity="0.45"
      />
    </svg>
  `;
}

function createHallMarkup() {
  const leftPillars = [
    { x: 60, w: 46, h: 440, opacity: 0.95, y: 60 },
    { x: 180, w: 36, h: 400, opacity: 0.75, y: 90 },
    { x: 280, w: 26, h: 360, opacity: 0.55, y: 120 }
  ];
  const rightPillars = leftPillars.map((p) => ({ ...p, x: 1000 - p.x - p.w }));

  const pillarMarkup = (p) => `
    <g opacity="${p.opacity}">
      <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#171c30" stroke="#2d2748" stroke-width="1" />
      <rect x="${p.x - 6}" y="${p.y - 14}" width="${p.w + 12}" height="16" fill="#1c2136" stroke="#3a3350" stroke-width="1" />
      <rect x="${p.x - 4}" y="${p.y + p.h}" width="${p.w + 8}" height="14" fill="#1c2136" stroke="#3a3350" stroke-width="1" />
    </g>
  `;

  return `
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <linearGradient id="hall-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#171a2c" />
          <stop offset="100%" stop-color="#06070d" />
        </linearGradient>
        <linearGradient id="hall-runner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#20305c" />
          <stop offset="100%" stop-color="#10182e" />
        </linearGradient>
      </defs>

      <!-- Suelo con perspectiva -->
      <polygon points="0,600 1000,600 760,440 240,440" fill="url(#hall-floor)" />
      <polygon points="460,600 540,600 512,440 488,440" fill="url(#hall-runner)" opacity="0.9" />
      <polygon points="460,600 540,600 512,440 488,440" fill="none" stroke="#b9972f" stroke-width="1" opacity="0.35" />

      <g stroke="#2a2a42" stroke-width="1" opacity="0.4">
        <line x1="60" y1="600" x2="420" y2="440" />
        <line x1="940" y1="600" x2="580" y2="440" />
        <line x1="260" y1="600" x2="460" y2="440" />
        <line x1="740" y1="600" x2="540" y2="440" />
      </g>

      ${leftPillars.map(pillarMarkup).join('')}
      ${rightPillars.map(pillarMarkup).join('')}

      <!-- Arcos que conectan las columnas delanteras -->
      <path d="M60 60 Q500 -40 940 60" fill="none" stroke="#3a3350" stroke-width="2" opacity="0.5" />

      <!-- Faroles de pared -->
      <g>
        <circle cx="83" cy="220" r="7" fill="#d8b85a" opacity="0.8" />
        <circle cx="83" cy="220" r="16" fill="#d8b85a" opacity="0.18" />
        <circle cx="917" cy="220" r="7" fill="#d8b85a" opacity="0.8" />
        <circle cx="917" cy="220" r="16" fill="#d8b85a" opacity="0.18" />
      </g>
    </svg>
  `;
}

/**
 * Desplazamiento de cámara simulado: cada capa con `data-depth` se
 * mueve una fracción distinta del movimiento del cursor (valores
 * negativos se mueven en sentido contrario, sugiriendo que están más
 * al fondo). Añadir una capa nueva al paralaje es tan simple como
 * ponerle el atributo `data-depth` en el marcado.
 */
function initParallax(scene) {
  if (!scene) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const layers = Array.from(scene.querySelectorAll('[data-depth]'));
  if (!layers.length) return;

  let frame = null;

  function handleMove(event) {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const rect = scene.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;

      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth) || 0;
        layer.style.transform = `translate(${(nx * depth).toFixed(2)}px, ${(ny * depth * 0.6).toFixed(2)}px)`;
      });

      frame = null;
    });
  }

  function handleLeave() {
    layers.forEach((layer) => {
      layer.style.transform = 'translate(0, 0)';
    });
  }

  scene.addEventListener('mousemove', handleMove);
  scene.addEventListener('mouseleave', handleLeave);
}
