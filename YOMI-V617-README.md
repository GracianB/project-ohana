# Yomi V617 — Mejoras Extremas

## Archivos generados

- `yomi-chapter-art-v617.js` — Fauna más limpia, glitch al daño, 10 estrellas familiares en medusa, runas reales, terminales mejorados.
- `yomi-encounters-v617.js` — Layout más largo y táctico: pozos más anchos, puentes de fibra, plataformas escalonadas, fauna con roles claros y mejor distribución.
- `yomi-boss-v617.js` — Custodio del Infinito con 3 fases, telegraphs fuertes, ventanas de vulnerabilidad reales, patrones de ping / scan / red neuronal.
- `yomi-trail-v617.js` — Bits de memoria, antenas de resonancia y base para trampas reactivas.

## Habilidades (recomendaciones de integración)

- **J Ping**: deja rastro de runas que marca enemigos que lo tocan.
- **K Escáner**: limpia trampas de glitch y prolonga la ventana de los terminales.
- **L Síntesis**: contra 2+ marcados lanza un mini-pulso de la red.
- **U**: visual de líneas de código + estrellas familiares. Curación escalada por nodos.
- **Ghost**: al atravesar pozo o trampa deja un eco de datos.

## Dificultad

- Normal: ventanas de terminal de ~55 frames.
- Difícil: ventanas más cortas, fauna más agresiva, custodio con menos frames de exposed.
- XP extra por terminales compilados y por grupos marcados.

## Cómo integrar

1. Copia los archivos a `systems/`.
2. Actualiza las importaciones en el capítulo de Yomi para usar las versiones V617.
3. Ajusta `yomi-room.js` o el autor de encuentros para llamar a `authorYomiEncounters` V617.
4. Conecta los nuevos draw y update en el loop principal.
5. Corre `npm test` y los tests de navegador antes de mergear.

Todo el arte sigue siendo vectorial puro, determinista y sin `Math.random` en dibujo.
