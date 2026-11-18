# Quimera · El devorador de ecos

La silueta anterior de animal redondeado se sustituye por una máscara hueca alargada, cuernos curvos, pecho vacío, hombros asimétricos, brazos largos y un manto desgarrado. La luz se describe con planos amplios, sin paneles delineados ni mejillas esféricas. El núcleo se abre al recuperar; la postura anticipa la carga, el salto, la emisión del pecho y el aliento. Las fases avanzadas liberan crescentes y prolongan las corrientes del manto.

Los diez poderes robados reciben nombres del mismo universo: Marea del silencio, Lanzas del vacío, Cicatrices del trueno, Lluvia de espectros, Carga del eclipse, Aliento de ceniza, Ruptura ancestral, Columnas del umbral, Coronas errantes y Cerco de voces. Se mantienen sus héroes de origen y sus reglas de combate. El renderizador distingue crestas de espuma, lanzas trenzadas, relámpagos ramificados, tentáculos, lenguas de fuego, coronas dentadas, estrellas convergentes y ecos de máscara. Los tres tipos de columna/barrido tienen preparación y activación diferentes. Cada preparación reúne luz en su órgano emisor y cada liberación añade un sonido de la familia del poder. Los avisos, destinos fijados y recuperaciones existentes se conservan.

Las estelas de velocidad son luz tenue sin colisión. Una reserva de hasta 32 ráfagas dibuja los impactos y aterrizajes, con caducidad de 28 cuadros; transición y derrota vacían la reserva. Los materiales se recortan a la geometría que usa la colisión; no se añaden partículas dañinas fuera de esa geometría. No se cambian velocidades, daño, salud ni duración de los ataques. La animación decorativa congela su reloj con movimiento reducido, sin alterar la simulación. No se añaden imágenes, vídeos, filtros pesados ni redes de descarga.

Se corrige además un fallo real: la salida anticipada de `drawLivingRealm` impedía alcanzar el escenario específico de Quimera. La sala final ahora selecciona primero su fondo de eclipse, siluetas del santuario y diez voces. El terreno usa piedra azul oscura con bordes legibles. Las demás salas mantienen su ruta de renderizado.

La previsualización pública deja de mostrar únicamente poses: por defecto ejecuta el ataque elegido con la IA de producción, seguido de recuperación. Permite cambiar fase, ataque, pose, orientación y movimiento reducido. No escribe guardados ni concede acceso de campaña. Las visitas directas al estudio actualizan también el service worker, para que no se mantenga el dibujo antiguo en caché.

La validación de arena usa acceso y vida sintéticos; no se presenta como una campaña completa ganada. El resultado y la publicación efectivos figuran en los JSON de esta entrega.

## Arena de eclipse vivo

El eclipse tiene párpados, iris que sigue la posición real del personaje, respiración, contracción al preparar un ataque, corona ligada al color del poder y ondas de liberación. Cincuenta ecos independientes representan cinco presencias por cada uno de los diez personajes. Se orientan hacia el jugador cercano y se separan al romperse la prisión. Movimiento reducido fija sus relojes decorativos, conservando la respuesta a las acciones.

Tres prismas físicos se activan con E o Usar, junto al suelo de la arena. Cada uno despliega tres escalones de 100 unidades de altura: nueve plataformas con colisión real, sin modificar los límites de la pelea. También abre una corriente de aire que ayuda a un salto deliberado y nunca lanza al personaje que sigue en el suelo. La ruta queda guardada en claves `w1-final-eclipse-*` y se reconstruye al continuar. La sincronización cooperativa acepta exclusivamente estas tres claves, sin conceder sellos ni derrota del jefe.

Activar un prisma otorga un escudo de un golpe durante 180 cuadros y empieza una recarga de 600 cuadros. El golpe consume el escudo y concede 20 cuadros de gracia para evitar daño instantáneo por la misma ráfaga. Escudo y recarga pertenecen al encuentro; no se guardan ni conceden vida, XP, evolución o daño gratuito al jefe. Los avisos de recarga, activación y absorción usan la interfaz contextual existente. Las rutas permanecen abiertas cuando se agota el escudo.
