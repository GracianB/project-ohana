# Caprichos · siguiente ronda después de la #441

Rama de trabajo: `feat/v605-caprichos-442`. Se prepara para la siguiente PR; el número definitivo depende de GitHub. No publicar estos cambios como parte del cierre de la #441.

La campaña, sus recuerdos y el multijugador local son la base de partida. Esta ronda añade detalles pequeños y revisables: comodidad de teclado/táctil, reacciones del escenario, celebraciones, sonido contextual y presentación. Los cambios de reglas o dificultad se justifican por pruebas de juego; no se mezclan con un retoque puramente visual.

## Primer pulido

- Versus libera una dirección táctil al perder la captura del puntero, aunque no llegue `pointerup`.
- Los controles pendientes se limpian al ocultar la página y al terminar la partida.
- El resultado coloca el foco en «Volver a elegir personajes», de modo que Enter permite volver al vestíbulo.
- El piloto de navegador reconoce que la partida puede acabar entre dos pulsaciones: no intenta atacar debajo de la pantalla de resultados ni fuerza clics a través de ella.

La prueba de red comprueba una pérdida de captura real manteniendo el puntero pulsado. La partida completa comprueba el foco en ambos resultados y la salida con Enter. No se activa infraestructura pública de multijugador ni se modifica el combate.

## Forma de continuar

Elegir un detalle cada vez, mostrarlo en el juego y conservar una comprobación proporcional. Ideas para las siguientes tandas: pequeñas reacciones ambientales al paso del héroe, celebraciones propias por descubrimiento y mayor claridad al preparar un combo. Son opciones de esta ronda, no funciones ya implementadas.
