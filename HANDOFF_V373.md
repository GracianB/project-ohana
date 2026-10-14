# Handoff V373 (Cuerno completo) — para seguir con GPT

V372 está publicada en main (c01fcc3). Esta rama `v373-wip` tiene la V373 A MEDIAS: los archivos de Cuerno están hechos y testeados, y la integración en game.js/abilities.js está empezada pero sin verificar.

## Archivos nuevos (testeados por separado)
- characters/art/cuerno-v373.js: arte de 5 formas (Cuernín, Destello, Potro Iris, Unicornio Estelar, Unicornio Negro). Poses idle/walk/jump/attack/death/trail/hurt/victory, constelación en victory y `cuernoTrailOrigin(x,y,{form,facing,scale})`.
- systems/cuerno-fx.js: createCuernoFx/updateCuernoFx/drawCuernoFx/emitCuernoFx, cuernoDoubleJump (arcoíris del doble salto) y emitCuernoTrail(fx,{x,y,form,life,stars}).
- systems/cuerno-kit.js: castCuerno/updateCuerno/drawCuerno. J astral (lanzas extra según la forma), K cornada con stun + estela arcoíris que daña, L estampida, F sueño, M puya.
- systems/cuerno-play-v373.js: emotes 1/2/3, dúo con Kilo en la U y "pinta el cielo". Exporta updateCuernoPlay(game,t), drawCuernoPlay(ctx,game,t,drawCharacter,ROSTER) y startCuernoDuo(game).
- systems/cuerno-evo-v373.js: cuernoFormMods(form) (en K/L/F los multiplicadores valen 1), cuernoEvolveBurst (cura), updateCuernoBursts, drawCuernoBursts, resetCuernoEvoV373, drawCuernoIntro, drawCuernoDeath y drawCuernoVictory.

## Enganches pendientes o por verificar
1. characters/art/index.js: importar cuerno desde ./cuerno-v373.js.
2. game.js:
   - `game.cuernoFx = createCuernoFx()`.
   - Cada tick: `updateCuernoFx(game.cuernoFx, p.id==="cuerno"?p:null, t, game.paused)`.
   - `drawCuernoFx(ctx, game.cuernoFx)` con la cámara aplicada, antes de pintar al jugador.
3. Doble salto: llamar a `cuernoDoubleJump(game.cuernoFx,p)` solo si `cuernoFormMods(form).unlock.rainbowJump`.
4. abilities.js:
   - En useAbility, `castCuerno(tecla,p,game)`. Comprobar a qué índice corresponde la F.
   - `updateCuerno(game,game.player,{hit:hitEnemy})` en updateAbilityFx.
   - `drawCuerno(ctx,p,cam,t)` en drawAbilityFx.
5. Melee: `castCuerno("M",p,game,def)`, con fallback a hornPoke.
6. Enemigo dormido (`e.sleep>0`): restar 1 y saltar SOLO la IA y el movimiento. No saltar invuln, daño ni muerte.
7. Durante la K, mandar `state:"trail"` al arte.
8. cuerno-play:
   - Llamadas a update y draw.
   - startCuernoDuo en la rama U de Cuerno.
   - `game.coopRemote = onlineCoop.remote`.
9. cuerno-evo:
   - `cuernoEvolveBurst(game,p)` tras subir p.evo.
   - Llamadas a updateCuernoBursts y drawCuernoBursts.
   - `resetCuernoEvoV373()` en loadRoom.
   - intro, muerte y victoria cuando id==="cuerno".
10. La constelación sube ~30 px sobre el cuerno: que no pise la barra de vida ni el nombre.

## Release (obligatorio, nunca publicar con tests en rojo)
- Subir ohana-372 a ohana-373 en index.html y sw.js.
- Añadir los 5 archivos nuevos al PRECACHE de sw.js y ejecutar `node tools/update-offline-revisions.mjs`.
- tools/offline-baseline-v372.json: el archivo existe; comprobar que se generó desde c01fcc3.
- Pasar a V372→V373: tests/v368-incremental-offline.test.js, tests/v369-offline-upgrade-report.test.js, tests/browser/v369-cache-migration.mjs y tools/offline-upgrade-report.mjs.
- Añadir la sección V373 a PROGRESS.md.
- Tienen que pasar: `npm test`, `npm run release:check`, `npm run test:browser` y `npm run test:visual`.
- Reglas:
  - Sin `?v=` en los imports relativos.
  - Sin gradientes por frame.
  - Sin Math.random en el draw.
  - Kétchup es "frita" en el código.
  - Chispín es "pikachu" en el código y nunca Pika/Pichu/Pokémon en la UI.
- Hacer el merge de esta rama en main y hacer push. Pages se actualiza solo.
