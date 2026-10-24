# V495–V500 · Un lugar para ti

Autorización de alcance: el usuario pide avanzar hasta V500 y que V500 sea especialmente memorable. Se amplía el cierre single player con un epílogo opcional; el multijugador permanece fuera de alcance y el repertorio de Kilo se conserva.

| Entrega | Cambio |
|---|---|
| V495 | Guía de Mundo 1 y contadores basados en sellos auténticos; no en visitas a salas clásicas |
| V496 | Ayuda de Quimera y controles I/P/U coherentes con el juego |
| V497 | Foco de diálogos excluye controles ocultos e inertes |
| V498 | Victoria recordada en clave independiente; sin modificar partidas antiguas |
| V499 | Diez voces originales de regreso a casa |
| V500 | Constelación interactiva con arte del motor, luces persistentes y última luz para el jugador |

## Aceptación

- Antes de ganar no aparece el acceso del menú.
- La ruta física V493 debe ganar la campaña y abrir el epílogo desde la tarjeta final. Una memoria inyectada en la prueba de UI no acredita ganar la campaña.
- Diez héroes distintos, diez voces y una luz final; repetir una voz no duplica progreso.
- Cerrar conserva victoria y controles de resultados; volver desde el menú conserva las luces tras recarga.
- Teclado: foco atrapado en el diálogo, Tab/Shift+Tab, Escape y botones nativos. No depende de pasar el ratón.
- Móvil y horizontal: sin desbordamiento horizontal; botones de al menos 44 px de alto y panel desplazable.
- Movimiento reducido: retrato estático, sin animaciones obligatorias. No hay reproducción automática de sonido nuevo.
- Fallo o bloqueo de almacenamiento no impide ver el final; puede impedir conservar el recuerdo tras cerrar.
- Arte: usa `makeDummy/drawDummy`, no retratos históricos ni cambios de identidad de los personajes.

## Evidencia pendiente de la candidata

Pruebas Node y release gate locales aprobados antes de publicación de la rama. Exigir aceptación V500, campaña física V493 ampliada, Quality completa y Pages del merge antes de anunciar publicación. Revisar capturas reales de escritorio y móvil.

La prueba de UI usa expresamente una memoria de fixture para revisar diseño y persistencia. La prueba física comprueba el desbloqueo tras la victoria real. Ninguna de las dos sustituye la opinión de personas sobre dificultad o diversión.
