# Claro de Kilo · revisión por sala

Primera entrega de la revisión del Mundo 1. Rama `feat/v606-kilo-encounters`, versión `ohana-606`. Integrada en main y publicada; evidencia en [V606-PUBLICATION.json](V606-PUBLICATION.json). La API bloqueó la creación de la PR con Forbidden; se realizó el merge normal autorizado por el usuario. Las siguientes entregas mantienen el alcance de una sala por PR.

## Problema y resultado

Claro mezclaba cuatro generadores de encuentros. Terminaba con 27 actores, plantas y cangrejos voladores y mosquitos terrestres; sus roles no correspondían a lo que se dibujaba. Había suficientes gemas antes del primer objetivo para evolucionar, cada nota aceleraba el crecimiento y la segunda parte del mapa se recorría siempre en forma máxima. El guardián tenía dos controladores que podían reponer la apertura de daño. Muchas ondas o cargas ni siquiera llegaban a la distancia desde la que avisaba.

La sala conserva su paisaje Canvas y el diseño/repertorio de Kilo. Un recorrido de 14.400 unidades reparte dieciocho criaturas de cinco especies y un guardián al final. Cada especie tiene anatomía, anticipación y función propias: escarabajo perseguidor, cangrejo con pinza escudo, rana saltadora, planta arraigada que dispara semillas y avispa del dosel. Los golpes ligeros ya no borran continuamente un ataque comprometido; sus avisos y trayectorias se respetan. Los enemigos conservan un área de acción y las plantas no patinan por el escenario.

## Cuatro instrumentos, cuatro usos del repertorio

| Lugar | Acción | Qué enseña |
| --- | --- | --- |
| Caracola del arroyo · x2400 | E o J cerca, fuera de la amenaza inmediata | Combatir a distancia y recuperar la primera voz |
| Bambú del viento · x5200 | Tres lanzamientos J distintos | Cambiar el ángulo frente al escudo y tocar entre ataques |
| Arpa del dosel · x8200, y914 | Alcanzar su altura con salto/levitación y tocar J en el aire | Usar el espacio vertical, evitando a la avispa |
| Hibisco del compás · x11550 | Preparar I luchando o con tres J sobre el hibisco; activar I | Comprender y usar el remate real, sin quedarse sin forma de cargarlo tras vencer a los enemigos |

Pisar un instrumento o esperar quieto no lo completa. Se conservan los cuatro IDs de progreso: una nota ya ganada mantiene su crédito al cargar una partida antigua. Las frases incompletas no pagan progreso ni recompensas. La experiencia obtenida se conserva, pero no permite saltar el aprendizaje del siguiente instrumento. Los mínimos de XP garantizan cada forma al resolver su lección; no se aumentan los umbrales globales ni se afecta a los otros nueve héroes. La evolución mantiene las heridas previas y los KO dejan de curar automáticamente en esta sala.

Se retira la lista genérica de tres campanas obligatorias posterior al jefe. Los carillones y aros aéreos son rutas opcionales. Las gemas siguen superficies reales, sin alfombras densas ni objetos enterrados. Los recuerdos de Kilo se dibujan como pequeños pétalos musicales; los cristales dorados de XP conservan una silueta diferente.

## El gran Tambor

Un controlador propio decide preparación, compromiso, ataque y recuperación. En Normal tiene 648 PV y un máximo de 150 de daño por apertura, compartido por golpes, poderes y compañeros. Ese presupuesto no vuelve a llenarse al siguiente fotograma. La arena final es x12600–14100.

Los tres patrones son onda de suelo que se puede saltar, carga hasta un destino anunciado y abanico de semillas con huecos. Se recoloca antes de avisar; después no persigue mágicamente la nueva posición del jugador. La segunda fase añade un segundo golpe de ritmo. Easy/Normal/Hard cambian preparación, velocidad, presión y recuperación. Se conserva el Tambor antiguo del hub y la presentación del guardián evolucionado de la Quimera.

## Compatibilidad y comprobación

Los guardados conservan notas, sello y recibo de victoria. El cooperativo exige el recibo auténtico de Tambor y ya no exige los tres descubrimientos eliminados; los otros nueve capítulos conservan sus expediciones. La nueva geometría y los avisos se reflejan también al invitado. Netlify continúa pausado.

Las pruebas de reglas cubren tipos/roles, progreso por acciones, no repetición de lanzamientos, persistencia, ausencia de evolución anticipada, ataques comprometidos y presupuesto del guardián. El piloto físico recorre la sala sin conceder posiciones, vida, XP, formas, enemigos derrotados ni sellos. En Normal obtiene las cinco formas a lo largo del recorrido y vence a Tambor tras sus tres patrones. Leer estado para guiar un piloto acredita viabilidad, no aceptación humana de la dificultad.

Para valorar el ritmo desde bebé se necesita una partida nueva; una partida ya completada conserva legítimamente sus formas y victorias. No se borra el progreso del jugador al instalar esta versión.

## Detalles de vuelo e interfaz

El vuelo solar de la quinta forma es sostenido; el campo hula que golpea y refleja tiene su propia duración y no concede defensa permanente. Las formas intermedias levitan durante unos segundos. Una segunda K permite descender en ambos casos, incluso durante la recuperación, sin refrescar el campo ni su coste. El indicador de poder distingue el vuelo sostenido de la levitación y muestra la duración restante de esta última.

El aro corporal deja de quedar suspendido por delante de Kilo durante el vuelo. Los elementos ceremoniales siguen la transformación real del cuerpo y su animación no se reinicia al disparar J. El alcance hula se señala con pétalos laterales, sin un disco rosa que tape las piernas.

El HUD incorpora barras de vida y experiencia con cifras legibles y un retrato Canvas vivo, encuadrado para cada forma. El mensaje de XP y el atlas explican el instrumento pendiente cuando el aprendizaje todavía bloquea una evolución. Escritorio, móvil y movimiento reducido se verifican por separado.
