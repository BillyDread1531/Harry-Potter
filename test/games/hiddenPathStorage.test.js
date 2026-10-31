import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadHiddenPathState, markHiddenPathClueDiscovered, markHiddenPathSolved } from '../../src/games/hiddenPathStorage.js';
import { CLUES } from '../../src/games/hiddenPathData.js';

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

describe('games/hiddenPathStorage.js', () => {
  test('almacenamiento vacío devuelve el estado inicial', () => {
    assert.deepEqual(loadHiddenPathState(), { discoveredClueIds: [], solved: false });
  });

  test('usa su propia clave de localStorage', () => {
    markHiddenPathClueDiscovered(CLUES[0].id);
    const keysUsed = [];
    const originalSetItem = store.setItem.bind(store);
    store.setItem = (key, value) => {
      keysUsed.push(key);
      originalSetItem(key, value);
    };
    markHiddenPathSolved();
    assert.ok(keysUsed.every((key) => key === 'hogwarts:hiddenPath'));
    assert.equal(store.getItem('hogwarts:calendarProgress'), null);
    assert.equal(store.getItem('hogwarts:mothLock'), null);
    assert.equal(store.getItem('hogwarts:catalog'), null);
  });

  test('markHiddenPathClueDiscovered añade una pista válida, es idempotente, e ignora ids desconocidos', () => {
    markHiddenPathClueDiscovered(CLUES[0].id);
    const repeated = markHiddenPathClueDiscovered(CLUES[0].id);
    assert.deepEqual(repeated.discoveredClueIds, [CLUES[0].id]);
    const unknown = markHiddenPathClueDiscovered('no-existe');
    assert.deepEqual(unknown.discoveredClueIds, [CLUES[0].id]);
  });

  test('markHiddenPathSolved marca resuelto y es idempotente', () => {
    const first = markHiddenPathSolved();
    assert.equal(first.solved, true);
    assert.equal(markHiddenPathSolved().solved, true);
    assert.equal(loadHiddenPathState().solved, true);
  });

  test('JSON corrupto o versión futura no rompen la carga', () => {
    store.setItem('hogwarts:hiddenPath', '{ no es JSON');
    assert.deepEqual(loadHiddenPathState(), { discoveredClueIds: [], solved: false });

    const futureSchemaRaw = JSON.stringify({ version: 999 });
    store.setItem('hogwarts:hiddenPath', futureSchemaRaw);
    assert.deepEqual(loadHiddenPathState(), { discoveredClueIds: [], solved: false });
    assert.equal(store.getItem('hogwarts:hiddenPath'), futureSchemaRaw);
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
    assert.deepEqual(loadHiddenPathState(), { discoveredClueIds: [], solved: false });
    assert.doesNotThrow(() => markHiddenPathClueDiscovered(CLUES[0].id));
    assert.doesNotThrow(() => markHiddenPathSolved());
  });
});
