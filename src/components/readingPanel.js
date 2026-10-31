/**
 * Panel de lectura reutilizable: más grande que `magicReveal.js` (está
 * pensado para un texto largo — la carta, las instrucciones — no para
 * una sola línea ambiental), con su propio desplazamiento interno si
 * el contenido no cabe. Deliberadamente genérico: no sabe nada de
 * cartas ni de instrucciones, solo abre/cierra HTML arbitrario; quien
 * lo use vuelve a consultar el panel abierto para cablear cualquier
 * botón propio que ese HTML contenga (p. ej. "terminar de leer"),
 * igual que ya hace `calendarView.renderDetail` con su propio
 * contenido. Como cada `open()` reemplaza el `innerHTML` del cuerpo
 * por completo, nunca se acumulan listeners de una apertura a otra.
 */
export function createReadingPanelMarkup() {
  return `
    <div class="reading-panel" data-reading-panel hidden tabindex="-1">
      <div class="reading-panel__sheet">
        <button type="button" class="reading-panel__close" data-reading-panel-close aria-label="Cerrar">
          <span aria-hidden="true">×</span>
        </button>
        <div class="reading-panel__body" data-reading-panel-body></div>
      </div>
    </div>
  `;
}

export function mountReadingPanel(panelEl, { signal } = {}) {
  const rootEl = panelEl?.querySelector('[data-reading-panel]');
  const bodyEl = rootEl?.querySelector('[data-reading-panel-body]');
  let lastTriggerEl = null;

  function open(html, { triggerEl = null } = {}) {
    if (!rootEl || !bodyEl || !html) return;
    bodyEl.innerHTML = html;
    bodyEl.scrollTop = 0;
    rootEl.hidden = false;
    lastTriggerEl = triggerEl;
    rootEl.focus();
  }

  function close() {
    if (!rootEl || rootEl.hidden) return;
    rootEl.hidden = true;
    lastTriggerEl?.focus();
    lastTriggerEl = null;
  }

  const listenerOptions = signal ? { signal } : undefined;
  rootEl?.querySelector('[data-reading-panel-close]')?.addEventListener('click', close, listenerOptions);
  rootEl?.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') close();
    },
    listenerOptions
  );
  // Cerrar también al tocar fuera de la hoja (el fondo del propio panel).
  rootEl?.addEventListener(
    'click',
    (event) => {
      if (event.target === rootEl) close();
    },
    listenerOptions
  );

  return { open, close, get bodyEl() { return bodyEl; } };
}
