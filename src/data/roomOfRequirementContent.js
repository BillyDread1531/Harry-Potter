/**
 * Contenido de la Sala de los Menesteres: una sola línea ambiental por
 * acto (0-4, ver `calendar/actProgress.js`), revelada a través del
 * único punto interactivo de la sala. Deliberadamente breve y sin
 * listas — la experiencia de esta sala es visual y ambiental, no un
 * archivo para consultar (eso ya existe en `secretsData.js`, para la
 * Biblioteca y el Archivo). Nunca nombra objetos, regalos ni el
 * desenlace.
 */
export const ROOM_ACT_LINES = {
  0: 'La sala todavía no sabe qué buscas. Las sábanas cubren todo lo que guarda, y ni una sola vela se ha encendido por sí sola.',
  1: 'Una vela se enciende sola, en algún punto del pasillo, como si la sala hubiera decidido que ya vale la pena ver un poco más.',
  2: 'Algo, entre el polvo, empieza a brillar con un parpadeo irregular: ni fuego ni luz de varita, sino algo que se parece un poco a ambas cosas.',
  3: 'El aire se siente distinto aquí: más tibio, menos cargado de polvo, como si la sala, por fin, hubiera decidido qué quiere mostrarte.',
  4: 'Casi todo en este pasillo sigue cubierto, pero al fondo se asoma una luz cálida, hacia un punto que la sala todavía no deja ver del todo. Todavía no.'
};

// La posición `mobile` se rediseñó junto con el resto de los puntos
// interactivos de la sala (mecanismo y pistas de `games/mothLockView.js`,
// corriente fría de `scenes/desafiosScene.js`): el original (50, 46)
// caía dentro de `.scene-frame__content`, literalmente debajo del
// título, invisible contra el texto.
export const ROOM_HOTSPOT_POSITION = {
  desktop: { x: 50, y: 46 },
  mobile: { x: 50, y: 78 }
};

export function getRoomLineForAct(act) {
  return ROOM_ACT_LINES[act] ?? ROOM_ACT_LINES[0];
}
