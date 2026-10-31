import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, levenshteinDistance, validateRiddleAnswer } from '../../src/calendar/riddleValidator.js';

const snitchRiddle = {
  canonicalAnswer: 'La Snitch Dorada',
  acceptedVariants: ['snitch dorada', 'la snitch', 'snitch de oro', 'snitch']
};

describe('calendar/riddleValidator.js — normalización', () => {
  test('ignora mayúsculas y minúsculas', () => {
    assert.equal(normalizeAnswer('SNITCH DORADA'), normalizeAnswer('snitch dorada'));
  });

  test('ignora tildes y diacríticos', () => {
    assert.equal(normalizeAnswer('Profecía'), normalizeAnswer('Profecia'));
    assert.equal(normalizeAnswer('Saúco'), normalizeAnswer('Sauco'));
  });

  test('recorta espacios al principio y al final, y colapsa espacios repetidos', () => {
    assert.equal(normalizeAnswer('   snitch   dorada   '), 'snitch dorada');
  });

  test('una entrada que no es texto se normaliza a cadena vacía, sin reventar', () => {
    assert.equal(normalizeAnswer(null), '');
    assert.equal(normalizeAnswer(undefined), '');
    assert.equal(normalizeAnswer(42), '');
  });
});

describe('calendar/riddleValidator.js — levenshteinDistance', () => {
  test('cadenas iguales tienen distancia 0', () => {
    assert.equal(levenshteinDistance('snitch', 'snitch'), 0);
  });

  test('un carácter de diferencia da distancia 1', () => {
    assert.equal(levenshteinDistance('snitch dorada', 'snich dorada'), 1);
  });

  test('palabras completamente distintas tienen una distancia grande', () => {
    assert.ok(levenshteinDistance('snitch dorada', 'pelota') > 5);
  });
});

describe('calendar/riddleValidator.js — validateRiddleAnswer', () => {
  test('una entrada vacía (o solo espacios) se reporta como "empty", no como incorrecta', () => {
    assert.deepEqual(validateRiddleAnswer('', snitchRiddle), { status: 'empty' });
    assert.deepEqual(validateRiddleAnswer('   ', snitchRiddle), { status: 'empty' });
  });

  test('la respuesta canónica exacta es correcta', () => {
    assert.deepEqual(validateRiddleAnswer('La Snitch Dorada', snitchRiddle), { status: 'correct' });
  });

  test('mayúsculas, tildes y espacios distintos no impiden una respuesta correcta', () => {
    assert.deepEqual(validateRiddleAnswer('  LA SNITCH   DORADA  ', snitchRiddle), { status: 'correct' });
  });

  test('una variante autorizada explícitamente es correcta', () => {
    assert.deepEqual(validateRiddleAnswer('snitch de oro', snitchRiddle), { status: 'correct' });
    assert.deepEqual(validateRiddleAnswer('la snitch', snitchRiddle), { status: 'correct' });
  });

  test('un error tipográfico menor (un carácter) se acepta', () => {
    assert.deepEqual(validateRiddleAnswer('snich dorada', snitchRiddle), { status: 'correct' });
  });

  test('una respuesta genérica/vaga se rechaza', () => {
    assert.deepEqual(validateRiddleAnswer('pelota', snitchRiddle), { status: 'incorrect' });
    assert.deepEqual(validateRiddleAnswer('una bola dorada', snitchRiddle), { status: 'incorrect' });
  });

  test('una respuesta de otra categoría (otro objeto real del universo) se rechaza', () => {
    assert.deepEqual(validateRiddleAnswer('el mapa del merodeador', snitchRiddle), { status: 'incorrect' });
  });

  test('compartir solo una palabra del nombre no basta para aceptarse', () => {
    const giratiempoRiddle = { canonicalAnswer: 'El Giratiempo', acceptedVariants: [] };
    assert.deepEqual(validateRiddleAnswer('tiempo', giratiempoRiddle), { status: 'incorrect' });
  });

  test('palabras cortas y distintas no se confunden aunque estén a poca distancia de edición', () => {
    // "capa" y "mapa" están a distancia 1, pero son objetos distintos:
    // con 4 caracteres o menos no hay tolerancia a typos.
    const capaRiddle = { canonicalAnswer: 'La Capa de Invisibilidad', acceptedVariants: ['capa'] };
    assert.deepEqual(validateRiddleAnswer('mapa', capaRiddle), { status: 'incorrect' });
  });

  test('no basta con estar "cerca" en distancia de edición si la longitud es muy distinta', () => {
    // Añadir/quitar muchos caracteres no debe colarse solo por quedar
    // dentro de un umbral calculado sobre la cadena más corta.
    const riddle = { canonicalAnswer: 'La Varita de Saúco', acceptedVariants: [] };
    assert.deepEqual(validateRiddleAnswer('la varita', riddle), { status: 'incorrect' });
  });

  test('nunca revela información adicional sobre qué tan cerca estuvo una respuesta incorrecta', () => {
    const result = validateRiddleAnswer('algo completamente distinto', snitchRiddle);
    assert.deepEqual(Object.keys(result), ['status']);
  });

  test('un acertijo sin respuesta canónica válida nunca revienta', () => {
    assert.deepEqual(validateRiddleAnswer('cualquier cosa', {}), { status: 'incorrect' });
    assert.deepEqual(validateRiddleAnswer('cualquier cosa', null), { status: 'incorrect' });
  });
});
