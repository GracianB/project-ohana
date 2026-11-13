> Implementación candidata de los puntos 2–5: [V639-EXPERIENCIA.md](V639-EXPERIENCIA.md). Alcance y límites de las comprobaciones: [V639-VALIDATION.json](V639-VALIDATION.json). Publicación pendiente; el punto 6 continúa abierto.

# Ohana · rediseño de la experiencia

Estado: plan de la siguiente entrega. Las secciones 1–6 describen trabajo pendiente, no funcionalidades ya publicadas. El rediseño de Quimera está implementado y validado en el candidato ohana-638. El cambio de Michi continúa en la PR #461.

## Dirección y alcance acordados

Peticiones: rehacer entrada, sala de espejos y selector; elegir personaje, destino y una evolución conseguida; despejar la interfaz; mejorar profundamente Kilo, sus enemigos y las salas. El usuario reabre expresamente Kilo, incluido su cierre histórico de AGENTS.md. Mantener guardados, accesibilidad, teclado, mando, táctil y modo online.

Referencia consultada: GracianB/GracianB (portfolio), su Solar Atlas/constellation-v3.css. Aprovechar su jerarquía, espacio, contraste nocturno y navegación entre mundos. Diseñar un juego propio: no copiar el portfolio ni reproducir la sala de espejos con otro color.

Concepto: **Atlas de Hoku**. Cielo nocturno, islas suspendidas, luz cálida y personajes animados grandes. Cada pantalla tiene una decisión principal. La espectacularidad viene de las escenas, el movimiento y las respuestas del mundo; no de añadir paneles, botones o partículas por todas partes.

## 1. Progreso y arranque: primero que las decisiones sean reales

- Un registro persistente de la evolución máxima conseguida por personaje, separado de la partida activa. Reiniciar una partida no borra lo aprendido ni desbloquea formas gratis.
- Migrar evidencias existentes: partida válida, evolución guardada, estaciones completadas y sellos. No inferir desbloqueos por haber mirado una previsualización.
- Distinguir tres acciones: continuar el punto guardado, volver a jugar un capítulo y empezar una aventura nueva.
- Las formas no conseguidas aparecen bloqueadas con el requisito concreto. Las disponibles muestran nombre, silueta y capacidad nueva. No confundir «ver» con «seleccionar para jugar».
- La confirmación conserva una única selección: héroe, destino y forma. La transición, la primera escena y el actor jugable deben coincidir con ella.
- No ofrecer combinaciones que el motor sustituya en silencio. Auditar las salas ligadas a una habilidad exclusiva antes de permitir cualquier héroe en cualquier capítulo. Comunicar las restricciones antes de entrar.
- Mantener el acceso actual a los capítulos; el Corazón conserva el requisito de diez sellos. El Mundo 2 no se presenta como terminado si sigue en construcción.

Hallazgo comprobado: Kilo elegido en forma 4 (índice 3) arranca en evo=3 en la ruta `camp-start`, pero `playIntro(new)` estaba dibujando un bebé y anunciando «Empiezas como bebé». Corregida esa contradicción en el candidato. Falta auditar las demás rutas: botón Jugar, nueva partida, continuar, cambio de personaje/destino y elección del combate final.

Aceptación: selección desde botones reales, no inyección de estado; personaje, nombre, estadísticas y forma correctos al primer fotograma jugable y después de morir, salir y recargar. Pruebas de bloqueo y migración de guardados.

## 2. Entrada y selección: adiós a la sala de espejos

### Portada

Una escena viva breve con el reparto y tres accesos evidentes: **Continuar**, **Jugar**, **2 jugadores**. Continuar solo aparece activo si existe una partida recuperable. La historia larga se puede ver voluntariamente. Ajustes y colección son accesos secundarios.

### Preparar la aventura

1. **Personaje:** retrato animado grande, nombre y una frase de estilo de juego. Una fila de retratos con foco inequívoco sustituye los pequeños personajes mezclados con espejos. La información avanzada se despliega bajo demanda.
2. **Destino:** mapa de islas o capítulos con estado real —por descubrir, en curso, sello recuperado—, objetivo y duración orientativa basada en una prueba de juego. No entrar por accidente al pulsar dos veces un dibujo.
3. **Forma:** evoluciones conseguidas, con el cambio de silueta y su habilidad distintiva. Las bloqueadas conservan su posición y muestran el requisito.

Un resumen fijo conserva las tres decisiones y un solo botón primario: **Entrar en [capítulo]**. Atrás vuelve al paso anterior sin perder la selección. Volver del juego restaura el contexto, sin repetir toda la intro.

En móvil, pasos de una columna y controles de al menos 44 px. En escritorio/mando, navegación direccional predecible. El foco y las etiquetas deben coincidir con lo que se ve.

## 3. Interfaz de combate: espacio para jugar

- Vida e identidad compactas arriba a la izquierda; objetivo de una línea; pausa y opciones arriba a la derecha.
- Retirar la leyenda permanente de teclas y la duplicación de vida/XP/forma en varios paneles. Controles y detalles permanecen disponibles en ayuda/pausa.
- Habilidades con icono reconocible, estado disponible/en enfriamiento y progreso de recarga. Nombre y descripción al enfocar o abrir detalles; no seis tarjetas de texto ocupando el suelo.
- Conservar los atajos existentes. Mostrar indicaciones del dispositivo activo, no teclado y táctil simultáneamente.
- Táctil: movimiento, salto, esquiva y ataque con áreas separadas; poderes secundarios en un desplegable explícito, accesible sin depender de una pulsación larga. Los recursos de remate y suprema siguen visibles cuando importan.
- Minimapa y estadísticas detalladas bajo demanda. Mensajes breves que no tapen al jugador ni compitan con avisos de jefe.
- El contexto manda: exploración, combate normal, peligro y jefe tienen jerarquías distintas. Un golpe se lee por preparación, contacto, reacción y sonido; no por una lluvia de números.

Aceptación: personajes, suelo, peligros, objetivo, vida y recargas legibles a 1280×720, 390×844 y 320×700. Ratón, teclado, mando, táctil, movimiento reducido y lector de pantalla.

## 4. Kilo: identidad jugable, no solo una forma más grande

Fantasía: una artista del viento y el compás que convierte el escenario en su instrumento.

- Revisar las cinco siluetas y su crecimiento; expresiones, manos, apoyo de pies, anticipación, frenada y aterrizaje. El ukelele y el movimiento deben explicar de dónde sale cada poder.
- Núcleo de combate: nota dirigida para abrir una oportunidad, movilidad aérea para colocarse y remate musical al aprovecharla. Secuencia clara de preparación → respuesta del enemigo → recompensa.
- Evoluciones que añadan decisiones: primera supervivencia, dominio del viento, interacción con el dosel, control del compás y vuelo solar. No cinco variantes del mismo disparo con más daño.
- Mejorar sensación con respuesta inmediata, sonidos diferenciados, impactos breves y recuperación legible. Medir alcance, coste, recuperación y utilidad de cada técnica antes de aumentar números.
- Conservar los controles conocidos salvo una decisión explícita de rediseño. Enseñar jugando una acción cada vez; evitar tutoriales que enumeren siete teclas.

Aceptación: el jugador puede explicar cuándo usar cada acción y vencer sin machacar siempre el mismo ataque. Las cinco formas se prueban con enemigos y terreno, no únicamente en una galería.

## 5. La sala de Kilo y sus enemigos: encuentros con intención

Replantear la ruta actual de 14.400 px. Más extensión o más enemigos no solucionan el aburrimiento.

- **Arroyo:** primer combate corto y una bifurcación inmediatamente visible. Enseña la nota y permite un secreto temprano.
- **Bosque de corteza:** escudos que invitan a flanquear o ganar altura; caminos altos y bajos con ventajas distintas.
- **Dosel:** viento, plataformas y enemigos aéreos que obligan a combinar colocación y ritmo. Rutas con superficies reales de descanso.
- **Jardín del compás:** encuentro que combina lo aprendido; el entorno reacciona a la música. Apertura de un atajo permanente y preparación del gran Tambor.

Revisar la distancia entre decisiones y comprimir los tramos vacíos. Cada tramo aporta combate, movimiento, descubrimiento o una pausa breve; no cuatro recados idénticos.

Familias de enemigos con intención:

| Enemigo | Problema que plantea | Preparación visible | Respuesta y oportunidad |
| --- | --- | --- | --- |
| Escarabajo de raíz | Corta el avance por tierra | Se agacha y afirma las patas | Saltar/esquivar; pierde equilibrio al fallar |
| Guardián de corteza | Protege un ángulo, no todos | Gira el escudo hacia el jugador | Flanquear, ganar altura o provocar la embestida |
| Flor lanzasemillas | Controla una ruta a distancia | Se abre y fija la puntería | Cambiar de altura tras el aviso; pausa para acercarse |
| Avispa del dosel | Disputa el espacio aéreo | Suspensión y orientación del aguijón | Esquivar el picado; queda expuesta al remontar |
| Rana del compás | Rompe un ritmo de saltos cómodo | Comprime el cuerpo antes de saltar | Pasar por debajo o castigar el aterrizaje |

Combinar como máximo dos funciones exigentes al introducir una lección. Evitar disparos desde fuera de pantalla, acumulaciones sin salida, vida inflada y perseguidores indistinguibles. Silueta, sonido y preparación deben reconocerlos sin leer el nombre.

El gran Tambor culmina las mismas reglas: compás reconocible, espacio para bailar/esquivar y ventanas de castigo. No ser una esponja de vida.

## 6. Llevar la calidad al resto de salas

Después de validar Kilo como referencia, auditar las otras nueve salas por identidad, rutas, objetivos, enemigos, densidad y minijefe. Cada una necesita un verbo propio y un giro reconocible. Reutilizar herramientas de diseño, no la misma habitación cambiando el color.

No declarar «todas mejoradas» tras aplicar un cambio global de CSS o añadir enemigos genéricos. Entregar y probar cada capítulo por separado; conservar las partidas y la compatibilidad online.

## Orden de entrega y cierre

1. Progreso real + corrección de todas las rutas de inicio y sus pruebas.
2. Portada y selector completos sobre ese contrato de datos.
3. HUD y controles despejados, probados durante combate real.
4. Kilo completo: arte, repertorio, ruta, enemigos y gran Tambor.
5. Revisión individual del resto de salas.
6. Integración con Michi y Quimera, regresiones, CI, y publicación comprobada.

Cada entrega incluye capturas o vídeo de juego, pruebas automatizadas pertinentes y un recorrido de una partida nueva y otra guardada. Las pruebas con acceso/vida inyectados sirven para inspeccionar, no acreditan una victoria ganada. Distinguir implementado, validado localmente y publicado.
