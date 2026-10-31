/**
 * Marcado decorativo de cada variante de transición. El movimiento real
 * vive en `transitions.css`, controlado por las clases `is-covering` /
 * `is-revealing` que aplica `transitionManager.js` sobre el overlay.
 */
export function getTransitionMarkup(variant) {
  switch (variant) {
    case 'door':
      return doorMarkup();
    case 'revealPanel':
      return revealPanelMarkup();
    case 'unfurl':
      return unfurlMarkup();
    case 'wallShift':
      return wallShiftMarkup();
    case 'fade-dust':
    default:
      return fadeDustMarkup();
  }
}

function doorMarkup() {
  return `
    <div class="t-door">
      <span class="t-door__panel t-door__panel--left"></span>
      <span class="t-door__panel t-door__panel--right"></span>
      <span class="t-door__seam"></span>
    </div>
  `;
}

function revealPanelMarkup() {
  return `
    <div class="t-panel">
      <span class="t-panel__texture"></span>
      <span class="t-panel__glint"></span>
    </div>
  `;
}

function unfurlMarkup() {
  return `
    <div class="t-scroll">
      <span class="t-scroll__sheet"></span>
    </div>
  `;
}

function wallShiftMarkup() {
  return `
    <div class="t-wall">
      <span class="t-wall__half t-wall__half--left"></span>
      <span class="t-wall__half t-wall__half--right"></span>
      <span class="t-wall__crack"></span>
    </div>
  `;
}

function fadeDustMarkup() {
  const motes = Array.from({ length: 8 })
    .map((_, i) => `<span class="t-fade__mote" style="--i:${i}"></span>`)
    .join('');
  return `
    <div class="t-fade">
      <span class="t-fade__veil"></span>
      ${motes}
    </div>
  `;
}
