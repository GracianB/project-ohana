# Michi V653 · Orientación y reacción ambiental

El objetivo continúa calculándose mediante sanctuaryObjective sobre la ruta real de pasos. Si se sale de cámara, aparece una pequeña brújula en el borde seguro del escenario; dentro de cámara se dibuja el marcador original. El movimiento reducido mantiene la aguja estática.

Los arcos reaccionan con un halo suave solo si passageReady confirma que pueden usarse y Michi está cerca. Los textos de faroles y arcos se recortan al ancho visible. El escenario decorativo no introduce superficies transitables ni nuevas colisiones.

## Aceptación

- Pruebas unitarias: tests/michi-wayfinding-v653.test.js y tests/michi-flight-v653.test.js.
- Prueba de siete ambientes, móvil 390 y movimiento reducido: npm run test:browser:michi-scenery.
- Vuelo V624: recorrido físico independiente, y comprobación de control mantenido con partida conseguida, situada en aire libre dentro del mundo real. No pretende probar el despegue desde todas las plataformas.
- Release gate: huellas Git blob SHA-1 para cada recurso precacheado; no se mezclan las versiones.
- Obligatorias antes de integrar: quality, aceptación de capítulo, revisión de arte y comprobación de versión publicada.

Las respuestas son visuales y de orientación, no nuevos acertijos, recompensas o poderes. No se afirma rendimiento real de dispositivos físicos sin medirlo.
