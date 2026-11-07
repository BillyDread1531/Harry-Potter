const STORAGE_KEY = 'hogwarts:soundEnabled';
const MUSIC_SRC = '/assets/audio/theme.mp3';
const BASE_VOLUME = 0.35;
const FADE_MS = 500;
const FADE_STEPS = 10;

let audioEl = null;
let enabled = false;
let currentLogicalSrc = MUSIC_SRC;
let fadeTimer = null;

function readStoredPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeStoredPreference(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* localStorage no disponible (modo privado, etc.): se ignora */
  }
}

function fadeTo(targetVolume, onDone) {
  if (!audioEl) return;
  if (fadeTimer) clearInterval(fadeTimer);
  const stepMs = FADE_MS / FADE_STEPS;
  const startVolume = audioEl.volume;
  const delta = (targetVolume - startVolume) / FADE_STEPS;
  let step = 0;
  fadeTimer = setInterval(() => {
    step += 1;
    audioEl.volume = Math.max(0, Math.min(1, startVolume + delta * step));
    if (step >= FADE_STEPS) {
      clearInterval(fadeTimer);
      fadeTimer = null;
      onDone?.();
    }
  }, stepMs);
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

  audioEl = new Audio(MUSIC_SRC);
  audioEl.loop = true;
  audioEl.volume = BASE_VOLUME;

  enabled = readStoredPreference();
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
      audioEl.src = currentLogicalSrc;
      audioEl.volume = BASE_VOLUME;
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

/**
 * Cambia la música de fondo a una pista distinta, con un fundido
 * breve, para mientras dura una escena especial (el Pensadero). No
 * hace nada audible si el sonido está desactivado, pero igual queda
 * recordada: si quien visita activa el sonido estando todavía en esa
 * escena, suena la pista alterna y no la de siempre.
 */
export function playAlternateTrack(src) {
  currentLogicalSrc = src;
  if (!audioEl || !enabled) return;
  fadeTo(0, () => {
    audioEl.src = src;
    audioEl.play().catch(() => {});
    fadeTo(BASE_VOLUME);
  });
}

/** Vuelve a la música principal (ver `playAlternateTrack`). */
export function restoreMainTrack() {
  currentLogicalSrc = MUSIC_SRC;
  if (!audioEl || !enabled) return;
  fadeTo(0, () => {
    audioEl.src = MUSIC_SRC;
    audioEl.play().catch(() => {});
    fadeTo(BASE_VOLUME);
  });
}

function applyState(buttonEl, isEnabled) {
  buttonEl.setAttribute('aria-pressed', String(isEnabled));
  buttonEl.setAttribute(
    'aria-label',
    isEnabled ? 'Silenciar sonido ambiental' : 'Activar sonido ambiental'
  );
  buttonEl.classList.toggle('sound-toggle--on', isEnabled);
}
