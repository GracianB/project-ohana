# Caprichos · interfaz y libro de viaje

V605 (`ohana-605`) publicada y verificada. Código candidato `57c90cc`, integración en main `9c0eeaa`. Web: https://gracianb.github.io/project-ohana/?release=605. Evidencia pública: `docs/V605-PUBLICATION.json`.

## Interfaz de partida

Nuevo conjunto visual de cristal azul, luz cálida y acentos propios del héroe: tarjetas de jugador y mundo, retrato, vida/XP, cinco pasos de evolución, avisos, objetivos, acciones rápidas, controles táctiles y tarjetas de habilidades. Los valores proceden del estado real; no se modifican combate, dificultad o guardados. Las tarjetas móviles ocupan su columna completa y las barras conservan su altura incluso con nombres largos.

La tipografía OHANA usa letras vivas con inclinación y relieve propios. Portada, selección y paisajes siguen dibujados con código Canvas; no se introduce una lámina PNG. La bienvenida encadena las once escenas sin botones de cambiar frase. Al tocar el escenario, los actores responden con gestos distintos según personaje, acompañados por notas, estrellas y corazones; se respeta movimiento reducido. Pausar, entrar, repetir y salir con teclado siguen disponibles.

## Libro de las Diez Voces

Diez capítulos con título, paisaje Canvas vivo, contexto, estrategia y secuencia real de poderes. Se abre desde la ayuda o directamente desde la selección. Al consultarlo durante una partida muestra el héroe actual; desde la selección muestra el destacado. Explica evolución automática, recuerdos opcionales y sus recompensas. Una sección explica Aventura cooperativa, consentimiento para viajar, Versus y la diferencia entre U y un segundo jugador. Dice expresamente que el servidor público está pausado.

Los paisajes del libro pintan sólo mientras la ayuda está abierta y la pestaña visible. Usan el mismo arte del juego, caché limitada y 12,5 fps como máximo. Con movimiento reducido se pinta una composición quieta.

## Diez detalles adicionales de experiencia

1. Inspección de poderes al enfocarlos con teclado o pasar el puntero: nombre y explicación, sin perder la partida de vista.
2. Vida baja señalada también con texto; el color no es la única señal.
3. Modo de lectura grande para avisos y libro.
4. Contraste reforzado para las tarjetas de combate.
5. Avisos sin animación, a elección del jugador.
6. Recordatorio de teclas ocultable para despejar la pantalla.
7. Preferencias persistentes separadas de la partida y restablecimiento en un botón.
8. Navegación del libro con flechas, Inicio y Fin; preferencias accesibles con Tab y Espacio, incluso cuando se abre ayuda con una tecla mantenida.
9. Cierre de ayuda visible al recorrer el libro; acceso directo al capítulo del héroe destacado.
10. Versus libera los controles al perder captura, ocultar la pestaña o terminar; el resultado lleva el foco al regreso al vestíbulo y permite salir con Enter.

## Validación

- 1.667 pruebas Node y Release Gate aprobados.
- Matriz visual completa: portada, cincuenta formas de selección, salas, enemigos, habilidades, mapa, ayuda, muerte y cierre aprobados.
- Prueba específica `tests/browser/v605-caprichos.mjs`: once escenas, reacción Canvas al toque con relato pausado, HUD en 1280/390/320 px, diez estrategias, guía multijugador, navegación, preferencias persistentes/restablecidas, inspector, movimiento reducido y guía contextual desde selección. Sin desbordamiento horizontal, paisajes raster antiguos ni errores JS.
- `tests/browser/v420-welcome-story.mjs`: treinta y tres líneas, duración legible, pausa real, repetición automática, teclado, móvil y limpieza al salir.
- Migración offline Chromium a `ohana-605`: 113 recursos reutilizados, 294 descargados y arranque sin red aprobado. Auditoría general de navegador aprobada.
- Primer pulido Versus ya validado en dos navegadores reales: pérdida de captura nativa y partida completa con resultado y regreso por teclado.

Pages y los controles de publicación de V605 aprobados. Diez archivos runtime públicos coinciden por SHA256; bienvenida, libro y entrada nativa al capítulo comprobados en escritorio y móvil. La #441/V604 conserva su evidencia histórica en `docs/V604-PUBLICATION.json`. Netlify continúa pausado; esta tanda no acredita rendimiento del servidor externo ni equilibrio humano de todas las parejas PvP.

Resultados y huellas del código comprobado: `docs/V605-VALIDATION.json`.

Actualización desde V604: la primera visita renueva el menú al activarse la nueva caché. Si ya estás jugando, espera a que regreses al menú; no interrumpe la partida. Prueba real con latencia de 2 s al nuevo worker: menú una recarga, partida cero y una al salir, instalación fresca cero; sin errores JavaScript.
