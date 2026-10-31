import { createIconMarkup } from '../components/icons.js';
import { DEFAULT_SECTION_ID } from '../data/sections.js';

/**
 * El único control de navegación persistente: vuelve al vestíbulo.
 * Se oculta mientras ya estamos en el vestíbulo, para no mostrar un
 * botón que no haría nada.
 */
export function initHomeControl(buttonEl, { onNavigate } = {}) {
  if (!buttonEl) return { setCurrentSection() {} };

  const iconEl = buttonEl.querySelector('[data-home-icon]');
  if (iconEl) {
    iconEl.innerHTML = createIconMarkup('hall');
  }

  buttonEl.addEventListener('click', () => onNavigate?.(DEFAULT_SECTION_ID));

  function setCurrentSection(sectionId) {
    buttonEl.hidden = sectionId === DEFAULT_SECTION_ID;
  }

  return { setCurrentSection };
}
