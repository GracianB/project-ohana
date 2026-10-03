# PROJECT OHANA · Progreso

Última actualización: 03/10/2026

## Hecho

| Fecha | Qué |
|---|---|
| 03/10 | Simulación fija a 60 Hz; módulos de reloj, entrada y diálogos; guardado periódico y en victoria/menú/pausa; controles táctiles con E; título visible, HUD accesible y foco de diálogos; final y evolución reutilizan sus capas; pruebas de regresión y CI antes de publicar. |
| 24/09 | **Fábrica** `engine/foes.js` (makeFoe fuera de game.js). Hitstop, vibración, cámara de director en el Nido. Rig crawler/flyer/brute. Save v2 (hp, nueve vidas, magia, kills). Ids `kilo` / `stitcho` / `chispin` con migración de saves viejos. XP del README alineada (`55 → 140 → 260 → 420`). Tests `node --test tests/core.test.js`. Móvil: botón bajar + layout vertical. |
| 24/09 | Arreglo integral: el juego vuelve a cargar. |
| 24/09 | Personajes vectoriales, música procedural, Reina del Nido. |

## Personajes

- Activos: Kilo, Stitcho, Chispín, Michi, Dragón, Dino, Frita, Pizza, Yomi, Cuerno.
- Saves antiguos (`lilo`, `stitch`, `pikachu`) se leen solos.

## Tests

```bash
node --test tests/core.test.js
```

Cache: `?v=ohana-25` en index.html.
