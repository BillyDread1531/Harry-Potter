/**
 * Secretos opcionales ("hallazgos") distribuidos por el castillo, cada
 * uno con contenido real propio — nunca un "encontraste un secreto"
 * vacío. Cada secreto se desbloquea cuando Andrea resuelve un día
 * concreto (campo `day`) y vive en un lugar concreto (`location`):
 * nunca son requisito para avanzar en los expedientes, solo amplían la
 * historia para quien quiera explorar.
 *
 * Deliberadamente separado de `riddlesData.js`: los acertijos no deben
 * tocarse para ajustar estos hallazgos, y viceversa.
 */
export const SECRETS = [
  {
    id: 'bitacora-visita',
    day: 1,
    location: 'biblioteca',
    label: 'Un registro que no debería existir',
    body:
      'En el libro de visitas de la biblioteca encuentras una entrada reciente, aunque nadie la firmó: tu nombre, con la fecha de esta noche, escrito con una letra que no reconoces. Alguien —o algo— sabía que vendrías.'
  },
  {
    id: 'polilla-margen',
    day: 4,
    location: 'biblioteca',
    label: 'Una polilla sin firma',
    body:
      'En el margen de un libro de Encantamientos de hace años, alguien dibujó, tres veces, la misma polilla plateada. No hay ningún nombre junto al dibujo, solo la insistencia de quien no quería que se olvidara.'
  },
  {
    id: 'nota-restriccion',
    day: 8,
    location: 'biblioteca',
    label: 'Una nota que no debería estar aquí',
    body:
      'Entre las fichas de préstamo encuentras una nota de la bibliotecaria, fechada hace años: "Encantamiento de memoria renovado sobre la sección reservada. No desvanecer hasta nueva orden." La orden, al parecer, nunca llegó a cancelarse, o alguien se encargó de que no lo hiciera.'
  },
  {
    id: 'separador-reliquias',
    day: 12,
    location: 'biblioteca',
    label: 'Un separador olvidado',
    body:
      'Entre las páginas de un libro sobre objetos legendarios encuentras un separador de libros: un triángulo, un círculo y una línea, trazados en tinta plateada ya desvaída. Marcaba, no por casualidad, el capítulo sobre el legado que se elige dejar, no el que se hereda sin pedirlo.'
  },
  {
    id: 'polilla-sentido',
    day: 14,
    location: 'biblioteca',
    label: 'Lo que significa la polilla',
    body:
      'Un volumen sobre criaturas pequeñas explica, sin dramatismo, que la polilla plateada no caza la luz: la sigue. Vuelve a ella incluso cuando se ha apagado antes, incluso cuando el camino de regreso no es sencillo. Alguien subrayó esa línea, hace mucho tiempo, con el mismo trazo plateado de los márgenes.'
  },
  {
    id: 'archivo-ultimo',
    day: 15,
    location: 'archivo',
    label: 'El último registro antes del silencio',
    body:
      'El archivo añade una última entrada, sin fecha de cierre: "Todo lo recogido aquí señala hacia el mismo sitio. Falta solo abrir la puerta correcta, el día correcto, a la hora correcta." Nada más. El resto, parece decir el castillo, no le corresponde contarlo todavía.'
  }
];

const SECRET_BY_ID = new Map(SECRETS.map((secret) => [secret.id, secret]));

export function getSecretById(id) {
  return SECRET_BY_ID.get(id) ?? null;
}
