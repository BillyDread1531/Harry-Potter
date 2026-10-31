import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadCastleSecretsState,
  markBookDiscovered,
  markPortraitMet,
  markCollectibleFound,
  markMothWingNoticed,
  markThreeMarksRecognized,
  markColdDraftFeltLibrary,
  markColdDraftFeltMap,
  markColdDraftResolved
} from '../../src/discoveries/castleSecretsStorage.js';

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

const EMPTY_STATE = {
  bookDiscovered: false,
  portraitMet: false,
  collectibleFound: false,
  mothWingNoticed: false,
  threeMarksRecognized: false,
  coldDraftFeltLibrary: false,
  coldDraftFeltMap: false,
  coldDraftResolved: false
};

beforeEach(() => {
  originalLocalStorage = globalThis.localStorage;
  store = createMemoryStorage();
  globalThis.localStorage = store;
});

afterEach(() => {
  globalThis.localStorage = originalLocalStorage;
});

describe('discoveries/castleSecretsStorage.js', () => {
  test('almacenamiento vacío devuelve las cinco banderas en false', () => {
    assert.deepEqual(loadCastleSecretsState(), EMPTY_STATE);
  });

  test('usa su propia clave de localStorage, distinta de calendario/cromos/cerradura', () => {
    markBookDiscovered();
    assert.equal(store.getItem('hogwarts:calendarProgress'), null);
    assert.equal(store.getItem('hogwarts:cardsCollected'), null);
    assert.equal(store.getItem('hogwarts:mothLock'), null);
    assert.ok(store.getItem('hogwarts:castleSecrets') !== null);
  });

  test('markBookDiscovered marca la bandera y es idempotente', () => {
    const first = markBookDiscovered();
    assert.equal(first.bookDiscovered, true);
    const second = markBookDiscovered();
    assert.equal(second.bookDiscovered, true);
    assert.equal(loadCastleSecretsState().bookDiscovered, true);
  });

  test('markPortraitMet marca la bandera y es idempotente', () => {
    markPortraitMet();
    const state = markPortraitMet();
    assert.equal(state.portraitMet, true);
    assert.equal(loadCastleSecretsState().portraitMet, true);
  });

  test('markCollectibleFound marca la bandera y es idempotente', () => {
    markCollectibleFound();
    const state = markCollectibleFound();
    assert.equal(state.collectibleFound, true);
    assert.equal(loadCastleSecretsState().collectibleFound, true);
  });

  test('markMothWingNoticed marca la bandera y es idempotente', () => {
    markMothWingNoticed();
    const state = markMothWingNoticed();
    assert.equal(state.mothWingNoticed, true);
    assert.equal(loadCastleSecretsState().mothWingNoticed, true);
  });

  test('markThreeMarksRecognized marca la bandera y es idempotente', () => {
    markThreeMarksRecognized();
    const state = markThreeMarksRecognized();
    assert.equal(state.threeMarksRecognized, true);
    assert.equal(loadCastleSecretsState().threeMarksRecognized, true);
  });

  test('markColdDraftFeltLibrary marca la bandera y es idempotente', () => {
    markColdDraftFeltLibrary();
    const state = markColdDraftFeltLibrary();
    assert.equal(state.coldDraftFeltLibrary, true);
    assert.equal(loadCastleSecretsState().coldDraftFeltLibrary, true);
  });

  test('markColdDraftFeltMap marca la bandera y es idempotente', () => {
    markColdDraftFeltMap();
    const state = markColdDraftFeltMap();
    assert.equal(state.coldDraftFeltMap, true);
    assert.equal(loadCastleSecretsState().coldDraftFeltMap, true);
  });

  test('markColdDraftResolved marca la bandera y es idempotente', () => {
    markColdDraftResolved();
    const state = markColdDraftResolved();
    assert.equal(state.coldDraftResolved, true);
    assert.equal(loadCastleSecretsState().coldDraftResolved, true);
  });

  test('las ocho banderas son completamente independientes entre sí', () => {
    markBookDiscovered();
    const state = loadCastleSecretsState();
    assert.equal(state.bookDiscovered, true);
    assert.equal(state.portraitMet, false);
    assert.equal(state.collectibleFound, false);
    assert.equal(state.mothWingNoticed, false);
    assert.equal(state.threeMarksRecognized, false);

    markMothWingNoticed();
    const state2 = loadCastleSecretsState();
    assert.equal(state2.bookDiscovered, true);
    assert.equal(state2.mothWingNoticed, true);
    assert.equal(state2.threeMarksRecognized, false);
  });

  // Cada fase ha ido añadiendo banderas nuevas a esta misma clave de
  // storage. Un estado guardado por una fase anterior (con menos
  // banderas) debe seguir cargando sin romperse, con las banderas más
  // nuevas en `false` por defecto — nunca interpretado como "versión
  // desconocida". Se comprueban dos "fotos" distintas del pasado.
  test('un estado guardado por la fase del recorrido de la polilla (sin las tres banderas de la corriente fría) sigue cargando correctamente', () => {
    const olderStateRaw = JSON.stringify({
      version: 1,
      state: { bookDiscovered: true, portraitMet: true, collectibleFound: false, mothWingNoticed: true, threeMarksRecognized: true }
    });
    store.setItem('hogwarts:castleSecrets', olderStateRaw);
    assert.deepEqual(loadCastleSecretsState(), {
      bookDiscovered: true,
      portraitMet: true,
      collectibleFound: false,
      mothWingNoticed: true,
      threeMarksRecognized: true,
      coldDraftFeltLibrary: false,
      coldDraftFeltMap: false,
      coldDraftResolved: false
    });
  });

  test('un estado guardado por una fase todavía más antigua (solo las tres primeras banderas) también sigue cargando correctamente', () => {
    const muchOlderStateRaw = JSON.stringify({
      version: 1,
      state: { bookDiscovered: true, portraitMet: true, collectibleFound: false }
    });
    store.setItem('hogwarts:castleSecrets', muchOlderStateRaw);
    assert.deepEqual(loadCastleSecretsState(), {
      bookDiscovered: true,
      portraitMet: true,
      collectibleFound: false,
      mothWingNoticed: false,
      threeMarksRecognized: false,
      coldDraftFeltLibrary: false,
      coldDraftFeltMap: false,
      coldDraftResolved: false
    });
  });

  test('JSON corrupto no revienta: devuelve el estado inicial', () => {
    store.setItem('hogwarts:castleSecrets', '{ esto no es JSON válido');
    assert.deepEqual(loadCastleSecretsState(), EMPTY_STATE);
  });

  test('un esquema de versión futura (desconocida) no se interpreta ni se sobrescribe', () => {
    const futureSchemaRaw = JSON.stringify({ version: 999, forma: 'desconocida' });
    store.setItem('hogwarts:castleSecrets', futureSchemaRaw);
    assert.deepEqual(loadCastleSecretsState(), EMPTY_STATE);
    assert.equal(store.getItem('hogwarts:castleSecrets'), futureSchemaRaw);
  });

  test('tipos inválidos o campos desconocidos se sanean sin romper la carga', () => {
    const raw = JSON.stringify({
      version: 1,
      state: {
        bookDiscovered: 'si',
        portraitMet: 1,
        collectibleFound: null,
        mothWingNoticed: 'true',
        threeMarksRecognized: [],
        coldDraftFeltLibrary: 'si',
        coldDraftFeltMap: 0,
        coldDraftResolved: undefined,
        otraCosa: true
      }
    });
    store.setItem('hogwarts:castleSecrets', raw);
    assert.deepEqual(loadCastleSecretsState(), EMPTY_STATE);
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
    assert.deepEqual(loadCastleSecretsState(), EMPTY_STATE);
    assert.doesNotThrow(() => markBookDiscovered());
    assert.doesNotThrow(() => markPortraitMet());
    assert.doesNotThrow(() => markCollectibleFound());
    assert.doesNotThrow(() => markMothWingNoticed());
    assert.doesNotThrow(() => markThreeMarksRecognized());
    assert.doesNotThrow(() => markColdDraftFeltLibrary());
    assert.doesNotThrow(() => markColdDraftFeltMap());
    assert.doesNotThrow(() => markColdDraftResolved());
  });
});
