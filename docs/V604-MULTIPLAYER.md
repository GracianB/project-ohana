# OHANA V604 · Multijugador local

Estado: candidato en PR #441, no publicado. Netlify sigue pausado por petición del usuario. No se han activado servicios pagados ni conexión pública. La campaña individual conserva su recorrido y guardado.

## Probar en este entorno

```sh
npm ci --no-audit --no-fund
npm run dev:multiplayer
```

Abrir http://127.0.0.1:4173/multiplayer.html en dos ventanas o perfiles de navegador. Crear una sala, elegir modo/personaje, compartir el código y confirmar ambos personajes. El servidor utiliza memoria local; cerrar el proceso elimina las salas. No usa Netlify ni TURN. El puerto predeterminado es 4173 (`PORT` permite cambiarlo). La escucha está limitada a este equipo; aún no es una prueba entre dispositivos de redes distintas.

## Versus jugable en local

- Diez héroes con vida, velocidad y saltos propios; elección entre diez escenarios temáticos. La arena es un tramo de combate, no el capítulo completo.
- Cinco especies, guardián con sus técnicas, experiencia al derrotarlos y cinco formas. Criatura +35 XP, guardián +180, rival +150. Gana quien consigue tres eliminaciones del rival.
- El servidor calcula movimiento, daño, enfriamientos, muertes, recompensas, evolución y resultado. El navegador envía controles; no puede concederse XP ni declarar una victoria.
- H cuerpo a cuerpo; J proyectil (Dino combina mordisco y proyectil); K/L habilidades temáticas; U compañero durante ocho segundos; I/P desbloqueadas al evolucionar. Este kit de arena adapta las habilidades individuales: todavía no reproduce todos sus combos y mecánicas.
- Teclado A/D, W o espacio para saltar, H/J/K/L/U/I/P y Mayús; controles táctiles. Estadísticas propias, evolución y marcador visibles.
- Reconexión con renovación de credenciales; pausa cuando falta el rival. Salir permite volver al vestíbulo; no existe todavía una votación de revancha.

## Aventura: transporte probado, campaña cooperativa en desarrollo

Dos navegadores entran con héroes distintos y conservan sus personajes. El cambio de sala adyacente requiere propuesta autenticada y aceptación del compañero. Rechazar, caducar a los 25 segundos o desconectarse cancela la propuesta. La respuesta de cada mutación actualiza inmediatamente el estado del diálogo; un rechazo permite volver a proponer. La partida compartida no sobrescribe el checkpoint individual. Sellos, descubrimientos, álbum y recuerdos utilizan almacenamiento temporal de la sesión cooperativa: no importan los desbloqueos individuales ni los modifican.

### Objetivos compartidos

Los movimientos existentes transportan los objetivos completados; no se añade una llamada de red por cada fotograma. El servidor autentica al emisor, limita los identificadores a la sala actual y conserva una unión monotónica. Ambos jugadores pueden aportar estaciones y descubrimientos. Los recibos de encuentros y el sello son exclusivos del anfitrión; el invitado espera su confirmación. Aplicar una confirmación no vuelve a conceder puntos, vida ni XP. El estado confirmado vuelve a aplicarse tras entrar en una sala o reintentar.

Esta aventura conserva el modelo de confianza del motor cooperativo: el anfitrión resuelve los encuentros y cada cliente ejecuta sus puzles. No se presenta como una simulación física autoritativa del servidor, que sí existe en Versus.

### Relevo voluntario para las habilidades de sala

En la entrada o junto a un objetivo completado se puede usar al héroe propietario de la sala y volver al personaje elegido. No hay cambio obligatorio al cruzar. El servicio solo permite esos dos personajes, requiere estar en tierra y comprueba el punto de relevo. Conserva vida, evolución y XP de cada héroe; alternar no cura al personaje anterior. Los enfriamientos y la carga se conservan en el cliente durante la sesión. Los paquetes de posición del personaje anterior se rechazan mediante una época de relevo.

El panel espera tanto la posición local como la confirmada por el servidor; se oculta durante las cinemáticas y cuando no hay otro personaje disponible. El indicador de conexión vive dentro del HUD, sin tapar el título o la vida.

La prueba de navegador comprueba vestíbulo, entrada, relevo y regreso mediante botones móviles, sincronización de un objetivo, rechazo y aceptación del viaje y conservación de héroes. La prueba del objetivo coloca al invitado sobre una nota y ejecuta su intervalo real de interacción; no acredita recorrer el capítulo completo. **No demuestra que los dos jugadores puedan completar juntos toda la campaña.** Falta validar juntos los diez capítulos con sus habilidades mediante recorrido completo. El acto final ya dispone de sincronización y prueba de integración aislada, descrita abajo; esa prueba no acredita una campaña cooperativa continua. El relevo proporciona acceso a las habilidades obligatorias, pero aún no acredita todos los recorridos.

El transporte HTTP local funciona. En este entorno las ofertas/respuestas WebRTC se intercambian, pero el canal directo no se abre; no se declara validado WebRTC ni rendimiento entre redes. La aventura conserva autoridad del anfitrión para enemigos; Versus utiliza simulación del servidor.

## Derrota, conexión y reintento conjunto

Una derrota abre un nuevo intento de sala autenticado. Ambos héroes quedan caídos y la escena de muerte prepara su confirmación; R permite solicitar el reintento antes. Nadie reaparece hasta que los dos están preparados y conectados. Pulsar R estando vivo no cura ni reinicia la sala. La entrada o el último objetivo completado determinan el punto común; el acto final usa la entrada de la arena.

Se conservan estaciones, descubrimientos, héroes, evolución, XP y rescates confirmados. El duelo pendiente se reinicia; un recuerdo ya recuperado no vuelve a perderse ni a premiarse. Durante la derrota se cierran las cinemáticas de habilidades/evolución y se cancela cualquier viaje pendiente.

Cada intento tiene un número que acompaña movimientos, ataques, efectos, mensajes directos y propuestas de viaje. Los paquetes del intento anterior se descartan: no pueden matar de nuevo a un héroe recién recuperado ni sobrescribir su posición. Si se pierde la primera comunicación de la muerte, el cliente la vuelve a notificar al recuperar la conexión. Una desconexión revoca las confirmaciones de reintento pendientes.

El motor se pausa al detectar la pérdida de conexión propia o la desconexión del compañero y se reanuda con su sesión autenticada. El aviso de ausencia del compañero sigue dependiendo de la comunicación del servidor; el vencimiento por inactividad utiliza el plazo existente de 15 segundos. No se promete detección instantánea entre redes.

Las ventanas de vulnerabilidad y las fases de los minijefes también llegan al invitado. Sus golpes respetan el presupuesto de daño del anfitrión: ver una apertura tiene efecto real y no permite saltarse una defensa cerrada.

Evidencia local: muerte preparada en una sala con un objetivo ganado, pérdida inicial de red y reintento automático; pausa de un encuentro final durante una desconexión real del contexto del navegador; recuperación autenticada, derrota compartida, reintento del guardián pendiente y conservación de nueve rescates. Son escenarios aislados de integración, no un recorrido cooperativo continuo.

## Acto final compartido

El anfitrión publica el guardián activo, su apertura de daño, Quimera, sus proyectiles y los rescates confirmados. El invitado conserva su héroe y refleja el mismo encuentro; no inicia otro guardián, otra IA de Quimera ni un desenlace independiente. Cualquiera de los dos puede tocar físicamente el recuerdo liberado. Los recibos deben avanzar en el orden de los diez héroes y no se aceptan saltos de rescates o un guardián vivo. Una nueva confirmación paga la celebración común una vez; cargar un recibo antiguo no vuelve a premiarlo.

Las escenas de presentación, rescate, Quimera y final tienen un identificador estable. Al terminarlas, cada jugador confirma su lectura; el último plano muestra «Esperando al compañero» hasta que ambos terminan. Las escenas ya liberadas se recuerdan para no atrapar a quien las acaba más tarde. Las escenas pendientes usan la cola existente y los resultados esperan al cierre de la última. No se guarda una victoria cooperativa como récord individual.

Las recargas del anfitrión restauran el encuentro y los rescates de la sala; las del invitado recuperan la misma escena pendiente. Se conserva el perfil individual. El estado de derrota es del anfitrión; cada navegador emite un solo resultado después del final compartido. El retrato final utiliza al compañero real cuando los héroes son distintos. Los resultados cooperativos ofrecen volver al vestíbulo y no permiten reiniciar unilateralmente Quimera ni abrir la selección individual.

Prueba `test:browser:finale-network`: dos navegadores reales, uno con pantalla móvil. Parte de un estado de prueba con nueve rescates previos y pone a cero la vida del último guardián y de Quimera para aislar la transición. El invitado recoge el último objeto por contacto, ambos completan las escenas, recargan en mitad del encuentro y reciben los diez recuerdos en el resultado. **No es una prueba de dificultad, de los diez duelos cooperativos ni del recorrido completo desde Kilo.** Los diez recibos, las aperturas y el orden se comprueban también por pruebas de reglas. La campaña individual completa se vuelve a comprobar con controles físicos.

## Evidencia reproducible

```sh
npm test
npm run release:check
npx playwright install chromium
npm run test:browser:adventure-network
npm run test:browser:versus-network
npm run test:browser:finale-network
```

Si se usa Chromium del sistema: `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser:versus-network` (igual para aventura). Capturas y registros estructurados en `test-results/v604/`.

- Dos contextos reales Chromium y servidor HTTP real; no se simula `fetch`.
- Versus escritorio/teléfono: movimiento canónico, ataques, cinco especies, estadísticas y reconexión con credenciales renovadas. Sin errores JavaScript.
- Pruebas del servidor: controles ordinarios derrotan fauna, evolucionan y alcanzan tres eliminaciones; repetición de solicitudes no duplica premios. No se atribuye esa partida completa al piloto de navegador.
- Aventura escritorio/móvil: héroes distintos, aislamiento del perfil individual, relevo voluntario y regreso, objetivo completado por el invitado y recibido por el anfitrión, rechazo y viaje aceptado por ambos. Las esperas de estado del arnés son síncronas; no se aceptan promesas sin verificar la condición.

Antes de publicar: completar el recorrido cooperativo continuo y ampliar derrota/reintento a las diez salas y las cuatro fases de Quimera, evaluar dificultad y equilibrio PvP con personas, latencia/pérdida de conexión, accesibilidad y dispositivos físicos. La infraestructura pública seguirá apagada hasta una decisión expresa del usuario.
