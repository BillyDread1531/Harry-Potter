/**
 * Contenido de la cadena «libro de la Biblioteca → eco en el Mapa» y
 * «retrato del Archivo → eco en la Biblioteca»: dos secretos breves que
 * conectan escenas distintas. El texto de cada eco se escribe para
 * tener sentido solo DESPUÉS de leer su origen, pero nunca depende de
 * JavaScript para "saber" eso — cada escena decide por su cuenta,
 * leyendo el mismo progreso guardado (`discoveries/castleSecretsStorage.js`),
 * si debe mostrar su eco. Nada aquí nombra objetos, regalos, el
 * Pensadero ni la respuesta de ningún expediente.
 */

export const BOOK_ANNOTATION =
  'El libro no tiene título en el lomo, solo una mancha de tinta vieja. En la última página, alguien escribió, con una letra apretada: «Si el castillo quisiera esconder algo de verdad, no lo guardaría bajo llave. Lo dibujaría en un margen, donde nadie mira dos veces.» Debajo, un boceto diminuto: un libro, entreabierto, casi idéntico a este.';

/** Eco en el Mapa, visible solo después de descubrir el libro. */
export const MAP_BOOK_ECHO_TEXT =
  'En una esquina del pergamino, donde antes no había nada, aparece ahora el boceto diminuto de un libro entreabierto — el mismo trazo que viste en la última página de un libro de la Biblioteca.';

/** Eco en la Biblioteca, visible solo después de hablar con el retrato del Archivo. */
export const LIBRARY_PORTRAIT_ECHO_TEXT =
  'Una vela que llevaba años apagada, al fondo de la balconada, arde ahora con una llama pequeña y constante. Nadie la encendió. O, más precisamente: nadie que tú hayas visto.';
