# Ohana 639 · Atlas, interfaz, Kilo y acceso online

Implementa los puntos 2–5 de PLAN-OHANA-EXPERIENCIA.md sobre el rediseño de Quimera de PR #462. Integra también el gato rebelde de #461. No rediseña las otras nueve salas (punto 6).

## Entrada y selección

La portada da acceso a preparar aventura, continuar un guardado válido y elegir Aventura cooperativa o Versus. La historia anterior queda como opción voluntaria. El Atlas separa personaje, destino y forma, con un actor grande, diez botones nativos y una confirmación que resume la elección. Ratón, teclado, mando y táctil navegan sin iniciar accidentalmente la partida.

Sólo ofrece las formas conseguidas por ese héroe: guardado válido, registro persistente de formas o su sello. Las previsualizaciones no conceden progreso. Se inicia con la forma elegida y la cinemática usa esa forma. Los capítulos todavía enseñan habilidades exclusivas de su propietario: cambiar de destino actualiza explícitamente al héroe antes de confirmar. El Corazón exige los diez sellos.

## Interfaz

Vida y evolución compactas; habilidades con iconos, recarga y nombres bajo demanda. Controles completos, mapa, álbum, sonido y pausa viven en un menú. Minimapa opcional. En móvil, movimiento, ataque, esquiva y salto permanecen accesibles; poderes secundarios en un desplegable explícito, interacción contextual y carga de P indicada en el botón de poderes. No se eliminan los atajos existentes.

## Kilo y Claro

Se conservan sus cinco cuerpos articulados; añaden vestuario ligado al cuerpo, cintas, resonador y postura de ataque más plantada. Las notas se dirigen durante levitación desde la segunda forma y durante vuelo solar. Una reflexión al abrir Hula devuelve 900 ms de su recarga una sola vez por danza.

Claro pasa de 14.400 a 9.600 px. Se desplazan juntos soportes, enemigos, instrumentos, coleccionables, secretos y puntos de control, manteniendo sus IDs. Cuatro ambientes, plataformas altas, dos zonas de recarga aérea y un puente que se abre al despertar el bambú. No hay progreso automático. Las cinco especies tienen ventanas explícitas de recuperación después de comprometer un ataque, con señal visual. Tambor conserva sus patrones, con arena ajustada a la nueva ruta.

## Online y publicación

Portada y Atlas separan Aventura y Versus mediante `?mode=...`; el vestíbulo respeta esa intención y conserva invitaciones. Se modernizan vestíbulo, indicadores cooperativos y guía de Versus. La autoridad de combate, invitaciones y sincronización existentes se conservan.

Las comprobaciones de red usan dos navegadores y el servidor HTTP local real; no acreditan una partida entre dispositivos en Internet. La web Netlify observada seguía en ohana-630. Esta rama no se ha desplegado ni fusionado. Se deben publicar los clientes y funciones compatibles juntos después de integrar sus PR dependientes.

Los antiguos V410 y V629 describen el selector retirado. El workflow ejecuta V639 en su lugar: diez héroes, cincuenta formas en una fixture de presentación, bloqueo del progreso no obtenido, entrada real con forma guardada, teclado y tres tamaños de pantalla. Se mantienen las pruebas de combate, campaña y dibujo independientes del selector.
