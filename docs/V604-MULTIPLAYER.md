# OHANA V604 · Multijugador: contratos y criterios de aceptación

## Aventura compartida
Dos jugadores permanecen en el mismo capítulo. Si alguien intenta cruzar una puerta o portal, solicita cambiar a una sala **adyacente**, y el otro jugador recibe un diálogo claro con la sala de destino. El proponente queda confirmado automáticamente; el segundo debe aceptar. Rechazar cancela; pasados 25 segundos caduca. Si uno se desconecta, ningún cliente debe mover al otro en silencio. La confirmación definitiva ha de producirse **en el servidor autenticado**, no por dos mensajes de navegador sin autoridad. Solo entonces se cambian las salas de ambos.

### HUD
Ambos ven nombre de héroe, forma evolutiva (1–5), salud, experiencia, capacidad J/K/L y estado de su compañero. El mapa y el próximo objetivo son comunes; la salud, las habilidades y los XP pueden ser individuales, según modo. Evitar duplicar premios al reconectar.

## VERSUS con criaturas
Cada jugador elige uno de los diez personajes y se selecciona una de las diez salas de héroes como arena. Gana el primero en conseguir tres eliminaciones del rival. La fauna y el minijefe sirven para evolucionar, no sustituyen la victoria frente al otro jugador. Las recompensas de referencia son: enemigo +35 XP, élite +70, minijefe +180 y rival +150. Cinco formas progresivas. Cambios de salud, XP, derrotas y vencedor requieren resolución del servidor; **el navegador no puede declarar que ha matado un enemigo para obtener XP**.

## Lo realizado
- `multiplayer/match-rules-v604.js`: reglas puras de arenas, evolución, puntuación, deduplicación de eventos, voto por sala y caducidad.
- Pruebas automáticas de consentimientos, XP y límites.

## Lo que aún bloquea la publicación en línea
La infraestructura pública de señales/Netlify está pausada por el límite de créditos; la implementación de red autoritativa y sus pruebas con **dos navegadores/dispositivos reales**, reconexión, latencia, doble muerte, pérdida de conexión, desincronización y accesibilidad no están terminadas. No publicar el modo VS como jugable ni activar solicitudes pagadas solo por tener los botones diseñados.

## Gate 1 de noviembre
Mantener el modo individual publicable aunque el multijugador siga en beta. Ningún cambio en este archivo autoriza a declarar los dos modos online completos.

## Integración V604 en PR #441
El servidor Netlify almacena la propuesta de cambio en una mutación autenticada y coherente; bloquea movimientos y señales de sala que intenten saltarse la votación. Ambos jugadores aceptan o rechazan con el panel de estado y personaje; la aceptación completa mueve a los dos. El cliente aún requiere prueba en dos navegadores reales, recuperación ante desconexiones y verificación de servidor desplegado. VS sigue como contrato de combate, no jugable en línea.
