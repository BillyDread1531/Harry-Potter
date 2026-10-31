/**
 * El acto narrativo (0-4) correspondiente al progreso real de Andrea,
 * a partir de los días efectivamente resueltos. Acto 0 significa "nada
 * resuelto todavía"; los actos 1-4 siguen la misma división ya
 * aprobada en los capítulos de `riddlesData.js` (I: días 1-4, II: 5-8,
 * III: 9-12, IV: 13-15), usando el día MÁS ALTO resuelto como
 * indicador de hasta dónde ha avanzado la historia. Pura y sin
 * dependencias de DOM/almacenamiento: recibe el Set de días resueltos
 * que ya produce `calendar/discoveries.getSolvedDays`.
 */
export function getCurrentAct(solvedDays) {
  if (!solvedDays || solvedDays.size === 0) return 0;
  const maxDay = Math.max(...solvedDays);
  if (maxDay <= 4) return 1;
  if (maxDay <= 8) return 2;
  if (maxDay <= 12) return 3;
  return 4;
}
