import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogMarkup, createCatalogPanelMarkup } from '../../src/games/catalogView.js';
import { CLUES, BOOKS, TARGET_BOOK_ID } from '../../src/games/catalogData.js';

const notStarted = { discoveredClueIds: [], solved: false };
const exploring = { discoveredClueIds: [CLUES[0].id], solved: false };
const ready = { discoveredClueIds: CLUES.map((c) => c.id), solved: false };
const solved = { discoveredClueIds: CLUES.map((c) => c.id), solved: true };

describe('games/catalogView.js — createCatalogMarkup (hotspots)', () => {
  test('expone exactamente tres hotspots de pista y uno de estante', () => {
    const html = createCatalogMarkup();
    const clueMatches = html.match(/data-catalog-clue="[^"]+"/g) ?? [];
    assert.equal(clueMatches.length, CLUES.length);
    assert.equal(html.includes('data-catalog-shelf'), true);
  });

  test('las posiciones de los hotspots están dentro del rango 0-100', () => {
    const html = createCatalogMarkup();
    const xMatches = [...html.matchAll(/--hotspot-x: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    const yMatches = [...html.matchAll(/--hotspot-y: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    assert.ok(xMatches.length > 0 && yMatches.length > 0);
    for (const x of xMatches) assert.ok(x >= 0 && x <= 100);
    for (const y of yMatches) assert.ok(y >= 0 && y <= 100);
  });
});

describe('games/catalogView.js — createCatalogPanelMarkup (estados de la partida)', () => {
  test('"no iniciada": sin pistas, muestra la cuadrícula de ocho libros, sin bloque de victoria', () => {
    const html = createCatalogPanelMarkup(notStarted);
    assert.equal(html.includes('mini-game-panel__victory'), false);
    assert.equal(html.includes('Todavía no has encontrado ninguna pista'), true);
    const bookMatches = html.match(/data-catalog-book="[^"]+"/g) ?? [];
    assert.equal(bookMatches.length, BOOKS.length);
  });

  test('"exploración en curso": solo las pistas ya descubiertas aparecen', () => {
    const html = createCatalogPanelMarkup(exploring);
    assert.equal(html.includes(CLUES[0].text), true);
    assert.equal(html.includes(CLUES[1].text), false);
    assert.equal(html.includes(CLUES[2].text), false);
  });

  test('"lista para elegir": las tres pistas aparecen, sin victoria todavía', () => {
    const html = createCatalogPanelMarkup(ready);
    for (const clue of CLUES) assert.equal(html.includes(clue.text), true);
    assert.equal(html.includes('mini-game-panel__victory'), false);
  });

  test('"resuelto": muestra victoria y ya no la cuadrícula de libros', () => {
    const html = createCatalogPanelMarkup(solved);
    assert.equal(html.includes('mini-game-panel__victory'), true);
    assert.equal(html.includes('data-catalog-book'), false);
  });

  test('ningún estado sin resolver marca visualmente cuál libro es el correcto', () => {
    for (const state of [notStarted, exploring, ready]) {
      const html = createCatalogPanelMarkup(state);
      assert.equal(html.includes(`data-catalog-book="${TARGET_BOOK_ID}" class`), false);
    }
  });

  test('`justSolved` activa la animación de victoria solo esa vez', () => {
    const htmlJustSolved = createCatalogPanelMarkup(solved, { justSolved: true });
    const htmlReopened = createCatalogPanelMarkup(solved, { justSolved: false });
    assert.equal(htmlJustSolved.includes('mini-game-panel__victory--event'), true);
    assert.equal(htmlReopened.includes('mini-game-panel__victory--event'), false);
  });

  test('un intento incorrecto nunca revela la solución ni otorga la victoria', () => {
    const html = createCatalogPanelMarkup(notStarted, {
      feedback: { type: 'incorrect', message: 'No. Este libro no es el que buscas.' }
    });
    assert.equal(html.includes('mini-game-panel__feedback--incorrect'), true);
    assert.equal(html.includes('mini-game-panel__victory'), false);
  });

  test('es una función pura: el mismo estado produce siempre el mismo HTML', () => {
    const htmlA = createCatalogPanelMarkup(exploring);
    const htmlB = createCatalogPanelMarkup(exploring);
    assert.equal(htmlA, htmlB);
  });
});
