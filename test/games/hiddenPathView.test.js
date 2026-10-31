import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHiddenPathMarkup } from '../../src/games/hiddenPathView.js';
import { CLUES, MARKS, SOLUTION_SEQUENCE } from '../../src/games/hiddenPathData.js';

describe('games/hiddenPathView.js — createHiddenPathMarkup', () => {
  test('expone exactamente tres hotspots de pista y cuatro marcas', () => {
    const html = createHiddenPathMarkup();
    const clueMatches = html.match(/data-hidden-path-clue="[^"]+"/g) ?? [];
    const markMatches = html.match(/data-hidden-path-mark="[^"]+"/g) ?? [];
    assert.equal(clueMatches.length, CLUES.length);
    assert.equal(markMatches.length, MARKS.length);
  });

  test('cada marca de MARKS aparece exactamente una vez, con su propio id', () => {
    const html = createHiddenPathMarkup();
    for (const mark of MARKS) {
      const occurrences = html.match(new RegExp(`data-hidden-path-mark="${mark.id}"`, 'g')) ?? [];
      assert.equal(occurrences.length, 1, `la marca "${mark.id}" debería aparecer una sola vez`);
    }
  });

  test('el marcado nunca menciona la secuencia solución completa, en orden, como texto visible', () => {
    const html = createHiddenPathMarkup();
    const solutionLabels = SOLUTION_SEQUENCE.map((id) => MARKS.find((m) => m.id === id).label).join(' ');
    assert.equal(html.includes(solutionLabels), false);
  });

  test('las posiciones de los hotspots están dentro del rango 0-100', () => {
    const html = createHiddenPathMarkup();
    const xMatches = [...html.matchAll(/--hotspot-x: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    const yMatches = [...html.matchAll(/--hotspot-y: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    assert.ok(xMatches.length > 0 && yMatches.length > 0);
    for (const x of xMatches) assert.ok(x >= 0 && x <= 100);
    for (const y of yMatches) assert.ok(y >= 0 && y <= 100);
  });

  test('es una función pura: siempre produce el mismo HTML', () => {
    assert.equal(createHiddenPathMarkup(), createHiddenPathMarkup());
  });
});
