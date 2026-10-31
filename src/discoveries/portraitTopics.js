/**
 * La conversación corta del retrato — una ampliación de
 * `discoveries/portraitContent.js`, no una duplicación: aquella sigue
 * siendo el saludo inicial (una línea por acto); esto es lo que se
 * puede preguntar DESPUÉS, con tres temas fijos (deliberadamente no un
 * árbol de diálogo: cada tema es una sola pregunta con una sola
 * respuesta, nunca una cadena de seguimientos).
 *
 * Cada tema es puro: recibe el contexto real ya calculado por quien
 * llama (acto narrativo, banderas de `castleSecretsStorage.js`) y
 * devuelve siempre el mismo texto para el mismo contexto — así se
 * puede probar con `node:test` que ninguna respuesta revela una
 * respuesta canónica, un regalo futuro o el mensaje final.
 */

const PERSONALITY_BY_ACT = {
  0: '"¿Quién soy?", repite, como si la pregunta le pareciera encantadora. "Alguien que lleva más tiempo en esta pared del que te gustaría imaginar. Vuelve cuando hayas avanzado un poco — las conversaciones cortas aburren a los retratos."',
  1: '"Un retrato, nada más", dice, con una media sonrisa que sugiere que es justo lo contrario. "Aunque algunos de nosotros recordamos mejor que otros a quién pintaron."',
  2: '"Esa pregunta ya me la hizo alguien más, hace mucho", murmura. "No voy a decirte qué le respondí. Pero tú vas por buen camino, si te sirve de algo."',
  3: '"Empiezo a pensar que de verdad quieres saberlo", dice el retrato, estudiándote con más atención que antes. "Eso ya dice algo de ti, aunque no de mí."',
  4: '"A estas alturas", dice, bajando la voz, "creo que mereces una respuesta mejor que un acertijo. Pero no me corresponde a mí dártela. Todavía no."'
};

const CASTLE_KNOWLEDGE_COY_BY_ACT = {
  0: '"¿Qué sé de este castillo?", dice el retrato. "Más de lo que tú sabes todavía, y menos de lo que crees que sé yo."',
  1: '"El castillo tiene más costumbres que paredes", responde. "Algunas se notan enseguida. Otras tardan noches en revelarse."',
  2: '"Hogwarts repite ciertos dibujos en sitios distintos", dice, eligiendo las palabras con cuidado. "Quien los nota todos, suele encontrar algo más al final."',
  3: '"Cada vez entiendes mejor cómo piensa este lugar", murmura el retrato. "Eso no es poco."',
  4: '"Lo que sé de este castillo", dice, "es que está a punto de dejar de guardarse las cosas para sí mismo."'
};

const CASTLE_KNOWLEDGE_RECOGNIZED_TEXT =
  '"Veo que ya encontraste el patrón", dice el retrato, con una sorpresa que no se molesta en disimular del todo. "Tres franjas, tres marcas, un trazo que las une. No todos llegan a unir las tres cosas. Felicidades — aunque sospecho que el castillo ya esperaba que lo hicieras."';

function getCastleKnowledgeResponse({ act = 0, castleSecrets = {} } = {}) {
  if (castleSecrets.threeMarksRecognized) return CASTLE_KNOWLEDGE_RECOGNIZED_TEXT;
  return CASTLE_KNOWLEDGE_COY_BY_ACT[act] ?? CASTLE_KNOWLEDGE_COY_BY_ACT[0];
}

const SEEN_SOMETHING_NEUTRAL_TEXT =
  '"¿Algo fuera de lugar?", repite el retrato, con una media sonrisa. "En este castillo, eso describe prácticamente todo. Vas a tener que ser más específica contigo misma."';

const SEEN_SOMETHING_EXPLORER_TEXT =
  '"Ah", dice el retrato, entrecerrando los ojos. "Ya has estado curioseando por ahí, ¿no? Se nota. Este castillo trata distinto a quien de verdad se molesta en mirar dos veces."';

function getSeenSomethingResponse({ castleSecrets = {} } = {}) {
  const hasExploredSomething = Boolean(
    castleSecrets.bookDiscovered || castleSecrets.collectibleFound || castleSecrets.mothWingNoticed
  );
  return hasExploredSomething ? SEEN_SOMETHING_EXPLORER_TEXT : SEEN_SOMETHING_NEUTRAL_TEXT;
}

/**
 * Los tres temas, en orden fijo. `resolve(context)` siempre devuelve
 * una cadena no vacía. `revealsDetail` es solo informativo (para
 * distinguir, en la interfaz, el tema que premia explorar de los que
 * son únicamente ambientación/personalidad).
 */
export const PORTRAIT_TOPICS = [
  {
    id: 'quien-eres',
    prompt: '¿Quién eres en realidad?',
    revealsDetail: false,
    resolve: ({ act = 0 } = {}) => PERSONALITY_BY_ACT[act] ?? PERSONALITY_BY_ACT[0]
  },
  {
    id: 'que-sabes',
    prompt: '¿Qué sabes de este castillo?',
    revealsDetail: true,
    resolve: getCastleKnowledgeResponse
  },
  {
    id: 'has-visto-algo',
    prompt: '¿Has visto algo fuera de lugar?',
    revealsDetail: true,
    resolve: getSeenSomethingResponse
  }
];

export function getPortraitTopicById(id) {
  return PORTRAIT_TOPICS.find((topic) => topic.id === id) ?? null;
}
