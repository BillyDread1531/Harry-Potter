import { SECTIONS, DEFAULT_SECTION_ID, getSectionById } from '../data/sections.js';
import { renderSection } from '../views/viewRenderer.js';

const BASE_TITLE = 'Hogwarts — una invitación privada';

/**
 * Router basado en hash: cambia de vista sin recargar la página, se
 * integra con el historial del navegador (back/forward) y mantiene
 * sincronizados la navegación, el foco y el anuncio de estado para
 * lectores de pantalla.
 */
export function initRouter({ stageEl, statusEl, navApi }) {
  let isFirstRender = true;

  function resolveSectionId() {
    const hashId = window.location.hash.replace('#', '');
    return getSectionById(hashId) ? hashId : DEFAULT_SECTION_ID;
  }

  function renderCurrentSection() {
    const sectionId = resolveSectionId();
    const section = getSectionById(sectionId);

    const { html, onMount } = renderSection(section, { onNavigate: navigateTo });

    stageEl.innerHTML = `
      <section
        class="view-panel"
        id="panel-${section.id}"
        role="tabpanel"
        aria-labelledby="tab-${section.id}"
        tabindex="-1"
      >
        ${html}
      </section>
    `;

    const panelEl = stageEl.querySelector(`#panel-${section.id}`);
    onMount?.(panelEl);

    navApi.setActive(section.id);
    document.title = `${section.label} — ${BASE_TITLE}`;

    if (statusEl) {
      statusEl.textContent = `Ahora en: ${section.title}`;
    }

    if (!isFirstRender) {
      panelEl.focus();
    }
    isFirstRender = false;
  }

  function navigateTo(sectionId) {
    if (!getSectionById(sectionId)) return;
    if (window.location.hash.replace('#', '') === sectionId) {
      renderCurrentSection();
      return;
    }
    window.location.hash = sectionId;
  }

  window.addEventListener('hashchange', renderCurrentSection);

  if (!window.location.hash) {
    window.location.hash = DEFAULT_SECTION_ID;
  } else {
    renderCurrentSection();
  }

  return { navigateTo };
}

export { SECTIONS };
