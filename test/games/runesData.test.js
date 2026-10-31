import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { RUNES, SEQUENCE_LENGTH, TARGET_SEQUENCE, isSequenceCorrect, getRuneById, VICTORY_TEXT } from '../../src/games/runesData.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';

describe('games/runesData.js — las runas', () => {
  test('hay cinco runas, con ids únicos', () => {
    assert.equal(RUNES.length, 5);
    assert.equal(new Set(RUNES.map((rune) => rune.id)).size, 5);
  });

  test('la secuencia objetivo tiene la longitud esperada, con runas distintas y reales', () => {
    assert.equal(TARGET_SEQUENCE.length, SEQUENCE_LENGTH);
    assert.equal(new Set(TARGET_SEQUENCE).size, SEQUENCE_LENGTH);
    for (const id of TARGET_SEQUENCE) assert.ok(getRuneById(id), `"${id}" no es una runa real`);
  });

  test('isSequenceCorrect acepta únicamente la secuencia objetivo exacta', () => {
    assert.equal(isSequenceCorrect(TARGET_SEQUENCE), true);
    assert.equal(isSequenceCorrect([...TARGET_SEQUENCE].reverse()), false);
    assert.equal(isSequenceCorrect(TARGET_SEQUENCE.slice(0, 3)), false);
    assert.equal(isSequenceCorrect([...TARGET_SEQUENCE, 'estrella']), false);
    assert.equal(isSequenceCorrect(null), false);
    assert.equal(isSequenceCorrect(undefined), false);
  });

  test('getRuneById encuentra cada runa real y devuelve null para una desconocida', () => {
    for (const rune of RUNES) assert.equal(getRuneById(rune.id), rune);
    assert.equal(getRuneById('no-existe'), null);
  });

  test('el texto de victoria no revela una respuesta canónica, el Pensadero, el desenlace o un regalo', () => {
    const text = VICTORY_TEXT.toLowerCase();
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      assert.equal(text.includes(bareAnswer), false, `el texto de victoria menciona "${bareAnswer}" (día ${riddle.day})`);
    }
    assert.equal(text.includes('pensadero'), false);
    assert.equal(text.includes('regalo'), false);
  });
});
