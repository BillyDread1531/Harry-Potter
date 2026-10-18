/**
 * Silueta provisional del castillo (SVG original y ligero). Pensada para
 * sustituirse en una fase posterior por la ilustración definitiva sin
 * cambiar el resto del marcado: basta con remplazar el contenido de
 * `.hero__castle`.
 */
export function createCastleSilhouetteMarkup() {
  return `
    <svg viewBox="0 0 360 220" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Silueta provisional del castillo de Hogwarts al anochecer">
      <defs>
        <linearGradient id="castle-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a2038" />
          <stop offset="100%" stop-color="#06070d" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="castle-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1c2338" />
          <stop offset="100%" stop-color="#0b0e1a" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="360" height="160" fill="url(#castle-sky)" />

      <!-- Luna -->
      <circle cx="300" cy="36" r="18" fill="#e7edf4" opacity="0.9" />
      <circle cx="306" cy="32" r="16" fill="#0b0e1a" opacity="0.55" />

      <!-- Montaña trasera -->
      <path d="M0 150 L70 90 L140 150 Z" fill="#141a2c" opacity="0.8" />
      <path d="M180 150 L260 80 L340 150 Z" fill="#141a2c" opacity="0.6" />

      <!-- Cuerpo principal del castillo -->
      <path
        d="M40 190
           L40 120 L55 120 L55 100 L70 100 L70 120 L95 120 L95 70
           L110 70 L110 50 L125 50 L125 70 L140 70 L140 130 L170 130
           L170 90 L185 60 L200 90 L200 130 L230 130 L230 80
           L245 80 L245 60 L260 60 L260 80 L275 80 L275 130
           L300 130 L300 190 Z"
        fill="url(#castle-body)"
        stroke="#3a3350"
        stroke-width="1"
      />

      <!-- Almenas -->
      <path
        d="M40 120 h10 v8 h8 v-8 h10 v8 h8 v-8"
        stroke="#3a3350"
        stroke-width="1"
        fill="none"
        opacity="0.6"
      />

      <!-- Ventanas iluminadas -->
      <g fill="#d8b85a" opacity="0.85">
        <rect x="63" y="108" width="4" height="7" />
        <rect x="113" y="58" width="4" height="7" />
        <rect x="188" y="100" width="4" height="7" />
        <rect x="250" y="68" width="4" height="7" />
        <rect x="282" y="140" width="4" height="7" />
        <rect x="150" y="145" width="4" height="7" />
      </g>

      <!-- Base / suelo -->
      <rect x="0" y="188" width="360" height="32" fill="#06070d" />
      <path d="M0 190 Q90 178 180 192 T360 188" stroke="#1a2038" stroke-width="2" fill="none" opacity="0.6" />
    </svg>
  `;
}
