/**
 * Partículas/motas luminosas discretas. Igual que las velas, se generan
 * una sola vez y la animación corre en CSS; en modo de movimiento
 * reducido se reduce la cantidad y se dejan estáticas (ver ambient.css).
 */
export function renderParticles(container, { count = 14 } = {}) {
  if (!container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = prefersReducedMotion ? Math.min(4, count) : count;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < total; i += 1) {
    const mote = document.createElement('span');
    mote.className = `mote${Math.random() > 0.6 ? ' mote--silver' : ''}`;
    mote.setAttribute('data-decorative', '');

    mote.style.left = `${randomBetween(2, 98)}%`;
    mote.style.top = `${randomBetween(10, 95)}%`;
    mote.style.setProperty('--mote-size', `${randomBetween(2, 4).toFixed(1)}px`);
    mote.style.setProperty('--mote-duration', `${randomBetween(10, 20).toFixed(1)}s`);
    mote.style.setProperty('--mote-delay', `${randomBetween(0, 12).toFixed(1)}s`);
    mote.style.setProperty('--mote-drift-x', `${randomBetween(-30, 30).toFixed(0)}px`);
    mote.style.setProperty('--mote-drift-y', `${randomBetween(-160, -80).toFixed(0)}px`);

    fragment.appendChild(mote);
  }

  container.appendChild(fragment);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}
