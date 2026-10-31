/**
 * Contenido de la lechuza del Vestíbulo — lechuza mensajera: cambia de
 * línea con el expediente más alto ya resuelto (una por cada uno de
 * los quince días), siempre señalando hacia algo real que ya se puede
 * explorar esa misma noche, nunca revelando qué es exactamente. Igual
 * criterio que el resto del proyecto: nunca nombra objetos, regalos,
 * el Pensadero ni la respuesta de ningún expediente.
 */
export const OWL_LINE_DEFAULT =
  'La lechuza ladea la cabeza, te mira un segundo de más y vuelve a mirar hacia la noche, como si esperara una carta que todavía no ha llegado.';

export const OWL_LINE_AFTER_BOOK =
  'La lechuza se agita, inquieta, y por un instante extiende un ala hacia ti — casi como si quisiera enseñarte algo. Llevas un libro sin título en la memoria. Tal vez no sea casualidad que ahora te mire distinto.';

const OWL_LINES_BY_DAY = {
  1: 'La lechuza observa el sobre que todavía sostienes, luego inclina la cabeza hacia la Biblioteca, como diciendo: ahí dentro hay más que libros.',
  2: 'Picotea el aire en dirección al Mapa, inquieta, como si un rincón del castillo llevara toda la noche esperando que alguien lo desenrolle.',
  3: 'Deja escapar un ulular breve, casi una risa, mirando fijo hacia el Archivo. Algo ahí dentro parece tener ganas de hablar.',
  4: 'Se eriza de golpe, mirando hacia la Biblioteca con una insistencia que antes no tenía. Algo cambió esta noche, y ella lo sabe antes que tú.',
  5: 'Extiende un ala hacia el techo, como señalando algo que cuelga en otra sala. Las lámparas, parece decir, también guardan lo suyo.',
  6: 'Gira la cabeza casi del todo hacia atrás, mirando un punto fijo del pasillo. No todas las corrientes de este castillo vienen de una ventana.',
  7: 'Golpea suavemente el alféizar con la pata, mirándote como si dijera: vuelve a mirar lo que ya creías haber entendido del todo.',
  8: 'Ulula una sola vez, grave, mirando hacia la sala oculta tras el muro. Algo ahí dentro empieza, por fin, a dejarse ver.',
  9: 'Se queda muy quieta, con los ojos fijos en el Archivo. Una cerradura antigua no se abre sola — pero tampoco pide mucho más que atención.',
  10: 'Ladea la cabeza hacia el retrato del rincón. Los cuadros de este castillo, te recuerda su mirada, también tienen memoria propia.',
  11: 'Mueve las alas, inquieta, mirando hacia la Biblioteca. Dicen que ahí hay una polilla que nunca deja de seguir la luz.',
  12: 'Se asoma hacia el pasillo con una urgencia nueva. Tres marcas, vistas en dos lugares distintos, rara vez son casualidad.',
  13: 'Ulula largo, casi una advertencia amable: la sala oculta tras el muro ha vuelto a cambiar. Vale la pena mirarla entera otra vez.',
  14: 'Se queda inmóvil, mirando hacia donde guardas lo ya encontrado. Casi todo lo que llevas reunido, dice su mirada, empieza a encajar.',
  15: 'No ulula esta vez. Solo te mira, muy quieta, como si supiera exactamente qué hora es esta noche.'
};

/**
 * `day` es el expediente más alto ya resuelto (0 si ninguno). Con
 * progreso real, la línea de ese día gana siempre; `bookDiscovered`
 * solo decide la línea de bienvenida, antes de resolver el primero.
 */
export function getOwlLine({ day = 0, bookDiscovered = false } = {}) {
  if (day >= 1) return OWL_LINES_BY_DAY[day] ?? OWL_LINES_BY_DAY[15];
  return bookDiscovered ? OWL_LINE_AFTER_BOOK : OWL_LINE_DEFAULT;
}
