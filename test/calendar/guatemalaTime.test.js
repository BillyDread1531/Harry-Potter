import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getTimeZoneOffsetMinutes,
  guatemalaMidnightUTC,
  guatemalaWallTimeToUTC,
  getGuatemalaDateParts,
  isValidInstant,
  isNightInGuatemala,
  GUATEMALA_TIME_ZONE
} from '../../src/calendar/guatemalaTime.js';

describe('calendar/guatemalaTime.js', () => {
  test('Guatemala está siempre a UTC-6 (sin horario de verano)', () => {
    // Un día de cada estación de 2026, para confirmar que el desfase no
    // varía con la época del año.
    const samples = [
      new Date('2026-01-15T12:00:00Z'),
      new Date('2026-04-15T12:00:00Z'),
      new Date('2026-07-15T12:00:00Z'),
      new Date('2026-11-01T12:00:00Z'),
      new Date('2026-12-25T12:00:00Z')
    ];
    for (const instant of samples) {
      assert.equal(getTimeZoneOffsetMinutes(instant, GUATEMALA_TIME_ZONE), -360, instant.toISOString());
    }
  });

  test('la medianoche del 1 de noviembre en Guatemala es las 06:00 UTC', () => {
    const instant = guatemalaMidnightUTC(2026, 11, 1);
    assert.equal(instant.toISOString(), '2026-11-01T06:00:00.000Z');
  });

  test('la medianoche del 15 de noviembre en Guatemala es las 06:00 UTC de ese día', () => {
    const instant = guatemalaMidnightUTC(2026, 11, 15);
    assert.equal(instant.toISOString(), '2026-11-15T06:00:00.000Z');
  });

  test('guatemalaWallTimeToUTC con hora distinta de medianoche', () => {
    // 1 nov 2026, 23:59:59 hora de Guatemala -> 2 nov 2026, 05:59:59 UTC.
    const instant = guatemalaWallTimeToUTC(2026, 11, 1, 23, 59, 59);
    assert.equal(instant.toISOString(), '2026-11-02T05:59:59.000Z');
  });

  test('getGuatemalaDateParts recupera el día de calendario correcto cerca de un límite de día', () => {
    // 06:00 UTC es justo medianoche en Guatemala: antes de eso, un
    // instante en UTC todavía "es" el día anterior en Guatemala.
    const justBefore = new Date('2026-11-01T05:59:59.000Z');
    const justAfter = new Date('2026-11-01T06:00:00.000Z');
    assert.deepEqual(getGuatemalaDateParts(justBefore), { year: 2026, month: 10, day: 31, hour: 23, minute: 59 });
    assert.deepEqual(getGuatemalaDateParts(justAfter), { year: 2026, month: 11, day: 1, hour: 0, minute: 0 });
  });

  test('getGuatemalaDateParts también recupera la hora de pared, para el desbloqueo especial del día 15', () => {
    const at8pm = new Date('2026-11-16T02:00:00.000Z'); // 20:00 Guatemala
    assert.deepEqual(getGuatemalaDateParts(at8pm), { year: 2026, month: 11, day: 15, hour: 20, minute: 0 });
  });

  test('isValidInstant distingue fechas válidas de inválidas', () => {
    assert.equal(isValidInstant(new Date('2026-11-01T00:00:00Z')), true);
    assert.equal(isValidInstant(new Date('fecha-invalida')), false);
    assert.equal(isValidInstant(null), false);
    assert.equal(isValidInstant(undefined), false);
    assert.equal(isValidInstant('2026-11-01'), false);
  });

  describe('isNightInGuatemala — ambientación contextual (vestíbulo)', () => {
    test('a medianoche en Guatemala, es de noche', () => {
      assert.equal(isNightInGuatemala(guatemalaMidnightUTC(2026, 11, 5)), true);
    });

    test('a mediodía en Guatemala (18:00 UTC), es de día', () => {
      assert.equal(isNightInGuatemala(new Date('2026-11-05T18:00:00.000Z')), false);
    });

    test('justo a las 18:00 hora de Guatemala, ya se considera de noche (límite inclusivo)', () => {
      const at6pmGuatemala = guatemalaWallTimeToUTC(2026, 11, 5, 18, 0, 0);
      assert.equal(isNightInGuatemala(at6pmGuatemala), true);
    });

    test('justo a las 06:00 hora de Guatemala, ya se considera de día (límite exclusivo)', () => {
      const at6amGuatemala = guatemalaWallTimeToUTC(2026, 11, 5, 6, 0, 0);
      assert.equal(isNightInGuatemala(at6amGuatemala), false);
    });

    test('a las 05:59 hora de Guatemala, todavía es de noche', () => {
      const justBefore6am = guatemalaWallTimeToUTC(2026, 11, 5, 5, 59, 0);
      assert.equal(isNightInGuatemala(justBefore6am), true);
    });

    test('siempre se calcula sobre la hora de Guatemala, nunca sobre la del dispositivo: dos instantes reales distintos pueden dar el mismo resultado si "son" la misma hora de pared en Guatemala', () => {
      const noonNov1 = guatemalaWallTimeToUTC(2026, 11, 1, 12, 0, 0);
      const noonDec25 = guatemalaWallTimeToUTC(2026, 12, 25, 12, 0, 0);
      assert.equal(isNightInGuatemala(noonNov1), isNightInGuatemala(noonDec25));
      assert.equal(isNightInGuatemala(noonNov1), false);
    });

    test('una fecha inválida cae de forma segura en "de día" (la variante más neutra), nunca lanza', () => {
      assert.equal(isNightInGuatemala(new Date('fecha-invalida')), false);
      assert.equal(isNightInGuatemala(null), false);
      assert.equal(isNightInGuatemala(undefined), false);
    });
  });
});
