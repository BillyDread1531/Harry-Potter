import { DEFAULT_SECTION_ID, getSectionById, isReachable } from '../data/sections.js';
import { renderScene } from '../scenes/sceneRenderer.js';
import { resolveNavigationIntent } from './navigationIntent.js';

const BASE_TITLE = 'Hogwarts — una invitación privada';

/**
 * Router basado en hash. Cada cambio de lugar pasa por el
 * `transitionManager`: la escena nueva se monta en el escenario
 * mientras la transición cubre la pantalla, y solo se revela una vez
 * que la cinemática lo permite.
 *
 * Ciclo de vida de una escena: `mountSection` es su único punto de
 * montaje Y de desmontaje. Antes de reemplazar `stageEl.innerHTML` con
 * la siguiente escena, se llama a la función de limpieza que devolvió
 * el `onMount` de la escena saliente (si devolvió alguna) — así las
 * operaciones asíncronas en curso (comprobar si existe una foto,
 * montar al Patronus) se cancelan en vez de seguir corriendo contra un
 * DOM que ya no está activo.
 *
 * Navegación durante una transición: tanto los clics en los hotspots
 * como los cambios de hash (incluidos los que disparan los botones
 * atrás/adelante del navegador) pasan por `resolveNavigationIntent`.
 * Si ya hay una transición en curso, la petición se encola como
 * "destino pendiente" en vez de interrumpirla o lanzar una segunda en
 * paralelo; en cuanto la transición vigente termina, el router revisa
 * si ese destino pendiente sigue siendo necesario y, si es así, inicia
 * la siguiente transición. Esto evita que dos transiciones toquen el
 * DOM a la vez y evita cortes instantáneos como solución general: en
 * el peor de los casos (navegación muy rápida) se encadenan
 * transiciones completas, nunca se saltan.
 */
export function initRouter({ stageEl, statusEl, transitionManager, homeControl }) {
  let isFirstRender = true;
  let currentSectionId = null;
  let currentCleanup = null;
  let pendingSectionId = null;

  function resolveSectionId() {
    const hashId = window.location.hash.replace('#', '');
    if (isReachable(hashId)) return hashId;

    // El hash pide un lugar que no existe o que sigue protegido (como
    // `#pensadero`, todavía `hidden: true`): se va a mostrar el
    // Vestíbulo de todas formas, así que la URL debería decirlo
    // también, en vez de quedarse con un hash que ya no coincide con
    // lo que hay en pantalla. `replaceState` (no `location.hash = ...`)
    // corrige la entrada actual del historial sin empujar una nueva —
    // así "atrás" sigue llevando a donde el visitante estaba de
    // verdad, no a este hash inválido — y, a diferencia de asignar
    // `location.hash`, nunca dispara `hashchange`: no hay riesgo de
    // volver a entrar aquí en bucle. El caso de hash vacío (primera
    // carga) ya lo resuelve el bloque al final del archivo.
    if (hashId !== '') {
      window.history.replaceState(null, '', `#${DEFAULT_SECTION_ID}`);
    }
    return DEFAULT_SECTION_ID;
  }

  function mountSection(section) {
    currentCleanup?.();
    currentCleanup = null;

    const { html, onMount } = renderScene(section, { onNavigate: navigateTo });

    stageEl.innerHTML = `
      <section class="view-panel" id="panel-${section.id}" aria-label="${section.title}" tabindex="-1">
        ${html}
      </section>
    `;

    const panelEl = stageEl.querySelector(`#panel-${section.id}`);
    const cleanup = onMount?.(panelEl);
    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }

    document.title = `${section.label} — ${BASE_TITLE}`;
    if (statusEl) {
      statusEl.textContent = `Ahora en: ${section.title}`;
    }
    homeControl?.setCurrentSection(section.id);

    if (!isFirstRender) {
      panelEl.focus();
    }
    isFirstRender = false;
    currentSectionId = section.id;
  }

  async function renderCurrentSection() {
    const sectionId = resolveSectionId();

    if (isFirstRender) {
      mountSection(getSectionById(sectionId));
      return;
    }

    const intent = resolveNavigationIntent({
      requestedId: sectionId,
      currentId: currentSectionId,
      isTransitionRunning: transitionManager.isRunning
    });

    if (intent.action === 'queue') {
      pendingSectionId = sectionId;
      return;
    }

    if (intent.action === 'noop') {
      return;
    }

    const section = getSectionById(sectionId);
    const transitionVariant = sectionId === DEFAULT_SECTION_ID ? 'fade-dust' : section.transitionVariant;

    await transitionManager.run(transitionVariant, () => mountSection(section));

    const nextId = pendingSectionId;
    pendingSectionId = null;

    if (nextId && nextId !== currentSectionId) {
      if (window.location.hash.replace('#', '') === nextId) {
        renderCurrentSection();
      } else {
        window.location.hash = nextId;
      }
    }
  }

  function navigateTo(sectionId) {
    if (!isReachable(sectionId)) return;
    if (window.location.hash.replace('#', '') === sectionId) {
      renderCurrentSection();
      return;
    }
    window.location.hash = sectionId;
  }

  window.addEventListener('hashchange', () => renderCurrentSection());

  if (!window.location.hash) {
    window.location.hash = DEFAULT_SECTION_ID;
  } else {
    renderCurrentSection();
  }

  return {
    navigateTo,
    get currentSectionId() {
      return currentSectionId;
    }
  };
}
