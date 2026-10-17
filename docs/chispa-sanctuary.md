# Chispa: santuario del trueno — v429

## Progresión

| Forma | Vida | Velocidad | J: blancos | J: alcance | K: distancia |
|---|---:|---:|---:|---:|---:|
| Bebé | 82 | 4,8 | 2 | 270 | 145 |
| Chispa | 102 | 5,4 | 3 | 310 | 170 |
| Kirin | 128 | 6,1 | 4 | 340 | 198 |
| Asceta | 156 | 6,6 | 5 | 370 | 218 |
| Raijin | 200 | 7,6 | 5 | 400 | 240 |

J aplica una marca de 150 ticks únicamente al acertar. La L busca primero marcas vivas dentro de 700 px, prepara el impacto durante siete ticks y consume la marca con un multiplicador 1,2. El daño final sigue sujeto al redondeo y las defensas del motor. No acumula santuarios al recastear. K conserva la estela dañina y gana evasión progresiva sin mostrarla como daño sufrido.

## Actuación

Las cinco anatomías conservan su atlas. El espíritu, asceta y serpiente levitan; Kirin apoya cuatro patas. Se añaden respiración, impulso de carrera, preparación y recuperación de golpe, inclinación en el aire y celebración. El modo de movimiento reducido mantiene una pose estable. Los efectos no cambian la anatomía, los colliders ni los estados de combate.

La bienvenida conserva sus tiempos de conversación y añade el ritual eléctrico. La intro personal canaliza el rayo. El final usa conductores, sellos y un remate eléctrico, con más separación entre héroe y compañero. La L tiene un timbre propio: tonos de cristal, descarga breve y trueno grave.

Como invitado de cualquier héroe, Chispa prepara un sello y descarga en tres tiempos. La zona anunciada sigue siendo la zona real de daño. El dúo canónico de Stitcho conserva su ataque de caos y sus blancos reales; el invitado ya no cabalga una nube. Si es sorpresa, dura 360 ticks con una vuelta por la pantalla, broma y despedida; después del tick 90 no añade golpes. Las réplicas no reciben daño, marcas ni referencias a enemigos.

Pruebas: simulación de marcas/consumo/recasteo, vida de la sorpresa y réplica; todos los tests Node; 345 escenas de invitado; bienvenida, intro y final reales; tamaños y poses; juego offline de escritorio/móvil. Capturas en test-results/chispa-sanctuary/. Sin despliegue ni merge.
