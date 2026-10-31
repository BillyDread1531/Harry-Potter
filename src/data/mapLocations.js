/**
 * Lugares interactivos del Mapa del Castillo — datos puros, separados
 * de la presentación (mismo criterio que `riddlesData.js`/`secretsData.js`).
 * Nada aquí depende del DOM ni del progreso guardado: `unlockAfterDay`
 * solo declara LA CONDICIÓN; comprobarla contra el progreso real es
 * responsabilidad de quien monte la escena (reutilizando
 * `calendar/discoveries.getSolvedDays`, el mismo mecanismo que ya usan
 * la Biblioteca y el Archivo).
 *
 * Cada posición está expresada en porcentaje (0–100) del contenedor de
 * la escena, no en píxeles: así sigue funcionando si el fondo escala.
 * `position.desktop` y `position.mobile` son DELIBERADAMENTE distintos:
 * `mapa-desktop.jpg` y `mapa-mobile.jpg` no son el mismo encuadre
 * reescalado, sino recortes distintos de la misma escena (la foto
 * móvil, más vertical, muestra menos de la chimenea de la derecha y
 * acerca más la mesa), así que un único par de coordenadas no
 * coincidiría con los mismos objetos en ambas versiones.
 *
 * Las coordenadas de abajo son una primera estimación visual sobre las
 * fotos ya existentes en `public/assets/backgrounds/mapa-*.jpg`; se
 * afinarán al ver los hotspots renderizados de verdad sobre el fondo
 * (fase de implementación visual), no en esta fase de datos.
 *
 * Las posiciones `mobile` se reajustaron en la fase de adaptación a
 * iPhone: en una pantalla angosta, `.scene-frame__content` (título +
 * descripción) ocupa casi todo el ancho y gran parte del alto superior
 * de la escena (a diferencia de escritorio, donde es una columna
 * angosta con la foto visible alrededor) — varios lugares quedaban
 * literalmente encima del texto.
 *
 * Al añadir «los pasos ocultos» (ver `games/hiddenPathView.js`), el
 * Mapa pasó a tener 18 puntos interactivos en móvil (estos nueve +
 * patrón + corriente fría + tres pistas + cuatro marcas del nuevo
 * minijuego), así que la cuadrícula se amplió de 3×3 a 6×3: columnas
 * en x ≈ 8/25/42/58/75/92%, filas en y ≈ 65/79/93%. Las posiciones
 * `mobile` de este archivo ocupan la primera fila completa y el
 * principio de la segunda; el resto de la cuadrícula se reparte entre
 * `scenes/mapaScene.js` (patrón, corriente fría) y
 * `games/hiddenPathView.js` (pistas y marcas) — un único plano de
 * coordenadas compartido entre los tres archivos, para que ningún par
 * de puntos quede a menos del ~15% de separación necesario.
 *
 * `kind`:
 *  - 'navigate': el hotspot lleva a otra escena (`target`, un id de
 *    `data/sections.js`).
 *  - 'ambient': el hotspot no navega a ningún sitio; revela un detalle
 *    breve propio del mapa (`flavorText`), distinto del contenido de
 *    `secretsData.js` (esos son hallazgos de Biblioteca/Archivo; estos
 *    son ambientación del mapa en sí).
 *
 * `unlockAfterDay`: `null` si el lugar está siempre disponible, o el
 * número de expediente cuya resolución lo desbloquea.
 *
 * `flavorText` (string) es el contenido ambiental de un lugar simple.
 * Un lugar cuyo contenido debe evolucionar con el progreso usa en su
 * lugar `flavorStages` (array ordenado de `{ afterDay, text }`); ver
 * `mapHotspotsView.resolveFlavorText`. Son mutuamente excluyentes.
 *
 * `cardId` (opcional): si está presente, este lugar también esconde un
 * cromo coleccionable (`collectibles/cardsData.js`) — `mapaScene.js` lo
 * marca como encontrado al abrirlo. Su `flavorText` ya incluye el texto
 * del cromo (se construye a partir de `cardsData.js`, nunca se
 * duplica a mano aquí).
 */
import { getCardById } from '../collectibles/cardsData.js';
import { createCardRevealText } from '../collectibles/cardsView.js';
import { MAP_BOOK_ECHO_TEXT } from '../discoveries/libraryBookContent.js';
import { CASTLE_COLLECTIBLE } from '../discoveries/castleCollectible.js';
export const MAP_LOCATIONS = [
  {
    id: 'mesa-pergamino',
    label: 'El pergamino de la mesa',
    kind: 'ambient',
    target: null,
    unlockAfterDay: null,
    position: {
      desktop: { x: 52, y: 78 },
      mobile: { x: 8, y: 65 }
    },
    flavorText: null,
    // El pergamino es el único lugar del mapa que "recuerda" el avance
    // real: cada etapa reemplaza a la anterior (no se acumulan), y
    // ninguna aparece antes de que su día se resuelva de verdad. Los
    // `afterDay` están en orden ascendente a propósito —
    // `mapHotspotsView.resolveFlavorText` se queda con la última etapa
    // alcanzada, no con todas.
    flavorStages: [
      {
        afterDay: null,
        text: 'El pergamino sigue casi en blanco. Solo una esquina muestra, apenas, el trazo de un camino, como si supiera hacia dónde vas pero no quisiera adelantártelo.'
      },
      {
        afterDay: 4,
        text: 'El trazo ya no es solo una esquina: ahora dibuja, tímido, el contorno de una polilla en el borde del pergamino.'
      },
      {
        afterDay: 8,
        text: 'El pergamino empieza a completar un camino que no se parece a ningún pasillo real del castillo, como si dibujara una intención en vez de una piedra.'
      },
      {
        afterDay: 12,
        text: 'Tres líneas finas, un triángulo, un círculo y una línea, aparecen trazadas junto al dibujo de la polilla. El mapa ya no parece confundido: parece decidido.'
      },
      {
        afterDay: 13,
        text: 'Un pasillo nuevo se dibuja, por fin, uniendo la escalera con un punto que el pergamino todavía no se atreve a nombrar.'
      }
    ]
  },
  {
    id: 'escalera-caracol',
    label: 'La escalera de caracol',
    kind: 'ambient',
    target: null,
    unlockAfterDay: 5,
    position: {
      desktop: { x: 47, y: 39 },
      mobile: { x: 25, y: 65 }
    },
    flavorText:
      'Antes de hoy, esta escalera no llevaba a ningún sitio marcado en el pergamino. Ahora sube hacia un punto que el mapa dibuja con una línea distinta a las demás.'
  },
  {
    id: 'estanteria-izquierda',
    label: 'La estantería de la izquierda',
    kind: 'navigate',
    target: 'biblioteca',
    unlockAfterDay: null,
    position: {
      desktop: { x: 11, y: 43 },
      mobile: { x: 42, y: 65 }
    },
    flavorText: null
  },
  {
    id: 'estanteria-derecha',
    label: 'La estantería de la derecha',
    kind: 'navigate',
    target: 'archivo',
    unlockAfterDay: null,
    position: {
      desktop: { x: 91, y: 40 },
      mobile: { x: 58, y: 65 }
    },
    flavorText: null
  },
  {
    id: 'arco-chimenea',
    label: 'El arco junto a la chimenea',
    kind: 'navigate',
    target: 'desafios',
    unlockAfterDay: null,
    position: {
      desktop: { x: 77, y: 47 },
      mobile: { x: 75, y: 65 }
    },
    flavorText: null
  },
  {
    id: 'esfera-armilar',
    label: 'La esfera armilar',
    kind: 'ambient',
    target: null,
    unlockAfterDay: 12,
    position: {
      desktop: { x: 60, y: 49 },
      mobile: { x: 92, y: 65 }
    },
    flavorText:
      'Los anillos de la esfera se detienen siempre en el mismo punto, como si algo, o alguien, les hubiera enseñado un límite que no estaban dispuestos a cruzar.'
  },
  {
    id: 'baul-rincon',
    label: 'Un baúl en el rincón',
    kind: 'ambient',
    target: null,
    unlockAfterDay: 5,
    cardId: 'lupin',
    position: {
      desktop: { x: 22, y: 73 },
      mobile: { x: 8, y: 79 }
    },
    flavorText: createCardRevealText(getCardById('lupin'))
  },
  {
    // Desbloqueado por una bandera de descubrimiento (ver
    // `discoveries/castleSecretsStorage.js`), no por una fecha de
    // expediente: `unlockFlag` reemplaza a `unlockAfterDay` aquí (ver
    // `mapHotspotsView.isLocationUnlocked`). Es el eco, en el Mapa, del
    // libro que se descubre en la Biblioteca.
    id: 'eco-del-libro',
    label: 'Un boceto nuevo en el margen del pergamino',
    kind: 'ambient',
    target: null,
    unlockAfterDay: null,
    unlockFlag: 'bookDiscovered',
    position: {
      desktop: { x: 35, y: 31 },
      mobile: { x: 25, y: 79 }
    },
    flavorText: MAP_BOOK_ECHO_TEXT
  },
  {
    // El hallazgo coleccionable opcional de esta fase: siempre
    // explorable, independiente del progreso diario. `collectibleId`
    // (no `cardId`): no es un cromo, se registra en
    // `discoveries/castleSecretsStorage.js` y se suma al mismo listado
    // de hallazgos del Archivo (`calendar/discoveriesView.js`).
    id: 'pluma-perdida',
    label: CASTLE_COLLECTIBLE.label,
    kind: 'ambient',
    target: null,
    unlockAfterDay: null,
    collectibleId: CASTLE_COLLECTIBLE.id,
    position: {
      desktop: { x: 68, y: 72 },
      mobile: { x: 42, y: 79 }
    },
    flavorText: CASTLE_COLLECTIBLE.body
  }
];

const LOCATION_BY_ID = new Map(MAP_LOCATIONS.map((location) => [location.id, location]));

export function getMapLocationById(id) {
  return LOCATION_BY_ID.get(id) ?? null;
}
