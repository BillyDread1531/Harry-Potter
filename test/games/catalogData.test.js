import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BOOKS, CLUES, TARGET_BOOK_ID, isCorrectBook, getBookById, getCatalogPhase } from '../../src/games/catalogData.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';

describe('games/catalogData.js — el catálogo imposible', () => {
  test('hay exactamente ocho libros, cada uno con id único', () => {
    assert.equal(BOOKS.length, 8);
    assert.equal(new Set(BOOKS.map((book) => book.id)).size, 8);
  });

  test('el libro objetivo existe de verdad entre los ocho', () => {
    assert.ok(getBookById(TARGET_BOOK_ID));
  });

  test('exactamente un libro cumple las tres pistas a la vez (prueba exhaustiva de las ocho)', () => {
    const matching = BOOKS.filter((book) => CLUES.every((clue) => clue.constraint(book)));
    assert.deepEqual(
      matching.map((book) => book.id),
      [TARGET_BOOK_ID]
    );
  });

  test('ninguna pista sobra: quitando cualquiera de las tres, quedan dos libros posibles, nunca uno', () => {
    for (const omitted of CLUES) {
      const remainingClues = CLUES.filter((clue) => clue.id !== omitted.id);
      const matching = BOOKS.filter((book) => remainingClues.every((clue) => clue.constraint(book)));
      assert.equal(matching.length, 2, `sin la pista "${omitted.id}" deberían quedar 2 candidatos, no ${matching.length}`);
      assert.ok(matching.some((book) => book.id === TARGET_BOOK_ID));
    }
  });

  test('isCorrectBook solo acepta el libro objetivo', () => {
    assert.equal(isCorrectBook(TARGET_BOOK_ID), true);
    for (const book of BOOKS) {
      if (book.id === TARGET_BOOK_ID) continue;
      assert.equal(isCorrectBook(book.id), false, `${book.id} no debería ser aceptado`);
    }
  });

  test('getCatalogPhase refleja el progreso real', () => {
    assert.equal(getCatalogPhase({ discoveredClueIds: [], solved: false }), 'not-started');
    assert.equal(getCatalogPhase({ discoveredClueIds: ['material'], solved: false }), 'exploring');
    assert.equal(getCatalogPhase({ discoveredClueIds: ['material', 'color', 'posicion'], solved: false }), 'ready');
    assert.equal(getCatalogPhase({ discoveredClueIds: [], solved: true }), 'solved');
  });

  test('ninguna pista ni el texto de victoria revela una respuesta canónica, el Pensadero, el desenlace o un regalo', () => {
    const texts = CLUES.map((clue) => clue.text);
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const text of texts) {
        assert.equal(text.toLowerCase().includes(bareAnswer), false, `una pista menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
    for (const text of texts) {
      assert.equal(text.toLowerCase().includes('pensadero'), false);
      assert.equal(text.toLowerCase().includes('regalo'), false);
    }
  });
});
