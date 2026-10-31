/**
 * «Las runas» — quinto minijuego del proyecto, en la Sala de los
 * Menesteres. Mecánica de memoria, no de deducción: a diferencia de
 * los otros cuatro (cada uno resoluble por lógica a partir de pistas),
 * aquí el propio mecanismo MUESTRA la secuencia correcta — el reto es
 * recordarla, no deducirla. Por eso no hay "pistas" que descubrir ni
 * una demostración de unicidad: la única pregunta que vale probar es
 * que la comparación de secuencias funcione bien. Nada en este
 * archivo toca el DOM ni `localStorage`.
 *
 * Deliberadamente sin límite de tiempo ni de intentos (coherente con
 * el resto del proyecto: la cerradura de la polilla, el catálogo, los
 * pasos ocultos y el sello tampoco penalizan nunca un intento fallido).
 * Ver la secuencia nunca está cronometrado — se revela como texto, a
 * ritmo propio, nunca como una animación que haya que seguir a tiempo.
 */

export const RUNES = [
  { id: 'estrella', label: 'Runa de la estrella' },
  { id: 'ola', label: 'Runa de la ola' },
  { id: 'espiral', label: 'Runa de la espiral' },
  { id: 'llama', label: 'Runa de la llama' },
  { id: 'raiz', label: 'Runa de la raíz' }
];

const RUNE_IDS = RUNES.map((rune) => rune.id);

export function getRuneById(id) {
  return RUNES.find((rune) => rune.id === id) ?? null;
}

export const SEQUENCE_LENGTH = 4;

export const TARGET_SEQUENCE = ['ola', 'raiz', 'estrella', 'llama'];

export function isSequenceCorrect(sequence) {
  if (!Array.isArray(sequence) || sequence.length !== SEQUENCE_LENGTH) return false;
  return sequence.every((id, index) => id === TARGET_SEQUENCE[index]);
}

export const VICTORY_TEXT =
  'Las cuatro runas se apagan a la vez, en el mismo instante — no una tras otra, como cabría esperar, sino todas juntas, como si hubieran estado esperando a que alguien las recordara completas, no una por una.';
