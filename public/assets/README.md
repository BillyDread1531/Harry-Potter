# Recursos del proyecto Hogwarts

Esta carpeta es servida tal cual por Vite en la raíz del sitio. Un archivo
guardado en `public/assets/backgrounds/x.jpg` se solicita en el navegador
como `/assets/backgrounds/x.jpg`, sin ningún paso de compilación. Ningún
archivo de esta carpeta se genera con herramientas externas ni se descarga
automáticamente: todos los prepara una persona y se colocan aquí a mano.

Mientras un recurso no exista, la escena correspondiente usa un
**fallback** (arte provisional en CSS/SVG o, en el caso de las criaturas,
el elemento se oculta por completo). Nada se rompe ni muestra un ícono de
imagen caída: el código comprueba la existencia del archivo antes de
asignarlo (`src/utils/assetProbe.js`).

## Estructura

| Carpeta | Contenido | Quién la consume |
|---|---|---|
| `backgrounds/` | Fondos fotográficos de cada escenario (un desktop + un mobile por escena) | `src/scenes/sceneBackground.js` |
| `architecture/` | Elementos arquitectónicos superpuestos con transparencia (marcos, arcos, bóvedas en primer plano) | capa `.vestibulo-scene__layer--architecture` (vacía, preparada) |
| `objects/` | Sprites de objetos interactivos (escritorio, mesa del mapa, cofre, etc.) | pendiente de integrarse en los `hotspot` de cada escena, mismo patrón que `sceneBackground.js` |
| `creatures/` | Criaturas mágicas animadas con canal alfa + su respaldo estático | `src/components/creature.js` |
| `fx/` | Texturas para niebla/partículas si en algún momento superan lo que CSS puede resolver razonablemente | sin consumidor todavía |
| `audio/` | Música y efectos de sonido para fases futuras | sin consumidor todavía (el control de sonido ya existe en la interfaz, pero no reproduce nada aún) |

Cada carpeta tiene un `.gitkeep` para que Git la conserve vacía hasta que
le agregues archivos reales.

## Estado de los fondos fotográficos

El formato de entrega acordado es JPG. El punto de corte entre versión
desktop y mobile es 640px de ancho de viewport (el mismo breakpoint que
ya usa el resto del proyecto). El `<img>` usa
`object-fit: cover; object-position: center;`, así que nunca se estira:
mantén el punto focal principal cerca del centro de la composición en
ambas versiones para que el recorte por `cover` no lo deje fuera del
encuadre en proporciones intermedias.

| Escena (id interno) | Nombre narrativo | Desktop | Mobile |
|---|---|---|---|
| `vestibulo` | El Gran Vestíbulo | ✅ `vestibule-desktop.jpg` | ✅ `vestibule-mobile.jpg` |
| `biblioteca` | La Biblioteca | ✅ `biblioteca-desktop.jpg` | ✅ `biblioteca-mobile.jpg` |
| `expedientes` | Los Expedientes (el escritorio) | ✅ `expedientes-desktop.jpg` | ✅ `expedientes-mobile.jpg` |
| `mapa` | La Torre (sala de mapas) | ✅ `mapa-desktop.jpg` | ✅ `mapa-mobile.jpg` |
| `desafios` | La Sala de los Menesteres | ✅ `desafios-desktop.jpg` | ✅ `desafios-mobile.jpg` |
| `archivo` | La Bóveda | ✅ `archivo-desktop.jpg` | ✅ `archivo-mobile.jpg` |

Las seis escenas ya están conectadas en su archivo correspondiente
(`src/scenes/*.js`) y confirmadas cargando sin errores, en escritorio y
en móvil. El único lugar que todavía no tiene fondo fotográfico es el
Pensadero, que ni siquiera se muestra todavía en la interfaz (ver
`hidden: true` en `src/data/sections.js`).

Las velas e íconos procedimentales que la foto real ya trae
incorporados (Vestíbulo, Expedientes, Mapa, Archivo) se ocultan
automáticamente en cuanto el fondo carga — no hace falta tocar nada
para eso, ya está resuelto en `scene.css`.

### Cómo añadir el fondo de un escenario nuevo (por ejemplo, el Pensadero
    cuando llegue su fase)

`src/scenes/sceneBackground.js` no es específico de ninguna escena:
acepta cualquier par `{ desktopSrc, mobileSrc }`. Para conectar un fondo
nuevo basta con importar `mountSceneBackground` y
`createSceneBackgroundMarkup` en el archivo de esa escena y llamarlos
igual que ya se hizo en las seis escenas actuales (`src/scenes/*.js`).
No hace falta tocar el router ni el sistema de transiciones.

### Evitar duplicar elementos que la foto ya trae

Si la fotografía de una escena ya incluye velas encendidas o una
cerradura (como pasó con el Vestíbulo, los Expedientes, el Mapa y el
Archivo), los elementos procedimentales equivalentes de esa escena se
ocultan automáticamente en cuanto el fondo carga
(`.has-photo-background .scene-desk-candle` / `.scene-table-candles` /
`.scene-key-glint` en `scene.css`). El polvo/las motas sí se conservan
a propósito: son un efecto atmosférico, no un objeto concreto
repetido.

## El Patronus

| Archivo esperado | Formato | Notas |
|---|---|---|
| `creatures/patronus.png` | PNG con transparencia | ✅ Ya añadido, con canal alfa real (comprobado a nivel de píxel, no solo por la vista previa). Es lo que se ve ahora mismo flotando en el vestíbulo. |
| `creatures/patronus.webm` | WebM, codec VP9, con canal alfa (`-pix_fmt yuva420p` en ffmpeg) | Opcional. Si lo añades, se reproduce en bucle, sin sonido, sin autoplay de audio (el `<video>` siempre está `muted`), y solo se solicita si el visitante no pidió movimiento reducido. Sin él, el PNG estático ya es la experiencia completa. |

`src/components/creature.js` está conectado en el vestíbulo
(`.vestibulo-scene__creatures`). Es un componente genérico: se puede
reutilizar para cualquier otra criatura pasándole un `id` y las rutas
correspondientes.
