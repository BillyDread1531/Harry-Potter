import { createSectionHeaderMarkup } from '../components/sectionHeader.js';

/**
 * Vista genérica para secciones todavía no implementadas. Deja claro qué
 * llegará en próximas fases en lugar de simular una función que no existe.
 */
export function renderPending(section) {
  const items = (section.pendingItems ?? [])
    .map((item) => `<li>${item}</li>`)
    .join('');

  const html = `
    ${createSectionHeaderMarkup({
      eyebrow: 'Próximamente en el castillo',
      title: section.title,
      status: 'pending'
    })}
    <div class="pending-section">
      <div class="panel pending-section__body">
        <p>${section.description ?? ''}</p>
        ${
          items
            ? `<ul class="pending-section__list">${items}</ul>`
            : ''
        }
        <p class="eyebrow" style="margin-top: var(--space-2);">
          Esta sección está preparada en la arquitectura; su contenido llegará en una fase posterior.
        </p>
      </div>
    </div>
  `;

  return { html };
}
