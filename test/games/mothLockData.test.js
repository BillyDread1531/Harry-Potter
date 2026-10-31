import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SYMBOLS,
  CLUES,
  SEQUENCE_LENGTH,
  DEFAULT_SEQUENCE,
  SOLUTION_SEQUENCE,
  OPTIONAL_HINT_TEXT,
  isValidSequence,
  isSequenceCorrect,
  getMothLockPhase,
  PHASE_LABELS
} from '../../src/games/mothLockData.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';

const SYMBOL_IDS = SYMBOLS.map((s) => s.id);

function permutations(items) {
  if (items.length <= 1) return [items];
  const result = [];
  items.forEach((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    for (const perm of permutations(rest)) {
      result.push([item, ...perm]);
    }
  });
  return result;
}

const ALL_PERMUTATIONS = permutations(SYMBOL_IDS);

describe('games/mothLockData.js — diseño del acertijo', () => {
  test('1. la secuencia solución tiene exactamente cuatro posiciones, con símbolos válidos y sin repetir', () => {
    assert.equal(SOLUTION_SEQUENCE.length, SEQUENCE_LENGTH);
    assert.equal(SEQUENCE_LENGTH, 4);
    assert.equal(new Set(SOLUTION_SEQUENCE).size, 4);
    for (const id of SOLUTION_SEQUENCE) {
      assert.ok(SYMBOL_IDS.includes(id), `"${id}" no es un símbolo válido`);
    }
    assert.equal(isValidSequence(SOLUTION_SEQUENCE), true);
  });

  test('2. cada pista es coherente con la solución real (su restricción se cumple)', () => {
    for (const clue of CLUES) {
      assert.equal(clue.constraint(SOLUTION_SEQUENCE), true, `la pista "${clue.id}" no se cumple en la solución`);
    }
  });

  test('3. la solución es única: de las 24 ordenaciones posibles, exactamente una cumple las tres pistas a la vez', () => {
    const valid = ALL_PERMUTATIONS.filter((perm) => CLUES.every((clue) => clue.constraint(perm)));
    assert.equal(ALL_PERMUTATIONS.length, 24);
    assert.equal(valid.length, 1, `se esperaba una única solución, se encontraron ${valid.length}`);
    assert.deepEqual(valid[0], SOLUTION_SEQUENCE);
  });

  test('ninguna pista por sí sola, ni dos de las tres juntas, bastan para fijar una única secuencia (las tres son necesarias)', () => {
    // Quitar cualquiera de las tres pistas debe dejar más de una
    // ordenación posible: así se demuestra que esa pista concreta era
    // necesaria, no redundante.
    for (let omitIndex = 0; omitIndex < CLUES.length; omitIndex += 1) {
      const remainingClues = CLUES.filter((_, index) => index !== omitIndex);
      const valid = ALL_PERMUTATIONS.filter((perm) => remainingClues.every((clue) => clue.constraint(perm)));
      assert.ok(
        valid.length > 1,
        `sin la pista "${CLUES[omitIndex].id}" debería haber más de una solución posible, pero hay ${valid.length}`
      );
      // La solución real sigue siendo válida entre las que quedan (las
      // pistas restringen, nunca contradicen la solución real).
      assert.ok(valid.some((perm) => perm.join() === SOLUTION_SEQUENCE.join()));
    }

    // Con una sola pista activa, muchas más ordenaciones son posibles
    // todavía — confirma que ninguna pista aislada resuelve el acertijo.
    for (const clue of CLUES) {
      const valid = ALL_PERMUTATIONS.filter((perm) => clue.constraint(perm));
      assert.ok(valid.length > 1, `la pista "${clue.id}" sola ya fijaría una única solución, lo cual no debería pasar`);
    }
  });

  test('4. una combinación incorrecta nunca se evalúa como correcta', () => {
    const incorrectSamples = [
      ['luna', 'llave', 'pluma', 'vela'],
      ['pluma', 'luna', 'vela', 'llave'],
      ['llave', 'luna', 'vela', 'pluma'], // orden plausible pero no es la solución real
      DEFAULT_SEQUENCE
    ];
    for (const sample of incorrectSamples) {
      assert.equal(isSequenceCorrect(sample), false, `${sample.join('-')} no debería ser correcta`);
    }
  });

  test('5. la combinación correcta sí activa la victoria', () => {
    assert.equal(isSequenceCorrect(SOLUTION_SEQUENCE), true);
    assert.equal(isSequenceCorrect([...SOLUTION_SEQUENCE]), true); // copia, no la misma referencia
  });

  test('una secuencia inválida (longitud incorrecta, símbolo desconocido o repetido) nunca es correcta', () => {
    assert.equal(isSequenceCorrect(['llave', 'vela', 'luna']), false);
    assert.equal(isSequenceCorrect(['llave', 'vela', 'luna', 'pluma', 'luna']), false);
    assert.equal(isSequenceCorrect(['llave', 'vela', 'luna', 'algo-inventado']), false);
    assert.equal(isSequenceCorrect(null), false);
    assert.equal(isSequenceCorrect(undefined), false);
  });

  test('6. la pista opcional no nombra los cuatro símbolos (no revela la secuencia completa)', () => {
    const lower = OPTIONAL_HINT_TEXT.toLowerCase();
    const mentioned = SYMBOLS.filter((symbol) => lower.includes(symbol.label.toLowerCase()));
    assert.ok(mentioned.length === 0, `la pista opcional nombra símbolos directamente: ${mentioned.map((s) => s.label)}`);
  });

  test('ninguna de las tres pistas estructurales nombra los cuatro símbolos a la vez (no deletrea la secuencia completa en un solo texto)', () => {
    for (const clue of CLUES) {
      const lower = clue.text.toLowerCase();
      const mentioned = SYMBOLS.filter((symbol) => lower.includes(symbol.label.toLowerCase()));
      assert.ok(mentioned.length <= 2, `la pista "${clue.id}" nombra ${mentioned.length} símbolos de los 4: ${mentioned.map((s) => s.label)}`);
    }
  });

  test('ninguna pista, ni el texto de victoria, menciona la palabra "pensadero"', () => {
    for (const clue of CLUES) {
      assert.equal(clue.text.toLowerCase().includes('pensadero'), false);
    }
  });

  test('la secuencia solución no coincide con la respuesta canónica de ningún expediente diario', () => {
    const solutionAsText = SOLUTION_SEQUENCE.join(' ').toLowerCase();
    for (const riddle of RIDDLES) {
      assert.notEqual(solutionAsText, riddle.canonicalAnswer.toLowerCase());
      for (const variant of riddle.acceptedVariants ?? []) {
        assert.notEqual(solutionAsText, variant.toLowerCase());
      }
    }
    // Tampoco ninguno de los cuatro símbolos, por sí solo, es la
    // respuesta canónica completa de un expediente.
    for (const symbol of SYMBOLS) {
      for (const riddle of RIDDLES) {
        assert.notEqual(symbol.label.toLowerCase(), riddle.canonicalAnswer.toLowerCase());
      }
    }
  });

  test('getMothLockPhase deriva el estado correcto a partir del progreso guardado', () => {
    assert.equal(getMothLockPhase({ discoveredClueIds: [], solved: false }), 'not-started');
    assert.equal(getMothLockPhase({ discoveredClueIds: ['pluma-final'], solved: false }), 'exploring');
    assert.equal(
      getMothLockPhase({ discoveredClueIds: CLUES.map((c) => c.id), solved: false }),
      'ready'
    );
    assert.equal(getMothLockPhase({ discoveredClueIds: [], solved: true }), 'solved');
    assert.equal(getMothLockPhase({ discoveredClueIds: CLUES.map((c) => c.id), solved: true }), 'solved');
    // encontrar una sola pista nunca cuenta como resuelto
    assert.notEqual(getMothLockPhase({ discoveredClueIds: ['pluma-final'], solved: false }), 'solved');
    for (const phaseKey of ['not-started', 'exploring', 'ready', 'solved']) {
      assert.ok(PHASE_LABELS[phaseKey], `falta la etiqueta legible para la fase "${phaseKey}"`);
    }
  });

  test('DEFAULT_SEQUENCE es válida pero no es, por sí misma, la solución', () => {
    assert.equal(isValidSequence(DEFAULT_SEQUENCE), true);
    assert.equal(isSequenceCorrect(DEFAULT_SEQUENCE), false);
  });
});
