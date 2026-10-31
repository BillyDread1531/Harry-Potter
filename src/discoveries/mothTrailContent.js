/**
 * «El rastro de la polilla» — un recorrido secreto corto entre tres
 * escenas (Biblioteca → Archivo → Mapa), deliberadamente NO formado por
 * tres candados independientes: cada parada reutiliza un detalle que
 * Andrea ya pudo haber visto (la polilla de los márgenes, ya descrita
 * en `calendar/secretsData.js` y en el capítulo del día 4) y el mismo
 * hotspot en la segunda y tercera escena SIEMPRE está ahí — lo que
 * cambia con el progreso real (`discoveries/castleSecretsStorage.js`)
 * es si Andrea reconoce lo que ve, no si el punto existe o no.
 *
 * Nunca depende de los expedientes diarios ni toca el progreso del
 * calendario o la cerradura de la polilla (`games/mothLockData.js`):
 * es un hilo narrativo paralelo, sobre el mismo símbolo, con su propio
 * estado independiente.
 */

/** Biblioteca: el primer detalle, siempre explorable. */
export const MOTH_WING_DETAIL_TEXT =
  'Te acercas más al dibujo de la polilla en el margen del libro de Encantamientos. De cerca, el ala no tiene una sola franja plateada, sino tres, muy juntas, casi como una marca hecha a propósito. Nadie dibuja tres rayas idénticas por accidente.';

/** Archivo: el mismo punto, dos versiones según si ya se notaron las tres franjas. */
export const ARCHIVE_MARKS_VAGUE_TEXT =
  'Junto a la cerradura del cofre hay tres arañazos finos, casi invisibles bajo el polvo. Podrían no ser nada: tres rayas al azar en una madera muy vieja.';

export const ARCHIVE_MARKS_RECOGNIZED_TEXT =
  'Las mismas tres franjas. Exactamente la misma distancia entre ellas que en el margen del libro de la Biblioteca. No son un accidente: alguien dejó la misma marca en dos lugares del castillo, a propósito, para quien supiera mirar dos veces.';

/** Mapa: el desenlace del recorrido, solo con sentido tras reconocer ambas marcas. */
export const MAP_PATTERN_VAGUE_TEXT =
  'En una esquina casi vacía del pergamino, tres puntos diminutos, apenas tinta, no forman ninguna figura reconocible todavía.';

export const MAP_PATTERN_COMPLETE_TEXT =
  'Tres franjas en un libro. Tres marcas junto a una cerradura. Y ahora, aquí, un tercer trazo que no estaba antes: una línea fina que une los tres puntos en el pergamino, formando el contorno, inconfundible ya, de un ala de polilla. El patrón nunca fue casualidad — estaba esperando a que lo notaras en orden.';
