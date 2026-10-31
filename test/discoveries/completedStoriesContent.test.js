import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getCompletedStories } from '../../src/discoveries/completedStoriesContent.js';
import { RIDDLES } from '../../src/calendar/riddlesData.js';

describe('discoveries/completedStoriesContent.js — historias completas', () => {
  test('sin nada completado, la lista está vacía', () => {
    assert.deepEqual(getCompletedStories(), []);
    assert.deepEqual(getCompletedStories({ solvedDays: [], castleSecrets: {}, mothLockState: {} }), []);
  });

  test('cada día resuelto aparece como una historia, en orden ascendente, aunque se pasen desordenados', () => {
    const stories = getCompletedStories({ solvedDays: [3, 1, 2] });
    assert.deepEqual(
      stories.map((story) => story.id),
      ['riddle-1', 'riddle-2', 'riddle-3']
    );
  });

  test('un expediente resuelto usa caseLabel, nunca title, en su etiqueta', () => {
    const [story] = getCompletedStories({ solvedDays: [1] });
    const riddle = RIDDLES.find((r) => r.day === 1);
    assert.ok(story.label.includes(riddle.caseLabel));
    assert.equal(story.label.includes(riddle.title), false);
  });

  test('un expediente resuelto junta capítulo, explicación y referencia de película, en ese orden', () => {
    const [story] = getCompletedStories({ solvedDays: [1] });
    const riddle = RIDDLES.find((r) => r.day === 1);
    assert.deepEqual(story.bodyParagraphs, [riddle.chapter, riddle.explanation, riddle.filmReference]);
  });

  test('un día no resuelto nunca aparece', () => {
    const stories = getCompletedStories({ solvedDays: [1] });
    assert.equal(stories.some((story) => story.id === 'riddle-2'), false);
  });

  test('el rastro de la polilla solo aparece con threeMarksRecognized en true', () => {
    assert.equal(getCompletedStories({ castleSecrets: { threeMarksRecognized: false } }).length, 0);
    const stories = getCompletedStories({ castleSecrets: { threeMarksRecognized: true } });
    assert.ok(stories.some((story) => story.id === 'rastro-polilla'));
  });

  test('la corriente fría solo aparece con coldDraftResolved en true', () => {
    assert.equal(getCompletedStories({ castleSecrets: { coldDraftResolved: false } }).length, 0);
    const stories = getCompletedStories({ castleSecrets: { coldDraftResolved: true } });
    assert.ok(stories.some((story) => story.id === 'corriente-fria'));
  });

  test('la cerradura de la polilla solo aparece con mothLockState.solved en true', () => {
    assert.equal(getCompletedStories({ mothLockState: { solved: false } }).length, 0);
    const stories = getCompletedStories({ mothLockState: { solved: true } });
    assert.ok(stories.some((story) => story.id === 'cerradura-polilla'));
  });

  test('el catálogo imposible solo aparece con catalogState.solved en true', () => {
    assert.equal(getCompletedStories({ catalogState: { solved: false } }).length, 0);
    const stories = getCompletedStories({ catalogState: { solved: true } });
    assert.ok(stories.some((story) => story.id === 'catalogo-imposible'));
  });

  test('los pasos ocultos solo aparecen con hiddenPathState.solved en true', () => {
    assert.equal(getCompletedStories({ hiddenPathState: { solved: false } }).length, 0);
    const stories = getCompletedStories({ hiddenPathState: { solved: true } });
    assert.ok(stories.some((story) => story.id === 'pasos-ocultos'));
  });

  test('el sello correcto solo aparece con sealState.solved en true', () => {
    assert.equal(getCompletedStories({ sealState: { solved: false } }).length, 0);
    const stories = getCompletedStories({ sealState: { solved: true } });
    assert.ok(stories.some((story) => story.id === 'sello-correcto'));
  });

  test('las runas solo aparecen con runesState.solved en true', () => {
    assert.equal(getCompletedStories({ runesState: { solved: false } }).length, 0);
    const stories = getCompletedStories({ runesState: { solved: true } });
    assert.ok(stories.some((story) => story.id === 'las-runas'));
  });

  test('el verso de los cinco juegos solo aparece cuando los CINCO están resueltos, nunca con cuatro', () => {
    const fourOfFive = {
      mothLockState: { solved: true },
      catalogState: { solved: true },
      hiddenPathState: { solved: true },
      sealState: { solved: true },
      runesState: { solved: false }
    };
    assert.equal(getCompletedStories(fourOfFive).some((s) => s.id === 'verso-cinco-juegos'), false);

    const allFive = { ...fourOfFive, runesState: { solved: true } };
    assert.equal(getCompletedStories(allFive).some((s) => s.id === 'verso-cinco-juegos'), true);
  });

  test('los expedientes van primero, luego los hilos secretos, luego los minijuegos, en el mismo orden fijo', () => {
    const stories = getCompletedStories({
      solvedDays: [2, 1],
      castleSecrets: { threeMarksRecognized: true, coldDraftResolved: true },
      mothLockState: { solved: true },
      catalogState: { solved: true },
      hiddenPathState: { solved: true },
      sealState: { solved: true },
      runesState: { solved: true }
    });
    assert.deepEqual(
      stories.map((story) => story.id),
      [
        'riddle-1',
        'riddle-2',
        'rastro-polilla',
        'corriente-fria',
        'cerradura-polilla',
        'catalogo-imposible',
        'pasos-ocultos',
        'sello-correcto',
        'las-runas',
        'verso-cinco-juegos'
      ]
    );
  });

  test('ninguna historia tiene un párrafo vacío', () => {
    const stories = getCompletedStories({
      solvedDays: RIDDLES.map((riddle) => riddle.day),
      castleSecrets: { threeMarksRecognized: true, coldDraftResolved: true },
      mothLockState: { solved: true },
      catalogState: { solved: true },
      hiddenPathState: { solved: true },
      sealState: { solved: true },
      runesState: { solved: true }
    });
    assert.equal(stories.length, RIDDLES.length + 8);
    for (const story of stories) {
      assert.ok(story.label.length > 0, `historia ${story.id}: sin etiqueta`);
      assert.ok(story.bodyParagraphs.length > 0, `historia ${story.id}: sin párrafos`);
      for (const paragraph of story.bodyParagraphs) {
        assert.ok(paragraph?.trim().length > 0, `historia ${story.id}: párrafo vacío`);
      }
    }
  });

  test('ninguna historia revela plannedGift, canonicalAnswer ni acceptedVariants', () => {
    const stories = getCompletedStories({ solvedDays: RIDDLES.map((riddle) => riddle.day) });
    const allText = stories
      .flatMap((story) => story.bodyParagraphs)
      .join(' ')
      .toLowerCase();
    for (const riddle of RIDDLES) {
      assert.equal(allText.includes(riddle.plannedGift.toLowerCase()), false, `día ${riddle.day}: filtra plannedGift`);
    }
  });
});
