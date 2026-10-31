import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getCurrentAct } from '../../src/calendar/actProgress.js';

describe('calendar/actProgress.js — getCurrentAct', () => {
  test('sin nada resuelto, el acto es 0', () => {
    assert.equal(getCurrentAct(new Set()), 0);
    assert.equal(getCurrentAct(undefined), 0);
    assert.equal(getCurrentAct(null), 0);
  });

  test('días 1-4 resueltos corresponden al acto 1', () => {
    assert.equal(getCurrentAct(new Set([1])), 1);
    assert.equal(getCurrentAct(new Set([3])), 1);
    assert.equal(getCurrentAct(new Set([1, 2, 4])), 1);
  });

  test('días 5-8 resueltos corresponden al acto 2 (según el día más alto)', () => {
    assert.equal(getCurrentAct(new Set([5])), 2);
    assert.equal(getCurrentAct(new Set([1, 7])), 2);
    assert.equal(getCurrentAct(new Set([8])), 2);
  });

  test('días 9-12 resueltos corresponden al acto 3', () => {
    assert.equal(getCurrentAct(new Set([9])), 3);
    assert.equal(getCurrentAct(new Set([1, 5, 12])), 3);
  });

  test('días 13-15 resueltos corresponden al acto 4', () => {
    assert.equal(getCurrentAct(new Set([13])), 4);
    assert.equal(getCurrentAct(new Set([15])), 4);
    assert.equal(getCurrentAct(new Set([1, 2, 3, 4, 5, 15])), 4);
  });

  test('los límites exactos (4, 8, 12) quedan en el acto correspondiente, no en el siguiente', () => {
    assert.equal(getCurrentAct(new Set([4])), 1);
    assert.equal(getCurrentAct(new Set([8])), 2);
    assert.equal(getCurrentAct(new Set([12])), 3);
  });
});
