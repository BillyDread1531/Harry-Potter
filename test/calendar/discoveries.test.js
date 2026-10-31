import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SECRETS, getSecretById } from '../../src/calendar/secretsData.js';
import { getSolvedDays, getUnlockedSecrets } from '../../src/calendar/discoveries.js';
import { createExpedienteId, isValidDay } from '../../src/calendar/calendarEngine.js';
import { createDiscoveryListMarkup } from '../../src/calendar/discoveriesView.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

describe('calendar/secretsData.js — integridad de los hallazgos', () => {
  test('cada secreto tiene un día válido, un lugar reconocido, etiqueta y cuerpo reales', () => {
    for (const secret of SECRETS) {
      assert.ok(isValidDay(secret.day), `secreto ${secret.id}: día inválido`);
      assert.ok(['biblioteca', 'archivo'].includes(secret.location), `secreto ${secret.id}: lugar inválido`);
      assert.ok(secret.label?.length > 0, `secreto ${secret.id}: label`);
      assert.ok(secret.body?.length > 20, `secreto ${secret.id}: body demasiado corto o vacío`);
    }
  });

  test('los ids de los secretos son únicos', () => {
    const ids = SECRETS.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('getSecretById encuentra un secreto existente y devuelve null si no existe', () => {
    assert.equal(getSecretById('separador-reliquias')?.day, 12);
    assert.equal(getSecretById('no-existe'), null);
  });

  // Cada hallazgo se vuelve visible exactamente cuando se resuelve
  // `secret.day` (ver `discoveries.getUnlockedSecrets`): no debe
  // mencionar la respuesta canónica de ningún día posterior a ese.
  // Antes de esta prueba, `secretsData.js` era el único archivo de
  // contenido narrativo sin ninguna red de seguridad equivalente.
  test('ningún hallazgo revela la respuesta canónica de un día futuro al suyo', () => {
    for (const secret of SECRETS) {
      assertNoFutureAnswerLeak(secret.label, secret.day, { context: `label del hallazgo "${secret.id}" (día ${secret.day})` });
      assertNoFutureAnswerLeak(secret.body, secret.day, { context: `cuerpo del hallazgo "${secret.id}" (día ${secret.day})` });
    }
  });
});

describe('calendar/discoveries.js — getSolvedDays', () => {
  test('sin progreso, no hay días resueltos', () => {
    assert.deepEqual(getSolvedDays({}), new Set());
    assert.deepEqual(getSolvedDays(undefined), new Set());
  });

  test('reconoce los días marcados como resueltos en el progreso', () => {
    const progress = {
      [createExpedienteId(1)]: { solved: true },
      [createExpedienteId(4)]: { solved: true },
      [createExpedienteId(5)]: { solved: false }
    };
    assert.deepEqual(getSolvedDays(progress), new Set([1, 4]));
  });
});

describe('calendar/discoveries.js — getUnlockedSecrets', () => {
  test('sin nada resuelto, no hay secretos desbloqueados', () => {
    assert.deepEqual(getUnlockedSecrets({ progress: {} }), []);
  });

  test('resolver el día de un secreto lo desbloquea; otros días no lo afectan', () => {
    const progress = { [createExpedienteId(1)]: { solved: true } };
    const unlocked = getUnlockedSecrets({ progress });
    assert.equal(unlocked.length, 1);
    assert.equal(unlocked[0].id, 'bitacora-visita');
  });

  test('un secreto de un día todavía no resuelto nunca aparece, aunque se hayan resuelto otros días', () => {
    const progress = {
      [createExpedienteId(1)]: { solved: true },
      [createExpedienteId(2)]: { solved: true },
      [createExpedienteId(3)]: { solved: true }
    };
    const unlocked = getUnlockedSecrets({ progress });
    assert.equal(unlocked.some((s) => s.day === 4), false);
  });

  test('filtra por lugar (biblioteca vs. archivo) cuando se pide', () => {
    const progress = {
      [createExpedienteId(12)]: { solved: true },
      [createExpedienteId(15)]: { solved: true }
    };
    const inBiblioteca = getUnlockedSecrets({ location: 'biblioteca', progress });
    const inArchivo = getUnlockedSecrets({ location: 'archivo', progress });
    assert.ok(inBiblioteca.every((s) => s.location === 'biblioteca'));
    assert.ok(inArchivo.every((s) => s.location === 'archivo'));
    assert.equal(inArchivo.some((s) => s.id === 'archivo-ultimo'), true);
  });

  test('sin filtro de lugar, devuelve los secretos desbloqueados de cualquier lugar', () => {
    const progress = {
      [createExpedienteId(1)]: { solved: true },
      [createExpedienteId(15)]: { solved: true }
    };
    const unlocked = getUnlockedSecrets({ progress });
    assert.equal(unlocked.length, 2);
  });
});

describe('calendar/discoveriesView.js — createDiscoveryListMarkup', () => {
  test('sin secretos, no genera ningún marcado', () => {
    assert.equal(createDiscoveryListMarkup([]), '');
    assert.equal(createDiscoveryListMarkup(undefined), '');
  });

  test('cada secreto aparece con su etiqueta y su cuerpo', () => {
    const secret = getSecretById('bitacora-visita');
    const html = createDiscoveryListMarkup([secret]);
    assert.ok(html.includes(secret.label));
    assert.ok(html.includes(secret.body));
  });

  test('un elemento con bodyParagraphs genera un <p> por párrafo, en orden', () => {
    const html = createDiscoveryListMarkup([{ label: 'Una historia', bodyParagraphs: ['Primero.', 'Segundo.'] }]);
    const firstIndex = html.indexOf('Primero.');
    const secondIndex = html.indexOf('Segundo.');
    assert.ok(firstIndex > -1 && secondIndex > -1);
    assert.ok(firstIndex < secondIndex);
    assert.equal((html.match(/discovery-list__body/g) ?? []).length, 2);
  });
});
