const STORAGE_KEY = 'hogwarts:soundEnabled';
const MUSIC_SRC = '/assets/audio/theme.mp3';

function readStoredPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeStoredPreference(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    /* localStorage no disponible (modo privado, etc.): se ignora */
  }
}

/**
 * Controla el botón de sonido y la música de fondo (un único `<audio>`
 * que vive fuera de `[data-view-stage]`, así que sobrevive a cada
 * cambio de escena sin reiniciarse). Si el visitante ya lo había
 * activado en una visita anterior, se intenta reanudar sola al cargar
 * — los navegadores pueden bloquear esto sin una interacción previa;
 * si pasa, el botón vuelve a "apagado" en vez de quedar en un estado
 * que miente sobre lo que realmente suena.
 */
export function initSoundToggle(buttonEl) {
  if (!buttonEl) return;

  const audioEl = new Audio(MUSIC_SRC);
  audioEl.loop = true;
  audioEl.volume = 0.35;

  let enabled = readStoredPreference();
  applyState(buttonEl, enabled);

  if (enabled) {
    audioEl.play().catch(() => {
      enabled = false;
      writeStoredPreference(false);
      applyState(buttonEl, false);
    });
  }

  buttonEl.addEventListener('click', () => {
    enabled = !enabled;
    if (enabled) {
      audioEl.play().catch(() => {
        enabled = false;
      });
    } else {
      audioEl.pause();
    }
    writeStoredPreference(enabled);
    applyState(buttonEl, enabled);
  });
}

function applyState(buttonEl, enabled) {
  buttonEl.setAttribute('aria-pressed', String(enabled));
  buttonEl.setAttribute(
    'aria-label',
    enabled ? 'Silenciar sonido ambiental' : 'Activar sonido ambiental'
  );
  buttonEl.classList.toggle('sound-toggle--on', enabled);
}
