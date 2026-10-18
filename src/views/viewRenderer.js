import { renderVestibulo } from './vestibuloView.js';
import { renderPending } from './pendingView.js';
import { renderPensadero } from './pensaderoView.js';

/**
 * Despacha cada sección a su renderizador según `section.kind`. Añadir
 * una vista nueva en el futuro solo requiere registrar su `kind` aquí.
 */
export function renderSection(section, context) {
  switch (section.kind) {
    case 'vestibulo':
      return renderVestibulo(context);
    case 'pensadero':
      return renderPensadero(section);
    default:
      return renderPending(section);
  }
}
