import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { assetExists } from '../src/utils/assetProbe.js';

// `assetExists` solo usa `fetch`, así que se puede probar sin DOM
// sustituyendo `globalThis.fetch` por una versión de prueba y
// restaurando la real al terminar cada caso.
let originalFetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function fakeResponse({ ok, contentType }) {
  return {
    ok,
    headers: { get: (name) => (name.toLowerCase() === 'content-type' ? contentType : null) }
  };
}

describe('utils/assetProbe.js', () => {
  test('un recurso real (status 200, content-type de imagen) existe', async () => {
    globalThis.fetch = async () => fakeResponse({ ok: true, contentType: 'image/jpeg' });
    assert.equal(await assetExists('/assets/backgrounds/vestibule-desktop.jpg'), true);
  });

  test('el fallback de SPA (200 con text/html) NO cuenta como que el recurso existe', async () => {
    // Esto es justo lo que hace Vite (y la mayoría de hostings de SPA)
    // para cualquier ruta que no exista: responde 200 con index.html.
    globalThis.fetch = async () => fakeResponse({ ok: true, contentType: 'text/html; charset=utf-8' });
    assert.equal(await assetExists('/assets/backgrounds/no-existe.jpg'), false);
  });

  test('un 404 real no existe', async () => {
    globalThis.fetch = async () => fakeResponse({ ok: false, contentType: null });
    assert.equal(await assetExists('/assets/backgrounds/no-existe.jpg'), false);
  });

  test('un fallo de red no existe (no debe propagar la excepción)', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };
    assert.equal(await assetExists('/assets/backgrounds/vestibule-desktop.jpg'), false);
  });

  test('una señal ya abortada no existe y no revienta', async () => {
    globalThis.fetch = async (_url, { signal } = {}) => {
      if (signal?.aborted) {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        throw error;
      }
      return fakeResponse({ ok: true, contentType: 'image/jpeg' });
    };
    const controller = new AbortController();
    controller.abort();
    assert.equal(await assetExists('/assets/backgrounds/vestibule-desktop.jpg', { signal: controller.signal }), false);
  });

  test('sin url no existe, y ni siquiera llama a fetch', async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return fakeResponse({ ok: true, contentType: 'image/jpeg' });
    };
    assert.equal(await assetExists(''), false);
    assert.equal(await assetExists(undefined), false);
    assert.equal(called, false);
  });
});
