/**
 * Velas suspendidas: elementos decorativos estáticos en el DOM cuya
 * animación corre por completo en CSS (sin bucles de JS). Cada vela
 * recibe variables CSS aleatorias para que el balanceo no se vea
 * sincronizado.
 */
export function renderCandles(container, { count = 4 } = {}) {
  if (!container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const candle = document.createElement('div');
    candle.className = 'candle';
    candle.setAttribute('data-decorative', '');

    const left = 8 + (i * (84 / Math.max(count - 1, 1))) + randomBetween(-3, 3);
    const top = 6 + randomBetween(0, 10);
    const swaySpeed = prefersReducedMotion ? 0 : randomBetween(0.8, 1.3);

    candle.style.left = `${left}%`;
    candle.style.top = `${top}%`;
    candle.style.setProperty('--sway-speed', String(swaySpeed));

    candle.innerHTML = `
      <span class="candle__string"></span>
      <span class="candle__flame"></span>
      <span class="candle__wax"></span>
    `;

    fragment.appendChild(candle);
  }

  container.appendChild(fragment);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}
