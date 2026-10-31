import { initRouter } from '../navigation/router.js';
import { initHomeControl } from '../navigation/homeControl.js';
import { initSoundToggle } from '../components/soundToggle.js';
import { initAmbientPreference } from '../ambient/ambientController.js';
import { createTransitionManager } from '../transitions/transitionManager.js';

/**
 * Punto de orquestación de la aplicación: conecta el ambiente, el
 * sonido, el control de regreso, el gestor de transiciones y el router.
 * No contiene lógica de escenas específicas.
 *
 * Los destellos/partículas viven dentro de cada escena (por encima de
 * su propia foto de fondo), no en una capa de página aparte: así no se
 * ve como dos capas separadas, una "detrás" del recuadro de la escena.
 */
export function createApp() {
  initAmbientPreference();

  const soundToggleEl = document.querySelector('[data-sound-toggle]');
  initSoundToggle(soundToggleEl);

  const homeButtonEl = document.querySelector('[data-home-control]');
  const stageEl = document.querySelector('[data-view-stage]');
  const statusEl = document.querySelector('[data-view-status]');
  const overlayEl = document.querySelector('[data-transition-overlay]');

  const transitionManager = createTransitionManager(overlayEl);

  let router;
  const homeControl = initHomeControl(homeButtonEl, {
    onNavigate: (sectionId) => router.navigateTo(sectionId)
  });

  router = initRouter({ stageEl, statusEl, transitionManager, homeControl });
}
