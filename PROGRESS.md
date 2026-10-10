## 10/10/2026 · OHANA V108 · vía WebRTC directa, Netlify solo autoridad y respaldo · ohana-313

- **Cambio arquitectónico real:** las posiciones y animaciones de ataques viajan entre jugadores por WebRTC (canal de poses SCTP no ordenado y sin retransmisiones, máximo 20 Hz; canal independiente y fiable de acciones/salas). Netlify autentica la sala y sigue guardando su estado; su repetido sondeo ya no dicta el ritmo visual cuando funciona el enlace directo.
- **Negociación segura:** SDP fragmentado en señales `action/rtc` que el servidor existente ya acepta (carga inferior a 1800 bytes), identidad ligada a los dos jugadores autenticados, protocolo antiguo sin migrar. STUN estándar; sin servidor TURN, las redes que bloquean P2P seguirán utilizando Netlify.
- **Sin engaños:** HUD distingue `DIRECTO WEBRTC` frente a `SERVIDOR (CON RETRASO)`. El ping indicado es el RTT del servidor, no un RTT WebRTC medido. La conexión directa no modifica salud, puntuaciones ni poderes autoritativos. Todos los movimientos se validan, se ignoran paquetes duplicados y se protege el orden de sala.
- **Fallback:** si el navegador no ofrece WebRTC o los navegadores no pueden negociar ICE, el modo tradicional sigue funcionando, con toda su latencia declarada. Sin bloqueo de la interfaz.
- **Pruebas:** validación de payload, SDP fragmentado y reordenado, límites de datos, poses a 50 ms, mensajes de acciones y E2E real con dos pestañas Chromium que deben alcanzar estado directo y ver el movimiento de la otra. Node, browser, multiplayer, matriz visual y Release Gate.
- **Despliegues independientes:** GitHub Pages no publica automáticamente la función de Netlify. No declarar el multijugador en producción solucionado hasta comprobar la URL de Netlify desde dos dispositivos con WebRTC activo.

## 10/10/2026 · OHANA V107 · menos GPU invisible, cooperativo coherente · ohana-312

- Menú: `menuPaintAllowedInDocument()` detiene los dos Canvas ocultos durante bienvenida y cinemática de inicio. Los MutationObserver existentes reanudan dibujo al volver a la cuadrícula, sin quitar ningún personaje ni reducir sus controles.
- Servidor Netlify: las posiciones 0 y la vida 0 son valores válidos, no datos ausentes. Ahora se aceptan como cero en vez de sustituirlos por el dato anterior. Se acotan NaN/Infinity y valores extremos.
- Indicador de cooperativo: ping estimado y red retrasada visibles en la partida, con mensajes de reconexión y espera. No añade peticiones de red ni bucles; evita costoso desenfoque en badge.
- Sin alterar guardados, las cien escenas, efectos de personaje, físicas, autorizaciones del servidor ni protocolo multijugador.
- Cache coherente `ohana-312`; cobertura unitaria para render oculto y sincronización con vida/posición cero. Browser, Multiplayer, Visual y Release Gate antes del merge.

## 10/10/2026 · OHANA · recuperación inmediata de fluidez · ohana-311

- **Problema confirmado en código:** bienvenida con bloqueo de 1,1 s; portales con carga de 20–45 fotogramas; tres bucles gráficos simultáneos en la portada; render a DPR hasta 1,25 y UI de partida demasiado frecuente. La molestia real la ha comunicado quien juega; esto aún no equivale a una medición de hardware remoto.
- **Pantallas:** la bienvenida es accionable desde 160 ms; se dibuja a máximo ~30 fps; la cinemática de nueva partida es ~460 ms (240 ms con movimiento reducido) y puede saltarse. Portales ya cargados requieren 8–10 ticks (5 con movimiento reducido), conservan las partículas, bloqueo por evolución y protección contra reentrada.
- **Rendimiento real:** los personajes de portada dibujan a 20 fps para el principal y con menor frecuencia los secundarios; atmósfera y partículas se refrescan a ~9 fps sin ralentizar entradas. En partida, menos regeneraciones del HUD, máximo tres pasos de recuperación de física y canvas a DPR adaptativo por resolución o presión de fotogramas sostenida.
- **Sin sacrificar juego:** poderes, físicas, cien recuerdos, cooperativo y guardados no cambian. Nueva suite de pruebas de latencia estructural, presión de fotogramas, resolución y compatibilidad. Las pruebas de navegador y QA son obligatorias antes de publicar.
- **Validación real posterior:** comprobar en el equipo del jugador los milisegundos de entrada, las transiciones entre mundos y el FPS sostenido; los tests automáticos no garantizan rendimiento en Firefox/GPU de ese equipo.

## 10/10/2026 · OHANA V106 · Cien recuerdos, museo y epílogo familiar · ohana-310

- **Recuerdos 81–100:** Caldera y Nido Final reciben diez viñetas Canvas originales cada uno, con motivos y relatos únicos conectados a sus coleccionables reales.
- **Museo interactivo:** cada recuerdo descubierto tiene un botón «✦ Ver» en su capítulo. Abre su retrato Canvas sin salir del álbum, sin mover al jugador, sin tráfico nuevo ni alterar guardados. Los recuerdos bloqueados no se pueden abrir. Escape restaura el foco.
- **Atlas 100/100:** muestra diez sellos de capítulo y permite revivir la celebración de la familia completa. La repetición no concede recompensas.
- **Móvil y accesibilidad:** retratos estáticos sin bucle animado, navegación por teclado, colores de cada mundo y movimiento reducido.
- **Compatibilidad:** los mismos 100 coleccionables, misma clave de almacenamiento `ohana-festival-v1002` y mismo progreso. Netlify y Santuarios Dúo V105 intactos.
- **QA:** test de 100 escenas distintas, galería cerrada a piezas bloqueadas, render Canvas, E2E del álbum y `ohana-310` en SW/HTML; controles Node, Browser, Multiplayer, Visual, Release Gate y Pages. Validación Netlify de dos dispositivos en V111.

## 09/10/2026 · OHANA V105 · Santuarios Dúo reforzados · ohana-309

- **La V105 de recuerdos 61–80 ya existe en #246:** Órbita y Arrecife mantienen veinte dibujos y microhistorias únicos, objetos originales y el guardado `ohana-festival-v1002`. Esta contribución se construye sobre esa PR para no duplicar código.
- **Diez Santuarios Dúo realmente compartidos:** cada uno tiene su identidad y lema. El servidor comprueba dos personajes vivos, conectados, recientes y cada uno sobre una placa diferente, durante 1200 ms continuos. El resultado se guarda por sala y únicamente emite una recompensa `duo-lit` incluso si llegan señales repetidas.
- **Carga visible en ambos clientes:** el servidor transmite el estado de carga, y la interfaz muestra el progreso, el objetivo de mantener ambas placas y las pistas de cada santuario. Al completarse quedan dorados.
- **Interrupción segura:** moverse fuera de la placa, abandonar la sala, caer, desconectarse o reaparecer con una sesión nueva invalida la carga anterior. Nadie consigue un ritual por solo mandar el mensaje de red ni se reanuda la carga después de una desconexión.
- **QA automatizada:** test de los diez santuarios y todas sus variantes, interrupciones, reconexión, recompensa única, contexto visual y regresión de guardado. Node, Browser E2E, Multiplayer E2E, Visual Matrix y Release Gate deben aprobarse antes de fusión y despliegue Pages.
- **Sin tareas manuales para el usuario hasta V111:** Netlify queda en V102 hasta que se actualice en la candidata V111; la evolución de código y su lógica de servidor se verifica automáticamente entre tanto. Ningún test simulado prueba rendimiento público real.

## 09/10/2026 · OHANA V105 · 80 recuerdos vivos · Órbita y Arrecife · ohana-309

- **Veinte nuevas escenas reales:** Órbita (space-0…9) y Arrecife Abismo (reef-0…9) tienen cada uno diez dibujos vectoriales originales y microhistorias relacionadas con sus coleccionables originales, sin nuevos objetos.
- **Ochenta de cien:** V102/V103/V104/V105 aportan ahora ochenta escenas distintas; el álbum sigue teniendo 100 piezas y se mantiene `ohana-festival-v1002`, guardados, recompensas y sellos 10/10.
- **Eficiencia y accesibilidad:** dos efectos como máximo, 128 ticks de duración, recorte fuera de cámara, limpieza al cambiar de sala y presentación estática en movimiento reducido. No se alteran física, habilidades, combate, red ni servidor Netlify.
- **Release:** `ohana-309` en HTML y service worker, nuevo módulo precacheado. Unit, Browser E2E, Multiplayer E2E, Visual y Release Gate obligatorios. Verificación pública real de dos dispositivos y Netlify reservada para V111.

## 09/10/2026 · OHANA V104 red · consolidación con recuerdos 41–60 · ohana-307

- **Trabajo unificado:** la V104 original de recuerdos para Alien Lab/Cumbre es PR #243. En esta rama se integran mejoras de multijugador sobre esa implementación, sin duplicar ni sustituir dibujos y sin dos colecciones incompatibles.
- **Sin pruebas manuales por versión:** el desarrollo V104–V110 utiliza GitHub CI, E2E de dos contextos, matriz visual y Release Gate; la prueba pública con dos dispositivos y el despliegue final de Netlify se reservan para V111, según `docs/V111-QUALITY-PROTOCOL.md`.
- **Snapshots seguros:** respuestas atrasadas del sondeo o de movimiento no retroceden el estado ya observado; métricas de RTT, salud de red y paquetes desordenados.
- **Movimiento remoto con jitter:** extrapolación acotada basada en intervalos de paquetes reales, incluso cuando Netlify responde mucho más despacio de 180 ms.
- **Señales acotadas:** servidor rechaza tipos desconocidos y cuerpos grandes antes de guardarlos en Netlify Blobs.
- **Tests:** nueva suite Node contra snapshots atrasados, muestras lentas y señales falsas, sumada a las pruebas V104 de recuerdos, navegador, multijugador, visual y Release Gate. No declarar Netlify actualizado sin publicación posterior.

## 09/10/2026 · OHANA V104 · Laboratorio y Cumbre: 60 recuerdos vivos · ohana-307

- **Recuerdos 41–60:** veinte escenas Canvas originales para Alien Lab (lab-0…9) y Cumbre (ridge-0…9). Cada hallazgo muestra su dibujo particular y su microhistoria, sin crear objetos adicionales y sin pausar al jugador.
- **Libro y guardados intactos:** continúa `ohana-festival-v1002` con los mismos cien elementos y el sello 10/10 de V101. V102 y V103 siguen funcionando en sus salas; ninguna recompensa se puede repetir por esta animación.
- **Rendimiento:** dos escenas como máximo por mundo, caducidad automática, recorte fuera de cámara, animaciones sin timers y versión estática cuando se solicita reducir movimiento.
- **No confundir producción:** esta V104 no toca el backend Netlify del modo cooperativo. El ritmo de red de V103 debe desplegarse y medirse por separado antes de afirmar mejoras en servidores reales.
- **QA:** tests de 20 dibujos únicos, guardados de 100 piezas, limpieza entre salas, movimiento reducido, integración E2E y precaché offline. Publicación condicionada a Node, Browser, Multiplayer, Visual, Release Gate y Pages.

## 09/10/2026 · OHANA V103 · Misma aventura, menos esperas · ohana-305

- **Prioridad explícita: multijugador lentísimo en Netlify tras el primer despliegue real V102.** Hipótesis fundada en código: peticiones POST cada 125 ms para movimiento más sondeo cada 180 ms por jugador, con lectura/escritura en Netlify Blobs. No es una medición del servidor real.
- **Menos peticiones, controles locales intactos:** red adaptativa a la latencia con envío de posición en torno a 340 ms (hasta 750 ms bajo sobrecarga), sondeo en torno a 650 ms (hasta 1250 ms si el servidor responde despacio). No ralentiza la simulación, el input, saltos ni habilidades locales. Los cambios importantes (sala, vida, evolución) se envían cuando toca; en reposo se evita tráfico salvo heartbeat de 2,6 s.
- **Las respuestas a movimientos ya traen a tu compañero:** no se duplica un poll durante una respuesta reciente; conserva backoff y colas acotadas. RTT medio se expone solo en `document.body.dataset.coopRtt` y ritmo de envío en `data-coop-move-interval` para inspección de rendimiento.
- **Servidor Netlify / Blob:** sondeos en motor original sin cambios se contestan en lectura directa, sin clonar/escribir el estado en Blobs, preservando comprobación de credenciales, heartbeat a 4 s y caducidad por 15 s. El motor antiguo conserva su semántica.
- **Gráficos:** no dibujar el otro personaje cuando se encuentra a más de 240 px fuera de la cámara. Se siguen dibujando los dos Santuarios Dúo.
- **20 recuerdos más:** Jungla Alta y Cueva Azul, números 21–40, reciben escenas vectoriales originales ligeras al recoger los mismos objetos. Las 100 piezas, el progreso local de V100.2 y los sellos V101 permanecen intactos.
- **Pruebas:** pacing adaptativo, movimiento y heartbeat, sondeo sin escrituras, 20 autorías únicas, expiración de efectos, caché offline y suites Node/navegador/multijugador/visual/release.
- **Pendiente real:** actualizar Netlify manualmente una vez fusionada y publicada V103; medir RTT en dos dispositivos, fluidez y número de solicitudes, comparando V102 versus V103. Un CI verde nunca garantiza velocidad en conexión doméstica.

## 09/10/2026 · OHANA V102 · Los veinte recuerdos vivos · ohana-304

- **Mismos 100 objetos, mismos guardados:** V102 anima los 20 hallazgos de Claro y Costa, no reemplaza ni invalida el álbum de V100.2/V101. Sin objetos extra ni ventanas que congelen la acción.
- **20 microhistorias visuales propias:** un dibujo Canvas distinto por objeto (abrazo, ukelele, siesta, seta cantante, palmera, castillo, cangrejo, etc.), breve, posicionado sobre el hallazgo real y con su frase única. Máximo tres eventos temporales en memoria, con soporte reduced-motion y descarte al cambiar de sala.
- **El sello 10/10 sigue siendo la celebración importante** y mantiene su recompensa V101. La secuencia de mundo terminado no se adelanta.
- **Multijugador del mismo motor original:** al reconectar una sala previamente iniciada el servidor deja de reiniciar a los dos avatares (posiciones, evolución, sala y experiencia); en ausencia temporal del compañero el cliente espera sin expulsar a quien sigue conectado.
- **Recuperación real de sesión:** POST con timeout de 10 s, reanudación de credenciales al recibir DISCONNECTED, identidad actualizada en sessionStorage, reenvío acotado de señales, movimientos obsoletos descartados y error terminal claro ante STALE_SESSION/INVALID_SESSION. Sin bucles de peticiones agresivos.
- **QA:** nuevos tests de autoría, animación y reconexión de dos identidades en el servicio real sin red + smoke de navegador Chromium, además de Node, E2E multijugador, matriz visual, Release Gate y Pages.
- **Recordatorio de producción:** Netlify y GitHub Pages se despliegan por separado. La PR en GitHub no actualiza automáticamente la publicación de Netlify del 7 de octubre; el cooperativo público necesita versión nueva y verificación en dos dispositivos antes de afirmar ese despliegue.

## 09/10/2026 · OHANA V101 · Los diez sellos · ohana-303

- **No se rehacen los coleccionables:** permanecen los mismos 100 recuerdos interactivos, diez por sala, con el mismo almacenamiento `ohana-festival-v1002`. Se conserva el álbum y todo el progreso del jugador.
- **Primer recuerdo:** texto de descubrimiento más amable y acceso al álbum con B, sin introducir tutoriales largos.
- **Diez celebraciones originales 10/10:** título, verso, sello, epílogo, brillo y recompensa propia de capítulo. Solo el primer 10/10 de cada sala concede la bonificación (+250 puntos, +25 de vida, +8 XP); la ceremonia se puede revivir desde el álbum sin duplicar recompensas.
- **Libro de capítulos:** navegación accesible por las diez salas, un capítulo visible por vez, diez objetos por capítulo y sello permanente cuando se completa.
- **Experiencia original online, dos personas:** el enlace del juego publicado lleva al sitio Netlify ya existente y no a una función sin servidor en GitHub Pages; al crear una sala, ambos comienzan juntos en el Claro, dentro del mismo motor original.
- **Sin inventar garantías:** la web pública de Netlify muestra un despliegue del 7/10 en la captura facilitada; es necesario implementar y publicar este commit también en Netlify antes de afirmar que el modo online está al día. El E2E simulado no es una prueba de producción.
- **Estado:** candidata en rama. Requiere Node, Browser, Multiplayer, Visual, Release Gate y Pages en verde, revisión manual de la ceremonia y prueba real de dos dispositivos antes de cerrarse.

## 09/10/2026 · OHANA V100.2 · Fiesta de los cien · ohana-302

- **100 descubrimientos interactivos diferentes**, diez por cada una de las diez salas, con nombre, localización sobre plataformas reales, silueta Canvas y diez clases de respuesta.
- **Recompensas jugables moderadas**: experiencia, curación, invulnerabilidad breve, combo, puntuación y celebración. Conserva físicas, jefe y red originales.
- **Álbum 0/100** en portada, durante la partida y con tecla B. Recuerda el progreso en el navegador y muestra diez capítulos con sus objetos aún ocultos.
- Diseño adaptativo, compatibilidad con movimiento reducido y render limitado a diez objetos en la sala activa.
- Continúan intactos los diez héroes, el multijugador SME y el final único de la V100 Especial.
- **Estado: candidata**. Solo publicar con Node, Browser, Multiplayer, Visual, Release Gate y Pages en verde.

## 09/10/2026 · OHANA V100 ESPECIAL · El Claro de los Diez · ohana-301

- **Nueva selección directa**: diez ilustraciones originales Canvas simultáneas; cuadrícula de 5 × 2 en escritorio y 2 × 5 adaptable con desplazamiento vertical en móvil, sin carrusel ni flechas.
- **Nuevo escenario de portada**: «OHANA» centrado, jerarquía legible y horizonte Hoku fijo por CSS en lugar de una escena de fondo Canvas de pantalla completa en bucle.
- **Derrota de la Reina**: sprite original visible, fracturas y explosión determinista de 26 fragmentos; puente de 210 ticks sin reactivar peligros o enemigos.
- **Cinemática final única**: el epílogo de 14,5 segundos empieza cuando la Reina ya se ha roto, sin repetir la caída ni mostrar el cartel antes de la familia.
- **Intro tipo cómic**: burbujas limitadas al viewport y separadas si se solapan, protagonistas más proporcionados en móviles y dos nuevos gags.
- **Protección**: cache/HTML ohana-301, 10 personajes/5 formas, multijugador SME/Dino/Cuerno sin tocar, contratos QA nuevos y adaptados.
- **Estado: PR candidata**. Publicar solo al pasar Node, Browser E2E, Multiplayer, Visual Matrix, Release Gate y Pages.

## 09/10/2026 · OHANA V100 · diez héroes, diez celebraciones · ohana-300

- Retrato final con diez coreografías deterministas y personales; no se multiplica el número de dibujos, las hitboxes ni el coste de la simulación.
- El héroe elegido mantiene su pose y el modo movimiento reducido dispone de retrato estable. V99 evita que aparezca el cartel prematuramente.
- Integra V93 Cuerno, V94 director de enemigos, V95 Reina/cooperativo, V96 móvil, V97 accesibilidad y V98 rendimiento.
- **Estado: candidata**. Se declarará publicada únicamente al superar Node, Browser, Multiplayer, Visual, Release Gate y Pages.


## 09/10/2026 · OHANA V99 · el cartel espera al final · ohana-299

- Tarjeta de resultados y acciones inertes durante el film: solo aparecen al completar los 14,5 segundos; el botón de salto mantiene acceso a quien lo necesite.
- Sin línea horizontal decorativa atravesando el cielo del selector. Se conservan efectos, trama, héroes y fixes V93–V98.
- Contratos regresión heredados actualizados para la nueva duración. Release candidata hasta CI y Pages.


## 09/10/2026 · OHANA V98 · Canvas eficiente · ohana-298

- Orbes, corazones, enemigos no-jefe, proyectiles y fantasmas fuera del viewport se omiten únicamente en el dibujo, nunca en física o multiplayer.
- Se mantienen las señales de amenaza globales, los relojes de Reina, el acceso móvil y los eventos ARIA de V97.
- Margen conservador de 192px con pruebas. Candidata CI/Visual/Release Gate/Pages.


## 09/10/2026 · OHANA V97 · narración puntual accesible · ohana-297

- Lector de pantalla: evolución, fase de la Reina y alertas de salud con histéresis; sin 60 anuncios/s.
- HUD con región ARIA discreta y forced colors nativos. Conserva los controles V96 y los módulos de enemigos/cooperativo V95.
- Candidata a release sujeta a CI y Pages.


## 09/10/2026 · OHANA V96 · controles táctiles adaptativos · ohana-296

- Diseño táctil para 320–420 px en vertical y 450 px de altura en apaisado, con separación real entre poderes, movimiento y salto.
- Mantiene botones E/J/K/L/U, safe areas, foco visible y movimiento reducido sin cambiar bindings ni física.
- Se preservan los avisos de Reina, el director global y el cooperativo estable de V95. Candidata CI/Visual/Release Gate/Pages.


## 09/10/2026 · OHANA · CONCURSO SME · RITUALES DÚO

- Nuevos **diez santuarios de cooperación**, uno por mundo: dos placas en lugares físicos distintos que requieren a los dos jugadores simultáneamente durante al menos 1,2 segundos. No se pueden activar en solitario.
- **Validación en Netlify:** el servidor comprueba dos jugadores conectados, vivos, en la misma sala, posiciones recientes y placas diferentes. Estado de logros por sala compartido, recuperable al reconectar e imposible de repetir para acumular curación.
- **Recompensa:** un vínculo de energía OHANA que cura hasta 15 puntos a cada jugador cuando recibe la confirmación del servidor. Las placas y el resultado se dibujan con Canvas limitado y accesible a movimiento reducido.
- **Contrato multijugador original:** no se cambia la progresión de campaña, las físicas ni las estadísticas de personajes; los santuarios son opcionales y no bloquean puertas.
- **Compatibilidad:** nuevas pruebas de escenarios negativos, 10 salas, continuidad, mensajes, Canvas, cola de señales y precaché offline. Preparado como PR de concurso independiente para coordinar el orden de versiones hasta V100.

## 09/10/2026 · OHANA V95 · cooperativo estable y avisos precisos · ohana-295

- Los cuatro indicadores de intención de la Reina se suman a la señalización global e índice espacial V94, sin alterar el director ni las hitboxes.
- Cooperativo con predicción limitada, sin carreras fantasma tras pérdida de paquetes, etiqueta «SEÑAL RETRASADA» y recuperación automática.
- Se preservan todos los archivos y tests del V94 publicado. Release candidata sujeta a Node, navegador, multijugador, visual y Release Gate.

## 09/10/2026 · OHANA V94 · ENEMIGOS LEGIBLES Y ESTABILIDAD GLOBAL · ohana-294

- Los diez biomas comparten un **indicador contextual de amenaza**: solo los tres rivales prioritarios muestran señales sobre la cabeza; el aviso de ataque real queda claramente distinguido del mero permiso de ataque.
- **Rendimiento del director de enemigos**: búsqueda espacial por celdas para grupos grandes (>12), con distancias euclídeas exactas. Combate, daño, hitboxes, IA, agresividad y presupuestos de ataques quedan idénticos.
- Canvas sin efectos persistentes, sin temporizadores, sin RNG y compatible con movimiento reducido; oculta enemigos fuera de cámara y no interfiere en el jefe ni el final.
- Pruebas de vecindad, comportamiento, accesibilidad, señales, precaché y contratos de V93 en preparación.
- `ROADMAP_V100.md` fija los criterios de salida de V95 a V100. Las fases CI + Browser + Multiplayer + Visual + Release Gate son obligatorias antes del merge.

## 09/10/2026 · OHANA V93 · CUERNO · METAMORFOSIS COMPLETA · ohana-293

- Cuatro rituales de transición, sincronizados con la cinemática de evolución: cuerno vivo que abraza su futura cara, nacimiento de cuatro patas, dos alas con plumas y Aurora final con siete arcos y cuernos nacarados.
- Nuevo módulo determinista `systems/cuerno-v93-metamorphosis.js`, integrado en `systems/evo-cinema.js` y precacheado para jugar sin conexión. Cuerno mantiene silueta propia y movimiento reducido.
- Se conservan los contratos mecánicos y visuales de Dino V90 y Cuerno V92, sin nuevas hitboxes ni cambios en el motor cooperativo.
- `index.html` y `sw.js` sincronizados a la caché `ohana-293`. La release requiere Node, Browser E2E, Multiplayer E2E, Visual y `release:check`.

## 09/10/2026 · OHANA V92 · CUERNO: RESONANCIA PRISMÁTICA Y CONTACTO REAL · ohana-292

- **K, contacto físico entre fotogramas:** la estela arcoíris ahora reconoce a enemigos rápidos que cruzan el camino entre actualizaciones. La comprobación usa el segmento de movimiento enemigo contra hasta 32 puntos de la cinta, con un límite de desplazamiento de 180 px para impedir impactos falsos por teletransportes. El daño, duración de 600 frames y máximo dos estelas permanecen intactos.
- **L, interacción auténtica K→L:** al alcanzar con la onda Iris a un enemigo previamente encantado por K aparece una resonancia de **siete cuernitos** alrededor del enemigo y el texto `✦ PRISMA`. Recibe un pequeño aturdimiento visualmente legible; **sin daño adicional**. Máximo cinco resonancias por lanzamiento de L.
- **Arte:** trazos nacarados, anillo ovalado y animaciones puramente deterministas, sin PNG, sin partículas dinámicas ni filtros costosos; admite movimiento reducido.
- **Aislamiento:** nueva geometría en `systems/cuerno-v92-resonance.js` y pruebas `tests/cuerno-v92-resonance.test.js`. No cambia el dibujo ni la física de Dino V90, tampoco carrusel, jefes ni la U.
- **Offline:** `index.html` y `sw.js` sincronizados a `ohana-292`, nuevo módulo registrado en precaché.
- **Release Gate:** pruebas Node, Browser E2E, Multiplayer E2E, regresión visual, release y después GitHub Pages.

## 09/10/2026 · OHANA V91 · CUERNO · MAGIA CON SIGNIFICADO · ohana-291

- K: huellas de cascos nacaradas en el arcoíris, como máximo siete por estela; conservan los 10 segundos y dos rastros simultáneos.
- Encantamiento: el enemigo ahora muestra un aro de cuenta atrás para distinguir el daño de fantasía del resto del combate. Sin más ticks de daño ni estados nuevos.
- L: siete cuernos curvos recorren el radio REAL de la onda de impacto, manteniendo los tres arcos iris y una única hitbox.
- Geometría aislada en `systems/cuerno-v91-illusions.js`, 7 colores, soporte movimiento reducido y límites estrictos de trazos.
- Pruebas de forma, límites de dibujo, duración del estado y precaché `ohana-291`. Dino V90 no se modifica.

## 09/10/2026 · V90 · DINO: RODILLO VIVO Y FÓSILES LEGIBLES · ohana-290

- K: nueva bola de ocho placas, ojos y sonrisa, con giro adaptado a movimiento reducido.
- L y U: preavisos fósiles que muestran exactamente dónde caerá cada proyectil, con un marcador de avance creciente.
- Refactor visual independiente en `systems/dino-stagecraft.js`, sin aumentar daño, hitboxes ni cargas multijugador.
- Test Canvas y precaché `ohana-290`. CI + E2E + Visual + Release Gate obligatorios.

## 08/10/2026 · OHANA V89 · COOPERATIVO RESILIENTE + GUARDADO · ohana-289

- Se elimina el reintento instantáneo infinito de las mutaciones de red: reintentos controlados de 200–3600 ms desde el tick normal; señales importantes esperan sin crear microtareas sin límite.
- El estado online indica reconexión/recuperación y se reinician las colas y deduplicadores al comenzar una nueva sesión.
- Interpolación J2 corregida: posición y tiempo previos se capturan ANTES del nuevo paquete. Cambios de sala/teletransportes se sitúan sin surcar todo el escenario.
- La progresión del ritual de las tres brasas se guarda de forma compatible con el save v2; la carga parcial no se preserva ni permite explotar recompensas.
- Tests de red determinista y guardado más matriz CI/Browser/Multiplayer/Visual/Release Gate obligatoria antes de merge.

## 08/10/2026 · OHANA V88 · RITO DEL DRAGÓN · ohana-288

- Las tres brasas ahora se **canalizan en orden** Aliento → Batida → Ascenso: se necesita mantener proximidad durante 30 fotogramas por brasa. Alejarse reinicia solo la carga actual.
- El lienzo dibuja un aro de progreso 0–100%, indica qué brasa sigue y el rito es viable para los 10 personajes.
- Salir temporalmente de la Caldera ya no reinicia sus brasas; iniciar nueva partida sí. Recompensa única por sesión y sin bloqueos incompatibles con multiplayer.
- Tests de lógica y E2E del recorrido actualizados, cache `ohana-288`.

## 08/10/2026 · OHANA V87 · SANTUARIO DEL DRAGÓN + U IMPACTO EN VIVO · ohana-287

- La Caldera incluye tres Brasas del Dragón colocadas a distintas alturas. Al tocarlas se despiertan; la tercera concede cura limitada y puntuación. Sigue siendo opcional: nunca bloquea una puerta por estado no sincronizado en multijugador.
- Las brazas son Canvas vectorial y una enorme silueta de alas en el fondo. No se introducen sprites PNG ni efectos incontrolados.
- Durante las U, la escena cinematográfica muestra una ventana acotada del combate real, sin crear otro bucle ni modificar el estado de juego; se omite con movimiento reducido.
- Nuevos tests de geometría, progresión, estabilidad y precaché de la versión `ohana-287`. Mantiene el lanzamiento solo tras Browser/Multiplayer/Visual/Release Gate.

## 08/10/2026 · V86 · EL CIELO VUELVE A SER CIELO · ohana-286

- Intro: marca OHANA central, el reparto original sigue jugando y Cuerno bebé recobra proporción.
- Atrium: sin cables entre retratos, ni efectos sobre la intro. Se conservan chispas y reacciones.
- Playa: fuera palmeras flotantes; quedan costas, islas, espuma, conchas y rocas.
- Refactor: las 30 definiciones de habilidades salen de abilities.js a systems/ability-catalog.js. API inalterada.
- Las U ganan cuatro o cinco actos visibles con duración propia de 4.8 a 6.3 s. La versión de movimiento reducido dura 1.2 s. Sin cambiar daño, cooldown ni desplazamiento.
- El Nido tras la muerte de la Reina ya no mantiene el boss ni un círculo amarillo: se abre una grieta alada luminosa con fragmentos. Se conserva el final de 12 segundos y sus resultados.
- Entrega sujeta a Unit/Browser/Multiplayer/Visual/Release Gate.

## 08/10/2026 · OHANA V85 · DESCENSO SIN REBOTE · ohana-285

**Base:** Cuerno V84 fusionado (`795cd4b2`). **Ruta a V100:** [V100-ROADMAP.md](V100-ROADMAP.md).

- Flecha abajo / S sobre una plataforma fina: la atraviesa con colisión selectiva real durante todos los subpasos y frames necesarios.
- El rescate de caídas no reposa al héroe sobre esa misma plataforma: recuerda exactamente la superficie ignorada hasta salir, saltar por encima o aterrizar debajo.
- Los bloques sólidos y las plataformas más bajas mantienen intacta su colisión. Nada cambia en Dino, Cuerno, J/K/L/U o dificultad.
- Módulo de físicas aislado `engine/platform-drop.js` y pruebas `tests/v85-platform-drop.test.js` (física, subpasos, rescate, suelo sólido, reinicio).
- Precaché `ohana-285`. CI completo (Node + Browser E2E + Multiplayer E2E + Visual Regression + release:check) obligatorio antes de merge/Pages.

## 08/10/2026 · CUERNO V84 · ARCOÍRIS VIVO Y SIETE CUERNOS

**Base:** Dino V83 `e051b357` publicado. **Versión de caché:** `ohana-284`.

- **K Galope encantado:** conserva el galope, choque con muros y los cuatro lazos de movimiento originales. Añade una cinta arcoíris física y persistente **600 frames ≈ 10 segundos después de terminar K**. 7 franjas suaves, reflejos nacarados limitados y hasta 32 puntos por senda. Como máximo dos cintas simultáneas; volver a lanzar K nunca hace que la cinta anterior siga al personaje.
- **Fantasía venenosa:** al rozar la cinta, los enemigos quedan encantados. Efecto visual de tres estrellas sobre su cabeza y daño progresivo cada 30 ticks (≈ 0,5 s); el estado permanece 90 frames tras el último contacto y expira por sí mismo. Un único reloj por enemigo impide acumular daño descontrolado al superponer cintas. Jefe recibe el balance general de daño a jefes; no se altera su IA.
- **L Corona de los Siete Cuernos:** mantiene el único `irisHalo` con su onda y daño anteriores. Como puesta en escena se añade un effecto `cuernoPrismCrown` de 68 frames: 7 cuernos curvos de nácar, sus espirales y tres arcos de siete colores. La corona no genera hitboxes ni daños adicionales.
- **Rendimiento y seguridad:** toda la geometría, el contacto y la cadencia del veneno están en `systems/cuerno-fantasy.js`. `systems/abilities.js` permanece bajo su límite estricto de 135 KB y sin tocar arte de Dino, física de ninguno, carrusel ni cinemáticas globales.
- **QA:** `tests/cuerno-v84-fantasy.test.js` cubre 10 s, 7 colores, contacto real, daño progresivo, K consecutivas, geometría reducida, L visual y caducidad. La matriz visual de Chromium incorpora K persistente y L de cuernos.
- **Offline:** `index.html` y `sw.js` usan `ohana-284`; el nuevo módulo se incorpora a la precaché.

**Contrato:** Node, Browser E2E, Multiplayer E2E, Visual Regression y Release Gate antes de merge, y GitHub Pages después. No publicar si falla alguno.

## 08/10/2026 · DINO V83 · ANATOMÍA AÉREA Y ARTICULACIONES

**Base:** OHANA V82 `ba8b0b5f` publicado. **Caché:** `ohana-283`.

- Cinco evoluciones: salto y caída comparten una pose suave gobernada por la velocidad vertical normalizada. En el ápice (`vy=0`) no se produce un cambio brusco de postura, cabeza, cola, patas ni brazos.
- Uniones de cadera y hombro en las formas Dino Joven, Pico, Rex y Coloso: pliegues del mismo color del cuerpo y sin contorno duro sobre el nacimiento de las extremidades, manteniendo los volúmenes de cada evolución.
- Bebé F0 conserva su casco; el rodillo de K continúa siendo una esfera compacta, sin articulaciones de pie añadidas mientras rueda.
- Función pura `dinoAirbornePose`, determinista, acotada, sin RNG, sin timers ni cambios de física/hitbox.
- `tests/dino-v83-airborne-joints.test.js` revisa continuidad real del dibujo, límites de anatomía, cadera/hombro y K; `tests/browser/visual-regression.mjs` añade una captura 5×3 con el renderizador Canvas auténtico.
- Sin cambios en los archivos de Cuerno, carrusel, motor de rendimiento, combate J/K/L/U ni balance.

**Contrato de fusión:** Node, Browser E2E, Multiplayer E2E, matriz visual y Release Gate, y publicación de GitHub Pages sobre el nuevo `main` tras fusionar.

## 08/10/2026 · OHANA V82 · OPTIMIZACIÓN DE SESIONES LARGAS Y ÚLTIMO CINE

**Base:** `main` tras integrar V81 rendimiento y la anatomía de Dino y Cuerno, commit `4c2ec0b3`. Versión de caché `ohana-282`.

### Problemas corregidos
- El bucle de efectos del Atrium solicitaba fotogramas constantemente aunque la pestaña estuviera oculta o el juego activo, aun sin pintar nada. V82 **detiene el propio bucle** y lo reinicia solo al volver al menú o hacerse visible la pestaña.
- Cada fotograma de Atrium calculaba repetidamente la posición de las tarjetas al dibujar enlaces, héroes y estelas. Ahora utiliza **una lista de centros compartida por fotograma**, manteniendo el efecto y reduciendo lecturas de geometría.
- Los retratos del selector reescribían atributos DOM `data-evo`, `data-fit-scale`, `data-fit-envelope` y estados de Cuerno/Stitcho en cada cuadro, incluso si el dibujo era el único cambio. Ahora se actualizan **solo al variar realmente la forma, encaje o pose**, sin reducir su frecuencia de renderizado.
- El diálogo del final reutilizaba el mismo nodo y acumulaba escuchas de teclado si se saltaba la película con ratón. El manejador se reemplaza por película y no intercepta teclas cuando ya se muestran resultados. Además, Escape en captura global tenía prioridad indebida sobre la película: ahora, si el final está ejecutándose, el motor envía Escape directamente al botón de resultados antes de considerar la pausa, sin cambiar física, combate ni habilidades.
- La cinemática adapta la resolución del lienzo a rotaciones/cambios de ventana y elimina el listener de redimensionamiento al terminar. Conserva los **12 segundos** de reunión, el salto y el modo de movimiento reducido.

**QA V82:** pruebas unitarias específicas y regresión de navegador con dos victorias sucesivas (Kilo y Cuerno) y salto por teclado. Mantiene Node, Browser E2E, Multiplayer E2E, matriz visual y Release Gate. La publicación queda bloqueada hasta que todo pase.

**Alcance:** infraestructura compartida, sin cambios en `characters/art/dino.js`, `characters/art/cuerno.js`, J/K/L/U, física ni hitboxes. Dino puede continuar tras merge/deploy.

## 08/10/2026 · V81 · ENTREGADA DINO + CUERNO / CACHÉ OHANA-281

**Estado:** fusionadas V81 rendimiento (PR #212) y V81 anatomía Dino/Cuerno (PR #211) en el mismo `main`, commit `cbef5e6b`. La actualización `ohana-281` invalida el caché anterior `ohana-280` después de publicar las nuevas formas y movimientos, sin alterar los archivos del juego. `sw.js`, `index.html` y sus pruebas usan la misma versión. Este lanzamiento sigue condicionado al Release Gate completo.

## 08/10/2026 · V81 · PERFORMANCE ARCHITECTURE / VICTORY REUNION

**Base de integración:** `be8070e3` (V80 publicada con Dino y Cuerno V79); caché `ohana-280`. Cambios de infraestructura/selector/fin exclusivamente. Sin editar `characters/art/dino.js` ni `characters/art/cuerno.js`.

### Corrección de una regresión real de V80
El final de `title-stage.css` volvía a activar filtros CSS `drop-shadow`, `saturate` y `brightness` sobre los Canvas de retratos, y presentaba cinco tarjetas en CSS aunque `title.js` solo dibujaba y exponía tres al lector de pantalla. El código V80 funcionaba, pero las reglas antiguas posteriores ganaban la cascada `!important`.

### V81
- Contrato de **tres tarjetas reales** en JS, CSS, teclado y ARIA; sin dos retratos fantasma invisibles para el renderizador, pero visibles para CSS.
- Orden CSS explícito al final de la hoja; ninguna capa `drop-shadow` sobre Canvas animado ni filtros en tarjetas. Se conservan los focos radiales y el diseño dimensional.
- Menos capas GPU: `will-change` solo para el protagonista y dos vecinos. Transiciones de posición/opacidad de coste acotado y movimiento reducido sin animaciones.
- Buffer de los siete Canvas ocultos reducido a 1x1 al salir de la selección; se vuelve a crear en la entrada, sin eliminar el nodo/las pruebas de personaje. Los laterales emplean DPR 1, protagonista conserva su calidad V80.
- Cinemática final con **12.0 s** y plano familiar sostenido antes de resultados. La tipografía entra antes del último tramo y permanece visible; el botón de omisión y reducción de movimiento (1.6 s) permanecen.
- Nuevo límite opcional de DPR en `fullCanvas`: 1.2 para el final, sin modificar la resolución de la evolución ni las supremas de Dino/Cuerno.
- Browser E2E real recorre diez personajes y verifica CSS calculado, buffers ocultos, Canvas central y coincidencia de accesibilidad. Visual regression valida las tres tarjetas.
- Tests antiguos adaptados al comportamiento nuevo, manteniendo todas las verificaciones estructurales de cinemática y release.

**Contrato de publicación:** Node, Browser E2E, Multiplayer E2E, Visual Regression, Release Gate y Pages, sin excepciones.

## 08/10/2026 · OHANA V80 · RENDIMIENTO DEL CARRUSEL Y EPÍLOGO

**Base:** main con Dino y Cuerno V79 juntos (`8d15da20`). Caché nueva: `ohana-279`. Línea de trabajo de rendimiento compartido, sin tocar las ramas de personajes.

- **Tres tarjetas de verdad:** el selector hace accesibles solo protagonista y dos vecinos, igual que su representación visual.
- **Lienzos:** protagonista a 24 fps, vistas previas laterales a una frecuencia máxima aproximada de 8 fps y refresco inmediato tras cambiar de personaje. `ResizeObserver` invalida las dimensiones del lienzo sin forzar mediciones de layout en cada cuadro.
- **Menos escritura en DOM:** nombre de forma e indicadores de evolución se actualizan cuando cambian forma o selección, no en cada fotograma.
- **Fondo más ligero:** animación procedural a ~13 fps, con DPR máximo de 1.12–1.25 para evitar repintados gigantes. La mezcla de escenarios mantiene una transición de ritmo equivalente.
- **Filtros:** retirados drop-shadow sobre Canvas y saturación/brillo de las tarjetas laterales, que obligaban a compositar imágenes animadas completas.
- **Visibilidad:** bucles de portada dejan de dibujar en pestañas ocultas y se reanudan al regresar.
- **Final más cinematográfico:** pasa de 7.4 a 10.2 segundos. La familia entra antes del plano general y el gran titular se reserva para el 88–97% de la escena, tras la reunión. El cartel de resultados permanece oculto hasta completar la secuencia, con salto manual y movimiento reducido a 1.6 segundos.
- **Fotogramas de la cinemática:** 24 fps como máximo aunque los 10 personajes se dibujen juntos. La progresión se basa en tiempo transcurrido real.
- **Seguridad:** tests específicos, CI de Node, E2E, multijugador, regresión visual y Release Gate. Sin modificaciones de arte, habilidades, físicas o hitboxes de Dino ni Cuerno.

**Publicación condicionada a pruebas completas en verde.**

## 08/10/2026 · CUERNO V79 · ESPIRAL VERDADERA

**Base:** main con Cuerno V78 y Dino V76/V77; caché `ohana-278`.

- Potro Iris y Unicornio Estelar dejan atrás el zigzag afilado: el cuerno ahora tiene silueta cónica orgánica, cinco estrías nacaradas recortadas dentro del volumen y un único reflejo longitudinal. Cuernín y Destello conservan su pequeña espiral original; Unicornio Negro conserva su corona de obsidiana y marfil.
- El módulo de arte de Cuerno lee la preferencia `prefers-reduced-motion` mediante un solo MediaQueryList de estado vivo. El galope, la melena, la cola y las alas del V78 pueden adaptar su movimiento sin cambiar a otros personajes ni añadir temporizadores.
- Contrato de Canvas, articulación de cuatro patas, cinco formas, determinismo, equilibrio de contextos y límites validados en Node. Ninguna modificación en Dino, físicas, colisiones ni habilidades.

**No publicar sin quality completo.**

## 08/10/2026 · DINO V78 · MEJORAS DE SENSACIÓN DE COMBATE

**Rama aislada:** `feat/dino-v78-combat-feel-20261008`. **Base:** OHANA V77 publicado; Cuerno es propiedad de su desarrollo paralelo. **Cache propuesta:** `ohana-277`.

- **J · Mocosaurio:** anticipación acotada de enemigos que se desplazan en horizontal o vertical; trayectoria curvada sin teletransporte. Al chocar contra una pared hace exactamente un «boing» con partículas y aro dorado y rebota hacia atrás; si vuelve a chocar, hace un único «splat» y desaparece. Las trazas siguen limitadas a 7 puntos (3 con movimiento reducido).
- **K · Dino Rodillo:** choque frontal contra paredes con frenado físico y ligero rebote hacia atrás. Una onda de alcance muy corto puede impactar una sola vez a enemigos pegados al muro. Retroceso, polvo ajustado a reduced-motion y el mensaje «¡BOING!». Sin daño lejano ni bucles de impactos.
- **L · Extinción:** los meteoritos anticipan un máximo de 68 px del movimiento del objetivo durante su caída. Las marcas proyectan la posición prevista de impacto, siguen buscando la plataforma real bajo el objetivo y el marcador es más legible en pantalla.
- **U · Corazón de Coloso:** los cometas fósiles también consideran de forma limitada el movimiento del objetivo (máximo 52 px), con los mismos límites de daño y número de efectos. Se mantiene la película de cinco actos.
- **Arquitectura:** únicamente `systems/dino-combat.js` y el tramo del rodillo en `systems/abilities.js`, test independiente `tests/dino-v78-combat-feel.test.js` y versión offline `ohana-277`. Los archivos propios de Cuerno no cambian.
- **Pruebas:** rebote finito J, seguimiento predictivo, marcador L/U con plataforma, máximo de meteoritos y choque K con daño solo local y una activación.

**Fusionar únicamente con OHANA CI y quality completos: Unit, Browser E2E, Multiplayer E2E, Visual Regression y Release Gate.**


## 08/10/2026 · CUERNO V78 · GALOPAR CON EL ALMA

**Base:** main con Cuerno V75 y Dino V76/V77, caché de publicación `ohana-276`. Trabajo aislado en Cuerno: sin tocar arte, ataques ni lógica de Dino, ni alterar físicas, velocidad, salto o hitboxes.

- **Canon:** Cuernín sigue siendo solo un cuerno; Destello solo cuerno + esfera. Potro Iris, Estelar y Unicornio Negro conservan exactamente cuatro patas, y las dos formas finales sus alas.
- **Galope compartido:** una función pura articula fases independientes de los cuatro cascos, rodillas, recorrido de zancada y recogida durante el salto.
- **Melena viva:** mechones que responden a ritmo, velocidad y suspensión en lugar de animaciones aisladas por evolución.
- **Accesibilidad y rendimiento:** respuesta compatible con movimiento reducido; todas las oscilaciones están acotadas. Sin temporizadores, PNG, VFX persistentes ni estados globales nuevos.
- **Calidad:** una nueva batería comprueba las cinco formas, siete estados, determinismo, articulación y cierre de Canvas. Las protecciones y hechizos J/K/L/U anteriores permanecen.

**Condición de publicación:** Node + Browser E2E + Multiplayer E2E + regresión visual + Release Gate en verde.

## 08/10/2026 · DINO V77 · U «CORAZÓN DE COLOSO»

**Rama de capítulo:** `feat/dino-v77-colossus-u-20261008`, derivada de la V76 de Dino. La U se publica **después** de integrar la PR #203; no se modifica a Cuerno ni se sobreescribe main. **Caché prevista:** `ohana-275`.

### Cinematografía de cinco actos
1. **LATIDO:** la tierra vibra y aparecen dos ojos diminutos.
2. **DESPERTAR:** Dino se engrandece y se levantan columnas de piedra como una armadura viva.
3. **FRACTURA:** dos grietas avanzan desde su cuerpo mientras el escenario responde.
4. **COMETAS FÓSILES:** cinco rocas luminosas cruzan el aire, con trayectorias y aviso de impacto.
5. **CORAZÓN:** una pequeña estrella tropieza con el Coloso; aparece un corazón luminoso y la escena termina de forma tierna, no con un flash cegador.

La película se dibuja con Canvas procedural y tiene función `dinoColossusStage(k)` pura para reproducción reproducible y contrato de browser. Duración 3.22 s en animación normal y accesibilidad reduced-motion sin vibración excesiva.

### Mecánica U renovada, compatible con sus poderes J/K/L
- Se mantiene el identificador `impact`, la U de la tecla 3, su cooldown, el impacto inicial y el especial **Modo Coloso**.
- **260 ticks reales** de protección, armadura y aura corporal; se evita que un temporizador termine prematuramente dejando otro colgado.
- Pulsos sísmicos periódicos de daño moderado en alcance limitado, sin repetir el antiguo campo supremo genérico de Dino, para no duplicar daño.
- Entre **3 y 8 meteoritos fósiles** como segunda fase, según evolución y `reducedMotion`: el terreno marca el destino y cada meteorito explota una vez; objetivos visibles y daño con los controles estándar frente a jefes.
- Efectos con memoria, partículas y recuentos estrictamente acotados; sin nuevas dependencias, PNG ni controles ajenos.

### QA y mantenimiento
- Módulos dedicados `systems/dino-combat.js` y `systems/dino-ultimate-film.js`.
- `systems/abilities.js` permanece bajo 135 kB.
- Pruebas de Node: cinco actos, duración, salida, U original, controles de daño, meteoritos, reducción de movimiento, equilibrio de transformaciones Canvas.
- Browser: capturas del latido, el desfile de cometas y el corazón final.
- Precarga offline completa con la versión `ohana-275`.
- **No fusionar** si falla alguna etapa de Unit, Browser E2E, Multiplayer E2E, Visual Regression o Release Gate.


## 08/10/2026 · DINO V76 · COMBATE CINEMÁTICO SIN PERDER EL PERSONAJE

**Rama compatible con Cuerno V74:** `feat/dino-v76-cinematic-combat-20261008`. **Cache:** `ohana-274`.

Dino conserva las cinco siluetas, colores, personalidad, 100 calibraciones de evolución y su habilidad U original (`impact` / Modo Coloso). Cuerno no se modifica.

- **J · Mocosaurio:** disparos vivos con ojos animados que persiguen un enemigo, cambian de objetivo cuando muere o se aleja y atraviesan su trayectoria mediante subpasos para no saltarse enemigos diminutos ni paredes estrechas. Estela acotada a 7 puntos, o 3 en reduced-motion, y explosión cómica con daño único.
- **K · Dino Rodillo:** reemplaza visualmente el mero giro del dinosaurio erguido por **una silueta circular propia**, con cola enrollada, barriga, nueve púas externas, ojos expresivos, dientes/sonrisa y armadura distinta en cada evolución. Usa el movimiento real protegido, frenando en colisiones sin modificar la hitbox.
- **L · Extinción:** preserva las dos ondas del terremoto y añade meteoritos de roca verde/dorada con impactos explosivos. Los avisos de caída se anclan al suelo debajo del enemigo y reutilizan la física validada del Dragón sin alterar su habilidad.
- **Sistema:** `systems/dino-combat.js` aislado, importado por `systems/abilities.js` sin superar presupuesto. Precache nuevo y contratos de la versión 273 actualizados. Nuevas pruebas de colisiones barridas, advertencias de meteorito y las cinco esferas articuladas.
- **QA:** las pruebas de navegador incluyen capturas separadas de J, K y L, y el multijugador espera una variación real de posición con foco explícito y ventana limitada. No cambia el juego solo para hacer pasar el test.

**Nota de integración:** se toma como base `main` después de fusionar Cuerno V74, manteniendo íntegra su evolución. No hacer merge sin CI, Browser E2E, Multiplayer, Visual Matrix y Release Gate completados.


## 08/10/2026 · V75 · CUERNO IRIS FINAL · ANATOMÍA VIVA

**Caché** `ohana-273` · Continuación sobre V74, no reinicio del personaje. El canon se mantiene: Cuernín es solo cuerno, Destello es cuerno con esfera sin patas, Potro Iris estrena cuatro patas, Estelar despliega alas y F4 es Unicornio Negro obsidiana.

- **F1:** cara esférica y cuerno nacen del mismo pivote elástico; no se anticipan orejas ni pezuñas.
- **F2:** cuatro patas con anticipación de trote y cola de cuatro cintas sujeta a la grupa. El golpe de aire no separa la cola del cuerpo.
- **F3:** alas realmente articuladas, con apertura, bisagra y aleteo según carrera, salto, victoria o hechizo; cola anclada.
- **F4:** pelaje negro obsidiana `#1b1a28`, cuello orgánico en S sin contorno rectangular, cara más definida, cuerno pulido, alas nocturnas reactivas y seis hebras de cola de movimiento limitado.
- **Animación determinista:** `cuernoTailPose` y `cuernoWingPose` mantienen posiciones acotadas sin temporizadores, asignaciones de sprites ni efectos aleatorios. En daño o derrota, alas y colas quedan inmóviles.
- **Relato unificado:** textos de las cuatro transformaciones actualizados en `characters/evolution.js` para que coincidan con lo que se ve. El nacimiento de las alas sucede en F3, no al final.
- **Compatibilidad:** Cuerno mantiene la velocidad y salto natural superiores, sus cinco formas, las cuatro habilidades J/K/L/U (incluida la U de sueño) y sus hitboxes. **Dino no se modifica.**
- **Regresión nueva:** `tests/cuerno-v75-final-anatomy.test.js` verifica cinco siluetas en ocho estados, balance de Canvas, cola limitada, alas dinámicas, esfera y cuerno unidos, textos y reposo al recibir daño. Se han eliminado expectativas de caché antigua en `tests/hardening.test.js` y `tests/michi-soul.test.js`.
- **Calidad:** 370 pruebas Node PASS, `node tests/browser/e2e.mjs` PASS, Multiplayer E2E PASS y `node tests/browser/visual-regression.mjs` PASS con 92 capturas en rama V75. La fusión requiere también `release:check` PASS y comprobación final de GitHub Pages.
- **Publicación:** `index.html` y `sw.js` comparten `ohana-273`; el historial V74/V73 se conserva debajo.

## 08/10/2026 · V75 · CUERNO · VERDADERO NEGRO, ESCALA EN CARRUSEL, CONTRASTE

**Caché:** `ohana-273`. Esta fase se basa en inspección manual de las **capturas Chromium reales** de V74, no solo en lectura de código.

- **Defecto visual grave detectado:** al cambiar de evolución, el renderizador global aplicaba una capa `#ffffff` de hasta **90%** sobre el personaje (durante el destello `evoBurst`). Como resultado, **Unicornio Negro F4 aparecía BLANCO en el carrusel durante la mayor parte de la transición**, pese a tener pelaje negro correcto dentro del código y la partida. Se reduce **solo para Cuerno** a un máximo de **7,5% de nacarado lila**. Las transiciones de los otros nueve héroes mantienen su animación original y Cuerno conserva su aura de evolución.
- **Escala corregida de verdad en portada:** el selector normalizaba *cada evolución* para llenar su espacio, con lo que F0 se veía casi tan grande como F4. El nuevo contrato `CUERNO_PORTRAIT_GROWTH=[.68,.77,.86,.94,1]` establece crecimiento visual progresivo legible y `CUERNO_PORTRAIT_ASPECT=[.66,.81,1.16,1.52,1.60]` reserva anchura real a las alas y evita recortes en móvil. Juego y hitboxes no cambian.
- **Anatomía reforzada:** F3 usa alas azul perla con contorno acero y plumas separadas del pelaje claro. En F4, un filo lunar color índigo da lectura al lomo negro contra fondos oscuros; un segundo reflejo sigue el cuello en S y la cabeza tiene borde lavanda. No aparecen rectángulos nuevos ni partículas.
- **Iluminación propia:** el óvalo de luz del retrato F4 pasa del oro intenso a un resplandor lila suave, que distingue la piel obsidiana.
- **Pruebas:** nueva regresión de proporciones de título y destello con comprobación de píxeles de screenshot, prueba de tintado máximo y permanencia de pelaje negro durante evolución, cinco formas y J/K/L/U. Se conservan todos los tests V59–V74; Quality, Browser E2E, Multiplayer E2E, Visual regression, Release Gate y Pages obligatorios.
- **Dino intacto.** La prioridad es asegurar que Cuerno se vea como el personaje solicitado en selección y en juego real.

## 08/10/2026 · V74 · CUERNO RECONSTRUCCIÓN CANÓNICA

**Caché** `ohana-272` · Rediseño ordenado por petición expresa; V73 no era la definitiva. El canon visual es obligatorio.

- **F0:** Cuernín es solo un cuerno vivo. Ojos y boca se integran en la superficie del cono, sin bola, torso, collar ni patas.
- **F1:** Destello es literalmente **el mismo cuerno con UNA cara esférica**, dos ojos y boca. **CERO patas, cuello, hocico o torso equino**. El rebote y el squash se aplican a la cabeza redonda, sin simular pasos.
- **F2:** aparece por primera vez el cuerpo de Potro Iris con **exactamente cuatro patas articuladas**. Conserva gesto, melena, hocico y salto recogido.
- **F3:** Unicornio Estelar sigue teniendo cuatro patas y ahora desarrolla **dos alas geométricas** desde la espalda; tienen plumas, transparencias y apertura dependiente de salto/cast/victoria. No se añade vuelo físico ni cambios a las físicas.
- **F4:** renace como **Unicornio Negro** (pelo obsidiana `#1b1a28`, cuello S orgánico de anchura decreciente, alas tinta nocturna, mirada lila, melena iris). Se reemplaza el contorno de cuello ancho-rectangular por curvas de Bézier cónicas que unen pecho, crin y cabeza. No cambia la inmunidad de jefes.
- **Proporciones corregidas en el origen del error:** antes Cuerno recibía un multiplicador por altura de forma, otro de evolución general y otro de `evolutionVisual`; la ampliación era acumulativa. Ahora usa `CUERNO_VISUAL_H=[118,92,91,86,82]` para compensar geometría real, con **una sola escala óptica**, compartida por juego y retratos, sin alterar la hitbox. F0 deja de ser diminuto y F4 deja de ser un gigante.
- **Conservación del juego:** Cuerno sigue siendo el más rápido y el que más alto salta de los 10 personajes en F0–F4. No se modifica J/K/L/U, incluida la U Aurora con sueño por objetivos seleccionados, cinco pulsos, inmunidad de jefes y cinemática. Se conserva el modo reduced motion.
- **QA:** revisados tests antiguos para que no exijan patas en F1 (ya prohibidas); regresión de 5 formas con conteo real de patas, presencia y ausencia de alas, color negro de F4, geometría de cuello, escalas ópticas, render Canvas balanceado, J/K/L/U y las capturas reales Chromium. Dino y multijugador sin modificación.
- No fusionar sin Node, Browser E2E, Multiplayer E2E, Visual regression matrix, Release Gate SUCCESS; luego verificar Pages y CI de main.

## 08/10/2026 · V73 · CUERNO · EDICIÓN ESTRELLA FINAL, DEDICADA A LA SOBRINA

**Caché:** `ohana-271`. Última V de Cuerno. El personaje y su evolución deben ser inolvidables, fáciles de leer y divertidos de manejar para jugar en familia; **Dino está muy avanzado y se reserva sin modificar**.

### Evoluciones y colores
- F0 Cuernín mantiene su silueta de **cuerno viviente**, F1 Destello nace con dos patas, F2 Potro Iris tiene cuatro, F3 Estelar es equino adulto y F4 Aurora despliega alas, cuatro apoyos y cabeza real.
- Las **cinco formas** llevan ahora un pequeño corazón/joya de nácar en un punto anatómico diferente. Los tonos pastel se transforman con él: rosa fresa, lila, amatista, cielo y dorado de Aurora. Son piezas de Canvas dibujadas con geometría, no PNG ni pegatinas.
- Cada forma esconde un gesto visual propio que responde a vuelo, sueño o victoria: halo curioso, orejas de Destello, herraduras de Potro, mapa estelar y corona de Aurora. El lienzo adulto tiene bordados opalescentes y alas más expresivas al lanzar poderes; todos los gestos siguen el movimiento del cuerpo.

### Personalidad, ataques y pasiva
- **Expresividad definida**: emociones puras `wonder/calm/dash/flight/focus/dream/joy/quiet`. Solo se representan cuando el personaje está activo, sin efectos alegres durante daño o muerte.
- **J · Lanza Astral** sigue perforando a tres enemigos, pero su cuerpo de nácar contiene siete filamentos iridiscentes reales; proyectil único y misma hitbox/daño.
- **K · Galope Radiante** sigue deteniéndose en las paredes y respetando el impulso; ahora deja cuatro cintas vectoriales tras sus apoyos con color vinculado a la evolución y menos sacudida.
- **L · Círculo Iris** conserva siete arcos evolutivos y daño único al alcanzar la ola. Una constelación de siete pequeñas chispas marca la cresta de la onda.
- **U · Sueño Arcoíris** preserva las cinco oleadas, la cúpula F4, el elenco de enemigos capturado al pulsar, la inmunidad de jefes y el modo movimiento reducido. La película ya dibuja símbolos de sueño solo según los objetivos reales; termina con una diadema de siete puntos y más expresividad de Aurora. Se corrige la elección del actor en la película: F0 no aparece por error como F4.
- **Pasiva permanente · Impulso innato**: sigue siendo el personaje más rápido y el que salta más alto **en las cinco evoluciones**. F4 velocidad 9.6, impulso 18.6, cuatro saltos, sin depender de J/K/L/U. Carrera y saltos dibujan chispas de un color distinto por forma, limitadas por frame; cada aterrizaje marca un único anillo de cariño. No se alteran físicas, velocidades, daño ni colisiones.

### Calidad y siguiente personaje
- Prueba V73 de cinco formas y emociones, geometría de diseño, stack Canvas, J/K/L/U y pasiva, película y cinemática, rendimiento; capturas reales adicionales de **J** y **K**, manteniendo L/U y toda la matriz anterior.
- CI Node, Browser E2E, Multiplayer E2E, Visual regression matrix, Release gate y GitHub Pages son condiciones de fusión/publicación. Presupuesto JS V70 de 3 MB permanece intacto.
- **Siguiente paso, sin anticiparlo:** Dino tendrá una revisión especial propia, centrada en el disfrute de los sobrinos, aprovechando lo ya avanzado.

## 08/10/2026 · V72 · CUERNO FORMA 4 · LA ÚLTIMA AURORA

**Caché:** `ohana-270`. Se completa específicamente **Unicornio Aurora F4** y su definitiva **U · Sueño Arcoíris** antes de dedicar una revisión adicional, orientada a niños, a Cuerno y a Dino.

- **Identidad innata verificada:** Cuerno continúa siendo más rápido y saltando más alto que los otros nueve héroes **en todas las formas**, sin K ni U. F4: velocidad `9.6`, impulso de salto `18.6`, cuatro saltos. Física, hitboxes, proyectiles, 150 ticks de U, cinco pulsos, protección y jefes inmunes se conservan.
- **La cúpula real de F4:** el campo U guarda el índice de evolución en el instante del lanzamiento. **Solo la F4** despliega una aurora panorámica de siete bandas y un filo nacarado que alcanza hasta `1.18 × diagonal` del viewport. Se dibuja detrás del personaje sin ocultar enemigos: tinte de fondo máximo 3.5%, trazos de 10–14% de opacidad, sin flashes rítmicos, objetos persistentes ni PNG.
- **Sueño con pulso reconocible:** los durmientes conservan sus sellos y hilos V71, y en Aurora F4 cada oleada de daño desencadena una ondulación sutil alrededor de cada enemigo. Reduce-motion desactiva ondulación y vaivén sin reducir daño.
- **Cuerpo y película unificados:** siete segmentos iridiscentes coronan el cuerno de F4 mientras mantiene U; la escena del último acto añade un halo marfil discreto y declara `data-cuerno-final=aurora`. Las alas y los ojos responden como antes. En formas 0–3 sigue la U V71, pero sin gigantesca cúpula F4.
- **Confort:** la U final evita sacudidas y destellos excesivos (flash 5 y shake 3 frente al estándar 20/12), dejando intactos daños y momentos de impacto para el resto del elenco.
- **Nueva regresión:** pruebas de cobertura real de pantalla F4 y exclusión de F0–3; balance Canvas, reduced-motion, identidad máxima en velocidad/salto, jefe inmune y cast-time targets. Capture real `09r-cuerno-aurora-final-u-canopy` tras la cinemática; Quality, multijugador, Release Gate y Pages obligatorios.
- **Próxima etapa separada:** revisión extra y cariñosa para la experiencia infantil con Cuerno; **Dino** queda reservado para su revisión profunda especial, pensando en los sobrinos, sin tocarlo ahora.

## 08/10/2026 · V71 · CUERNO · SUPREMA: SUEÑO ARCOÍRIS VIVO

**Caché:** `ohana-269`. Auditoría: las diez fases están implementadas; la fase 3 Potro Iris se recuperó en V63 después de la fase 4 Estelar V62. No falta ninguna fase numerada.

- **U justa:** fija en `dreamTargets` del campo temporal solo los enemigos normales visibles cuando el jugador pulsa U. Jefes y enemigos inicialmente fuera de cámara quedan inmunes; los que entran después no son ejecutados por una U antigua. Los seleccionados siguen recibiendo las cinco oleadas si la cámara se desplaza. Se conservan los cinco pulsos, la curación y el blindaje de Cuerno.
- **Magia individual:** cada enemigo realmente dormido dibuja tres arcos de iris de bajo brillo, luna de nácar, dos ojos cerrados y una pequeña z. Hasta seis hilos de aurora conectan los durmientes con el origen del hechizo. El dibujo utiliza solo Canvas y estados ya existentes, sin PNG ni objetos FX extra. Se respeta `reduceMotion`.
- **La cinemática sabe quién duerme:** se envía el recuento verdadero de objetivos al evento `ohana-supreme` y al storyboard de Cuerno. Aparecen hasta nueve estrellas según los enemigos alcanzados, no constelaciones inventadas. El resto de las supremas no cambia.
- **Pruebas nuevas:** objetivos capturados y recién llegados; objetivo que sale de cámara después del lanzamiento; jefe inmune; dibujo Canvas con conservación save/restore, act 3 ligado al recuento real y contrato de accesibilidad. Browser E2E, multijugador, regresión visual y Release Gate sin excepciones.
- Mantener presupuesto V70: límite 3 MB JS, aviso 2,4 MB; CSS, FCP y simulación controlados. Dino aún sin modificar.

## 08/10/2026 · V70 · PRESUPUESTO ADAPTATIVO PARA DINO + MULTIJUGADOR

- Se sustituye el tope rígido e histórico de `1.500.000` bytes JS por un máximo **3.000.000 bytes**, con **aviso a 2.400.000**. El nuevo contrato se centraliza en `tools/performance-budgets.mjs` para Browser E2E y Release Gate.
- Se compara tanto la **transferencia JS real en navegador** como el **tamaño estático de todo el JavaScript de producción**, que no queda oculto por Service Worker o caché caliente.
- Los demás límites siguen vigentes: CSS de 500 KB, FCP de 4 s, simulación de 1.000 ms, consola sin errores, QA de navegador, multijugador y regresión visual. No se sube el límite para disimular regresiones, sino para dar espacio consciente a Dino y a las próximas mejoras cooperativas.
- El cierre V69 de Cuerno sigue en PR #195, con caché `ohana-268`, a la espera de CI y Quality PASS antes de publicar. **Dino todavía no está modificado.**

## 08/10/2026 · V69 · CUERNO 10/10 · LA LEYENDA DEL ARCOÍRIS

**Caché:** `ohana-268` · Fase definitiva de Cuerno. Dino y Grok intactos.

- **Bug real corregido:** los gestos de victoria y la contemplación durante U estaban declarados en `cuernoSoulBeat`, pero se dibujaban con intensidad nula porque el rig solo activa `flourish` en estado `idle`. Ahora `victory` y `cast` tienen intensidad propia, sin temporizadores, y no se permite la comedia cuando Cuerno está herido o derrotado. Un gesto de victoria existe realmente en sus cinco formas.
- **Anclaje anatómico:** los gestos, la lanza, las estelas, los siete anillos y el dosel U siguen exactamente la traslación vertical y la inclinación usadas para pintar el cuerpo de Cuernín, Destello, Potro Iris, Estelar y Aurora. Un único wrapper Canvas guardado/restaurado evita magia desacoplada del cuerno en salto, trote o caída. Las geometrías y físicas no se alteran.
- **Cierre audiovisual:** F4 inclina la cabeza y el cuerpo durante una reverencia; durante U despliega alas, mira a las estrellas y crea el sueño de arcoíris sin desplazar el jugador. El criterio principal es personaje legible, menos destellos redundantes, un gag coherente por forma.
- **QA decisivo:** cinco capturas `01p-cuerno-victory-form-N` reales en navegador, forzadas únicamente bajo `TITLE_E2E`; se compara por píxeles cada victoria con su variante herida, en las cinco formas. Nuevas pruebas Node inspeccionan que el acto de victoria se dibuja con `flourish=0`, que herida/muerte no liberan magia y que el equilibrio Canvas `save/restore` se conserva en todos los estados y habilidades. Suite heredada J/K/L/U, jefes inmunes a sueño, multijugador, visual y release gate obligatoria.
- **Política de integración:** PR → CI + Quality PASS → merge → CI sobre `main` + Pages desplegado y verificado. No modificar Dino para hacer el cierre de Cuerno.

## 08/10/2026 · V68 CUERNO · MENSAJE 9/10 · EL GRAN ESPECTÁCULO

**Caché:** `ohana-267`. El gameplay y la biología ya están cerrados; esta etapa depura puesta en escena, ritmo, legibilidad y accesibilidad.

- **J/K/L/U en tres tiempos**: la magia del propio personaje ahora marca anticipación, liberación y eco visual, derivados del progreso real del casteo. J proyecta una lanza nacarada graduada; K lleva estelas de galope con recorrido variable; L abre círculos de radio creciente; U extiende un dosel que se abre antes del sueño. En F0-F4 la emisión sigue naciendo en el cuerno, no en un centro genérico de sprite. Sin alterar proyectiles, daño, movilidad ni bosses.
- **L · Círculo Iris**: conserva el radio evolutivo, la única aplicación de daño por enemigo y el baño de arcoíris a pantalla completa en la forma máxima. Reordena la presentación visual: ataque de apertura breve, cresta marfil de la ola, siete anillos finos con opacidad contenida y reducción de tinte de fondo para mantener enemigos/balas legibles.
- **U · Sueño Arcoíris**: mini-film exclusivo de cuatro actos codificados `breath → iris → dream → aurora`, sincronizados con la forma final y su cuerno. Aliento de estrellas, círculo de siete colores, cinco Z somnolientas y alba iridiscente. Aurora se eleva sutilmente sin desplazar al jugador, cambia su pose y despliega magia con su propio rig en el retrato de cine. Los efectos se dibujan **detrás** del personaje, y se respetan reduced-motion y el tiempo establecido de 2.12 s.
- Los efectos persistentes de la U en el escenario tienen transparencia y anchura reducidas; los jefes siguen inmunes al sueño y al daño, exactamente como antes.
- QA añadido: contrato de actos cinematográficos, ritmos de J/K/L/U, conteos de Canvas y estabilidad, escena real de la U en matriz visual del navegador. Tests previos de las 10 supremas, multi y release gate obligatorios para integrar.
- Dino, Grok, enemigos, hitboxes y otros héroes sin cambios funcionales.

## 08/10/2026 · V67 CUERNO · MENSAJE 8/10 · MAGIA VIVA

**Caché:** `ohana-266`. **Contrato:** 10 personajes, 5 evoluciones cada uno; Dino y Grok intactos. Sin mutar física/hitbox/boss ni J/K/L/U.

- Cada J/K/L/U nace de la punta **real** del cuerno dibujado, con su propia geometría y paleta. J proyecta una lanza de nácar; K deja cuatro cintas de galope; L origina siete anillos difuminados que se expanden desde el asta; U extiende siete caminos de sueño y pequeñas Z de luz alrededor del unicornio.
- La reacción evoluciona con Cuernín, Destello, Potro Iris, Estelar y Aurora: punta anclada a anatomía, amplitud creciente y arco/lenguaje propios, sin imágenes ni generadores de partículas.
- La forma F4 coordina alas y expresión: despliega completamente en U, casi por completo en L y cierra los ojos serenamente durante el sueño, manteniendo sus cinco formas previas, animaciones cómicas y el animal legible.
- Tras U, la aura de sueño local perdura discretamente durante el temporizador ya existente y se apaga automáticamente. No genera nuevas acciones, no reejecuta daño y no altera dirección ni salto; la inmunidad absoluta de jefes y el daño progresivo de la U siguen siendo responsabilidad exclusiva de `systems/abilities.js`.
- `cuernoMagicPose` es un contrato puro, determinista y medible. Pruebas Node de los cuatro trazos, cinco formas, Canvas save/restore, estado herido/muerto y regresión mecánica; cuatro capturas Chromium reales J/K/L/U bajo fuerza QA exclusiva, con cache de retrato segura.
- Presupuesto JS: compactación exclusivamente de indentación en tres assets sin backticks ni cambios semánticos. CI Node, E2E navegador y multijugador, regresión visual y release gate obligatorio antes de merge.

## 08/10/2026 · V66 CUERNO · MENSAJE 7/10 · ALMA DE UNICORNIO

**Caché:** `ohana-265`. **Contrato:** 10 personajes / 5 formas, Dino y Grok intactos. Fases anteriores, Círculo Iris L y Sueño Arcoíris U preservados.

- Cuerno tiene ahora pantomimas individuales en Canvas, con origen en los estados reales del rig: F0 Cuernín curioso y juguetón; F1 Destello tímido; F2 Potro Iris que hace cabriolas; F3 Unicornio Estelar que contempla constelaciones; F4 Unicornio Aurora que estornuda nácar o se inclina majestuosamente.
- Seis secuencias visuales reutilizables pero con identidad por etapa: `curious`, `shy`, `prance`, `stargaze`, `sneeze`, `bow`. Controles del rig `idle`, `victory`, y casteo U, pulsos `flourish` periódicos y `flourishN`, sin RNG/temporizadores/recursos externos. La forma final cierra los ojos al estornudar o saludar e inclina su anatomía real; el potro recoge los cascos al jugar.
- El carrusel de personajes incorpora una prueba visual forzada no productiva, con seis capturas PNG en navegador real y control de `dataset.cuernoBeat`/cache render. Se respetan el tiempo de animación, el contorno del personaje y el dibujo de rostro.
- Cobertura específica Node de comportamientos, silencio en combate o herida, estados de victoria y U, determinismo de píxeles por estados y equilibrio `ctx.save/restore`. No se modifica física, hitboxes, cifras, enemigos ni otros personajes.
- Ajuste exclusivamente de sangría en `characters/draw.js` y `characters/art/pizza.js` para respetar el límite de JavaScript de 1.5 MB, sin modificar su ejecución. Calidad Node/Chromium/Firefox/Safari donde corresponda, multiplayer, visual y release gate.

## 08/10/2026 · V65 CUERNO · MENSAJE 6/10 · CÍRCULO IRIS Y SUEÑO ARCOÍRIS

**Caché:** `ohana-264`. **Contrato:** 10 personajes / 5 formas, Dino y Grok sin cambios.

- **L · Círculo Iris**: ya no son siete bolas rectas; emite un arcoíris circular difuminado que crece y alcanza enemigos una vez por ola. Radios dependientes de evolución: 170, 260, 400, 610 y diagonal de pantalla ×1.12 en F4. El arcoíris F4 cubre visualmente todo el viewport con un gradiente suave y siete anillos, sin estrobos ni efectos sin límite.
- **U · Sueño Arcoíris**: todos los enemigos normales visibles entran en sueño (stun) y reciben cinco pulsos progresivos hasta quedar derrotados. Los jefes son inmunes a este efecto: ni dormidos ni dañados. Fuera de pantalla no hay ejecución global invisible. La U mantiene su protección y curación existentes.
- **J · Lanza astral**: una forma nacarada afilada y perforante en Canvas sustituye la bola genérica. **K · Galope radiante**: embestida con cuatro apoyos, estela de menor frecuencia y parada en el borde. Sin nuevo movimiento involuntario al pulsar U.
- Storyboard U más lento y calmado, símbolos de sueño y lluvia de luz circular; nombre y copy de poderes adaptados.
- Tests Node reales de física K, L por formas 0–4, sueño gradual, inmunidad absoluta del jefe y offscreen; capturas Chromium L/U en una partida real.
- Presupuesto JS de <1.5 MB protegido por compactación de sangría sin cambios semánticos en `game.js`; CI, E2E, multijugador, regresión visual y release gate obligatorios.

## 08/10/2026 · V64 CUERNO · MENSAJE 5/10 · UNICORNIO AURORA

**Caché:** `ohana-263`. **Contrato:** 10 personajes / 5 formas; Dino y la intro de Grok intactos.

- Forma final F4 independiente en Canvas. Adulto de cuerpo largo y musculatura equina, cuello elevado, hocico, orejas, cuatro patas articuladas con pezuñas y cuerno de nácar espiral. Eliminados el cuerpo esférico y las constantes antiguas sin uso.
- Alas translúcidas de aurora, cinco barbas luminosas por ala, plegadas en reposo y abiertas en saltos, hechizos y victoria. Son solo visuales: NO conceden vuelo, no cambian física, daño o colisiones.
- Siete mechones reactivos de melena, seis cintas de cola, galope de cuatro tiempos, recogida en el aire, constelación sobria y gestos de combate. Sin recursos PNG, temporizadores ni partículas persistentes.
- Velocidad 9.6, salto 18.6, cuatro saltos, J/K/L/U y pasiva intactos. Ajuste de contorno visual de retrato F4 sin modificar hitbox.
- Nuevo test Node para anatomía, alas, articulaciones, estados, determinismo, pila Canvas y estadísticas; matriz Chromium con captura exclusiva de Aurora en selector y partida. CI, E2E, multijugador y Release Gate son obligatorios.
- Optimización exclusiva de sangría de abilities.js para cumplir presupuesto real de JavaScript de 1,5 MB. Caché `ohana-263` sincronizada.

## 08/10/2026 · V63 CUERNO · MENSAJE 3/10 RECUPERADO · POTRO IRIS

**Caché:** `ohana-262`. **Contrato:** 10 personajes / 5 formas; Dino e intro de Grok intactos.

- Forma 2 reconstruida desde cero: potro de cuerpo corto, cuello, hocico, orejas y cuatro patas articuladas. No es la bola provisional ni un adulto reducido.
- Trote de cuatro tiempos, salto recogido y gestos independientes; melena de cinco mechones y cola arcoíris, cuerno nacarado, marca de iris y destellos acotados. Sin timers ni alterar hitboxes.
- Velocidad 7.4, salto 16.2 y poderes intactos. Formas 0/1/3/4 conservadas.
- Pruebas Node de anatomía, articulaciones, trote, salto, identidad, stack Canvas y rendimiento; captura F2 y prueba visual Chromium de partida real.
- Caché, HTML, Service Worker, documentación y hardening sincronizados. Continuación: 5/10 Unicornio Aurora.

## 08/10/2026 · V62 CUERNO · MENSAJE 4/10 · UNICORNIO ESTELAR

**Caché:** `ohana-261`. **Contrato:** 10 personajes / 5 formas. Dino e intro de Grok intactos.

### Evolución 3: primera forma adulta de verdad
- Forma 3 reconstruida desde cero en Canvas: lomo largo, grupa alta, pecho, cuello curvo unido al cuerpo, cabeza con hocico y orejas, melena de cinco mechones animados, cola astral, espiral de cuerno y constelación discreta en el flanco.
- Galope de cuatro tiempos: pezuñas, rodillas y patas en fases independientes; animaciones diferentes de carrera, salto, ataque, victoria, idle y florecimiento. Sin PNG, sin timers, sin FX persistentes y sin mover la hitbox.
- Legibilidad sin saturación: reflejos azules, rosas y dorados; tres líneas de velocidad ligadas a carrera, no un montón de partículas.
- **Salto de fases explícito:** las fases 1/10 y 2/10 están fusionadas; la 3/10 Potro Iris no se ha realizado todavía y no se considera terminada. La forma 2 sigue siendo el arte provisional anterior.
- Se conserva la forma 0 (cuerno mágico sin patas), la forma 1 (Destello de dos pezuñas), la velocidad 8.4 y salto 17.4 de la forma estelar, y los mismos poderes J/K/L/U.
- Tests Node instrumentan el dibujo para contar articulaciones y comprobar cuatro fases de carrera, salto, identidad, Canvas balanceado y ausencia de efectos asíncronos.
- Matriz visual Chromium: cinco formas 0-4, captura especial de Unicornio Estelar y prueba de gameplay de forma 3 con errores JS vigilados.
- Optimización solo de sangría/espacios en dos módulos para mantener el presupuesto estricto de JavaScript (1,5 MB). Caché sincronizada `ohana-261`.
- **Siguiente en orden solicitado:** 5/10 · Unicornio Aurora, diseño definitivo. **Pendiente por recuperar:** 3/10 · Potro Iris.

## 08/10/2026 · V60 CUERNO · MENSAJE 2/10 · PRIMERA METAMORFOSIS

**Caché:** `ohana-260`. **Contrato:** diez héroes / cinco formas. Dino y la intro de Grok sin modificaciones.

- **Destello · Naciente** deja de utilizar la antigua bola con cuatro patas. Tiene una silueta exclusiva Canvas: cuerpo de nácar en formación, cuello continuo, hocico, dos orejas, melena naciente, dos pezuñas animadas y cola arcoíris que aún es luz.
- El cuerno de la forma 0 sigue siendo el núcleo anatómico, ahora arraigado en la frente. La forma 1 es un ser incompleto y expresivo, no un unicornio adulto reducido de tamaño.
- Gestos propios: impulso al correr, pezuñas independientes, recogimiento en el aire, timidez al florecer y gesto de orgullo cuando descubre la punta del cuerno.
- El texto evolutivo explica exactamente lo que nace, sin adornos genéricos.
- Tests Node ejecutan `draw()` en las formas 0, 1 y 2 con un rig instrumentado. Verifican 0/2/4 patas, rostro visible, pila Canvas equilibrada y animaciones sin temporizadores ni aleatoriedad.
- Capturas Chromium para formas 0, 1, 2 y 4; nueva captura exclusiva de Destello y prueba real de juego con evolución 1, vigilando errores JS.
- No se modifican las velocidades, saltos ni ataques de V59; sigue siendo el héroe más rápido y con salto más alto.
- JavaScript optimizado exclusivamente quitando sangría redundante en dos módulos para conservar el límite de 1,5 MB sin quitar efectos.
- Siguiente: **3/10 Potro Iris**, su primera anatomía completa de cuatro patas, con galope físico legible.

## 08/10/2026 · V59 CUERNO ORIGIN · MENSAJE 1/10 · PROPOSED

**Caché:** `ohana-259`. **Contrato:** diez héroes / cinco formas. **Intro de Grok y Dino:** no modificados.

### Nueva fantasía
Cuerno comienza siendo un **cuerno viviente de unicornio**, con mirada, espiral y base de perla, SIN caballo ni piernas. Con cada etapa nace un cuerpo real hasta llegar a Unicornio Aurora. Su nacimiento es mágico, la velocidad y el salto son naturales, no un poder dependiente de K.

### Fase 1 implementada
- Nueva ilustración Canvas exclusiva de Forma 0; silueta de cuerno de nácar, no bola cuadrúpeda.
- El modo pintado también muestra el Cuerno vectorial nuevo, sin que un SVG antiguo tape el rediseño.
- Estadísticas reales por forma: velocidad [6, 6.7, 7.4, 8.4, 9.6] y salto [14.6, 15.4, 16.2, 17.4, 18.6], en todos los niveles superiores a sus compañeros.
- Pasiva `punta` conservada por compatibilidad, renombrada `Impulso innato`: velocidad y salto permanentes con estela ligera; mantiene el rebote y el puente aurora.
- Rig de movimiento con frecuencia y respuesta de carrera rápida. Historia evolutiva y cinco nombres nuevos: Semilla → Naciente → Potro Iris → Unicornio Estelar → Unicornio Aurora.
- Nuevas comprobaciones Node de velocidades y saltos, no cuatro patas en la forma inicial, y Chrome screenshot de Forma 0 y 4.
- Caché coherente `ohana-259`; no se alteran ataques J/K/L/U ni físicos de otros héroes.

### Roadmap de diez mensajes
1. **V59 Origen:** cuerno viviente, velocidad y salto innatos, base gráfica y contrato ✅
2. **V60 Naciente:** aparición orgánica del cuerpo y patas sin romper la identidad del cuerno
3. **V61 Potro Iris:** anatomía y cuatro patas legibles, locomoción expresiva
4. **V62 Unicornio Estelar:** melena, silueta, galope y carácter propio
5. **V63 Unicornio Aurora:** criatura final, majestuosa y cinematográfica, sin crecer por crecer
6. **V64 J:** disparos del cuerno con trayectorias mágicas e impactos distintos
7. **V65 K:** embestida fantasía supersónica, controlable, sin salirse de pantalla
8. **V66 L:** siete artes de luz y magia de área reconocible
9. **V67 U:** secuencia suprema original, larga, legible y espectacular
10. **V68 Cierre:** cinco formas, controles, rendimiento, navegador, balance, CI y release gate.

**Dino permanece reservado para el proyecto sorpresa final.**

## 08/10/2026 · V58 YOMI FINAL · FASE 3/3 · JUEZ DEL UMBRAL

**Caché:** `ohana-258`. **Contrato:** 10 personajes · 5 formas · 10 salas. **Dino último. Grok intro intacta.**

- **J · Sello guardián** sigue siendo un proyectil horizontal con cuenta atrás y explosión; ahora deja una marca ritual temporal en enemigos impactados.
- **K · Campanada del Umbral:** onda audiovisual circular de escenario completo que golpea y marca a todos los enemigos vivos, con daño moderado (incluidos jefes con reducción).
- **L · Mordida lunar:** anticipación frontal y cierre sincronizado; sobre un enemigo marcado inflige 1,9x y consume la marca.
- **U · Juicio del Umbral:** Cuerno entra en escena y realiza una embestida aurora que alcanza a TODOS los enemigos; daño masivo con bonus por marca y ejecución de enemigos normales debilitados. Los jefes tienen una cantidad limitada de daño y no son ejecutados automáticamente.
- Las cinco formas han dejado de ser cinco escalas del mismo farol: semilla, peregrino, guardián alado, caballero nocturno y juez de doble creciente. La expresión y el toque de campana son propios.
- Cine Yomi + Cuerno: entrada temprana, sello de luz, carga real visible y cierre del juicio. Sigue durando 3,9 s y respeta movimiento reducido.
- Pruebas de combate verifican J/K/L/U, daños en ambos lados, marcas, remates y protección de jefes; Chromium verifica el recorrido y errores de ejecución.
- Mantener presupuesto estricto de JavaScript y cache `ohana-258`.

## 08/10/2026 · V57 YOMI REBORN · FASE 2/3 · PROPOSED

**Caché:** `ohana-257`. **Contrato:** 10 personajes · 5 formas · 10 salas. Dino reservado para el último pase. Intro de Grok sin cambios.

- K **Mangas imán**: succión física solo en el abanico frontal de 210 unidades, conexión visible a cada objetivo afectado, fuerza controlada y respeto al combate de jefes.
- L **Mordida lunar**: zona de impacto frontal 120×108 visible antes de golpear, anticipación y cierre de fauces sincronizados con el daño; brazos y rostro reaccionan al golpe.
- Yomi adquiere cinco siluetas realmente diferentes: semilla de farol, caminante, guardián alado, caballero nocturno y guardián lunar de doble creciente. No son escalados del mismo cuerpo.
- U de Yomi reconstruida como **Farol → Cuerno → sello de luz → rescate**, con Cuerno realmente presente desde el primer tercio de la película y en el combate, cinco impactos como máximo y duración de 3,9 segundos.
- Todas las U normales tienen mínimo 2,65 segundos para legibilidad; `prefers-reduced-motion` conserva el modo reducido de 0,78 s. Cuerno conserva una aparición más temprana y una escala mayor en el cine.
- QA de navegador activa K/L reales, prueba el diálogo de Cuerno, valida las cinco siluetas, conserva J y revisa el presupuesto máximo de 1,5 MB de JS.
- Reducción de comentarios no ejecutables para respetar los presupuestos sin recortar habilidades. Caché `ohana-257` coordinada.

**Fase 3:** perfeccionar toda la puesta en escena de U, fidelidad visual, móvil, asistencia y cierre de Yomi.

## 08/10/2026 · V56 YOMI REBORN · FASE 1/3

**Caché:** `ohana-256`. **Contrato:** 10 personajes · 5 formas · 10 salas. **Dino:** último personaje. **Intro de Grok:** no modificada.

- Reconstrucción completa de Yomi como guardián-farol: silueta reconocible, rostro OHANA expresivo, cuerpo de papel iluminado y mangas animadas.
- Las cinco formas tienen proporciones, tocado, hombros, mangas, grietas y corona lunar progresivas. Se conserva su identidad de espíritu, ahora cálida y legible.
- Ataque **J · Sello guardián**: el talismán sale horizontalmente en dirección al enemigo, se fija y revela una cuenta atrás circular de 16 ticks antes de explotar en un radio de 72 unidades. La lógica de daño y enfriamiento se conserva.
- Arte del lanzamiento J directamente en las manos de Yomi; el ataque ya no parece una carta que sube sin propósito.
- Nueva historia evolutiva: Yomi aprende a alumbrar y proteger, no a convertirse en un monstruo desconectado del elenco.
- Tests automatizados de rig, arte, J real en navegador, cinco capturas de evolución y límites de transferencias JS.
- `ohana-256` sincronizada en Service Worker, HTML, regresiones y documentación.
- **Siguiente fase:** rediseñar habilidades K (manga de succión), L (fauces) y retroalimentación de impacto. **Fase final:** cinematografía U y auditoría integral.

## 08/10/2026 · V55 PIZZA MOLTEN SOUL PASS · PROPOSED

**Caché:** `ohana-255`. **Contrato:** 10 personajes · 5 formas · 10 salas. **Dino:** reservado para el último pase.

- Pizza: cuarta animación idle con lanzamiento y rescate de pepperoni mediante un hilo de queso, ligada a su silueta real.
- Rebote elástico: hilos de queso y anillo de impacto localizado; se mantienen físicas, colisiones y controles.
- Forma final: pulso de horno solo durante el poder L, sin ocultar el personaje.
- Suprema U HORNO REAL: bostezo → calentamiento del horno → retroceso por exceso de calor → erupción volcánica. Identificador `oven-too-hot` y duración original intactos.
- Historia evolutiva nueva hasta Pizza Volcánica, con personalidad y responsabilidad propia.
- Cinco nuevas capturas Chromium y regresiones de personalidad, rebote, cinematografía y caché.
- `ohana-255` coordinado en index.html, SW, pruebas y PROGRESS. JavaScript de Pizza optimizado antes del release.
- No se modifica intro/Atrium de Grok ni habilidades o estructuras de Dino.

## 08/10/2026 · V54 FRITA CRISPY SOUL PASS · PROPOSED

**Caché:** `ohana-254`. **Contrato:** 10 personajes · 5 formas · 10 salas. **Dino:** reservado para el último personaje.

- La cuarta microescena de espera hace malabares con sal: lanza un cristal, casi falla y lo atrapa; el efecto sigue su espina flexible.
- El resbalón lleva estela propia de kétchup y oro, sin mover hitboxes ni duplicar sprites.
- La U de Frita se organiza en cuatro escenas: patata fugitiva → captura en tenedor → remolino de kétchup → estallido crujiente.
- Evoluciones con identidad: Palito tímido, Frita surfista, Capitán Kétchup, Extra Crujiente y Frita Centella.
- Pruebas Unit y Browser/Visual capturan las cinco siluetas con comprobaciones reales de píxeles y escala.
- Se preserva el identificador `potato-catch`, la intro/Atrium coral y el comportamiento del resto de personajes.
- Contrato de assets `ohana-254` aplicado a index.html, Service Worker, tests y PROGRESS.
- QA de cierre: `node tests/browser/e2e.mjs`, `node tests/browser/visual-regression.mjs`, `release:check`.

## 08/10/2026 · V53 DRAGÓN SOLAR SOUL PASS · PROPOSED

**Caché:** `ohana-253`. **Contrato:** 10 personajes · 5 formas · 10 salas.

- Dragón es el siguiente personaje tras Michi; Dino permanece reservado para el último pase.
- Cuatro gestos de espera, incluido el estornudo que se convierte en una brasa fugitiva y el gesto de recuperar la compostura.
- Aleteo reactivo al ascenso y descenso; estelas y espiral de brasas diferentes por forma.
- Gust K, Roar L, pisadas cálidas y corona solar de Forma 5 tienen lenguaje visual propio sin alterar colisiones o daño.
- Supernova Celeste: persecución de la chispa, despegue, corona y explosión final; se conserva el identificador `tiny-sneeze`.
- La matriz visual de Chromium verifica y captura las cinco formas de Dragón además del resto del juego.
- Actualización coherente de Service Worker, index.html y pruebas a `ohana-253` para no servir arte antiguo.
- Control de release: `node tests/browser/e2e.mjs`, `node tests/browser/visual-regression.mjs` y `release:check`.

## 08/10/2026 · V52 MICHI + CACHE HARDENING

**Caché:** `ohana-252`. **Contrato:** 10 personajes · 5 formas por personaje · 10 salas.

- V50 y V51 están integradas; V52 invalida correctamente versiones antiguas en index.html y Service Worker.
- Precaché offline completo, incluido Atrium; portada coral de diez personajes mantenida sin alterar su lógica.
- Michi: zarpazos lunares, remate de victoria, Paso Sombra y Eclipse de Nueve Vidas conservados.
- Optimización de transferencia JavaScript mediante reducción de comentarios no ejecutables, sin modificar la mecánica.
- QA automatizada: `node tests/browser/e2e.mjs`, `node tests/browser/visual-regression.mjs`, `release:check`.
- Registro de propuestas PR #175 (cerrada) y PR #178 (rama limpia reconstruida sobre main).

## 08/10/2026 · V50 CHISPÍN SOUL PASS · PROPOSED

- Chispín conserva su identidad de ajolote-hurón eléctrico: branquias, cola de muelle, saltitos y sonrisa.
- Nueva cuarta microescena en idle: intenta atrapar el relámpago, recibe un calambre y transforma la descarga en un pequeño baile.
- Efectos SVG-free Canvas 2D según forma y estado: trazos violeta, huella eléctrica, Cloudstep en Trueno Gordo y corona aurora final.
- Efectos contenidos alrededor del personaje, sin temporizadores ni sistemas de partículas persistentes.
- Selector con pose de canalización y evolución con trayectoria narrativa individual.
- Escena de U: movimiento vertical más legible y evolución narrativa hacia conductor de tormentas.
- Pendiente: validación CI/browser/visual regression antes de considerar release.

## 08/10/2026 · V49 STITCHO SOUL PASS

**Caché:** `ohana-241`.

V49 inicia el pase personaje-a-personaje con Stitcho, usando a Kilo como referencia de calidad emocional pero conservando una identidad completamente distinta.

- **Personalidad:** travieso, acrobático, espacial y descarado. Su lenguaje gira alrededor de costuras, cremalleras, grietas y caos controlado.
- **Idle / flourish:** nueva cuarta microescena en la que abre una pequeña grieta, algo mira desde dentro y Stitcho reacciona con una sonrisa de pillo.
- **Selector:** coreografía propia `smirk → wall-peek → plasma-roll → claw-swipe → nebula-laugh`; Visual Regression fuerza y captura `01d-stitcho-plasma-roll`.
- **Wall-vault:** trepar y salir de pared deja una costura cian/violeta visible y el vault remata con **ZIP!**.
- **Plasma / Bola / Caos:** los FX comparten ahora puntadas y costuras, de modo que sus tres habilidades parecen parte del mismo personaje.
- **Evolución:** el motivo `seam` crece hasta una verdadera grieta/capa Nébula en Forma 5, con puntadas y apertura espacial.
- Copy de evolución reescrito para contar la progresión de Stitcho hacia Nébula.
- **U · SINGULARIDAD COSIDA:** abre una grieta, algo le devuelve la mirada, aparece un **NO.**, la cierra y convierte esa misma costura en el ataque.
- Se preservan sus mecánicas existentes: Plasma, Bola rodante, Modo caos, trepa/vault, Costura fantasma y la Suprema de atracción.
- Contrato preservado: **10 personajes · 5 formas · 10 salas**.
- Próximo personaje: **Chispín Soul Pass**.

## 08/10/2026 · V48 SUPREME CINEMA REBORN

**Caché:** `ohana-240`.

V48 dedica el sprint completo a la tecla U.

- **Diez U, diez storyboards:** la vieja plantilla compartida `idle → attack → victory` desaparece.
- **Kilo · pollen-bonk:** una mota lo golpea, la escena florece y termina en OHANA SOLAR.
- **Stitcho · rift-zipper:** abre una grieta como cremallera, reacciona y cose el espacio.
- **Chispín · overcharge:** se sobrecarga, recibe un calambre y descarga la tormenta.
- **Michi · deadpan-eclipse:** espera impasible, entra el eclipse y desaparece en sombra.
- **Dragón · tiny-sneeze:** una mini llamarada/estornudo rompe la pose solemne antes de la NOVA.
- **Dino · double-stomp:** primera pisada casi ridícula, segunda pisada rompe el mundo.
- **Frita · potato-catch:** una patata cruza la escena, la atrapa y detona la fritura.
- **Pizza · oven-too-hot:** abre el horno, hay demasiado fuego, retrocede y termina en volcán.
- **Yomi · void-looks-back:** mira al vacío, el vacío devuelve la mirada y se abre la fauce.
- **Cuerno · tiny-rainbow:** aparece un arcoíris pequeño, lo aparta y libera la aurora completa.
- Cada U tiene **cámara, gag, beat y duración propios** entre 1,5 y 1,8 s.
- **OHANA ASSIST entra físicamente en el mini-film**, no como simple etiqueta.
- El texto pasa a ser puntuación final; el personaje vuelve a ser el sujeto principal.
- `supreme.css` se simplifica: se elimina toda la plantilla obsoleta de motivos CSS.
- Se mantienen intactos daño, cooldown, identidad mecánica, combo y assist.
- Browser E2E lanza las **10 U reales** y exige story/camera/beat únicos.
- Visual Regression captura Kilo + Stitcho assist y Yomi como dos lenguajes cinematográficos distintos.
- Reduced Motion conserva una versión abreviada.
- Contrato preservado: **10 personajes · 5 formas · 10 salas**.

## 08/10/2026 · V47B SUPREME CONTROL + PERFORMANCE PASS

**Caché:** `ohana-239`.

V47B corrige la deriva lateral de algunas Supremas y reduce el coste visual del selector/cinemáticas.

- **U sin auto-movimiento:** lanzar una Suprema ya no aplica impulso horizontal, teletransporte, salto o dash automático por heredar el especial del personaje.
- Chispín y Frita dejan de salir disparados según `facing`; el turbo de Frita solo acelera cuando el jugador marca dirección.
- Supreme Shorts fuerzan `vx=0`, `vy=0` y locomoción neutral en héroe/assist para que el rig no interprete carrera accidental.
- Browser E2E reproduce el bug real con Chispín y Frita en Forma 5 y exige `vx≈0` tras U sin input.
- **Spotlight más pequeño:** Hero Gate y halo de suelo reducidos para que el personaje domine el carrusel.
- **Selector más ligero:** retratos a 24 fps, solo se dibujan las cinco tarjetas visibles, lookup de roster cacheado y DPR limitado por tamaño del canvas.
- **Backdrop más ligero:** 30 fps, 28 motas deterministas, DPR adaptativo y gate más pequeño.
- **Cinemáticas fullscreen:** DPR adaptativo en pantallas grandes para evitar renderizar millones de píxeles sin ganancia perceptible.
- Menos `backdrop-filter` y sombras apiladas en controles del selector.
- Simulación/juego permanece a 60 Hz; las optimizaciones afectan solo a presentación.
- Contrato preservado: **10 personajes · 5 formas · 10 salas**.
- Próximo bloque: **Kilo Soul Pass**.

## 08/10/2026 · V47A CAROUSEL FIT + HOKU HERO GATE

**Caché:** `ohana-238`.

V47A corrige el encuadre de evoluciones en el selector y sustituye el fondo del carrusel por una composición coherente de Isla Hoku.

- **Safe Portrait Fit:** cada forma usa un envelope visual por héroe/evolución que reserva espacio para alas, colas, cuernos, aura y FX.
- Forma 5 deja de usar el mismo supuesto de tamaño que las formas pequeñas; el fit limita ancho y alto antes de dibujar.
- El canvas expone forma, escala y envelope para QA y Visual Regression.
- Visual Regression fuerza Forma 5 y captura `01c-character-select-final-form-fit`.
- **Hoku Hero Gate:** el selector siempre ocurre en Isla Hoku. Detrás del héroe aparece una ventana procedural hacia su afinidad, en vez de cambiar todo el fondo como diez wallpapers inconexos.
- El gate conserva diez identidades: pradera, jungla, laboratorio, luna/cueva, volcán, tierra, costa, horno, vacío y aurora.
- Fondo determinista para evitar ruido entre capturas de regresión.
- Menos viñeta y overlays oscuros; más lectura del héroe central y del escenario.
- Contrato preservado: **10 personajes · 5 formas · 10 salas**.
- Próximo bloque: **V47B · Kilo Soul Pass**, inicio del trabajo personaje a personaje.

## 08/10/2026 · V46 CONTROL FEEL + PLAYER INTERACTION

**Caché:** `ohana-237`.

V46 corrige la interacción base antes de seguir ampliando contenido.

- Eliminado el watchdog temporal de teclado que podía soltar una dirección físicamente mantenida tras ~1,2 s.
- Las teclas solo se liberan con su `keyup`, pérdida real de foco/contexto o salida de página.
- **Última dirección pulsada gana** cuando izquierda y derecha están mantenidas simultáneamente; al soltarla, la otra sigue activa.
- Nuevo `axisX()` en input para representar intención horizontal real sin perder teclas físicas retenidas.
- Nuevo `consumePress()` con latch de pulsación: un toque corto de salto no se pierde aunque ocurra entre dos frames.
- El jump buffer se activa por pulsación y deja de rellenarse cada frame mientras se mantiene `↑ / W / Espacio`.
- Coyote time y jump buffer quedan centralizados en `CONTROL_FEEL`.
- Aceleración de suelo/aire y cambio de dirección tienen perfiles separados para una respuesta más inmediata.
- Multitáctil corregido: levantar un dedo ya no borra visualmente ni libera los demás controles.
- `touchend` global queda como fallback solo cuando Pointer Events no existe.
- Botones táctiles exponen `aria-pressed` real durante la pulsación.
- Los hints muestran WASD + flechas y explican las alternativas de salto.
- Browser E2E reproduce el bug original: mantiene `→` durante más de 1,2 s, pulsa `↑` y exige que dirección, `axisX` y velocidad horizontal sigan activos.
- Contrato preservado: **10 personajes · 5 formas · 10 salas**.

## 08/10/2026 · V45 LIVING HERO SELECT + FINAL ASCENSION

**Caché:** `ohana-236`.

V45 lleva personalidad y transformación al primer plano.

- **Comic Family Welcome:** el bucle inicial pasa a 14 s y añade interacción real entre personajes: Stitcho y Chispín se pican, aparece un accidente eléctrico, Dragón estornuda fuego, Frita y Pizza discuten por una patata, Yomi asusta desde una sombra, Dino provoca otra reacción del grupo y aparecen bocadillos cómic procedurales.
- **Living Hero Select:** selector inspirado en patrones coverflow públicos de GitHub, implementado de forma nativa con CSS 3D: cinco héroes visibles en desktop, profundidad, `translateZ`, `rotateY`, foco central y transición fluida.
- **Hero Worlds:** el fondo del selector deja de ser genérico. Cada héroe activa un ambiente procedural distinto: pradera, jungla, laboratorio, cueva lunar, volcán, tierra quebrada, costa, horno, vacío y aurora.
- **Microacciones:** el héroe central usa secuencias de pose distintas por identidad mientras muestra sus formas.
- **Evolution Camera Language:** los perfiles orbit/spiral/snap/eclipse/sweep/impact/whip/roll/pull/rise pasan a modificar realmente el movimiento de cámara corporal.
- **Final Ascension:** Forma 5 tiene timeline propio de más de 5 s. Las cuatro formas anteriores aparecen como ecos, convergen, forman una columna/capullo de energía y la quinta forma se revela con pose firma.
- Los motivos gráficos de evolución se reducen a atmósfera para que el personaje vuelva a ser el sujeto.
- Visual Regression añade `01b-character-select-stitcho-world` y `04b-final-evolution-ascension`.
- Contrato preservado: **10 personajes · 5 formas · 10 salas**.

## 08/10/2026 · V44 CINEMATIC REBUILD

**Caché:** `ohana-235`.

V44 redefine dónde usa cine Project OHANA y elimina overlays que parecían cinemática sin aportar emoción.

- **Family Welcome:** la apertura ya no muestra logo, Nido ni cuenta atrás. Los diez héroes viven en una escena continua de Isla Hoku y el carrusel no aparece hasta una acción explícita del usuario.
- La escena de bienvenida repite microhistorias: polen de Kilo, descarga Chispín/Stitcho, persecución Frita/Pizza, práctica de Dragón, aparición de Yomi, arcoíris de Cuerno, pisotón de Dino y Michi observando el caos.
- **Supreme Shorts:** cada U monta un canvas fullscreen por encima del gameplay y dibuja al héroe real con una firma distinta por personaje; la forma actual se transmite al cine.
- **Evolution Identity:** las diez firmas de evolución existentes pasan a ser visibles: pétalos, costuras, rayos, eclipse, brasas, cristales, sal, queso, ofuda y aurora. Cada héroe usa además una pose de revelado diferente y su línea narrativa propia.
- **True Ending:** derrotar a la Reina dispara un final en tres actos antes de mostrar resultados: caída/ruptura, llegada de la familia y retrato final al amanecer con el héroe elegido como protagonista.
- Eliminadas las tarjetas fullscreen de capítulos y muerte. Las salas permanecen dentro del mundo/HUD/mensajes y la muerte usa DeathFx.
- El antiguo beat textual de caída de la Reina ya no compite con el final real.
- Contrato preservado: **10 personajes · 5 formas · 10 salas**.
- Próximo bloque: V45 Living Hero Select / Soul pass sobre el carrusel y microacciones.

## 08/10/2026 · V43 OHANA MAGIC

**Caché:** `ohana-234`.

V43 deja de tratar la apertura como un logo animado y presenta a OHANA como una familia antes de presentar el juego.

- La intro usa los **10 héroes reales** del roster con el renderer canónico; no añade siluetas genéricas ni arte externo.
- Primer acto · **FAMILIA:** Kilo juega con polen; Chispín descarga accidentalmente a Stitcho; Michi observa; Frita persigue una patata con Pizza rebotando detrás; Dragón intenta impresionar con una llamarada ridícula; Yomi aparece desde una sombra imposible; Cuerno abre un pequeño arcoíris; Dino aterriza demasiado fuerte.
- Segundo acto · **RUPTURA:** el Nido interrumpe la escena, los gags desaparecen y los diez héroes se alinean mirando la amenaza.
- Tercer acto · **IDENTIDAD:** solo después de conocer a los personajes entra PROJECT OHANA y el iris revela el selector.
- Eliminado el rótulo corporativo temprano `DIEZ HÉROES · CINCO FORMAS · DIEZ SALAS`; la narrativa visual precede al texto.
- Reduced Motion mantiene una versión corta y accesible.
- Visual Regression añade captura `00-opening-family` y exige los diez héroes en la apertura.
- Release contract preservado: **10 personajes · 5 formas · 10 salas**.
- Próximo bloque canónico: **V44 Living Hero Select**.

## 08/10/2026 · V42.1 Single Opening Flow

**Caché:** `ohana-233`.

La apertura deja de mostrar el selector dos veces durante la carga.

- El primer frame arranca en `intro-pending` y oculta todo el contenido de `#char-select` excepto `#ohana-intro`.
- `#ohana-intro` cubre la pantalla desde el HTML inicial, antes de que carguen los módulos.
- La intro cinematográfica elimina `intro-pending` únicamente al revelar la portada definitiva.
- Si el nodo de intro faltase, el flujo falla abierto y muestra el selector en vez de dejar una pantalla negra.
- El selector canónico sigue siendo uno solo: fondo procedural de Isla Hoku + carrusel de héroes.
- Eliminado el pin obsoleto `intro.js?v=ohana-230` desde `systems/title.js`.
- Contrato de release V42.1: **10 personajes · 5 formas · 10 salas**.
- QA final: `node tests/browser/e2e.mjs` · `node tests/browser/visual-regression.mjs` · `npm run release:check`.

## 08/10/2026 · V42 Enemy Species Evolution

**Caché:** `ohana-232`.

V42 convierte cada enemigo en una especie con identidad táctica propia y añade evolución determinista por mundo y relaciones locales entre criaturas.

- 18 identificadores runtime cubiertos por perfiles de especie, incluyendo la pareja Abeja/Avispa.
- Cada especie declara familia, firma, glifo visual, prioridad, rango, sesgo de flanqueo y tres variantes.
- Las variantes son deterministas por especie + sala + índice de aparición y se expresan como **HUNTER, SENTINEL o CATALYST**.
- Una misma especie puede mutar al cambiar de mundo sin introducir RNG de simulación.
- Relaciones emergentes entre vecinos:
  - **PACK** · especies de la misma familia alternan posición.
  - **FLUSH** · ARTILLERY + DIVER coordinan presión y flanqueo.
  - **SCREEN** · BRUISER protege la aproximación de SWARM.
  - **TRAP** · AMBUSHER + SKIRMISHER forman una pinza de engaño.
  - **RELAY** · ARTILLERY + SKIRMISHER mantienen distancia y relevo.
  - **PINCER** · AMBUSHER + BRUISER cierran desde lados opuestos.
- El director V38 y la ecología V41 siguen siendo canónicos; V42 se superpone sin reemplazarlos.
- La capa V42 no modifica HP, daño, hitboxes ni usa `Math.random()`.
- Cada especie tiene un motivo geométrico procedural y las relaciones se leen visualmente sin PNG nuevos.
- Browser E2E exige familia, firma, variante, modo y al menos una relación activa en Lab.
- Visual Regression captura `16-enemy-species-evolution`.
- Contrato de release V42: **10 personajes · 5 formas · 10 salas**.
- QA final: `node tests/browser/e2e.mjs` · `node tests/browser/visual-regression.mjs` · `npm run release:check`.

## 08/10/2026 · V41 Enemy Ecology + Living Encounters

**Caché:** `ohana-231`.

V41 hace que los enemigos pertenezcan al mundo donde viven. Mantiene la inteligencia determinista de V38, pero añade prioridad táctica, formación, espaciado y lectura visual específicos por bioma.

- **Claro · CORO DEL CLARO:** anillo estable que enseña lectura de amenazas sin saturar.
- **Costa · MAREA:** divers y bruisers alternan presión lateral como una ola.
- **Jungla · DOSSEL:** emboscadores y amenazas aéreas ganan prioridad desde el canopy.
- **Cueva · ECO:** emboscadores espacian entradas y cambian flancos por pulso.
- **Lab · CIRCUITO:** artillería toma prioridad, mantiene distancia y dibuja nodos enlazados.
- **Cumbre · VENDAVAL:** skirmishers y divers cambian el vector lateral con el pulso del viento.
- **Órbita · ÓRBITA:** artillería y hostigadores circulan mientras esperan permiso de ataque.
- **Arrecife · CARDUMEN:** enemigos swarm se agrupan y avanzan como banco.
- **Caldera · HORNO:** bruisers y brasas sostienen la presión máxima sin superar tres atacantes comprometidos.
- **Nido · NIDO:** perfil reservado para coherencia del grafo, sin interferir con la Reina.
- La ecología no modifica HP, daño, hitboxes ni usa RNG adicional.
- El director expone `ecology`, `formation`, `biome` y `ecoPressure` para QA.
- Browser E2E valida la formación CIRCUIT de Lab.
- Visual Regression captura `15-enemy-ecology-circuit`.
- Contrato de release V41: **10 personajes · 5 formas · 10 salas**.
- QA final: `node tests/browser/e2e.mjs` · `node tests/browser/visual-regression.mjs` · `npm run release:check`.

## 08/10/2026 · V40 Living Worlds + Traversal Graph

**Caché:** `ohana-230`.

V40 transforma las diez salas de Isla Hoku en un mundo conectado, legible y reactivo, y corrige la antigua falsa seguridad de los pozos.

- Los **pozos son geometría real**: los hazards explícitos se resuelven antes que `nearestBelow/lowestFloor`.
- Costa → Arrecife, Jungla → Caldera, Cumbre → Claro y Órbita → Claro usan volúmenes de transferencia reales.
- Caldera incorpora un **pozo de magma mortal** alineado con un hueco físico del suelo; Dragón dispone de una única Batida de emergencia por caída.
- Catapultas y vórtices comparten una red de traversal con perfiles de ruta: impulso, arco, pull, torsión, color y nombre propios.
- Las catapultas muestran su trayectoria antes del lanzamiento; los vórtices comunican dirección y destino mediante su movimiento.
- **World Graph 2.0** reemplaza la cuadrícula plana del mapa: diez nodos, puertas, caídas, catapultas, vórtices, bloqueos de evolución, rutas principales, atajos y secretos.
- El minimapa usa el mismo grafo canónico que el overlay grande.
- **Living Worlds** añade identidad procedural a cada sala, inspirada en su héroe afín:
  - Claro / Kilo · floración y polen.
  - Costa / Frita · velocidad y líneas de flow.
  - Jungla / Stitcho · lianas y costuras.
  - Cueva / Michi · cristales lunares y sombras felinas.
  - Lab / Chispín · nubes y electricidad.
  - Cumbre / Cuerno · auroras.
  - Órbita / Yomi · vacío y geometría astral.
  - Arrecife / Pizza · coral, burbujas y elasticidad.
  - Caldera / Dragón · térmicas y brasas.
  - Nido / Dino · fracturas sísmicas.
- Entrar con el héroe afín intensifica la respuesta ambiental sin alterar daño ni hitboxes.
- Los fondos bitmap de mundo quedan retirados del runtime y del precache: V40 genera sus mundos en canvas.
- Browser E2E prueba caída real, muerte por magma, rescate de Dragón y World Graph.
- Visual Regression captura las diez combinaciones sala/héroe y el mapa avanzado.
- Release Gate final: `npm run release:check` valida documentación, caché, precache y contratos de publicación.
- Contrato de release V40: **10 personajes · 5 formas · 10 salas**.
- QA final: `node tests/browser/e2e.mjs` · `node tests/browser/visual-regression.mjs` · `npm run release:check`.

## 07/10/2026 · V39 Hero Mastery

**Caché:** `ohana-229`.

V39 convierte los diez héroes en diez maneras distintas de atravesar Isla Hoku, preservando las U, enlaces J→K y OHANA Assist de V37.

- **Kilo · Corriente de Polen:** floraciones del mundo sostienen el aire y recargan su vuelo.
- **Stitcho · Wall Vault:** trepa y convierte paredes/cornisas en impulso vertical.
- **Chispín · Cloudstep:** nubes eléctricas exclusivas funcionan como plataformas y rutas aéreas.
- **Michi · Moon Pounce:** un impulso felino adicional por ciclo aéreo corrige saltos y abre rutas.
- **Dragón · Batida de Alas:** después de sus saltos normales encadena batidas extra; las formas altas ganan más.
- **Dino · Ruptura Sísmica:** el pisotón rompe grietas opcionales y devuelve un rebote colosal.
- **Frita · Carril Crujiente:** el deslizamiento se engancha a carriles y conserva velocidad.
- **Pizza · Rebote de Horno:** respiraderos exclusivos funcionan como trampolines.
- **Yomi · Fase Hueca:** el Paso Hueco vuelve intangible su ventana espectral.
- **Cuerno · Puente Aurora:** aterrizajes fuertes proyectan un puente de luz temporal.

Las superficies de maestría existen únicamente en la colisión del jugador: no modifican la física de enemigos ni bloquean el recorrido para otros héroes. Browser E2E prueba Batida de Alas y Cloudstep con física real, y Visual Regression captura ambos estados.

## 07/10/2026 · V38 Enemy Intelligence & Combat Feel

**Caché:** `ohana-228`.

V38 eleva los enemigos normales al nivel de intención del resto del juego y prepara su arquitectura para multiplayer.

- Director de encuentros determinista: presupuesto de ataques simultáneos por dificultad y población.
- Seis roles legibles: DIVER, SKIRMISHER, ARTILLERY, BRUISER, AMBUSHER y SWARM.
- Intenciones compartidas: STRIKE, PRESS, FLANK, HOLD y RETREAT.
- Los enemigos cercanos comparten alerta sin convertirse en una mente colmena global.
- Artilleros frágiles pueden retirarse; élites y brutos mantienen presión.
- Los ataques ya iniciados nunca se cancelan a mitad, pero los nuevos respetan el presupuesto del encuentro.
- Planta recibe wind-up real; libélula, murciélago, cucaracho y demás especialistas quedan dentro del mismo contrato.
- Telegraphs comunican también el rol mediante forma, no solo color.
- Estado de daño visible y lectura sutil de amenaza/intención integrada en el dibujo.
- E2E expone snapshot del director y Visual Regression captura un encuentro vivo con roles e intenciones.
- Sin RNG nuevo, sin mutaciones de daño/salud y sin cambios de hitbox desde el director.

## 07/10/2026 · V37 Signature Supremes & Combat Flow

**Caché:** `ohana-227`.

V37 convierte la tecla **U** en una Suprema de identidad propia para cada uno de los diez héroes y reconstruye el combate alrededor de cadenas deliberadas.

- Diez U con nombre, mecánica persistente, campo visual e identidad cinematográfica propios.
- Cinemática no bloqueante de activación `U · SUPREMA`, con motivo visual por héroe.
- `H/J/K/L/U` forman Combat Flow: ENLACE → CADENA → FUSIÓN → OHANA FLOW.
- Combinar acciones distintas mejora temporalmente potencia y recuperación de habilidades.
- Cada héroe incorpora un enlace característico J→K con efecto y nombre propios.
- Cadenas avanzadas o combo alto activan **OHANA ASSIST**: entra otro héroe en forma final, ataca y se retira.
- HUD y controles táctiles tratan U como una habilidad real: nombre, bloqueo de Forma 5, cooldown y estado de disponibilidad.
- U deja de depender de nombres literales para su arte: los FX usan identidades semánticas estables.
- Visual QA captura una U real con asistencia y exige su presencia en navegador.

## 07/10/2026 · V36 Cinematic Direction Overhaul

**Caché:** `ohana-226`.

V36 reconstruye la capa de presentación de Mundo 1 como un sistema cinematográfico coherente, no como una colección de overlays aislados.

- Opening de portada real y saltable: Mundo 1 → Isla Hoku → Project Ohana.
- Selector canónico centrado, tres posiciones reales, dossier con fantasía jugable por héroe y controles en una única franja.
- Diez entradas de capítulo numeradas 01/10–10/10 con tratamiento visual específico por mundo.
- Evolución conectada al runtime mediante `ohana-evolve`; la cinemática existente deja de ser código huérfano.
- Director narrativo global para derrota, vacío y caída de la Reina.
- Death FX/fantasma enmarcado por lenguaje cinematográfico común.
- Final reconstruido en cuatro beats: caída, ruptura, liberación y epílogo.
- Contratos E2E de geometría para impedir otra portada con título, héroe, dossier y botones desalineados.
- `prefers-reduced-motion` conserva toda la información sin exigir animación.

## 07/10/2026 · V35.1 Title Composition Fix

**Caché:** `ohana-225`.

Portada reconstruida desde una sola composición: título, héroe, dossier, dificultad y acciones comparten el mismo escenario. Se elimina la cascada histórica de carruseles superpuestos y se limita el selector a anterior / seleccionado / siguiente.

# PROJECT OHANA · Progreso

Última actualización: 05/10/2026

## 07/10/2026 · V35 Cinematic Experience

**Caché:** `ohana-225`.

OHANA incorpora un director cinematográfico para la entrada inicial de cada mundo y una presentación específica del Nido. El final de la Reina pasa a una secuencia en tres actos: ruptura, liberación y epílogo. Todo respeta `prefers-reduced-motion` y queda separado de la simulación jugable.

## 07/10/2026 · Official Multiplayer Integration

**Caché de integración:** `ohana-223` · sincronizada con `index.html` y `sw.js`.

OHANA mantiene `project-ohana` como repositorio canónico y absorbe la línea de desarrollo de `project-ohana-multiplayer`. El mismo motor original soporta ahora juego individual y cooperativo online para 2 jugadores mediante salas, sincronización de pose/acciones/progreso, reconexión y estado compartido de victoria o derrota.

La integración añade `node tests/browser/multiplayer-e2e.mjs` al contrato de navegador y mantiene `release:check` como gate final. La línea visual Character Odyssey y sus diez sectores de personaje pasan también al juego canónico, no quedan encerrados en el prototipo multiplayer.

## Estado actual

### 05/10/2026 · Experience Recovery Block

El sistema de presentación del Mundo 1 ha sido reconstruido en capas separadas:

- **MessageManager 2.0**: una sola salida visual activa, prioridades semánticas y fallback de objetivo.
- **Room Voice**: la entrada a una sala tiene una única narración; el feedback visual de llegada no escribe texto.
- **Tutorial contextual**: pistas disparadas por acciones reales, una vez por sesión, teclado y touch.
- **Objetivos dinámicos**: cada sala tiene ID, destino y requisito; los bloqueos dependen del estado actual.
- **Evolution Flow**: cinemática más corta y visual, narración posterior única, sin letterbox.
- **HUD hierarchy**: objetivo persistente separado de mensajes temporales; boss HUD resumido.
- **Hero Presence**: identidad idle reutilizando firmas existentes, sin marcadores artificiales.
- **Combat Feel**: impacto visual prioritario y números de daño reservados para eventos relevantes.
- **Enemy Readability**: telegraphs con dirección gráfica además del color.
- **Accessibility Contract**: live regions por prioridad y reduced-motion aplicado desde infraestructura.
- **Experience E2E + visual matrix**: validación de contenido, singularidad, geometría y estados clave.

La caché canónica de esta línea de trabajo es `ohana-221`.

### 06/10/2026 · Organic Hero Render Recovery

El renderer vuelve a priorizar los diseños orgánicos completos de `characters/art/`; `characters/definitive.js` queda como fallback. Se preservan hitboxes, poses, combate y el cierre de Mundo 1.

### 06/10/2026 · Hero Identity Recovery

Se restauran las marcas visuales de identidad de los 10 héroes desde el snapshot histórico de `ohana-172`, manteniendo el runtime y el cierre actual de Mundo 1.

### Phase 20 · World 1 Closure Candidate

Existe una rama consolidada de cierre. El mundo **no se declara cerrado todavía**: la decisión depende de que `npm test`, `npm run test:browser`, `npm run test:visual` y `npm run release:check` terminen en PASS en CI.


Project Ohana es una demo jugable en navegador de plataformas 2D sobre Canvas, con:

- **10 personajes activos**
- **5 formas por personaje**
- **10 salas**
- **1 jefe final: la Reina del Nido**
- **3 habilidades por personaje (J / K / L)**
- **guardado v2**
- **simulación fija a 60 Hz**
- **GitHub Pages + CI**

## Hecho

| 04/10 | Infra de release: caché activa alineada en `ohana-96` para forzar la carga de la Phase 11 y evitar artefactos servidos por Service Worker. |
| Fecha | Qué |
|---|---|
| 04/10 | Intro cinematográfica de portada activa, con escena de Isla Hoku, aviso del Nido y salida por iris; eliminada la pantalla de carga básica. |
| 04/10 | Pase de personajes: feedback de giro/frenada; perfiles cinéticos por personaje, squash/stretch, anticipación e impacto de ataques, feedback de aterrizaje/dash y casteo de habilidades con color propio; nueva suite de regresión de animación en CI; caché `ohana-81`. |
| 04/10 | Pase de identidad de personajes: efectos cinéticos propios para los 10 héroes y showcase de sus habilidades en la pantalla de selección; caché `ohana-87`. |
| 04/10 | Firma de combate: 10 ataques básicos y 30 habilidades reciben trazos visuales específicos por personaje/poder; la lectura del impacto deja de depender solo del efecto genérico; caché `ohana-87`. |
| 04/10 | Identidad de evolución: las formas 0 → 4 ahora cambian lenguaje corporal, énfasis de silueta y firma visual por personaje; nueva capa aislada `characters/evolution.js`; 50 combinaciones forma/personaje cubiertas por regresión; caché `ohana-87`. |
| 04/10 | Evolución en combate: H/J/K/L escalan visualmente por etapa y por identidad de personaje; la progresión aumenta impacto, brillo, estela y densidad sin tocar daño, alcance ni hitbox; caché `ohana-87`. |
| 04/10 | Rediseño de evolución: se retira el concepto de forma divina y cada personaje recibe nombre y diseño de forma final propios, con siluetas/ornamentos diferenciados; caché `ohana-87`. |
| 04/10 | Cinemática de evolución 2.0: firmas gráficas específicas por héroe y etapa, medidor visual 0→forma final y reveal reforzado; sin cambios de gameplay; caché `ohana-87`. |
| 04/10 | Auditoría de coherencia del proyecto. Manifest alineado con 10 personajes, 5 formas y 10 salas. Documentación de progreso alineada con la ejecución real del CI. Referencias de caché y pruebas actualizadas. Añadida validación automática de consistencia en GitHub Actions. |
| 03/10 | Simulación fija a 60 Hz; módulos de reloj, entrada y diálogos; guardado periódico y en victoria/menú/pausa; controles táctiles con E; título visible, HUD accesible y foco de diálogos; final y evolución reutilizan sus capas; pruebas de regresión y CI antes de publicar. |
| 24/09 | **Fábrica** `engine/foes.js` (makeFoe fuera de game.js). Hitstop, vibración, cámara de director en el Nido. Rig crawler/flyer/brute. Save v2 (hp, nueve vidas, magia, kills). Ids `kilo` / `stitcho` / `chispin` con migración de saves viejos. XP alineada (`55 → 140 → 260 → 420`). Móvil: botón bajar + layout vertical. |
| 24/09 | Arreglo integral: el juego vuelve a cargar. |
| 24/09 | Personajes vectoriales, música procedural, Reina del Nido. |

## Personajes

Activos:

1. Kilo
2. Stitcho
3. Chispín
4. Michi
5. Dragón
6. Dino
7. Frita
8. Pizza
9. Yomi
10. Cuerno

Aliases heredados compatibles:

- `lilo` → `kilo`
- `stitch` → `stitcho`
- `pikachu` → `chispin`
- `michi` → `cat`

## Mundo

Hay **10 salas** en el mundo publicado:

1. Claro Ohana
2. Costa Hoku
3. Jungla Alta
4. Caldera
5. Nido Final
6. Cueva Azul
7. Alien Lab
8. Cumbre
9. Órbita
10. Arrecife Abismo

El Nido final requiere forma 4. El Arrecife funciona como desvío acuático y la Órbita conecta con él mediante vórtice.

## Evolución

La curva absoluta de XP es:

`0 → 55 → 140 → 260 → 420`

Las cinco formas son:

`0 · bebé` → `1 · base` → `2 · evolución` → `3 · forma alta` → `4 · forma final`

La evolución activa una cinemática y efectos visuales propios. Las cinco etapas culminan en formas finales únicas por personaje. La hitbox y el renderer visual permanecen conceptualmente separados.

## Guardado

Save v2 conserva, entre otros:

- personaje e id canónico
- forma y XP
- salud
- sala actual
- salas visitadas
- puntos y bajas
- estado de victoria
- magia y nueve vidas cuando corresponda

Los datos corruptos o incompatibles se descartan de forma defensiva sin romper la partida.

## Renderizado

El arte vectorial vive en:

`characters/art/`

El registro central es:

`characters/art/index.js`

La ruta vectorial es:

`game.js → characters/draw.js → characters/art/index.js → renderer del personaje`

La ruta pintada es:

`characters/draw.js → characters/sprites.js → assets/sprites/bodies/`

La vista por defecto es **vector**.

## Tests

El CI ejecuta **las ocho suites de regresión Node más un E2E real de navegador y el release gate**:

```bash
npm test
npm run test:browser
npm run release:check
```

El E2E real de navegador ejecuta `node tests/browser/e2e.mjs`.
La matriz visual ejecuta `node tests/browser/visual-regression.mjs`.

Las pruebas cubren, entre otras áreas:

- fábrica y comportamiento de enemigos
- RNG inyectable para enemigos y poses, con escenarios reproducibles
- smoke test de los 10 personajes × 5 formas ejecutando realmente cada renderer vectorial
- XP
- roster y aliases
- guardado
- colisiones
- cerebro de enemigos
- audio sin Web Audio
- magia
- partículas
- entrada teclado/táctil
- reloj fijo
- HUD
- habilidades

El pipeline ejecuta las pruebas antes del despliegue de GitHub Pages.

| 04/10 | **Boss Combat Director · Phase 15**: la Reina encadena rutinas de 2–4 ataques según fase y contexto del jugador, evita repetir patrón, reduce la ventana de reacción en la fase final y abre una ventana de castigo claramente telegráfica tras cada cadena; sin cambiar hitboxes ni daño base; caché `ohana-91`. |
| 04/10 | **Boss Reactive Director · Phase 16**: memoria determinista del jugador (dash, aire y presión), selección reactiva por patrón autorizado, desesperación de fase 3 al 22% de vida y recompensa `PUNISH` única durante cada ventana vulnerable; sin alterar daño base ni hitboxes; caché `ohana-92`. |
| 04/10 | **Boss Counterplay · Phase 17**: defensas limpias por DASH/AIRE/DISTANCIA generan racha de respuesta; tres respuestas consecutivas activan `BREAK` y amplían la recuperación vulnerable. La respuesta fallida reinicia la racha solo cuando el jugador estaba realmente expuesto; sin modificar daño base ni hitboxes; caché `ohana-93`. |

| 04/10 | **Boss Adaptive Encounter · Phase 18**: memoria corta de respuestas defensivas, enfriamiento determinista y adaptación de la siguiente preferencia cuando el jugador repite DASH/AIRE/DISTANCIA; la Reina puede marcar CEBO, pero solo selecciona patrones ya autorizados por fase; sin modificar daño, hitboxes ni física; caché `ohana-94`. |\n\n| 04/10 | **Boss Adaptive Bait · Phase 19**: convierte dos respuestas defensivas iguales en un CEBO de un solo uso; la rutina se elige solo entre patrones existentes de la fase y obliga a volver a observar al jugador antes de rearmarse; sin modificar daño, hitboxes, física ni RNG; caché `ohana-95`. |

| 04/10 | **Boss Bait Feedback · Phase 20**: registra el resultado real del CEBO; un CEBO leído reduce el tempo y uno eficaz lo aumenta dentro de ±2, haciendo la siguiente decisión ligeramente más rápida o lenta sin tocar daño, hitboxes, física ni RNG; feedback visual y HUD; caché `ohana-96`. |
| 04/10 | **Boss Encounter Memory · Phase 21**: memoria acotada de ocho observaciones; las respuestas limpias y CEBO leídos relajan el siguiente patrón, mientras fallos y CEBO eficaces elevan la presión hacia rutinas largas. La selección sigue cerrada al repertorio autorizado y no modifica daño, hitboxes, física ni RNG; caché `ohana-98`. |

| 04/10 | **Ability Fix · Kilo + Pizza**: restaurado el impacto funcional de `Giro hula`; Pizza ya no queda secuestrada por el agarre de queso y sus tres habilidades tienen cobertura de impacto; caché `ohana-98`. |
| 04/10 | **Ability Contract Hardening · Phase 22**: `Giro hula` recupera también la reflexión real de proyectiles hostiles durante el aro activo; el rebote es de un solo uso por proyectil dentro de una ventana corta y queda cubierto por regresión; caché `ohana-99`. |
| 05/10 | **Ability Runtime Hardening · Phase 25**: cooldown a 60 Hz, RNG inyectado, VFX deterministas, limpieza de estados, daño seguro y límite de proyectiles; caché `ohana-100`. |
| 05/10 | **VFX Determinism · Phase 26**: pasivos y partículas dejan de consumir `Math.random()`; partículas reproducibles y acotadas a 72, con sanitización numérica y limpieza explícita entre salas/sesiones; caché `ohana-101`. |
| 05/10 | **Combat Mutation Firewall · Phase 27**: daño de enemigos/jugador, XP, puntuación y bajas pasan por mutaciones numéricas seguras; se eliminan operaciones directas susceptibles de propagar `NaN`; caché `ohana-102`. |
| 05/10 | **Runtime Budget + Portal Determinism · Phase 28**: colecciones transitorias acotadas (enemigos/proyectiles/ghosts/orbs), números flotantes limitados a 96 y VFX de portales sin azar ni reloj de pared; caché `ohana-103`. |
| 05/10 | **Runtime Integrity Guard · Phase 29**: saneamiento preventivo de estado crítico y colecciones antes de cada paso de simulación; límites finitos para HP, XP, score, movimiento, proyectiles, enemigos y FX; recompensa `PUNISH` vuelve al guard de puntuación; caché `ohana-104`. |
| 05/10 | **Runtime Fail-Closed · Phase 30**: el bucle principal contiene errores de simulación o render, registra el contexto, limpia input/reloj y pausa de forma segura sin matar el `requestAnimationFrame`; caché `ohana-105`. |
| 05/10 | **CI Hardening · Phase 31**: GitHub Actions usa `actions/checkout@v7` y `actions/setup-node@v7`, con límites de 10 minutos para test y deploy. |
| 05/10 | **RNG Domain Separation · Phase 32**: VFX de celebración, glide, cámara y overlays usan una fuente determinista separada del RNG de simulación; la IA/combate conserva el RNG compartido exclusivamente; caché `ohana-106`. |
| 05/10 | **Deterministic Gameplay Core · Phase 33**: las decisiones jugables de sorpresas y lluvia consumen RNG inyectable de simulación; la convocatoria del Nido abandona `setTimeout` y usa 132 ticks a 60 Hz, pausables y reproducibles; caché `ohana-107`. |
| 05/10 | **Global Mutation Firewall · Phase 34**: HP, XP, score, combo, bajas y escalados de vida críticos se enrutan por `systems/mutations.js`; los sistemas externos dejan de realizar aritmética directa sobre estado crítico; caché `ohana-108`. |
| 05/10 | **Runtime Budget 2 · Phase 35**: presupuestos y compactación de colecciones pasan a `systems/runtime.js`; se acotan `bolts` y `slashes`, y el guard evita asignaciones de arrays innecesarias en el fast path; caché `ohana-109`. |
| 05/10 | **Browser Gameplay E2E · Phase 36**: el E2E de Chromium ejecuta una secuencia real de inicio, habilidad, dash, evolución, sala, lluvia, forma final y boss; verifica daño real y transición a fase 3 mediante el navegador; caché `ohana-110`. |
| 05/10 | **Test Harness Isolation · Phase 37**: la API `window.__OHANA_E2E` solo se expone en `127.0.0.1` con `?e2e=1`; GitHub Pages no la activa aunque se añada el parámetro; caché `ohana-111`. |
| 05/10 | **Mutation Closure · Phase 38**: el último incremento directo de combo pasa al firewall global `systems/mutations.js`; los contadores críticos de gameplay quedan sin aritmética directa externa; caché `ohana-113`. |

## Publicación y caché

GitHub Pages publica desde `main`.

La versión de caché declarada actualmente en `index.html` es:

`ohana-221`

Las referencias documentales se mantienen alineadas con esta versión.

El tacto (ohana-77): el dash es un sprint corto que puedes cortar, el golpe no se lo come el hitstop, pisas al caer y el roce ya no te lanza en bucle.

## Pendiente técnico

La auditoría y el gate actuales no dejan deuda crítica conocida. El mantenimiento futuro queda limitado a extender la cobertura cuando se incorporen nuevas formas, poses, sistemas o superficies de navegador.

## Regla de mantenimiento

Cuando cambien personajes, salas, formas, caché o suites de tests, actualizar en la misma entrega:

`manifest.json` · `README.md` · `PROGRESS.md` · `IMPROVEMENTS.md` · CI

## Phase 41 - Cuerno Paint Closure

- Cuerno incorpora sprites pintados SVG para `idle`, `run`, `jump` y `atk`.
- `characters/sprites.js` usa esta ruta únicamente para Cuerno y conserva PNG para el resto del catálogo.
- El Service Worker precachea las cuatro variantes pintadas.
- La regresión verifica existencia, estructura y contrato de carga de las cuatro poses.
- Cache: `ohana-115`.

## Phase 40 - Cache Graph Closure

- El Service Worker precachea los módulos JavaScript de runtime con la versión de caché actual.
- El pipeline verifica que `index.html` y `sw.js` compartan la misma versión.
- La regresión de hardening comprueba que ningún `.js` de runtime quede fuera del precache.
- Cache: `ohana-115`.

## Phase 39 - Session Reset Closure

- `start()` limpia el estado transitorio antes de iniciar o resumir una partida.
- `summonDelay` se reinicia a `0`.
- Se reinician `doorWait`, `doorHold`, `finale`, `fading`, `flash`, `hitstop` y cámara.
- Se reinician los contadores de fallos de runtime.
- La progresión persistente continúa restaurándose mediante `saveStore`.
- Cache: `ohana-113`.


## Phase 42 - Offline E2E Closure

- El arranque offline se verifica en Chromium después de instalar y activar el Service Worker.
- La prueba recarga sin red y valida DOM, Canvas, control del SW y ejecución real del juego.
- También comprueba que JavaScript, CSS y un asset pintado se sirven desde caché.
- El contrato de precache rechaza entradas duplicadas además de módulos runtime ausentes.
- Cache: `ohana-116`.


## Phase 43 - ESM Dependency Closure

- El CI audita todas las importaciones locales relativas de los módulos JavaScript de runtime.
- Se comprueban rutas directas, sufijo `.js` y `index.js`, rechazando dependencias locales sin destino.
- Cache: `ohana-117`.


## Phase 44 - Save Transaction Closure

- El guardado escribe primero en un staging `ohana.tmp` y solo lo confirma sobre `ohana` después.
- Un fallo de quota/escritura no destruye el checkpoint previo y el staging puede servir como recuperación defensiva.
- Los saves con una versión explícita desconocida se rechazan; v2 sigue siendo el contrato publicado.
- Cache: `ohana-118`.


## Phase 45 - Input Lifecycle Closure

- El estado de entrada se limpia en `blur`, `focus`, `pagehide` y cualquier cambio de visibilidad.
- La limpieza afecta teclado, watchdog y punteros retenidos, sin depender de `keyup`.
- Se mantiene el watchdog de 1200 ms para teclados que pierden su evento de liberación.
- Cache: `ohana-119`.


## Block B - Quality Closure · Phases 46-49

- Phase 46: contratos de diálogo con Escape, foco, inert y restauración del foco de origen.
- Phase 47: presupuestos runtime explícitos y prueba E2E de tiempo de simulación.
- Phase 48: matriz navegador con desktop, touch y reduced-motion.
- Phase 49: conexiones de puertas verificadas como recíprocas a nivel de grafo.
- Cache: `ohana-120`.


## Block C - Determinism Closure · Phases 50-54

- Phase 50: transición verificable de Reina del Nido por umbrales 1→2→3.
- Phase 51: todos los recursos declarados por el Service Worker deben existir físicamente.
- Phase 53: el harness E2E inyecta corrupción numérica y verifica recuperación fail-closed.
- Phase 54: el harness puede fijar una semilla de simulación y exige dos ejecuciones idénticas.
- Cache: `ohana-121`.

- Release Gate: `node tools/release-gate.mjs` / `release:check` antes de publicar.

## V33 · EXPERIENCE
- Cache: `ohana-122`
- Combat feel, movement feedback, dynamic camera, boss presence y evolution presentation.


## V34.1 · EXPERIENCE CRITICAL CLOSURE

- Cámara de juego centrada en el viewport para evitar deriva lateral de mapa y mensajes.
- Intro de la Reina con caída desde arriba, aterrizaje telegráfico y golpe de entrada.
- La Reina derrotada deja de dibujarse desde el primer frame de muerte y no reaparece durante la finale.
- Pizza L queda validada con teclado real y el VFX de Horno soporta el primer frame antes de la actualización de simulación.
- Ocultar la pestaña pausa la sesión actual sin resetear sala, victoria, finale ni progreso persistente.
- Cache: `ohana-126`


## Mundo 1 · contrato de cierre

- Cada sala muestra un objetivo y lo marca hecho al cumplir la salida.
- El claro (S/A/B/C) y el mejor tiempo se guardan en el save v2, sin cambiar la versión.
- El ending nombra al héroe y a su forma. Vector sigue siendo la cara. Pintura es el piloto de Michi/Kilo, opt-in.
- Cache: `ohana-126`.


## Parada

El criterio está en `WORLD-1.md`. Gameplay congelado salvo bug demostrable. Cache `ohana-126`.



## Polish Stabilization 2026-10-06

- La versión publicada queda sincronizada en `ohana-209` entre `index.html`, módulos de portada y Service Worker.
- El carrusel usa un único modelo estructural de tres columnas, con héroe central y laterales contenidos.
- La evolución mantiene el arte orgánico como fuente visual y reduce rayos, anillos, partículas y flash para preservar la silueta.
- Las notificaciones transitorias se limpian al cambiar de sala para impedir acumulación de mensajes fuera de contexto.
- Lilo ya no recibe el halo dorado legado en su forma final.


## Polish Pass 2026-10-06

Arte orgánico como fuente única del héroe, cinemática de evolución limpia, fondos procedurales por defecto, carrusel contenido, controles visibles y robustos, atajo QA Ctrl+Z, rutas de salto suavizadas y atmósfera procedural específica para las 10 salas. Cache: ohana-209.
