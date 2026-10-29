# V629 · Volver del Corazón al héroe

El selector guardaba el último héroe incluso al mostrar el portal final. Volver a ese mismo héroe con flechas no refrescaba la ficha: el escenario cambiaba, pero quedaban el título y el botón del Corazón y seguían ocultas las formas y las estadísticas. Al tocar o clicar su tarjeta, tampoco se restauraba el escenario porque el evento de selección descartaba el mismo ID. La ficha vuelve a actualizarse al abandonar el estado final aunque no cambie el héroe.

La navegación con flechas conserva la forma que se estaba previsualizando al volver al mismo héroe. Elegir su tarjeta vuelve a su previsualización inicial, como las demás selecciones directas. Los capítulos nuevos siguen empezando como bebé; una previsualización no concede ninguna evolución.

Entrar en el Corazón también termina cualquier travesura que estuviera en curso. Antes, sus frases seguían sustituyendo el texto del portal y el aviso de los sellos que faltan mientras sus controles estaban ocultos. Se comparte la misma limpieza que al cambiar de héroe o detener una travesura.

La regresión se reproduce con controles reales del selector, sin hooks de juego ni concesiones de progreso. La comprobación cubre flechas, ratón y táctil, formas, ficha, texto y almacenamiento. No acredita otra campaña completa ni una prueba física de mando. Los personajes, sus ojos, el arte de los diez espejos y las reglas de combate no cambian.

Resultados efectivos: V629-VALIDATION.json y V629-PUBLICATION.json. La valoración visual y de dificultad del jugador sigue pendiente; el servidor multijugador continúa pausado.
