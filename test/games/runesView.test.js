import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRunesMarkup, createRunesPanelMarkup } from '../../src/games/runesView.js';
import { RUNES, SEQUENCE_LENGTH, TARGET_SEQUENCE } from '../../src/games/runesData.js';

const notSolved = { solved: false };
const solved = { solved: true };

describe('games/runesView.js — createRunesMarkup (hotspot)', () => {
  test('expone exactamente un hotspot', () => {
    const html = createRunesMarkup();
    assert.equal(html.includes('data-runes-hotspot'), true);
  });

  test('las posiciones del hotspot están dentro del rango 0-100', () => {
    const html = createRunesMarkup();
    const xMatches = [...html.matchAll(/--hotspot-x: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    const yMatches = [...html.matchAll(/--hotspot-y: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    for (const x of xMatches) assert.ok(x >= 0 && x <= 100);
    for (const y of yMatches) assert.ok(y >= 0 && y <= 100);
  });
});

describe('games/runesView.js — createRunesPanelMarkup (estados)', () => {
  test('modo "guessing" (por defecto): muestra la cuadrícula de cinco runas, sin revelar la secuencia', () => {
    const html = createRunesPanelMarkup(notSolved);
    const runeMatches = html.match(/data-rune-pick="[^"]+"/g) ?? [];
    assert.equal(runeMatches.length, RUNES.length);
    assert.equal(html.includes('data-runes-hide'), false);
  });

  test('modo "revealing": muestra la secuencia completa, en orden, y el botón para ocultarla', () => {
    const html = createRunesPanelMarkup(notSolved, { mode: 'revealing' });
    assert.equal(html.includes('data-runes-hide'), true);
    assert.equal(html.includes('data-rune-pick'), false);
    const indices = TARGET_SEQUENCE.map((id) => html.indexOf(RUNES.find((r) => r.id === id).label));
    for (let i = 1; i < indices.length; i++) {
      assert.ok(indices[i] > indices[i - 1], 'las runas deberían aparecer en el orden correcto de la secuencia');
    }
  });

  test('"resuelto": muestra victoria y ya no la interacción', () => {
    const html = createRunesPanelMarkup(solved);
    assert.equal(html.includes('mini-game-panel__victory'), true);
    assert.equal(html.includes('data-rune-pick'), false);
    assert.equal(html.includes('data-runes-hide'), false);
  });

  test('el rastro de intentos muestra exactamente SEQUENCE_LENGTH casillas', () => {
    const html = createRunesPanelMarkup(notSolved, { picked: ['ola'] });
    const slotMatches = html.match(/rune-picked-trail__slot/g) ?? [];
    assert.equal(slotMatches.length, SEQUENCE_LENGTH);
  });

  test('un intento incorrecto nunca revela la solución ni otorga la victoria', () => {
    const html = createRunesPanelMarkup(notSolved, {
      feedback: { type: 'incorrect', message: 'Ese no era el orden.' }
    });
    assert.equal(html.includes('mini-game-panel__feedback--incorrect'), true);
    assert.equal(html.includes('mini-game-panel__victory'), false);
  });

  test('`justSolved` activa la animación de victoria solo esa vez', () => {
    const htmlJustSolved = createRunesPanelMarkup(solved, { justSolved: true });
    const htmlReopened = createRunesPanelMarkup(solved, { justSolved: false });
    assert.equal(htmlJustSolved.includes('mini-game-panel__victory--event'), true);
    assert.equal(htmlReopened.includes('mini-game-panel__victory--event'), false);
  });

  test('es una función pura: el mismo estado produce siempre el mismo HTML', () => {
    assert.equal(createRunesPanelMarkup(notSolved), createRunesPanelMarkup(notSolved));
  });
});
