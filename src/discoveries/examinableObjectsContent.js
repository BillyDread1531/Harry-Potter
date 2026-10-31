/**
 * Contenido de los objetos mágicos examinables de esta fase: el cofre
 * del Archivo (cuya lectura cambia tras reconocer el patrón del
 * recorrido secreto de la polilla, `threeMarksRecognized` — reutilizado
 * de la fase anterior, no una bandera nueva) y la lámpara de la
 * Biblioteca (cuya intensidad visual evoluciona con el acto narrativo,
 * ver `scenes/bibliotecaScene.js`). Ninguno de los dos nombra objetos,
 * regalos, el Pensadero ni la respuesta de ningún expediente.
 */

export const CHEST_VAGUE_TEXT =
  'El cofre no tiene ninguna marca visible más allá de la cerradura que ya conoces. Pesa más de lo que debería para estar, según todos los indicios, completamente vacío.';

export const CHEST_PATTERN_AWARE_TEXT =
  'Ahora que reconoces el patrón de las tres marcas, notas algo más en el cofre: ese peso de más no es un descuido de quien lo construyó. Algo sigue ahí dentro, exactamente donde el patrón decía que debía estar.';

export function getChestText({ threeMarksRecognized = false } = {}) {
  return threeMarksRecognized ? CHEST_PATTERN_AWARE_TEXT : CHEST_VAGUE_TEXT;
}

export const LAMP_REVEAL_TEXT =
  'La lámpara de latón arde con una calidez casi deliberada, como si llevara siglos iluminando exactamente los libros que alguien, tarde o temprano, necesitaba encontrar.';
