/**
 * Marcado SVG de los cuatro símbolos del mecanismo. Deliberadamente
 * distintos del set de iconos de línea de `components/icons.js` (esos
 * son para pies de hotspot y botones pequeños; estos son el motivo
 * visual central del minijuego, pensados para verse grandes). Cada uno
 * es una silueta reconocible por su FORMA, no solo por el color, para
 * que la posición elegida se distinga sin depender de la percepción
 * del color.
 */
const SYMBOL_MARKS = {
  llave: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="1.5" opacity="0.5" />
      <circle cx="18" cy="24" r="6.5" stroke="currentColor" stroke-width="2.2" />
      <path d="M23 24h14M31 24v5M35.5 24v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
    </svg>
  `,
  luna: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="1.5" opacity="0.5" />
      <path
        d="M28 12a13 13 0 1 0 0 24 10.4 10.4 0 0 1 0-24Z"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </svg>
  `,
  pluma: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="1.5" opacity="0.5" />
      <path
        d="M33 13c-9 1-16 8-17 17l-2 4 4.4-1.4C27 31 34 24 35 15Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <path d="M31 16 16.5 30.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
    </svg>
  `,
  vela: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="1.5" opacity="0.5" />
      <path
        d="M24 11c3 4 5.2 7 5.2 10a5.2 5.2 0 1 1-10.4 0c0-3 2.2-6 5.2-10Z"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path d="M24 26v11M18 37h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `
};

export function createMothLockSymbolMarkup(id) {
  return SYMBOL_MARKS[id] ?? '';
}
