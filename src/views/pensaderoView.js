import { createSectionHeaderMarkup } from '../components/sectionHeader.js';
import { createSealMarkup } from '../components/sigil.js';

/**
 * Pensadero: en esta fase solo se construye el aspecto visual del
 * bloqueo. La lógica real de apertura por fecha llegará más adelante;
 * aquí no se simula ninguna cuenta atrás ni verificación real.
 */
export function renderPensadero(section) {
  const html = `
    ${createSectionHeaderMarkup({
      eyebrow: 'Un recuerdo todavía sellado',
      title: section.title,
      status: 'locked'
    })}
    <div class="panel locked-panel">
      <span class="locked-panel__seal" data-decorative>${createSealMarkup()}</span>
      <p class="locked-panel__date">${section.unlockLabel}</p>
      <p class="locked-panel__note">
        El Pensadero permanecerá sellado hasta esa noche. Cuando llegue el
        momento, guardará fotografías y un último recuerdo compartido.
      </p>
      <span class="status-badge status-badge--locked">Sellado hasta la fecha indicada</span>
    </div>
  `;

  return { html };
}
