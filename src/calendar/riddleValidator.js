/**
 * Validador de respuestas de los acertijos. Función pura, sin DOM, sin
 * IA ni servicio externo: normaliza, compara contra la respuesta
 * canónica y sus variantes explícitas, y tolera errores tipográficos
 * MENORES dentro de un límite acotado y justificado — nunca "lo que
 * esté cerca en distancia de edición" sin más.
 *
 * Estrategia (y sus límites, deliberados):
 *
 * 1. Normaliza ambos lados: minúsculas, sin tildes/diacríticos, sin
 *    espacios sobrantes. Dos respuestas iguales salvo mayúsculas,
 *    tildes o espacios ya cuentan como la misma cadena en este punto.
 * 2. Compara contra la respuesta canónica y cada variante aceptada
 *    explícitamente (ya normalizadas). Esto cubre sinónimos reales
 *    ("medallón" / "guardapelo") sin adivinarlos en tiempo de
 *    ejecución.
 * 3. Si ninguna coincide exacto, permite una distancia de edición
 *    (Levenshtein) MUY pequeña, cuyo límite depende de la longitud de
 *    la cadena candidata:
 *      - 4 caracteres o menos: 0 (sin tolerancia — a esa longitud,
 *        "ojo" y "oro" ya están a distancia 1 y son cosas distintas).
 *      - 5 a 9 caracteres: 1.
 *      - 10 o más: 2.
 *    Además exige que la diferencia de longitud entre lo escrito y el
 *    candidato no supere ese mismo límite, para que una palabra mucho
 *    más corta o larga nunca "caiga dentro" por casualidad en textos
 *    breves.
 *
 * Esto acepta "snich dorada" para "snitch dorada" (un carácter de
 * diferencia) pero rechaza "capa" para "mapa" (palabras distintas de
 * longitud distinta, por debajo del umbral de tolerancia) y rechaza
 * "pelota" para "snitch dorada" (ni de cerca dentro de la distancia
 * permitida). No es semántica: es deliberadamente mecánica y acotada,
 * para que nunca "adivine" el significado de una respuesta vaga.
 */

export function normalizeAnswer(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita diacríticos (tildes, diéresis)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function levenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 1; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // borrado
        matrix[i][j - 1] + 1, // inserción
        matrix[i - 1][j - 1] + cost // sustitución
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

function toleranceFor(normalizedCandidate) {
  const length = normalizedCandidate.length;
  if (length <= 4) return 0;
  if (length <= 9) return 1;
  return 2;
}

function isWithinTolerance(normalizedInput, normalizedCandidate) {
  if (normalizedInput === normalizedCandidate) return true;

  const tolerance = toleranceFor(normalizedCandidate);
  if (tolerance === 0) return false;
  if (Math.abs(normalizedInput.length - normalizedCandidate.length) > tolerance) return false;

  return levenshteinDistance(normalizedInput, normalizedCandidate) <= tolerance;
}

/**
 * Evalúa una respuesta contra un acertijo. Devuelve siempre uno de
 * tres estados — nunca información adicional que pudiera insinuar qué
 * tan cerca estuvo una respuesta incorrecta.
 */
export function validateRiddleAnswer(rawInput, riddle) {
  const normalizedInput = normalizeAnswer(rawInput);
  if (!normalizedInput) return { status: 'empty' };
  if (!riddle || typeof riddle.canonicalAnswer !== 'string') return { status: 'incorrect' };

  const candidates = [riddle.canonicalAnswer, ...(riddle.acceptedVariants ?? [])].map(normalizeAnswer);

  const isCorrect = candidates.some((candidate) => candidate && isWithinTolerance(normalizedInput, candidate));
  return { status: isCorrect ? 'correct' : 'incorrect' };
}
