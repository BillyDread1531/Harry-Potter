import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isMothVisibleInBiblioteca,
  isMothVisibleInSala,
  isArchiveChestAwake,
  isExceptionalMothOmenReady
} from '../../src/calendar/castleEvents.js';

describe('calendar/castleEvents.js — sucesos persistentes ligados al progreso', () => {
  test('nada aparece sin progreso', () => {
    assert.equal(isMothVisibleInBiblioteca(new Set()), false);
    assert.equal(isMothVisibleInSala(new Set()), false);
    assert.equal(isArchiveChestAwake(new Set()), false);
    assert.equal(isExceptionalMothOmenReady(new Set()), false);
  });

  test('ningún suceso se adelanta a su día: resolver otros días no lo activa', () => {
    const otrosDias = new Set([1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 14, 15]);
    assert.equal(isMothVisibleInBiblioteca(otrosDias), false, 'no debería activarse sin el día 4');
    assert.equal(isMothVisibleInSala(otrosDias), false, 'no debería activarse sin el día 13');
    assert.equal(isArchiveChestAwake(otrosDias), false, 'no debería activarse sin el día 12');
    assert.equal(isExceptionalMothOmenReady(otrosDias), false, 'no debería activarse sin el día 13');
  });

  test('la polilla aparece en la Biblioteca exactamente al resolver el día 4', () => {
    assert.equal(isMothVisibleInBiblioteca(new Set([4])), true);
  });

  test('la polilla aparece en la Sala de los Menesteres exactamente al resolver el día 13', () => {
    assert.equal(isMothVisibleInSala(new Set([13])), true);
  });

  test('el cofre del Archivo se despierta exactamente al resolver el día 12', () => {
    assert.equal(isArchiveChestAwake(new Set([12])), true);
  });

  test('el presagio excepcional está listo exactamente al resolver el día 13 (Acto IV), igual que la polilla de la sala', () => {
    assert.equal(isExceptionalMothOmenReady(new Set([13])), true);
  });

  test('con undefined/null en vez de un Set, no revienta y devuelve false', () => {
    assert.equal(isMothVisibleInBiblioteca(undefined), false);
    assert.equal(isMothVisibleInSala(null), false);
    assert.equal(isArchiveChestAwake(undefined), false);
    assert.equal(isExceptionalMothOmenReady(undefined), false);
  });

  test('el estado es estable: volver a evaluar el mismo progreso (como tras recargar) da el mismo resultado', () => {
    const progress = new Set([1, 2, 3, 4, 12]);
    assert.equal(isMothVisibleInBiblioteca(progress), isMothVisibleInBiblioteca(new Set(progress)));
    assert.equal(isArchiveChestAwake(progress), isArchiveChestAwake(new Set(progress)));
  });
});
