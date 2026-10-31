import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MAP_LOCATIONS, getMapLocationById } from '../src/data/mapLocations.js';
import { isReachable } from '../src/data/sections.js';
import { isValidDay } from '../src/calendar/calendarEngine.js';
import { RIDDLES } from '../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from './helpers/leakCheck.js';

function isPercent(value) {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

describe('data/mapLocations.js — integridad de los lugares del mapa', () => {
  test('existe al menos un lugar y todos tienen un id único', () => {
    assert.ok(MAP_LOCATIONS.length > 0);
    const ids = MAP_LOCATIONS.map((loc) => loc.id);
    assert.equal(new Set(ids).size, ids.length, 'no debería haber ids repetidos');
  });

  test('cada lugar tiene una etiqueta no vacía', () => {
    for (const location of MAP_LOCATIONS) {
      assert.ok(location.label?.length > 0, `lugar ${location.id}: label`);
    }
  });

  test('cada lugar declara un `kind` reconocido', () => {
    for (const location of MAP_LOCATIONS) {
      assert.ok(['ambient', 'navigate'].includes(location.kind), `lugar ${location.id}: kind inválido`);
    }
  });

  test('los lugares "navigate" apuntan a una sección alcanzable distinta del propio mapa', () => {
    for (const location of MAP_LOCATIONS.filter((loc) => loc.kind === 'navigate')) {
      assert.ok(location.target, `lugar ${location.id}: target vacío`);
      assert.notEqual(location.target, 'mapa', `lugar ${location.id}: no debería apuntar al propio mapa`);
      assert.equal(isReachable(location.target), true, `lugar ${location.id}: target "${location.target}" no es alcanzable`);
    }
  });

  test('los lugares "ambient" no tienen target y sí contenido ambiental real (flavorText o flavorStages)', () => {
    for (const location of MAP_LOCATIONS.filter((loc) => loc.kind === 'ambient')) {
      assert.equal(location.target, null, `lugar ${location.id}: un lugar ambient no debería tener target`);
      if (location.flavorStages) {
        assert.ok(location.flavorStages.length > 0, `lugar ${location.id}: flavorStages vacío`);
        for (const stage of location.flavorStages) {
          assert.ok(stage.text?.length > 20, `lugar ${location.id}: una etapa tiene texto vacío o demasiado corto`);
        }
      } else {
        assert.ok(location.flavorText?.length > 20, `lugar ${location.id}: flavorText vacío o demasiado corto`);
      }
    }
  });

  test('`flavorStages` siempre empieza en `afterDay: null` y queda en orden ascendente sin repetir día', () => {
    for (const location of MAP_LOCATIONS.filter((loc) => loc.flavorStages)) {
      const stages = location.flavorStages;
      assert.equal(stages[0].afterDay, null, `lugar ${location.id}: la primera etapa debería ser la base (afterDay: null)`);

      const afterDays = stages.slice(1).map((s) => s.afterDay);
      for (const day of afterDays) {
        assert.ok(isValidDay(day), `lugar ${location.id}: afterDay inválido (${day})`);
      }
      const sorted = [...afterDays].sort((a, b) => a - b);
      assert.deepEqual(afterDays, sorted, `lugar ${location.id}: las etapas deberían estar en orden ascendente`);
      assert.equal(new Set(afterDays).size, afterDays.length, `lugar ${location.id}: no debería repetir el mismo afterDay`);
    }
  });

  test('los lugares "navigate" no tienen flavorText propio (no duplican contenido)', () => {
    for (const location of MAP_LOCATIONS.filter((loc) => loc.kind === 'navigate')) {
      assert.equal(location.flavorText, null, `lugar ${location.id}: un lugar navigate no debería tener flavorText`);
    }
  });

  test('cada lugar tiene posición válida (0-100) para escritorio y para móvil', () => {
    for (const location of MAP_LOCATIONS) {
      assert.ok(isPercent(location.position?.desktop?.x), `lugar ${location.id}: desktop.x`);
      assert.ok(isPercent(location.position?.desktop?.y), `lugar ${location.id}: desktop.y`);
      assert.ok(isPercent(location.position?.mobile?.x), `lugar ${location.id}: mobile.x`);
      assert.ok(isPercent(location.position?.mobile?.y), `lugar ${location.id}: mobile.y`);
    }
  });

  test('`unlockAfterDay` es null o un día válido del calendario (1-15)', () => {
    for (const location of MAP_LOCATIONS) {
      const value = location.unlockAfterDay;
      assert.ok(value === null || isValidDay(value), `lugar ${location.id}: unlockAfterDay inválido (${value})`);
    }
  });

  test('getMapLocationById encuentra un lugar existente y devuelve null si no existe', () => {
    assert.equal(getMapLocationById('mesa-pergamino')?.kind, 'ambient');
    assert.equal(getMapLocationById('no-existe'), null);
  });

  test('ningún label, flavorText ni etapa de flavorStages revela la respuesta canónica de ningún expediente', () => {
    const texts = MAP_LOCATIONS.flatMap((loc) => [
      loc.label,
      loc.flavorText,
      ...(loc.flavorStages?.map((stage) => stage.text) ?? [])
    ].filter(Boolean)).map((t) => t.toLowerCase());
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const text of texts) {
        assert.equal(text.includes(bareAnswer), false, `un texto del mapa menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
  });

  // Más preciso que la prueba de arriba: cada lugar (o, en el caso del
  // pergamino, cada ETAPA dentro de `flavorStages`) se vuelve visible
  // en un momento concreto del progreso real, no "en algún punto
  // indefinido". Un lugar con `unlockAfterDay: null` es explorable
  // desde el principio (nada es "pasado" todavía, así que se compara
  // contra los quince días); una etapa con `afterDay: N` es visible
  // justo al resolver el día N.
  test('ningún lugar (ni ninguna etapa de flavorStages) revela una respuesta futura ANTES de que sea visible', () => {
    for (const location of MAP_LOCATIONS) {
      if (location.flavorStages) {
        for (const stage of location.flavorStages) {
          const visibleAfterDay = stage.afterDay ?? 0;
          assertNoFutureAnswerLeak(stage.text, visibleAfterDay, {
            context: `lugar "${location.id}", etapa afterDay=${stage.afterDay}`
          });
        }
        continue;
      }
      const visibleAfterDay = location.unlockAfterDay ?? 0;
      assertNoFutureAnswerLeak(location.flavorText, visibleAfterDay, { context: `lugar "${location.id}"` });
      assertNoFutureAnswerLeak(location.label, visibleAfterDay, { context: `label del lugar "${location.id}"` });
    }
  });
});
