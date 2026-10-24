# V500.1 · La mesa de las once luces

La V500 deja al jugador escuchar diez mensajes. La V500.1 convierte ese recuerdo en una reunión: después de encender las diez luces aparece «Reunirnos». La escena reúne a los diez héroes con sus formas finales del motor alrededor de una mesa y reserva una undécima luz para quien ha jugado.

La despedida procede del héroe con el que se ganó el Mundo 1, conservado en la memoria de V500. Cambiar de retrato no cambia esa dedicatoria. No inventa estadísticas ni decisiones de la partida.

La reunión se abre voluntariamente, sin temporizador ni audio automático. Puede repetirse después de recargar; no añade otro requisito ni modifica el guardado principal. Movimiento reducido mantiene la ilustración estática. La descripción de la escena y la carta existen como texto accesible.

## Validación

- 1.459 pruebas Node aprobadas y release gate aprobado localmente.
- Prueba UI ampliada: cierre bloqueado hasta las diez luces, dedicatoria fiel al héroe ganador, foco en el título, escritorio, móvil, horizontal, Escape y repetición tras recargar.
- La prueba UI emplea una memoria de fixture; no acredita por sí misma una victoria de campaña. La ruta física existente sigue siendo la prueba del desbloqueo natural.
- Caché técnica `ohana-5001`; nombre de entrega V500.1. Mantiene compatibilidad con las memorias V500.

La validación de navegador y la publicación deben comprobarse en CI antes de anunciar que está publicada.
