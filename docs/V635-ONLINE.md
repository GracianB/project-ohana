# V635 · El multijugador también se encuentra desde GitHub

La portada de GitHub mantenía oculto y deshabilitado el botón de dos jugadores. La entrada directa a su `multiplayer.html` mostraba el antiguo aviso de pausa porque GitHub Pages no ejecuta las Functions de Netlify. El despliegue de GitHub del commit 6857a10 estaba aprobado: el fallo era de acceso y origen del cliente, no una ausencia del código V634.

## Cambio

La bienvenida Canvas ofrece «2 jugadores · Online», también accesible con Tab y Enter. El selector conserva un enlace visible «2 jugadores · Aventura y Versus». Ambos abren el vestíbulo público de Netlify en la misma pestaña.

Al abrir directamente `multiplayer.html` en GitHub Pages, un arranque pequeño lleva al host fijo de Netlify conservando consulta e invitación, sin cargar los clientes de la API sobre GitHub. Netlify, sus previews y localhost conservan su origen, sus sesiones y el orden de inicialización. El vestíbulo indica que está cargando y solo habilita sus controles al quedar preparado; ofrece reintento si una descarga falla.

Se conservan las mejoras del usuario hasta 6857a10: vestíbulo, idiomas, invitaciones, restauración de sesión, retratos y optimizaciones de Versus. No se modifica el servidor, la facturación, las reglas, el arte de héroes ni los guardados. La caché pasa a `ohana-635` y el cliente de vestíbulo a `ohana-coop-9`.

## Publicación y concurso

Entrada general: https://gracianb.github.io/project-ohana/?release=635

Entrada multijugador: https://project-ohana-multiplayer.netlify.app/multiplayer

La comprobación de GitHub y los tests de navegación no demuestran una partida remota en Netlify: el acceso de este entorno al host sigue bloqueado con un error de túnel 403. En los tests del destino se intercepta la navegación; no se presenta ese resultado como transporte remoto validado.

La URL guardada en SME/Handshake y el estado de su entrega no son accesibles desde aquí. Se ha pedido al usuario el enlace para compararlo. No se envía otra candidatura ni se cambia una entrega sin comprobarla.

Resultados efectivos: [validación](V635-VALIDATION.json) y [publicación](V635-PUBLICATION.json).
