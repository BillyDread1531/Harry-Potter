import { renderVestibulo } from './vestibuloScene.js';
import { renderBiblioteca } from './bibliotecaScene.js';
import { renderExpedientes } from './expedientesScene.js';
import { renderMapa } from './mapaScene.js';
import { renderDesafios } from './desafiosScene.js';
import { renderArchivo } from './archivoScene.js';
import { renderPensadero } from './pensaderoScene.js';

const RENDERERS = {
  vestibulo: renderVestibulo,
  biblioteca: renderBiblioteca,
  expedientes: renderExpedientes,
  mapa: renderMapa,
  desafios: renderDesafios,
  archivo: renderArchivo,
  pensadero: renderPensadero
};

export function renderScene(section, context) {
  const renderer = RENDERERS[section.id];
  if (!renderer) {
    throw new Error(`No existe una escena registrada para "${section.id}"`);
  }
  return renderer(section, context);
}
