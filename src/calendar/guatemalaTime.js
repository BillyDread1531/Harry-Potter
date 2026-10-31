/**
 * Aritmética de fechas contra la zona horaria IANA `America/Guatemala`,
 * sin ninguna librería de fechas: solo `Intl.DateTimeFormat`, que ya
 * trae el navegador. Guatemala no observa horario de verano (su
 * desfase respecto a UTC es constante), pero aun así el desfase se
 * calcula en vivo a partir de los datos de zona horaria del motor en
 * vez de asumir "-6" como un número mágico: si alguna vez cambiara,
 * este código lo seguiría calculando bien solo con actualizar el
 * navegador/Node, sin tocar una línea.
 *
 * Todo esto trabaja sobre instantes absolutos (marcas de tiempo), no
 * sobre la hora local del dispositivo: dos `Date` que representen el
 * mismo instante real dan siempre el mismo resultado, sin importar en
 * qué zona horaria esté configurado el ordenador o el teléfono que
 * ejecuta el código.
 */

export const GUATEMALA_TIME_ZONE = 'America/Guatemala';

/**
 * Calcula, para un instante dado, el desfase (en minutos) de una zona
 * horaria IANA respecto a UTC. Negativo cuando la zona va "detrás" de
 * UTC (como Guatemala, GMT-06:00).
 */
export function getTimeZoneOffsetMinutes(instant, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(instant).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  // Lee los dígitos de la hora "de pared" que esa zona horaria mostraría
  // para este instante, y los reinterpreta como si fueran UTC. La
  // diferencia contra el instante real es, por definición, el desfase.
  const wallClockAsUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return (wallClockAsUTC - instant.getTime()) / 60000;
}

/**
 * Convierte una fecha "de pared" en Guatemala (año, mes 1-12, día,
 * hora, minuto) al instante UTC real que le corresponde. Es la
 * operación inversa a "¿qué hora es en Guatemala ahora mismo?".
 */
export function guatemalaWallTimeToUTC(year, month, day, hour = 0, minute = 0, second = 0) {
  // Primera aproximación: trata la hora de pared como si ya fuera UTC,
  // y usa esa aproximación para leer el desfase real de Guatemala en
  // ese momento (como Guatemala no tiene horario de verano, cualquier
  // instante cercano da el desfase correcto, así que esta aproximación
  // nunca falla por estar "del otro lado" de un cambio de horario).
  const naiveUTC = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsetMinutes = getTimeZoneOffsetMinutes(new Date(naiveUTC), GUATEMALA_TIME_ZONE);
  return new Date(naiveUTC - offsetMinutes * 60000);
}

/**
 * Medianoche de un día de calendario en Guatemala, como instante UTC.
 */
export function guatemalaMidnightUTC(year, month, day) {
  return guatemalaWallTimeToUTC(year, month, day, 0, 0, 0);
}

/**
 * ¿Qué fecha y hora de pared (en Guatemala) corresponde a este
 * instante? Útil para mostrar fechas legibles — incluida la hora,
 * necesaria para el día 15, que se desbloquea a las 20:00 en vez de a
 * medianoche como el resto.
 */
export function getGuatemalaDateParts(instant) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: GUATEMALA_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  const parts = formatter.formatToParts(instant).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    minute: Number(parts.minute)
  };
}

export function isValidInstant(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * ¿Es de noche en Guatemala ahora mismo (para quien visite, sea cual
 * sea su propia zona horaria)? Puramente informativo para ambientación
 * contextual (ver `scenes/vestibuloScene.js`): nunca bloquea ni oculta
 * nada, solo elige qué variante visual mostrar. El límite (18:00-6:00)
 * es deliberadamente amplio y simple — no es un reloj de precisión, es
 * "¿se siente de noche ahora mismo en Guatemala?". Una fecha inválida
 * cae de forma segura en "de día", la variante más neutra.
 */
export function isNightInGuatemala(instant) {
  if (!isValidInstant(instant)) return false;
  const { hour } = getGuatemalaDateParts(instant);
  return hour >= 18 || hour < 6;
}
