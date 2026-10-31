import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, getCardById } from '../../src/collectibles/cardsData.js';
import { isValidDay } from '../../src/calendar/calendarEngine.js';
import { isReachable } from '../../src/data/sections.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

describe('collectibles/cardsData.js — integridad de los cromos', () => {
  test('hay exactamente seis cromos, con ids únicos', () => {
    assert.equal(CARDS.length, 6);
    const ids = CARDS.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('cada cromo tiene nombre y texto reales, y pertenece a una escena alcanzable', () => {
    for (const card of CARDS) {
      assert.ok(card.name?.length > 0, `cromo ${card.id}: nombre`);
      assert.ok(card.blurb?.length > 40, `cromo ${card.id}: blurb vacío o demasiado corto`);
      assert.equal(isReachable(card.scene), true, `cromo ${card.id}: escena "${card.scene}" no alcanzable`);
    }
  });

  test('`unlockAfterDay` es null o un día válido del calendario', () => {
    for (const card of CARDS) {
      assert.ok(card.unlockAfterDay === null || isValidDay(card.unlockAfterDay), `cromo ${card.id}: unlockAfterDay inválido`);
    }
  });

  test('cada escena tiene como máximo un cromo (no se amontonan en una sola)', () => {
    const scenes = CARDS.map((c) => c.scene);
    assert.equal(new Set(scenes).size, scenes.length);
  });

  test('getCardById encuentra un cromo existente y devuelve null si no existe', () => {
    assert.equal(getCardById('dumbledore')?.scene, 'vestibulo');
    assert.equal(getCardById('no-existe'), null);
  });

  test('ningún cromo revela la respuesta canónica de ningún expediente, ni el cumpleaños, ni el Pensadero', () => {
    const texts = CARDS.flatMap((c) => [c.name, c.blurb]).map((t) => t.toLowerCase());
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const text of texts) {
        assert.equal(text.includes(bareAnswer), false, `un cromo menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
    for (const text of texts) {
      assert.equal(text.includes('cumplea'), false);
      assert.equal(text.includes('pensadero'), false);
    }
  });

  // Más preciso que la prueba de arriba: un cromo con `unlockAfterDay:
  // null` es explorable desde el principio (nada es "pasado" todavía),
  // y uno con un día concreto es visible justo al resolverlo.
  // Excepción documentada: el nombre de la colección ("Cromos de Rana
  // de Chocolate", en `cardsView.createCollectedCardsListMarkup`) no
  // vive en este archivo, así que no aplica aquí — esta prueba revisa
  // `name`/`blurb` de cada cromo, no el encabezado de la colección.
  test('ningún cromo revela una respuesta futura ANTES de que ese cromo sea visible', () => {
    for (const card of CARDS) {
      const visibleAfterDay = card.unlockAfterDay ?? 0;
      assertNoFutureAnswerLeak(card.name, visibleAfterDay, { context: `nombre del cromo "${card.id}"` });
      assertNoFutureAnswerLeak(card.blurb, visibleAfterDay, { context: `blurb del cromo "${card.id}"` });
    }
  });
});
