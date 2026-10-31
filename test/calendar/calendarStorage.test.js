import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadProgress, saveProgress } from '../../src/calendar/calendarStorage.js';

// node:test no trae `localStorage`; se sustituye `globalThis.localStorage`
// por una implementación mínima en memoria antes de cada prueba y se
// restaura lo que hubiera después, igual que ya se hizo con `fetch` en
// las pruebas de la Fase 0.
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

describe('calendar/calendarStorage.js', () => {
  test('almacenamiento vacío devuelve progreso vacío', () => {
    assert.deepEqual(loadProgress(), {});
  });

  test('guardar y recuperar funciona correctamente (ida y vuelta)', () => {
    const entries = {
      'expediente-01': { solved: true },
      'expediente-05': { solved: false }
    };
    const ok = saveProgress(entries);
    assert.equal(ok, true);
    assert.deepEqual(loadProgress(), entries);
  });

  test('JSON corrupto no revienta: devuelve progreso vacío', () => {
    store.setItem('hogwarts:calendarProgress', '{ esto no es JSON válido ::: ');
    assert.deepEqual(loadProgress(), {});
  });

  test('un valor que no es un objeto JSON tampoco revienta', () => {
    store.setItem('hogwarts:calendarProgress', '"solo una cadena"');
    assert.deepEqual(loadProgress(), {});
    store.setItem('hogwarts:calendarProgress', '42');
    assert.deepEqual(loadProgress(), {});
  });

  test('un esquema de versión futura (desconocida) no se interpreta ni se sobrescribe', () => {
    const futureSchemaRaw = JSON.stringify({ version: 999, forma: 'que este código no conoce' });
    store.setItem('hogwarts:calendarProgress', futureSchemaRaw);

    assert.deepEqual(loadProgress(), {});
    // Lo importante: NO debe haberlo tocado. Si lo leemos otra vez tal
    // cual quedó en el storage, sigue siendo exactamente lo mismo.
    assert.equal(store.getItem('hogwarts:calendarProgress'), futureSchemaRaw);
  });

  test('identificadores desconocidos se descartan sin afectar a los válidos', () => {
    const raw = JSON.stringify({
      version: 1,
      entries: {
        'expediente-01': { solved: true },
        'expediente-99': { solved: true }, // no existe
        otraCosa: { solved: true }
      }
    });
    store.setItem('hogwarts:calendarProgress', raw);

    assert.deepEqual(loadProgress(), {
      'expediente-01': { solved: true }
    });
  });

  test('tipos inválidos dentro de una entrada se normalizan a booleanos seguros', () => {
    const raw = JSON.stringify({
      version: 1,
      entries: {
        'expediente-02': { solved: 'si' }, // no es boolean
        'expediente-03': 'no es un objeto',
        'expediente-04': null
      }
    });
    store.setItem('hogwarts:calendarProgress', raw);

    const result = loadProgress();
    assert.deepEqual(result, {
      'expediente-02': { solved: false }
    });
  });

  test('localStorage inaccesible (lanza excepción) no rompe la carga ni el guardado', () => {
    globalThis.localStorage = {
      getItem() {
        throw new Error('Acceso a almacenamiento bloqueado');
      },
      setItem() {
        throw new Error('Acceso a almacenamiento bloqueado');
      }
    };

    assert.deepEqual(loadProgress(), {});
    assert.equal(saveProgress({ 'expediente-01': { solved: true } }), false);
  });

  test('guardar nunca persiste la disponibilidad calculada, solo resuelto/entregado', () => {
    const entries = {
      'expediente-01': { solved: true, isAvailable: true, unlockInstant: 'esto no debería guardarse' }
    };
    saveProgress(entries);
    const raw = JSON.parse(store.getItem('hogwarts:calendarProgress'));
    assert.deepEqual(raw.entries['expediente-01'], { solved: true });
  });
});
