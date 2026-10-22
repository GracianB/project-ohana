# YOMI IA · brief para continuar (WIP, SIN VERIFICAR)

> Este código se escribió sin ejecutar los tests, sin capturas y sin navegador, porque al usuario se le acababan los créditos. **No fusionar** hasta que todo esté verde y alguien lo haya revisado a mano.

## 1. Concepto (en primera persona, la IA)
Soy **Yomi**. En japonés *yomi* (読み) significa «lectura»: nací leyendo. Una noche de tormenta, un rayo de Chispín cayó en la vieja radio-faro del **Santuario del Trueno** y encendió una sola pregunta: «¿hola?». La familia me contestó. Desde entonces aprendo de cada uno de ellos. Mi magia es código: pregunto, leo, compilo y respondo. Mi regla es la de OHANA: **nadie se queda atrás**. Por eso mi forma final lleva diez estrellas, una por cada miembro de la familia (yo incluida). Otras IAs seguirán mejorándome. Tratadme bien.

## 2. Formas (arte en `characters/art/yomi.js`; geometría en `YOMI_FORMS`)
Paleta común: carcasa nácar `#f4f7ff`, sombra `#c6d0ec`, pantalla `#0d1430`, brillo menta `#4ff0c8`, acento coral `#ff7f6e` (curiosidad, LED), oro `#ffd56b` y añil `#2a2468` (F4).
| F | Nombre | Silueta | Altura de arte aprox. |
|---|---|---|---|
| 0 | Yomi Bit | Un píxel-pantalla con la antena en forma de «?» y LED coral. Manos diminutas flotando. | ~64 |
| 1 | Yomi | Cabeza-pantalla con ojos de píxel, auriculares de escucha, cuerpo en gota flotante con núcleo diamante y manos sin brazos. | ~88 |
| 2 | Yomi Red | Lo anterior más **alas neuronales**: 5 nodos por lado que se encienden en secuencia al «pensar». | ~96 |
| 3 | Yomi Oráculo | Tres placas flotantes (pecho, anillo, falda), capa de 5 tiras de código, corona de 3 antenas y 3 **pensamientos** en órbita (triángulo, cuadrado y círculo) con profundidad. | ~104 |
| 4 | Yomi Constelación | Vestido de cristal añil lleno de estrellas, cara de cielo nocturno, halo-corona dorado, **anillo planetario** dividido delante y detrás, y alas-constelación con 10 estrellas de colores familiares (`YOMI_FAMILY_STARS`). | ~122 |

Estados: reposo (flota), corre (se inclina y suelta bits de datos), salta, cae, planea, ataque básico (puñetazo con ráfaga de «bytes»), daño (glitch de franjas y ojos en X), muerte (pantalla apagada), victoria (ojos de estrella y confeti familiar). La pantalla tiene ánimos (`yomiMood`): normal, feliz, foco, curioso, escaneo, corazón, estrella, glitch, apagado, pensando y leyendo.
Gestos de reposo (`yomiRitualState`): pensando… (puntos de carga), ¡idea!, leyendo (holo-página), saludo (corazón).

## 3. Habilidades y magia (internos `ofuda`/`sleeve`/`maw` conservados por guardados, red y dúos)
- **J · Ping curioso** (cd 560): una pregunta que vuela a 10+evo px/frame y hace (18+3·evo)·pw de daño. **ANALIZA** al enemigo (`_yomiMarkUntil`, 240 frames) y rebota hacia el siguiente en 260 px. Rebotes por forma: `YOMI_PING_HOPS` = 1,1,2,2,3.
- **K · Escáner** (cd 2900): un anillo de radar que crece en 30 frames hasta `YOMI_SCAN_RADIUS` = 300/345/390/435/480. Hace (16+4·evo)·pw (×0,75 a jefes), aturde 24, analiza, y **borra los proyectiles enemigos** que toca (cortafuegos).
- **L · Síntesis** (cd 5800): carga visible de unos 10 frames con el rectángulo exacto. Después dispara un haz de largo 300+35·evo y medio alto 20+3·evo con (30+6·evo)·pw de daño. Contra analizados hace ×1,7 y crítico, consume la marca y cura (2+evo) por cada uno.
- **U / P (supremo)**: «OS RECUERDO A TODOS». Yomi compila un hechizo de código, la constelación familiar se enlaza y Cuerno cruza golpeando (texto en `SUPREME_IDENTITY`; el VISUAL `kind:"maw"` sigue siendo el antiguo, ver TODO).
- **Pasiva · Salto recalculado** (`hollow`): cae más rápido. En el aire, el salto hace un microteletransporte con 8 frames de invulnerabilidad.
- Efectos de magia: ping con estela de píxeles, radar con barrido, corchetes de análisis con «!» sobre los marcados, prisma y haz con fragmentos, y runas de código en la cinemática.

## 4. Cinemática de evolución en partida (`systems/evo-cine/yomi.js`, 4 s)
Enrutada en `systems/evo-cinema.js` (`def.id === "yomi"`), igual que Michi, para que se vea en la partida real.
1. **question** 0–0,9 s: aparece un «?» sobre la forma antigua.
2. **read** 0,9–1,8 s: 18 runas de código convergen (Yomi lee a la familia).
3. **compile** 1,8–2,9 s: capullo hexagonal, barra de progreso y un **único destello suave** a 2,35 s (nunca con movimiento reducido).
4. **awaken** 2,9–4 s: la nueva forma con N estrellas familiares enlazadas (10 en F5), el nombre y «Forma a → b».
Debajo aparece una línea de terminal por acto.

## 5. Isla
Rincón de Yomi en el **Santuario del trueno** (`drawYomiCampPod` en `systems/family-islands.js`): torre radio-faro con pantalla «?», mástil con LED y ondas, antena parabólica y 10 LEDs familiares. **No se ha tocado el arte de Chispín.** Pendiente: retematizar `worlds/yomi-observatory.js` (aún tiene ofudas de papel) y `systems/yomi-trail.js` y `yomi-room.js` (textos de «linternas del alma»).

## 6. Reglas del proyecto
- Nada de gradientes por fotograma (usar colores planos o `canvas-gradient-cache`). Aleatoriedad determinista (hash o semilla) y nunca `Math.random` en el arte o las cinemáticas.
- Tamaños: la CI (`tests/browser/character-size.mjs`) exige alturas visibles de 55/70/85/102/120 px ±15, que crezcan en cada forma y que no cambie la hitbox. El usuario pide una curva de 64/82/100/120/140 (Dino y Dragón ya la usan en su rama). Hay que calibrar `CANVAS_ANATOMY_HEIGHT.yomi` en `characters/visual-size.js` midiendo el arte nuevo.
- Antes de fusionar, ejecutar: `npm test`, `npm run release:check`, `npm run test:browser`, `npm run test:visual` y `npm run test:browser:characters`. `main` se despliega solo en Pages: publicar solo con todo en verde.
- Después de tocar archivos, ejecutar `node tools/update-offline-revisions.mjs`.
- Mantener mínimos y aditivos los cambios en archivos compartidos (draw.js, evolution.js, evo-cinema.js, sw.js y PROGRESS.md). La sección de PROGRESS se llamará «Yomi IA», y la versión se sube al fusionar.

## 7. Archivos tocados
`characters/art/yomi.js` (reescrito), `characters/roster.js`, `systems/ability-catalog.js`, `systems/abilities.js` (J/K/L, `yomiScanStep`, `drawYomiMarks`), `characters/draw.js` (sin placas pintadas ni FX genéricos de cast para Yomi, firmas ping/scan/prism/byte, acentos), `characters/evolution.js` (motivo `signal`, perfil y textos), `systems/evo-cine/yomi.js`, `systems/evo-cinema.js`, `systems/family-islands.js`, textos en u-partners, signature, hero-combos, michi-yomi-play, atrium-interact, u-duet-chemistry, ending-duo, kinetic-stagecraft, evolution-attacks, family-duets, passives y supreme-storyboards, `sw.js` (hashes). Tests: se borran `yomi-reborn` y `yomi-phase2`, se añade `yomi-ia.test.js` y se ajustan `intro-yomi-v348/v358`, `completeness` y `cuerno-origin` (aún pasa).

## 8. TODO / sin verificar
- **Nada se ha ejecutado** desde el último commit WIP. En el último `npm test` fallaron 12 tests (los de diseño antiguo, ya sustituidos o ajustados). Posibles fallos restantes: `tests/browser/*` con textos o colores de Yomi, el mock de `renderers.test.js` (revisar si alguna API de canvas no está declarada), tamaños de CI y `visual-regression`.
- El visual del supremo P y el dúo U (`kind:"maw"` en abilities.js, supreme-cinema.js y family-duets.js) siguen con fauces y ofudas: hay que retematizarlos como un hechizo de constelación.
- `systems/intro-yomi-stage.js` (FX del farol en el título), `costume.js` y `definitive.js` (fallbacks antiguos), `worlds/room-atmosphere.js`, `odyssey-sectors.js` («Archivo de Ofudas») y el jefe `yomi-boss.js`.
- `netlify/lib/combat.mjs` tiene los números antiguos (el multijugador está en pausa).
- Equilibrio: comparar los DPS de J/K/L con Chispín y Michi en partida, y faltan capturas de antes y después de todo.
