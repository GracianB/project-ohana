# PROJECT OHANA · Progreso

Última actualización: 24/09/2026

## Hecho

| Fecha | Qué |
|---|---|
| 24/09 | **Arreglo integral**: el juego volvía a no cargar (exports rotos en `sprites.js`), loader infinito, Continuar desactivado. Limpieza de 25 módulos huérfanos y scripts `APPLY-*.ps1`. |
| 24/09 | **Personajes vectoriales animados** (`characters/rig.js` + `characters/art/*.js`): 8 personajes × 5 formas, animaciones propias, 3 habilidades únicas + pasivo por personaje, 6 objetos mágicos, cinemática de evolución central, portada centrada, intro nueva. |
| 24/09 | **Michi kawaii** (rediseño completo), **efectos de sonido** (~60, `engine/audio.js`), intro y evolución +1 s, Stitcho y Chispín diferenciados. |
| 24/09 | **Punto 1 · Música**: 11 temas procedurales (`engine/music.js`) por mundo, jefe (2 intensidades) y victoria. |
| 24/09 | **Punto 3 · Jefe**: Reina del Nido vectorial en 3 fases con poses por ataque y entrada cinematográfica (`engine/boss-art.js`); cámara que encuadra jefe y jugador. |

## Personajes

- **Activos**: Michi, Stitcho, Chispín, Dino, Frita.
- **Listos pero ocultos**: Kilo (`lilo`), Dragón (`dragon`), Pizza (`pizza`). Se activan añadiendo su id a `ACTIVE` en `characters/roster.js`.

## Hoja de ruta (los 7 puntos)

| # | Punto | Estado |
|---|---|---|
| 1 | Música de fondo por mundo y jefe | ✅ Hecho |
| 2 | Recuperar a Kilo, Dragón y Pizza (repasar y activar) | ⏳ Siguiente |
| 3 | Jefe final vectorial, 3 fases, entrada cinematográfica | ✅ Hecho |
| 4 | Enemigos animados al nivel de los personajes | ⬜ Pendiente |
| 5 | Móvil de verdad (botones táctiles, vibración, vertical) | ⬜ Pendiente |
| 6 | Más contenido (mundo 2, secretos, coleccionables, logros, estadísticas) | ⬜ Pendiente |
| 7 | Pulido de sensación de juego (pausa de impacto, cámara, combos, transiciones) | ⬜ Pendiente |

## Cómo trabajar

- Copia local de referencia: `X:\GitHub\project-ohana` (se sube desde ahí con `git add -A`, `git commit`, `git push`).
- Revisar personajes: `gallery.html` (todas las formas) y `gallery.html?id=<id>` (5 formas × 14 estados).
- Mapa del código: `systems/README.md`.
- Al tocar CSS/JS de entrada, subir `?v=ohana-NN` en `index.html` (ahora `ohana-23`).
