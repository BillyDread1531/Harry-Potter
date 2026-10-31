import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createDetailMarkup } from '../../src/calendar/calendarView.js';
import { RIDDLES, getRiddleForDay } from '../../src/calendar/riddlesData.js';
import { getExpedienteState } from '../../src/calendar/calendarEngine.js';

// `createDetailMarkup` es una función pura (estado + acertijo + estado
// efímero de la interfaz -> HTML). Se puede probar aquí, sin DOM,
// exactamente lo que pide la corrección: que la respuesta canónica, la
// explicación y la referencia de película nunca aparezcan antes de
// resolver, que no haya ningún control de pistas, y que el regalo
// planeado nunca se muestre en la experiencia de Andrea.
const unlocked = new Date('2026-11-16T03:00:00Z'); // después de las 20:00 del día 15: todo desbloqueado

describe('calendar/calendarView.js — createDetailMarkup no filtra contenido no revelado', () => {
  test('ningún acertijo expone su respuesta canónica en la ficha sin resolver', () => {
    for (const riddle of RIDDLES) {
      const dayState = getExpedienteState(riddle.day, { referenceInstant: unlocked, progress: {} });
      const html = createDetailMarkup(dayState, riddle, { feedback: null });
      const htmlLower = html.toLowerCase();
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      assert.equal(htmlLower.includes(bareAnswer), false, `día ${riddle.day} filtra su respuesta`);
    }
  });

  test('la explicación, la referencia de película y el capítulo no aparecen antes de resolver', () => {
    for (const riddle of RIDDLES) {
      const dayState = getExpedienteState(riddle.day, { referenceInstant: unlocked, progress: {} });
      const html = createDetailMarkup(dayState, riddle, { feedback: null });
      assert.equal(html.includes(riddle.explanation), false, `día ${riddle.day}: explicación visible antes de tiempo`);
      assert.equal(html.includes(riddle.filmReference), false, `día ${riddle.day}: referencia visible antes de tiempo`);
      assert.equal(html.includes(riddle.chapter), false, `día ${riddle.day}: capítulo visible antes de tiempo`);
    }
  });

  test('la explicación, la referencia de película y el capítulo SÍ aparecen una vez resuelto', () => {
    const riddle = getRiddleForDay(3);
    const solvedState = getExpedienteState(3, {
      referenceInstant: unlocked,
      progress: { 'expediente-03': { solved: true } }
    });
    const html = createDetailMarkup(solvedState, riddle, { feedback: null });
    assert.equal(html.includes(riddle.explanation), true);
    assert.equal(html.includes(riddle.filmReference), true);
    assert.equal(html.includes(riddle.chapter), true);
  });

  test('`justSolved` activa la clase de animación de acierto solo esa vez; sin ella, no aparece', () => {
    const riddle = getRiddleForDay(3);
    const solvedState = getExpedienteState(3, {
      referenceInstant: unlocked,
      progress: { 'expediente-03': { solved: true } }
    });
    const htmlJustSolved = createDetailMarkup(solvedState, riddle, { feedback: null, justSolved: true });
    const htmlReopened = createDetailMarkup(solvedState, riddle, { feedback: null, justSolved: false });
    assert.equal(htmlJustSolved.includes('expedientes-riddle__reveal--event'), true);
    assert.equal(htmlReopened.includes('expedientes-riddle__reveal--event'), false);
    assert.equal(htmlJustSolved.includes(`data-tone="${riddle.reactionTone}"`), true);
  });

  test('el regalo planeado nunca aparece en el HTML, resuelto o no', () => {
    for (const riddle of RIDDLES) {
      const unsolvedState = getExpedienteState(riddle.day, { referenceInstant: unlocked, progress: {} });
      const solvedState = getExpedienteState(riddle.day, {
        referenceInstant: unlocked,
        progress: { [`expediente-${String(riddle.day).padStart(2, '0')}`]: { solved: true } }
      });
      const htmlUnsolved = createDetailMarkup(unsolvedState, riddle, { feedback: null });
      const htmlSolved = createDetailMarkup(solvedState, riddle, { feedback: null });
      assert.equal(htmlUnsolved.includes(riddle.plannedGift), false, `día ${riddle.day} sin resolver`);
      assert.equal(htmlSolved.includes(riddle.plannedGift), false, `día ${riddle.day} resuelto`);
    }
  });

  test('el título interno de ningún acertijo aparece en la ficha; en su lugar se muestra la marca de archivo neutra', () => {
    for (const riddle of RIDDLES) {
      const dayState = getExpedienteState(riddle.day, { referenceInstant: unlocked, progress: {} });
      const html = createDetailMarkup(dayState, riddle, { feedback: null });
      assert.equal(html.includes(riddle.title), false, `día ${riddle.day} muestra su título interno`);
      assert.equal(html.includes(riddle.caseLabel), true, `día ${riddle.day} no muestra su marca de archivo`);
    }
  });

  test('no existe ningún control de pistas (se eliminaron a propósito)', () => {
    const riddle = getRiddleForDay(1);
    const dayState = getExpedienteState(1, { referenceInstant: unlocked, progress: {} });
    const html = createDetailMarkup(dayState, riddle, { feedback: null });
    assert.equal(html.includes('data-request-hint'), false);
    assert.equal(html.toLowerCase().includes('pista'), false);
  });

  test('el mensaje de error de cada acertijo nunca contiene la respuesta canónica', () => {
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      assert.equal(riddle.reactions.incorrect.toLowerCase().includes(bareAnswer), false, `día ${riddle.day}`);
    }
  });

  test('un expediente ya resuelto no muestra el formulario de respuesta', () => {
    const riddle = getRiddleForDay(1);
    const solvedState = getExpedienteState(1, {
      referenceInstant: unlocked,
      progress: { 'expediente-01': { solved: true } }
    });
    const html = createDetailMarkup(solvedState, riddle, { feedback: null });
    assert.equal(html.includes('data-answer-form'), false);
  });

  test('un expediente sin resolver sí muestra el formulario', () => {
    const riddle = getRiddleForDay(1);
    const dayState = getExpedienteState(1, { referenceInstant: unlocked, progress: {} });
    const html = createDetailMarkup(dayState, riddle, { feedback: null });
    assert.equal(html.includes('data-answer-form'), true);
    assert.equal(html.includes('data-answer-input'), true);
  });

  test('sin estado o sin acertijo, devuelve una cadena vacía en vez de reventar', () => {
    assert.equal(createDetailMarkup(null, getRiddleForDay(1)), '');
    assert.equal(createDetailMarkup(getExpedienteState(1, { referenceInstant: unlocked }), null), '');
  });
});
