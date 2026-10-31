/**
 * «Historias completas» — un único lugar donde releer, ya con buen
 * formato, cualquier historia que Andrea haya terminado: un expediente
 * resuelto (capítulo + explicación + referencia, el mismo contenido
 * que ya se muestra en Expedientes al resolverlo, nunca reescrito) o
 * un hilo secreto una vez cerrado del todo (el rastro de la polilla,
 * la corriente fría) o un minijuego ya resuelto (la cerradura de la
 * polilla, el catálogo imposible, los pasos ocultos, el sello
 * correcto, las runas). Función pura: solo
 * reordena y junta contenido que ya existía disperso en otras
 * pantallas, siempre en el mismo orden en que se habría descubierto
 * explorando — nunca compone texto nuevo.
 *
 * Un hilo a medias nunca aparece aquí: eso sigue viviendo, como hasta
 * ahora, en los propios hotspots de cada escena. Los expedientes usan
 * siempre `riddle.caseLabel`, nunca `riddle.title` (ver la nota en
 * `calendar/riddlesData.js`: `title` no debe mostrarse jamás en la
 * interfaz, antes ni después de resolver).
 */
import { RIDDLES } from '../calendar/riddlesData.js';
import { MOTH_WING_DETAIL_TEXT, ARCHIVE_MARKS_RECOGNIZED_TEXT, MAP_PATTERN_COMPLETE_TEXT } from './mothTrailContent.js';
import {
  COLD_DRAFT_LIBRARY_TEXT,
  COLD_DRAFT_MAP_CONNECTED_TEXT,
  COLD_DRAFT_ROOM_READY_TEXT,
  COLD_DRAFT_RESOLUTION_TEXT
} from './coldDraftContent.js';
import { CLUES, VICTORY_TEXT as MOTH_LOCK_VICTORY_TEXT } from '../games/mothLockData.js';
import { CLUES as CATALOG_CLUES, VICTORY_TEXT as CATALOG_VICTORY_TEXT } from '../games/catalogData.js';
import { CLUES as HIDDEN_PATH_CLUES, VICTORY_TEXT as HIDDEN_PATH_VICTORY_TEXT } from '../games/hiddenPathData.js';
import { CLUES as SEAL_CLUES, VICTORY_TEXT as SEAL_VICTORY_TEXT } from '../games/sealData.js';
import { RUNES, TARGET_SEQUENCE, VICTORY_TEXT as RUNES_VICTORY_TEXT } from '../games/runesData.js';
import { getCastleVerseParagraphs } from './castleVerseContent.js';

const RIDDLE_BY_DAY = new Map(RIDDLES.map((riddle) => [riddle.day, riddle]));

function createRiddleStory(day) {
  const riddle = RIDDLE_BY_DAY.get(day);
  if (!riddle) return null;
  return {
    id: `riddle-${day}`,
    icon: 'book',
    label: `Expediente ${String(day).padStart(2, '0')} · ${riddle.caseLabel}`,
    bodyParagraphs: [riddle.chapter, riddle.explanation, riddle.filmReference]
  };
}

const MOTH_TRAIL_STORY = {
  id: 'rastro-polilla',
  icon: 'wand',
  label: 'El rastro de la polilla',
  bodyParagraphs: [MOTH_WING_DETAIL_TEXT, ARCHIVE_MARKS_RECOGNIZED_TEXT, MAP_PATTERN_COMPLETE_TEXT]
};

const COLD_DRAFT_STORY = {
  id: 'corriente-fria',
  icon: 'wand',
  label: 'La corriente fría',
  bodyParagraphs: [
    COLD_DRAFT_LIBRARY_TEXT,
    COLD_DRAFT_MAP_CONNECTED_TEXT,
    COLD_DRAFT_ROOM_READY_TEXT,
    COLD_DRAFT_RESOLUTION_TEXT
  ]
};

function createMothLockStory() {
  return {
    id: 'cerradura-polilla',
    icon: 'lock',
    label: 'La cerradura de la polilla',
    bodyParagraphs: [...CLUES.map((clue) => clue.text), MOTH_LOCK_VICTORY_TEXT]
  };
}

function createCatalogStory() {
  return {
    id: 'catalogo-imposible',
    icon: 'book',
    label: 'El catálogo imposible',
    bodyParagraphs: [...CATALOG_CLUES.map((clue) => clue.text), CATALOG_VICTORY_TEXT]
  };
}

function createHiddenPathStory() {
  return {
    id: 'pasos-ocultos',
    icon: 'map',
    label: 'Los pasos ocultos',
    bodyParagraphs: [...HIDDEN_PATH_CLUES.map((clue) => clue.text), HIDDEN_PATH_VICTORY_TEXT]
  };
}

function createSealStory() {
  return {
    id: 'sello-correcto',
    icon: 'key',
    label: 'El sello correcto',
    bodyParagraphs: [...SEAL_CLUES.map((clue) => clue.text), SEAL_VICTORY_TEXT]
  };
}

function createRunesStory() {
  const ordered = TARGET_SEQUENCE.map((id, index) => `${index + 1}. ${RUNES.find((rune) => rune.id === id).label}`).join(
    ' · '
  );
  return {
    id: 'las-runas',
    icon: 'wand',
    label: 'Las runas',
    bodyParagraphs: [`El orden que por fin recordaste: ${ordered}.`, RUNES_VICTORY_TEXT]
  };
}

/**
 * `solvedDays` es un iterable de números de día (lo que ya produce
 * `calendar/discoveries.getSolvedDays`); `castleSecrets`, el objeto de
 * `discoveries/castleSecretsStorage.loadCastleSecretsState`; el resto
 * (`mothLockState`, `catalogState`, `hiddenPathState`, `sealState`,
 * `runesState`) son los de `games/*Storage.loadXState` de cada
 * minijuego. Los expedientes van primero, en orden de día; los hilos
 * secretos después; los minijuegos al final, siempre en el mismo
 * orden fijo (el orden en que se añadieron al proyecto).
 */
export function getCompletedStories({
  solvedDays = [],
  castleSecrets = {},
  mothLockState = {},
  catalogState = {},
  hiddenPathState = {},
  sealState = {},
  runesState = {}
} = {}) {
  const stories = [];

  Array.from(solvedDays)
    .sort((a, b) => a - b)
    .forEach((day) => {
      const story = createRiddleStory(day);
      if (story) stories.push(story);
    });

  if (castleSecrets.threeMarksRecognized) stories.push(MOTH_TRAIL_STORY);
  if (castleSecrets.coldDraftResolved) stories.push(COLD_DRAFT_STORY);
  if (mothLockState.solved) stories.push(createMothLockStory());
  if (catalogState.solved) stories.push(createCatalogStory());
  if (hiddenPathState.solved) stories.push(createHiddenPathStory());
  if (sealState.solved) stories.push(createSealStory());
  if (runesState.solved) stories.push(createRunesStory());

  // La única historia de esta fase que se desbloquea por TERMINAR
  // algo, no por explorar ni por fecha: los cinco minijuegos a la
  // vez. Va siempre al final, como cierre de la lista.
  const allGamesSolved =
    mothLockState.solved && catalogState.solved && hiddenPathState.solved && sealState.solved && runesState.solved;
  if (allGamesSolved) {
    stories.push({
      id: 'verso-cinco-juegos',
      icon: 'gift',
      label: 'Lo que los cinco juegos escondían',
      bodyParagraphs: getCastleVerseParagraphs()
    });
  }

  return stories;
}
