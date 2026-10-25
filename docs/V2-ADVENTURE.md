# OHANA V2 · ohana-600 publicada

Disponible: https://gracianb.github.io/project-ohana/?release=600

Runtime `6ecdb76`, Quality completa y Pages aprobados; 46 archivos runtime
comparados por SHA256 y arranque público con caché activa comprobado.

La campaña crece con un segundo acto que usa la forma máxima, diez guardianes
articulados, presión de combate mayor y recompensas que se ven durante la partida.
La V514 de la PR440 (`53e386f`) está integrada, incluidas sus correcciones de flores,
notificaciones, recorridos físicos y geometría real del selector. Su Quality y sus
cinco controles independientes terminaron aprobados antes de integrar la V2.

## Recorridos y estrategia

Las diez salas pasan de 9.600 a 14.400, con suelo de recuperación continuo,
repisas reales, tres puntos de control extra y seis enemigos del nuevo tramo.
El sello nuevo requiere las estaciones, el guardián y tres descubrimientos del acto II.
Los sellos antiguos conservan la exploración libre. La colección de cien sigue siendo opcional.

| Héroe | Segundo acto y acción real |
| --- | --- |
| Kilo | Jardines sobre las nubes: vuelo K y J cerca de tres carillones altos. |
| Stitcho | Corazón nocturno del astillero: andamios y baterías conectadas con plasma J. |
| Chispín | Torres de la tormenta: subir por los conductores y conectar J. |
| Michi | Tres lunas: alcanzarlas en el aire, sin resolverlas estando quieto en una plataforma. |
| Cuerno | Carrera de cometas: cruzar arcos con velocidad de carrera. |
| Dragón | Chimeneas del cielo: térmicas visibles y nidos que se encienden con J. |
| Dino | Corazones de la montaña: saltar sobre las placas y aterrizar con fuerza; K acelera la caída. |
| Frita | Mercado de globos: fuelles que lanzan y especias suspendidas en el aire. |
| Pizza | Cena de fareros: recoger cada pedido en su horno y entregarlo a tiempo. |
| Yomi | Archivo de las voces: leer AHORA y conectar con J. |

Los descubrimientos se guardan por sala en `ohana-expeditions-v2`, se migran desde
los secretos ya ganados y sobreviven al cambio de héroe, reintento y recarga.
Un descubrimiento ya completado no vuelve a conceder puntos.

## Identidad y combate

Se conservan las curvas reales y los contratos de identidad integrados de V514.
En quinta forma, Dino tiene 360 de vida y H de 92; Chispín, 138 de vida y mayor
cadencia; Cuerno corre a 9,6 con H de 23. Yomi corre a 5,3 y depende de análisis y
contención. Las ventajas y debilidades aparecen en la selección, y sus valores son
los consumidos por el movimiento, vida, golpe y recuperación de habilidades.

En la campaña V2, Normal permite tres atacantes coordinados, anticipaciones y
recuperaciones más cortas, más vida enemiga y mayor daño. Difícil permite cuatro.
Los perfiles de los escenarios históricos se mantienen separados para no alterar
por accidente sus pruebas o comportamiento. Los enemigos conservan las respuestas
específicas al héroe integradas en V514 y tienen cuerpos mayores, volumen de material,
segmentación, miembros y detalles propios de cada fauna.

Los diez guardianes tienen nuevos cuerpos Canvas, articulaciones, herramientas,
rostros, materiales y detalles de superficie. Se distinguen el taiko vegetal, araña
mecánica, polilla titánica, felino lunar, ciervo prismático, wyvern, fósil acorazado,
rey cangrejo, chef y custodio alado. La preparación y recuperación mueven sus armas.
El guardián lee posición/altura al comprometer el ataque y no cambia después su
puntería. Las ventanas de daño evitan resolverlo con un solo poder o aturdimiento perpetuo.
No se usa IA generativa ni aprendizaje persistente por enemigo.

El golpe real tiene una señal temporal propia: la invulnerabilidad de una habilidad
no adopta pose roja de daño ni hace desaparecer al héroe. Las articulaciones de
los diez recuperan el equilibrio; se diferencian ascenso, extensión de caída y
vuelo. Las alas maduras tienen batidos más lentos. Se conserva movimiento reducido.

## Comprender poderes y combinaciones

El mapa M muestra la campaña actual, terreno real, estaciones, descubrimientos,
posición, objetivo activo y explicación del kit. El minimapa añade la meta y, con
la brújula, los recuerdos próximos. La sala nocturna de Stitcho usa el renderer
real de su cielo y conserva contraste de plataformas y maquinaria.

La guía en partida distingue un plan sugerido de un requisito obligatorio.
Kilo I muestra los tres aciertos reales H/J y la señal de remate preparado; los
rebotes de un mismo lanzamiento cuentan una vez. Para el resto, I es independiente
de la secuencia sugerida. P muestra su carga ganada por daño; U, el compañero.
La firma de un héroe anterior no se conserva por error al empezar otro capítulo.

Cada objeto cercano tiene nombre. Al recogerlo, un indicador grande explica el
efecto y el tiempo restante. La estrella tiene una composición original rápida,
protección y daño de contacto reales durante ocho segundos, aviso final y retorno
al tema de la sala al terminar. Se respetan silencio y volumen.

## Cien recuerdos que producen algo visible

- Página de diez: recupera hasta diez de vida.
- 25: brújula, los recuerdos aparecen en el minimapa.
- 50: imán, aumenta el alcance real de recogida.
- 100: una celebración con coreografía, objeto, paisaje y frase musical propios,
  además de una firma visual permanente alrededor del héroe.

La escena tiene duración finita, Esc y toque para volver. Oculta poderes, mensajes
y combos para que la recompensa se pueda ver. El álbum explica los hitos desde
el principio y permite repetir una celebración ya ganada. Los cien recuerdos de
versiones anteriores conservan su recompensa y acceso a la escena.

## Comprobación

Los informes exactos están en `V600-VALIDATION.json`; los drivers están versionados.

- `test:browser:campaign`: guardado limpio, una página, controles reales, cinco
  formas por héroe, treinta descubrimientos, diez sellos, Quimera, reencuentro,
  resultados y selección. Después vuelve a cada héroe y comprueba sus tres
  descubrimientos. No concede vida, formas, XP, posiciones, sellos o victoria.
- `test:browser:memories`: usa el respaldo de campaña ganada y recoge físicamente
  lo restante hasta mil; registra la celebración al ganar cada centenar.
- `test:browser:memory-save`: diez álbumes y reliquias conservados tras recargar.
- `v600-reward-replays.mjs`: reproduce diez escenas realmente ganadas, comprueba
  escenario sin widgets de combate y salida por Esc/toque móvil.
- `test:browser:v2-presentation`: diez guardianes, diez tramos nuevos, mapa y estrella
  real con música y expiración. Los fixtures de cámara/forma no se cuentan como progreso.
- Presión de Normal, auditoría general, cien renders de tamaño y actuación de
  cuarenta estados; medición RAF separada de las pruebas aceleradas.

Las partidas automatizadas prueban funcionamiento y presión, no sustituyen la
valoración del usuario sobre diversión, dificultad percibida o acabado artístico.
No se declara aprobado un workflow de V2 usando el resultado anterior de V514.
