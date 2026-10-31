/**
 * «El sello correcto» — cuarto minijuego del proyecto, en el Archivo
 * Secreto. Mecánica distinta a las otras tres: no se elige un único
 * candidato (catálogo), no se ordena una secuencia (cerradura de la
 * polilla, pasos ocultos) — aquí hay que EMPAREJAR tres sellos con las
 * tres entradas del archivo a las que pertenecen de verdad. Nada en
 * este archivo toca el DOM ni `localStorage`.
 *
 * DISEÑO DEL ACERTIJO (para quien mantenga este archivo, nunca para la
 * interfaz de Andrea):
 *
 * Tres sellos (Sol, Estrella, Cometa) deben emparejarse, uno a uno,
 * con tres entradas del archivo (I, II, III) — 3! = 6 emparejamientos
 * posibles. El correcto es Sol→II, Estrella→III, Cometa→I.
 *
 * Tres pistas, cada una una eliminación simple:
 *
 *   - PISTA «sol-no-primera»: el sello del Sol no corresponde a la
 *     primera entrada.
 *   - PISTA «estrella-no-primera»: el sello de la Estrella no
 *     corresponde a la primera entrada.
 *   - PISTA «sol-no-ultima»: el sello del Sol no corresponde a la
 *     última entrada.
 *
 * Por qué la solución es única: las pistas «sol-no-primera» +
 * «sol-no-ultima» juntas ya fuerzan Sol→II (la única entrada que le
 * queda libre). Con el Sol fijo en la entrada II, solo quedan dos
 * posiciones (I, III) para Estrella y Cometa; «estrella-no-primera»
 * fuerza Estrella→III, y por eliminación Cometa→I.
 *
 * Por qué hacen falta las tres: quitando cualquiera de las tres deja
 * más de un emparejamiento posible — verificado de forma exhaustiva
 * (los 6 emparejamientos) en `test/games/sealData.test.js`.
 */

export const SEALS = [
  { id: 'sol', label: 'El sello del Sol' },
  { id: 'estrella', label: 'El sello de la Estrella' },
  { id: 'cometa', label: 'El sello del Cometa' }
];

export const ENTRIES = [
  { id: 'I', label: 'Primera entrada' },
  { id: 'II', label: 'Segunda entrada' },
  { id: 'III', label: 'Tercera entrada' }
];

const SEAL_IDS = SEALS.map((seal) => seal.id);
const ENTRY_IDS = ENTRIES.map((entry) => entry.id);

export function getSealById(id) {
  return SEALS.find((seal) => seal.id === id) ?? null;
}

export function getEntryById(id) {
  return ENTRIES.find((entry) => entry.id === id) ?? null;
}

/** La solución, como asignación sello -> entrada. */
export const SOLUTION_ASSIGNMENT = { sol: 'II', estrella: 'III', cometa: 'I' };

export const CLUES = [
  {
    id: 'sol-no-primera',
    label: 'Una anotación junto al sello del Sol',
    text: 'El Sol no brilla en la entrada primera; busca más allá, donde él de verdad espera.',
    constraint: (assignment) => assignment.sol !== 'I'
  },
  {
    id: 'estrella-no-primera',
    label: 'Una anotación junto al sello de la Estrella',
    text: 'Tampoco la Estrella ahí se asienta: la primera entrada a otro sello presenta.',
    constraint: (assignment) => assignment.estrella !== 'I'
  },
  {
    id: 'sol-no-ultima',
    label: 'Una segunda anotación junto al sello del Sol',
    text: 'Ni al principio ni al final el Sol se posa: en medio de las tres su sello reposa.',
    constraint: (assignment) => assignment.sol !== 'III'
  }
];

/** `assignment` es un objeto { sol, estrella, cometa } -> id de entrada. */
export function isValidAssignment(assignment) {
  if (!assignment || typeof assignment !== 'object') return false;
  if (!SEAL_IDS.every((id) => ENTRY_IDS.includes(assignment[id]))) return false;
  const usedEntries = SEAL_IDS.map((id) => assignment[id]);
  return new Set(usedEntries).size === SEAL_IDS.length;
}

export function isCorrectAssignment(assignment) {
  if (!isValidAssignment(assignment)) return false;
  return SEAL_IDS.every((id) => assignment[id] === SOLUTION_ASSIGNMENT[id]);
}

export function getSealPhase({ discoveredClueIds, solved } = {}) {
  if (solved) return 'solved';
  const count = discoveredClueIds?.length ?? 0;
  if (count === 0) return 'not-started';
  if (count >= CLUES.length) return 'ready';
  return 'exploring';
}

export const PHASE_LABELS = {
  'not-started': 'Sin explorar todavía',
  exploring: 'Exploración en curso',
  ready: '✦ Las tres pistas ya son tuyas — coloca los sellos',
  solved: 'Resuelto'
};

export const VICTORY_TEXT =
  'Los tres sellos encajan en su sitio con un chasquido seco, uno tras otro. El compartimento que protegían se abre apenas una rendija — lo suficiente para ver que no está vacío, aunque todavía no para ver qué guarda.';

/**
 * Contenido real del compartimento: solo existe una vez resuelto el
 * sello (nunca antes), y hay que pedirlo aparte (un segundo gesto,
 * no un texto que se regala solo). No nombra a nadie ni confirma
 * nada — el mismo criterio de todo el proyecto.
 */
export const COMPARTMENT_CONTENTS_TEXT =
  'Dentro, envuelto en un paño ya viejo, hay un retrato diminuto — no de un mago famoso, sino de dos personas cualquiera, en un lugar que no es el castillo. Nadie explica quiénes son. No hace falta.';
