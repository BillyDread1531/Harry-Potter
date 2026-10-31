import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CASTLE_COLLECTIBLE } from '../../src/discoveries/castleCollectible.js';
import { SECRETS } from '../../src/calendar/secretsData.js';
import { CARDS } from '../../src/collectibles/cardsData.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

describe('discoveries/castleCollectible.js — integridad e identidad propia', () => {
  test('tiene la forma esperada por `discoveryListView` ({ id, label, body }), con contenido real', () => {
    assert.ok(typeof CASTLE_COLLECTIBLE.id === 'string' && CASTLE_COLLECTIBLE.id.length > 0);
    assert.ok(CASTLE_COLLECTIBLE.label.length > 0);
    assert.ok(CASTLE_COLLECTIBLE.body.length > 30);
  });

  test('su id no coincide con ninguno de los seis hallazgos canónicos ni con ningún cromo existente', () => {
    const secretIds = new Set(SECRETS.map((s) => s.id));
    const cardIds = new Set(CARDS.map((c) => c.id));
    assert.equal(secretIds.has(CASTLE_COLLECTIBLE.id), false);
    assert.equal(cardIds.has(CASTLE_COLLECTIBLE.id), false);
  });

  test('su etiqueta y cuerpo no duplican literalmente el texto de ningún hallazgo canónico ni de ningún cromo', () => {
    for (const secret of SECRETS) {
      assert.notEqual(CASTLE_COLLECTIBLE.body, secret.body);
      assert.notEqual(CASTLE_COLLECTIBLE.label, secret.label);
    }
    for (const card of CARDS) {
      assert.notEqual(CASTLE_COLLECTIBLE.body, card.blurb);
    }
  });

  test('no revela la respuesta canónica de ningún expediente, el Pensadero, el desenlace o un regalo', () => {
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      assert.equal(CASTLE_COLLECTIBLE.body.toLowerCase().includes(bareAnswer), false, `menciona "${bareAnswer}" (día ${riddle.day})`);
    }
    assert.equal(CASTLE_COLLECTIBLE.body.toLowerCase().includes('pensadero'), false);
    assert.equal(CASTLE_COLLECTIBLE.body.toLowerCase().includes('regalo'), false);
  });

  // Siempre explorable, sin depender de ningún expediente resuelto.
  test('no revela una respuesta futura, sea cual sea el momento en que se encuentre', () => {
    assertNoFutureAnswerLeak(CASTLE_COLLECTIBLE.body, 0, { context: 'hallazgo coleccionable del Mapa' });
  });
});
