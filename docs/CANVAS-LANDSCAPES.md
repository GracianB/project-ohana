# Paisajes Canvas del candidato V604

Se retira la capa que cargaba nueve `*-realm.webp` y `observatory-keyart.png`. Los diez archivos, unos 7,3 MiB, salen del repositorio y de la descarga offline. Portada y selección recuperan su escenario construido por código; no esperan la descarga de una imagen para sustituirlo. Kilo conserva su paisaje y Versus utiliza ahora también ese jardín cuando se elige Claro.

`worlds/living-realms.js` dibuja los otros nueve capítulos y Corazón de Ohana mediante curvas, gradientes, geometría detallada y textura generada por código. Tres capas tienen desplazamientos independientes con la cámara; nubes, agua, partículas, maquinaria y anillos se dibujan aparte con su propio tiempo. El movimiento reducido congela ese tiempo. El dibujo no modifica colisiones, plataformas, enemigos, XP ni reglas de campaña.

| Sala | Construcción visual |
| --- | --- |
| Stitcho | Costa nocturna, talleres, antenas, grúas, cápsulas y luces sobre el agua. |
| Chispín | Acueductos entre nubes, colectores de tormenta y mecanismos de cobre. |
| Michi | Jardín lunar, setas, pétalos, reflejos y santuario de loto. |
| Cuerno | Bosque luminoso, raíces, cascadas, prismas y arcos de aurora. |
| Dragón | Cordillera volcánica, roca estratificada, lava y puertas fósiles aladas. |
| Dino | Helechos, cascadas, costillas articuladas y un santuario de huevo. |
| Frita | Mercado elevado, toldos, calderos y columnas de vapor. |
| Pizza | Pueblo en terrazas sobre tierra visible, vegetación y hornos de leña. |
| Yomi | Archivo celeste, observatorios, cintas y mecanismos orbitales. |
| Final | Santuario común, diez emblemas, escalinatas y gran observatorio. |

Las capas estáticas se pintan en canvases auxiliares y se reutilizan para no reconstruir miles de trazos en cada fotograma. No son archivos de imagen ni ilustraciones importadas. La caché conserva como máximo dos entradas; la prueba comprueba el tamaño RGBA estimado de sus superficies, no el consumo total del navegador ni de la GPU.

## Comprobación

`npm run test:browser:living-realms` recorre los diez paisajes con cámara y tiempo distintos, comprueba movimiento reducido, limita la caché, toma vistas móviles y carga los once escenarios en el motor real contando Claro. La portada y la selección quedan cubiertas también por la auditoría general del navegador. La antigua galería V602 delega ahora en esta prueba: ya no exige descargar WebP.

Son fixtures visuales de posición y evolución; no representan otra campaña ganada ni una prueba de dificultad. Los tiempos registrados corresponden al envío de órdenes Canvas con caché caliente, no a FPS del juego completo ni a dispositivos físicos. Capturas e informe: `test-results/v605/`.

Galería interactiva sin capturas incrustadas: con el servidor local en marcha, abrir `/previews/living-realms.html`. Permite elegir las once salas, recorrer el paisaje con la cámara y congelar la animación. El archivo usa el mismo dibujante que el juego, no otra ilustración de presentación.

## Segunda revisión en móvil y altura

Los ganchos de Stitcho y los anillos de Chispín, Yomi y Corazón comparten ahora los anclajes, la repetición y la profundidad de cámara de sus estructuras. Se corrige el desfase producido al escalar la pantalla o ascender por la sala. Los grandes grupos de arquitectura se ajustan al ancho repetido de la capa para que no se corten al cambiar de tramo.

La resolución interna de las capas considera también el área de la pantalla. En la prueba de 390 × 844, dos entradas de retrato pasan de 38.880.000 a 21.870.000 bytes RGBA estimados (44 % menos). Al conservar temporalmente una entrada de escritorio y otra de retrato se miden 30.375.000 bytes. No son cifras de memoria total del navegador ni una promesa de FPS.

La galería comprueba los diez paisajes con alturas de cámara 0, 400 y 850, y captura ahora las once salas dentro del juego tanto en escritorio como en móvil. La vista interactiva añade un control de altura para revisar esas transiciones manualmente.
