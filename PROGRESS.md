# PROJECT OHANA · Progreso

Última actualización: 24/09/2026 (pass Grok)

## Hecho

| Fecha | Qué |
|---|---|
| 24/09 | **makeFoe extraído** a `engine/foes.js`. Hitstop + cámara de director en el Nido. Rig vectorial crawler/flyer/brute. Elenco completo activo. Arte `kilo.js` / `chispin.js` (alias). |
| 24/09 | **Arreglo integral**: exports rotos, loader infinito, Continuar. Limpieza de módulos huérfanos. |
| 24/09 | **Personajes vectoriales animados** (`characters/rig.js` + `characters/art/*.js`). |
| 24/09 | **Michi kawaii**, SFX, intro/evo. |
| 24/09 | **Punto 1 · Música**: 11 temas procedurales. |
| 24/09 | **Punto 3 · Jefe**: Reina del Nido vectorial en 3 fases. |

## Personajes

- **Activos**: Kilo, Stitcho, Chispín, Michi, Dragón, Dino, Frita, Pizza.
- Ids internos se mantienen (`lilo`, `pikachu`, …) para no romper saves. Ficheros alias: `kilo.js`, `chispin.js`.

## Hoja de ruta (los 7 puntos)

| # | Punto | Estado |
|---|---|---|
| 1 | Música de fondo por mundo y jefe | ✅ Hecho |
| 2 | Recuperar a Kilo, Dragón y Pizza | ✅ Hecho |
| 3 | Jefe final vectorial, 3 fases | ✅ Hecho |
| 4 | Enemigos animados al nivel de los personajes | 🟡 3 arquetipos |
| 5 | Móvil de verdad | ⬜ Pendiente |
| 6 | Más contenido | ⬜ Pendiente |
| 7 | Pulido (hitstop, cámara, combos) | 🟡 hitstop + cam Nido |

## Cómo trabajar

- Copia local: `X:\GitHub\project-ohana`.
- Galería: `gallery.html` y `gallery.html?id=<id>`.
- Mapa del código: `systems/README.md`.
- Cache bust en `index.html`: ahora `ohana-24`.
