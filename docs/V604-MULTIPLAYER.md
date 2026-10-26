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

La prueba de navegador comprueba vestíbulo, entrada, relevo y regreso mediante botones móviles, sincronización de un objetivo, rechazo y aceptación del viaje y conservación de héroes. La prueba del objetivo coloca al invitado sobre una nota y ejecuta su intervalo real de interacción; no acredita recorrer el capítulo completo. **No demuestra que los dos jugadores puedan completar juntos toda la campaña.** Falta validar juntos los diez capítulos con sus habilidades, completar la sincronización de los recuerdos físicos del acto final y validar recompensas, derrotas, cinemáticas y desenlace cooperativos. El relevo proporciona acceso a las habilidades obligatorias, pero aún no acredita todos los recorridos.

El transporte HTTP local funciona. En este entorno las ofertas/respuestas WebRTC se intercambian, pero el canal directo no se abre; no se declara validado WebRTC ni rendimiento entre redes. La aventura conserva autoridad del anfitrión para enemigos; Versus utiliza simulación del servidor.

## Evidencia reproducible

```sh
npm test
npm run release:check
npx playwright install chromium
npm run test:browser:adventure-network
npm run test:browser:versus-network
```

Si se usa Chromium del sistema: `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser:versus-network` (igual para aventura). Capturas y registros estructurados en `test-results/v604/`.

- Dos contextos reales Chromium y servidor HTTP real; no se simula `fetch`.
- Versus escritorio/teléfono: movimiento canónico, ataques, cinco especies, estadísticas y reconexión con credenciales renovadas. Sin errores JavaScript.
- Pruebas del servidor: controles ordinarios derrotan fauna, evolucionan y alcanzan tres eliminaciones; repetición de solicitudes no duplica premios. No se atribuye esa partida completa al piloto de navegador.
- Aventura escritorio/móvil: héroes distintos, aislamiento del perfil individual, relevo voluntario y regreso, objetivo completado por el invitado y recibido por el anfitrión, rechazo y viaje aceptado por ambos. Las esperas de estado del arnés son síncronas; no se aceptan promesas sin verificar la condición.

Antes de publicar: completar los bloqueos cooperativos, evaluar dificultad y equilibrio PvP con personas, latencia/pérdida de conexión, accesibilidad y dispositivos físicos. La infraestructura pública seguirá apagada hasta una decisión expresa del usuario.
