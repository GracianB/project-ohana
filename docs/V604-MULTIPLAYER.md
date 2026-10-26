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

Dos navegadores entran con héroes distintos y conservan sus personajes. El cambio de sala adyacente requiere propuesta autenticada y aceptación del compañero. Rechazar, caducar a los 25 segundos o desconectarse cancela la propuesta. La respuesta de cada mutación actualiza inmediatamente el estado del diálogo; un rechazo permite volver a proponer. La partida compartida no sobrescribe el checkpoint individual.

La prueba de navegador comprueba vestíbulo, entrada, rechazo y aceptación del viaje y conservación de héroes. **No demuestra que los dos jugadores puedan completar juntos toda la campaña.** Faltan compartir el estado de objetivos, puzles y recuerdos, resolver habilidades obligatorias cuando no está el héroe de la sala y validar recompensas y final cooperativos.

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
- Aventura: héroes distintos, guardado individual conservado, rechazo y viaje aceptado por ambos.

Antes de publicar: completar los bloqueos cooperativos, evaluar dificultad y equilibrio PvP con personas, latencia/pérdida de conexión, accesibilidad y dispositivos físicos. La infraestructura pública seguirá apagada hasta una decisión expresa del usuario.
