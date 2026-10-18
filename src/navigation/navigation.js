import { SECTIONS } from '../data/sections.js';
import { createIconMarkup } from '../components/icons.js';

/**
 * Pestañas de navegación principal, siguiendo el patrón APG "tabs":
 * una sola pestaña con tabindex 0 (roving tabindex), flechas para moverse,
 * Home/End para saltar a los extremos, Enter/Espacio para activar.
 * El ratón y el toque usan el click normal del <button>.
 */
export function initNavigation(listEl, { onSelect } = {}) {
  const tabs = SECTIONS.map((section) => createTab(section));

  tabs.forEach(({ li }) => listEl.appendChild(li));

  listEl.addEventListener('click', (event) => {
    const button = event.target.closest('.nav-tab');
    if (!button) return;
    onSelect?.(button.dataset.sectionId);
  });

  listEl.addEventListener('keydown', (event) => {
    const currentIndex = tabs.findIndex((tab) => tab.button === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusTab(tabs, nextIndex);
  });

  function setActive(sectionId) {
    tabs.forEach(({ button }) => {
      const isActive = button.dataset.sectionId === sectionId;
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });
  }

  return { setActive };
}

function createTab(section) {
  const li = document.createElement('li');
  li.setAttribute('role', 'presentation');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-tab';
  button.id = `tab-${section.id}`;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-selected', 'false');
  button.setAttribute('aria-controls', `panel-${section.id}`);
  button.dataset.sectionId = section.id;
  button.tabIndex = -1;

  button.innerHTML = `
    <span class="nav-tab__icon" aria-hidden="true">${createIconMarkup(section.icon)}</span>
    <span>${section.label}</span>
  `;

  li.appendChild(button);
  return { li, button };
}

function focusTab(tabs, index) {
  tabs.forEach(({ button }, i) => {
    button.tabIndex = i === index ? 0 : -1;
  });
  tabs[index].button.focus();
}
