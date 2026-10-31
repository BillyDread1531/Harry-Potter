/**
 * «Lo que los cinco juegos escondían» — la única historia de esta fase
 * que no se desbloquea por fecha ni por explorar un rincón, sino por
 * TERMINAR algo: los cinco minijuegos del castillo (el catálogo
 * imposible, los pasos ocultos, el sello correcto, la cerradura de la
 * polilla y las runas), todos a la vez. Un verso corto, en cinco
 * líneas fijas —una por juego, siempre en el mismo orden—, que solo
 * se lee completo cuando los cinco ya están resueltos. Nunca nombra a
 * nadie ni el Pensadero; termina, a propósito, en el mismo registro
 * que el poema principal de los expedientes (ver `calendar/riddlesData.js`).
 */
const VERSE_LINES = [
  'Entre libros iguales, uno fue el real;',
  'un camino escondido te enseñó a buscar;',
  'un sello correcto abrió un sitio sin par;',
  'una llave y una luna aprendieron a esperar;',
  'y una runa más, que no vas a olvidar.'
];

const VERSE_CLOSING =
  'Cinco juegos, una sola intención: que cada pista que encontraste fuera, en el fondo, una forma más de decirte que te quiero.';

export function getCastleVerseParagraphs() {
  return [VERSE_LINES.join(' '), VERSE_CLOSING];
}
