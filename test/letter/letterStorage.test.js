import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isLetterRead, markLetterRead } from '../../src/letter/letterStorage.js';

let originalLocalStorage;

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
}

beforeEach(() => {
  originalLocalStorage = globalThis.localStorage;
  globalThis.localStorage = createMemoryStorage();
});

afterEach(() => {
  globalThis.localStorage = originalLocalStorage;
});

describe('letter/letterStorage.js', () => {
  test('almacenamiento vacío: la carta cuenta como no leída', () => {
    assert.equal(isLetterRead(), false);
  });

  test('JSON corrupto no revienta: cuenta como no leída', () => {
    localStorage.setItem('hogwarts:welcomeLetter', '{esto no es json');
    assert.equal(isLetterRead(), false);
  });

  test('un esquema de versión futura no se interpreta ni se sobrescribe', () => {
    localStorage.setItem('hogwarts:welcomeLetter', JSON.stringify({ version: 99, read: true }));
    assert.equal(isLetterRead(), false);
    assert.equal(JSON.parse(localStorage.getItem('hogwarts:welcomeLetter')).version, 99);
  });

  test('markLetterRead marca la carta como leída, y persiste', () => {
    assert.equal(isLetterRead(), false);
    markLetterRead();
    assert.equal(isLetterRead(), true);
  });

  test('marcar la carta como leída varias veces no cambia el resultado', () => {
    markLetterRead();
    markLetterRead();
    assert.equal(isLetterRead(), true);
  });

  test('la clave de la carta es independiente de la de los expedientes y la de los cromos', () => {
    markLetterRead();
    assert.equal(localStorage.getItem('hogwarts:calendarProgress'), null);
    assert.equal(localStorage.getItem('hogwarts:cardsCollected'), null);
  });
});
