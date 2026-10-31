/**
 * Variables CSS de posición (escritorio + móvil) para un hotspot
 * posicionado con `.map-hotspot` (ver `scene.css`: lee
 * `--hotspot-x`/`--hotspot-y` y, bajo 640px, las variantes `-mobile`).
 * Centralizado para no repetir esta misma construcción de string en
 * cada escena que coloca un hotspot sobre su fondo.
 */
export function hotspotPositionStyle(desktop, mobile) {
  return [
    `--hotspot-x: ${desktop.x}%`,
    `--hotspot-y: ${desktop.y}%`,
    `--hotspot-x-mobile: ${mobile.x}%`,
    `--hotspot-y-mobile: ${mobile.y}%`
  ].join('; ');
}
