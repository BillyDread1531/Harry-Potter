import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createCardRevealText, createCollectedCardsListMarkup } from '../../src/collectibles/cardsView.js';
import { getCardById } from '../../src/collectibles/cardsData.js';

describe('collectibles/cardsView.js', () => {
  test('createCardRevealText incluye el nombre y el texto del cromo', () => {
    const card = getCardById('dumbledore');
    const text = createCardRevealText(card);
    assert.ok(text.includes(card.name.toUpperCase()));
    assert.ok(text.includes(card.blurb));
  });

  test('createCollectedCardsListMarkup sin cromos no genera marcado', () => {
    assert.equal(createCollectedCardsListMarkup([]), '');
    assert.equal(createCollectedCardsListMarkup(undefined), '');
  });

  test('createCollectedCardsListMarkup muestra cada cromo con su nombre y su texto', () => {
    const card = getCardById('ravenclaw');
    const html = createCollectedCardsListMarkup([card]);
    assert.ok(html.includes(card.name));
    assert.ok(html.includes(card.blurb));
    assert.ok(html.includes('Cromos de Rana de Chocolate'));
  });

  test('createCollectedCardsListMarkup escapa contenido con caracteres especiales', () => {
    const fakeCard = { id: 'x', name: 'Un "nombre" & <raro>', blurb: 'Un blurb & <peligroso>' };
    const html = createCollectedCardsListMarkup([fakeCard]);
    assert.equal(html.includes('<raro>'), false);
    assert.ok(html.includes('&lt;raro&gt;'));
  });
});
