import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { OWL_LINE_DEFAULT, OWL_LINE_AFTER_BOOK, getOwlLine } from '../../src/discoveries/owlContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

describe('discoveries/owlContent.js — la lechuza del Vestíbulo', () => {
  test('las dos líneas existen y son distintas entre sí', () => {
    assert.ok(OWL_LINE_DEFAULT.length > 20);
    assert.ok(OWL_LINE_AFTER_BOOK.length > 20);
    assert.notEqual(OWL_LINE_DEFAULT, OWL_LINE_AFTER_BOOK);
  });

  test('sin progreso (day 0), devuelve la línea especial solo si el libro ya se descubrió', () => {
    assert.equal(getOwlLine(), OWL_LINE_DEFAULT);
    assert.equal(getOwlLine({ bookDiscovered: false }), OWL_LINE_DEFAULT);
    assert.equal(getOwlLine({ bookDiscovered: true }), OWL_LINE_AFTER_BOOK);
  });

  test('las 15 líneas diarias existen, son distintas entre sí y nunca filtran nada', () => {
    const lines = Array.from({ length: 15 }, (_, i) => getOwlLine({ day: i + 1 }));
    assert.equal(new Set(lines).size, 15, 'las 15 líneas deberían ser todas distintas');
    for (const [index, line] of lines.entries()) {
      const day = index + 1;
      assert.ok(line.length > 20, `día ${day}: línea demasiado corta`);
      assertNoFutureAnswerLeak(line, 0, { context: `lechuza, día ${day}` });
      assert.equal(line.toLowerCase().includes('pensadero'), false, `día ${day}: menciona el Pensadero`);
      assert.equal(line.toLowerCase().includes('regalo'), false, `día ${day}: menciona un regalo`);
      for (const riddle of RIDDLES) {
        const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
        assert.equal(line.toLowerCase().includes(bareAnswer), false, `día ${day}: menciona "${bareAnswer}"`);
      }
    }
  });

  test('un día fuera de 1-15 no revienta: cae de vuelta en una línea válida', () => {
    assert.equal(getOwlLine({ day: 16 }), getOwlLine({ day: 15 }));
  });
});
