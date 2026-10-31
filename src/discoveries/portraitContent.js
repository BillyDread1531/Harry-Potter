/**
 * Contenido del retrato encantado: una sola línea por acto narrativo
 * (0-4, ver `calendar/actProgress.js`), igual que
 * `data/roomOfRequirementContent.js` hace para la Sala de los
 * Menesteres — reutilizado a propósito, no reinventado, porque ya es
 * el patrón correcto para "diálogo que cambia con el progreso real sin
 * persistir un estado aparte". El retrato vive en el Archivo Secreto;
 * reutiliza el mismo recurso gráfico (`retrato.png`) que ya aparece en
 * el Vestíbulo — un retrato mágico que aparece en más de un lugar del
 * castillo es coherente con el propio mundo, no una casualidad de
 * recursos.
 *
 * Nunca nombra objetos, regalos, el Pensadero ni el desenlace. Nunca
 * revela la respuesta canónica de ningún expediente.
 */
export const PORTRAIT_ACT_LINES = {
  0: 'El retrato no dice nada todavía. Sus ojos pintados se mueven, apenas, para seguirte hasta la puerta.',
  1: '"Ya empezaste", dice, sin abrir del todo los ojos. "Eso ya es más de lo que la mayoría se atreve."',
  2: '"Has estado aquí antes, ¿sabes?", murmura el retrato. "No en esta sala. En otra parte del castillo. Los marcos recuerdan mejor que la gente."',
  3: '"Cada vez te pareces más a alguien que sí va a llegar hasta el final", dice el retrato, con una media sonrisa que no termina de ser una advertencia.',
  4: '"Falta poco", susurra el retrato, bajando la voz como si el propio castillo pudiera escucharlo. "Y cuando llegue, no voy a ser yo quien te lo cuente."'
};

export function getPortraitLineForAct(act) {
  return PORTRAIT_ACT_LINES[act] ?? PORTRAIT_ACT_LINES[0];
}
