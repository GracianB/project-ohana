# OHANA V323 · Cierre de Mundo 1 · Autoridad U completa y pulido vectorial máximo

**Cache objetivo:** `ohana-340`  
**Contrato:** respeta `WORLD-1.md` (10 héroes, 5 formas, 10 salas, Reina, vector, sin Mundo 2).  
**No entra:** PNG pintados como elenco, nuevas salas, cambios de física/hitbox/daño base, nuevas habilidades.  
**Prioridad:** resolver #318 de forma definitiva y llevar el vector al máximo nivel de coherencia jugable.

## Principios de esta V

- Un solo origen de daño autoritativo (host). El invitado solo envía intención + identidad estable.
- Todo daño de U es local, telegrafiado y contrastable con la geometría visible.
- Protección visual de U no oculta coreografía ni deja parpadeos residuales en ninguna de las 5 formas.
- Cero cambios de física, colisiones, XP base o cooldown.
- Todas las fases cierran con Node + Browser + Multiplayer E2E + Visual + Release Gate.
- Documentar explícitamente lo que no se puede verificar en vivo (Netlify cuota, TURN real).

---

## Fase 1 · Clasificación y autoridad de daño U (cierra #318.1)

**Objetivo:** cada U de los 10 héroes tiene una clasificación explícita (`immediate` | `telegraphed-local`) y un único camino autoritativo.

- Auditar `systems/abilities.js` (`castSupreme`) para Dragón, Dino, Frita, Pizza, Yomi, Cuerno, Kilo, Stitcho, Chispín, Michi.
- Eliminar el patrón “impacto legacy inmediato + luego `startFamilyDuet`”. El daño solo ocurre dentro de la ventana telegrafiada del dúo o del ritual local.
- Preservar mecánicas especiales: vuelo Dragón, ejecución Yomi con límites de jefe, sueño Cuerno.
- `game.onAbilityHit` deja de filtrar solo 4 héroes. Autoridad uniforme para los 10.
- Tests: 10 héroes × 5 formas × host/guest, daño aplicado una sola vez, sin EXP extra.

**Cierre:** #318 punto 1 y 2 verdes.

---

## Fase 2 · Protección visual U para los 10 héroes (cierra #318.3)

**Objetivo:** `duetProtected`, `ignoreHurt` y `hurtFresh` cubren a los 10 personajes en las 5 formas. La coreografía U nunca queda eclipsada por flash de daño.

- Extender lógica de `characters/draw.js` (actualmente centrada en los 4 iniciales).
- Estado de protección U es data-driven por heroId + form, no hardcodeado.
- Reduced-motion: protección sigue activa pero sin flash; la pose U permanece legible.
- Tests Canvas reales: 10 × 5 × 9 parejas, captura de pose durante U bajo daño simulado.

**Cierre:** ningún héroe parpadea fuera de la coreografía durante U.

---

## Fase 3 · Cobertura multiplayer completa ambos sentidos

**Objetivo:** host ↔ guest real para los 10 héroes y las 9 selecciones de pareja posibles.

- Ampliar `tests/browser/multiplayer-e2e.mjs` (y nuevos casos) a los seis restantes + reconexión + táctil.
- Verificar: lanzamiento U, aparición de NPC, daño único, recuperación de canal, identidad estable.
- Canal fiable de U (ya parcialmente en V322) se valida con pérdida de paquetes y fallback Netlify.
- No se promete TURN; se documenta el fallback.

**Cierre:** matriz 10×9×2 sentidos en verde en Chromium y Firefox.

---

## Fase 4 · Fingerprint de poses y caché Canvas robusta

**Objetivo:** `poseFingerprint` incluye `turnPulse` y `brake` para invalidar correctamente el canvas de presentación.

- Actualizar hash en `characters/draw.js`.
- Invalidación explícita al girar o frenar; no reutilizar pose anterior.
- Tests de fingerprint + regresión visual de giros/frenadas en las 5 formas de los 10 héroes.
- Cache SW coherente con `ohana-340`.

**Cierre:** cero poses obsoletas en giro/frenada.

---

## Fase 5 · Consistencia residual de actuación vectorial

**Objetivo:** las segundas pasadas de personalidad (Kilo, Stitcho, Chispín, Michi, Dragón, Dino, Frita, Pizza, Yomi, Cuerno) quedan perfectamente alineadas con el nuevo contrato de U.

- Revisar efectos locales (huellas, chispas, costuras, aterrizajes) para que se supriman durante U activa y reduced-motion.
- Confirmar que ninguna animación residual altera hitbox o daño.
- Tests de actuación + U simultánea en Canvas real.

**Cierre:** las 50 combinaciones personaje×forma se ven coherentes en combate y en U.

---

## Fase 6 · Boss Director · pulido final de telegraphs y BREAK

**Objetivo:** la Reina (fases 15–21) tiene telegraphs 100 % legibles y el sistema de BREAK/CEBO/memoria no introduce edge cases bajo cooperativo.

- Revisar ventanas de castigo y desesperación (<22 %) en presencia de segundo jugador.
- Asegurar que la memoria de encuentro no se corrompe con paquetes reordenados.
- Tests de director + multiplayer (host ejecuta IA, guest ve telegraphs idénticos).

**Cierre:** combate de Reina determinista y legible en solo y coop.

---

## Fase 7 · Performance y presupuestos finales

**Objetivo:** confirmar que el crecimiento de V314–V322 no ha roto los presupuestos (`tools/performance-budgets.mjs`).

- Medir JS transferido, CSS, first paint y pasos de simulación bajo carga de 10 héroes + U + festival.
- DPR adaptativo y culling de render se validan en móvil simulado.
- Si hay exceso, priorizar carga bajo demanda de módulos no críticos (no recortar gameplay).

**Cierre:** Release Gate verde con márgenes documentados.

---

## Fase 8 · A11y y mobile final pass

**Objetivo:** reduced-motion, teclado, táctil y lectores de pantalla quedan consistentes con las nuevas protecciones U y fingerprints.

- Botones táctiles de U y pareja no pierden foco.
- Anuncios ARIA de evolución, BREAK y U no se solapan.
- Tests de a11y + mobile controls en las 5 formas.

**Cierre:** cero regresiones de accesibilidad.

---

## Fase 9 · Integridad de save, festival y afinidad bajo multiplayer

**Objetivo:** el save v2, los 100 recuerdos y los ledgers de afinidad por pareja sobreviven a desconexiones y cambios de host.

- Migración segura de ledgers V314+.
- Festival no otorga recompensas duplicadas en coop.
- Tests de persistencia + reconexión.

**Cierre:** partidas continuables sin pérdida de progreso ni duplicados.

---

## Fase 10 · Release Gate, cache ohana-340 y cierre documental

**Objetivo:** V323 se declara lista para tag de cierre de Mundo 1.

- Bump de cache en `index.html`, `sw.js` y módulos referenciados.
- Ejecución completa: `npm test`, `test:browser`, `test:visual`, `test:browser:multiplayer`, `release:check`.
- Actualizar `PROGRESS.md` con resumen de V323.
- Actualizar `WORLD1-CLOSURE.md` con estado final y checklist de lo no verificado en vivo (Netlify cuota, dos dispositivos reales, TURN).
- Crear issue de seguimiento solo si queda algo explícitamente fuera de alcance (pintura, Mundo 2).

**Cierre:** Mundo 1 vectorial cerrado. Siguiente versión puede abrir arte pintado o Mundo 2.

---

## Orden de ejecución recomendado

1 → 2 → 4 (autoridad + visual + fingerprint)  
3 (cobertura multiplayer)  
5 (actuación residual)  
6 → 7 → 8 → 9  
10 (gate final)

## Criterios globales de no-regresión

- Física, hitboxes y daño base idénticos a V322.
- 148+ tests anteriores siguen verdes.
- Cache nunca retrocede.
- Documentación de lo no comprobado en producción real.

**Responsable:** implementación incremental por fases, cada una con PR independiente y gates completas.
