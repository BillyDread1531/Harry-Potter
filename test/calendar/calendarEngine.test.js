import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getExpedienteDays,
  isValidDay,
  createExpedienteId,
  getDayFromId,
  getUnlockInstant,
  isDayAvailable,
  getExpedienteState,
  getCalendarState,
  markSolved,
  FIRST_DAY,
  LAST_DAY
} from '../../src/calendar/calendarEngine.js';

function availableDays(referenceInstant) {
  return getCalendarState({ referenceInstant })
    .filter((state) => state.isAvailable)
    .map((state) => state.day);
}

describe('calendar/calendarEngine.js — ids y días', () => {
  test('hay exactamente quince días, del 1 al 15', () => {
    const days = getExpedienteDays();
    assert.equal(days.length, 15);
    assert.equal(days[0], FIRST_DAY);
    assert.equal(days[days.length - 1], LAST_DAY);
  });

  test('createExpedienteId / getDayFromId son inversas entre sí', () => {
    for (const day of getExpedienteDays()) {
      assert.equal(getDayFromId(createExpedienteId(day)), day);
    }
  });

  test('isValidDay rechaza números fuera de rango y valores no enteros', () => {
    assert.equal(isValidDay(1), true);
    assert.equal(isValidDay(15), true);
    assert.equal(isValidDay(0), false);
    assert.equal(isValidDay(16), false);
    assert.equal(isValidDay(7.5), false);
    assert.equal(isValidDay('7'), false);
    assert.equal(isValidDay(NaN), false);
    assert.equal(isValidDay(undefined), false);
  });
});

describe('calendar/calendarEngine.js — disponibilidad por fecha (hora de Guatemala)', () => {
  test('31 de octubre de 2026: cero días disponibles', () => {
    const referenceInstant = new Date('2026-10-31T23:00:00Z'); // 17:00 Guatemala, 31 oct
    assert.deepEqual(availableDays(referenceInstant), []);
  });

  test('1 de noviembre justo antes de medianoche (23:59:59 Guatemala): solo el día 1', () => {
    const referenceInstant = new Date('2026-11-02T05:59:59Z'); // 23:59:59 del 1 nov en Guatemala
    assert.deepEqual(availableDays(referenceInstant), [1]);
  });

  test('1 de noviembre a las 00:00 de Guatemala: día 1 disponible', () => {
    const referenceInstant = new Date('2026-11-01T06:00:00Z');
    assert.deepEqual(availableDays(referenceInstant), [1]);
  });

  test('2 de noviembre a las 00:00 de Guatemala: días 1 y 2 disponibles', () => {
    const referenceInstant = new Date('2026-11-02T06:00:00Z');
    assert.deepEqual(availableDays(referenceInstant), [1, 2]);
  });

  test('15 de noviembre a las 00:00 de Guatemala: días 1-14 disponibles, el 15 todavía no (desbloquea a las 20:00)', () => {
    const referenceInstant = new Date('2026-11-15T06:00:00Z'); // 00:00 Guatemala del día 15
    assert.deepEqual(availableDays(referenceInstant), getExpedienteDays().filter((d) => d !== 15));
  });

  test('15 de noviembre a las 19:59 de Guatemala: el día 15 (el último) todavía bloqueado', () => {
    const referenceInstant = new Date('2026-11-16T01:59:00Z'); // 19:59 Guatemala del día 15
    assert.deepEqual(availableDays(referenceInstant), getExpedienteDays().filter((d) => d !== 15));
  });

  test('15 de noviembre a las 20:00 de Guatemala: los quince días disponibles (el último se desbloquea)', () => {
    const referenceInstant = new Date('2026-11-16T02:00:00Z'); // 20:00 Guatemala del día 15
    assert.deepEqual(availableDays(referenceInstant), getExpedienteDays());
  });

  test('16 de noviembre: los quince días siguen disponibles', () => {
    const referenceInstant = new Date('2026-11-16T12:00:00Z');
    assert.deepEqual(availableDays(referenceInstant), getExpedienteDays());
  });

  test('mucho después (por ejemplo, 2027): los quince días siguen disponibles', () => {
    const referenceInstant = new Date('2027-03-01T00:00:00Z');
    assert.deepEqual(availableDays(referenceInstant), getExpedienteDays());
  });

  test('el mismo instante expresado en distintas zonas horarias da el mismo resultado', () => {
    // Las tres representaciones son el mismo instante real:
    // 2026-11-01T06:00:00Z == 2026-11-01T01:00:00-05:00 == 2026-11-01T16:00:00+10:00
    const inUTC = new Date('2026-11-01T06:00:00Z');
    const inMinusFive = new Date('2026-11-01T01:00:00-05:00');
    const inPlusTen = new Date('2026-11-01T16:00:00+10:00');

    assert.equal(inUTC.getTime(), inMinusFive.getTime());
    assert.equal(inUTC.getTime(), inPlusTen.getTime());

    const resultUTC = availableDays(inUTC);
    assert.deepEqual(availableDays(inMinusFive), resultUTC);
    assert.deepEqual(availableDays(inPlusTen), resultUTC);
  });

  test('una fecha de referencia inválida no desbloquea nada', () => {
    assert.equal(isDayAvailable(1, new Date('no-es-una-fecha')), false);
    assert.equal(isDayAvailable(1, null), false);
    assert.equal(isDayAvailable(1, undefined), false);
    assert.equal(isDayAvailable(1, '2026-11-01'), false);
  });

  test('un día inválido nunca está disponible, aunque la fecha sea válida', () => {
    const referenceInstant = new Date('2026-12-01T00:00:00Z');
    assert.equal(isDayAvailable(0, referenceInstant), false);
    assert.equal(isDayAvailable(16, referenceInstant), false);
    assert.equal(isDayAvailable(NaN, referenceInstant), false);
  });

  test('getExpedienteState de un día inválido devuelve null en vez de reventar', () => {
    assert.equal(getExpedienteState(0), null);
    assert.equal(getExpedienteState(16), null);
  });

  test('el día 15 (el último) se desbloquea a las 20:00 de Guatemala, no a medianoche como los demás', () => {
    assert.equal(getUnlockInstant(15).toISOString(), '2026-11-16T02:00:00.000Z'); // 20:00 Guatemala = 02:00Z del día siguiente
    assert.equal(getUnlockInstant(14).toISOString(), '2026-11-14T06:00:00.000Z'); // medianoche, como el resto
  });

  test('el instante de desbloqueo (unlockInstant) nunca se guarda: se recalcula siempre', () => {
    const state1 = getExpedienteState(5, { referenceInstant: new Date('2026-11-10T00:00:00Z') });
    const state2 = getExpedienteState(5, { referenceInstant: new Date('2026-12-01T00:00:00Z') });
    assert.equal(state1.unlockInstant.getTime(), state2.unlockInstant.getTime());
    assert.equal(state1.unlockInstant.getTime(), getUnlockInstant(5).getTime());
  });
});

describe('calendar/calendarEngine.js — estado del acertijo', () => {
  const unlocked = new Date('2026-11-05T12:00:00Z'); // bien entrado noviembre, día 3 ya desbloqueado
  const beforeCalendar = new Date('2026-10-20T00:00:00Z'); // antes de que empiece nada

  test('un expediente nuevo empieza sin resolver', () => {
    const state = getExpedienteState(3, { referenceInstant: unlocked, progress: {} });
    assert.equal(state.solved, false);
  });

  test('un expediente resuelto sigue apareciendo resuelto en consultas posteriores', () => {
    // El 5 de noviembre a las 12:00 UTC (`unlocked`) ya desbloqueó los
    // días 1 al 5, pero no el día 7 — se usa el día 3 a propósito.
    let progress = markSolved({}, 3, unlocked);
    const firstRead = getExpedienteState(3, { referenceInstant: unlocked, progress });
    const secondRead = getExpedienteState(3, { referenceInstant: unlocked, progress });
    assert.equal(firstRead.solved, true);
    assert.equal(secondRead.solved, true);
  });

  test('no se puede marcar como resuelto un día bloqueado mediante las operaciones normales', () => {
    const progress = markSolved({}, 10, beforeCalendar); // día 10 no desbloqueado todavía
    assert.deepEqual(progress, {});
    const state = getExpedienteState(10, { referenceInstant: beforeCalendar, progress });
    assert.equal(state.solved, false);
  });

  test('markSolved sobre un día bloqueado devuelve la MISMA referencia de progreso (no-op real)', () => {
    const original = { 'expediente-01': { solved: true } };
    const result = markSolved(original, 12, beforeCalendar);
    assert.equal(result, original); // misma referencia, no una copia
  });

  test('operaciones con día inválido no corrompen el estado', () => {
    const original = { 'expediente-01': { solved: true } };
    assert.equal(markSolved(original, 0, unlocked), original);
    assert.equal(markSolved(original, 16, unlocked), original);
    assert.equal(markSolved(original, NaN, unlocked), original);
    assert.equal(markSolved(original, 'tres', unlocked), original);
  });

  test('marcar como resuelto dos veces no revienta y deja el estado igual', () => {
    let progress = markSolved({}, 4, unlocked);
    const afterFirst = progress;
    progress = markSolved(progress, 4, unlocked);
    assert.equal(progress, afterFirst); // segunda llamada es no-op
  });
});
