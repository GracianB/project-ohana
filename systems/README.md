# PROJECT OHANA · Mapa del código

Todo es JavaScript con módulos ES nativos (sin bundler). `index.html` carga
siete puntos de entrada; cualquier fichero que no cuelgue de ellos sobra.

```
index.html
├─ game.js ............ bucle principal, física, cámara, salas, enemigos, HUD
│  ├─ characters/roster.js .... 8 personajes × 5 formas, pasivos (activos: ACTIVE)
│  ├─ characters/draw.js ...... render de personajes (pies anclados, auras, FX)
│  │  ├─ characters/rig.js .... pose/animación compartida + kit de dibujo
│  │  └─ characters/art/*.js .. un módulo vectorial animado por personaje
│  ├─ characters/sprites.js ... PNG de efectos y del jefe
│  ├─ systems/passives.js ..... rasgo único de cada personaje
│  ├─ systems/magic.js ........ objetos mágicos (6) y sus chips en el HUD
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
├─ systems/demo.js .... pistas por sala y cinta DEMO
└─ systems/evo-cinema.js  evolución a pantalla completa en el centro
```

## Personajes
- 8 personajes en `ALL_ROSTER` (roster.js); los activos en la demo se eligen en `ACTIVE`
  (ahora: Michi, Stitcho, Chispín, Dino, Frita). Kilo, Dragón y Pizza están listos pero ocultos.
- Cada uno: 5 formas, 3 habilidades (systems/abilities.js) y un pasivo (systems/passives.js).
- Arte: `characters/art/<id>.js` recibe una pose de `rig.js` (idle, run, jump, attack,
  cast J/K/L, hurt, wall, glide, victory, gestos de espera...). Plantilla: `art/_template.js`.
- `gallery.html` = todas las formas; `gallery.html?id=dino` = 5 formas × 14 estados.

## Reglas
- Nada de scripts `APPLY-*.ps1` que parcheen código por texto: se edita el fichero.
- Si añades un módulo, impórtalo desde un punto de entrada o no se cargará.
- Al cambiar CSS/JS de entrada, sube `?v=ohana-NN` en `index.html`.
