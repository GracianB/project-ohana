# V621 · revisión integrada de V607–V620

Base: `6c23e0a`. Se conserva el trabajo reciente de main; no se integra por encima la antigua rama V607, que contenía autores de sala alternativos.

| Entrega | Revisión |
| --- | --- |
| V607 Stitcho | El jefe se crea en la arena definida por la sala. El progreso depende de módulo inicial, raíl, segundo módulo y reparación final; la quinta forma se alcanza antes del jefe. |
| V608 Chispín | Autor, antenas, arcos, fauna y controlador del Titán conservados. |
| V609 Michi | Autor, medusas, puentes y animaciones recientes conservados. Patas afinadas y pies más pequeños; la cuarta forma comparte la paleta de nácar de la medusa. |
| V610 Cuerno / V611–V612 Dragón / V613 Dino | Salas, repertorios, venas y alas de Dragón, fauna colosal, meteoros, calor de caldera, arte y controladores conservados; sus recuperaciones dejan de recibir un segundo presupuesto de daño del controlador compartido. |
| V614 Frita / V615 Pizza / V616 Yomi | Se conserva su integración existente. Corrección del mismo presupuesto compartido en los jefes. |
| V617 alternativa de Yomi | Revisada como propuesta inactiva: el README pide integración y `updateYomiTrailV617` aún es un cuerpo vacío. No se activa una función sin implementar ni se presenta como experiencia terminada. |
| V618 final / V619 intro / V620 selección y pausa | Espejos, familia visible y menú ancho conservados. La auditoría de navegador exige ahora diez actores visibles conforme al diseño de V619. |

Los enemigos con una banda aérea declarada mantienen el vuelo, incluidos los tiradores; los terrestres conservan la gravedad. Hay pruebas que recorren las siete familias de jefes y verifican que consumir daño en el primer fotograma de recuperación no reponga el presupuesto en el siguiente.

El cuarto fósil de Dino estaba dentro de la tercera grieta. La grieta termina ahora antes de la zona de aterrizaje y una prueba exige suelo sólido y ausencia de peligros bajo todas las placas. Dino conserva las plataformas de aproximación, pero sus estantes dejan libre la vertical de caída de cada fósil. La activación se resuelve una sola vez en el controlador común, que registra el identificador persistente y la recompensa. La prueba comprueba la recarga del guardado y el descenso físico, además del recorrido con controles táctiles.

La caché pasa de `ohana-606` a `ohana-621`, con hashes regenerados. Los recursos nuevos siguen incluidos y cada versión mantiene su caché independiente.

La evidencia de cada ejecución y sus límites se registra en `V621-VALIDATION.json`. Las pruebas automáticas acreditan ejecución, progresión y persistencia; la dificultad y la dirección artística requieren valoración jugando. Netlify permanece pausado.
