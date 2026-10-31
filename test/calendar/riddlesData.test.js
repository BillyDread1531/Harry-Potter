import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { RIDDLES, getRiddleForDay, getEarnedFragments } from '../../src/calendar/riddlesData.js';
import { getExpedienteDays, getCalendarState } from '../../src/calendar/calendarEngine.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

const FINAL_MESSAGE =
  'Entre tantas señales, el castillo no elige por ti — solo te muestra caminos. ' +
  'Yo elegí uno, hace tiempo, sin mapa ni hechizo que lo garantizara. ' +
  'Cada prueba que superamos dejó una marca, como esta, pequeña pero real. ' +
  'No necesito una profecía para saber que el lugar que más quiero es a tu lado.';

// La lista definitiva, aprobada por el propietario del proyecto.
// Cualquier cambio de objeto o de orden en este archivo debe reflejar
// un cambio deliberado de esa lista, no una sustitución accidental.
const EXPECTED_ANSWERS = {
  1: 'Carta de Hogwarts',
  2: 'Rana de chocolate',
  3: 'Sombrero Seleccionador',
  4: 'Snitch dorada',
  5: 'Mapa del Merodeador',
  6: 'Capa de invisibilidad',
  7: 'Amortentia',
  8: 'Patronus',
  9: 'Lumos',
  10: 'Diadema de Ravenclaw',
  11: 'Calcetín de Dobby',
  12: 'Reliquias de la Muerte',
  13: 'Sala de los Menesteres',
  14: 'Espejo de Oesed',
  15: 'Pensadero'
};

const EXPECTED_GIFTS = {
  1: 'Carta personalizada de Hogwarts.',
  2: 'Caja de ranas de chocolate y grageas de todos los sabores.',
  3: 'Playera personalizada del Sombrero Seleccionador.',
  4: 'Llavero u ornamento dorado inspirado en la Snitch.',
  5: 'Taza sublimada inspirada en el Mapa del Merodeador.',
  6: 'Toalla facial personalizada.',
  7: 'Vela o perfume con etiqueta personalizada.',
  8: 'Taza con Teo representado como un perro plateado, inspirado en un Patronus.',
  9: 'Lámpara de frasco con luces LED.',
  10: 'Diadema o banda para el cabello.',
  11: 'Calcetines inspirados en Dobby.',
  12: 'Separador de libros con la forma del símbolo de las Reliquias de la Muerte (triángulo, círculo y línea).',
  13: 'Cojín o almohada inspirada en Ravenclaw.',
  14: 'Espejo o marco con una fotografía de la pareja.',
  15: 'Álbum de fotografías y experiencia final de recuerdos compartidos.'
};

describe('calendar/riddlesData.js — integridad de los quince acertijos', () => {
  test('existen exactamente quince acertijos, con identificadores de día únicos', () => {
    assert.equal(RIDDLES.length, 15);
    const days = RIDDLES.map((r) => r.day).sort((a, b) => a - b);
    assert.deepEqual(days, getExpedienteDays());
  });

  test('cada día tiene exactamente la respuesta canónica acordada en la lista definitiva', () => {
    for (const [day, expectedAnswer] of Object.entries(EXPECTED_ANSWERS)) {
      const riddle = getRiddleForDay(Number(day));
      assert.ok(riddle, `día ${day} debería existir`);
      assert.equal(riddle.canonicalAnswer, expectedAnswer, `día ${day}`);
    }
  });

  test('el día 1 corresponde a la Carta de Hogwarts (no al Sombrero Seleccionador)', () => {
    assert.equal(getRiddleForDay(1).canonicalAnswer, 'Carta de Hogwarts');
  });

  test('el día 3 corresponde al Sombrero Seleccionador', () => {
    assert.equal(getRiddleForDay(3).canonicalAnswer, 'Sombrero Seleccionador');
  });

  test('el día 15 corresponde al Pensadero, no a la Profecía', () => {
    assert.equal(getRiddleForDay(15).canonicalAnswer, 'Pensadero');
    assert.notEqual(getRiddleForDay(15).canonicalAnswer, 'La Profecía');
  });

  test('el día 12 corresponde a las Reliquias de la Muerte, no al bolso de Hermione', () => {
    assert.equal(getRiddleForDay(12).canonicalAnswer, 'Reliquias de la Muerte');
    assert.notEqual(getRiddleForDay(12).canonicalAnswer, 'Bolso encantado de Hermione');
  });

  test('el acertijo del día 12 no nombra el símbolo ni enumera sus tres objetos directamente', () => {
    const body = getRiddleForDay(12).body.toLowerCase();
    for (const forbidden of ['reliquia', 'varita de sauco', 'piedra de la resurreccion', 'capa de invisibilidad']) {
      const normalized = forbidden.normalize('NFD').replace(/[̀-ͯ]/g, '');
      assert.equal(
        body.normalize('NFD').replace(/[̀-ͯ]/g, '').includes(normalized),
        false,
        `el cuerpo del día 12 no debería mencionar "${forbidden}"`
      );
    }
  });

  test('ningún día usa los objetos retirados de la versión anterior (Giratiempo, Piedra Filosofal, Piedra de la Resurrección, Varita de Saúco, Profecía)', () => {
    const retired = ['giratiempo', 'piedra filosofal', 'piedra de la resurreccion', 'varita de sauco', 'profecia'];
    for (const riddle of RIDDLES) {
      const normalized = riddle.canonicalAnswer
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
      assert.equal(retired.includes(normalized), false, `día ${riddle.day} (${riddle.canonicalAnswer}) debería haberse retirado`);
    }
  });

  test('cada día tiene el regalo planeado acordado en la lista definitiva', () => {
    for (const [day, expectedGift] of Object.entries(EXPECTED_GIFTS)) {
      const riddle = getRiddleForDay(Number(day));
      assert.equal(riddle.plannedGift, expectedGift, `día ${day}`);
    }
  });

  test('todas las respuestas canónicas son cadenas no vacías y distintas entre sí', () => {
    const answers = RIDDLES.map((r) => r.canonicalAnswer);
    for (const answer of answers) {
      assert.equal(typeof answer, 'string');
      assert.ok(answer.trim().length > 0);
    }
    assert.equal(new Set(answers.map((a) => a.toLowerCase())).size, answers.length);
  });

  test('cada acertijo tiene título interno, marca de archivo, cuerpo, explicación, referencia, regalo y fragmento', () => {
    for (const riddle of RIDDLES) {
      assert.ok(riddle.title?.length > 0, `día ${riddle.day}: título`);
      assert.ok(riddle.caseLabel?.length > 0, `día ${riddle.day}: caseLabel`);
      assert.ok(riddle.body?.length > 0, `día ${riddle.day}: cuerpo`);
      assert.ok(riddle.explanation?.length > 0, `día ${riddle.day}: explicación`);
      assert.ok(riddle.filmReference?.length > 0, `día ${riddle.day}: referencia de película`);
      assert.ok(riddle.plannedGift?.length > 0, `día ${riddle.day}: regalo planeado`);
      assert.ok(riddle.fragment?.length > 0, `día ${riddle.day}: fragmento`);
      assert.ok(riddle.reactions?.correct?.length > 0, `día ${riddle.day}: mensaje de éxito`);
      assert.ok(riddle.reactions?.incorrect?.length > 0, `día ${riddle.day}: mensaje de error`);
    }
  });

  test('cada acertijo tiene un capítulo narrativo (revelado solo tras resolver)', () => {
    for (const riddle of RIDDLES) {
      assert.ok(riddle.chapter?.length > 0, `día ${riddle.day}: chapter`);
    }
  });

  test('ningún capítulo revela el cumpleaños como explicación de la aventura (todavía)', () => {
    for (const riddle of RIDDLES) {
      assert.equal(riddle.chapter.toLowerCase().includes('cumplea'), false, `día ${riddle.day} menciona el cumpleaños`);
    }
  });

  // Prueba cruzada (distinta de las de arriba, que solo comprueban la
  // respuesta del propio día): el capítulo que se revela al resolver
  // el día N es visible desde ese momento, así que no debe mencionar
  // la respuesta canónica de ningún día POSTERIOR — esa todavía no
  // existe para quien lo está leyendo. Antes de corregir el capítulo
  // del día 8 (que nombraba "un pensadero", la respuesta del día 15),
  // esta prueba fallaba exactamente en ese caso; se deja así para que
  // cualquier regresión futura se detecte igual de rápido.
  test('ningún capítulo revela la respuesta canónica de un día futuro', () => {
    for (const riddle of RIDDLES) {
      assertNoFutureAnswerLeak(riddle.chapter, riddle.day, { context: `capítulo del día ${riddle.day}` });
    }
  });

  test('ningún cuerpo de acertijo revela la respuesta canónica de un día futuro', () => {
    for (const riddle of RIDDLES) {
      // El cuerpo es visible desde que el día se desbloquea, antes
      // incluso de resolverlo — el umbral correcto es "día - 1", no
      // "día" (a diferencia del capítulo, que solo se ve tras acertar).
      assertNoFutureAnswerLeak(riddle.body, riddle.day - 1, { context: `cuerpo del día ${riddle.day}` });
    }
  });

  test('ninguna explicación ni referencia de película revela la respuesta canónica de un día futuro', () => {
    // Excepción deliberada y acotada: el `filmReference` del día 10 cita
    // el título real de la película ("Harry Potter y las Reliquias de
    // la Muerte: Parte 2"), que por coincidencia es también la
    // respuesta canónica del día 12. No es una filtración: el título de
    // la película es información pública independiente del juego (no
    // delata qué objeto concreto pedirá el día 12), y `filmReference`
    // ya solo se muestra después de resolver el día 10. Ningún otro día
    // cita esa película antes del día 12 (verificado con un grep sobre
    // `riddlesData.js`), así que la excepción queda acotada a este caso
    // exacto, no a una regla general.
    const filmReferenceExceptions = new Map([[10, new Map([[12, 'título real de la película, no la respuesta del juego']])]]);

    for (const riddle of RIDDLES) {
      assertNoFutureAnswerLeak(riddle.explanation, riddle.day, { context: `explicación del día ${riddle.day}` });
      assertNoFutureAnswerLeak(riddle.filmReference, riddle.day, {
        context: `referencia de película del día ${riddle.day}`,
        exceptions: filmReferenceExceptions.get(riddle.day) ?? new Map()
      });
    }
  });

  test('cada acertijo tiene un tono de reacción válido, para la animación de acierto', () => {
    const validTones = new Set(['gold', 'silver', 'violet', 'rose']);
    for (const riddle of RIDDLES) {
      assert.ok(validTones.has(riddle.reactionTone), `día ${riddle.day}: reactionTone inválido (${riddle.reactionTone})`);
    }
  });

  test('no existen pistas progresivas en los datos (se eliminaron por completo)', () => {
    for (const riddle of RIDDLES) {
      assert.equal(riddle.hints, undefined, `día ${riddle.day} no debería tener campo "hints"`);
    }
  });

  test('ningún título interno revela la respuesta canónica de su propio día', () => {
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      assert.equal(riddle.title.toLowerCase().includes(bareAnswer), false, `día ${riddle.day} revela la respuesta en el título`);
    }
  });

  test('ninguna marca de archivo (caseLabel) revela la respuesta canónica ni el nombre de ningún día', () => {
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      assert.equal(
        riddle.caseLabel.toLowerCase().includes(bareAnswer),
        false,
        `día ${riddle.day} revela la respuesta en caseLabel`
      );
    }
  });

  test('las quince marcas de archivo son distintas entre sí (variedad visual, no una plantilla idéntica)', () => {
    const labels = RIDDLES.map((r) => r.caseLabel);
    assert.equal(new Set(labels).size, labels.length);
  });

  test('ningún acertijo menciona su propia respuesta canónica dentro del cuerpo visible', () => {
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      const bodyLower = riddle.body.toLowerCase();
      assert.equal(bodyLower.includes(bareAnswer), false, `día ${riddle.day} revela su respuesta en el cuerpo`);
    }
  });

  test('el cuerpo de cada acertijo termina en una pregunta (no es una definición directa)', () => {
    for (const riddle of RIDDLES) {
      assert.ok(riddle.body.trim().endsWith('?'), `día ${riddle.day} debería terminar en pregunta`);
    }
  });
});

describe('calendar/riddlesData.js — el mensaje final y sus fragmentos', () => {
  test('los quince fragmentos, concatenados con un espacio y en orden de día, reconstruyen EXACTAMENTE el mensaje acordado', () => {
    const reconstructed = RIDDLES.slice()
      .sort((a, b) => a.day - b.day)
      .map((r) => r.fragment)
      .join(' ');
    assert.equal(reconstructed, FINAL_MESSAGE);
  });
});

describe('calendar/riddlesData.js — getEarnedFragments', () => {
  test('sin nada resuelto, no hay fragmentos ganados', () => {
    const referenceInstant = new Date('2026-10-20T00:00:00Z');
    const state = getCalendarState({ referenceInstant, progress: {} });
    assert.deepEqual(getEarnedFragments(state), []);
  });

  test('los fragmentos aparecen en el mismo orden que los días resueltos', () => {
    const referenceInstant = new Date('2026-11-05T12:00:00Z');
    const progress = {
      'expediente-01': { solved: true },
      'expediente-03': { solved: true }
    };
    const state = getCalendarState({ referenceInstant, progress });
    const fragments = getEarnedFragments(state);
    assert.deepEqual(fragments, [getRiddleForDay(1).fragment, getRiddleForDay(3).fragment]);
  });

  test('abrir/leer el mismo expediente resuelto varias veces nunca duplica su fragmento', () => {
    const referenceInstant = new Date('2026-11-05T12:00:00Z');
    const progress = { 'expediente-01': { solved: true } };

    const firstRead = getEarnedFragments(getCalendarState({ referenceInstant, progress }));
    const secondRead = getEarnedFragments(getCalendarState({ referenceInstant, progress })); // "reabrir" el mismo expediente
    const thirdRead = getEarnedFragments(getCalendarState({ referenceInstant, progress }));

    assert.deepEqual(firstRead, [getRiddleForDay(1).fragment]);
    assert.deepEqual(firstRead, secondRead);
    assert.deepEqual(firstRead, thirdRead);
  });

  test('con los quince resueltos, los fragmentos reconstruyen el mensaje completo', () => {
    const referenceInstant = new Date('2026-12-01T00:00:00Z');
    const progress = Object.fromEntries(
      getExpedienteDays().map((day) => [`expediente-${String(day).padStart(2, '0')}`, { solved: true }])
    );
    const state = getCalendarState({ referenceInstant, progress });
    const fragments = getEarnedFragments(state);
    assert.equal(fragments.length, 15);
    assert.equal(fragments.join(' '), FINAL_MESSAGE);
  });
});
