import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS } from '../../src/collectibles/cardsData.js';
import { isCardUnlocked, getUnlockedCards, getCollectedCards } from '../../src/collectibles/cardsProgress.js';

describe('collectibles/cardsProgress.js — isCardUnlocked / getUnlockedCards', () => {
  test('un cromo sin unlockAfterDay siempre está desbloqueado', () => {
    const free = CARDS.find((c) => c.unlockAfterDay === null);
    assert.equal(isCardUnlocked(free, new Set()), true);
  });

  test('un cromo con unlockAfterDay solo se desbloquea tras ese día', () => {
    const gated = CARDS.find((c) => c.unlockAfterDay !== null);
    assert.equal(isCardUnlocked(gated, new Set()), false);
    assert.equal(isCardUnlocked(gated, new Set([gated.unlockAfterDay])), true);
  });

  test('sin progreso, getUnlockedCards solo devuelve los de exploración libre', () => {
    const unlocked = getUnlockedCards(new Set());
    assert.ok(unlocked.every((c) => c.unlockAfterDay === null));
    assert.ok(unlocked.length > 0);
  });

  test('con todos los días resueltos, los seis cromos están desbloqueados', () => {
    const allDays = new Set(Array.from({ length: 15 }, (_, i) => i + 1));
    assert.equal(getUnlockedCards(allDays).length, CARDS.length);
  });

  test('un cromo nunca se desbloquea antes de su día, aunque se resuelvan otros', () => {
    const gated = CARDS.find((c) => c.unlockAfterDay === 13);
    const otherDays = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15]);
    assert.equal(isCardUnlocked(gated, otherDays), false);
  });
});

describe('collectibles/cardsProgress.js — getCollectedCards', () => {
  test('sin nada encontrado, devuelve una lista vacía', () => {
    assert.deepEqual(getCollectedCards([]), []);
  });

  test('devuelve los cromos encontrados en el orden fijo de CARDS, no el de descubrimiento', () => {
    const lastId = CARDS[CARDS.length - 1].id;
    const firstId = CARDS[0].id;
    const result = getCollectedCards([lastId, firstId]); // encontrados en orden inverso
    assert.deepEqual(
      result.map((c) => c.id),
      [firstId, lastId]
    );
  });

  test('un id desconocido en la lista de encontrados no revienta ni aparece', () => {
    assert.deepEqual(getCollectedCards(['no-existe']), []);
  });
});
