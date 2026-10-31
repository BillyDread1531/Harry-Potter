/**
 * Escapa los caracteres con significado especial en HTML. Necesario en
 * cualquier vista que interpole texto dentro de un atributo (por
 * ejemplo `aria-label`) y no solo entre etiquetas, donde una comilla
 * sin escapar podría romper el marcado.
 */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
