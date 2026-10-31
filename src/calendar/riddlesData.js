/**
 * Contenido de los quince acertijos — versión definitiva, aprobada por
 * el propietario del proyecto. El texto de cada `body`, la
 * `canonicalAnswer`, `acceptedVariants`, `plannedGift` y
 * `filmReference` son la fuente de verdad acordada; no deben
 * sustituirse por otros objetos ni reordenarse.
 *
 * IMPORTANTE para quien edite este archivo o escriba la vista: `caseLabel`
 * y `body` son lo único que debe mostrarse ANTES de resolver. `caseLabel`
 * es una marca de archivo neutra (un número, un sello, una clasificación)
 * que NUNCA debe sugerir el tema ni la respuesta del día. `title` es un
 * nombre interno para organizar el contenido (algunos sí describen la
 * respuesta) y no debe mostrarse en la interfaz en ningún momento. Los
 * campos `canonicalAnswer`, `acceptedVariants`, `explanation`,
 * `filmReference` y `plannedGift` nunca deben interpolarse en el texto
 * visible de la ficha mientras el acertijo no se haya resuelto.
 * `explanation` y `filmReference` sí pueden mostrarse DESPUÉS de
 * resolver (lo pide el diseño); `plannedGift` es exclusivamente para un
 * futuro mecanismo administrativo — no se muestra nunca en la
 * experiencia de Andrea, ni antes ni después de resolver, porque
 * revelaría el regalo físico por adelantado.
 *
 * No hay pistas progresivas: se eliminaron por completo, a propósito.
 *
 * Basados exclusivamente en las ocho películas.
 */

export const RIDDLES = [
  {
    day: 1,
    title: 'La invitación',
    caseLabel: 'SELLO INTACTO',
    body: `No tengo alas, pero puedo cruzar distancias que separan dos mundos.

No tengo voz, pero mis palabras pueden cambiar el rumbo de una vida.

Llevo una promesa escrita antes de que quien la recibe conozca su destino.

A veces llego cuando todo parece ordinario y convierto una puerta cerrada en el comienzo de algo extraordinario.

¿Qué soy?`,
    canonicalAnswer: 'Carta de Hogwarts',
    acceptedVariants: ['carta de hogwarts', 'carta de admision a hogwarts', 'carta de aceptacion de hogwarts'],
    explanation:
      'Las pistas describen un mensaje que viaja entre dos mundos y anuncia un destino antes de que quien lo recibe lo conozca: así llega la primera carta de aceptación a Hogwarts.',
    filmReference: 'La llegada de las cartas de Hogwarts a los Dursley, en Harry Potter y la piedra filosofal.',
    plannedGift: 'Carta personalizada de Hogwarts.',
    fragment: 'Entre tantas señales,',
    reactionTone: 'gold',
    chapter:
      'La carta llega como debía, pero algo en el sello te hace dudar: el lacre no es el que usan normalmente para las admisiones. Cuando lo rompes, por un instante te parece ver, grabada en el borde, el ala de una polilla. Decides que fue un truco de la luz — todavía no tienes motivos para pensar otra cosa.',
    reactions: {
      correct: 'El sello se rompe solo, como si hubiera esperado esta respuesta.',
      incorrect: 'El sobre permanece cerrado. Todavía no es la palabra correcta.'
    }
  },
  {
    day: 2,
    title: 'Un bocado extraordinario',
    caseLabel: 'HALLAZGO MENOR',
    body: `En el mundo de los muggles, lo dulce suele quedarse quieto y obedecer a quien lo sostiene.

En el mío, hasta un pequeño capricho puede escapar, saltar o sorprender a quien intenta atraparlo.

Tengo la forma de una criatura en miniatura, aunque no necesito respirar ni vivir para dar un buen salto.

Y quien me abre quizá termine persiguiendo su postre en vez de comérselo.

¿Qué soy?`,
    canonicalAnswer: 'Rana de chocolate',
    acceptedVariants: ['ranas de chocolate', 'rana chocolate', 'rana de chocolate de harry potter'],
    explanation:
      'La descripción de un dulce capaz de escapar de un salto, que guarda una pequeña criatura en miniatura, corresponde a la rana de chocolate, que brinca al abrir el envoltorio.',
    filmReference: 'El viaje en el Expreso de Hogwarts, en Harry Potter y la piedra filosofal.',
    plannedGift: 'Caja de ranas de chocolate y grageas de todos los sabores.',
    fragment: 'el castillo no elige por ti —',
    reactionTone: 'gold',
    chapter:
      'El envoltorio de la rana lleva impreso un cromo distinto a los demás: no un mago famoso, sino un escudo liso, sin nombre. Nadie en la mesa recuerda haber visto antes esa versión. Alguien comenta, entre risas, que tal vez el castillo también tiene sus bromas privadas — tú no estás tan segura de que sea una broma.',
    reactions: {
      correct: 'Algo salta de alegría dentro del envoltorio.',
      incorrect: 'El envoltorio sigue quieto. No ha reconocido tu respuesta.'
    }
  },
  {
    day: 3,
    title: 'La decisión',
    caseLabel: 'ARCHIVO SELLADO',
    body: `No soy una corona, aunque me colocan sobre una cabeza.

No gobierno un reino, aunque mi palabra puede cambiar el lugar al que alguien pertenece.

Escucho aquello que otros no pueden escuchar y busco más allá de lo que se muestra por fuera.

Mi elección puede revelar una inclinación, pero no escribe por completo el futuro de quien la recibe.

¿Qué soy?`,
    canonicalAnswer: 'Sombrero Seleccionador',
    acceptedVariants: ['sombrero seleccionador', 'sombrero de seleccion', 'el sombrero de hogwarts'],
    explanation:
      'El objeto que se posa sobre la cabeza, escucha lo que hay dentro de cada persona y reparte un lugar sin determinar el destino completo es el Sombrero Seleccionador.',
    filmReference: 'La ceremonia de selección, en Harry Potter y la piedra filosofal.',
    plannedGift: 'Playera personalizada del Sombrero Seleccionador.',
    fragment: 'solo te muestra caminos.',
    reactionTone: 'violet',
    chapter:
      'El Sombrero tarda un instante de más antes de hablar, como si dudara entre dos respuestas y descartara una de ellas. "Ya había decidido esto antes", murmura, tan bajo que casi no lo escuchas, "hace más tiempo del que imaginas." No aclara a qué se refiere, y cuando preguntas, vuelve a quedarse en silencio, como cualquier sombrero normal.',
    reactions: {
      correct: 'Una voz satisfecha murmura que la elección ya está hecha.',
      incorrect: 'El silencio responde primero. Inténtalo de nuevo.'
    }
  },
  {
    day: 4,
    title: 'Lo que no se deja atrapar',
    caseLabel: 'RASTRO INCOMPLETO',
    body: `Soy pequeña, pero puedo decidir el final de una búsqueda enorme.

Mi cuerpo reluce como si guardara un fragmento de sol, y a mis costados nacen dos movimientos que nunca descansan.

No basta con correr detrás de mí: hace falta paciencia, precisión y saber reconocer el instante correcto.

Y cuando por fin me alcanzan, no siempre se revela de inmediato todo lo que guardo.

¿Qué soy?`,
    canonicalAnswer: 'Snitch dorada',
    acceptedVariants: ['snitch dorada', 'snitch', 'snitch de oro', 'snitch dorada de quidditch'],
    explanation:
      'Algo pequeño y dorado, con dos alas que nunca se detienen y que decide el final de un juego mucho más grande, describe a la Snitch dorada.',
    filmReference: 'Los partidos de Quidditch y la primera captura de Harry, en Harry Potter y la piedra filosofal.',
    plannedGift: 'Llavero u ornamento dorado inspirado en la Snitch.',
    fragment: 'Yo elegí uno,',
    reactionTone: 'gold',
    chapter:
      'Encuentras la Snitch quieta, posada sobre un alféizar, en un ala que nadie usa desde hace años. Las snitches no se quedan quietas, y mucho menos esperando. Cuando la recoges, sus alas se abren apenas un segundo, no para huir, sino —te parece— para dejarte ver algo grabado en el metal: la misma silueta de polilla que ya has visto dos veces esta noche. Empiezas a sospechar que ya no son casualidades.',
    reactions: {
      correct: 'Un destello dorado cruza el aire y se detiene ante ti.',
      incorrect: 'Nada se deja atrapar todavía.'
    }
  },
  {
    day: 5,
    title: 'Los pasos que no deberían verse',
    caseLabel: 'REGISTRO CONFIDENCIAL',
    body: `Mi superficie parece guardar únicamente líneas y espacios, pero sé mucho más de lo que aparento.

No necesito ojos para reconocer a quien camina por un lugar escondido, ni voz para delatar movimientos que alguien preferiría mantener en secreto.

Conozco pasadizos, recorridos y presencias; puedo convertir un castillo conocido en un laberinto lleno de posibilidades.

Pero mi verdadero poder despierta cuando alguien sabe cómo hacerme hablar.

¿Qué soy?`,
    canonicalAnswer: 'Mapa del Merodeador',
    acceptedVariants: ['mapa del merodeador', 'mapa de los merodeadores', 'el mapa'],
    explanation:
      'Una superficie que conoce pasadizos y presencias ocultas, y que solo revela sus secretos a quien sabe activarla con las palabras correctas, es el Mapa del Merodeador.',
    filmReference: 'Fred y George entregan el mapa a Harry, en Harry Potter y el prisionero de Azkaban.',
    plannedGift: 'Taza sublimada inspirada en el Mapa del Merodeador.',
    fragment: 'hace tiempo,',
    reactionTone: 'silver',
    chapter:
      'El mapa dibuja, con total normalidad, los pasillos que ya conoces — y luego, sin que nadie lo pida, traza un corredor que no existe en ningún plano del castillo, señalado apenas con una inicial que no reconoces. Cuando intentas seguirlo al día siguiente, el pasillo ya no aparece marcado. El mapa, al parecer, solo lo muestra cuando quiere que lo veas.',
    reactions: {
      correct: 'La tinta traza un camino que antes no estaba ahí.',
      incorrect: 'El pergamino sigue en blanco.'
    }
  },
  {
    day: 6,
    title: 'Lo que desaparece sin marcharse',
    caseLabel: 'AUSENCIA REGISTRADA',
    body: `Puedo cubrir a alguien sin convertirme en una pared.

No borro sus pasos ni detengo el ruido que produce; simplemente hago que los ojos ajenos no encuentren aquello que tienen delante.

He pasado de mano en mano y mi valor no depende de cuánto brillo tenga, sino de lo que permite hacer sin ser visto.

Quien me usa debe recordar que ocultarse no significa dejar de existir.

¿Qué soy?`,
    canonicalAnswer: 'Capa de invisibilidad',
    acceptedVariants: ['capa de invisibilidad', 'capa invisible', 'capa que hace invisible', 'capa de harry potter'],
    explanation:
      'Cubrir sin ser pared, sin borrar los pasos ni el ruido, describe a la Capa de Invisibilidad: oculta a la vista, no detiene nada más.',
    filmReference: 'Harry explora Hogwarts con la capa, en Harry Potter y la piedra filosofal.',
    plannedGift: 'Toalla facial personalizada.',
    fragment: 'sin mapa',
    reactionTone: 'silver',
    chapter:
      'La capa huele, muy débilmente, a algo reciente — a alguien que la usó hace poco, no hace siglos. Eso no debería ser posible si ha estado guardada todo este tiempo. Empiezas a entender que no estás reconstruyendo una historia vieja: alguien, no hace mucho, caminó por este castillo sin querer ser visto, dejando estas señales a propósito, para que tú las encontraras.',
    reactions: {
      correct: 'El aire se siente distinto, como si algo hubiera dejado de ocultarse.',
      incorrect: 'No sientes nada entre los dedos.'
    }
  },
  {
    day: 7,
    title: 'Una esencia imposible de confundir',
    caseLabel: 'CLASIFICACIÓN: DESCONOCIDA',
    body: `No soy una poción para curar una herida ni un remedio para recuperar fuerzas.

Mi poder se acerca a algo que no siempre obedece a la razón.

Para cada persona puedo tener un aroma distinto, porque no revelo una única esencia: reflejo aquello que despierta un deseo profundo.

Quien intenta comprenderme descubre que los sentimientos también pueden dejar una huella invisible.

¿Qué soy?`,
    canonicalAnswer: 'Amortentia',
    acceptedVariants: ['amortentia', 'pocion amortentia', 'pocion de amor amortentia'],
    explanation:
      'Una esencia que no cura ni fortalece, sino que refleja el deseo de quien la huele de un modo distinto para cada persona, es Amortentia.',
    filmReference: 'La clase de pociones de Slughorn, en Harry Potter y el misterio del príncipe.',
    plannedGift: 'Vela o perfume con etiqueta personalizada.',
    fragment: 'ni hechizo que lo garantizara.',
    reactionTone: 'rose',
    chapter:
      'El aroma del frasco te detiene antes de que puedas nombrarlo: no es un perfume de catálogo ni una esencia de manual, sino algo que reconoces de memoria, aunque no sepas explicar por qué está aquí, en un frasco que lleva años cerrado. Por primera vez esta noche, la sensación no es de desconcierto sino de ternura, como si alguien hubiera elegido justamente ese recuerdo para dejarlo esperándote.',
    reactions: {
      correct: 'Un aroma familiar y cálido llena el aire por un instante.',
      incorrect: 'El frasco permanece cerrado, sin ningún aroma reconocible.'
    }
  },
  {
    day: 8,
    title: 'La forma de lo que te protege',
    caseLabel: 'MEMORIA PROTEGIDA',
    body: `No soy un animal común, aunque puedo adoptar su silueta.

No nazco de la oscuridad, sino de una luz interior que debe sostenerse incluso cuando todo alrededor parece perdido.

Mi presencia puede hacer retroceder aquello que se alimenta de la desesperación.

No todos consiguen darme forma: recordar algo feliz no siempre basta si uno no logra aferrarse a ello.

¿Qué soy?`,
    canonicalAnswer: 'Patronus',
    acceptedVariants: ['patronus', 'encantamiento patronus', 'hechizo patronus'],
    explanation:
      'Una forma animal que nace de un recuerdo feliz y que repliega la desesperación describe al Patronus.',
    filmReference: 'El Patronus de Harry, en Harry Potter y el prisionero de Azkaban.',
    plannedGift: 'Taza con Teo representado como un perro plateado, inspirado en un Patronus.',
    fragment: 'Cada prueba que superamos',
    reactionTone: 'silver',
    chapter:
      'En un frasco de cristal, abandonado en un rincón del aula, encuentras el recuerdo sin reclamar de un Patronus, suspendido como un hilo de plata. No tiene nombre de mago asociado, solo una fecha — y la fecha, cuando la revisas, corresponde a un día de noviembre de un año que todavía no ha llegado. El castillo no suele equivocarse con las fechas. Si esto es un recuerdo, es uno que todavía no ha terminado de ocurrir.',
    reactions: {
      correct: 'Una silueta plateada se asoma, cálida, antes de desvanecerse.',
      incorrect: 'La oscuridad no retrocede todavía.'
    }
  },
  {
    day: 9,
    title: 'Una palabra contra la oscuridad',
    caseLabel: 'FRAGMENTO RECUPERADO',
    body: `No soy una llama, pero puedo llenar de claridad un espacio.

No necesito madera, aceite ni una mecha para cumplir mi propósito.

Mi nombre es breve y mi efecto parece sencillo, aunque en un lugar oscuro puede cambiar por completo lo que eres capaz de descubrir.

A veces, el primer paso para encontrar el camino no consiste en avanzar, sino en ver.

¿Qué palabra activa este hechizo?`,
    canonicalAnswer: 'Lumos',
    acceptedVariants: ['lumos', 'hechizo lumos'],
    explanation: 'La palabra breve que no es fuego pero ilumina un espacio oscuro es el hechizo Lumos.',
    filmReference: 'Harry utiliza su varita para iluminar espacios oscuros a lo largo de la saga cinematográfica.',
    plannedGift: 'Lámpara de frasco con luces LED.',
    fragment: 'dejó una marca,',
    reactionTone: 'gold',
    chapter:
      'Cuando pronuncias el hechizo, la luz no solo ilumina: por un segundo deja ver una inscripción en la pared que llevaba años cubierta de polvo. No es una advertencia, sino una instrucción: "Guárdalo fragmentado. Que nadie lo encuentre entero antes de tiempo, salvo quien sepa buscarlo pieza por pieza." No es magia oscura protegiéndose de alguien. Es alguien protegiendo algo con muchísimo cuidado.',
    reactions: {
      correct: 'Una luz suave aparece en la punta de tu varita imaginaria.',
      incorrect: 'La oscuridad sigue intacta.'
    }
  },
  {
    day: 10,
    title: 'La huella de una mente brillante',
    caseLabel: 'LEGADO EN DISPUTA',
    body: `No soy un libro, aunque guardo el legado de una inteligencia extraordinaria.

No soy una corona real, aunque descanso sobre la cabeza de quien me lleva.

Mi creadora quiso que aquello que la distinguía no se perdiera con el tiempo; sin embargo, hasta el orgullo más brillante puede dejar una grieta por donde entra la oscuridad.

Mi historia demuestra que un objeto puede conservar una idea y también cargar con las consecuencias de quien quiso poseerla.

¿Qué soy?`,
    canonicalAnswer: 'Diadema de Ravenclaw',
    acceptedVariants: ['diadema de ravenclaw', 'diadema perdida de ravenclaw', 'diadema de rowena ravenclaw'],
    explanation:
      'Un objeto que corona la cabeza y guarda el legado de su creadora, pero que termina dañado por el orgullo de quien quiso poseerlo, describe a la Diadema de Ravenclaw.',
    filmReference: 'La búsqueda de la diadema, en Harry Potter y las reliquias de la muerte: Parte 2.',
    plannedGift: 'Diadema o banda para el cabello.',
    fragment: 'como esta,',
    reactionTone: 'violet',
    chapter:
      'La diadema te recuerda, sin palabras, que hasta el legado más brillante puede convertirse en una carga si se guarda por orgullo. Pero junto a esta copia en particular hay una nota breve, sin firma: "Lo que vale la pena conservar no es lo que impresiona, sino lo que se recuerda con cariño." Alguien, en algún punto, decidió qué clase de legado quería dejar — y no fue este.',
    reactions: {
      correct: 'Un brillo antiguo recorre el borde del objeto, como reconociendo a quien lo nombra.',
      incorrect: 'El objeto permanece opaco, indiferente.'
    }
  },
  {
    day: 11,
    title: 'Una libertad inesperada',
    caseLabel: 'NOTA SIN FIRMA',
    body: `Parezco una prenda sencilla y, sin embargo, mi destino puede cambiar una vida.

No necesito oro ni una ceremonia para convertirme en símbolo de libertad.

En manos equivocadas soy apenas algo que se usa y se desecha; en las correctas puedo significar que alguien deja de pertenecerle a otra persona.

A veces, el objeto más humilde tiene más poder que una orden pronunciada por alguien importante.

¿Qué soy?`,
    canonicalAnswer: 'Calcetín de Dobby',
    // Deliberadamente SIN "calcetin"/"un calcetin" a secas (la
    // auditoría narrativa señaló que un "calcetín" genérico, sin
    // ningún vínculo con Dobby, no demuestra haber resuelto el
    // acertijo). Todas las variantes que quedan tienen 16+ caracteres,
    // así que la tolerancia a errores tipográficos del validador
    // (acotada por diferencia de longitud) nunca puede "alcanzar" una
    // respuesta tan corta como "calcetin" por accidente — verificado
    // en `riddleValidator.test.js`.
    acceptedVariants: ['calcetin de dobby', 'el calcetin de dobby', 'un calcetin de dobby'],
    explanation: 'Una prenda humilde capaz de liberar a quien la recibe de un amo describe al calcetín que libera a Dobby.',
    filmReference: 'Harry libera a Dobby mediante el truco del calcetín, en Harry Potter y la cámara secreta.',
    plannedGift: 'Calcetines inspirados en Dobby.',
    fragment: 'pequeña pero real.',
    reactionTone: 'gold',
    chapter:
      'El calcetín libera algo mucho más pequeño que una gran revelación, y por eso mismo te detiene: entiendes, de golpe, que esta historia no se trata de atrapar a nadie ni de ganar nada. Se trata de dejar que alguien decida quedarse, libremente, en vez de obligarlo. Es la primera vez que la aventura se siente menos como un misterio por resolver y más como una pregunta dirigida directamente a ti.',
    reactions: {
      correct: 'Algo pequeño cae al suelo, libre por fin.',
      incorrect: 'La prenda sigue atada a su dueño anterior.'
    }
  },
  {
    day: 12,
    title: 'Lo que tres hermanos dejaron repartido',
    caseLabel: 'TRES PIEZAS, UN SOLO EXPEDIENTE',
    body: `Nací de un cuento que se contaba antes de dormir, y tres hermanos lo convirtieron en una advertencia que todavía se repite.

No soy un solo objeto: somos tres, aunque solo quien conoce el cuento completo sabe que pertenecemos juntos.

Uno oculta a quien lo lleva de cualquier mirada, sin volverlo invencible. Otro promete devolver lo que ya se perdió, aunque lo que regresa nunca es idéntico a lo que se fue. El tercero no multiplica el poder de quien lo sostiene: pone a prueba si sabe cuándo dejar de usarlo.

Juntos no vencen a la muerte. Como mucho, enseñan a dejar de temerle.

¿Qué somos?`,
    canonicalAnswer: 'Reliquias de la Muerte',
    acceptedVariants: ['las tres reliquias', 'las reliquias de la muerte', 'reliquias de la muerte'],
    explanation:
      'El cuento de los tres hermanos que desafían a la muerte, y los tres objetos que solo cobran sentido reunidos —el que oculta, el que devuelve un eco de lo perdido y el que pone límite al propio poder— son las Reliquias de la Muerte.',
    filmReference:
      'La fábula de los tres hermanos y la búsqueda de las Reliquias, en Harry Potter y las reliquias de la muerte: Parte 1 y Parte 2.',
    plannedGift: 'Separador de libros con la forma del símbolo de las Reliquias de la Muerte (triángulo, círculo y línea).',
    fragment: 'No necesito una profecía',
    reactionTone: 'silver',
    chapter:
      'Entiendes, por fin, la forma del cuento completo: tres objetos que nadie debería buscar juntos, no porque otorguen poder, sino porque enseñan, cada uno a su manera, qué se hace con lo que no se puede recuperar del todo. No hay aquí una amenaza ni un villano escondido, solo alguien que entendió hace tiempo que lo más difícil no es conseguir algo extraordinario, sino saber qué hacer con ello después. Empiezas a sospechar que todo este recorrido fue construido, pieza por pieza, para alguien muy concreto. Para ti.',
    reactions: {
      correct: 'Un triángulo, un círculo y una línea se dibujan solos sobre el papel, como si por fin alguien los hubiera nombrado bien.',
      incorrect: 'El papel permanece en blanco. Ningún símbolo quiere aparecer todavía.'
    }
  },
  {
    day: 13,
    title: 'Un lugar que aparece cuando hace falta',
    caseLabel: 'SELLO ROTO',
    body: `No permanezco igual para todos, ni me encuentro siempre donde alguien espera hallarme.

Puedo ofrecer refugio, herramientas o un espacio adecuado para una necesidad que otros no conocen.

No basta con desear cualquier cosa: quien me busca debe comprender qué le hace falta de verdad.

Cuando cumplo mi función, parezco haber estado esperando a que alguien aprendiera a pedirme lo correcto.

¿Qué lugar soy?`,
    canonicalAnswer: 'Sala de los Menesteres',
    acceptedVariants: [
      'sala de los menesteres',
      'habitacion de los menesteres',
      'cuarto de los menesteres',
      'sala que aparece cuando se necesita'
    ],
    explanation:
      'Un lugar que cambia según quien lo necesita, y que solo aparece ante quien sabe pedir lo correcto, es la Sala de los Menesteres.',
    filmReference: 'El refugio de la resistencia estudiantil, en Harry Potter y la Orden del Fénix.',
    plannedGift: 'Cojín o almohada inspirada en Ravenclaw.',
    fragment: 'para saber',
    reactionTone: 'violet',
    chapter:
      'La puerta aparece en el pasillo exactamente cuando por fin sabes qué preguntarle al castillo: no "qué está pasando", sino "para quién es esto". La sala, cuando entras, no te ofrece un refugio ni una herramienta — te ofrece un pasillo más, uno nuevo, que antes no estaba ahí. El castillo, parece, también estaba esperando que llegaras a esta pregunta.',
    reactions: {
      correct: 'Una puerta se dibuja donde antes solo había piedra.',
      incorrect: 'La pared permanece lisa, sin puertas.'
    }
  },
  {
    day: 14,
    title: 'El deseo que te devuelve la mirada',
    caseLabel: 'PIEZA BAJO RESGUARDO',
    body: `No muestro necesariamente aquello que tienes delante, sino aquello que más anhelas encontrar.

Quien me contempla puede olvidar el mundo real por quedarse frente a una imagen que parece perfecta.

No concedo lo que enseño, ni convierto el deseo en destino.

Mi peligro está en confundir la promesa de una imagen con la vida que todavía puede construirse fuera de ella.

¿Qué soy?`,
    canonicalAnswer: 'Espejo de Oesed',
    acceptedVariants: ['espejo de oesed', 'espejo del deseo', 'espejo que muestra los deseos', 'espejo de los deseos'],
    explanation:
      'Un reflejo que no muestra lo que eres sino lo que deseas, y que puede atrapar a quien se queda mirándolo, es el Espejo de Oesed.',
    filmReference: 'Harry descubre el espejo, en Harry Potter y la piedra filosofal.',
    plannedGift: 'Espejo o marco con una fotografía de la pareja.',
    fragment: 'que el lugar',
    reactionTone: 'rose',
    chapter:
      'Te paras frente al espejo esperando ver un deseo imposible, como advierte siempre quien lo conoce. Pero esta vez lo que ves no se siente lejano ni inalcanzable: se siente como algo que ya está a punto de suceder, en una fecha que ya conoces. Por primera vez en toda la noche, no sientes la necesidad de entender el misterio — solo quieres llegar al final de él.',
    reactions: {
      correct: 'El cristal se empaña, como si también suspirara.',
      incorrect: 'Tu reflejo no dice nada todavía.'
    }
  },
  {
    day: 15,
    title: 'Lo que permanece cuando el instante termina',
    caseLabel: 'ÚLTIMO REGISTRO',
    body: `No soy un espejo que devuelve deseos ni un libro que conserva palabras.

En mi interior, lo vivido puede volver a desplegarse ante los ojos de quien se acerca.

Puedo guardar pensamientos y recuerdos de una forma que permite observarlos desde fuera, como si el tiempo hubiera dejado una puerta entreabierta.

Pero ninguna imagen sustituye el momento original: su verdadero valor está en lo que nos permite recordar.

¿Qué soy?`,
    canonicalAnswer: 'Pensadero',
    acceptedVariants: ['pensadero', 'el pensadero', 'recipiente de recuerdos de dumbledore'],
    explanation:
      'Un recipiente donde los recuerdos pueden volver a vivirse desde fuera, sin sustituir el momento original, es el Pensadero.',
    filmReference: 'Dumbledore utiliza el Pensadero para explorar recuerdos en varias películas de la saga.',
    plannedGift: 'Álbum de fotografías y experiencia final de recuerdos compartidos.',
    fragment: 'que más quiero es a tu lado.',
    reactionTone: 'silver',
    chapter:
      'Encuentras el Pensadero en una sala que no recordabas haber visto antes, aunque llevas noches recorriendo este castillo. No está encendido, todavía: un sello plateado, con la forma exacta de la polilla que has visto fragmentada por toda esta historia, lo mantiene cerrado. El castillo, por fin, deja de esconder cosas. Solo falta esperar el momento que ya estaba escrito desde el principio.',
    reactions: {
      correct: 'Una luz plateada se agita suavemente en su interior.',
      incorrect: 'El recipiente permanece quieto y en silencio.'
    }
  }
];

const RIDDLE_BY_DAY = new Map(RIDDLES.map((riddle) => [riddle.day, riddle]));

export function getRiddleForDay(day) {
  return RIDDLE_BY_DAY.get(day) ?? null;
}

/**
 * Los fragmentos obtenidos, en orden de día, a partir de un estado de
 * calendario ya resuelto (ver `calendarEngine.getCalendarState`). Como
 * el fragmento de cada día es contenido estático indexado por día (no
 * una lista a la que se "agrega" nada), abrir el mismo expediente
 * varias veces nunca puede duplicar su fragmento.
 */
export function getEarnedFragments(calendarState) {
  return calendarState
    .filter((state) => state.solved)
    .map((state) => getRiddleForDay(state.day)?.fragment)
    .filter(Boolean);
}
