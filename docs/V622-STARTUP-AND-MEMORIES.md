# V622 · inicio fiable y recuerdos con identidad

Base publicada: V621 (`0dd2b51`). Se conservan salas, héroes, ataques, evoluciones, enemigos, minijefes, selector, escenas Canvas y campaña de esa versión.

El título dependía de que terminara el grafo de módulos: al retrasar `game.js` el navegador quedaba con `intro-pending` y un contenedor vacío. Una descarga fallida también podía dejar una bienvenida sin selector. El estado de carga se pinta desde el HTML y su controlador es inline, sin otra descarga de JavaScript. A los quince segundos ofrece esperar o reintentar; un error del motor o del título ofrece el reintento inmediatamente. El reintento lo decide el jugador y solo recarga la página. No borra almacenamiento ni inicia peticiones a Netlify. Se retira al estar preparados los diez retratos y sus controles; restaura el foco y libera los controles que había bloqueado.

La entrada descartaba Enter antes del primer fotograma de la bienvenida. La prueba reproduce ese instante con el reloj de animación detenido: un único Enter debe llevar a selección y no puede iniciar también la partida. La prueba falló antes de quitar esa restricción y pasa con la corrección. No se atribuye a esta causa, sin más evidencia, el primer timeout público registrado en V621.

## Recuerdos

Las posiciones heredadas situaban dieciséis objetos dentro del margen de las grietas nuevas. Solo esas posiciones cambian: se elige un apoyo seguro de su misma página. Los otros 984 objetos conservan sus coordenadas. Los mil IDs, las diez páginas por héroe, las recompensas y las marcas guardadas se mantienen. Recolocar un objeto ya ganado no paga otra recompensa.

| Héroe | Recuerdo |
| --- | --- |
| Kilo | Su pétalo original, conservado |
| Stitcho | Engranaje de la nave |
| Chispín | Bobina de tormenta |
| Michi | Perla de sueño con filamentos |
| Cuerno | Lazo de aurora |
| Dragón | Llama ancestral |
| Dino | Ámbar fósil |
| Frita | Frasco de especias |
| Pizza | Tomate de albahaca |
| Yomi | Farol de memoria |

Son dibujos Canvas ejecutados durante la partida. La galería PNG es evidencia de revisión; no se incorpora como recurso del juego. Los contornos se comprueban a tamaño de juego sobre fondos claros y oscuros. El movimiento reducido congela el balanceo y los destellos de reto se dibujan sin parpadeo. El álbum nombra el objeto de cada héroe y distingue recuerdos, cristales de XP y mecanismos del sello.

La recogida física usa el respaldo ganado al completar la campaña V621. Se retoman los capítulos con sus formas ya ganadas, sin conceder posiciones, objetos, XP, invulnerabilidad ni victorias. El controlador de prueba se corrigió para respetar la bajada voluntaria y leer los suelos actuales, en lugar de los metadatos de composición anteriores a las últimas salas. Se reanudó desde puntos ganados al corregir esa guía; no se presenta como una ejecución continua sin reanudaciones.

Las comprobaciones de arranque y siluetas se añaden a Quality. Evidencia, etapas y límites: `V622-VALIDATION.json`. La campaña completa y el cooperativo de V621 siguen siendo evidencia histórica de esa base, no nuevas ejecuciones atribuidas a V622. Netlify continúa pausado.
