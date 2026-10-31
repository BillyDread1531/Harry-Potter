/**
 * Revelación mágica breve y reutilizable: un panel flotante que
 * aparece sobre la escena (no una lista, no una ficha nueva) para
 * mostrar UNA sola línea de texto ambiental a la vez. Usado por el
 * Mapa (al tocar un lugar ambiental) y por la Sala de los Menesteres
 * (al tocar el único punto interactivo de la sala). Deliberadamente
 * mínimo: sin historial, sin pestañas, sin lista desplegable — esto no
 * es el Archivo Secreto.
 */
export function createMagicRevealMarkup() {
  return `
    <div class="magic-reveal" data-magic-reveal hidden tabindex="-1">
      <button type="button" class="magic-reveal__close" data-magic-reveal-close aria-label="Cerrar">
        <span aria-hidden="true">×</span>
      </button>
      <p class="magic-reveal__text" data-magic-reveal-text></p>
    </div>
  `;
}

/**
 * Monta el comportamiento del panel dentro de `panelEl` (el nodo de la
 * escena que ya contiene el marcado de `createMagicRevealMarkup`).
 * Devuelve `{ open, close }`: `open(text, { triggerEl })` muestra el
 * texto y mueve el foco al panel (anunciado por el lector de
 * pantalla); al cerrar (botón, Escape, o abrir otra cosa) el foco
 * vuelve a `triggerEl` si se indicó uno, igual que ya hace el patrón
 * de abrir/cerrar ficha en `calendarView.js`.
 */
export function mountMagicReveal(panelEl, { signal } = {}) {
  const revealEl = panelEl?.querySelector('[data-magic-reveal]');
  const textEl = panelEl?.querySelector('[data-magic-reveal-text]');
  let lastTriggerEl = null;

  function open(text, { triggerEl = null } = {}) {
    if (!revealEl || !textEl || !text) return;
    textEl.textContent = text;
    revealEl.hidden = false;
    lastTriggerEl = triggerEl;
    revealEl.focus();

    // Runas y símbolos que reaccionan al descubrirse: un breve destello
    // en anillo sobre el propio punto tocado, no en el panel. Un único
    // cambio aquí alcanza a cada hotspot del proyecto que ya llama a
    // `reveal.open(..., { triggerEl })` — docenas de ellos — sin tocar
    // cada escena una por una. `animationend` quita la clase sola: no
    // hace falta temporizador ni limpieza en el desmontaje.
    const glowEl = triggerEl?.querySelector('.hotspot__glow');
    if (glowEl) {
      glowEl.classList.remove('hotspot__glow--discovery-burst');
      void glowEl.offsetWidth;
      glowEl.classList.add('hotspot__glow--discovery-burst');
      glowEl.addEventListener(
        'animationend',
        () => glowEl.classList.remove('hotspot__glow--discovery-burst'),
        { once: true }
      );
    }
  }

  function close() {
    if (!revealEl || revealEl.hidden) return;
    revealEl.hidden = true;
    lastTriggerEl?.focus();
    lastTriggerEl = null;
  }

  const listenerOptions = signal ? { signal } : undefined;
  revealEl?.querySelector('[data-magic-reveal-close]')?.addEventListener('click', close, listenerOptions);
  revealEl?.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') close();
    },
    listenerOptions
  );

  return { open, close };
}
