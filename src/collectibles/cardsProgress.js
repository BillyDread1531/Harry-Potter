/**
 * Qué cromos existen ya para Andrea (según el progreso real de los
 * expedientes) y cuáles ya encontró (según `cardsStorage`). Separado
 * en dos preguntas distintas a propósito: un cromo puede EXISTIR sin
 * haber sido encontrado todavía.
 */
import { CARDS } from './cardsData.js';
import { loadCollectedCardIds } from './cardsStorage.js';

export function isCardUnlocked(card, solvedDays = new Set()) {
  return card.unlockAfterDay === null || solvedDays.has(card.unlockAfterDay);
}

/** Los cromos cuya condición de progreso ya se cumplió (existan o no en el mundo todavía por explorar). */
export function getUnlockedCards(solvedDays = new Set()) {
  return CARDS.filter((card) => isCardUnlocked(card, solvedDays));
}

/** Los cromos que Andrea ya encontró de verdad, en el orden de `CARDS`. */
export function getCollectedCards(collectedIds = loadCollectedCardIds()) {
  const collectedSet = new Set(collectedIds);
  return CARDS.filter((card) => collectedSet.has(card.id));
}
