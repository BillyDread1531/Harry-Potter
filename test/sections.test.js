import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SECTIONS, DEFAULT_SECTION_ID, getSectionById, isReachable } from '../src/data/sections.js';

describe('data/sections.js', () => {
  test('el vestíbulo es la sección por defecto y es alcanzable', () => {
    assert.equal(DEFAULT_SECTION_ID, 'vestibulo');
    assert.equal(isReachable(DEFAULT_SECTION_ID), true);
  });

  test('las seis escenas fotográficas son alcanzables', () => {
    const reachableScenes = ['vestibulo', 'biblioteca', 'expedientes', 'mapa', 'desafios', 'archivo'];
    for (const id of reachableScenes) {
      assert.equal(isReachable(id), true, `"${id}" debería ser alcanzable`);
      assert.ok(getSectionById(id), `"${id}" debería existir en SECTIONS`);
    }
  });

  test('el Pensadero solo es alcanzable a partir del 15 de noviembre a las 20:00 (Guatemala)', () => {
    assert.ok(getSectionById('pensadero'));
    assert.equal(isReachable('pensadero', new Date('2026-11-16T01:59:59.000Z')), false); // 19:59 Guatemala (UTC-6)
    assert.equal(isReachable('pensadero', new Date('2026-11-16T02:00:00.000Z')), true); // 20:00 Guatemala
  });

  test('un id inexistente no es alcanzable y no revienta', () => {
    assert.equal(isReachable('sala-que-no-existe'), false);
    assert.equal(getSectionById('sala-que-no-existe'), undefined);
  });

  test('un id vacío o indefinido no es alcanzable', () => {
    assert.equal(isReachable(''), false);
    assert.equal(isReachable(undefined), false);
  });

  test('cada sección declarada tiene id y title únicos', () => {
    const ids = SECTIONS.map((section) => section.id);
    const uniqueIds = new Set(ids);
    assert.equal(uniqueIds.size, ids.length, 'no debería haber ids repetidos en SECTIONS');

    for (const section of SECTIONS) {
      assert.ok(section.title && section.title.length > 0, `"${section.id}" debe tener title`);
    }
  });
});
