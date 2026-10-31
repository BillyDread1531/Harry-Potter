import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createSealMarkup, createSealPanelMarkup } from '../../src/games/sealView.js';
import { CLUES, SEALS, ENTRIES, SOLUTION_ASSIGNMENT } from '../../src/games/sealData.js';

const notStarted = { discoveredClueIds: [], solved: false };
const exploring = { discoveredClueIds: [CLUES[0].id], solved: false };
const ready = { discoveredClueIds: CLUES.map((c) => c.id), solved: false };
const solved = { discoveredClueIds: CLUES.map((c) => c.id), solved: true, contentsViewed: false };
const solvedAndViewed = { ...solved, contentsViewed: true };

// `SOLUTION_ASSIGNMENT` va de sello -> entrada; para comprobar qué
// sello debería aparecer seleccionado en cada entrada hace falta el
// sentido contrario (igual que `sealView.js` calcula `SOLUTION_BY_ENTRY`).
const SOLUTION_BY_ENTRY = Object.fromEntries(SEALS.map((seal) => [SOLUTION_ASSIGNMENT[seal.id], seal.id]));

describe('games/sealView.js — createSealMarkup (hotspots)', () => {
  test('expone exactamente tres hotspots de pista y uno de compartimento', () => {
    const html = createSealMarkup();
    const clueMatches = html.match(/data-seal-clue="[^"]+"/g) ?? [];
    assert.equal(clueMatches.length, CLUES.length);
    assert.equal(html.includes('data-seal-compartment'), true);
  });

  test('las posiciones de los hotspots están dentro del rango 0-100', () => {
    const html = createSealMarkup();
    const xMatches = [...html.matchAll(/--hotspot-x: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    const yMatches = [...html.matchAll(/--hotspot-y: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    for (const x of xMatches) assert.ok(x >= 0 && x <= 100);
    for (const y of yMatches) assert.ok(y >= 0 && y <= 100);
  });
});

describe('games/sealView.js — createSealPanelMarkup (estados de la partida)', () => {
  test('"no iniciada": sin pistas, muestra los tres mandos editables, sin victoria', () => {
    const html = createSealPanelMarkup(notStarted);
    assert.equal(html.includes('mini-game-panel__victory'), false);
    assert.equal(html.includes('Todavía no has encontrado ninguna pista'), true);
    const dialMatches = html.match(/data-seal-entry="[^"]+"/g) ?? [];
    assert.equal(dialMatches.length, ENTRIES.length);
  });

  test('"exploración en curso": solo las pistas ya descubiertas aparecen', () => {
    const html = createSealPanelMarkup(exploring);
    assert.equal(html.includes(CLUES[0].text), true);
    assert.equal(html.includes(CLUES[1].text), false);
    assert.equal(html.includes(CLUES[2].text), false);
  });

  test('"lista para intentarlo": las tres pistas aparecen, sin victoria todavía', () => {
    const html = createSealPanelMarkup(ready);
    for (const clue of CLUES) assert.equal(html.includes(clue.text), true);
    assert.equal(html.includes('mini-game-panel__victory'), false);
  });

  test('"resuelto": muestra victoria y ya no el formulario editable', () => {
    const html = createSealPanelMarkup(solved);
    assert.equal(html.includes('mini-game-panel__victory'), true);
    assert.equal(html.includes('data-seal-form'), false);
    assert.equal(html.includes('data-seal-submit'), false);
  });

  test('resuelto pero sin ver el contenido: ofrece "Mirar dentro", sin revelarlo todavía; una vez visto, lo muestra', () => {
    const htmlUnseen = createSealPanelMarkup(solved);
    assert.equal(htmlUnseen.includes('data-seal-look-inside'), true);
    assert.equal(htmlUnseen.includes('retrato diminuto'), false);

    const htmlSeen = createSealPanelMarkup(solvedAndViewed);
    assert.equal(htmlSeen.includes('data-seal-look-inside'), false);
    assert.equal(htmlSeen.includes('retrato diminuto'), true);
  });

  test('el estado resuelto muestra la asignación solución marcada como seleccionada', () => {
    const html = createSealPanelMarkup(solved);
    for (const entry of ENTRIES) {
      assert.ok(html.includes(`value="${SOLUTION_BY_ENTRY[entry.id]}" selected`));
    }
  });

  test('un intento incorrecto nunca revela la solución ni otorga la victoria', () => {
    const html = createSealPanelMarkup(notStarted, {
      feedback: { type: 'incorrect', message: 'Ninguno de los tres encaja todavía.' }
    });
    assert.equal(html.includes('mini-game-panel__feedback--incorrect'), true);
    assert.equal(html.includes('mini-game-panel__victory'), false);
  });

  test('`justSolved` activa la animación de victoria solo esa vez', () => {
    const htmlJustSolved = createSealPanelMarkup(solved, { justSolved: true });
    const htmlReopened = createSealPanelMarkup(solved, { justSolved: false });
    assert.equal(htmlJustSolved.includes('mini-game-panel__victory--event'), true);
    assert.equal(htmlReopened.includes('mini-game-panel__victory--event'), false);
  });

  test('es una función pura: el mismo estado produce siempre el mismo HTML', () => {
    assert.equal(createSealPanelMarkup(exploring), createSealPanelMarkup(exploring));
  });
});
