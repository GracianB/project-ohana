# OHANA · Plan V101–V111: Edición Familia y Concurso

**Fecha del plan:** 09/10/2026  
**Base verificada:** V100.2, PR #237, commit 873524b, caché ohana-302.  
**Objetivo:** V111 como primera edición de lanzamiento, con mejoras posteriores previstas. El número de versión NO sustituye las pruebas de aceptación.

## 1. Visión y reglas no negociables

OHANA nació de las ideas de los sobrinos del creador. Debe ser un juego completo que invite a descubrir, reírse, dominar controles y jugar juntos. La meta de calidad es la respuesta inmediata de un gran plataformas, sin copiar personajes, niveles, nombres, música ni identidad de otras franquicias.

Dos experiencias, un solo universo:
- **Individual / Familia:** aventura de Isla Hoku, diez salas, diez héroes, cinco formas por héroe, la Reina y cien recuerdos. Los recuerdos han de sentirse descubiertos y no solo recogidos.
- **Dos jugadores online / Concurso SME:** misma identidad, controles, héroes, mundos y clímax; progresión compartida real, jugabilidad cooperativa significativa, sala pública funcional y recuperación robusta ante desconexiones.
- **Conservación:** no renombrar GracianB/project-ohana ni cambiar su URL oficial ni borrar historial. Mantener la copia/backup multiplayer. Proteger save v2, controles, hitboxes, accesibilidad, cache, rendimiento y los avances de Dino, Cuerno y la Reina.
- **No prometer lo que no se ha probado:** un E2E con backend simulado NO prueba un backend Netlify desplegado.

## 2. Fotografía real de partida (V100.2)

- PR #237 integrada y GitHub Pages publicado; Node, browser E2E, multiplayer E2E con servicio simulado, matriz visual y Release Gate en verde. El cierre de Work registró 514/514 unitarias.
- El modo individual define 10 salas; multiplayer/mission.js enumera 5 etapas. El motor original también contiene online-coop.js y diez rituales Duo, pero hay que consolidar el recorrido público para que no parezcan dos juegos.
- Tanto multiplayer.js como systems/online-coop.js llaman a /.netlify/functions/game. La URL oficial en GitHub Pages NO hospeda por sí misma ese endpoint. Resolver el alojamiento y los enlaces antes de dar el online por entregado.
- La ruta engineMode de netlify/lib/room-service.mjs recibe posición, sala, vida, vida máxima, experiencia y evolución del cliente. Hoy hay límites numéricos, pero no autoridad completa sobre todas esas transiciones. Es un riesgo de integridad para movimiento, progresión, rituales y victoria.
- Hay PR antiguas #227 (Reina, conflictiva) y #171 (Stitcho) que requieren reconciliación manual frente a main; nunca fusionarlas a ciegas.
- El Festival V100.2 tiene 100 títulos/historias y guardado en navegador. Su álbum y su primer descubrimiento deben convertirse en experiencias de alta calidad; no confundir 100 hallazgos con 100 mecánicas originales.

## 3. Cadencia V101–V111 (dos pistas en TODAS las versiones)

| Versión | Experiencia individual y de familia | Multijugador / concurso | Evidencia para cerrar |
|---|---|---|---|
| **V101 · La primera chispa** | Álbum como libro de aventuras: portada, mapa de capítulos, fichas, pistas justas, estados vacíos y primera recogida cinematográfica breve/saltable, sin saturar. | Auditoría de dos rutas online (lobby/campaña y motor principal); elegir arquitectura pública que preserve la URL oficial; smoke real del backend en staging; inventariar fallos de sala y conexión. | Primer descubrimiento memorable y accesible en móvil; documentación de despliegue y prueba inicial de create/join real, no mock. |
| **V102 · Recuerdos 01–20** | Mejorar los 20 primeros con acciones, reacciones, animaciones originales y microhistorias contextuales, no solo nuevos iconos. | Crear/unirse/elegir/prepararse/entrar/reconectar desde la publicación real en dos dispositivos; reparar errores visibles y mensajes. Configurar endpoint cross-origin o enlace a alojamiento adecuado, sin romper Pages. | Dos personas en redes o sesiones distintas completan inicio y reconexión, grabación o registro reproducible. |
| **V103 · Recuerdos 21–40** | Explorar secretos que recompensan curiosidad y requieren habilidades aprendidas, sin bloqueos. | Movimiento y cámara cooperativos: suavizado, teletransportes involuntarios, pérdida de paquetes y retorno a sala. Limitar/validar coordenadas, cambios de sala y velocidad en servidor. | Pruebas reales con latencia, jitter y pérdida; movimiento sin saltos graves y sin falsificar salas desde el cliente. |
| **V104 · Recuerdos 41–60** | Variedad de sorpresas y situaciones: cada hallazgo debe tener un motivo para recordarlo y un ritmo respetuoso. | H/J/K/L/U donde correspondan, cooldowns, impactos, pasivas y evoluciones visibles para ambos. El servidor debe validar acciones, vida, XP, daño, recompensas y progresión, no aceptar resultados arbitrarios del cliente. | Dos jugadores ven el mismo resultado, sin dobles daños/duplicaciones ni poderes imposibles; pruebas de intentos manipulados. |
| **V105 · Recuerdos 61–80** | Encuentros vinculados a personajes y a la relación entre exploración y combate. | Diez Santuarios Dúo: simultaneidad real, posiciones validadas, recompensa compartida única y cancelación si alguien sale. Añadir retos en los que las contribuciones de ambos importen, sin obligar a escoger héroes concretos. | Diez rituales comprobables, reconexión/abandono/exploit cubiertos, sin premio duplicado ni resolución por un solo jugador. |
| **V106 · Recuerdos 81–100** | Completar los cien con un clímax de colección que respete la victoria de la Reina, rejugabilidad, álbum final y revisita sin frustración. | Guardado cooperativo de checkpoints, progresión, salas visitadas, rituales, estado de pareja y finales; decidir reglas claras al abandonar uno de los dos. | Cero pérdida de progreso tras refrescar, caída de red y reinicio; los 100 recuerdos son alcanzables en individual. |
| **V107 · El juego que engancha** | Pulido del tacto: salto, coyote-time/buffer si hace falta, colisiones, ritmo, cámaras, enemigos, secretos, rutas alternativas y economía de recompensas. Sin añadir efectos que tapen plataformas. | Recorrido cooperativo del mismo Mundo 1 de diez salas, no solo cinco etapas separadas. Integrar enemigos, secretos, dificultad y portales con roles para ambos. | Una pareja termina las diez salas en la experiencia oficial; ningún bloqueo por progreso asimétrico o puerta. |
| **V108 · La Reina compartida** | Equilibrar la antesala, lectura de patrones, escalada dramática, derrota y película final sin cartel prematuro. | Reina completa para dos: ataques legibles, vida y fases compartidas, revivir/apoyo si encaja, victoria única, celebración de ambos y epílogo estable. | Dos jugadores derrotan a la Reina en dispositivos reales y observan un único resultado coherente. |
| **V109 · Nada rompe la magia** | Auditoría de FPS, memoria, sesiones largas, sonido, input, accesibilidad, móvil, pantallas pequeñas y reduced-motion. | Stress, concurrencia, seguridad, duplicados de acciones, límites de salas/códigos, reintentos, desconexiones, costes y observabilidad mínima sin datos personales innecesarios. | Sin incidencias críticas durante sesiones largas; pruebas con 50–200 ms de latencia simulada y reconexión; presupuestos de rendimiento documentados. |
| **V110 · Beta de familia y jurado** | Prueba ciega con sobrinos y personas nuevas: sin explicarles controles, observar si entienden el inicio, el álbum, las evoluciones y el objetivo. Reparar confusión y aburrimiento real. | Beta online de principio a fin con varias parejas: onboarding, código de sala, diez salas, rituales, combate final, fallos de red y cierre. Verificar bases y entregables reales del concurso SME. | Registro priorizado de hallazgos, P0/P1 cerrados, pruebas reales repetibles, capturas y guía para evaluadores. |
| **V111 · Edición de lanzamiento** | Congelar características, equilibrar, cerrar defectos, validar partidas limpias y guardadas, versión/manifest/cache coherentes. | Demostración pública estable, una partida completa de dos personas, guía de despliegue, privacidad básica, vídeo corto de producto y materiales del concurso. | Tag/Release y Pages únicamente si cumple la puerta de lanzamiento descrita abajo. |

## 4. Puerta de calidad: igual en V101–V111

Ninguna versión cuenta como publicada porque exista un commit o una PR. Deben completarse:
1. Unitarias con Node y nuevos tests para las funciones de esa versión.
2. Browser E2E del modo individual: controles, diez personajes, evolución, guardado, álbum y Reina según el cambio.
3. Multiplayer E2E determinista con servicio simulado **más** smoke contra backend REAL desplegado en cada versión que toque online. Mantener diferentes suites para no ocultar fallos de hosting.
4. Matriz visual de escritorio/móvil, pantalla de intro, selector con diez héroes, HUD, álbum, poderes, Nido y final; revisión manual de fotografías/capturas.
5. Release Gate, accesibilidad básica, revisión de errores de consola, caché/Service Worker, informe de tamaño y presupuesto de rendimiento.
6. Fusión sin conflictos y Pages en verde; comprobar que la dirección publicada contiene de verdad el cambio.
7. Nueva documentación de reproducción de bugs y pruebas de aceptación. Si un criterio no se ha ejecutado, estado "pendiente", nunca "PASS".

## 5. Puerta especial de lanzamiento V111

**P0 = impide jugar, entrar a sala, guardar, continuar, vencer o acceder a objetivos.  
P1 = daño grave al control, progreso, justicia, conectividad, experiencia o accesibilidad.**

Requisitos de lanzamiento:
- **P0 y P1 abiertas: 0.** Sin loops infinitos, bloqueos ni pérdidas de progreso conocidas.
- **Solo completo:** diez héroes y sus cinco formas comprobados; rutas de diez salas, 100 recuerdos accesibles, álbum y victoria real, sin control roto.
- **Coop real:** al menos dos partidas completas desde URL pública con dispositivos/navegadores independientes; 10 salas, rituales, sincronización, Reina y epílogo; 3 interrupciones de red/reconexiones por sesión de prueba sin pérdida permanente de progreso.
- **Autoridad:** servidor valida lo sensible (movimiento/transiciones, recompensas, salud, daño, XP, señales, victoria); dos clientes no generan duplicados ni pueden inventar progreso con un payload.
- **Sensación:** aspirar a 60 FPS estables en escritorio representativo y 30 FPS en móvil representativo, midiendo latencia de control, caídas y memoria; documentar dispositivos y resultados, sin prometerlo universalmente.
- **Test de infancia:** al menos tres personas que no hayan trabajado en el código prueban el inicio; observamos si empiezan, eligen héroe, saltan, atacan y entienden la primera recompensa sin explicación continua.
- **Concurso SME:** identificar convocatoria exacta, fecha de cierre, condiciones de elegibilidad, licencias/autoría, formato de envío, demo, vídeo y permisos. **Sin verificar hasta consultar bases oficiales.**
- **Publicación comprobada:** versión y caché correctas, rutas sin 404, enlaces activos, audio opcional, controles móviles útiles, privacy y README claros, Pages y backend online disponibles.

## 6. Registro inicial de riesgos y primeras tareas

### P0 · Resolver al principio (V101/V102)
- URL GitHub Pages vs endpoint Netlify relativo: decidir dónde se ejecuta multiplayer, configurar enlace o endpoint, CORS/seguridad y comprobar dos clientes REALES.
- Flujo dual del multiplayer (lobby/campaña propia de 5 etapas y motor original con diez salas): definir recorrido canónico sin perder funcionalidades ni generar dos juegos que compitan entre sí.

### P1 · Resolver antes de V105
- engineMode confía en posición, sala, salud, XP y evolución enviados por cliente: añadir autoridad y límites reales antes de poder afirmar que Santuarios y combate están validados en servidor.
- Reintentos, idempotencia, reconexión, expiración de sala y concurrencia con Netlify Blobs, incluidos tiempos reales y costes operativos.
- PR viejas #227 y #171: comparar contra main, rescatar solo arreglos ausentes y cerrar sin merges peligrosos.

### Producto · Evitar la inflación de efectos
- Un hallazgo ha de alterar la percepción o la forma de jugar, no solo dar puntos y mostrar una tarjeta.
- Facilitar la primera sesión y respetar al jugador experto: escenas saltables, controles sin fricción y microhumor que no tape ataques.
- No abrir Mundo 2, monetización, sistemas sociales ni más personajes antes de V111: la promesa actual es acabar y pulir el Mundo 1 completo.
- Medir problemas de niños/jugadores, no solo satisfacción del desarrollador. Si la beta descubre un fallo estructural, retrasar etiqueta V111 antes que fingir una entrega perfecta.

## 7. Posterior a V111

Seguir mejorando el producto, pero en una nueva etapa de roadmap: contenido adicional, más modos cooperativos, ajustes de balance, futuras islas y sorpresas basadas en evidencia de juego. V111 significa **primera versión lista para mostrar y competir**, no fin del proyecto.

---

**Norma editorial de OHANA:** cada entrega mejora algo que se juega; la calidad se demuestra en dos personas disfrutándolo y en pruebas reproducibles, no en un contador de versiones.
