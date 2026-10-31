/**
 * «Los pasos ocultos» — tercer minijuego del proyecto, en el Mapa.
 * Mecánica de interacción distinta a los otros dos: aquí no se elige
 * de una lista ni se ordenan símbolos en mandos — se TOCAN, directo
 * sobre el pergamino, cuatro marcas en el orden correcto. La lógica
 * que determina ese orden, sin embargo, reutiliza la misma estructura
 * de prueba, ya demostrada, de `games/mothLockData.js`: tres pistas
 * (una fija la última posición, una ordena dos marcas sin pegarlas,
 * una encadena dos marcas como vecinas inseparables) determinan una
 * única secuencia entre las 4! = 24 posibles. Nada en este archivo
 * toca el DOM ni `localStorage`.
 *
 * DISEÑO DEL ACERTIJO:
 *
 * Cuatro marcas: Norte, Puente, Torre, Pozo. La secuencia correcta:
 *
 *   1. Norte   2. Pozo   3. Torre   4. Puente
 *
 *   - PISTA «puente-ultimo»: Puente ocupa siempre la última posición.
 *   - PISTA «norte-antes-torre»: Norte precede a Torre.
 *   - PISTA «pozo-tras-norte»: Pozo ocupa la posición inmediatamente
 *     siguiente a Norte.
 *
 * La prueba de unicidad es estructuralmente idéntica a la de
 * `mothLockData.js` (mismo tipo de restricciones, mismo conteo:
 * fijar la última posición deja 3! = 6 opciones para las tres
 * restantes; de esas, solo 3 cumplen la segunda pista; de esas, solo
 * 1 cumple también la tercera) — verificada de forma exhaustiva e
 * independiente en `test/games/hiddenPathData.test.js`.
 */

export const MARKS = [
  { id: 'norte', label: 'La marca del Norte' },
  { id: 'puente', label: 'La marca del Puente' },
  { id: 'torre', label: 'La marca de la Torre' },
  { id: 'pozo', label: 'La marca del Pozo' }
];

const MARK_IDS = MARKS.map((mark) => mark.id);

export function getMarkById(id) {
  return MARKS.find((mark) => mark.id === id) ?? null;
}

export const SEQUENCE_LENGTH = 4;

export const SOLUTION_SEQUENCE = ['norte', 'pozo', 'torre', 'puente'];

export const CLUES = [
  {
    id: 'puente-ultimo',
    label: 'Un trazo casi borrado junto al título del pergamino',
    text: 'El puente al final se ha de cruzar, nunca al principio, ni a medio andar.',
    constraint: (sequence) => sequence[3] === 'puente'
  },
  {
    id: 'norte-antes-torre',
    label: 'Una nota en la esquina del pergamino',
    text: 'A la torre nadie puede llegar sin antes por el norte pasar.',
    constraint: (sequence) => sequence.indexOf('norte') < sequence.indexOf('torre')
  },
  {
    id: 'pozo-tras-norte',
    label: 'Una línea diminuta junto a la leyenda del mapa',
    text: 'Del norte al pozo, sin tardar, un solo paso has de marcar.',
    constraint: (sequence) => sequence.indexOf('pozo') === sequence.indexOf('norte') + 1
  }
];

export function isSequenceCorrect(sequence) {
  if (!Array.isArray(sequence) || sequence.length !== SEQUENCE_LENGTH) return false;
  if (new Set(sequence).size !== SEQUENCE_LENGTH) return false;
  if (!sequence.every((id) => MARK_IDS.includes(id))) return false;
  return sequence.every((id, index) => id === SOLUTION_SEQUENCE[index]);
}

export function getHiddenPathPhase({ discoveredClueIds, solved } = {}) {
  if (solved) return 'solved';
  const count = discoveredClueIds?.length ?? 0;
  if (count === 0) return 'not-started';
  if (count >= CLUES.length) return 'ready';
  return 'exploring';
}

export const PHASE_LABELS = {
  'not-started': 'Sin explorar todavía',
  exploring: 'Exploración en curso',
  ready: '✦ Las tres pistas ya son tuyas — traza el camino',
  solved: 'Resuelto'
};

export const VICTORY_TEXT =
  'El último trazo se completa solo, uniendo las cuatro marcas en un camino que no se parece a ningún pasillo real del castillo — más bien a una intención, trazada de antemano, esperando a que alguien la recorriera en el orden correcto.';
