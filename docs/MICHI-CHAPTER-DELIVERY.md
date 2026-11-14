# Michi · El jardín de las nueve vidas · ohana-648

Entrega de capítulo ramificado. La aceptación visual final corresponde al jugador;
este documento describe el contrato comprobable, no una promesa de que el arte
no pueda volver a cambiar.

## Recorrido e historia

El patio une la cripta, el laberinto, el jardín suspendido y la galería mediante
arcos señalizados. ↓ o E entra en una madriguera; el botón táctil E usa la misma
acción. Los cinco faroles se encienden en orden mediante saltos reales. Se
conservan los IDs 0–4, el crecimiento 0/1/2/3/3/4 y los IDs de los cien recuerdos.
El guardián mantiene `w1-cat-astral-v1` y su arena histórica para conservar partidas.

No hay pozos mortales ocultos. Las paredes del laberinto son colisionadores reales,
y las rutas elevadas tienen suelo recuperable. Cada destino de túnel tiene suelo
físico. Las siete zonas tienen puntos de control; exploración distingue altura.
Los límites compartidos por cliente y servicio multijugador incluyen la cripta
hasta 2100 unidades. Los otros nueve capítulos conservan su geometría.

La tercera forma es **Ratón de Ónice**, negro y diminuto: cuerpo físico 18×18,
velocidad 7,2, ojos de ámbar, grandes orejas, hocico y cola fina. Conserva `cat` y
el índice 2 de evolución. Las velocidades de las cinco formas permanecen
5,8 / 6,5 / 7,2 / 7,6 / 9,2. El aviador conserva su vuelo y despegue automático;
el hechicero lleva un sombrero más pequeño, separado de la cabeza, y el fantasma
se condensa aún más. Ningún otro héroe cambia sus controles o trajes.

## Combate

Catorce enemigos con cinco anatomías: hiladoras, polillas, vigías de cobre,
caracolas y farolunas. Conservan IA de persecución, defensa, artillería y vuelo,
con preparación y recuperación. Los voladores tienen límites verticales propios
para no perseguir entre pisos atravesando techos.

La **Polilla del Farol** tiene tres patrones cíclicos y tres niveles de presión:
carga de seda, abanico de polen y lluvia de faroles. Fija objetivo al iniciar el
aviso; no sigue al jugador mientras avisa. Carga y columnas muestran las zonas
reales. Su farol abre durante 88 ticks de recuperación, con presupuesto de daño
180 por apertura. El escalado normal de dificultad sigue aplicándose. No hay
superposición de la antigua IA de cuatro eclipses ni del modelo genérico de jefe.
Los trazos de J/K usan sus radios reales; K deja libre la lectura del escenario.

## Cinemáticas y extensión

`systems/chapter-cinema.js` contiene los guiones por evento. Se integra en el
reproductor existente, con su cola, pausa de simulación, teclado, botón táctil y
texto accesible. Eventos: `roomEnter`, `chapterBossIntro`, `chapterBossVictory`, `awaken`,
`chapterHundred` y `chapterExit`. Las cuatro evoluciones usan los actores reales.

La derrota del guardián presenta las voces del hogar antes de entregar el sello. Los tres ecos están visibles y tienen guía aunque el sello aún no se haya concedido. La victoria no repite la introducción del jefe al reanudar.

La historia sigue al Eco que dispersó a la familia. Michi recupera las luces y
prepara el camino de Cuerno. Los cien recuerdos reúnen a los diez actores.
`CHAPTER_STORY` identifica a los diez héroes; `CHAPTER_FILMS[hero][event]` permite
incorporar otros capítulos sin duplicar el reproductor ni sus disparadores.
Solo Michi adopta los nuevos guiones en esta entrega.

Para añadir vídeo después, configurar
`CHAPTER_MEDIA[hero][event][shot] = {video:'assets/cinema/nombre.webm'}`. Solo se
admite la carpeta de medios del mismo origen (también bajo GitHub Pages). Si el
vídeo no está listo, falla o se solicita movimiento reducido, sigue el Canvas.
El vídeo es silencioso, se pausa al cambiar de plano y al terminar la escena.
No se incluye ni se necesita ningún vídeo en esta entrega.

## Evidencia

Los resultados ejecutados se registran en `V648-VALIDATION.json`; las URLs y
commits efectivamente publicados, en `V648-PUBLICATION.json`. Las pruebas de
renderizado y de posición son distintas de la prueba física del capítulo. Una
imagen de galería no acredita haber completado una campaña.
