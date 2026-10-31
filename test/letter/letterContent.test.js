import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LETTER_PARAGRAPHS, INSTRUCTIONS_ITEMS } from '../../src/letter/letterContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

const allText = [...LETTER_PARAGRAPHS, ...INSTRUCTIONS_ITEMS.flatMap((item) => [item.title, item.body])]
  .join(' ')
  .toLowerCase();

describe('letter/letterContent.js — la carta y las instrucciones no filtran nada', () => {
  test('la carta tiene varios párrafos reales, ninguno vacío', () => {
    assert.ok(LETTER_PARAGRAPHS.length >= 5);
    for (const paragraph of LETTER_PARAGRAPHS) {
      assert.ok(paragraph.trim().length > 10);
    }
  });

  test('las instrucciones cubren los siete puntos pedidos', () => {
    const expectedTitles = [
      'Calendario',
      'Acertijos',
      'Progreso',
      'Exploración',
      'Cromos',
      'Misterio central',
      'Persistencia'
    ];
    assert.deepEqual(
      INSTRUCTIONS_ITEMS.map((item) => item.title),
      expectedTitles
    );
  });

  test('no mencionan el Pensadero en ningún punto', () => {
    assert.equal(allText.includes('pensadero'), false);
  });

  test('no mencionan el cumpleaños como explicación de la aventura', () => {
    assert.equal(allText.includes('cumplea'), false);
  });

  test('no revelan la respuesta canónica de ningún expediente', () => {
    // Excepción deliberada y acotada: el día 2 (Rana de chocolate) es
    // también el nombre ya aprobado de la colección de cromos ("Cromos
    // de Rana de Chocolate"), que las instrucciones deben nombrar
    // explícitamente por pedido directo de una fase anterior. No es una
    // filtración: el nombre de la colección no ayuda a resolver el
    // acertijo del día 2, que sigue sin mencionarse en el cuerpo del
    // propio expediente. La carta y las instrucciones son visibles
    // desde antes de resolver nada, así que el umbral es 0 (todos los
    // quince días cuentan como "futuro").
    const exceptions = new Map([[2, 'nombre ya aprobado de la colección de cromos, no ayuda a resolver el día 2']]);
    assertNoFutureAnswerLeak(allText, 0, { context: 'carta + instrucciones', exceptions });
  });
});
