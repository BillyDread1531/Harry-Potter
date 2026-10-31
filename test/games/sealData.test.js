import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SEALS,
  ENTRIES,
  CLUES,
  SOLUTION_ASSIGNMENT,
  isValidAssignment,
  isCorrectAssignment,
  getSealPhase,
  getSealById,
  getEntryById
} from '../../src/games/sealData.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) result.push([arr[i], ...perm]);
  }
  return result;
}

const SEAL_IDS = SEALS.map((seal) => seal.id);
const ENTRY_IDS = ENTRIES.map((entry) => entry.id);
const ALL_ASSIGNMENTS = permutations(ENTRY_IDS).map((perm) =>
  Object.fromEntries(SEAL_IDS.map((sealId, index) => [sealId, perm[index]]))
);

describe('games/sealData.js — el sello correcto', () => {
  test('hay tres sellos y tres entradas, con ids únicos', () => {
    assert.equal(SEALS.length, 3);
    assert.equal(ENTRIES.length, 3);
    assert.equal(new Set(SEAL_IDS).size, 3);
    assert.equal(new Set(ENTRY_IDS).size, 3);
  });

  test('hay exactamente 6 emparejamientos posibles (3!)', () => {
    assert.equal(ALL_ASSIGNMENTS.length, 6);
  });

  test('exactamente un emparejamiento cumple las tres pistas a la vez (prueba exhaustiva)', () => {
    const matching = ALL_ASSIGNMENTS.filter((assignment) => CLUES.every((clue) => clue.constraint(assignment)));
    assert.equal(matching.length, 1);
    assert.deepEqual(matching[0], SOLUTION_ASSIGNMENT);
  });

  test('ninguna pista sobra: quitando cualquiera de las tres, queda más de un emparejamiento posible', () => {
    for (const omitted of CLUES) {
      const remainingClues = CLUES.filter((clue) => clue.id !== omitted.id);
      const matching = ALL_ASSIGNMENTS.filter((assignment) => remainingClues.every((clue) => clue.constraint(assignment)));
      assert.ok(matching.length > 1, `sin la pista "${omitted.id}" debería haber más de un emparejamiento posible`);
      assert.ok(matching.some((assignment) => JSON.stringify(assignment) === JSON.stringify(SOLUTION_ASSIGNMENT)));
    }
  });

  test('isValidAssignment exige las tres entradas usadas exactamente una vez', () => {
    assert.equal(isValidAssignment(SOLUTION_ASSIGNMENT), true);
    assert.equal(isValidAssignment({ sol: 'I', estrella: 'I', cometa: 'II' }), false);
    assert.equal(isValidAssignment({ sol: 'I', estrella: 'II' }), false);
    assert.equal(isValidAssignment(null), false);
  });

  test('isCorrectAssignment solo acepta la asignación solución exacta', () => {
    assert.equal(isCorrectAssignment(SOLUTION_ASSIGNMENT), true);
    for (const assignment of ALL_ASSIGNMENTS) {
      if (JSON.stringify(assignment) === JSON.stringify(SOLUTION_ASSIGNMENT)) continue;
      assert.equal(isCorrectAssignment(assignment), false, `${JSON.stringify(assignment)} no debería aceptarse`);
    }
  });

  test('getSealById y getEntryById encuentran cada elemento real', () => {
    for (const id of SEAL_IDS) assert.ok(getSealById(id));
    for (const id of ENTRY_IDS) assert.ok(getEntryById(id));
    assert.equal(getSealById('no-existe'), null);
    assert.equal(getEntryById('no-existe'), null);
  });

  test('getSealPhase refleja el progreso real', () => {
    assert.equal(getSealPhase({ discoveredClueIds: [], solved: false }), 'not-started');
    assert.equal(getSealPhase({ discoveredClueIds: [CLUES[0].id], solved: false }), 'exploring');
    assert.equal(getSealPhase({ discoveredClueIds: CLUES.map((c) => c.id), solved: false }), 'ready');
    assert.equal(getSealPhase({ discoveredClueIds: [], solved: true }), 'solved');
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
