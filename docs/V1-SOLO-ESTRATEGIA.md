# OHANA · Estrategia de cierre de la V1 individual

Estado de planificación: 24 de octubre de 2026. Referencia local: V501, rama `feat/v501-playable-journey`, base V500 `981526fc51177355f138e6f7f3917f5d037dade7`. No acredita publicación ni CI remoto. Punto de reanudación: `HANDOFF-V1-SOLO.md`. Estado estructurado: `v1-solo-status.json`.

## Qué será la V1

Una campaña completa para un jugador: diez capítulos conectados, cada uno con su protagonista y sus cinco formas, diez minijefes propios, diez sellos, Quimera, desenlace y vuelta al menú. Kilo inicia el juego. La identidad, animaciones, poderes y colecciones ya construidos se aprovechan; no se reinician desde cero.

Completar los diez personajes será suficiente para entrar en cierre de V1 cuando estén integrados sus capítulos completos. Tener diez dibujos, diez repertorios o diez mecanismos aislados no basta: deben poder jugarse, guardarse y terminarse como una sola aventura.

No se añaden para cerrar esta V1: Mundo 2, servicios multijugador, infraestructura externa, nuevos héroes, nuevas formas, un editor de niveles, otro sistema de monetización o un rediseño general del motor. Los cien recuerdos por sala siguen siendo exploración opcional; nunca son una llave para terminar la historia. Deben ser alcanzables si se ofrecen al jugador.

## Reglas de campaña

- Cada capítulo carga a su dueño como bebé. La evolución se gana dentro de ese capítulo; la última forma tiene un tramo útil antes de su desenlace.
- Morir, reintentar o usar Continuar conserva el avance independiente ganado y la evolución local. Los objetos transportados y temporizadores transitorios pueden reiniciarse; la interfaz debe explicarlo.
- Los sellos y recuerdos son progreso permanente. Conservar compatibilidad con saves v2/v3 y premios únicos. Una partida antigua con un sello ganado no queda bloqueada por un requisito añadido después.
- La ruta principal enseña sus herramientas; la alternativa explota movilidad o estrategia. Un vuelo libre, una caída pesada y un lanzamiento balístico no son el mismo recorrido con otra decoración.
- Un poder nuevo cambia decisiones o accesos. La respuesta enemiga se anuncia y deja una oportunidad de actuar; aumentar HP o daño no sustituye al diseño.
- En una sala nueva no se debe empezar con la forma máxima heredada. La arena final es un desenlace de toda la campaña y tiene su propio contrato, descrito abajo.

## Estado real de partida

La base contiene diez héroes, cincuenta formas, diez salas del Mundo 1, sus mecanismos, Quimera y epílogo. V501 añade transición al protagonista correcto, crecimiento local, selector por capítulos, presentación, música, guardado de estaciones y mejoras de interacción.

Kilo tiene una primera integración completa del capítulo: cuatro encuentros y notas, cinco formas alcanzadas, Tambor con recuperación/avisos aéreos, vuelo solar, J dirigido, vigías y carillones persistentes. El piloto físico verifica también Continuar. Sigue pendiente su aceptación humana de dificultad y el recorrido completo de cien recuerdos.

Stitcho tiene ya integración local en V502: reparaciones, raíl de bola, cuatro hitos de crecimiento y Núcleo Glitch en su sala. El piloto físico verifica cinco formas, Continuar, control táctil y salida a Chispín bebé. Sus cien recuerdos y dificultad humana siguen pendientes. Chispín integra ahora sus cuatro antenas, cinco formas, tres arcos con alternativas J/K/espera y Titán de Trueno en V506. Piloto físico, Continuar, blink táctil y salida a Michi bebé aprobados; dificultad humana y cien recuerdos pendientes. Los siete personajes restantes conservan sus repertorios y sistemas históricos; todavía necesitan integración y aceptación como capítulos completos. No confundir los documentos de cierre de repertorio con el cierre de la campaña actual.

Validación local de referencia: 1.496 pruebas Node, release gate y auditoría general de navegador aprobados antes de esta entrega documental. Las fixtures de acceso, forma o posición se distinguen de los recorridos físicos; el resto de capítulos no se presenta como ganado por esas fixtures.

## Orden de ejecución y condición de cierre por capítulo

Se sigue el orden real de WORLD1_ORDER. Los contratos visuales y tácticos detallados están en `CAPITULOS-IDENTIDAD.md` y WORLD1_CHAPTER_PLANS.

| Orden | Capítulo | Trabajo concreto siguiente | Evidencia mínima para cerrarlo |
| --- | --- | --- | --- |
| 1 | Kilo | Aceptación humana; revisar cámara, avisos, dificultad y cien recuerdos; corregir únicamente hallazgos reproducibles | Bebé → cinco formas → notas/carillones → Tambor → Stitcho bebé; móvil y Continuar; inventario alcanzable |
| 2 | Stitcho | Integración local V502 aprobada; revisar dificultad humana y cien recuerdos | Crecer reparando y atravesando el taller, derrotar Núcleo, guardar reparaciones y salir con Chispín bebé |
| 3 | Chispín | Integración local V506 aprobada; revisar dificultad humana y cien recuerdos | Antenas ganadas, desplazamiento útil, jefe real, retorno de Continuar sin perder conexiones |
| 4 | Michi | Integrar medusas, control de grupos y Espíritu Astral Felino en el jardín | Cruces suspendidos alcanzables, uso efectivo de control, cinco formas y jefe sin exigir XP externa |
| 5 | Cuerno | Integrar rutas de luz, prismas y minijefe existente en su bosque | Orden I/II/III conservado, flancos y altura legibles, jefe y salida propia |
| 6 | Dragón | Llevar térmicas, fuego/obsidiana y Guardián al capítulo de la forja | Ascenso y picado útiles; peligros compatibles con vuelo; no bloquear a la forma inicial |
| 7 | Dino | Integrar peso, aterrizajes, placas y Coloso | Caídas deliberadas y recuperables, objetivos persistentes y combate propio; no copiar vuelo |
| 8 | Frita | Integrar impulsos, premios y Rey Crujiente | Todas las trayectorias/prêmios físicamente alcanzables, corrección aérea y jefe; sin cortar el impulso por un salto previo |
| 9 | Pizza | Integrar reparto, preparación de caminos y Chef Magmático | Entregas viables con calor real, rutas alternativas entre pedidos, cinco formas y jefe |
| 10 | Yomi | Integrar fases de terminales, cobertura y minijefe propio | Ventanas coinciden con la lógica, estrategias de control reales, último sello y acceso coherente al final |

Para cada fila: auditar lo existente → escribir hitos y encuentros → adaptar arena/guardado → implementar → probar desde bebé → revisar móvil y persistencia → registrar evidencia → corregir → aceptar. Una fila no se cierra porque su archivo exista.

## Paquete Stitcho: integrado en V502; aceptación humana pendiente

Objetivo: completar `w1-stitcho`, aprovechando `stitcho-trail.js`, `stitcho-boss.js`, `stitcho-room.js`, sus animaciones, plasma, bola y baile. No copiar las cuatro flores de Kilo ni tocar su arte o vuelo para adaptar Stitcho.

Secuencia prevista:

1. Entrada segura y primera pieza a distancia de caminar; un enemigo enseña plasma y lectura de avisos. La pieza cero es un ID válido.
2. Primera reparación: primer hito de crecimiento y apertura de bola K. No exigir K antes de desbloquearla.
3. Un raíl principal con espacio de ensayo permite usar la bola y sus rebotes: segundo hito y apertura de L.
4. Segundo taller: combinar transporte, paredes y eliminación de un arco eléctrico con J; tercer hito y apertura de I.
5. Última reparación: ruta que permite elegir entre rapidez y seguridad; cuarto hito, última forma y P disponibles antes del Núcleo.
6. Núcleo Glitch: patrones propios con preparación, recuperación y fases existentes. Sello solo tras reparaciones y jefe; siguiente capítulo con Chispín bebé.

Implementación:

- Parametrizar arena, origen y roomId de los sistemas históricos mediante valores por defecto compatibles. No sustituir indiscriminadamente `hub` por `w1-stitcho`.
- Usar ID estable nuevo para el encuentro del capítulo; conservar el ID histórico. Coordenadas y cámaras deben pertenecer a su sala de 9.600 unidades, no a la arena antigua de 3.120–3.990.
- Definir IDs estables para el raíl principal/hitos antes de escribirlos en save. Reutilizar los validadores de estaciones/secretos y probar serialización de verdad.
- Los mínimos de XP pueden asegurar el crecimiento ganado, sin sumar XP otra vez ni reducir XP superior. Justificar los cuatro hitos con acciones distintas; no convertir el álbum opcional en trabajo obligatorio.
- Guardar las reparaciones y el raíl resuelto. La pieza en manos se pierde al reintentar si sigue siendo transitoria; la guía debe volver a la pieza/taller apropiados.
- Añadir un piloto físico propio sin setPlayer, setXp, setEvo, curación ni victoria inyectados. Las fixtures para acceso a Stitcho se declaran; no acreditan ganar Kilo.

Aceptación: Kilo permanece en verde; Stitcho llega desde bebé a su forma final, obtiene su sello tras Núcleo, usa Continuar a mitad del taller y pasa a Chispín bebé. Controles táctiles, movimiento reducido, 100 recuerdos alcanzables y premios únicos revisados. Registrar números y fallos, sin afirmar aceptación humana si no ocurrió.

## Quimera y desenlace

Trabajo pendiente obligatorio de integración, separado de crear más contenido:

- Unificar entrar desde Yomi, elegir Final en el menú y usar Continuar. Hoy esas rutas pueden dejar un héroe/forma distintos.
- Decisión de implementación para el cierre mínimo: final con Kilo Flor Solar, habilitado por los diez sellos ganados. Su repertorio familiar evita introducir diez controles durante el desenlace. Es una decisión del plan, todavía no código aplicado. La forma se deriva del acceso legítimo; no de un atajo de depuración.
- Mantener la Quimera, sus fases, presentación, derrota y epílogo existentes. La familia participa en la narrativa; los relevos jugables de diez héroes quedan como mejora posterior, no como dependencia de V1.
- Verificar que vuelo, control y ataque de área no anulan todas las fases. Adaptar avisos/respuestas necesarios antes de declarar el combate cerrado.
- Checkpoint claro antes del jefe; morir no borra los diez sellos. Continuar restaura el estado coherente y no repite premios de victoria.
- Probar victoria → escena de derrota → reunión → créditos/fin → menú; recargar después conserva la victoria y permite continuar/revisitar sin una segunda recompensa.

## Puertas de salida de la V1

| Puerta | Para considerarla aprobada |
| --- | --- |
| Contenido | Diez capítulos con identidad, crecimiento útil y minijefe real; Quimera y desenlace integrados |
| Recorrido | Campaña completa desde save vacío, sin ayudas de depuración ni softlocks; se registran muertes/reintentos |
| Persistencia | Continuar tras cerrar navegador; muerte, cambio de capítulo, save antiguo, derrota de cada jefe y victoria final |
| Colección | Los cien recuerdos ofrecidos por sala son alcanzables; premio único; colección opcional durante la historia |
| Entrada y legibilidad | Teclado, mando existente y táctil; móvil vertical/horizontal, escritorio y movimiento reducido; sin controles cubiertos |
| Dificultad | Revisión humana que confirme comprensión, ventanas justas, utilidad de poderes y forma máxima sin trivializar el desenlace |
| Técnica | Suite Node, navegador, regresión visual y release gate aprobados sobre el candidato final; cero errores de ejecución conocidos |
| Publicación | CI y Pages aprobados en el mismo SHA; URL y actualización del SW comprobadas con save existente y visita limpia |

Las pruebas aisladas preparan formas/posición para diagnosticar; nunca sustituyen al recorrido físico de campaña. Un job verde o un ZIP local no son publicación. El estado pasa por candidato local → candidato integrado → URL comprobada → V1 publicada.

## Control de alcance

Al cerrar una fila se congelan sus reglas salvo errores encontrados por la siguiente integración. Las ideas nuevas que no bloquean terminar, comprender, guardar o usar los poderes pasan a después de V1. No habrá que inventar otros diez sistemas para declarar terminado el juego.

Prioridad de corrección: bloqueo/pérdida de progreso → controles/colisiones → discrepancia entre aviso y daño → dificultad injusta o trivial → claridad visual/sonora → decoración adicional. Los defectos reproducibles abiertos van al registro de estado con archivo, pasos y resultado esperado.


## Próxima integración: Michi

Auditar `michi-trail.js`, `michi-boss.js` y el repertorio de control de grupos antes
de trasladar arenas. Mantener la identidad de medusas y cruces suspendidos; no copiar
arcos eléctricos. Cinco formas ganadas en su capítulo, Espíritu Astral real antes
del sello, guardado, táctil y salida a Cuerno bebé. Acceso al piloto se declara como
fixture; ningún set de salud/posición/forma se admite para acreditar victoria física.
