/**
 * «El catálogo imposible» — segundo minijuego del proyecto, en la
 * Biblioteca. Mecánica distinta a «la cerradura de la polilla»: ahí
 * había que ORDENAR cuatro símbolos; aquí hay que ELEGIR, de entre
 * ocho libros casi idénticos, el único que de verdad es el que se
 * busca. Nada en este archivo toca el DOM ni `localStorage` — igual
 * que `mothLockData.js` — para poder verificar el diseño del acertijo
 * con `node:test` sin levantar un navegador.
 *
 * DISEÑO DEL ACERTIJO (para quien mantenga este archivo, nunca para la
 * interfaz de Andrea):
 *
 * Ocho libros, cada uno descrito por tres atributos binarios
 * independientes: `material` (cuero/tela), `color` (verde/rojo) y
 * `posicion` (alto/bajo) — 2×2×2 = 8 combinaciones, una por libro.
 * El libro verdadero es el único con cuero + verde + alto.
 *
 * Tres pistas, cada una elimina TODOS los libros que no cumplen un
 * atributo:
 *
 *   - PISTA «material»: el libro es de cuero (elimina los 4 de tela).
 *   - PISTA «color»: el lomo no es rojo (elimina, de los que quedan,
 *     los 2 de color rojo).
 *   - PISTA «posicion»: no está en el estante bajo (elimina, de los
 *     que quedan, el último libro de estante bajo).
 *
 * Por qué la solución es única: cada pista actúa sobre un atributo
 * distinto e independiente de los otros dos, así que cada una reduce
 * a la mitad los candidatos que quedan (8 → 4 → 2 → 1). Las tres
 * juntas dejan exactamente un libro.
 *
 * Por qué hacen falta las tres: aplicando solo dos cualesquiera de las
 * tres pistas, el atributo que esa pista no toca sigue sin decidirse,
 * así que siempre quedan 2 candidatos posibles, nunca 1 — verificado
 * de forma exhaustiva (los 8 libros) en
 * `test/games/catalogData.test.js`.
 */

const MATERIALS = ['cuero', 'tela'];
const COLORS = ['verde', 'rojo'];
const POSICIONES = ['alto', 'bajo'];

const MATERIAL_LABEL = { cuero: 'cuero', tela: 'tela' };
const COLOR_LABEL = { verde: 'verde', rojo: 'rojo' };
const POSICION_LABEL = { alto: 'estante alto', bajo: 'estante bajo' };

export const BOOKS = MATERIALS.flatMap((material) =>
  COLORS.flatMap((color) =>
    POSICIONES.map((posicion) => ({
      id: `${material}-${color}-${posicion}`,
      material,
      color,
      posicion,
      label: `Lomo de ${MATERIAL_LABEL[material]} ${COLOR_LABEL[color]}, ${POSICION_LABEL[posicion]}`
    }))
  )
);

const BOOK_BY_ID = new Map(BOOKS.map((book) => [book.id, book]));

export function getBookById(id) {
  return BOOK_BY_ID.get(id) ?? null;
}

export const TARGET_BOOK_ID = 'cuero-verde-alto';

export const CLUES = [
  {
    id: 'material',
    label: 'Una ficha de préstamo, casi borrada',
    text: 'En tinta vieja, apenas leída: «De cuero es, nunca de tela vestida.»',
    constraint: (book) => book.material === 'cuero'
  },
  {
    id: 'color',
    label: 'Una anotación del bibliotecario',
    text: 'Con letra firme, al margen escrita: «Su lomo no es rojo; otro color lo habita.»',
    constraint: (book) => book.color !== 'rojo'
  },
  {
    id: 'posicion',
    label: 'Un recuerdo compartido entre dos alumnos',
    text: 'Entre risas, alguien lo recuerda así: «Siempre en lo alto, nunca abajo de aquí.»',
    constraint: (book) => book.posicion !== 'bajo'
  }
];

export function isCorrectBook(bookId) {
  return bookId === TARGET_BOOK_ID;
}

/**
 * Estado del juego, derivado siempre del progreso guardado: `not-started`
 * (ninguna pista encontrada), `exploring` (alguna, no todas), `ready`
 * (las tres, lista para elegir con fundamento) y `solved`.
 */
export function getCatalogPhase({ discoveredClueIds, solved } = {}) {
  if (solved) return 'solved';
  const count = discoveredClueIds?.length ?? 0;
  if (count === 0) return 'not-started';
  if (count >= CLUES.length) return 'ready';
  return 'exploring';
}

export const PHASE_LABELS = {
  'not-started': 'Sin explorar todavía',
  exploring: 'Exploración en curso',
  ready: '✦ Las tres pistas ya son tuyas — elige el libro',
  solved: 'Resuelto'
};

export const VICTORY_TEXT =
  'Al sacarlo del estante, el libro se abre solo en su última página. No hay texto ahí — solo una luna diminuta, dibujada a tinta plateada, junto a la fecha de esta misma noche. Nadie pudo haberlo escrito ayer.';
