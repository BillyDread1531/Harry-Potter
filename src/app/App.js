import { initNavigation } from '../navigation/navigation.js';
import { initRouter } from '../navigation/router.js';
import { initSoundToggle } from '../components/soundToggle.js';
import { initAmbientPreference } from '../ambient/ambientController.js';
import { renderParticles } from '../ambient/particles.js';

/**
 * Punto de orquestación de la aplicación: conecta el ambiente, el sonido,
 * la navegación y el router. No contiene lógica de vistas específicas.
 */
export function createApp() {
  initAmbientPreference();

  const ambientLayer = document.querySelector('[data-ambient-layer]');
  renderGlowOrbs(ambientLayer);
  renderParticles(ambientLayer, { count: 16 });

  const soundToggleEl = document.querySelector('[data-sound-toggle]');
  initSoundToggle(soundToggleEl);

  const tablistEl = document.querySelector('[data-tablist]');
  const stageEl = document.querySelector('[data-view-stage]');
  const statusEl = document.querySelector('[data-view-status]');

  const navApi = initNavigation(tablistEl, {
    onSelect: (sectionId) => router.navigateTo(sectionId)
  });

  const router = initRouter({ stageEl, statusEl, navApi });
}

function renderGlowOrbs(container) {
  if (!container) return;

  const orbs = [
    { left: '15%', top: '10%', size: '260px', color: 'rgba(77, 111, 179, 0.5)' },
    { left: '80%', top: '55%', size: '220px', color: 'rgba(185, 151, 47, 0.35)' }
  ];

  orbs.forEach((orb) => {
    const el = document.createElement('div');
    el.className = 'glow-orb';
    el.setAttribute('data-decorative', '');
    el.style.left = orb.left;
    el.style.top = orb.top;
    el.style.width = orb.size;
    el.style.height = orb.size;
    el.style.background = orb.color;
    container.appendChild(el);
  });
}
