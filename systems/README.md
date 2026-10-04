# PROJECT OHANA · Mapa del código

Todo es JavaScript con módulos ES nativos (sin bundler). `index.html` carga
seis puntos de entrada; los módulos de motor, entrada, guardado y accesibilidad se importan desde ellos.

```
index.html
├─ game.js ............ bucle principal, física, cámara, salas, enemigos, HUD
│  ├─ engine/clock.js ......... paso fijo de 60 Hz y recuperación limitada
│  ├─ engine/input.js ......... teclado, punteros y limpieza de entradas
│  ├─ systems/dialogs.js ...... foco, accesibilidad e inert de los diálogos
│  ├─ systems/hud.js .......... estado accesible de barras y tinte desde el jugador
│  ├─ characters/roster.js .... 10 personajes × 5 formas, pasivos (activos: ACTIVE)
│  ├─ characters/draw.js ...... render de personajes (pies anclados, auras, FX)
│  │  ├─ characters/rig.js .... pose/animación compartida + kit de dibujo
│  │  └─ characters/art/*.js .. un módulo vectorial animado por personaje
│  ├─ characters/sprites.js ... PNG de efectos
│  ├─ systems/passives.js ..... rasgo único de cada personaje
│  ├─ systems/mutations.js ..... mutaciones seguras de HP, XP, score, combo y bajas
│  ├─ systems/magic.js ........ objetos mágicos (6) y sus chips en el HUD
│  ├─ worlds/index.js ......... fondos por mundo (parallax)
│  ├─ systems/map.js .......... 10 salas, puertas y carteles
│  ├─ systems/abilities.js .... J / K / L de cada personaje, proyectiles
│  ├─ systems/portals.js ...... catapultas y agujeros negros
│  ├─ systems/boss-nido.js .... jefe final (3 fases)
│  ├─ systems/death-fx.js ..... cinemática de muerte
│  ├─ systems/rain.js ......... lluvia radiactiva + paraguas (Lab)
│  ├─ systems/surprises.js .... pez dorado, lluvia de estrellas, power-ups
│  ├─ systems/floaters.js ..... números de daño
│  ├─ systems/notify.js ....... avisos y cine de evolución
│  ├─ systems/save.js ......... save v2 + ids viejos
│  ├─ systems/xp.js ........... umbrales 55/140/260/420
│  ├─ engine/foes.js .......... fábrica makeFoe
│  ├─ engine/foe-rig.js ....... crawler / flyer / brute
│  ├─ engine/enemies.js ....... dibujo de enemigos
│  ├─ engine/boss-art.js ...... Reina del Nido vectorial + entrada cinematográfica
│  ├─ engine/particles.js ..... partículas
│  ├─ engine/audio.js ......... efectos con WebAudio (sfx)
│  └─ engine/music.js ......... música procedural por mundo y jefe
├─ systems/title.js ... portada y selección (usa draw.js para los retratos)
│  └─ systems/intro.js  cinemática corta al empezar
├─ systems/title-fx.js  fondo animado de la portada
├─ systems/ending.js .. pantalla "OHANA COMPLETADO"
├─ systems/demo.js .... pistas por sala y cinta DEMO
└─ systems/evo-cinema.js  evolución a pantalla completa en el centro
```

## Personajes
- Diez personajes activos: Kilo, Stitcho, Chispín, Michi, Dragón, Dino, Frita, Pizza, Yomi y Cuerno.
  La selección se define en `ACTIVE` de `roster.js`; escoger una ficha no inicia ni borra una partida.
- Cada uno: 5 formas, 3 habilidades (systems/abilities.js) y un pasivo (systems/passives.js).
- Arte: `characters/art/<id>.js` recibe una pose de `rig.js` (idle, run, jump, attack,
  cast J/K/L, hurt, wall, glide, victory, gestos de espera...). Plantilla: `art/_template.js`.
- `gallery.html` = todas las formas; `gallery.html?id=dino` = 5 formas × 14 estados.

## Reglas
- Nada de scripts `APPLY-*.ps1` que parcheen código por texto: se edita el fichero.
- Si añades un módulo, impórtalo desde un punto de entrada o no se cargará.
- Al cambiar CSS/JS de entrada, sube `?v=ohana-NN` en `index.html` (actual: `ohana-110`).
- El guardado usa `saveStore`; las acciones de teclado y táctiles comparten `bindInput`.
- `systems/hud.js` recibe el estado del jugador: no lee textos del DOM ni usa intervalos.
- Las pruebas de `tests/core.test.js` y `tests/runtime.test.js` deben pasar antes del despliegue.
