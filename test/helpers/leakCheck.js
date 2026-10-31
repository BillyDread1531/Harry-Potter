/**
 * Infraestructura compartida de pruebas para detectar filtraciones de
 * respuestas futuras: si un texto visible para Andrea en el momento
 * `visibleAfterDay` menciona la respuesta canónica de un expediente
 * que todavía no existe en ese momento (día > `visibleAfterDay`).
 *
 * Deliberadamente NO compara contra respuestas de días anteriores o
 * iguales a `visibleAfterDay` (esas ya las conoce o está a punto de
 * conocerlas en ese mismo instante — no son una filtración) y
 * deliberadamente compara frases completas (p. ej. "mapa del
 * merodeador"), no palabras sueltas, para no disparar con nombres
 * genéricos del mundo mágico que aparecen con normalidad en el resto
 * del texto (ver `riddlesData.js` día 7, "Amortentia", que no se
 * confunde con ninguna otra respuesta por compartir letras sueltas).
 *
 * Misma normalización que `riddleValidator.normalizeAnswer` (sin
 * tildes, minúsculas, espacios colapsados), para que "qué cuenta como
 * la misma palabra" sea coherente en todo el proyecto.
 */
import assert from 'node:assert/strict';
import { RIDDLES } from '../../src/calendar/riddlesData.js';

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** La respuesta canónica sin artículo inicial, normalizada — la misma frase que ya usan las demás pruebas del proyecto. */
export function bareAnswer(canonicalAnswer) {
  return normalize(canonicalAnswer.replace(/^(el|la|un|una)\s+/i, ''));
}

/**
 * Comprueba que `text` no contenga la respuesta canónica de ningún día
 * estrictamente posterior a `visibleAfterDay`.
 *
 * `exceptions`: Map opcional de día -> motivo, para referencias
 * legítimas ya documentadas y acotadas (nunca una exclusión general).
 * Cada excepción usada debe existir también como caso de prueba
 * explícito en el archivo que la declara, para que quede registrada,
 * no solo silenciada.
 */
export function assertNoFutureAnswerLeak(text, visibleAfterDay, { context = '', exceptions = new Map() } = {}) {
  if (!text) return;
  const normalizedText = normalize(text);

  for (const riddle of RIDDLES) {
    if (riddle.day <= visibleAfterDay) continue; // ya resuelto o resolviéndose en este mismo instante: no es una filtración
    if (exceptions.has(riddle.day)) continue;

    const answer = bareAnswer(riddle.canonicalAnswer);
    assert.equal(
      normalizedText.includes(answer),
      false,
      `${context}: menciona la respuesta del día ${riddle.day} ("${answer}"), que todavía no existe cuando esto se vuelve visible (día ${visibleAfterDay})`
    );
  }
}
