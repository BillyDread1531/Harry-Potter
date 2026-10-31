/**
 * "Cromos de Rana de Chocolate" — una colección narrativa opcional,
 * distinta de los hallazgos de `calendar/secretsData.js` (esos son
 * fragmentos del misterio central; estos son curiosidades propias del
 * mundo mágico, con su propia identidad de coleccionable, como ya
 * insinúa el propio capítulo del día 2: "un cromo distinto a los
 * demás... un escudo liso, sin nombre"). Nunca revelan respuestas,
 * regalos ni el mensaje final — son contenido original inspirado en
 * las películas, no una copia de ningún cromo real.
 *
 * `unlockAfterDay: null` significa "se puede encontrar explorando,
 * desde el principio"; un número significa que ese expediente debe
 * estar resuelto antes de que el cromo exista en absoluto.
 */
export const CARDS = [
  {
    id: 'dumbledore',
    name: 'Albus Dumbledore',
    scene: 'vestibulo',
    unlockAfterDay: null,
    blurb:
      'Director de Hogwarts. Famoso por su victoria sobre el mago oscuro Grindelwald y por su estudio de los doce usos de la sangre de dragón. Quienes lo conocen aseguran que puede permanecer en silencio durante una conversación incómoda más tiempo que nadie, y que ese silencio casi siempre esconde una pregunta cuya respuesta ya sabe.'
  },
  {
    id: 'mcgonagall',
    name: 'Minerva McGonagall',
    scene: 'expedientes',
    unlockAfterDay: 3,
    blurb:
      'Subdirectora de Hogwarts y jefa de la casa Gryffindor. Una de las magas más hábiles en Transformaciones del último siglo, capaz de convertirse en gata sin perder, según dicen, ni un ápice de su severidad. Quienes han llegado tarde a su clase coinciden en que el reloj de esa aula parece llevar las manecillas especialmente adelantadas.'
  },
  {
    id: 'ravenclaw',
    name: 'Rowena Ravenclaw',
    scene: 'biblioteca',
    unlockAfterDay: null,
    blurb:
      'Una de las cuatro fundadoras de Hogwarts. Creía que la inteligencia sin curiosidad es apenas la mitad de una mente completa. Se dice que escondía sus objetos más valiosos no bajo llave, sino dentro de acertijos, convencida de que solo merecía encontrarlos quien de verdad quisiera entenderlos.'
  },
  {
    id: 'flamel',
    name: 'Nicolas Flamel',
    scene: 'archivo',
    unlockAfterDay: 10,
    blurb:
      'Alquimista, conocido sobre todo por haber fabricado la única Piedra Filosofal registrada en los últimos quinientos años. Vivió más de seiscientos, aunque siempre insistió en que el secreto no estaba en vivir para siempre, sino en decidir, en algún momento, que ya era suficiente.'
  },
  {
    id: 'lupin',
    name: 'Remus Lupin',
    scene: 'mapa',
    unlockAfterDay: 5,
    blurb:
      'Exprofesor de Defensa Contra las Artes Oscuras, y uno de los cuatro autores anónimos detrás de cierto mapa muy particular del castillo. Solía decir que los mejores secretos de Hogwarts no estaban escondidos: solo esperaban a alguien con la paciencia de merodear lo suficiente para encontrarlos.'
  },
  {
    id: 'longbottom',
    name: 'Neville Longbottom',
    scene: 'desafios',
    unlockAfterDay: 13,
    blurb:
      'Herbólogo y, durante un año especialmente oscuro para Hogwarts, líder silencioso de una resistencia estudiantil que se reunía en una sala que no figuraba en ningún plano oficial del castillo. Demostró que el valor, a veces, no es ruidoso: es simplemente negarse a rendirse cuando nadie más lo nota.'
  }
];

const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));

export function getCardById(id) {
  return CARD_BY_ID.get(id) ?? null;
}
