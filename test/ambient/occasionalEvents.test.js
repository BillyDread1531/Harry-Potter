import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { pickRandomEffect } from '../../src/ambient/occasionalEvents.js';

describe('ambient/occasionalEvents.js — pickRandomEffect', () => {
  test('sin efectos, devuelve null en vez de reventar', () => {
    assert.equal(pickRandomEffect([]), null);
    assert.equal(pickRandomEffect(undefined), null);
  });

  test('con random()=0, elige siempre el primer efecto', () => {
    const effects = ['a', 'b', 'c'];
    assert.equal(pickRandomEffect(effects, () => 0), 'a');
  });

  test('con random() cercano a 1, elige el último efecto (nunca se sale del arreglo)', () => {
    const effects = ['a', 'b', 'c'];
    assert.equal(pickRandomEffect(effects, () => 0.9999), 'c');
    assert.equal(pickRandomEffect(effects, () => 1), 'c'); // defensivo, aunque Math.random() nunca da 1
  });

  test('con random()=0.5 sobre 4 efectos, elige el tercero (índice 2)', () => {
    const effects = ['a', 'b', 'c', 'd'];
    assert.equal(pickRandomEffect(effects, () => 0.5), 'c');
  });

  test('con un solo efecto, siempre lo elige a él, sin importar random()', () => {
    assert.equal(pickRandomEffect(['único'], () => 0), 'único');
    assert.equal(pickRandomEffect(['único'], () => 0.9999), 'único');
  });
});
