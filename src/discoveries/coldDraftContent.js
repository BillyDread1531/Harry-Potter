/**
 * «La corriente fría» — el misterio ambiental de esta fase. Se
 * manifiesta de forma distinta en cuatro escenas: una aparición
 * puramente visual en el Vestíbulo (sin texto, solo ambientación —
 * ver `scenes/vestibuloScene.js`), un hotspot fijo en la Biblioteca,
 * otro en el Mapa (cuya lectura se enriquece tras la Biblioteca) y,
 * por último, un punto de resolución en la Sala de los Menesteres que
 * solo tiene sentido completo una vez reconocida la conexión en las
 * otras dos.
 *
 * Deliberadamente NO es una combinación de símbolos (eso ya es «La
 * cerradura de la polilla») ni una cadena de candados secuenciales
 * (eso ya es el recorrido de la polilla de la fase anterior): aquí
 * cada punto está siempre presente, nunca oculto ni deshabilitado;
 * lo único que cambia con el progreso real es cuánto se reconoce al
 * leerlo, y la resolución es una ACCIÓN (cerrar la corriente), no una
 * respuesta correcta.
 */

/** Biblioteca: siempre explorable. */
export const COLD_DRAFT_LIBRARY_TEXT =
  'Entre estos dos estantes concretos el aire está notablemente más frío que en el resto de la sala. No hay ninguna ventana cerca, ninguna corriente real que lo explique — solo ese frío, quieto, como si algo hubiera pasado por ahí hace un momento y no del todo se hubiera ido.';

/** Mapa: dos versiones, según si ya se sintió en la Biblioteca. */
export const COLD_DRAFT_MAP_VAGUE_TEXT =
  'El pergamino tiembla un instante sobre la mesa, como si una corriente de aire lo hubiera rozado. Ninguna ventana está abierta cerca.';

export const COLD_DRAFT_MAP_CONNECTED_TEXT =
  'El mismo frío que sentiste entre los estantes de la Biblioteca, aquí, sobre la mesa. No es el viento: es la misma corriente, visitando otro rincón del castillo, como si recorriera un camino propio entre ambas salas.';

/** Sala de los Menesteres: vago hasta reconocer la conexión en los otros dos lugares; luego, la resolución. */
export const COLD_DRAFT_ROOM_WAITING_TEXT =
  'Al fondo de este pasillo el frío se concentra más que en ningún otro lugar de la sala — pero todavía no sabes qué hacer con eso.';

export const COLD_DRAFT_ROOM_READY_TEXT =
  'Aquí, al fondo del pasillo, el frío se concentra como en ningún otro lugar — el mismo que ya reconociste en la Biblioteca y en el Mapa. Como si el camino que ha recorrido terminara exactamente aquí, esperando a que alguien por fin le preste atención.';

export const COLD_DRAFT_RESOLUTION_TEXT =
  'Te quedas quieta un momento, sin decir nada en concreto, simplemente prestándole al frío la atención que llevaba buscando. Y por primera vez desde que llegaste, lo sientes ceder. No desaparece de golpe — se asienta, despacio, como si el castillo hubiera estado conteniendo el aire y por fin pudiera soltarlo.';

export const COLD_DRAFT_RESOLUTION_BUTTON_LABEL = 'Quedarte quieta un momento';

/**
 * Fase del misterio, derivada siempre del progreso guardado
 * (`discoveries/castleSecretsStorage.js`). `ready-to-resolve` es el
 * único momento en que la Sala de los Menesteres ofrece la acción de
 * resolución; antes de eso, su punto sigue ahí, pero solo da la
 * versión de espera.
 */
export function getColdDraftPhase({ coldDraftFeltLibrary, coldDraftFeltMap, coldDraftResolved } = {}) {
  if (coldDraftResolved) return 'resolved';
  if (coldDraftFeltLibrary && coldDraftFeltMap) return 'ready-to-resolve';
  if (coldDraftFeltLibrary || coldDraftFeltMap) return 'connecting';
  return 'dormant';
}
