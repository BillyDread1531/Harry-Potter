import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createSceneFrameMarkup } from '../../src/components/sceneFrame.js';

const BASE_PROPS = {
  id: 'prueba',
  eyebrow: 'Un eyebrow',
  title: 'Un título',
  description: 'Una descripción.',
  backdropMarkup: '<svg></svg>'
};

describe('components/sceneFrame.js — createSceneFrameMarkup', () => {
  test('sin `pendingItems`, no muestra la insignia "en preparación"', () => {
    const html = createSceneFrameMarkup({ ...BASE_PROPS, pendingItems: [] });
    assert.equal(html.includes('En preparación para una fase posterior'), false);
    assert.equal(html.includes('status-badge--pending'), false);
  });

  test('con `pendingItems`, sigue mostrando la insignia (comportamiento previo intacto)', () => {
    const html = createSceneFrameMarkup({ ...BASE_PROPS, pendingItems: ['Algo pendiente.'] });
    assert.ok(html.includes('En preparación para una fase posterior'));
    assert.ok(html.includes('Algo pendiente.'));
  });

  test('`overlayContent` se inserta como hermano de `.scene-frame__content`, no dentro de ella', () => {
    const html = createSceneFrameMarkup({ ...BASE_PROPS, overlayContent: '<button data-marker>hola</button>' });
    const overlayIndex = html.indexOf('data-marker');
    const contentIndex = html.indexOf('scene-frame__content');
    assert.ok(overlayIndex > -1, 'overlayContent no apareció en el marcado');
    assert.ok(overlayIndex < contentIndex, 'overlayContent debería aparecer ANTES de scene-frame__content');
  });

  test('sin `overlayContent` ni `extraContent`, no deja residuos como "undefined" en el HTML', () => {
    const html = createSceneFrameMarkup(BASE_PROPS);
    assert.equal(html.includes('undefined'), false);
  });

  test('`extraContent` sigue insertándose dentro de `.scene-frame__content` (comportamiento previo intacto)', () => {
    const html = createSceneFrameMarkup({ ...BASE_PROPS, extraContent: '<p data-extra>contenido</p>' });
    const extraIndex = html.indexOf('data-extra');
    const contentIndex = html.indexOf('scene-frame__content');
    assert.ok(extraIndex > contentIndex, 'extraContent debería aparecer DESPUÉS de scene-frame__content');
  });
});
