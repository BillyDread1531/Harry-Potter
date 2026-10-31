import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadSealState, markSealClueDiscovered, markSealSolved, markSealContentsViewed } from '../../src/games/sealStorage.js';
import { CLUES } from '../../src/games/sealData.js';

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

describe('games/sealStorage.js', () => {
  test('almacenamiento vacío devuelve el estado inicial', () => {
    assert.deepEqual(loadSealState(), { discoveredClueIds: [], solved: false, contentsViewed: false });
  });

  test('usa su propia clave de localStorage', () => {
    markSealClueDiscovered(CLUES[0].id);
    const keysUsed = [];
    const originalSetItem = store.setItem.bind(store);
    store.setItem = (key, value) => {
      keysUsed.push(key);
      originalSetItem(key, value);
    };
    markSealSolved();
    assert.ok(keysUsed.every((key) => key === 'hogwarts:seal'));
    assert.equal(store.getItem('hogwarts:catalog'), null);
    assert.equal(store.getItem('hogwarts:hiddenPath'), null);
  });

  test('markSealClueDiscovered añade una pista válida, es idempotente, e ignora ids desconocidos', () => {
    markSealClueDiscovered(CLUES[0].id);
    const repeated = markSealClueDiscovered(CLUES[0].id);
    assert.deepEqual(repeated.discoveredClueIds, [CLUES[0].id]);
    const unknown = markSealClueDiscovered('no-existe');
    assert.deepEqual(unknown.discoveredClueIds, [CLUES[0].id]);
  });

  test('markSealSolved marca resuelto y es idempotente', () => {
    const first = markSealSolved();
    assert.equal(first.solved, true);
    assert.equal(markSealSolved().solved, true);
    assert.equal(loadSealState().solved, true);
  });

  test('JSON corrupto o versión futura no rompen la carga', () => {
    store.setItem('hogwarts:seal', '{ no es JSON');
    assert.deepEqual(loadSealState(), { discoveredClueIds: [], solved: false, contentsViewed: false });

    const futureSchemaRaw = JSON.stringify({ version: 999 });
    store.setItem('hogwarts:seal', futureSchemaRaw);
    assert.deepEqual(loadSealState(), { discoveredClueIds: [], solved: false, contentsViewed: false });
    assert.equal(store.getItem('hogwarts:seal'), futureSchemaRaw);
  });

  test('markSealContentsViewed solo surte efecto una vez resuelto, y es idempotente', () => {
    assert.equal(markSealContentsViewed().contentsViewed, false);
    markSealSolved();
    assert.equal(markSealContentsViewed().contentsViewed, true);
    assert.equal(markSealContentsViewed().contentsViewed, true);
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
    assert.deepEqual(loadSealState(), { discoveredClueIds: [], solved: false, contentsViewed: false });
    assert.doesNotThrow(() => markSealClueDiscovered(CLUES[0].id));
    assert.doesNotThrow(() => markSealSolved());
  });
});
