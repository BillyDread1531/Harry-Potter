/**
 * «La cerradura de la polilla» — primer minijuego real del proyecto.
 * Datos puros del acertijo: el palíndromo de símbolos no existe aquí,
 * solo una secuencia ordenada de cuatro símbolos distintos, deducible a
 * partir de tres pistas estructurales. Nada en este archivo toca el
 * DOM ni `localStorage` — igual que `calendar/riddlesData.js` y
 * `calendar/riddleValidator.js`, para que el diseño del acertijo se
 * pueda verificar con `node:test` sin levantar un navegador.
 *
 * DISEÑO DEL ACERTIJO (para quien mantenga este archivo, nunca para la
 * interfaz de Andrea):
 *
 * Los cuatro símbolos son Llave, Luna, Pluma y Vela. La secuencia
 * correcta ocupa las posiciones 1-4 (índices 0-3) así:
 *
 *   1. Llave   2. Vela   3. Luna   4. Pluma
 *
 * Tres pistas, cada una una restricción lógica distinta, determinan
 * esa secuencia de forma única entre las 4! = 24 ordenaciones posibles
 * de los cuatro símbolos:
 *
 *   - PISTA «pluma-final»:      pluma ocupa siempre la última posición.
 *   - PISTA «llave-antes-luna»: la llave precede a la luna (en
 *     cualquier posición anterior, no necesariamente contigua).
 *   - PISTA «vela-tras-llave»:  la vela ocupa la posición
 *     inmediatamente siguiente a la llave.
 *
 * Por qué la solución es única: fijando pluma en la posición 4, quedan
 * 3! = 6 ordenaciones posibles para llave/luna/vela en las posiciones
 * 1-3. De esas 6, solo 3 cumplen "llave antes que luna". De esas 3,
 * solo 1 cumple además "vela justo después de la llave": con llave=1,
 * vela=2 (único valor posible, ya que vela=llave+1), la única posición
 * libre para luna es la 3, y 1 < 3 también cumple la segunda pista.
 * Ninguna otra combinación de posiciones para llave sobrevive: si
 * llave=2, vela=3 y luna tendría que ser 1, lo que rompe "llave antes
 * que luna"; si llave=3, vela=4 choca con pluma=4. Por tanto, de las 24
 * ordenaciones posibles, exactamente una (`SOLUTION_SEQUENCE`) cumple
 * las tres pistas a la vez — demostrado también de forma exhaustiva
 * (todas las 24 permutaciones) en `test/games/mothLockData.test.js`.
 *
 * Por qué hacen falta las tres: quitando cualquiera de las tres
 * restricciones quedan varias ordenaciones válidas (no una sola), así
 * que ninguna pista sobra y ninguna pista por sí sola —ni dos de las
 * tres— bastan para reconstruir la secuencia con certeza. Esto también
 * se verifica de forma exhaustiva en las pruebas.
 *
 * Ninguno de los cuatro símbolos ni la secuencia resultante coincide
 * con la respuesta canónica de ninguno de los quince expedientes
 * diarios (`calendar/riddlesData.js`) — verificado en las pruebas.
 */

export const SYMBOLS = [
  { id: 'llave', label: 'Llave' },
  { id: 'luna', label: 'Luna' },
  { id: 'pluma', label: 'Pluma' },
  { id: 'vela', label: 'Vela' }
];

const SYMBOL_IDS = SYMBOLS.map((symbol) => symbol.id);

export function getSymbolById(id) {
  return SYMBOLS.find((symbol) => symbol.id === id) ?? null;
}

export const SEQUENCE_LENGTH = 4;

/** Secuencia inicial neutra que muestra el mecanismo al abrirse o reiniciarse: el orden de `SYMBOLS`, que no coincide con la solución. */
export const DEFAULT_SEQUENCE = [...SYMBOL_IDS];

export const SOLUTION_SEQUENCE = ['llave', 'vela', 'luna', 'pluma'];

/**
 * Las tres pistas. `constraint` es la restricción lógica pura que esa
 * pista expresa, reutilizada tanto por la demostración de unicidad en
 * las pruebas como, implícitamente, por el diseño mismo del texto.
 * `text` es la inscripción narrativa que de verdad ve Andrea: describe
 * la restricción sin nombrar nunca la secuencia completa.
 */
export const CLUES = [
  {
    id: 'pluma-final',
    label: 'Una inscripción en el borde inferior del mecanismo',
    text: 'La pluma no abre, solo sabe cerrar: siempre es la última, nunca al empezar.',
    constraint: (sequence) => sequence[3] === 'pluma'
  },
  {
    id: 'llave-antes-luna',
    label: 'Un grabado en el marco de piedra',
    text: 'Ninguna luna osa aparecer sin que la llave la deje ver.',
    constraint: (sequence) => sequence.indexOf('llave') < sequence.indexOf('luna')
  },
  {
    id: 'vela-tras-llave',
    label: 'Unas runas casi borradas junto al suelo',
    text: 'La llama no tarda en encender: justo tras la llave, ha de nacer.',
    constraint: (sequence) => sequence.indexOf('vela') === sequence.indexOf('llave') + 1
  }
];

/** Pista opcional adicional (no estructural): ayuda a razonar sin nombrar ningún símbolo en una posición concreta. */
export const OPTIONAL_HINT_TEXT =
  'Cada inscripción se apoya en las demás — ninguna basta por sí sola. Una marca un extremo del mecanismo. Otra ordena dos símbolos entre sí, sin pegarlos. La tercera une dos símbolos como vecinos inseparables.';

export function isValidSequence(sequence) {
  if (!Array.isArray(sequence) || sequence.length !== SEQUENCE_LENGTH) return false;
  return sequence.every((id) => SYMBOL_IDS.includes(id));
}

export function isSequenceCorrect(sequence) {
  if (!isValidSequence(sequence)) return false;
  return sequence.every((id, index) => id === SOLUTION_SEQUENCE[index]);
}

/**
 * Estado de la partida, derivado siempre del progreso guardado —nunca
 * uno adicional que haya que mantener sincronizado a mano—, con cuatro
 * valores posibles: `not-started` (ninguna pista encontrada todavía),
 * `exploring` (al menos una pista, pero no todas), `ready` (las tres
 * pistas ya reunidas, lista para intentarse con fundamento) y `solved`.
 * Encontrar una sola pista, o varias, nunca por sí solo cuenta como
 * resuelta.
 */
export function getMothLockPhase({ discoveredClueIds, solved } = {}) {
  if (solved) return 'solved';
  const count = discoveredClueIds?.length ?? 0;
  if (count === 0) return 'not-started';
  if (count >= CLUES.length) return 'ready';
  return 'exploring';
}

export const PHASE_LABELS = {
  'not-started': 'Sin explorar todavía',
  exploring: 'Exploración en curso',
  ready: '✦ Las tres inscripciones ya son tuyas — inténtalo',
  solved: 'Resuelto'
};

/** Texto de victoria al resolver el mecanismo. Vive aquí (contenido puro), no en `mothLockView.js`, para poder reutilizarse también en `discoveries/completedStoriesContent.js`. */
export const VICTORY_TEXT =
  'La cerradura cede con un chasquido suave. De su interior no sale ningún objeto — solo un hilo de luz plateada, con la forma exacta de una polilla, que da una vuelta lenta sobre el mecanismo antes de perderse entre las vigas del techo. No revela nada sobre los expedientes. Solo deja la certeza, un poco incómoda, de que alguien construyó esto sabiendo exactamente qué iba a salir.';
