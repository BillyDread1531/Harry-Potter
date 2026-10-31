import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getFragmentsWithStatus, createPersonalMessageBodyMarkup } from '../../src/calendar/personalMessageView.js';
import { getCalendarState } from '../../src/calendar/calendarEngine.js';
import { getRiddleForDay, RIDDLES } from '../../src/calendar/riddlesData.js';

const unlocked = new Date('2026-11-16T03:00:00Z'); // todo desbloqueado por fecha

function stateWithSolved(days) {
  const progress = Object.fromEntries(
    days.map((day) => [`expediente-${String(day).padStart(2, '0')}`, { solved: true }])
  );
  return getCalendarState({ referenceInstant: unlocked, progress });
}

describe('calendar/personalMessageView.js — getFragmentsWithStatus', () => {
  test('con progreso vacío, los quince fragmentos existen pero ninguno está ganado', () => {
    const items = getFragmentsWithStatus(stateWithSolved([]));
    assert.equal(items.length, 15);
    assert.ok(items.every((item) => item.earned === false));
  });

  test('resolver un acertijo incorpora ÚNICAMENTE el fragmento de ese día', () => {
    const items = getFragmentsWithStatus(stateWithSolved([4]));
    const earned = items.filter((item) => item.earned);
    assert.equal(earned.length, 1);
    assert.equal(earned[0].day, 4);
    assert.equal(earned[0].fragment, getRiddleForDay(4).fragment);
  });

  test('el orden es siempre ascendente por día (estable), sin importar en qué orden se resolvieron', () => {
    const items = getFragmentsWithStatus(stateWithSolved([9, 1, 5]));
    assert.deepEqual(
      items.map((item) => item.day),
      Array.from({ length: 15 }, (_, i) => i + 1)
    );
  });

  test('con undefined/null en vez de un calendarState, no revienta: nada está ganado', () => {
    assert.ok(getFragmentsWithStatus(undefined).every((item) => item.earned === false));
    assert.ok(getFragmentsWithStatus(null).every((item) => item.earned === false));
  });
});

describe('calendar/personalMessageView.js — createPersonalMessageBodyMarkup', () => {
  test('con progreso vacío, muestra un estado inicial (no una lista vacía ni un error)', () => {
    const html = createPersonalMessageBodyMarkup(stateWithSolved([]));
    assert.ok(html.includes('personal-message__empty'));
    assert.equal(html.includes('personal-message__piece'), false);
  });

  test('un fragmento ganado aparece literal, sin reescribirlo', () => {
    const html = createPersonalMessageBodyMarkup(stateWithSolved([1]));
    assert.ok(html.includes(getRiddleForDay(1).fragment));
  });

  test('los fragmentos futuros (no ganados) nunca aparecen como texto — solo como hueco', () => {
    const html = createPersonalMessageBodyMarkup(stateWithSolved([1]));
    for (const riddle of RIDDLES) {
      if (riddle.day === 1) continue;
      assert.equal(html.includes(riddle.fragment), false, `el fragmento del día ${riddle.day} no debería aparecer todavía`);
    }
    // Catorce huecos por los catorce días que faltan.
    const gapCount = (html.match(/personal-message__gap/g) || []).length;
    assert.equal(gapCount, 14);
  });

  test('con los quince resueltos, el mensaje completo aparece y no queda ningún hueco', () => {
    const html = createPersonalMessageBodyMarkup(stateWithSolved(Array.from({ length: 15 }, (_, i) => i + 1)));
    for (const riddle of RIDDLES) {
      assert.ok(html.includes(riddle.fragment), `falta el fragmento del día ${riddle.day}`);
    }
    assert.equal(html.includes('personal-message__gap'), false);
  });

  test('el contador refleja exactamente cuántos se han ganado', () => {
    const html = createPersonalMessageBodyMarkup(stateWithSolved([1, 2, 3]));
    assert.ok(html.includes('3 de 15 fragmentos encontrados.'));
  });

  test('el mensaje personal nunca incluye el capítulo narrativo de ningún día (quedan separados)', () => {
    const html = createPersonalMessageBodyMarkup(stateWithSolved(Array.from({ length: 15 }, (_, i) => i + 1)));
    for (const riddle of RIDDLES) {
      assert.equal(html.includes(riddle.chapter), false, `el capítulo del día ${riddle.day} no debería aparecer aquí`);
    }
  });

  test('volver a calcularlo con el mismo progreso (como al reabrir la experiencia) da siempre el mismo resultado', () => {
    const state = stateWithSolved([2, 5, 11]);
    assert.equal(createPersonalMessageBodyMarkup(state), createPersonalMessageBodyMarkup(state));
  });

  test('reabrir con el progreso ya persistido reconstruye exactamente los fragmentos esperados', () => {
    // Simula "cerrar y volver a abrir": el progreso guardado es la
    // única fuente de verdad, así que una nueva llamada con el mismo
    // progreso reconstruye lo mismo, sin ningún estado intermedio.
    const progress = {
      'expediente-01': { solved: true },
      'expediente-07': { solved: true }
    };
    const state = getCalendarState({ referenceInstant: unlocked, progress });
    const items = getFragmentsWithStatus(state);
    assert.deepEqual(
      items.filter((i) => i.earned).map((i) => i.day),
      [1, 7]
    );
  });
});
