import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalogState, markCatalogClueDiscovered, markCatalogSolved } from '../../src/games/catalogStorage.js';
import { CLUES } from '../../src/games/catalogData.js';

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

describe('games/catalogStorage.js', () => {
  test('almacenamiento vacío devuelve el estado inicial (no iniciada)', () => {
    assert.deepEqual(loadCatalogState(), { discoveredClueIds: [], solved: false });
  });

  test('usa su propia clave de localStorage, distinta de la del calendario y la de la cerradura de la polilla', () => {
    markCatalogClueDiscovered(CLUES[0].id);
    const keysUsed = [];
    const originalSetItem = store.setItem.bind(store);
    store.setItem = (key, value) => {
      keysUsed.push(key);
      originalSetItem(key, value);
    };
    markCatalogSolved();
    assert.ok(keysUsed.every((key) => key === 'hogwarts:catalog'));
    assert.equal(store.getItem('hogwarts:calendarProgress'), null);
    assert.equal(store.getItem('hogwarts:mothLock'), null);
  });

  test('markCatalogClueDiscovered añade una pista válida y persiste', () => {
    const state = markCatalogClueDiscovered(CLUES[0].id);
    assert.deepEqual(state.discoveredClueIds, [CLUES[0].id]);
    assert.deepEqual(loadCatalogState().discoveredClueIds, [CLUES[0].id]);
  });

  test('markCatalogClueDiscovered es idempotente', () => {
    markCatalogClueDiscovered(CLUES[0].id);
    const state = markCatalogClueDiscovered(CLUES[0].id);
    assert.deepEqual(state.discoveredClueIds, [CLUES[0].id]);
  });

  test('markCatalogClueDiscovered ignora un id de pista desconocido', () => {
    const state = markCatalogClueDiscovered('pista-que-no-existe');
    assert.deepEqual(state.discoveredClueIds, []);
  });

  test('markCatalogSolved marca resuelto y es idempotente', () => {
    const first = markCatalogSolved();
    assert.equal(first.solved, true);
    const second = markCatalogSolved();
    assert.equal(second.solved, true);
    assert.equal(loadCatalogState().solved, true);
  });

  test('JSON corrupto no revienta: devuelve el estado inicial', () => {
    store.setItem('hogwarts:catalog', '{ esto no es JSON válido');
    assert.deepEqual(loadCatalogState(), { discoveredClueIds: [], solved: false });
  });

  test('un esquema de versión futura no se interpreta ni se sobrescribe', () => {
    const futureSchemaRaw = JSON.stringify({ version: 999, forma: 'desconocida' });
    store.setItem('hogwarts:catalog', futureSchemaRaw);
    assert.deepEqual(loadCatalogState(), { discoveredClueIds: [], solved: false });
    assert.equal(store.getItem('hogwarts:catalog'), futureSchemaRaw);
  });

  test('ids de pista desconocidos o tipos inválidos se sanean sin romper la carga', () => {
    const raw = JSON.stringify({
      version: 1,
      state: { discoveredClueIds: [CLUES[0].id, 'no-existe', 42, null], solved: 'si' }
    });
    store.setItem('hogwarts:catalog', raw);
    assert.deepEqual(loadCatalogState(), { discoveredClueIds: [CLUES[0].id], solved: false });
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
    assert.deepEqual(loadCatalogState(), { discoveredClueIds: [], solved: false });
    assert.doesNotThrow(() => markCatalogClueDiscovered(CLUES[0].id));
    assert.doesNotThrow(() => markCatalogSolved());
  });
});
