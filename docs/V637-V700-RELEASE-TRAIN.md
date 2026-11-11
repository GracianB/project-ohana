# OHANA · Tren de 64 versiones V637 → V700

La orden de trabajo no es saltar directamente a V700: **hay que construir una mejora funcional real por cada una de las 64 versiones**, en orden y con prueba. Se conserva la versión pública 636 mientras se integra el trabajo en [PR #460](https://github.com/GracianB/project-ohana/pull/460), que permanece en borrador. El objetivo final sigue siendo un único lanzamiento 700, no 64 publicaciones inestables.

## Contrato de una versión
1. Un cambio distinguible en código o contenido jugable, conectado al motor real, no un simple título ni un plan.
2. Una o más pruebas que lo demuestren. No crear pruebas triviales para simular progreso y no debilitar las existentes.
3. CI y quality del **mismo SHA**, sin errores o regresiones; mantener 10 personajes/50 formas, guardados y Stitcho.
4. Registrar la evidencia (commit y gate real) en `docs/v637-v700-ledger.json`. Solo entonces pasar de `implemented_pending_full_validation` a `accepted`.
5. No cambiar el servicio de producción antes de publicar. La aceptación humana real, si hace falta, no se puede fingir con Playwright.

## Las 64 versiones

| Versión | Mejora concreta | Área | Archivo principal | Prueba mínima | Estado |
|---|---|---|---|---|---|
| **V637** | Pulso de Michi: coral con colisión | Michi | `worlds/ohana-pulse.js` | `tests/v700-michi-pulse.test.js` | Código candidato; verificar gates |
| **V638** | Reconstrucción de Pulso desde guardados 636 | Michi | `worlds/ohana-pulse.js` | `tests/v700-michi-pulse.test.js` | Código candidato; verificar gates |
| **V639** | Iluminación reactiva por medusas | Michi | `worlds/michi-reactive-night.js` | `tests/v700-michi-pulse.test.js` | Código candidato; verificar gates |
| **V640** | Michi: rescate físico en navegador | Michi | `tests/browser/v700-pulse.mjs` | `V700 Pulso OHANA Physical Acceptance` | Código candidato; verificar gates |
| **V641** | Anticipación de cámara según velocidad | Motor | `engine/camera.js` | `tests/v700-camera-feel.test.js` | Código candidato; verificar gates |
| **V642** | Cámara fluida al invertir dirección | Motor | `engine/camera.js` | `tests/v700-camera-feel.test.js` | Código candidato; verificar gates |
| **V643** | Restablecimiento de cámara entre salas | Motor | `game.js` | `tests/v700-camera-feel.test.js` | Código candidato; verificar gates |
| **V644** | Huella offline y precarga Versus coherentes | Motor | `sw.js` | `release:check + OHANA CI` | Código candidato; verificar gates |
| **V645** | Salto en búfer verificado en diez héroes | Motor | `game.js` | `tests/v645-buffer.test.js` | Código candidato; verificar gates |
| **V646** | Tiempo de gracia al abandonar bordes | Motor | `game.js` | `tests/v646-coyote.test.js` | Código candidato; verificar gates |
| **V647** | Altura variable y control de salto corto | Motor | `systems/player-movement.js` | `tests/v647-variable-jump.test.js` | Código candidato; verificar gates |
| **V648** | Aire: aceleración y frenado por personaje | Motor | `systems/player-movement.js` | `tests/v648-air-control.test.js` | Código candidato; verificar gates |
| **V649** | Esquinas, colisiones y escalones sin enganches | Motor | `engine/collide.js` | `tests/v649-collision-edges.test.js` | Código candidato; verificar gates |
| **V650** | Aterrizaje con señales visuales y auditivas | Motor | `game.js` | `v650-landing-feedback.test.js` | Pendiente |
| **V651** | Muerte justa y reinicio rápido con checkpoints | Motor | `systems/world1-play.js` | `v651-respawn-checkpoints.test.js` | Pendiente |
| **V652** | Paridad de teclado, táctil y mando | Motor | `systems/input.js` | `v652-input-parity.test.js` | Pendiente |
| **V653** | Michi: primer acto que enseña luz y rutas | Michi | `systems/world1-rooms.js` | `v653-michi-act1.test.js` | Pendiente |
| **V654** | Michi: segundo acto que combina medusas | Michi | `systems/cat-chapter.js` | `v654-michi-act2.test.js` | Pendiente |
| **V655** | Michi: culminación de bosque y secretos | Michi | `systems/cat-chapter.js` | `v655-michi-act3.test.js` | Pendiente |
| **V656** | Michi: jefe astral con anticipación clara | Michi | `systems/cat-chapter.js` | `v656-michi-boss.test.js` | Pendiente |
| **V657** | Dino: impacto real y respuesta del terreno | Dino | `systems/dino-chapter.js` | `v657-dino-impact.test.js` | Pendiente |
| **V658** | Dino: Pulso tectónico y plataformas sólidas | Dino | `systems/dino-chapter.js` | `v658-dino-pulse.test.js` | Pendiente |
| **V659** | Dino: ruta artesanal de tres actos | Dino | `systems/world1-rooms.js` | `v659-dino-route.test.js` | Pendiente |
| **V660** | Dino: guardián fósil con tres patrones | Dino | `systems/dino-chapter.js` | `v660-dino-boss.test.js` | Pendiente |
| **V661** | Kilo: Pulso de corrientes y pétalos | Kilo | `systems/kilo-chapter.js` | `v661-kilo-pulse.test.js` | Pendiente |
| **V662** | Kilo: niveles aéreos y secretos de precisión | Kilo | `systems/world1-rooms.js` | `v662-kilo-route.test.js` | Pendiente |
| **V663** | Kilo: guardián de campanario expresivo | Kilo | `systems/kilo-chapter.js` | `v663-kilo-boss.test.js` | Pendiente |
| **V664** | Kilo: música reactiva a viento y notas | Kilo | `systems/kilo-chapter.js` | `v664-kilo-audio.test.js` | Pendiente |
| **V665** | Stitcho: Pulso de plasma seguro | Stitcho | `systems/stitcho-chapter.js` | `v665-stitcho-pulse.test.js` | Pendiente |
| **V666** | Stitcho: paredes, circuitos y ruta vertical | Stitcho | `systems/world1-rooms.js` | `v666-stitcho-route.test.js` | Pendiente |
| **V667** | Stitcho: jefe de astillero telegrafiado | Stitcho | `systems/stitcho-chapter.js` | `v667-stitcho-boss.test.js` | Pendiente |
| **V668** | Chispín: Pulso de tormenta y relés | Chispín | `systems/chispin-chapter.js` | `v668-chispin-pulse.test.js` | Pendiente |
| **V669** | Chispín: plataformas de ritmo legible | Chispín | `systems/world1-rooms.js` | `v669-chispin-route.test.js` | Pendiente |
| **V670** | Chispín: jefe de descargas justa | Chispín | `systems/chispin-chapter.js` | `v670-chispin-boss.test.js` | Pendiente |
| **V671** | Cuerno: Pulso de prismas físicos | Cuerno | `systems/cuerno-chapter.js` | `v671-cuerno-pulse.test.js` | Pendiente |
| **V672** | Cuerno: carrera con atajos y control | Cuerno | `systems/world1-rooms.js` | `v672-cuerno-route.test.js` | Pendiente |
| **V673** | Cuerno: guardián de espejo con contraataque | Cuerno | `systems/cuerno-chapter.js` | `v673-cuerno-boss.test.js` | Pendiente |
| **V674** | Dragón: Pulso de térmicas ascensionales | Dragón | `systems/dragon-chapter.js` | `v674-dragon-pulse.test.js` | Pendiente |
| **V675** | Dragón: archipiélago con rutas en altura | Dragón | `systems/world1-rooms.js` | `v675-dragon-route.test.js` | Pendiente |
| **V676** | Dragón: jefe aéreo y avisos claros | Dragón | `systems/dragon-chapter.js` | `v676-dragon-boss.test.js` | Pendiente |
| **V677** | Frita: Pulso de mercado flotante | Frita | `systems/frita-yomi-chapters.js` | `v677-frita-pulse.test.js` | Pendiente |
| **V678** | Frita: desafíos de viento y recetas | Frita | `systems/world1-rooms.js` | `v678-frita-route.test.js` | Pendiente |
| **V679** | Frita: jefe con patrón gastronómico | Frita | `systems/frita-boss.js` | `v679-frita-boss.test.js` | Pendiente |
| **V680** | Pizza: Pulso de puertos y entregas | Pizza | `systems/pizza-chapter.js` | `v680-pizza-pulse.test.js` | Pendiente |
| **V681** | Pizza: rutas acrobáticas y atajos | Pizza | `systems/world1-rooms.js` | `v681-pizza-route.test.js` | Pendiente |
| **V682** | Pizza: jefe de marea con tres aperturas | Pizza | `systems/pizza-boss.js` | `v682-pizza-boss.test.js` | Pendiente |
| **V683** | Yomi: Pulso de ecos y caminos reales | Yomi | `systems/frita-yomi-chapters.js` | `v683-yomi-pulse.test.js` | Pendiente |
| **V684** | Yomi: biblioteca de enigmas accesibles | Yomi | `systems/world1-rooms.js` | `v684-yomi-route.test.js` | Pendiente |
| **V685** | Yomi: custodio del archivo y sus avisos | Yomi | `systems/yomi-boss.js` | `v685-yomi-boss.test.js` | Pendiente |
| **V686** | Enemigos: anticipación universal de ataques | Combate | `systems/enemy-director.js` | `v686-telegraphs.test.js` | Pendiente |
| **V687** | Enemigos: conductas distintivas por bioma | Combate | `systems/campaign-enemies.js` | `v687-enemy-species.test.js` | Pendiente |
| **V688** | Enemigos: colisiones, daño y caídas justos | Combate | `engine/collide.js` | `v688-combat-fairness.test.js` | Pendiente |
| **V689** | Cincuenta siluetas reconocibles | Arte | `characters/draw.js` | `v689-silhouettes.test.js` | Pendiente |
| **V690** | Cincuenta conjuntos de movimiento expresivo | Arte | `characters/ten-action-acting.js` | `v690-character-acting.test.js` | Pendiente |
| **V691** | Poderes: anticipación legible para cada forma | Arte | `characters/evolution.js` | `v691-power-language.test.js` | Pendiente |
| **V692** | Animación de entrada, daño, victoria y muerte | Arte | `characters/draw.js` | `v692-character-states.test.js` | Pendiente |
| **V693** | Bandas sonoras originales y capas dinámicas | Audio | `systems/audio-director.js` | `v693-adaptive-score.test.js` | Pendiente |
| **V694** | Mezclador, subtítulos y sonido accesible | Audio | `systems/audio-director.js` | `v694-audio-accessibility.test.js` | Pendiente |
| **V695** | Mapa, HUD y menú limpios y accesibles | Interfaz | `systems/adventure-guide-v2.js` | `v695-ui-a11y.test.js` | Pendiente |
| **V696** | Escalado responsive, táctil y mando físico | Interfaz | `systems/input.js` | `v696-responsive-input.test.js` | Pendiente |
| **V697** | Migración de partidas V636 a V700 sin pérdidas | Entrega | `systems/save.js` | `v697-save-migration.test.js` | Pendiente |
| **V698** | Cooperativo sin regresiones y sincronía real | Entrega | `multiplayer/adventure-progress.js` | `v698-coop-compat.test.js` | Pendiente |
| **V699** | Rendimiento y precache íntegros | Entrega | `sw.js` | `v699-perf-release.test.js` | Pendiente |
| **V700** | Diez capítulos cerrados; 64 gates y Pages | Entrega | `tools/release-gate.mjs` | `V700 final gates + playtesting + Pages` | Pendiente |

## Control honesto del progreso

- En el estado inicial V637–V644 tienen piezas técnicas implementadas en la rama (Pulso de Michi, reanudación, iluminación, prueba física y cámara); **no** están publicadas y su integración global sigue por aprobar.
- V645–V700 son **trabajos pendientes**, no funcionalidades ya hechas.
- Las siguientes fases deben respetar **este orden numérico**. Si un gate falla, detenerse, leer logs y corregir el mismo HEAD antes de acreditar la versión.
- La PR puede contener múltiples commits verificados de desarrollo y finalizar en un solo squash merge cuando los 64 hitos estén realmente terminados.
- El README es un escaparate del universo. Este registro técnico vive en `docs/`.
