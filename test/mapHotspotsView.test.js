import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createMapHotspotsMarkup, isLocationUnlocked, resolveFlavorText } from '../src/data/mapHotspotsView.js';
import { MAP_LOCATIONS } from '../src/data/mapLocations.js';

const lockedAmbient = {
  id: 'prueba-ambient',
  label: 'Un rincón oculto',
  kind: 'ambient',
  target: null,
  unlockAfterDay: 9,
  position: { desktop: { x: 20, y: 30 }, mobile: { x: 15, y: 25 } },
  flavorText: 'Un secreto todavía por descubrir, con más de veinte caracteres.'
};

const navigateLocation = {
  id: 'prueba-navigate',
  label: 'Una puerta hacia otro lugar',
  kind: 'navigate',
  target: 'biblioteca',
  unlockAfterDay: null,
  position: { desktop: { x: 60, y: 40 }, mobile: { x: 55, y: 45 } },
  flavorText: null
};

const lockedNavigate = {
  ...navigateLocation,
  id: 'prueba-navigate-bloqueada',
  unlockAfterDay: 13
};

const specialCharsLocation = {
  id: 'prueba-especiales',
  label: 'El retrato de "la Dama" & su marco <dorado>',
  kind: 'ambient',
  target: null,
  unlockAfterDay: null,
  position: { desktop: { x: 10, y: 10 }, mobile: { x: 10, y: 10 } },
  flavorText: 'Dice "bienvenida" & guarda un secreto <importante> sobre el pasado.'
};

describe('data/mapHotspotsView.js — isLocationUnlocked', () => {
  test('un lugar sin unlockAfterDay siempre está desbloqueado', () => {
    assert.equal(isLocationUnlocked(navigateLocation, new Set()), true);
    assert.equal(isLocationUnlocked(navigateLocation, new Set([1, 2, 3])), true);
  });

  test('un lugar con unlockAfterDay solo se desbloquea si ese día está en el set', () => {
    assert.equal(isLocationUnlocked(lockedAmbient, new Set()), false);
    assert.equal(isLocationUnlocked(lockedAmbient, new Set([1, 5])), false);
    assert.equal(isLocationUnlocked(lockedAmbient, new Set([9])), true);
  });

  test('sin segundo argumento, se asume que nada está resuelto', () => {
    assert.equal(isLocationUnlocked(lockedAmbient), false);
  });

  test('un lugar con `unlockFlag` ignora por completo `unlockAfterDay`/`unlockedDays`: solo mira la bandera', () => {
    const flaggedLocation = { ...lockedAmbient, id: 'prueba-flag', unlockAfterDay: null, unlockFlag: 'miBandera' };
    assert.equal(isLocationUnlocked(flaggedLocation, new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])), false);
    assert.equal(isLocationUnlocked(flaggedLocation, new Set(), { miBandera: false }), false);
    assert.equal(isLocationUnlocked(flaggedLocation, new Set(), { miBandera: true }), true);
  });

  test('sin tercer argumento, un lugar con `unlockFlag` se trata como bloqueado (ninguna bandera activa por defecto)', () => {
    const flaggedLocation = { ...lockedAmbient, id: 'prueba-flag-2', unlockFlag: 'otraBandera' };
    assert.equal(isLocationUnlocked(flaggedLocation, new Set([9])), false);
  });
});

describe('data/mapHotspotsView.js — createMapHotspotsMarkup (estado bloqueado/desbloqueado)', () => {
  test('sin lugares, no genera marcado', () => {
    assert.equal(createMapHotspotsMarkup([]), '');
    assert.equal(createMapHotspotsMarkup(undefined), '');
  });

  test('un lugar bloqueado: tiene `disabled`, la clase `--locked`, y un aria-label que avisa sin revelar nada', () => {
    const html = createMapHotspotsMarkup([lockedAmbient], new Set());
    assert.ok(html.includes('disabled'));
    assert.ok(html.includes('map-hotspot--locked'));
    assert.ok(html.includes('todavía bloqueado'));
  });

  test('un lugar bloqueado NUNCA incluye su destino de navegación ni su contenido ambiental en el HTML', () => {
    const htmlAmbient = createMapHotspotsMarkup([lockedAmbient], new Set());
    assert.equal(htmlAmbient.includes('data-flavor-text'), false);
    assert.equal(htmlAmbient.includes(lockedAmbient.flavorText), false);

    const htmlNavigate = createMapHotspotsMarkup([lockedNavigate], new Set());
    assert.equal(htmlNavigate.includes('data-goto'), false);
  });

  test('un lugar desbloqueado: sin `disabled`, sin la clase `--locked`, con su etiqueta real en el aria-label', () => {
    const html = createMapHotspotsMarkup([lockedAmbient], new Set([9]));
    assert.equal(html.includes('disabled'), false);
    assert.equal(html.includes('map-hotspot--locked'), false);
    assert.ok(html.includes(`aria-label="${lockedAmbient.label}"`));
  });

  test('un lugar "navigate" desbloqueado incluye `data-goto` con el destino correcto', () => {
    const html = createMapHotspotsMarkup([navigateLocation], new Set());
    assert.ok(html.includes(`data-goto="${navigateLocation.target}"`));
  });

  test('un lugar "ambient" desbloqueado incluye su `data-flavor-text`', () => {
    const html = createMapHotspotsMarkup([lockedAmbient], new Set([9]));
    assert.ok(html.includes(`data-flavor-text="${lockedAmbient.flavorText}"`));
  });

  test('un lugar "navigate" nunca lleva `data-flavor-text`, esté o no bloqueado', () => {
    assert.equal(createMapHotspotsMarkup([navigateLocation], new Set()).includes('data-flavor-text'), false);
    assert.equal(createMapHotspotsMarkup([lockedNavigate], new Set()).includes('data-flavor-text'), false);
  });
});

describe('data/mapHotspotsView.js — posiciones responsive', () => {
  test('cada hotspot define variables CSS de posición para escritorio y para móvil', () => {
    const html = createMapHotspotsMarkup([navigateLocation], new Set());
    assert.ok(html.includes('--hotspot-x: 60%'));
    assert.ok(html.includes('--hotspot-y: 40%'));
    assert.ok(html.includes('--hotspot-x-mobile: 55%'));
    assert.ok(html.includes('--hotspot-y-mobile: 45%'));
  });
});

const stagedLocation = {
  id: 'prueba-staged',
  label: 'Un objeto que cambia',
  kind: 'ambient',
  target: null,
  unlockAfterDay: null,
  position: { desktop: { x: 40, y: 40 }, mobile: { x: 40, y: 40 } },
  flavorText: null,
  flavorStages: [
    { afterDay: null, text: 'Etapa base, siempre visible, con más de veinte caracteres.' },
    { afterDay: 4, text: 'Etapa del día 4, con más de veinte caracteres también.' },
    { afterDay: 8, text: 'Etapa del día 8, con más de veinte caracteres también.' }
  ]
};

describe('data/mapHotspotsView.js — resolveFlavorText (contenido que evoluciona con el progreso)', () => {
  test('un lugar simple (sin flavorStages) siempre devuelve su flavorText', () => {
    assert.equal(resolveFlavorText(lockedAmbient, new Set([9])), lockedAmbient.flavorText);
  });

  test('sin ningún día resuelto, se usa la etapa base (afterDay: null)', () => {
    assert.equal(resolveFlavorText(stagedLocation, new Set()), stagedLocation.flavorStages[0].text);
  });

  test('se usa la ÚLTIMA etapa alcanzada, no todas las que ya se cumplen', () => {
    assert.equal(resolveFlavorText(stagedLocation, new Set([4])), stagedLocation.flavorStages[1].text);
    assert.equal(resolveFlavorText(stagedLocation, new Set([4, 8])), stagedLocation.flavorStages[2].text);
  });

  test('una etapa futura nunca se usa antes de que su día esté resuelto', () => {
    assert.notEqual(resolveFlavorText(stagedLocation, new Set([1, 2, 3])), stagedLocation.flavorStages[2].text);
    assert.equal(resolveFlavorText(stagedLocation, new Set([1, 2, 3])), stagedLocation.flavorStages[0].text);
  });

  test('resolver dos veces con el mismo progreso (simulando una recarga) da siempre el mismo resultado', () => {
    const progress = new Set([4]);
    assert.equal(resolveFlavorText(stagedLocation, progress), resolveFlavorText(stagedLocation, progress));
  });

  test('el marcado del hotspot nunca incluye el texto de una etapa futura', () => {
    const html = createMapHotspotsMarkup([stagedLocation], new Set([4]));
    assert.equal(html.includes(stagedLocation.flavorStages[2].text), false);
    assert.ok(html.includes(stagedLocation.flavorStages[1].text));
  });
});

describe('data/mapHotspotsView.js — contenido escapado', () => {
  test('comillas, `&` y `<`/`>` en label y flavorText se escapan y no rompen el marcado', () => {
    const html = createMapHotspotsMarkup([specialCharsLocation], new Set());
    assert.equal(html.includes('<dorado>'), false);
    assert.equal(html.includes('"la Dama"'), false);
    assert.ok(html.includes('&lt;dorado&gt;'));
    assert.ok(html.includes('&quot;la Dama&quot;'));
    assert.ok(html.includes('&amp;'));
    assert.ok(html.includes('&lt;importante&gt;'));
  });
});

describe('data/mapHotspotsView.js — integración con MAP_LOCATIONS real', () => {
  test('genera marcado válido para los lugares reales sin lanzar errores', () => {
    const html = createMapHotspotsMarkup(MAP_LOCATIONS, new Set());
    for (const location of MAP_LOCATIONS) {
      assert.ok(html.includes(`data-map-hotspot="${location.id}"`), `falta el hotspot de "${location.id}"`);
    }
  });

  test('con todos los días resueltos y todas las banderas de descubrimiento activas, ningún lugar real queda bloqueado', () => {
    const allDays = new Set(Array.from({ length: 15 }, (_, i) => i + 1));
    // Desde esta fase, no todos los lugares se desbloquean por fecha:
    // `eco-del-libro` usa `unlockFlag` (ver `mapHotspotsView.isLocationUnlocked`),
    // así que hace falta activar también las banderas reales para que
    // esta prueba siga demostrando lo que dice demostrar.
    const allFlags = { bookDiscovered: true };
    const html = createMapHotspotsMarkup(MAP_LOCATIONS, allDays, allFlags);
    assert.equal(html.includes('map-hotspot--locked'), false);
    assert.equal(html.includes('disabled'), false);
  });

  test('con todos los días resueltos pero SIN las banderas de descubrimiento, un lugar gateado por bandera sigue bloqueado', () => {
    const allDays = new Set(Array.from({ length: 15 }, (_, i) => i + 1));
    const ecoDelLibro = MAP_LOCATIONS.find((location) => location.id === 'eco-del-libro');
    assert.ok(ecoDelLibro, 'se esperaba que el lugar "eco-del-libro" existiera en MAP_LOCATIONS');
    assert.equal(isLocationUnlocked(ecoDelLibro, allDays), false);
    assert.equal(isLocationUnlocked(ecoDelLibro, allDays, { bookDiscovered: true }), true);
  });
});
