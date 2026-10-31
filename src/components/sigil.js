/**
 * Símbolo mágico decorativo reutilizable (SVG original, sin dependencias
 * externas). Se usa como acento visual en varias vistas.
 */
export function createSigilMarkup({ title = '' } = {}) {
  const titleMarkup = title ? `<title>${title}</title>` : '';
  return `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="${
      title ? 'false' : 'true'
    }" role="${title ? 'img' : 'presentation'}">
      ${titleMarkup}
      <circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="1.2" opacity="0.6" />
      <circle cx="24" cy="24" r="15" stroke="currentColor" stroke-width="0.8" opacity="0.45" />
      <path
        d="M24 6 L30 20 L44 24 L30 28 L24 42 L18 28 L4 24 L18 20 Z"
        stroke="currentColor"
        stroke-width="1"
        fill="currentColor"
        fill-opacity="0.12"
      />
    </svg>
  `;
}
