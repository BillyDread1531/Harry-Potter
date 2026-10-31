import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MOTH_WING_DETAIL_TEXT,
  ARCHIVE_MARKS_VAGUE_TEXT,
  ARCHIVE_MARKS_RECOGNIZED_TEXT,
  MAP_PATTERN_VAGUE_TEXT,
  MAP_PATTERN_COMPLETE_TEXT
} from '../../src/discoveries/mothTrailContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

const ALL_TEXTS = [
  MOTH_WING_DETAIL_TEXT,
  ARCHIVE_MARKS_VAGUE_TEXT,
  ARCHIVE_MARKS_RECOGNIZED_TEXT,
  MAP_PATTERN_VAGUE_TEXT,
  MAP_PATTERN_COMPLETE_TEXT
];

describe('discoveries/mothTrailContent.js — el recorrido secreto de la polilla', () => {
  test('los cinco textos existen y tienen contenido real', () => {
    for (const text of ALL_TEXTS) {
      assert.ok(typeof text === 'string' && text.length > 30);
    }
  });

  test('las dos versiones del Archivo son distintas entre sí (vaga vs. reconocida)', () => {
    assert.notEqual(ARCHIVE_MARKS_VAGUE_TEXT, ARCHIVE_MARKS_RECOGNIZED_TEXT);
  });

  test('las dos versiones del Mapa son distintas entre sí (vaga vs. completa)', () => {
    assert.notEqual(MAP_PATTERN_VAGUE_TEXT, MAP_PATTERN_COMPLETE_TEXT);
  });

  test('el texto completo del Mapa reconoce ambas paradas anteriores (une el libro y las marcas)', () => {
    const lower = MAP_PATTERN_COMPLETE_TEXT.toLowerCase();
    assert.ok(lower.includes('libro'));
    assert.ok(lower.includes('marca'));
  });

  test('ninguno de los cinco textos revela la respuesta canónica de ningún expediente, el Pensadero, el desenlace o un regalo', () => {
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const text of ALL_TEXTS) {
        assert.equal(text.toLowerCase().includes(bareAnswer), false, `un texto del recorrido menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
    for (const text of ALL_TEXTS) {
      assert.equal(text.toLowerCase().includes('pensadero'), false);
      assert.equal(text.toLowerCase().includes('regalo'), false);
    }
  });

  // Las tres paradas son siempre explorables, sin depender de ningún
  // expediente resuelto (ni de los días, ni de la cerradura de la
  // polilla): se verifican como visibles "desde el día 0".
  test('ningún texto del recorrido revela una respuesta futura, sea cual sea el momento en que se descubra', () => {
    for (const text of ALL_TEXTS) {
      assertNoFutureAnswerLeak(text, 0, { context: 'recorrido secreto de la polilla' });
    }
  });
});
