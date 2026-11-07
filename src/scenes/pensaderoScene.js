/**
 * El Pensadero — la escena final, alcanzable solo el 15 de noviembre
 * a las 20:00 hora de Guatemala (`data/sections.js`). Tres pasos, en
 * orden, sin forma de saltarlos: el sello (siempre se ve primero), el
 * mensaje completo (los quince fragmentos ya ganados, con huecos si
 * falta alguno — mismo criterio que `calendar/personalMessageView.js`),
 * y un pase de fotos que Andrea nunca vio venir, una por una, con una
 * transición suave entre cada una.
 *
 * Las fotos se detectan solas: cualquier `01.jpg`/`01.png` hasta
 * donde encuentre números seguidos en `public/assets/pensadero/`
 * (ver el README de esa carpeta). Si todavía no hay ninguna, el paso
 * de fotos se salta sin romper nada.
 */
import { createSceneBackgroundMarkup, mountSceneBackground } from './sceneBackground.js';
import { playAlternateTrack, restoreMainTrack } from '../components/soundToggle.js';
import { getCalendarState } from '../calendar/calendarEngine.js';
import { loadProgress } from '../calendar/calendarStorage.js';
import { getFragmentsWithStatus } from '../calendar/personalMessageView.js';
import { assetExists } from '../utils/assetProbe.js';
import { escapeHtml } from '../utils/escapeHtml.js';

const BACKGROUND_SRC = {
  desktopSrc: '/assets/backgrounds/pensadero-desktop.jpg',
  mobileSrc: '/assets/backgrounds/pensadero-mobile.jpg'
};

const MUSIC_SRC = '/assets/audio/pensadero-theme.mp3';

const PHOTOS_DIR = '/assets/pensadero';
const MAX_PHOTOS = 80;
const EXTENSIONS = ['jpg', 'png'];
// 4.9s por foto × 64 fotos ≈ 5:13 solo en el paso de fotos. La
// canción dura 6:49 y empieza a sonar desde el sello (antes del poema
// y del umbral), así que este margen de ~96s deja espacio para el
// tiempo que tarde en leerse esos dos pasos previos, sin que la
// música tenga que reiniciarse antes de llegar a la última foto.
const AUTO_ADVANCE_MS = 4900;

const THRESHOLD_TEXT =
  'El Pensadero se llena de una luz líquida, plateada, que respira como agua despierta. Inclínate sobre el borde: cada recuerdo flota ahí abajo, esperando a que alguien vuelva a mirarlo.';

const CLOSING_TEXT =
  'El Pensadero se aquieta otra vez, y la plata vuelve a dormir en su copa de piedra. Esto que viste —quince noches, un castillo entero conteniendo la respiración solo para ti— es apenas un recuerdo más que guardar. La aventura que empezó aquí no termina con este último destello: sigue afuera, en cada mañana ordinaria que decidamos hechizar juntos, en los años que todavía no viven en ningún frasco de memoria. Feliz cumpleaños, mi bruja favorita. Esto fue solo el primer hechizo. Te amo, hoy y en cada vida que nos quede por inventar.';

async function detectPhotos({ signal } = {}) {
  const checks = Array.from({ length: MAX_PHOTOS }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return Promise.all(EXTENSIONS.map((ext) => assetExists(`${PHOTOS_DIR}/${num}.${ext}`, { signal }))).then(
      (results) => {
        const ok = results.findIndex(Boolean);
        return ok === -1 ? null : `${PHOTOS_DIR}/${num}.${EXTENSIONS[ok]}`;
      }
    );
  });
  const resolved = await Promise.all(checks);
  const photos = [];
  for (const src of resolved) {
    if (!src) break; // se detiene en el primer número que falte: así respeta el orden sin huecos
    photos.push(src);
  }
  return photos;
}

function createPoemMarkup(calendarState) {
  const items = getFragmentsWithStatus(calendarState);
  const spans = items
    .map((item) =>
      item.earned
        ? `<span class="pensadero-poem__piece">${escapeHtml(item.fragment)}</span>`
        : `<span class="pensadero-poem__gap">···</span>`
    )
    .join(' ');
  return `<p class="pensadero-poem__text">${spans}</p>`;
}

export function renderPensadero(section) {
  const html = `
    <section class="pensadero-scene" data-pensadero-scene>
      <div class="pensadero-scene__backdrop" aria-hidden="true">
        ${createSceneBackgroundMarkup()}
        <div class="pensadero-scene__mist" aria-hidden="true"></div>
        <div class="pensadero-scene__mist pensadero-scene__mist--wisps" aria-hidden="true"></div>
        <div class="pensadero-scene__sparkles" aria-hidden="true"></div>
      </div>
      <div class="pensadero-scene__stage" data-pensadero-stage></div>
    </section>
  `;

  function onMount(panelEl) {
    const controller = new AbortController();
    const backdropEl = panelEl.querySelector('.pensadero-scene__backdrop');
    mountSceneBackground(backdropEl, BACKGROUND_SRC, { signal: controller.signal });
    playAlternateTrack(MUSIC_SRC);

    const stageEl = panelEl.querySelector('[data-pensadero-stage]');
    const calendarState = getCalendarState({ referenceInstant: new Date(), progress: loadProgress() });

    let photos = [];
    let photoIndex = 0;
    let autoTimer = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function clearAutoTimer() {
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = null;
    }

    function renderSealed() {
      clearAutoTimer();
      stageEl.classList.remove('pensadero-scene__stage--photos');
      stageEl.innerHTML = `
        <div class="pensadero-step pensadero-step--sealed">
          <p class="pensadero-step__eyebrow">El Pensadero</p>
          <p class="pensadero-step__text">Un sello plateado, con la forma exacta de una polilla, lo mantiene cerrado. El castillo, por fin, deja de esconder cosas.</p>
          <button type="button" class="btn-arcane" data-pensadero-open>Abrir el Pensadero</button>
        </div>
      `;
      stageEl.querySelector('[data-pensadero-open]')?.addEventListener('click', renderPoem, { signal: controller.signal });
    }

    function renderPoem() {
      clearAutoTimer();
      stageEl.classList.remove('pensadero-scene__stage--photos');
      stageEl.innerHTML = `
        <div class="pensadero-step pensadero-step--poem">
          ${createPoemMarkup(calendarState)}
          <button type="button" class="btn-arcane" data-pensadero-continue>Continuar</button>
        </div>
      `;
      stageEl
        .querySelector('[data-pensadero-continue]')
        ?.addEventListener('click', () => renderThreshold(), { signal: controller.signal });
    }

    function renderThreshold() {
      clearAutoTimer();
      stageEl.classList.remove('pensadero-scene__stage--photos');
      stageEl.innerHTML = `
        <div class="pensadero-step pensadero-step--threshold">
          <p class="pensadero-step__sparkle" aria-hidden="true">✦</p>
          <p class="pensadero-step__text">${THRESHOLD_TEXT}</p>
          <button type="button" class="btn-arcane" data-pensadero-descend>Sumergirme en los recuerdos</button>
        </div>
      `;
      stageEl
        .querySelector('[data-pensadero-descend]')
        ?.addEventListener('click', () => renderPhotos(), { signal: controller.signal });
    }

    function scheduleAutoAdvance() {
      if (reducedMotion || photos.length <= 1) return;
      clearAutoTimer();
      autoTimer = setTimeout(() => showPhoto(photoIndex + 1), AUTO_ADVANCE_MS);
    }

    let firstPhotoShown = false;

    function showPhoto(nextIndex) {
      if (nextIndex >= photos.length) {
        renderClosing();
        return;
      }
      photoIndex = Math.max(0, nextIndex);
      const imgEl = stageEl.querySelector('[data-pensadero-photo]');
      const bgEl = stageEl.querySelector('[data-pensadero-photo-bg]');
      const counterEl = stageEl.querySelector('[data-pensadero-counter]');
      const src = photos[photoIndex];

      function applySrc() {
        imgEl.src = src;
        if (bgEl) bgEl.src = src;
      }

      if (imgEl) {
        if (reducedMotion || !firstPhotoShown) {
          applySrc();
          imgEl.classList.add('pensadero-photo--visible');
          bgEl?.classList.add('pensadero-photo--visible');
          firstPhotoShown = true;
        } else {
          // Imita la superficie del Pensadero real: el recuerdo anterior
          // se disuelve en un remolino de plata antes de que el nuevo
          // emerja del mismo remolino, en vez de un simple fundido.
          imgEl.classList.remove('pensadero-photo--swirl-in');
          imgEl.classList.add('pensadero-photo--swirl-out');
          setTimeout(() => {
            applySrc();
            imgEl.classList.remove('pensadero-photo--swirl-out');
            imgEl.classList.add('pensadero-photo--swirl-in');
          }, 420);
        }
      }
      if (counterEl) counterEl.textContent = `${photoIndex + 1} / ${photos.length}`;
      scheduleAutoAdvance();
    }

    async function renderPhotos() {
      clearAutoTimer();
      // La detección de fotos corre desde que se monta la escena, pero
      // puede no haber terminado si Andrea avanza rápido por el poema
      // — se espera aquí, en vez de asumir "sin fotos" por una carrera.
      stageEl.innerHTML = `<div class="pensadero-step"><p class="pensadero-step__text">Buscando recuerdos…</p></div>`;
      photos = await photosPromise;
      if (controller.signal.aborted) return;
      if (photos.length === 0) {
        renderClosing();
        return;
      }
      stageEl.classList.add('pensadero-scene__stage--photos');
      stageEl.innerHTML = `
        <div class="pensadero-step pensadero-step--photos">
          <div class="pensadero-photo-frame">
            <img class="pensadero-photo-bg" data-pensadero-photo-bg alt="" aria-hidden="true" />
            <img class="pensadero-photo" data-pensadero-photo alt="" />
          </div>
          <p class="pensadero-photo-counter" data-pensadero-counter aria-live="polite"></p>
          <div class="pensadero-photo-controls">
            <button type="button" class="btn-arcane btn-arcane--ghost" data-pensadero-prev>‹ Anterior</button>
            <button type="button" class="btn-arcane btn-arcane--ghost" data-pensadero-next>Siguiente ›</button>
          </div>
        </div>
      `;
      stageEl
        .querySelector('[data-pensadero-prev]')
        ?.addEventListener('click', () => showPhoto(Math.max(0, photoIndex - 1)), { signal: controller.signal });
      stageEl
        .querySelector('[data-pensadero-next]')
        ?.addEventListener('click', () => showPhoto(photoIndex + 1), { signal: controller.signal });
      photoIndex = -1;
      firstPhotoShown = false;
      showPhoto(0);
    }

    function renderClosing() {
      clearAutoTimer();
      stageEl.classList.remove('pensadero-scene__stage--photos');
      stageEl.innerHTML = `
        <div class="pensadero-step pensadero-step--closing">
          <p class="pensadero-step__sparkle" aria-hidden="true">✦</p>
          <p class="pensadero-step__text">${CLOSING_TEXT}</p>
        </div>
      `;
    }

    renderSealed();
    const photosPromise = detectPhotos({ signal: controller.signal });

    return () => {
      clearAutoTimer();
      controller.abort();
      restoreMainTrack();
    };
  }

  return { html, onMount };
}
