const STORAGE_KEY = 'hogwarts:ambientEnabled';

/**
 * Controla si la capa ambiental (velas, partículas, resplandores) está
 * activa. No se expone todavía un control visible —eso llegará en una
 * fase posterior—, pero la preferencia ya se guarda y se aplica mediante
 * el atributo `data-ambient` en <html>, que `ambient.css` ya entiende.
 */
export function initAmbientPreference() {
  const stored = readStoredPreference();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const enabled = stored !== null ? stored : !prefersReducedMotion;
  applyPreference(enabled);
}

export function setAmbientEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    /* preferencia no persistible; se aplica solo para esta sesión */
  }
  applyPreference(enabled);
}

function readStoredPreference() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return raw === 'true';
  } catch {
    return null;
  }
}

function applyPreference(enabled) {
  document.documentElement.setAttribute('data-ambient', enabled ? 'on' : 'off');
}
