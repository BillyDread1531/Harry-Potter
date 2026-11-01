/**
 * Configuración de los lugares del castillo. Cada sección describe un
 * destino alcanzable desde el vestíbulo mediante una interacción del
 * mundo (no una pestaña), con la variante de transición cinematográfica
 * que debe reproducirse al entrar.
 *
 * El Pensadero es distinto: no es `hidden` de forma fija, se desbloquea
 * solo, en tiempo real, el 15 de noviembre a las 20:00 hora de
 * Guatemala — mismo instante que ya calcula `calendarEngine.getUnlockInstant(15)`
 * para el último expediente (el caso especial de las 20:00 en vez de
 * medianoche ya vive ahí, no se duplica aquí).
 */
import { getUnlockInstant } from '../calendar/calendarEngine.js';

export const SECTIONS = [
  {
    id: 'vestibulo',
    label: 'Vestíbulo',
    kind: 'vestibulo',
    title: 'El Vestíbulo'
  },
  {
    id: 'expedientes',
    label: 'Expedientes',
    kind: 'scene',
    icon: 'scroll',
    transitionVariant: 'unfurl',
    title: 'Los Expedientes',
    eyebrow: 'Un escritorio a oscuras',
    description:
      'Un escritorio de roble espera los quince expedientes fechados, uno por cada noche hasta el 15 de noviembre de 2026. Algunos ya están disponibles — otros aún aguardan su fecha.',
    pendingItems: []
  },
  {
    id: 'mapa',
    label: 'Mapa del castillo',
    kind: 'scene',
    icon: 'map',
    transitionVariant: 'unfurl',
    title: 'El Mapa del Castillo',
    eyebrow: 'Un pergamino que empieza a despertar',
    description:
      'Sobre la mesa, el pergamino ya reconoce algunos rincones del castillo. Tócalos para ver qué revelan — algunos todavía esperan a que avances más en los expedientes.',
    pendingItems: []
  },
  {
    id: 'biblioteca',
    label: 'Biblioteca',
    kind: 'scene',
    icon: 'book',
    transitionVariant: 'door',
    title: 'La Biblioteca',
    eyebrow: 'Estanterías que llegan al techo',
    description:
      'El polvo flota bajo la luz cálida de las lámparas. Entre estos volúmenes ya esperan algunas curiosidades del mundo mágico — otras solo aparecerán conforme avances.',
    pendingItems: []
  },
  {
    id: 'desafios',
    label: 'Sala de los Menesteres',
    kind: 'scene',
    icon: 'wand',
    transitionVariant: 'wallShift',
    title: 'Sala de los Menesteres',
    eyebrow: 'La pared recuerda lo que necesitas',
    description:
      'La sala cambia con lo que ya has recorrido: algunas noches apenas una vela, otras bastante más. Hay algo aquí dentro que todavía no es lo que parece.',
    pendingItems: []
  },
  {
    id: 'archivo',
    label: 'Archivo secreto',
    kind: 'scene',
    icon: 'key',
    transitionVariant: 'revealPanel',
    title: 'El Archivo Secreto',
    eyebrow: 'Una cerradura muy antigua',
    description: 'Detrás de este compartimento se guardan los secretos que ya has descubierto.',
    pendingItems: []
  },
  {
    id: 'pensadero',
    label: 'Pensadero',
    kind: 'scene',
    icon: 'basin',
    transitionVariant: 'fade-dust',
    title: 'El Pensadero',
    unlockLabel: '15 de noviembre de 2026 · 8:00 p. m. (hora de Guatemala)'
  }
];

export const DEFAULT_SECTION_ID = 'vestibulo';

export function getSectionById(id) {
  return SECTIONS.find((section) => section.id === id);
}

export function isReachable(id, referenceInstant = new Date()) {
  const section = getSectionById(id);
  if (!section) return false;
  if (section.id === 'pensadero') {
    if (isDevPensaderoUnlockEnabled()) return true;
    const unlock = getUnlockInstant(15);
    return Boolean(unlock) && referenceInstant.getTime() >= unlock.getTime();
  }
  return true;
}

/**
 * Atajo de prueba solo para `npm run dev`: se activa a mano desde la
 * consola del navegador con `localStorage.setItem('hogwarts:devUnlockPensadero', 'true')`.
 * `import.meta.env?.DEV` es `false` en el build de producción, así que
 * esta rama queda eliminada del bundle que se sube a internet.
 */
function isDevPensaderoUnlockEnabled() {
  if (!import.meta.env?.DEV) return false;
  try {
    return localStorage.getItem('hogwarts:devUnlockPensadero') === 'true';
  } catch {
    return false;
  }
}
