import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createCalendarStore } from '../../src/calendar/calendarStore.js';
import { getRiddleForDay } from '../../src/calendar/riddlesData.js';

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

describe('calendar/calendarStore.js — submitAnswer (integración con los acertijos)', () => {
  const unlocked = new Date('2026-11-05T12:00:00Z'); // desbloquea hasta el día 5
  const beforeCalendar = new Date('2026-10-20T00:00:00Z');

  test('una respuesta correcta marca el expediente como resuelto', () => {
    const store = createCalendarStore();
    const riddle = getRiddleForDay(3);
    const result = store.submitAnswer(3, riddle.canonicalAnswer, unlocked);

    assert.equal(result.status, 'correct');
    const state = store.getState(unlocked).find((s) => s.day === 3);
    assert.equal(state.solved, true);
  });

  test('una respuesta incorrecta NO modifica el progreso', () => {
    const store = createCalendarStore();
    const result = store.submitAnswer(3, 'respuesta completamente equivocada', unlocked);

    assert.equal(result.status, 'incorrect');
    const state = store.getState(unlocked).find((s) => s.day === 3);
    assert.equal(state.solved, false);
  });

  test('una respuesta vacía no modifica el progreso ni se cuenta como intento fallido especial', () => {
    const store = createCalendarStore();
    const result = store.submitAnswer(3, '   ', unlocked);

    assert.equal(result.status, 'empty');
    const state = store.getState(unlocked).find((s) => s.day === 3);
    assert.equal(state.solved, false);
  });

  test('un expediente bloqueado no puede resolverse aunque la respuesta sea correcta', () => {
    const store = createCalendarStore();
    const riddle = getRiddleForDay(10); // día 10, no desbloqueado todavía con `beforeCalendar`
    const result = store.submitAnswer(10, riddle.canonicalAnswer, beforeCalendar);

    // El validador sigue diciendo "correct" (eso es responsabilidad suya),
    // pero el progreso nunca se marca como resuelto porque `solve()` ya
    // protege los días bloqueados.
    assert.equal(result.status, 'correct');
    const state = store.getState(beforeCalendar).find((s) => s.day === 10);
    assert.equal(state.solved, false);
  });

  test('resolver el acertijo marca el expediente como resuelto', () => {
    const store = createCalendarStore();
    const riddle = getRiddleForDay(2);
    store.submitAnswer(2, riddle.canonicalAnswer, unlocked);

    const state = store.getState(unlocked).find((s) => s.day === 2);
    assert.equal(state.solved, true);
  });

  test('el progreso sobrevive a una recarga simulada (nueva instancia del store)', () => {
    const store = createCalendarStore();
    const riddle = getRiddleForDay(1);
    store.submitAnswer(1, riddle.canonicalAnswer, unlocked);

    const reloaded = createCalendarStore();
    const state = reloaded.getState(unlocked).find((s) => s.day === 1);
    assert.equal(state.solved, true);
  });

  test('volver a enviar la respuesta correcta de un día ya resuelto no cambia nada ni falla', () => {
    const store = createCalendarStore();
    const riddle = getRiddleForDay(1);
    store.submitAnswer(1, riddle.canonicalAnswer, unlocked);
    const secondResult = store.submitAnswer(1, riddle.canonicalAnswer, unlocked);

    assert.equal(secondResult.status, 'correct');
    const state = store.getState(unlocked).find((s) => s.day === 1);
    assert.equal(state.solved, true);
  });

  test('una variante aceptada también resuelve el expediente', () => {
    const store = createCalendarStore();
    const result = store.submitAnswer(2, 'rana chocolate', unlocked); // variante de "Rana de chocolate"

    assert.equal(result.status, 'correct');
    const state = store.getState(unlocked).find((s) => s.day === 2);
    assert.equal(state.solved, true);
  });

  test('el día 12 se resuelve con "las tres reliquias" (variante de Reliquias de la Muerte)', () => {
    const allUnlocked = new Date('2026-11-16T03:00:00Z');
    const store = createCalendarStore();
    const result = store.submitAnswer(12, 'las tres reliquias', allUnlocked);

    assert.equal(result.status, 'correct');
    const state = store.getState(allUnlocked).find((s) => s.day === 12);
    assert.equal(state.solved, true);
  });

  describe('día 11 — la respuesta exige el vínculo con Dobby, no basta "calcetín" a secas', () => {
    const allUnlocked = new Date('2026-11-16T03:00:00Z');

    test('se acepta la respuesta canónica y sus variantes con Dobby', () => {
      for (const answer of ['Calcetín de Dobby', 'calcetin de dobby', 'el calcetin de dobby', 'un calcetin de dobby']) {
        const store = createCalendarStore();
        const result = store.submitAnswer(11, answer, allUnlocked);
        assert.equal(result.status, 'correct', `"${answer}" debería aceptarse`);
      }
    });

    test('un error tipográfico menor sobre una variante con Dobby se sigue aceptando', () => {
      const store = createCalendarStore();
      const result = store.submitAnswer(11, 'calcetin de doby', allUnlocked); // falta una "b"
      assert.equal(result.status, 'correct');
    });

    test('"calcetín" a secas, sin Dobby, se RECHAZA', () => {
      for (const answer of ['calcetin', 'un calcetin', 'calcetines', 'el calcetin']) {
        const store = createCalendarStore();
        const result = store.submitAnswer(11, answer, allUnlocked);
        assert.equal(result.status, 'incorrect', `"${answer}" debería rechazarse por ser demasiado genérico`);
      }
    });

    test('la tolerancia a typos no "alcanza" accidentalmente desde una respuesta genérica corta', () => {
      // "calcetin" (8 caracteres) está a una distancia de edición
      // enorme de "calcetin de dobby" (18 caracteres) — el límite de
      // diferencia de longitud del validador lo rechaza de entrada,
      // sin siquiera calcular Levenshtein.
      const store = createCalendarStore();
      const result = store.submitAnswer(11, 'calcetin', allUnlocked);
      assert.equal(result.status, 'incorrect');
    });
  });
});
