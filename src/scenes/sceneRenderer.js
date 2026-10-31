import { renderVestibulo } from './vestibuloScene.js';
import { renderBiblioteca } from './bibliotecaScene.js';
import { renderExpedientes } from './expedientesScene.js';
import { renderMapa } from './mapaScene.js';
import { renderDesafios } from './desafiosScene.js';
import { renderArchivo } from './archivoScene.js';

/**
 * Despacha cada lugar a su escena según `id`. El Pensadero queda fuera
 * de este mapa a propósito: no es alcanzable todavía (ver
 * `data/sections.js`, `hidden: true`), y añadir su escena real será
 * tan simple como registrar un nuevo caso aquí.
 */
const RENDERERS = {
  vestibulo: renderVestibulo,
  biblioteca: renderBiblioteca,
  expedientes: renderExpedientes,
  mapa: renderMapa,
  desafios: renderDesafios,
  archivo: renderArchivo
};

export function renderScene(section, context) {
  const renderer = RENDERERS[section.id];
  if (!renderer) {
    throw new Error(`No existe una escena registrada para "${section.id}"`);
  }
  return renderer(section, context);
}
