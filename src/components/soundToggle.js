const STORAGE_KEY = 'hogwarts:soundEnabled';

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
    /* localStorage no disponible (modo privado, etc.): se ignora en esta fase */
  }
}

/**
 * Controla el botón de sonido. En esta fase no reproduce audio real:
 * solo refleja y persiste la preferencia del visitante para que las
 * fases futuras puedan conectar la reproducción sin rediseñar el control.
 */
export function initSoundToggle(buttonEl) {
  if (!buttonEl) return;

  let enabled = readStoredPreference();
  applyState(buttonEl, enabled);

  buttonEl.addEventListener('click', () => {
    enabled = !enabled;
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
}
