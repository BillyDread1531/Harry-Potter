import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadCollectedCardIds, saveCollectedCardIds, markCardCollected } from '../../src/collectibles/cardsStorage.js';

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

describe('collectibles/cardsStorage.js', () => {
  test('almacenamiento vacío devuelve una lista vacía', () => {
    assert.deepEqual(loadCollectedCardIds(), []);
  });

  test('JSON corrupto no revienta: devuelve lista vacía', () => {
    localStorage.setItem('hogwarts:cardsCollected', '{esto no es json');
    assert.deepEqual(loadCollectedCardIds(), []);
  });

  test('un esquema de versión futura no se interpreta ni se sobrescribe', () => {
    localStorage.setItem('hogwarts:cardsCollected', JSON.stringify({ version: 99, collectedIds: ['dumbledore'] }));
    assert.deepEqual(loadCollectedCardIds(), []);
    // Y no debería haber tocado el dato guardado:
    assert.equal(JSON.parse(localStorage.getItem('hogwarts:cardsCollected')).version, 99);
  });

  test('un id desconocido se ignora en silencio', () => {
    localStorage.setItem(
      'hogwarts:cardsCollected',
      JSON.stringify({ version: 1, collectedIds: ['dumbledore', 'no-existe', 123, null] })
    );
    assert.deepEqual(loadCollectedCardIds(), ['dumbledore']);
  });

  test('guardar y volver a cargar conserva los ids', () => {
    saveCollectedCardIds(['dumbledore', 'ravenclaw']);
    assert.deepEqual(loadCollectedCardIds().sort(), ['dumbledore', 'ravenclaw']);
  });

  test('markCardCollected añade un cromo nuevo y persiste', () => {
    markCardCollected('dumbledore');
    assert.deepEqual(loadCollectedCardIds(), ['dumbledore']);
  });

  test('marcar el mismo cromo dos veces no lo duplica', () => {
    markCardCollected('dumbledore');
    markCardCollected('dumbledore');
    assert.deepEqual(loadCollectedCardIds(), ['dumbledore']);
  });

  test('marcar un id inexistente no hace nada', () => {
    markCardCollected('no-existe');
    assert.deepEqual(loadCollectedCardIds(), []);
  });
});
