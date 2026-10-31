import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BOOK_ANNOTATION, MAP_BOOK_ECHO_TEXT, LIBRARY_PORTRAIT_ECHO_TEXT } from '../../src/discoveries/libraryBookContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

const ALL_TEXTS = [BOOK_ANNOTATION, MAP_BOOK_ECHO_TEXT, LIBRARY_PORTRAIT_ECHO_TEXT];

describe('discoveries/libraryBookContent.js — integridad', () => {
  test('los tres textos existen y tienen contenido real (no vacío, no un marcador)', () => {
    for (const text of ALL_TEXTS) {
      assert.ok(typeof text === 'string' && text.length > 30);
    }
  });

  test('ninguno de los tres textos revela la respuesta canónica de ningún expediente, el Pensadero, el desenlace o un regalo', () => {
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

  // El libro y el retrato son siempre explorables, sin depender de
  // ningún expediente resuelto: por eso se comprueban como visibles
  // "desde el día 0", el mismo criterio ya usado para el contenido
  // libre de exploración en el resto del proyecto.
  test('ningún texto revela una respuesta futura, sea cual sea el momento en que se descubra', () => {
    for (const text of ALL_TEXTS) {
      assertNoFutureAnswerLeak(text, 0, { context: 'contenido del libro/retrato' });
    }
  });

  test('el eco del Mapa y el eco de la Biblioteca son textos distintos entre sí y del libro original (no se duplica contenido)', () => {
    assert.notEqual(BOOK_ANNOTATION, MAP_BOOK_ECHO_TEXT);
    assert.notEqual(BOOK_ANNOTATION, LIBRARY_PORTRAIT_ECHO_TEXT);
    assert.notEqual(MAP_BOOK_ECHO_TEXT, LIBRARY_PORTRAIT_ECHO_TEXT);
  });
});
