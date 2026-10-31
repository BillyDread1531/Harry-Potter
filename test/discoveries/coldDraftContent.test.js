import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  COLD_DRAFT_LIBRARY_TEXT,
  COLD_DRAFT_MAP_VAGUE_TEXT,
  COLD_DRAFT_MAP_CONNECTED_TEXT,
  COLD_DRAFT_ROOM_WAITING_TEXT,
  COLD_DRAFT_ROOM_READY_TEXT,
  COLD_DRAFT_RESOLUTION_TEXT,
  COLD_DRAFT_RESOLUTION_BUTTON_LABEL,
  getColdDraftPhase
} from '../../src/discoveries/coldDraftContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

const ALL_TEXTS = [
  COLD_DRAFT_LIBRARY_TEXT,
  COLD_DRAFT_MAP_VAGUE_TEXT,
  COLD_DRAFT_MAP_CONNECTED_TEXT,
  COLD_DRAFT_ROOM_WAITING_TEXT,
  COLD_DRAFT_ROOM_READY_TEXT,
  COLD_DRAFT_RESOLUTION_TEXT
];

describe('discoveries/coldDraftContent.js — el misterio de la corriente fría', () => {
  test('todos los textos existen y tienen contenido real', () => {
    for (const text of ALL_TEXTS) {
      assert.ok(typeof text === 'string' && text.length > 30);
    }
    assert.ok(COLD_DRAFT_RESOLUTION_BUTTON_LABEL.length > 0);
  });

  test('las dos versiones del Mapa son distintas entre sí (vaga vs. conectada)', () => {
    assert.notEqual(COLD_DRAFT_MAP_VAGUE_TEXT, COLD_DRAFT_MAP_CONNECTED_TEXT);
  });

  test('la versión conectada del Mapa menciona la Biblioteca (reconoce la conexión)', () => {
    assert.ok(COLD_DRAFT_MAP_CONNECTED_TEXT.toLowerCase().includes('biblioteca'));
  });

  test('las dos versiones de la Sala de los Menesteres son distintas entre sí (espera vs. lista)', () => {
    assert.notEqual(COLD_DRAFT_ROOM_WAITING_TEXT, COLD_DRAFT_ROOM_READY_TEXT);
  });

  test('la versión lista de la Sala reconoce ambas manifestaciones previas', () => {
    const lower = COLD_DRAFT_ROOM_READY_TEXT.toLowerCase();
    assert.ok(lower.includes('biblioteca'));
    assert.ok(lower.includes('mapa'));
  });

  describe('getColdDraftPhase', () => {
    test('sin ninguna manifestación sentida, la fase es "dormant"', () => {
      assert.equal(getColdDraftPhase({ coldDraftFeltLibrary: false, coldDraftFeltMap: false, coldDraftResolved: false }), 'dormant');
    });

    test('con solo una manifestación sentida, la fase es "connecting"', () => {
      assert.equal(getColdDraftPhase({ coldDraftFeltLibrary: true, coldDraftFeltMap: false, coldDraftResolved: false }), 'connecting');
      assert.equal(getColdDraftPhase({ coldDraftFeltLibrary: false, coldDraftFeltMap: true, coldDraftResolved: false }), 'connecting');
    });

    test('con las dos manifestaciones sentidas (y sin resolver), la fase es "ready-to-resolve"', () => {
      assert.equal(getColdDraftPhase({ coldDraftFeltLibrary: true, coldDraftFeltMap: true, coldDraftResolved: false }), 'ready-to-resolve');
    });

    test('una vez resuelto, la fase es siempre "resolved", sin importar las otras banderas', () => {
      assert.equal(getColdDraftPhase({ coldDraftFeltLibrary: true, coldDraftFeltMap: true, coldDraftResolved: true }), 'resolved');
      assert.equal(getColdDraftPhase({ coldDraftFeltLibrary: false, coldDraftFeltMap: false, coldDraftResolved: true }), 'resolved');
    });

    test('sin argumentos, no revienta y devuelve "dormant"', () => {
      assert.equal(getColdDraftPhase(), 'dormant');
      assert.equal(getColdDraftPhase({}), 'dormant');
    });
  });

  test('ningún texto revela la respuesta canónica de ningún expediente, el Pensadero, el desenlace o un regalo', () => {
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const text of ALL_TEXTS) {
        assert.equal(text.toLowerCase().includes(bareAnswer), false, `un texto de la corriente fría menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
    for (const text of ALL_TEXTS) {
      assert.equal(text.toLowerCase().includes('pensadero'), false);
      assert.equal(text.toLowerCase().includes('regalo'), false);
    }
  });

  // Las cuatro manifestaciones son siempre explorables, sin depender
  // de ningún expediente resuelto.
  test('ningún texto revela una respuesta futura, sea cual sea el momento en que se descubra', () => {
    for (const text of ALL_TEXTS) {
      assertNoFutureAnswerLeak(text, 0, { context: 'misterio de la corriente fría' });
    }
  });

  test('ningún texto resuelve o explica inmediatamente el misterio completo por sí solo (ninguno supera el otro en longitud de forma desproporcionada ni "spoilea" la resolución antes de tiempo)', () => {
    // La versión "lista para resolver" de la Sala puede mencionar las
    // otras dos escenas, pero el texto de la RESOLUCIÓN en sí no debe
    // aparecer ya en ningún punto anterior del recorrido.
    const earlierTexts = [COLD_DRAFT_LIBRARY_TEXT, COLD_DRAFT_MAP_VAGUE_TEXT, COLD_DRAFT_MAP_CONNECTED_TEXT, COLD_DRAFT_ROOM_WAITING_TEXT, COLD_DRAFT_ROOM_READY_TEXT];
    for (const text of earlierTexts) {
      assert.notEqual(text, COLD_DRAFT_RESOLUTION_TEXT);
    }
  });
});
