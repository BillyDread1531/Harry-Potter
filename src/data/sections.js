/**
 * Configuración de navegación y contenido provisional de cada sección.
 * Fase 2+ sustituirá `pendingNote`/`pendingItems` por las vistas definitivas
 * sin tener que tocar el router ni la navegación.
 */

export const SECTIONS = [
  {
    id: 'vestibulo',
    label: 'Vestíbulo',
    icon: 'hall',
    kind: 'vestibulo',
    title: 'El Vestíbulo de Hogwarts',
    status: 'ready'
  },
  {
    id: 'expedientes',
    label: 'Expedientes',
    icon: 'scroll',
    kind: 'pending',
    title: 'Los Expedientes',
    status: 'pending',
    description:
      'Aquí vivirán los quince expedientes fechados, uno por cada noche hasta el 15 de noviembre de 2026. Cada expediente guardará un acertijo, una pista del castillo y un fragmento de la historia.',
    pendingItems: [
      'Quince expedientes, uno por día, del 1 al 15 de noviembre de 2026.',
      'Acertijos funcionales con validación de respuestas.',
      'Progreso guardado para no perder lo ya descubierto.'
    ]
  },
  {
    id: 'mapa',
    label: 'Mapa del castillo',
    icon: 'map',
    kind: 'pending',
    title: 'El Mapa del Castillo',
    status: 'pending',
    description:
      'Un mapa vivo del castillo, pensado para moverse entre sus salas y descubrir rincones ocultos a medida que avance la aventura.',
    pendingItems: [
      'Navegación espacial entre salas y pasillos.',
      'Zonas que se desbloquean según el progreso.',
      'Detalles interactivos inspirados en el mapa del merodeador.'
    ]
  },
  {
    id: 'biblioteca',
    label: 'Biblioteca',
    icon: 'book',
    kind: 'pending',
    title: 'La Biblioteca',
    status: 'pending',
    description:
      'Un rincón tranquilo con curiosidades y conocimiento del mundo mágico, para leer entre acertijo y acertijo.',
    pendingItems: [
      'Fichas de curiosidades del mundo mágico.',
      'Contenido ampliable sin rehacer la estructura.'
    ]
  },
  {
    id: 'desafios',
    label: 'Sala de desafíos',
    icon: 'wand',
    kind: 'pending',
    title: 'La Sala de Desafíos',
    status: 'pending',
    description:
      'Minijuegos opcionales para quienes quieran ir más allá de los expedientes principales.',
    pendingItems: ['Minijuegos cortos y opcionales.', 'Sin impacto obligatorio en la historia principal.']
  },
  {
    id: 'archivo',
    label: 'Archivo secreto',
    icon: 'key',
    kind: 'pending',
    title: 'El Archivo Secreto',
    status: 'pending',
    description:
      'El lugar donde vivirán la carta de bienvenida, las instrucciones de la aventura y los secretos que se vayan descubriendo.',
    pendingItems: [
      'Carta cinematográfica de bienvenida.',
      'Instrucciones completas de la aventura.',
      'Registro de secretos descubiertos.'
    ]
  },
  {
    id: 'pensadero',
    label: 'Pensadero',
    icon: 'basin',
    kind: 'pensadero',
    title: 'El Pensadero',
    status: 'locked',
    description:
      'Un recuerdo sellado hasta la noche final, cuando el castillo esté listo para mostrarlo.',
    unlockLabel: '15 de noviembre de 2026 · 8:00 p. m. (hora de Guatemala)'
  }
];

export const DEFAULT_SECTION_ID = 'vestibulo';

export function getSectionById(id) {
  return SECTIONS.find((section) => section.id === id);
}
