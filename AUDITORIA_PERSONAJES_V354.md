# PROJECT OHANA · Auditoría técnica de los diez personajes · V354

**Corte auditado:** V353 fusionada (diez intervenciones individuales en la intro). **Alcance real:** `characters/art/*`, `characters/draw.js`, `characters/rig.js`, `systems/intro*.js`, selectores de las diez siluetas y pruebas Node/Browser. Esta auditoría revisa el código original, no pretende sustituir la inspección humana de capturas.

## Hallazgo común: el actor vive dos segundos, el bucle dura catorce

Los diez directores tienen actuaciones diferenciadas y fase temporal determinista, pero casi todos los actos están comprimidos en ventanas de **aproximadamente dos a tres segundos** de un ciclo de 14 s. En los intervalos restantes `phase: "idle"` puede ser correcto teatralmente, pero no debe equivaler a un muñeco inmóvil. Las pruebas anteriores garantizaban secuencias y alguna captura, no movimiento corporal continuo, conectividad de los apoyos ni reacciones mutuas entre escenas.

**Medida correctora:** en la segunda ronda cada héroe conserva su historia y sus cinco evoluciones; añadimos micromovimiento propio durante las pausas, reacción física con los demás, comprobación de la silueta y render cache variable. Sin alterar física, hitbox, ataque, saltos, mapas, U cooperativa ni red. Las escenas ocurren dentro de su slot; efectos de luz no hacen de sustituto de anatomía.

## Auditoría individual y segunda ronda

| Orden | Personaje | Arte que REALMENTE se dibuja | Foco dramático y anatómico | Hallazgo / reto de aceptación |
|---|---|---|---|---|
| V354 | **Dragón** | `art/dragon.js` | Membranas y raíces escapulares, diafragma, cuello, cuatro apoyos, cola; cinco tamaños de alas | Tras su estornudo tenía la mayor parte del ciclo sin interacción familiar explícita. V354 añade expansión torácica de la geometría unida a la cadera y respuestas a Frita, Yomi y Dino; comprobar quietud accesible y cero cambio de combate |
| V355 | **Dino** | `art/dino.js` | Cuello continuo (`dinoNeckBridgePoints`), patas, dedos, cadera, cola y peso del Coloso | En el resto del bucle faltan curiosidad y reacciones persistentes. Verificar que el centro de masa acompaña al cuello y no se abren costuras al rodar o hipar |
| V356 | **Frita** | `art/frita.js` | Cuerpo patata deformable, brazos, guantes, pies, tenedor, sal, kétchup y capa | El gag de persecución está concentrado en tres segundos. Añadir microacciones de chef después de correr, sin perder el punto de sujeción de cada prop |
| V357 | **Pizza** | `art/pizza.js` | Corteza, masa, queso elástico, piernas y horno propios | Que la mozzarella siga anclada al cuerpo y que el rebote tenga anticipación y recuperación perceptibles en todas las formas |
| V358 | **Yomi** | `art/yomi.js` | Fantasma/cuerpo guardian y ofuda, mangas, cinta y farol | El arte actual no consume señales globales `pose.breath`/`pose.sway`; su continuidad no se arregla aumentando un overlay. Añadir rig local, silueta legible y reacción al resto sin desvanecerlo |
| V359 | **Cuerno** | `art/cuerno.js` | F0 cuerno vivo, F1 rostro flotante, F2 potro, F3/F4 unicornio alado: ¡no son el mismo caballo pequeño! | Validar raíz de las cuatro patas y de las alas, columna/cadera y rasgos identitarios por forma. El ciclo y el amanecer mágico deben sostener vida sin producir cascos falsos en F0/F1 |
| V360 | **Kilo** | **`art/lilo.js`**, reexport `kilo.js` | Manos con IK, ukelele, cadera, pelo, falda, bastón de F3 y alas exclusivas F4 | Tras el remate de polen a los 2.16 s, falta una larga continuidad musical; arreglar dedos/instrumento unidos durante descansos |
| V361 | **Stitcho** | **`art/stitch.js`**, reexport `stitcho.js` | F0 huevo con patas cortas, antenas, orejas, garras, F2 púas, F3 visor/motor, F4 anillos | La pelea termina hacia los 3.13 s. Añadir mirada/oreja/antena y humor visual posteriores sin recrear extremidades de otra evolución |
| V362 | **Chispín** | **`art/pikachu.js`**, reexport `chispin.js` | Orejas, branquias, patas y cola de muelle; cresta/corona/nubes solo en sus formas | La nube final termina a los 3.3 s; probar energía residual y reacción a Stitcho sin relámpagos de daño ni invadir otros slots |
| V363 | **Michi** | `art/cat.js` | Orejas, pata de acicalado, cola, mirada, F2 nube, alas exclusivamente F4 | Tras su ronroneo hacia los 5.43 s queda demasiado quieto; las señales generales `pose.sway`/`pose.breath` no están conectadas al arte actual. Mejorar microexpresiones del rostro y arraigo de patas reales |

## Barreras de calidad obligatorias (por personaje, no solo por release)

1. Cinco formas F0–F4 representadas y **anatomía que pertenece a esa forma** (no reemplazo de sprites genéricos).
2. Geometría finita. Pies o apoyos conectados, pelvis, hombros, axilas y raíces de alas/cola comprobados cuando esa anatomía existe.
3. Cinco actuaciones reconocibles, pero también **movimiento secundario durante la espera**, sin congelación durante todo el ciclo de catorce segundos.
4. Actuación corporal real, no solamente partículas de primer plano. Transiciones dirigidas por un reloj puro, reproducible en pruebas.
5. `prefers-reduced-motion` sin sacudidas ni destellos. Efectos acotados al actor y buena legibilidad en 360, 760, 1280 y 1680 px.
6. No alterar `_cast`, `melee`, hitboxes, físicas, red, guardado, U de parejas ni reglas de evolución del juego.
7. Prueba Node del rig, reloj, límites geométricos, caché y modo reducido; Browser E2E escritorio/móvil; capturas visuales antes/después; multijugador Chromium/Firefox; Release Gate y Pages.
8. Ninguna fusión sin **quality** completa en verde. Mantener Netlify al margen de las publicaciones de GitHub Pages.

## V354 · cambio implementado en Dragón

- `systems/intro-dragon-stage.js`: reacción secundaria a la persecución de Frita (5.2–6.2 s), el susto del farol de Yomi (8.1–8.9 s) y el pisotón de Dino (11.75–12.70 s). No sustituye las cuatro fases de estornudo existentes.
- `characters/art/dragon.js`: `dragonWelcomeAnatomy` calcula respiración por forma, con expansión horizontal y contracción vertical del pecho, anclada en cadera; el movimiento viaja a cuello, cabeza, brazos, hombros, alas y cola del arte existente.
- Por forma: barriga redonda más marcada para F0, respiración más contenida pero hombros más activos para F4; cinco siluetas originales intactas.
- Render y pruebas: fingerprint con respiración y reacciones, seis pruebas Node nuevas de geometría, repetición exacta, animación en tramos vacíos, aislamiento frente a daño y otras nueve familias, auditoría matricial de los diez actores, Browser E2E y tres capturas dirigidas con las otras escenas en pantalla.

**Límite deliberado:** no damos por inspeccionada visualmente una forma solo porque Node la pruebe. Los artefactos de CI se deben revisar antes de aceptar una V como definitiva.
