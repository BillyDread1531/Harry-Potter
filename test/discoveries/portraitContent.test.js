import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PORTRAIT_ACT_LINES, getPortraitLineForAct } from '../../src/discoveries/portraitContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

describe('discoveries/portraitContent.js — integridad', () => {
  test('hay una línea real para cada acto, del 0 al 4', () => {
    for (const act of [0, 1, 2, 3, 4]) {
      assert.ok(PORTRAIT_ACT_LINES[act]?.length > 20, `acto ${act}: línea vacía o demasiado corta`);
    }
  });

  test('las cinco líneas son todas distintas entre sí (el diálogo cambia con el progreso)', () => {
    const lines = Object.values(PORTRAIT_ACT_LINES);
    assert.equal(new Set(lines).size, lines.length);
  });

  test('getPortraitLineForAct devuelve la línea correcta y cae al acto 0 ante un valor desconocido', () => {
    assert.equal(getPortraitLineForAct(2), PORTRAIT_ACT_LINES[2]);
    assert.equal(getPortraitLineForAct(99), PORTRAIT_ACT_LINES[0]);
    assert.equal(getPortraitLineForAct(undefined), PORTRAIT_ACT_LINES[0]);
  });

  test('ninguna línea revela la respuesta canónica de ningún expediente, ni menciona el Pensadero, el desenlace o un regalo', () => {
    const lines = Object.values(PORTRAIT_ACT_LINES).map((line) => line.toLowerCase());
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const line of lines) {
        assert.equal(line.includes(bareAnswer), false, `una línea del retrato menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
    for (const line of lines) {
      assert.equal(line.includes('pensadero'), false);
      assert.equal(line.includes('regalo'), false);
    }
  });

  // El retrato es alcanzable desde la primera visita al Archivo (no
  // depende de ningún expediente resuelto): por eso cada línea de acto
  // se vuelve visible exactamente cuando ese acto es alcanzable, con el
  // mismo criterio ya usado para la Sala de los Menesteres.
  test('ninguna línea de acto revela una respuesta futura antes de que ese acto sea alcanzable', () => {
    const earliestTriggerDay = { 0: 0, 1: 1, 2: 5, 3: 9, 4: 13 };
    for (const [act, visibleAfterDay] of Object.entries(earliestTriggerDay)) {
      assertNoFutureAnswerLeak(PORTRAIT_ACT_LINES[act], visibleAfterDay, { context: `línea del retrato, acto ${act}` });
    }
  });
});
