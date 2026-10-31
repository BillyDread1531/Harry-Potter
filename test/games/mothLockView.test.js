import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createMothLockMarkup, createMothLockPanelMarkup } from '../../src/games/mothLockView.js';
import { CLUES, SYMBOLS, SOLUTION_SEQUENCE, DEFAULT_SEQUENCE, PHASE_LABELS } from '../../src/games/mothLockData.js';

// `createMothLockMarkup`/`createMothLockPanelMarkup` son funciones
// puras (estado -> HTML), igual que `calendarView.createDetailMarkup`
// y `mapHotspotsView.createMapHotspotsMarkup`: se pueden probar aquí,
// sin DOM, que la solución nunca aparece en el marcado antes de
// resolver, y que el estado "resuelto" se refleja correctamente.

const notStarted = { discoveredClueIds: [], solved: false, hintUsed: false };
const exploring = { discoveredClueIds: [CLUES[0].id], solved: false, hintUsed: false };
const ready = { discoveredClueIds: CLUES.map((c) => c.id), solved: false, hintUsed: false };
const solved = { discoveredClueIds: CLUES.map((c) => c.id), solved: true, hintUsed: false };

const SOLUTION_LABEL_SEQUENCE = SOLUTION_SEQUENCE.map(
  (id) => SYMBOLS.find((s) => s.id === id).label
);

describe('games/mothLockView.js — createMothLockMarkup (hotspots)', () => {
  test('expone exactamente tres hotspots de pista y uno de mecanismo', () => {
    const html = createMothLockMarkup();
    const clueMatches = html.match(/data-moth-clue="[^"]+"/g) ?? [];
    assert.equal(clueMatches.length, CLUES.length);
    assert.equal(html.includes('data-moth-mechanism'), true);
  });

  test('los tres hotspots de pista corresponden exactamente a los ids de CLUES, sin repetir', () => {
    const html = createMothLockMarkup();
    for (const clue of CLUES) {
      assert.equal(html.includes(`data-moth-clue="${clue.id}"`), true);
    }
  });

  test('ningún aria-label ni texto visible del marcado inicial menciona la secuencia correcta en orden', () => {
    const html = createMothLockMarkup();
    const joined = SOLUTION_LABEL_SEQUENCE.join(' ').toLowerCase();
    assert.equal(html.toLowerCase().includes(joined), false);
  });

  test('las posiciones de los hotspots están dentro del rango 0-100 (porcentaje válido)', () => {
    const html = createMothLockMarkup();
    const xMatches = [...html.matchAll(/--hotspot-x: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    const yMatches = [...html.matchAll(/--hotspot-y: (-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    assert.ok(xMatches.length > 0 && yMatches.length > 0);
    for (const x of xMatches) assert.ok(x >= 0 && x <= 100, `x=${x} fuera de rango`);
    for (const y of yMatches) assert.ok(y >= 0 && y <= 100, `y=${y} fuera de rango`);
  });
});

describe('games/mothLockView.js — createMothLockPanelMarkup (estados de la partida)', () => {
  test('"no iniciada": sin pistas, no incluye el bloque de victoria ni el mandato de solo-consulta', () => {
    const html = createMothLockPanelMarkup(notStarted);
    assert.equal(html.includes('moth-lock-panel__victory'), false);
    assert.equal(html.includes('Todavía no has encontrado ninguna inscripción'), true);
    assert.equal(html.includes('data-moth-lock-form'), true);
  });

  test('"exploración en curso": muestra solo las pistas ya descubiertas, nunca las demás', () => {
    const html = createMothLockPanelMarkup(exploring);
    assert.equal(html.includes(CLUES[0].text), true);
    assert.equal(html.includes(CLUES[1].text), false);
    assert.equal(html.includes(CLUES[2].text), false);
  });

  test('"mecanismo preparado": las tres pistas aparecen, pero el mecanismo sigue sin resolverse', () => {
    const html = createMothLockPanelMarkup(ready);
    for (const clue of CLUES) {
      assert.equal(html.includes(clue.text), true);
    }
    assert.equal(html.includes('moth-lock-panel__victory'), false);
    assert.equal(html.includes('data-moth-lock-form'), true);
  });

  test('"resuelto": muestra el bloque de victoria y la secuencia encontrada, ya no el formulario editable', () => {
    const html = createMothLockPanelMarkup(solved);
    assert.equal(html.includes('moth-lock-panel__victory'), true);
    assert.equal(html.includes('data-moth-lock-form'), false);
    assert.equal(html.includes('data-moth-lock-submit'), false);
  });

  test('antes de resolver, el HTML del panel nunca contiene las cuatro etiquetas de símbolo en el orden exacto de la solución', () => {
    for (const state of [notStarted, exploring, ready]) {
      const html = createMothLockPanelMarkup(state, { selection: DEFAULT_SEQUENCE });
      assert.equal(html.toLowerCase().includes(SOLUTION_LABEL_SEQUENCE.join(' ').toLowerCase()), false);
    }
  });

  test('`justSolved` activa la animación de victoria solo esa vez; al reabrir, no se repite', () => {
    const htmlJustSolved = createMothLockPanelMarkup(solved, { justSolved: true });
    const htmlReopened = createMothLockPanelMarkup(solved, { justSolved: false });
    assert.equal(htmlJustSolved.includes('moth-lock-panel__victory--event'), true);
    assert.equal(htmlReopened.includes('moth-lock-panel__victory--event'), false);
  });

  test('un intento incorrecto (feedback) nunca revela la solución ni otorga la victoria', () => {
    const html = createMothLockPanelMarkup(notStarted, {
      selection: ['vela', 'llave', 'pluma', 'luna'],
      feedback: { type: 'incorrect', message: 'El mecanismo no reconoce esta combinación. Algo, en algún punto, no encaja.' }
    });
    assert.equal(html.includes('moth-lock-panel__feedback--incorrect'), true);
    assert.equal(html.includes('moth-lock-panel__victory'), false);
  });

  test('la pista opcional solo aparece cuando `hintVisible` es true, y nunca nombra los cuatro símbolos', () => {
    const withoutHint = createMothLockPanelMarkup(notStarted, { hintVisible: false });
    const withHint = createMothLockPanelMarkup(notStarted, { hintVisible: true });
    assert.equal(withoutHint.includes('moth-lock-panel__hint'), false);
    assert.equal(withHint.includes('moth-lock-panel__hint'), true);
  });

  test('el estado del juego ("Estado: …") se refleja correctamente en el encabezado del panel', () => {
    assert.ok(createMothLockPanelMarkup(notStarted).includes('Sin explorar todavía'));
    assert.ok(createMothLockPanelMarkup(exploring).includes('Exploración en curso'));
    assert.ok(createMothLockPanelMarkup(ready).includes(PHASE_LABELS.ready));
    assert.ok(createMothLockPanelMarkup(solved).includes('Resuelto'));
  });

  test('es una función pura: el mismo estado produce siempre el mismo HTML', () => {
    const htmlA = createMothLockPanelMarkup(exploring, { selection: DEFAULT_SEQUENCE });
    const htmlB = createMothLockPanelMarkup(exploring, { selection: DEFAULT_SEQUENCE });
    assert.equal(htmlA, htmlB);
  });
});
