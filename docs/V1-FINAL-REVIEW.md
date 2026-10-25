# Revisión final solicitada — V1 en curso

La V1 NO está cerrada. Esta revisión incorpora también el trabajo pendiente de V511.

## Criterios de aceptación
- [ ] Diez salas: fantasía, contraste, recorrido y estrategia propios de las habilidades de su héroe; revisión visual en escritorio y móvil.
- [ ] Escala coherente en partida, selección, mapa y cine; cuerpo del dragón legible sin confundir alas con altura corporal.
- [ ] Cuerno: cara y ojos legibles, crin y cuerno claros, galope/salto/caída/daño articulados; J arcoíris.
- [ ] Michi: expresión amable y J a distancia con identidad propia, sin depender del yoyó.
- [ ] Kilo: cuarta forma más limpia; última forma blanca con halo reconocible; baile también durante el juego.
- [ ] Yomi: diseño y actuación propios de una inteligencia luminosa, mecánicas visibles.
- [ ] Todos: correr, saltar, caer, recibir daño y lanzar poderes con actuación propia; tiempos de poderes diferenciados.
- [ ] Compañero U: actuación conjunta más larga y comprensible (confirmado por el usuario).
- [ ] Entrada de sala sin dos cines consecutivos.
- [ ] Enemigos: anticipación corporal/arma, sin rayos amarillos genéricos; diseños cuidados y tácticas coordinadas.
- [ ] Tres dificultades con comportamiento, reacción y presión distintos; normal requiere esquivar y combinar herramientas.
- [ ] Identidad jugable real: Cuerno veloz, Dino pesado y fuerte, roles distintos para los diez.
- [ ] IA local acotada y medible; adaptación entre partidas opcional, transparente y reiniciable, sin prometer aprendizaje neuronal.
- [ ] Selección y apertura con dirección visual coherente y puesta en escena activa de la familia.
- [ ] Pizza: edificios sobre un muelle visible, separados del agua.
- [ ] J a distancia o híbrido para los diez héroes.
- [ ] Final exige diez sellos; campaña continua, Quimera, recuerdos y regresiones comprobados.
- [ ] Publicación comprobada y aceptación humana antes de declarar cerrada V1.

## Cambios en curso
Se registran evidencias de pruebas y resultados reales antes de marcar cualquier criterio.

## Auditoría contra la petición completa — 25 de octubre

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
