import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { emitProgressChanged, onProgressChanged } from '../../src/utils/progressEvents.js';

describe('utils/progressEvents.js', () => {
  test('un listener recibe el detalle de lo que cambió', () => {
    const controller = new AbortController();
    let received = null;
    onProgressChanged((event) => {
      received = event.detail;
    }, { signal: controller.signal });

    emitProgressChanged({ type: 'riddle-solved', day: 3 });

    assert.deepEqual(received, { type: 'riddle-solved', day: 3 });
    controller.abort();
  });

  test('varios listeners independientes reciben la misma notificación', () => {
    const controller = new AbortController();
    const calls = [];
    onProgressChanged(() => calls.push('a'), { signal: controller.signal });
    onProgressChanged(() => calls.push('b'), { signal: controller.signal });

    emitProgressChanged({ type: 'card-collected', id: 'mcgonagall' });

    assert.deepEqual(calls.sort(), ['a', 'b']);
    controller.abort();
  });

  test('abortar el signal quita el listener: deja de recibir notificaciones', () => {
    const controller = new AbortController();
    let count = 0;
    onProgressChanged(() => {
      count += 1;
    }, { signal: controller.signal });

    emitProgressChanged({ type: 'riddle-solved', day: 1 });
    assert.equal(count, 1);

    controller.abort();
    emitProgressChanged({ type: 'riddle-solved', day: 2 });
    assert.equal(count, 1, 'no debería haber recibido la segunda notificación');
  });

  test('registrar el mismo listener dos veces con el mismo signal no lo duplica (semántica estándar de EventTarget)', () => {
    const controller = new AbortController();
    let count = 0;
    function handler() {
      count += 1;
    }
    onProgressChanged(handler, { signal: controller.signal });
    onProgressChanged(handler, { signal: controller.signal });

    emitProgressChanged({ type: 'card-collected', id: 'ravenclaw' });

    assert.equal(count, 1, 'el mismo handler registrado dos veces solo debe llamarse una vez');
    controller.abort();
  });

  test('emitir sin ningún listener activo no revienta', () => {
    assert.doesNotThrow(() => emitProgressChanged({ type: 'card-collected', id: 'dumbledore' }));
  });
});
