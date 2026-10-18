const STATUS_LABELS = {
  ready: 'Disponible',
  pending: 'En preparación',
  locked: 'Sellado'
};

/**
 * Encabezado de sección reutilizable: rótulo, título, insignia de estado
 * y divisor ornamental. Usado por todas las vistas salvo el vestíbulo,
 * que tiene su propia composición de héroe.
 */
export function createSectionHeaderMarkup({ eyebrow, title, status }) {
  const badge = status
    ? `<span class="status-badge status-badge--${status}">${STATUS_LABELS[status] ?? status}</span>`
    : '';

  return `
    <header class="section-header">
      <div class="eyebrow">${eyebrow}</div>
      <div style="display:flex; align-items:center; gap: var(--space-3); flex-wrap: wrap;">
        <h2>${title}</h2>
        ${badge}
      </div>
    </header>
    <div class="ornament-divider" aria-hidden="true"></div>
  `;
}
