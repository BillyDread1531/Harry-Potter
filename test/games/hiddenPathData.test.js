import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MARKS,
  CLUES,
  SOLUTION_SEQUENCE,
  isSequenceCorrect,
  getMarkById,
  getHiddenPathPhase
} from '../../src/games/hiddenPathData.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

const ALL_PERMUTATIONS = permutations(MARKS.map((mark) => mark.id));

describe('games/hiddenPathData.js — los pasos ocultos', () => {
  test('hay cuatro marcas, con ids únicos', () => {
    assert.equal(MARKS.length, 4);
    assert.equal(new Set(MARKS.map((mark) => mark.id)).size, 4);
  });

  test('hay exactamente 24 permutaciones posibles (4!)', () => {
    assert.equal(ALL_PERMUTATIONS.length, 24);
  });

  test('exactamente una permutación cumple las tres pistas a la vez (prueba exhaustiva)', () => {
    const matching = ALL_PERMUTATIONS.filter((seq) => CLUES.every((clue) => clue.constraint(seq)));
    assert.equal(matching.length, 1);
    assert.deepEqual(matching[0], SOLUTION_SEQUENCE);
  });

  test('ninguna pista sobra: quitando cualquiera de las tres, quedan varias secuencias posibles', () => {
    for (const omitted of CLUES) {
      const remainingClues = CLUES.filter((clue) => clue.id !== omitted.id);
      const matching = ALL_PERMUTATIONS.filter((seq) => remainingClues.every((clue) => clue.constraint(seq)));
      assert.ok(matching.length > 1, `sin la pista "${omitted.id}" debería haber más de una secuencia posible`);
      assert.ok(matching.some((seq) => seq.join() === SOLUTION_SEQUENCE.join()));
    }
  });

  test('isSequenceCorrect solo acepta la secuencia solución exacta', () => {
    assert.equal(isSequenceCorrect(SOLUTION_SEQUENCE), true);
    for (const perm of ALL_PERMUTATIONS) {
      if (perm.join() === SOLUTION_SEQUENCE.join()) continue;
      assert.equal(isSequenceCorrect(perm), false, `${perm.join(',')} no debería aceptarse`);
    }
  });

  test('isSequenceCorrect rechaza entradas inválidas (longitud, repetidos, ids desconocidos)', () => {
    assert.equal(isSequenceCorrect(['norte', 'pozo', 'torre']), false);
    assert.equal(isSequenceCorrect(['norte', 'norte', 'torre', 'puente']), false);
    assert.equal(isSequenceCorrect(['norte', 'pozo', 'torre', 'no-existe']), false);
    assert.equal(isSequenceCorrect(null), false);
  });

  test('getMarkById encuentra cada marca de la solución', () => {
    for (const id of SOLUTION_SEQUENCE) {
      assert.ok(getMarkById(id));
    }
    assert.equal(getMarkById('no-existe'), null);
  });

  test('getHiddenPathPhase refleja el progreso real', () => {
    assert.equal(getHiddenPathPhase({ discoveredClueIds: [], solved: false }), 'not-started');
    assert.equal(getHiddenPathPhase({ discoveredClueIds: ['puente-ultimo'], solved: false }), 'exploring');
    assert.equal(
      getHiddenPathPhase({ discoveredClueIds: CLUES.map((c) => c.id), solved: false }),
      'ready'
    );
    assert.equal(getHiddenPathPhase({ discoveredClueIds: [], solved: true }), 'solved');
  });

  test('ninguna pista ni el texto de victoria revela una respuesta canónica, el Pensadero, el desenlace o un regalo', () => {
    const texts = CLUES.map((clue) => clue.text);
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const text of texts) {
        assert.equal(text.toLowerCase().includes(bareAnswer), false, `una pista menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
    for (const text of texts) {
      assert.equal(text.toLowerCase().includes('pensadero'), false);
      assert.equal(text.toLowerCase().includes('regalo'), false);
    }
  });
});
