/**
 * Marcado SVG de las cinco runas. Mismo criterio que
 * `games/mothLockSymbols.js`: siluetas simples, distinguibles por
 * forma (no solo por color), pensadas para verse bien en tamaño
 * pequeño dentro de la cuadrícula de `.rune-button`.
 */
const RUNE_MARKS = {
  estrella: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 6 L28.5 19.5 L42 24 L28.5 28.5 L24 42 L19.5 28.5 L6 24 L19.5 19.5 Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  `,
  ola: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 18c4 0 4 6 8 6s4-6 8-6 4 6 8 6 4-6 8-6"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <path
        d="M6 30c4 0 4 6 8 6s4-6 8-6 4 6 8 6 4-6 8-6"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      />
    </svg>
  `,
  espiral: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 24c0-3 2.5-5 5-5s5 2.5 5 5-2.5 6-6 6-8-3-8-8 4-10 10-10 12 5 12 12-7 14-14 14-16-7-16-16"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `,
  llama: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 6c4 6 8 10 8 17a8 8 0 1 1-16 0c0-2 1-4 2.5-5.5C19 20 20 22 21 22c-1-6 1-11 3-16Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  `,
  raiz: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 6v14M24 20c-6 2-8 8-10 16M24 20c6 2 8 8 10 16M24 20c-3 4-3 10-3 16M24 20c3 4 3 10 3 16"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `
};

export function createRuneSymbolMarkup(id) {
  return RUNE_MARKS[id] ?? '';
}
