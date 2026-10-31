/**
 * Comprueba si un recurso existe antes de asignarlo a un <img>/<video>.
 * Evita el icono de imagen rota y los avisos de red fallida en consola
 * que aparecerían si simplemente dejáramos que el elemento intentara
 * cargar una ruta inexistente.
 *
 * Importante: tanto el servidor de Vite como la mayoría de hostings
 * configurados para una SPA devuelven `index.html` con estado 200 para
 * cualquier ruta que no exista (fallback de enrutado del lado del
 * cliente). Por eso `response.ok` no basta: si el `Content-Type` es
 * `text/html`, en realidad estamos viendo ese documento de respaldo, no
 * el recurso solicitado.
 *
 * Acepta un `AbortSignal` opcional: si la escena que pidió la
 * comprobación se desmonta antes de que la red responda, quien llama
 * puede cancelar el `fetch` en vez de dejarlo resolver contra una
 * pantalla que ya no está activa.
 */
export async function assetExists(url, { signal } = {}) {
  if (!url) return false;
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store', signal });
    if (!response.ok) return false;
    const contentType = response.headers.get('content-type') ?? '';
    return !contentType.includes('text/html');
  } catch {
    return false;
  }
}
