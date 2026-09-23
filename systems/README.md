# PROJECT OHANA · Systems Layer

## combat.js
Centraliza habilidades, daño y combos.

## collectibles.js
Gestiona recursos recogibles y su conexión con inventario.

## quests.js
Sistema extensible de misiones con progreso y recompensas.

## inventory.js
Inventario basado en Map, preparado para serialización.

## dialogue.js
Colas y secuencias de diálogo.

## camera.js
Seguimiento, offset y screen shake.

## particles.js
Partículas procedurales para impactos, cristales y habilidades.

## audio.js
Registro de música y efectos. El juego funciona aunque todavía no existan
archivos de audio físicos dentro de assets/audio.

## death-fx.js
Carry-away cinemático por fases (aparecer → reclamar → ascender → disolver, ~4.9s / ~1.8s con reduced motion): reaper con capucha, motas de alma, tether y afterimages locales (nunca `game.ghosts`). Variantes `hurt`/`void`. API: `DeathFx.start(player,onDone,opts?)/update/draw/isPlaying/cancel/playerAlpha`.

## portals.js
Catapultas y agujeros negros como atajos entre salas (no reemplazan doors).
API: `spawnFromRoom`, `update`, `draw`, `tryUse`. Datos en `map.js` → `room.portals`.

## surprises.js
Sorpresas positivas por sala (sin tocar progresión evo): pez dorado (beach/reef), lluvia de estrellas (space, orbs +XP), burst GOD al llegar a forma 5 y Corona estelar (GOD, 1×/run).
API: `onMakeFoe`, `onEnterRoom`, `onBecomeGod`, `onEnemyKilled`, `update`, `draw`, `starOrbBonus`, `reset`.

## boss-nido.js
Reina del Nido: jefe final en 3 fases (suelo → alas → enloquece) con telegraphs, charge/swoop/slam/spit.
API: `createBossNido()`, `updateBossNido(e, game, helpers)`. Silueta procedural en `engine/enemies.js` → `drawBoss`.
