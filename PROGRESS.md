# PROJECT OHANA · Progreso

Última actualización: 04/10/2026

## Estado actual

Project Ohana es una demo jugable en navegador de plataformas 2D sobre Canvas, con:

- **10 personajes activos**
- **5 formas por personaje**
- **10 salas**
- **1 jefe final: la Reina del Nido**
- **3 habilidades por personaje (J / K / L)**
- **guardado v2**
- **simulación fija a 60 Hz**
- **GitHub Pages + CI**

## Hecho

| Fecha | Qué |
|---|---|
| 04/10 | Auditoría de coherencia del proyecto. Manifest alineado con 10 personajes, 5 formas y 10 salas. Documentación de progreso alineada con la ejecución real del CI. Referencias de caché y pruebas actualizadas. Añadida validación automática de consistencia en GitHub Actions. |
| 03/10 | Simulación fija a 60 Hz; módulos de reloj, entrada y diálogos; guardado periódico y en victoria/menú/pausa; controles táctiles con E; título visible, HUD accesible y foco de diálogos; final y evolución reutilizan sus capas; pruebas de regresión y CI antes de publicar. |
| 24/09 | **Fábrica** `engine/foes.js` (makeFoe fuera de game.js). Hitstop, vibración, cámara de director en el Nido. Rig crawler/flyer/brute. Save v2 (hp, nueve vidas, magia, kills). Ids `kilo` / `stitcho` / `chispin` con migración de saves viejos. XP alineada (`55 → 140 → 260 → 420`). Móvil: botón bajar + layout vertical. |
| 24/09 | Arreglo integral: el juego vuelve a cargar. |
| 24/09 | Personajes vectoriales, música procedural, Reina del Nido. |

## Personajes

Activos:

1. Kilo
2. Stitcho
3. Chispín
4. Michi
5. Dragón
6. Dino
7. Frita
8. Pizza
9. Yomi
10. Cuerno

Aliases heredados compatibles:

- `lilo` → `kilo`
- `stitch` → `stitcho`
- `pikachu` → `chispin`
- `michi` → `cat`

## Mundo

Hay **10 salas** en el mundo publicado:

1. Claro Ohana
2. Costa Hoku
3. Jungla Alta
4. Caldera
5. Nido Final
6. Cueva Azul
7. Alien Lab
8. Cumbre
9. Órbita
10. Arrecife Abismo

El Nido final requiere forma 4. El Arrecife funciona como desvío acuático y la Órbita conecta con él mediante vórtice.

## Evolución

La curva absoluta de XP es:

`0 → 55 → 140 → 260 → 420`

Las cinco formas son:

`0 · bebé` → `1 · base` → `2 · evolución` → `3 · forma alta` → `4 · GOD`

La evolución activa cinemática y efectos visuales. La hitbox y el renderer visual permanecen conceptualmente separados.

## Guardado

Save v2 conserva, entre otros:

- personaje e id canónico
- forma y XP
- salud
- sala actual
- salas visitadas
- puntos y bajas
- estado de victoria
- magia y nueve vidas cuando corresponda

Los datos corruptos o incompatibles se descartan de forma defensiva sin romper la partida.

## Renderizado

El arte vectorial vive en:

`characters/art/`

El registro central es:

`characters/art/index.js`

La ruta vectorial es:

`game.js → characters/draw.js → characters/art/index.js → renderer del personaje`

La ruta pintada es:

`characters/draw.js → characters/sprites.js → assets/sprites/bodies/`

La vista por defecto es **vector**.

## Tests

El CI ejecuta **las dos suites de regresión**:

```bash
node --test tests/core.test.js tests/runtime.test.js
```

Las pruebas cubren, entre otras áreas:

- fábrica y comportamiento de enemigos
- XP
- roster y aliases
- guardado
- colisiones
- cerebro de enemigos
- audio sin Web Audio
- magia
- partículas
- entrada teclado/táctil
- reloj fijo
- HUD
- habilidades

El pipeline ejecuta las pruebas antes del despliegue de GitHub Pages.

## Publicación y caché

GitHub Pages publica desde `main`.

La versión de caché declarada actualmente en `index.html` es:

`ohana-76`

Las referencias documentales se mantienen alineadas con esta versión.

## Pendiente técnico

No bloquean la demo vectorial, pero quedan identificadas para una siguiente pasada:

- incorporar sprites pintados de Cuerno si se quiere soporte completo de `paint`
- reforzar el versionado de caché de módulos ES internos
- añadir una prueba de humo que cargue y ejecute cada renderer de `characters/art/`

## Regla de mantenimiento

Cuando cambien personajes, salas, formas, caché o suites de tests, actualizar en la misma entrega:

`manifest.json` · `README.md` · `PROGRESS.md` · `IMPROVEMENTS.md` · CI
