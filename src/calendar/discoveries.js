/**
 * Qué secretos narrativos (`secretsData.js`) ha desbloqueado Andrea,
 * a partir de qué expedientes tiene resueltos de verdad en el
 * progreso guardado. Deliberadamente no depende de la disponibilidad
 * por fecha: una vez resuelto un expediente, el secreto que libera
 * permanece desbloqueado para siempre, sin importar la hora actual.
 */
import { loadProgress } from './calendarStorage.js';
import { createExpedienteId, getExpedienteDays } from './calendarEngine.js';
import { SECRETS } from './secretsData.js';

export function getSolvedDays(progress) {
  return new Set(getExpedienteDays().filter((day) => progress?.[createExpedienteId(day)]?.solved === true));
}

/**
 * Los secretos ya desbloqueados, opcionalmente filtrados por lugar
 * (`'biblioteca'` o `'archivo'`). `progress` es inyectable para que
 * esto se pueda probar sin `localStorage`; si se omite, se lee el
 * progreso guardado de verdad.
 */
export function getUnlockedSecrets({ location, progress = loadProgress() } = {}) {
  const solvedDays = getSolvedDays(progress);
  return SECRETS.filter((secret) => solvedDays.has(secret.day) && (!location || secret.location === location));
}
