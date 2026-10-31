/**
 * Set de iconos de línea, originales y minimalistas (sin dependencias
 * externas ni emoji), pensados para heredar color vía `currentColor` y
 * mantenerse coherentes con la paleta dorado/plata del proyecto.
 */
const ICONS = {
  hall: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 21V10.5C5 7 8 4 12 4s7 3 7 6.5V21" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <path d="M9 21v-7a3 3 0 0 1 6 0v7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <path d="M3 21h18" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
    </svg>
  `,
  scroll: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <path d="M7 4a2 2 0 1 0 0 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <path d="M7 20a2 2 0 1 1 0-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <path d="M7 8v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <path d="M11 9h6M11 12h6M11 15h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    </svg>
  `,
  map: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 5 4 7v12l5-2 6 2 5-2V5l-5 2-6-2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
      <path d="M9 5v12M15 7v12" stroke="currentColor" stroke-width="1.2" />
      <circle cx="12.5" cy="12" r="1.2" fill="currentColor" />
    </svg>
  `,
  book: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6c-1.6-1.2-3.8-1.6-6-1.4v13c2.2-.2 4.4.2 6 1.4 1.6-1.2 3.8-1.6 6-1.4v-13c-2.2-.2-4.4.2-6 1.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
      <path d="M12 6v13" stroke="currentColor" stroke-width="1.2" />
    </svg>
  `,
  wand: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20 16 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <path d="M16 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
      <path d="M6 16l1.4 1.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    </svg>
  `,
  key: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="14" r="3.5" stroke="currentColor" stroke-width="1.4" />
      <path d="M10.5 11.5 19 3M16 6l2 2M13.5 8.5l2 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
    </svg>
  `,
  basin: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10c2 1.4 4.6 2 8 2s6-.6 8-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <path d="M5 10l1.6 7A2 2 0 0 0 8.56 19h6.88a2 2 0 0 0 1.96-1.58L19 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 5.5c0 1-1 1.2-1 2.2s1 1.4 1 1.4M15 5.5c0 1-1 1.2-1 2.2s1 1.4 1 1.4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
    </svg>
  `,
  letter: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="6" width="17" height="12" rx="1.5" stroke="currentColor" stroke-width="1.4" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  lock: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
    </svg>
  `,
  check: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.4" />
      <path d="M8.5 12.2l2.4 2.4 4.6-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  gift: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="16" height="10" rx="1" stroke="currentColor" stroke-width="1.4" />
      <path d="M4 13.5h16" stroke="currentColor" stroke-width="1.4" />
      <path d="M12 10v10" stroke="currentColor" stroke-width="1.4" />
      <path d="M12 10c-1-2.4-2.6-3.6-4-3.6-1.1 0-1.8.7-1.8 1.6 0 1.4 1.5 2 2.9 2H12Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
      <path d="M12 10c1-2.4 2.6-3.6 4-3.6 1.1 0 1.8.7 1.8 1.6 0 1.4-1.5 2-2.9 2H12Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
    </svg>
  `
};

export function createIconMarkup(name) {
  return ICONS[name] ?? '';
}
