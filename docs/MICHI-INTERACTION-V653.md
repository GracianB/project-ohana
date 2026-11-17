# Michi V653 · Orientación y reacción ambiental

El objetivo continúa calculándose mediante sanctuaryObjective sobre la ruta real de pasos. Si se sale de cámara, aparece una pequeña brújula en el borde seguro del escenario; dentro de cámara se dibuja el marcador original. El movimiento reducido mantiene la aguja estática.

Los arcos reaccionan con un halo suave solo si passageReady confirma que pueden usarse y Michi está cerca. Los textos de faroles y arcos se recortan al ancho visible. El escenario decorativo no introduce superficies transitables ni nuevas colisiones.

## Estado de despegue

El salto ordinario continúa gobernando el impulso inicial. Mientras la forma alada asciende con ese impulso, el estado de vuelo informa `takeoff`, no `ground`. En cuanto las alas toman el control, el estado pasa a `ascend`. Se exigen ambos hitos durante el control mantenido, y después suspensión y descenso. Sin alterar la velocidad, la gravedad ni los saltos.

## Aceptación

- Pruebas unitarias: tests/michi-wayfinding-v653.test.js y tests/michi-flight-v653.test.js.
- Prueba de siete ambientes, móvil 390 y movimiento reducido: npm run test:browser:michi-scenery.
- Vuelo V624: recorrido físico independiente, y comprobación de control mantenido con partida conseguida, situada en aire libre dentro del mundo real. No pretende probar el despegue desde todas las plataformas.
- Release gate: huellas Git blob SHA-1 para cada recurso precacheado; no se mezclan las versiones.
- Obligatorias antes de integrar: quality, aceptación de capítulo, revisión de arte y comprobación de versión publicada.

Las respuestas son visuales y de orientación, no nuevos acertijos, recompensas o poderes. No se afirma rendimiento real de dispositivos físicos sin medirlo.

## Corazón de Ohana: premios del ritual

El ritual individual del final ahora muestra únicamente sus resonancias de suelo ganadas. Los cristales XP ambientales anteriores ya no se generan encima de la ruta del ritual: evita recompensas de experiencia involuntarias al recoger las tres resonancias. Se conservan todos los cristales en el modo de procesión sin ritual y en las otras salas. La prueba V630 se ejecuta justo después de construir la partida real de V600 para detectar este fallo antes de la batería visual lenta.

## Ritual final táctil

El control E de interacción se ha movido fuera de la fila plegable de poderes. En 320 y 390 px permanece visible sobre el grupo principal, sin desbloquear J/K/L/I/P/U ni crear otro control duplicado. La prueba V630 usa pulsaciones táctiles reales tanto para cancelar como para reabrir la selección de luchador.
