import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolveNavigationIntent } from '../src/navigation/navigationIntent.js';

describe('navigation/navigationIntent.js', () => {
  test('si hay una transición en curso, siempre se encola (nunca se inicia una segunda)', () => {
    const result = resolveNavigationIntent({
      requestedId: 'biblioteca',
      currentId: 'vestibulo',
      isTransitionRunning: true
    });
    assert.deepEqual(result, { action: 'queue' });
  });

  test('se encola incluso si el destino pedido es el mismo que el actual, mientras haya una transición activa', () => {
    // Caso real: una transición A->B está en curso (currentId todavía es A,
    // porque el swap ocurre a mitad de la transición) y llega una petición
    // de volver a A. No hay que ignorarla: hay que recordarla para después.
    const result = resolveNavigationIntent({
      requestedId: 'vestibulo',
      currentId: 'vestibulo',
      isTransitionRunning: true
    });
    assert.deepEqual(result, { action: 'queue' });
  });

  test('sin transición en curso, pedir la escena actual no hace nada', () => {
    const result = resolveNavigationIntent({
      requestedId: 'vestibulo',
      currentId: 'vestibulo',
      isTransitionRunning: false
    });
    assert.deepEqual(result, { action: 'noop' });
  });

  test('sin transición en curso, pedir una escena distinta inicia la transición', () => {
    const result = resolveNavigationIntent({
      requestedId: 'biblioteca',
      currentId: 'vestibulo',
      isTransitionRunning: false
    });
    assert.deepEqual(result, { action: 'transition' });
  });
});
