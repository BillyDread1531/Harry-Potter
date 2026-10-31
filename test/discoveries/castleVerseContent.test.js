import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getCastleVerseParagraphs } from '../../src/discoveries/castleVerseContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';
import { assertNoFutureAnswerLeak } from '../helpers/leakCheck.js';

describe('discoveries/castleVerseContent.js — lo que los cinco juegos escondían', () => {
  test('hay dos párrafos reales, siempre los mismos', () => {
    const paragraphs = getCastleVerseParagraphs();
    assert.equal(paragraphs.length, 2);
    for (const p of paragraphs) assert.ok(p.length > 20);
    assert.deepEqual(paragraphs, getCastleVerseParagraphs());
  });

  test('no revela ninguna respuesta canónica, el Pensadero, el desenlace o un regalo', () => {
    const text = getCastleVerseParagraphs().join(' ').toLowerCase();
    for (const riddle of RIDDLES) {
      const bareAnswer = riddle.canonicalAnswer.replace(/^(el|la|un|una)\s+/i, '').toLowerCase();
      assert.equal(text.includes(bareAnswer), false, `menciona "${bareAnswer}" (día ${riddle.day})`);
    }
    assert.equal(text.includes('pensadero'), false);
    assert.equal(text.includes('regalo'), false);
    assertNoFutureAnswerLeak(text, 0, { context: 'verso de los cinco juegos' });
  });
});
