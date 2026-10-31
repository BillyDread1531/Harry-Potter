import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadRunesState, markRunesSolved } from '../../src/games/runesStorage.js';

let originalLocalStorage;
let store;

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
    clear: () => data.clear()
  };
}

beforeEach(() => {
  originalLocalStorage = globalThis.localStorage;
  store = createMemoryStorage();
  globalThis.localStorage = store;
});

afterEach(() => {
  globalThis.localStorage = originalLocalStorage;
});

describe('games/runesStorage.js', () => {
  test('almacenamiento vacío devuelve el estado inicial', () => {
    assert.deepEqual(loadRunesState(), { solved: false });
  });

  test('usa su propia clave de localStorage', () => {
    const keysUsed = [];
    const originalSetItem = store.setItem.bind(store);
    store.setItem = (key, value) => {
      keysUsed.push(key);
      originalSetItem(key, value);
    };
    markRunesSolved();
    assert.ok(keysUsed.every((key) => key === 'hogwarts:runes'));
    assert.equal(store.getItem('hogwarts:seal'), null);
  });

  test('markRunesSolved marca resuelto, es idempotente, y persiste', () => {
    const first = markRunesSolved();
    assert.equal(first.solved, true);
    assert.equal(markRunesSolved().solved, true);
    assert.equal(loadRunesState().solved, true);
  });

  test('JSON corrupto o versión futura no rompen la carga', () => {
    store.setItem('hogwarts:runes', '{ no es JSON');
    assert.deepEqual(loadRunesState(), { solved: false });

    const futureSchemaRaw = JSON.stringify({ version: 999 });
    store.setItem('hogwarts:runes', futureSchemaRaw);
    assert.deepEqual(loadRunesState(), { solved: false });
    assert.equal(store.getItem('hogwarts:runes'), futureSchemaRaw);
  });

  test('un tipo inválido para `solved` se sanea a false', () => {
    store.setItem('hogwarts:runes', JSON.stringify({ version: 1, state: { solved: 'si' } }));
    assert.deepEqual(loadRunesState(), { solved: false });
  });

  test('localStorage inaccesible no rompe la carga ni el guardado', () => {
    globalThis.localStorage = {
      getItem() {
        throw new Error('bloqueado');
      },
      setItem() {
        throw new Error('bloqueado');
      }
    };
    assert.deepEqual(loadRunesState(), { solved: false });
    assert.doesNotThrow(() => markRunesSolved());
  });
});
