/**
 * Marcado de los hotspots del Mapa del Castillo. Función pura (lugares
 * + estado de desbloqueo -> HTML), igual que `calendarView.createDetailMarkup`
 * o `discoveriesView.createDiscoveryListMarkup`: así se puede probar
 * con `node:test`, sin DOM, que un lugar bloqueado nunca expone su
 * destino de navegación ni su contenido ambiental.
 *
 * Reutiliza por completo el componente `.hotspot` ya existente
 * (`scene.css`, usado hoy por el vestíbulo): esta vista solo añade la
 * posición por lugar (vía variables CSS, con un valor para escritorio
 * y otro para móvil) y el estado bloqueado/desbloqueado. No introduce
 * un sistema de hotspots distinto.
 */
import { createIconMarkup } from '../components/icons.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { hotspotPositionStyle } from '../utils/hotspotPosition.js';

/**
 * ¿Está desbloqueado este lugar? `unlockedDays` es el mismo tipo de
 * dato que ya produce `calendar/discoveries.getSolvedDays`: un Set de
 * números de día resueltos. Un lugar sin `unlockAfterDay` siempre está
 * desbloqueado.
 *
 * `flags` cubre el otro tipo de desbloqueo que existe en el Mapa desde
 * esta fase: lugares cuya condición no es una fecha de expediente, sino
 * un descubrimiento propio (p. ej. haber encontrado el libro de la
 * Biblioteca, ver `discoveries/castleSecretsStorage.js`). Un lugar así
 * declara `unlockFlag: '<nombre>'` en vez de `unlockAfterDay`; los
 * siete lugares ya existentes no usan `unlockFlag`, así que su
 * comportamiento no cambia en absoluto.
 */
export function isLocationUnlocked(location, unlockedDays = new Set(), flags = {}) {
  if (location.unlockFlag) return Boolean(flags[location.unlockFlag]);
  return location.unlockAfterDay === null || unlockedDays.has(location.unlockAfterDay);
}

/**
 * El texto ambiental vigente de un lugar, dado el progreso real. Un
 * lugar simple siempre devuelve su `flavorText`. Un lugar con
 * `flavorStages` devuelve la última etapa cuyo `afterDay` ya esté
 * resuelto (o la primera, con `afterDay: null`, si todavía no se ha
 * resuelto ninguna) — nunca una etapa futura. Como solo depende del
 * Set de días resueltos (no de un reloj ni de un contador en memoria),
 * recargar la página con el mismo progreso guardado siempre resuelve
 * exactamente la misma etapa.
 */
export function resolveFlavorText(location, unlockedDays = new Set()) {
  if (!location.flavorStages) return location.flavorText ?? null;

  let current = null;
  for (const stage of location.flavorStages) {
    if (stage.afterDay === null || unlockedDays.has(stage.afterDay)) {
      current = stage.text;
    }
  }
  return current;
}

/**
 * `locations`: `MAP_LOCATIONS` (o un subconjunto, para pruebas).
 * `unlockedDays`: Set de días resueltos (ver `isLocationUnlocked`).
 * `flags`: banderas de descubrimiento no ligadas a una fecha (ver
 * `isLocationUnlocked`); opcional, por defecto ninguna activa.
 */
export function createMapHotspotsMarkup(locations, unlockedDays = new Set(), flags = {}) {
  if (!locations?.length) return '';
  return locations.map((location) => createHotspotMarkup(location, unlockedDays, flags)).join('');
}

function createHotspotMarkup(location, unlockedDays, flags) {
  const unlocked = isLocationUnlocked(location, unlockedDays, flags);
  const safeLabel = escapeHtml(location.label);
  const safeId = escapeHtml(location.id);

  const positionStyle = hotspotPositionStyle(location.position.desktop, location.position.mobile);

  const classNames = ['hotspot', 'map-hotspot', `map-hotspot--${safeId}`];
  if (!unlocked) classNames.push('map-hotspot--locked');

  // Nunca se incluye `data-goto` ni `data-flavor-text` en un lugar
  // bloqueado: así, aunque alguien inspeccione el HTML, el destino o el
  // contenido ambiental de un lugar todavía no desbloqueado no está en
  // el marcado en absoluto (no es solo un asunto de estilo).
  const gotoAttr = unlocked && location.kind === 'navigate' ? ` data-goto="${escapeHtml(location.target)}"` : '';
  const currentFlavorText = unlocked && location.kind === 'ambient' ? resolveFlavorText(location, unlockedDays) : null;
  const flavorAttr = currentFlavorText ? ` data-flavor-text="${escapeHtml(currentFlavorText)}"` : '';
  // Algunos lugares ambientales, además de su texto, esconden un cromo
  // coleccionable (ver `collectibles/`). Igual que `data-goto`/
  // `data-flavor-text`, nunca aparece si el lugar sigue bloqueado.
  const cardAttr = unlocked && location.cardId ? ` data-card-id="${escapeHtml(location.cardId)}"` : '';
  // Igual que `cardId`, pero para el hallazgo coleccionable de esta
  // fase (`discoveries/castleCollectible.js`) — no es un cromo, así que
  // usa su propio atributo en vez de reutilizar `data-card-id`.
  const collectibleAttr =
    unlocked && location.collectibleId ? ` data-collectible-id="${escapeHtml(location.collectibleId)}"` : '';

  const ariaLabel = unlocked ? safeLabel : `${safeLabel}, todavía bloqueado`;
  const captionText = unlocked ? safeLabel : 'Bloqueado por ahora';
  const lockIcon = unlocked
    ? ''
    : `<span class="map-hotspot__lock-icon" aria-hidden="true">${createIconMarkup('lock')}</span>`;

  return `
    <button
      type="button"
      class="${classNames.join(' ')}"
      style="${positionStyle}"
      data-map-hotspot="${safeId}"
      aria-label="${ariaLabel}"
      ${unlocked ? '' : 'disabled'}${gotoAttr}${flavorAttr}${cardAttr}${collectibleAttr}
    >
      <span class="hotspot__glow" aria-hidden="true"></span>
      ${lockIcon}
      <span class="hotspot__caption" aria-hidden="true">${captionText}</span>
    </button>
  `;
}
