# PROJECT OHANA · Mapa del código

Todo es JavaScript con módulos ES nativos (sin bundler). `index.html` carga
seis puntos de entrada; cualquier fichero que no cuelgue de ellos sobra.

```
index.html
├─ game.js ............ bucle principal, física, cámara, salas, enemigos, HUD
│  ├─ characters/roster.js .... 6 personajes × 5 formas (stats, colores, hitbox)
│  ├─ characters/draw.js ...... render de personajes (pies anclados, auras, FX)
│  │  ├─ characters/sprites.js  carga/recorte/tinte de assets/sprites/*.png
│  │  └─ characters/baby.js ... bebés chibi procedurales (forma 1)
│  ├─ worlds/index.js ......... fondos por mundo (parallax)
│  ├─ systems/map.js .......... 8 salas, puertas y carteles
│  ├─ systems/abilities.js .... J / K / L de cada personaje, proyectiles
│  ├─ systems/portals.js ...... catapultas y agujeros negros
│  ├─ systems/boss-nido.js .... jefe final (3 fases)
│  ├─ systems/death-fx.js ..... cinemática de muerte
│  ├─ systems/rain.js ......... lluvia + paraguas (Costa)
│  ├─ systems/surprises.js .... pez dorado, lluvia de estrellas, power-ups
│  ├─ systems/floaters.js ..... números de daño
│  ├─ systems/notify.js ....... avisos y cine de evolución
│  ├─ engine/enemies.js ....... dibujo de enemigos
│  ├─ engine/particles.js ..... partículas
│  └─ engine/audio.js ......... efectos con WebAudio
├─ systems/title.js ... portada y selección (usa draw.js para los retratos)
│  └─ systems/intro.js  cinemática corta al empezar
├─ systems/title-fx.js  fondo animado de la portada
├─ systems/hud.js ..... tinte y pips del HUD
├─ systems/ending.js .. pantalla "OHANA COMPLETADO"
└─ systems/demo.js .... pistas por sala y cinta DEMO
```

## Personajes
- Forma 1 (bebé): `baby.js`. Formas 2-5: PNG de `assets/sprites/<id>-<fase>.png`.
- La tabla `FORMS` de `sprites.js` decide qué PNG usa cada forma y si lleva tinte.
- `draw.js` escala por **altura visual** (`VISUAL_H`), no por hitbox.
- `gallery.html` muestra las 30 formas juntas para revisarlas.

## Reglas
- Nada de scripts `APPLY-*.ps1` que parcheen código por texto: se edita el fichero.
- Si añades un módulo, impórtalo desde un punto de entrada o no se cargará.
- Al cambiar CSS/JS de entrada, sube `?v=ohana-NN` en `index.html`.
