import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ROOM_ACT_LINES, ROOM_HOTSPOT_POSITION, getRoomLineForAct } from '../src/data/roomOfRequirementContent.js';
import { RIDDLES } from '../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from './helpers/leakCheck.js';

describe('data/roomOfRequirementContent.js — integridad', () => {
  test('hay una línea real para cada acto, del 0 al 4', () => {
    for (const act of [0, 1, 2, 3, 4]) {
      assert.ok(ROOM_ACT_LINES[act]?.length > 20, `acto ${act}: línea vacía o demasiado corta`);
    }
  });

  test('las cinco líneas son todas distintas entre sí', () => {
    const lines = Object.values(ROOM_ACT_LINES);
    assert.equal(new Set(lines).size, lines.length);
  });

  test('getRoomLineForAct devuelve la línea correcta y cae al acto 0 ante un valor desconocido', () => {
    assert.equal(getRoomLineForAct(2), ROOM_ACT_LINES[2]);
    assert.equal(getRoomLineForAct(99), ROOM_ACT_LINES[0]);
    assert.equal(getRoomLineForAct(undefined), ROOM_ACT_LINES[0]);
  });

  test('la posición del único punto interactivo es válida para escritorio y móvil', () => {
    for (const breakpoint of ['desktop', 'mobile']) {
      const { x, y } = ROOM_HOTSPOT_POSITION[breakpoint];
      assert.ok(x >= 0 && x <= 100, `${breakpoint}.x fuera de rango`);
      assert.ok(y >= 0 && y <= 100, `${breakpoint}.y fuera de rango`);
    }
  });

  test('ninguna línea revela la respuesta canónica de ningún expediente, ni menciona el cumpleaños o el Pensadero', () => {
    const lines = Object.values(ROOM_ACT_LINES).map((line) => line.toLowerCase());
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const line of lines) {
        assert.equal(line.includes(bareAnswer), false, `una línea menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
    for (const line of lines) {
      assert.equal(line.includes('cumplea'), false);
      assert.equal(line.includes('pensadero'), false);
    }
  });

  // `getCurrentAct` (calendar/actProgress.js) usa el día MÁS ALTO
  // resuelto, y el calendario no obliga a resolver en orden — así que
  // el acto N puede alcanzarse con un único día resuelto (el primero
  // de su rango: 1, 5, 9 o 13). Por eso el umbral de visibilidad real
  // de cada línea es ESE día mínimo, no el último del rango.
  test('ninguna línea de acto revela una respuesta futura antes de que ese acto sea alcanzable', () => {
    const earliestTriggerDay = { 0: 0, 1: 1, 2: 5, 3: 9, 4: 13 };
    for (const [act, visibleAfterDay] of Object.entries(earliestTriggerDay)) {
      assertNoFutureAnswerLeak(ROOM_ACT_LINES[act], visibleAfterDay, { context: `línea del acto ${act}` });
    }
  });
});
