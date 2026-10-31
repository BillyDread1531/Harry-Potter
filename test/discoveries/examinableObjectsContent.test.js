import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CHEST_VAGUE_TEXT, CHEST_PATTERN_AWARE_TEXT, getChestText, LAMP_REVEAL_TEXT } from '../../src/discoveries/examinableObjectsContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

const ALL_TEXTS = [CHEST_VAGUE_TEXT, CHEST_PATTERN_AWARE_TEXT, LAMP_REVEAL_TEXT];

describe('discoveries/examinableObjectsContent.js — objetos mágicos examinables', () => {
  test('los tres textos existen y tienen contenido real', () => {
    for (const text of ALL_TEXTS) {
      assert.ok(typeof text === 'string' && text.length > 30);
    }
  });

  test('las dos versiones del cofre son distintas entre sí', () => {
    assert.notEqual(CHEST_VAGUE_TEXT, CHEST_PATTERN_AWARE_TEXT);
  });

  test('getChestText devuelve la versión correcta según si se reconoció el patrón del recorrido secreto', () => {
    assert.equal(getChestText({ threeMarksRecognized: false }), CHEST_VAGUE_TEXT);
    assert.equal(getChestText({ threeMarksRecognized: true }), CHEST_PATTERN_AWARE_TEXT);
  });

  test('sin argumentos, getChestText asume que el patrón no se ha reconocido todavía', () => {
    assert.equal(getChestText(), CHEST_VAGUE_TEXT);
  });

  test('el cofre reutiliza la bandera ya existente del recorrido de la polilla, no inventa una bandera paralela', () => {
    // Esta prueba documenta la decisión de diseño: `getChestText` solo
    // necesita `threeMarksRecognized`, el mismo campo que ya usa
    // `discoveries/mothTrailContent.js` desde la fase anterior.
    const response = getChestText({ threeMarksRecognized: true, algoInventado: true });
    assert.equal(response, CHEST_PATTERN_AWARE_TEXT);
  });

  test('ningún texto revela la respuesta canónica de ningún expediente, el Pensadero, el desenlace o un regalo', () => {
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const text of ALL_TEXTS) {
        assert.equal(text.toLowerCase().includes(bareAnswer), false, `un texto menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
    for (const text of ALL_TEXTS) {
      assert.equal(text.toLowerCase().includes('pensadero'), false);
      assert.equal(text.toLowerCase().includes('regalo'), false);
    }
  });

  test('ningún texto revela una respuesta futura, sea cual sea el momento en que se examine el objeto', () => {
    for (const text of ALL_TEXTS) {
      assertNoFutureAnswerLeak(text, 0, { context: 'objetos mágicos examinables' });
    }
  });
});
