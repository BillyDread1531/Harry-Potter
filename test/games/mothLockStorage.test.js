import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadMothLockState, markClueDiscovered, markMothLockSolved, markHintUsed } from '../../src/games/mothLockStorage.js';
import { CLUES } from '../../src/games/mothLockData.js';

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

describe('games/mothLockStorage.js', () => {
  test('almacenamiento vacío devuelve el estado inicial (no iniciada)', () => {
    assert.deepEqual(loadMothLockState(), { discoveredClueIds: [], solved: false, hintUsed: false });
  });

  test('usa su propia clave de localStorage, distinta de la del calendario y la de los cromos', () => {
    markClueDiscovered(CLUES[0].id);
    const keysUsed = [];
    const originalSetItem = store.setItem.bind(store);
    store.setItem = (key, value) => {
      keysUsed.push(key);
      originalSetItem(key, value);
    };
    markMothLockSolved();
    assert.ok(keysUsed.every((key) => key === 'hogwarts:mothLock'));
    assert.equal(store.getItem('hogwarts:calendarProgress'), null);
    assert.equal(store.getItem('hogwarts:cardsCollected'), null);
  });

  test('markClueDiscovered añade una pista válida y persiste', () => {
    const state = markClueDiscovered(CLUES[0].id);
    assert.deepEqual(state.discoveredClueIds, [CLUES[0].id]);
    assert.deepEqual(loadMothLockState().discoveredClueIds, [CLUES[0].id]);
  });

  test('markClueDiscovered es idempotente: repetir la misma pista no la duplica', () => {
    markClueDiscovered(CLUES[0].id);
    const state = markClueDiscovered(CLUES[0].id);
    assert.deepEqual(state.discoveredClueIds, [CLUES[0].id]);
  });

  test('markClueDiscovered ignora un id de pista desconocido, sin romper nada', () => {
    const state = markClueDiscovered('pista-que-no-existe');
    assert.deepEqual(state.discoveredClueIds, []);
  });

  test('descubrir varias pistas conserva todas, sin duplicarlas', () => {
    markClueDiscovered(CLUES[0].id);
    markClueDiscovered(CLUES[1].id);
    markClueDiscovered(CLUES[0].id); // repetida a propósito
    const state = loadMothLockState();
    assert.equal(state.discoveredClueIds.length, 2);
    assert.ok(state.discoveredClueIds.includes(CLUES[0].id));
    assert.ok(state.discoveredClueIds.includes(CLUES[1].id));
  });

  test('markMothLockSolved marca resuelto y es idempotente', () => {
    const first = markMothLockSolved();
    assert.equal(first.solved, true);
    const second = markMothLockSolved();
    assert.equal(second.solved, true);
    assert.equal(loadMothLockState().solved, true);
  });

  test('markHintUsed marca la pista opcional como pedida y es idempotente', () => {
    markHintUsed();
    const state = markHintUsed();
    assert.equal(state.hintUsed, true);
    assert.equal(loadMothLockState().hintUsed, true);
  });

  test('resolver el mecanismo no borra las pistas ya descubiertas ni al revés', () => {
    markClueDiscovered(CLUES[0].id);
    markMothLockSolved();
    const state = loadMothLockState();
    assert.equal(state.solved, true);
    assert.deepEqual(state.discoveredClueIds, [CLUES[0].id]);
  });

  test('JSON corrupto no revienta: devuelve el estado inicial', () => {
    store.setItem('hogwarts:mothLock', '{ esto no es JSON válido');
    assert.deepEqual(loadMothLockState(), { discoveredClueIds: [], solved: false, hintUsed: false });
  });

  test('un esquema de versión futura (desconocida) no se interpreta ni se sobrescribe', () => {
    const futureSchemaRaw = JSON.stringify({ version: 999, forma: 'desconocida' });
    store.setItem('hogwarts:mothLock', futureSchemaRaw);
    assert.deepEqual(loadMothLockState(), { discoveredClueIds: [], solved: false, hintUsed: false });
    assert.equal(store.getItem('hogwarts:mothLock'), futureSchemaRaw);
  });

  test('ids de pista desconocidos o tipos inválidos se sanean sin romper la carga', () => {
    const raw = JSON.stringify({
      version: 1,
      state: { discoveredClueIds: [CLUES[0].id, 'no-existe', 42, null], solved: 'si', hintUsed: 1 }
    });
    store.setItem('hogwarts:mothLock', raw);
    assert.deepEqual(loadMothLockState(), { discoveredClueIds: [CLUES[0].id], solved: false, hintUsed: false });
  });

  test('localStorage inaccesible (lanza excepción) no rompe la carga ni el guardado', () => {
    globalThis.localStorage = {
      getItem() {
        throw new Error('bloqueado');
      },
      setItem() {
        throw new Error('bloqueado');
      }
    };
    assert.deepEqual(loadMothLockState(), { discoveredClueIds: [], solved: false, hintUsed: false });
    assert.doesNotThrow(() => markClueDiscovered(CLUES[0].id));
    assert.doesNotThrow(() => markMothLockSolved());
  });
});
