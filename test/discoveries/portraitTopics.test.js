import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PORTRAIT_TOPICS, getPortraitTopicById } from '../../src/discoveries/portraitTopics.js';
import { PORTRAIT_ACT_LINES } from '../../src/discoveries/portraitContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

const EMPTY_SECRETS = {
  bookDiscovered: false,
  portraitMet: false,
  collectibleFound: false,
  mothWingNoticed: false,
  threeMarksRecognized: false
};

describe('discoveries/portraitTopics.js — la conversación del retrato', () => {
  test('hay exactamente tres temas fijos (no un árbol de diálogo extenso)', () => {
    assert.equal(PORTRAIT_TOPICS.length, 3);
  });

  test('cada tema tiene un prompt no vacío y una función resolve', () => {
    for (const topic of PORTRAIT_TOPICS) {
      assert.ok(topic.prompt.length > 0, `tema "${topic.id}" sin prompt`);
      assert.equal(typeof topic.resolve, 'function', `tema "${topic.id}" sin resolve`);
    }
  });

  test('resolve siempre devuelve una cadena no vacía, en cualquier contexto', () => {
    for (const topic of PORTRAIT_TOPICS) {
      for (const act of [0, 1, 2, 3, 4]) {
        const response = topic.resolve({ act, castleSecrets: EMPTY_SECRETS });
        assert.ok(typeof response === 'string' && response.length > 10, `tema "${topic.id}", acto ${act}`);
      }
    }
  });

  test('getPortraitTopicById encuentra un tema real y devuelve null si no existe', () => {
    assert.equal(getPortraitTopicById('quien-eres')?.id, 'quien-eres');
    assert.equal(getPortraitTopicById('no-existe'), null);
  });

  test('el tema "que sabes" no duplica el contenido ya existente de PORTRAIT_ACT_LINES', () => {
    const existingLines = new Set(Object.values(PORTRAIT_ACT_LINES));
    for (const act of [0, 1, 2, 3, 4]) {
      const response = getPortraitTopicById('que-sabes').resolve({ act, castleSecrets: EMPTY_SECRETS });
      assert.equal(existingLines.has(response), false, `acto ${act}: respuesta idéntica a una línea ya existente`);
    }
  });

  test('"que sabes" da una respuesta distinta (y revela haberlo notado) una vez reconocido el patrón del recorrido secreto', () => {
    const before = getPortraitTopicById('que-sabes').resolve({ act: 2, castleSecrets: EMPTY_SECRETS });
    const after = getPortraitTopicById('que-sabes').resolve({
      act: 2,
      castleSecrets: { ...EMPTY_SECRETS, threeMarksRecognized: true }
    });
    assert.notEqual(before, after);
  });

  test('"has visto algo" reacciona de forma distinta si ya se exploró algo relacionado (libro, coleccionable o ala de polilla)', () => {
    const neutral = getPortraitTopicById('has-visto-algo').resolve({ act: 0, castleSecrets: EMPTY_SECRETS });
    const afterBook = getPortraitTopicById('has-visto-algo').resolve({
      act: 0,
      castleSecrets: { ...EMPTY_SECRETS, bookDiscovered: true }
    });
    const afterCollectible = getPortraitTopicById('has-visto-algo').resolve({
      act: 0,
      castleSecrets: { ...EMPTY_SECRETS, collectibleFound: true }
    });
    assert.notEqual(neutral, afterBook);
    assert.equal(afterBook, afterCollectible, 'cualquier exploración relacionada debería dar la misma reacción de reconocimiento');
  });

  test('"quién eres" varía con el acto narrativo (aporta ambiente/personalidad, no un detalle oculto)', () => {
    const responses = [0, 1, 2, 3, 4].map((act) => getPortraitTopicById('quien-eres').resolve({ act, castleSecrets: EMPTY_SECRETS }));
    assert.equal(new Set(responses).size, responses.length);
  });

  test('ninguna respuesta, en ningún contexto, revela la respuesta canónica de ningún expediente, el Pensadero, el desenlace o un regalo', () => {
    const allContexts = [];
    for (const act of [0, 1, 2, 3, 4]) {
      allContexts.push({ act, castleSecrets: EMPTY_SECRETS });
      allContexts.push({ act, castleSecrets: { ...EMPTY_SECRETS, threeMarksRecognized: true } });
      allContexts.push({ act, castleSecrets: { ...EMPTY_SECRETS, bookDiscovered: true } });
    }
    const allResponses = PORTRAIT_TOPICS.flatMap((topic) => allContexts.map((ctx) => topic.resolve(ctx)));

    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      for (const response of allResponses) {
        assert.equal(response.toLowerCase().includes(bareAnswer), false, `una respuesta del retrato menciona "${bareAnswer}" (día ${riddle.day})`);
      }
    }
    for (const response of allResponses) {
      assert.equal(response.toLowerCase().includes('pensadero'), false);
      assert.equal(response.toLowerCase().includes('regalo'), false);
    }
  });

  test('ninguna respuesta revela una respuesta futura, sea cual sea el acto (el retrato es alcanzable desde el principio)', () => {
    for (const topic of PORTRAIT_TOPICS) {
      for (const act of [0, 1, 2, 3, 4]) {
        const response = topic.resolve({ act, castleSecrets: EMPTY_SECRETS });
        assertNoFutureAnswerLeak(response, 0, { context: `tema "${topic.id}", acto ${act}` });
      }
    }
  });
});
