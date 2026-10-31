import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createLetterBodyMarkup, createInstructionsBodyMarkup } from '../../src/letter/letterView.js';
import { LETTER_PARAGRAPHS, INSTRUCTIONS_ITEMS } from '../../src/letter/letterContent.js';

describe('letter/letterView.js — createLetterBodyMarkup', () => {
  test('incluye el saludo y los ocho párrafos de la carta', () => {
    const html = createLetterBodyMarkup();
    assert.ok(html.includes('Querida Andrea'));
    for (const paragraph of LETTER_PARAGRAPHS) {
      assert.ok(html.includes(paragraph), `falta el párrafo: "${paragraph.slice(0, 30)}..."`);
    }
  });

  test('incluye el botón para terminar de leer, con el gancho que usa la escena', () => {
    const html = createLetterBodyMarkup();
    assert.ok(html.includes('data-letter-finish'));
  });
});

describe('letter/letterView.js — createInstructionsBodyMarkup', () => {
  test('incluye los siete puntos de las instrucciones, con su título y su texto', () => {
    const html = createInstructionsBodyMarkup();
    assert.equal(INSTRUCTIONS_ITEMS.length, 7);
    for (const item of INSTRUCTIONS_ITEMS) {
      assert.ok(html.includes(item.title), `falta el título: "${item.title}"`);
      assert.ok(html.includes(item.body), `falta el cuerpo de: "${item.title}"`);
    }
  });
});
