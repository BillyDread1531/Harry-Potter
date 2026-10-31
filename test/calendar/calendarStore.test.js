import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createCalendarStore } from '../../src/calendar/calendarStore.js';

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

describe('calendar/calendarStore.js (integración dominio + persistencia)', () => {
  const unlocked = new Date('2026-11-05T12:00:00Z');
  const beforeCalendar = new Date('2026-10-20T00:00:00Z');

  test('un store nuevo arranca sin ningún expediente resuelto ni entregado', () => {
    const store = createCalendarStore();
    const state = store.getState(unlocked);
    assert.equal(state.every((s) => s.solved === false), true);
  });

  test('resolver persiste y un store nuevo (simulando recargar la página) lo recupera', () => {
    const store = createCalendarStore();
    const ok = store.solve(3, unlocked);
    assert.equal(ok, true);

    const reloaded = createCalendarStore(); // nueva instancia == "cerrar y abrir de nuevo"
    const state = reloaded.getState(unlocked).find((s) => s.day === 3);
    assert.equal(state.solved, true);
  });

  test('intentar resolver un día bloqueado no persiste ningún cambio', () => {
    const store = createCalendarStore();
    store.solve(10, beforeCalendar);

    const reloaded = createCalendarStore();
    const state = reloaded.getState(beforeCalendar).find((s) => s.day === 10);
    assert.equal(state.solved, false);
  });
});
