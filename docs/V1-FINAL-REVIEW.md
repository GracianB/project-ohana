# Revisión final solicitada — candidato V513

Los seis frentes de implementación se resuelven en V513. La aceptación artística y la dificultad percibida se comprueban jugando la versión publicada; las pruebas automatizadas no sustituyen esa valoración.

## Criterios de aceptación
- [x] Diez salas: fantasía, contraste, recorrido y estrategia propios de las habilidades de su héroe; revisión visual en escritorio y móvil.
- [x] Escala coherente en partida, selección, mapa y cine; cuerpo del dragón legible sin confundir alas con altura corporal.
- [x] Cuerno: cara y ojos legibles, crin y cuerno claros, galope/salto/caída/daño articulados; J arcoíris.
- [x] Michi: expresión amable y J a distancia con identidad propia, sin depender del yoyó.
- [x] Kilo: cuarta forma más limpia; última forma blanca con halo reconocible; baile también durante el juego.
- [x] Yomi: diseño y actuación propios de una inteligencia luminosa, mecánicas visibles.
- [x] Todos: correr, saltar, caer, recibir daño y lanzar poderes con actuación propia; tiempos de poderes diferenciados.
- [x] Compañero U: actuación conjunta más larga y comprensible (confirmado por el usuario).
- [x] Entrada de sala sin dos cines consecutivos.
- [x] Enemigos: anticipación corporal/arma, sin rayos amarillos genéricos; diseños cuidados y tácticas coordinadas.
- [x] Tres dificultades con comportamiento, reacción y presión distintos; normal requiere esquivar y combinar herramientas.
- [x] Identidad jugable real: Cuerno veloz, Dino pesado y fuerte, roles distintos para los diez.
- [x] IA local acotada y medible; memoria táctica durante la partida, sin prometer aprendizaje neuronal ni persistencia entre partidas.
- [x] Selección y apertura con dirección visual coherente y puesta en escena activa de la familia.
- [x] Pizza: edificios sobre un muelle visible, separados del agua.
- [x] J a distancia o híbrido para los diez héroes.
- [x] Final exige diez sellos; campaña continua, Quimera, recuerdos y regresiones comprobados.
- [ ] Aceptación humana antes de declarar V1 aceptada por el usuario (publicación registrada en el estado).

## Cambios en curso
Se registran evidencias de pruebas y resultados reales antes de marcar cualquier criterio.

## Auditoría histórica de V512 — superada por la resolución V513 de abajo

| Petición | Implementado en el candidato V512 | Trabajo que sigue abierto |
| --- | --- | --- |
| Diez salas únicas y mejores recorridos | Composiciones V511, diez mecanismos propios; contraste de materiales y eliminación de fondos que tapaban otros fondos | Rediseño más profundo de tramos, decisiones de combate y remate de decorados en las diez; no confundir cambio de paleta con sala terminada |
| Tamaños | Curva óptica común en selección/cine/mapa, cuerpo del dragón mayor, matriz de 100 renders sin alterar colisiones | Revisar proporcionalidad de enemigos y jefes y encuadres de cinemáticas completas, no solo fichas |
| Cuerno | Modificado el renderer REAL cuerno-v373: sin astas azules ni sol sobre la cara, cabeza y ojo mayores, salto y caída diferentes; J arcoíris | Más actuación de patas/cuello/alas en todos los estados y revisión humana de la quinta forma |
| Michi | Pupila redonda y párpado suave; J zarpa lunar sin retorno | Más expresión de cuerpo y cara, especialmente formas de medusa y eclipse |
| Kilo | Cuarta sin capa ni turquesa; halo sencillo sobre cabeza en quinta; baile en reposo | Comprobar legibilidad durante vuelo, poderes y cinemáticas; aceptación humana de traje/halo |
| Yomi | Quinta con diez aves plegadas de memoria, tiempos de actuación propios | Una propuesta visual más ambiciosa para toda su evolución y su sala, no solo adorno en la quinta |
| Enemigos | Sin líneas amarillas/glifos genéricos; equipo ligado al cuerpo, alcance real para melee, flanqueo y retirada consumidos | Revisar las familias visualmente más débiles y diseñar respuestas propias al héroe en cada sala |
| Dificultad | Fácil/Normal/Difícil cambian simultaneidad, vida, daño, anticipación, recuperación, marcha y puntería; corregida vida de capítulo que anulaba el modo | Prueba de presión real, balance de U/curación y combates normales; todavía no se acredita dificultad satisfactoria |
| Identidad jugable | Cuerno sigue siendo el más veloz; Dino pega más fuerte con recuperación más larga; diez kits existentes distintos | Afinar curvas y compensaciones de los diez con encuentros que obliguen a aprovecharlas |
| IA y rendimiento | Memoria táctica local y acotada de aire/disparos; decisiones sin red ni modelo generativo; olvido gradual | Medición real de render en móvil y campaña completa; aprendizaje persistente NO implementado ni prometido |
| Entrada y U | Una sola llegada por sala, sin duplicar la de Kilo; compañero real dura 480 ticks activos, sin daño extra durante prolongación; poses U conectadas al héroe | Mejor coreografía conjunta específica de cada pareja; ocho segundos no equivalen por sí solos a buena animación |
| Animaciones de diez héroes | Perfiles de actuación/peso y tiempos distintos; cambios anatómicos específicos de Cuerno | Revisión anatómica individual de carrera/salto/caída/impacto en los diez; un transform compartido no basta |
| Selección/apertura | Una paleta coherente y elenco en dos planos; escala común y baile de Kilo | Mejor puesta en escena que una parrilla de tarjetas y dos filas; conservar navegación y móvil |
| Pizza | Muelle de piedra explícito bajo edificios | Integrar costa, casas, rutas y reparto en una escena de más fantasía y profundidad |
| Final y cierre | Puerta de Yomi y aparición de Quimera exigen diez sellos; prueba aislada de Yomi ya no simula campaña completa | Campaña continua ganada, final, recuerdos, aceptación humana y publicación verificada del resultado completo |

La petición queda abierta hasta resolver los pendientes. Las pruebas de progresión
no certifican diversión, dificultad adecuada ni calidad artística aceptada.

## Entrega V512 verificada (base, no cierre de V1)

Commit de juego: `1ff944725665667ad8bbf089402067869d535d04`.
[Probar V512](https://gracianb.github.io/project-ohana/?release=512).
[Pages: verificación y despliegue correctos](https://github.com/GracianB/project-ohana/actions/runs/40205716045).
Los 42 archivos runtime modificados coinciden por SHA256 con los publicados.

- 1.540 pruebas Node aprobadas; release gate aprobado, 323 módulos y 373 recursos offline.
- Auditoría general de navegador aprobada; 100 verificaciones de tamaño en 50 formas.
- Diez pilotos físicos de capítulo aprobados. La prueba actualizada de Yomi conserva
  su sello ganado pero bloquea el final porque faltan los otros nueve.
- Diez compañeros U: siguen al lado y a la altura del héroe pasados seis segundos,
  expiran a los 480 ticks activos y no amplían el presupuesto de daño anterior.
- Entrada única de las diez salas, introducción sin encadenar otra llegada,
  bloqueo de aparición del jefe final con sellos incompletos y móvil comprobados.

Estas comprobaciones no cierran ninguno de los pendientes artísticos, de balance
humano o de campaña continua descritos en la tabla. No se declara V1 lista.


## Resolución V513 de los seis frentes

| Frente | Resultado implementado y comprobable |
| --- | --- |
| Diez salas | Cinco bancos propuestos por sala (se descartan los que invaden mecanismos), rutas altas y escondites; tres encuentros finitos de roles complementarios. Diez grandes decorados Canvas curvos, con materiales, luz y composición propios, cacheados con límite de tres escenas. |
| Personajes | Ritmos de apoyo y recuperación distintos que alimentan las articulaciones reales; ajustes de manos, rodillas, cabeza y caída. Yomi evoluciona como una inteligencia de papel/memoria: pétalos de escucha, alas de páginas articuladas y seis células que muestran los enemigos analizados realmente. |
| Enemigos | Diez anatomías de fauna específicas de sala con preparación, ataque y aturdimiento corporales. Escudos, armas y mando siguen ligados al rol real. Tambor del Claro tiene cuerpo de taiko de madera, raíces, cara tallada y mazos articulados. |
| Normal | Anticipación más breve, dos atacantes coordinados, vida de capítulo aplicada también a Stitcho. U dura ocho segundos pero tiene recuperación real y no puede reinvocarse mientras vive el compañero. Prueba de presión mediante controles: esperar ante el primer grupo mata a Kilo en Normal; moverse, saltar y atacar permite sobrevivir. |
| Selección e inicio | Jardín habitado por los diez, sendero, escenario vivo y siluetas/actuaciones por héroe, sin parrilla Canvas de tarjetas. Apertura en tres profundidades con terrazas y actuaciones existentes. Navegación real con ratón, flechas y selección en móvil comprobada. |
| Campaña y recuerdos | Entrada final como Kilo Flor Solar solo después de diez sellos ganados. Revisitas recuperan silenciosamente la forma ganada y conservan jefes derrotados. Mil recuerdos recogidos físicamente; diez reliquias y álbumes conservados al recargar. |

### Dirección de recorrido y estrategia

| Héroe | Fantasía y decisión de juego |
| --- | --- |
| Kilo | Anfiteatro de raíces y cascada; alternar suelo/cielo frente a escudo y vigía, explorar con vuelo solar ganado. |
| Stitcho | Nave suspendida en dique seco; despejar con plasma, transportar piezas y completar la rodada del raíl sin interrupción. |
| Chispín | Instrumentos de mármol sobre bancos de nubes; enlazar grupos con J y terminar el blink fuera de la línea del tirador. |
| Michi | Lirios lunares, medusas y faroles; dormir la ronda y usar la zarpa para limpiar la ruta elevada. |
| Cuerno | Puente vivo sobre un río prismático; velocidad para alcanzar flancos y arcoíris contra filas de guardias. |
| Dragón | Caldera abierta y cascadas de lava; térmicas y vuelo para evitar el suelo cubierto y atacar desde arriba. |
| Dino | Cráneo fósil, costillas y helechos gigantes; ganar altura y romper grupos de corazas con K. |
| Frita | Mercado suspendido de globos; aprovechar el géiser para pasar la calle de tiradores y acertar en el aire. |
| Pizza | Casas sobre acantilado/muelle, balcones y reparto por cable; despejar primero y elegir ruta segura con el pedido. |
| Yomi | Biblioteca luminosa que crece como árbol, libros convertidos en aves; leer AHORA, prolongarlo con J y contener descargas con K. |

### Evidencia reproducible y límites

- `npm test`: 1.544 aprobadas. `release:check`: 327 módulos runtime, 377 recursos offline.
- `test:browser:campaign`: una página y guardado limpio, diez capítulos con sus cinco formas y sellos ganados, cuatro fases de Quimera. No concede HP, XP, formas, sellos o victoria. Usa controles reales y ayuda de salto mantenido ante los bancos.
- `test:browser:memories`: carga el respaldo ganado de campaña para reabrir salas completadas; todos los objetos restantes se alcanzan con controles. Permite reanudar el respaldo, sin inyectar recuerdos. `test:browser:memory-save` verifica 1.000 IDs, diez reliquias, diez paneles de álbum y recarga sin pérdidas.
- `test:browser:pressure`: controles reales ante el primer encuentro. No acredita por sí sola que todos los jugadores vayan a encontrar Normal difícil.
- `test:browser:living-stage`: selección real de los diez actores con puntero, flechas y previsualización, escritorio y móvil; lámina de cuarenta estados anatómicos. Matriz óptica: cien renders, cincuenta formas, sin cambiar hitboxes.
- Auditoría general de navegador, diez bancos físicos y salto táctil compartido aprobados. Las capturas de presentación usan posiciones/formas de inspección y no se cuentan como progreso de campaña.
- Medición RAF de veinte escenas: mediana 16,7 ms; peor P95 escritorio 33,3 ms, móvil emulado 16,8 ms, sin fotogramas de más de 50 ms en esa muestra. Es este navegador/CPU, no una promesa para cualquier teléfono.
- La IA es local y acotada: memoria táctica de la partida, sin servicios generativos ni aprendizaje persistente entre partidas.

La implementación de estos seis frentes queda entregada como candidato V513. La valoración del usuario sobre arte, diversión y dificultad sigue siendo una aceptación de producto, no un test que se pueda marcar en su nombre. Los resultados exactos y publicación están en `v1-solo-status.json` y `V513-VALIDATION.json`.
