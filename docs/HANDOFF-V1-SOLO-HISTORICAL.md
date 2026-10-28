# Estado actual: V2 / ohana-600

La V514 de PR440 está integrada. Continuar con [V2-ADVENTURE.md](V2-ADVENTURE.md) y
[V600-VALIDATION.json](V600-VALIDATION.json): segundo acto, treinta descubrimientos,
guardianes reactivos y colección con recompensa real. V600 publicada: Quality completa y Pages aprobados; 46 archivos runtime verificados en vivo.
El informe V513 que sigue es histórico; no acredita la publicación de V600.

# Estado vigente — V513, candidato completo de campaña individual

Workspace `/workspace/ohana-stitcho`, rama `feat/v513-complete-solo-experience`, base `3fe0b84`.
Los seis frentes pedidos por el usuario están implementados. Ver la resolución V513 en
[V1-FINAL-REVIEW.md](V1-FINAL-REVIEW.md), las evidencias en `V513-VALIDATION.json` y
la publicación en `v1-solo-status.json`. No reutilizar la tabla histórica V512 como pendientes actuales.

Diez decorados de fantasía Canvas cacheados; recorridos altos y encuentros finitos
por héroe; diez anatomías de enemigos y Tambor tallado articulado; Yomi de papel/memoria
con feedback de análisis real. Ritmos de articulación y caída propios. Selección en
jardín habitado, introducción en tres profundidades, entrada única y compañero U de
ocho segundos con recuperación real.

Campaña continua: comienza cada capítulo nuevo como bebé, gana sus cinco formas,
recupera diez sellos y entra en Quimera como Kilo Flor Solar. Al revisitar una sala
sellada recupera la forma ganada silenciosamente; el jefe queda derrotado. Los mil
recuerdos y las diez reliquias se recogen y persisten. Colección opcional para terminar.

Validación: `npm test`, `release:check`, `test:browser:campaign`,
`test:browser:memories`, `test:browser:memory-save`, `test:browser:pressure`,
`test:browser:living-stage`, matriz óptica, auditoría general y salto táctil.
Primero ejecutar campaña para producir su respaldo; recuerdos puede reanudar su
checkpoint legítimo. Los scripts distinguen fixtures de presentación de progreso ganado.
Logs en `/workspace/.cloud-setup/logs/ohana-v513-*`; capturas e informes en
`test-results/v513/` (algunos drivers heredados guardan en v511/v512).
`node_modules` es un enlace NO versionado: no añadirlo a git.

La aceptación artística y de dificultad percibida corresponde al usuario jugando.
IA local por partida, sin aprendizaje persistente ni LLM remoto. Multijugador sigue
fuera de este cambio. No declarar aceptada V1 por el usuario a partir de tests.

---

## Referencia histórica de V501 (superada por el estado de arriba)

# Reanudar OHANA sin depender del historial del chat

## Leer primero

1. `AGENTS.md` y `CHARACTER-PHASES.md`.
2. `V1-SOLO-ESTRATEGIA.md`: alcance, orden y paquete de Stitcho.
3. `CAPITULOS-IDENTIDAD.md`: qué hace distinta cada sala.
4. `v1-solo-status.json` y `V501-AVENTURA-CLARA.md`: estado y pruebas.

El usuario ha reabierto expresamente Kilo para esta campaña; el cierre V445 es una referencia histórica de su repertorio. No usarlo para deshacer las mejoras autorizadas de K/J.

## Workspace y entrega

- Repositorio: `/workspace/project-ohana`, GracianB/project-ohana.
- Rama local: `feat/v501-playable-journey`; base `981526fc51177355f138e6f7f3917f5d037dade7`.
- Hay cambios locales acumulados e intenciones de añadido. No hacer reset, checkout destructivo ni perder archivos nuevos.
- ZIP: `/workspace/.cloud-setup/project-ohana-v501.zip`.
- Componentes del ZIP: `/workspace/.cloud-setup/ohana-v501/INSTRUCCIONES.md`, `manifest.json`, parche binario, archivos completos, capturas e informes.
- No se ha creado PR ni publicado desde este workspace. Antes de aplicar en GitHub, comprobar main y trabajo/PR de otras sesiones. `git apply --check` primero; adaptar preservando cambios posteriores. No fusionar parches históricos a ciegas.
- Multijugador e infraestructura externa siguen en pausa. Esta tarea es V1 de un jugador.

## Implementado y comprobado localmente

Diez dueños de capítulo, entrada bebé al cambiar de sala, Continue del héroe guardado, selector por capítulos, ambientes/música, antenas persistentes, viajes voluntarios con E, objetivos, historia táctil, álbum accesible y guardado de estaciones.

Kilo: cuatro notas con XP mínima 55/140/260/420, encuentros, Tambor propio del capítulo, nota+derrota para nuevo sello, levitación intermedia, vuelo solar sostenido/cancelable que se corta por daño, J dirigido, flancos por altura, vigías, avisos aéreos y tres carillones persistentes. El aura/reflejo no dura indefinidamente. La última ejecución física ganó formas/carillones/guardián y verificó dos Continue, sin inyectar vida, posición, XP o victoria, con 0 muertes. Eso no certifica diversión, balance humano ni campaña completa.

Referencia de validación: 1.496 Node PASS; release gate PASS, 310 módulos runtime y 360 recursos; auditoría general, capítulos/arte/música, historia, poderes, piloto Kilo y controles aéreos PASS. La entrega presente añade planificación, no una nueva mecánica. Logs en `/workspace/.cloud-setup/logs/ohana-v501*.log`, evidencias en `test-results/v501/`.

## Siguiente acción

Implementar el paquete de Stitcho de V1-SOLO-ESTRATEGIA.md. Auditar sus módulos y guardado antes de tocar nada. `game.spawnStitchoBoss` y el creador del jefe todavía apuntan a `hub`; sus límites no sirven automáticamente para la sala nueva. Conservar contratos antiguos mediante parámetros/valores por defecto y crear IDs del capítulo.

Después: Chispín → Michi (`cat`) → Cuerno → Dragón → Dino → Frita → Pizza → Yomi → integración de Quimera → campaña completa → aceptación humana → candidato publicado. Kilo sigue pendiente de revisión humana y auditoría de sus cien recuerdos. El plan final recomienda Kilo Flor Solar contra Quimera; esa normalización aún no está implementada.

## Archivos de entrada útiles

- `game.js`: carga, cambio de protagonista, combate, save, callbacks y arnés E2E.
- `systems/world1-rooms.js`: orden real, estaciones y WORLD1_CHAPTER_PLANS.
- `systems/world1-play.js`: estado del capítulo, objetivos, premios y salidas.
- `systems/world1-progress.js`: entrada/desbloqueo por capítulo.
- `systems/save.js`: contrato y sanitización v2/v3; probar IDs nuevos con pack/unpack.
- `systems/kilo-chapter.js`, `kilo-flight.js`, `grove-guardian.js`: referencia de integración; no copiar la interacción musical a todos.
- `systems/stitcho-trail.js`, `stitcho-boss.js`, `stitcho-room.js`: próximo paquete.
- `tests/browser/v501-kilo-chapter.mjs`: modelo de piloto físico; `v501-kilo-airplay.mjs`: fixtures de diagnóstico separadas.

## Comprobaciones y actualización de entrega

```sh
npm ci --no-audit --no-fund
npm test
npm run release:check
CHROMIUM_BIN=/usr/bin/chromium npm run test:browser
CHROMIUM_BIN=/usr/bin/chromium npm run test:browser:kilo-chapter
CHROMIUM_BIN=/usr/bin/chromium npm run test:browser:kilo-airplay
```

Añadir el piloto del siguiente capítulo cuando exista. Los scripts admiten CHROMIUM_BIN porque descargar Chromium desde el CDN no funcionó en este entorno. CI puede instalar su Chromium de Playwright. Las pruebas visuales existentes siguen siendo requisito del candidato final; no se declaran ejecutadas ahora por repetir esta lista.

Si cambia runtime: actualizar hashes con `node tools/update-offline-revisions.mjs` después de los últimos cambios y antes de ejecutar la suite; no editar runtime mientras corren comprobaciones de hashes. Probar el cambio y las regresiones afectadas, sin repetir baterías ya verdes sin motivo.

Actualizar la matriz/JSON con evidencia, README/PROGRESS cuando cambie el estado y el ZIP con `git diff --binary HEAD`. Incluir archivos nuevos en el parche mediante intención de añadido; revisar `git diff --check`, correspondencia ZIP/fuentes y aplicación inversa del parche. Conservar base/branch/published=false hasta integración y publicación verificadas. Nunca marcar pendientes como aprobados ni llamar “V1 completa” a un cambio solo local.


## Publicación verificada y siguiente rama · 24 de octubre de 2026

V501 publicada en https://gracianb.github.io/project-ohana/ desde `2139967c30fb04266428addfffe0d41850a06fc7`.
Pages: https://github.com/GracianB/project-ohana/actions/runs/40134908925 (correcto).
La matriz visual completa local terminó con `OHANA VISUAL MATRIX PASS`; los archivos públicos
index.html, sw.js, game.js, kilo-chapter, world1-play y los tres módulos de cooperación
verificados coinciden por SHA256 con el commit publicado. Los capítulos restantes siguen pendientes.

La rama `feat/v502-stitcho-chapter` prepara la adaptación de Núcleo Glitch con arena, origen,
roomId e ID persistente configurables. Conserva los valores históricos del hub. Su prueba
recorre los cuatro patrones dentro de los límites del capítulo. Esta preparación no integra
ni cierra todavía el capítulo de Stitcho y no forma parte de la V501 publicada.


## V502 · capítulo de Stitcho integrado

Sustituye la preparación anterior: `w1-stitcho` carga ahora su propio Glitch y su
ID de derrota. Tres reparaciones + raíl real de bola + jefe son obligatorios para
un sello nuevo; los sellos antiguos siguen siendo válidos. Hitos de XP mínimos:
55 / 140 / 260 / 420, sin premios duplicados ni reducción de XP mayor. La pieza 0
sigue siendo válida y el guardado conserva talleres y raíl. La zona de bola y
los talleres tienen sus columnas de acceso despejadas; hay una ruta elevada de
mantenimiento entre talleres. No se ha trasladado íntegramente el viejo hub ni
se afirma que sus cuatro raíles móviles/arcos estén en este capítulo.

Piloto físico: acceso directo a `w1-stitcho` como única fixture; sin cambiar posición,
XP, HP, formas, enemigos ni victoria. Cinco formas ganadas, cero muertes, Continuar
a mitad, bola táctil usando el save ganado y salida física a Chispín bebé. Evidencia:
`test-results/v502/stitcho-pilot.json`; comando `npm run test:browser:stitcho-chapter`
(`CHROMIUM_BIN=/usr/bin/chromium` solo en este entorno). Suite Node: 1.500 pruebas.
La aceptación humana y la alcanzabilidad de los cien recuerdos siguen pendientes.
Siguiente integración: Chispín. Mantener las cuatro antenas persistentes.


## V503 · revisión de Kilo tras prueba humana

El usuario confirmó que jugaba «Claro de Kilo»: dificultad demasiado baja, enemigos
aparentemente inofensivos, jefe trivial y forma máxima/candados sin llegar a desbloquear.
La integración de Chispín se pausa para esta corrección expresamente autorizada.
Contrato de ajuste en `KILO-V1.md`, sección V503. El mínimo de XP de notas ahora
se aplica también con sello previamente ganado. La fixture de compatibilidad
`tests/browser/v503-kilo-save-recovery.mjs` reproduce un save con sello y forma 4/5,
verificando forma final restaurada; no se confunde con una victoria física.
El piloto físico sigue ganando sus cinco formas, tres carillones y sello, y ahora
exige al menos tres ataques ejecutados del Tambor. Stitcho mantiene su piloto.
La validación automatizada no sustituye una segunda aceptación humana de dificultad.


## V504 · contacto real y ruta del cielo

Usuario: pisotones sin daño, contacto lateral inconsistente, objetos invisibles,
calidad visual de enemigos/Tambor, más actividad aérea y cristales XP.
Causa confirmada de pisotones: el `continue` de updateCampaignEnemy eludía el bloque
común de colisión. Ese bloque se extrae a resolveEnemyContact y lo consumen también
campaña y Tambor. Incluye daño lateral incluso en reposo, rebote por pisotón,
invulnerabilidad y texto de daño efectivo. La prueba de navegador v504-contact
usa un enemigo de campaña dormido como fixture explícita y verifica daño real,
rebote y ausencia de doble daño al aterrizar encima; el mismo enemigo duele de lado.

Kilo añade 42 cristales reales de +XP (24 bajos y 18 elevados), dos vigías aéreos
y cinco aros secuenciales recorridos en vuelo, con premios únicos guardados.
La prueba de aros usa acceso/posición/forma como fixtures, y movimiento de vuelo
real para atravesar cada aro; no acredita una segunda campaña física.
Tambor: contornos oscuros y detalles de ojos/mazas/tambor. Plataformas finas de
Kilo llevan bordes dibujados sobre sus rectángulos reales. El reporte de objetos
invisibles sigue pendiente de ubicación concreta; no se afirma resuelto por entero.


Aclaración posterior: los objetos reportados eran probablemente diamantes amarillos,
uno arriba a la izquierda. Los cristales XP se dibujan ahora con opacidad explícita,
sin filtro heredado y con contorno oscuro; los diamantes grandes de secreto llevan
contorno oscuro y rótulo «SECRETO · +18 XP» para distinguirlos. Son mejoras de
visibilidad y lectura, sin afirmar haber reproducido una desaparición concreta.


## V505 · feedback de daño y orientación aérea

Se continúa el pulido de Kilo. H, J normal y hitEnemy propagan el delta real de HP;
los bloqueos no pagan XP, score, combo ni carga. No hay número nominal que finja
un impacto en Tambor protegido. «BLINDADO» se limita a un aviso cada 30 ticks por
enemigo. Las pruebas unitarias cubren el presupuesto parcial de ventana y los
premios; la fixture de navegador usa enemigo dormido blindado y elimina cristales
para aislar XP de golpes, comprobando H/J reales que llegan al blanco sin premios.
No representa una victoria física.

La ruta opcional de vuelo indica el siguiente aro y dirección, conserva la misión
principal de notas, y muestra la finalización. Pilotos físicos de Kilo y Stitcho
aprobados; vuelo de los cinco aros y colisión normal también. Suite Node: 1.509.
Evidencia en logs ohana-v505-*.log, tests/browser/v505-honest-hits.mjs y
captura test-results/v504/kilo-sky-route.png actualizada. No se declara aceptación
humana ni cierre de los cien recuerdos. Chispín sigue como siguiente integración.


## V506 · Chispín integrado · 25 de octubre de 2026

`chispin-chapter.js` integra las cuatro antenas persistentes, crecimiento mínimo
55/140/260/420 XP y tres arcos con ventanas abiertas/aviso/activas. J aceptado dentro
de 250 px cortocircuita el arco 150 ticks; K permite cruzarlo y esperar sigue siendo
viable. Los arcos no borran antenas ni son llaves ocultas. Ruta elevada y grupos
orientados a cadena/tormenta. Se conserva la pieza histórica del hub.

Titán del capítulo: arena 8260–9320, ID `w1-chispin-titan-v1`, 640 PV y núcleo
abierto con presupuesto de 160 por recuperación. Despierta con cuatro antenas y
forma final; requiere varios ataques y fases antes de caer. Tormenta fija tres
columnas al iniciar el aviso, con dibujo y proyectiles en esas posiciones. Cuatro
antenas + derrota real dan un sello nuevo; sellos antiguos siguen válidos.

Piloto físico desde bebé: acceso directo a sala como única fixture; sin posición,
XP, salud, formas, enemigos o victoria inyectados. Cinco formas ganadas, cuatro
antenas, J cortocircuitando un arco real, Continuar a mitad, cinco ataques ejecutados
y los cuatro patrones vistos, cero muertes, blink táctil desde save ganado, salida
física a Michi bebé. Evidencia `test-results/v506/chispin-pilot.json`; comando
`npm run test:browser:chispin-chapter` (CHROMIUM_BIN en este entorno).
Kilo y Stitcho vuelven a pasar. Node: 1.512 pruebas. Los cien recuerdos y la dificultad
humana siguen pendientes. Siguiente integración: Michi (`w1-cat`), manteniendo su
control de grupos, rutas suspendidas y Espíritu Astral Felino.


## Ampliación V506 por nueva dirección del usuario

Antes de publicar V506, el usuario pidió rehacer fondos de Stitcho/Chispín, entradas,
I confuso, compañero flotante, Flor Solar blanca y objetivos de los tres. Se añade
`worlds/ohana-crafted-scenes.js`: costa/astillero y santuario diurno en nubes, curvas,
capas, paralaje y gradientes de cielo cacheados; terrenos con colores propios y
sin gigantes geométricos. Paisaje de Kilo conservado. Actores reales animados en
roomEnter; Kilo entra después de su prólogo. El compañero U sigue junto al héroe,
con objetivo a su altura/suelo y ataques cercanos, en vez de flotar hacia blancos.
I: tres H/J distintos con impacto real, cualquier orden y sin caducidad; los tests
históricos se actualizan al requisito expresamente reabierto. Forma final de Kilo
blanca/marfil, halo de hojas; arnés e insignia en Stitcho. Hibiscos curvos, antenas
con bobinas, módulos con su nave al final. L de Kilo espíritus vegetales y tormenta
Chispín sin gran sello circular. Pintura decorativa no crea colliders.

Pruebas visuales de acceso/forma/cámara explícitas en
`tests/browser/v506-visual-experience.mjs`; no se presentan como victorias. Capturas
`test-results/v506/*-new-landscape.png`, `*-arrival.png` y
`kilo-white-spirit-and-friend.png`. Revisar esas imágenes y dificultad con el usuario;
no afirmar aprobado humano ni prometer que el resto de salas fue rediseñado.


## V507 · Michi, Cuerno y Dragón · 25 de octubre de 2026

Workspace actual `/workspace/ohana-stitcho`, rama `feat/v507-lunar-prism-embers`,
base `5db93d1` (V506 publicada). La planificación anterior de Stitcho/Chispín es
histórica; siguiente integración: **Dino**. No reaplicar ZIPs antiguos.

`systems/chapters-lunar-prism-embers.js` integra progreso, espejo de Cuerno,
apoyos reales de medusas y térmicas de Dragón. J aceptado restaura el espejo una
sola vez y enciende braseros próximos por delante. XP mínima absoluta evita
bloqueo de forma final sin dar premios repetidos. Guardado de estaciones/secretos
y derrotas usa el contrato existente. Michi llega a 420 con la quinta medusa;
Cuerno necesita espejo + tres prismas; Dragón cuatro braseros. Un sello nuevo
requiere además su jefe realmente derrotado; sello antiguo válido conserva XP.

Los tres creadores de jefes aceptan arena/roomId/chapter opcionales y conservan
sus valores por defecto de hub. Capítulos: arena 8260–9320, suelo 1134, 640 PV,
ventanas de daño de 160, cuatro ataques y avisos. Michi fija columnas al avisar;
Dragón fija abanico antiaéreo si el jugador está alto. Cuerno ancla sus pezuñas al
suelo y usa un solo HUD; no se dibuja el enemigo genérico debajo del jefe propio.

Pilotos: `npm run test:browser:lunar-prism-embers` (CHROMIUM_BIN en este entorno).
Única fixture de acceso: entrar a cada capítulo. Movimiento, combate, cinco formas,
objetivos, guardado/Continuar, sello y salida al siguiente bebé ganados mediante
teclas. Cero muertes; ataques ejecutados Michi 6, Cuerno 7, Dragón 4, cuatro patrones
en todos. Dragón usa térmica; Michi verifica cinco apoyos; Cuerno espejo persistente.
No equivalen a aceptación humana de dificultad ni auditoría de cien recuerdos.

`npm run test:browser:three-realms` usa fixtures de forma/cámara sólo para
presentación: tres entradas, fondos propios, movimiento reducido y J táctil real.
Capturas en `test-results/v507/`; pruebas Node de progresión/compatibilidad en
`tests/chapters-lunar-prism-embers.test.js`. Las tres salas reutilizan repertorio
propio existente y ahora lo conectan a la campaña; no se afirma V1 terminada.

Validación V507: 1.517 Node PASS, release gate PASS (314 módulos / 364 recursos),
auditoría Chromium general PASS, pilotos Kilo/Stitcho/Chispín PASS; capturas de las
tres salas y controles táctiles revisadas. Logs `/workspace/.cloud-setup/logs/ohana-v507-*`.

Publicación V507 verificada: commit `6ddc0aa`, Pages
https://github.com/GracianB/project-ohana/actions/runs/40157004932 en Success.
https://gracianb.github.io/project-ohana/?release=507 sirve once archivos runtime
con SHA256 idéntico al candidato local, incluido el nuevo módulo y sw.js.
Informe: `/workspace/.cloud-setup/logs/ohana-v507-live-verification.json`.
Siguiente paquete: Dino; aceptación humana de estos tres sigue pendiente.


## V508 · Dino: peso y aterrizajes · 25 de octubre de 2026

Workspace `/workspace/ohana-stitcho`, rama `feat/v508-dino-impact`, base `18d86b4`.
Siguiente integración: **Frita**. Multijugador permanece fuera del alcance.

`systems/dino-chapter.js` registra la altura real del salto. Cuatro placas:
ID0 x2480 / caída40, ID3 x4080 / caída80, ID1 x5680 / caída120,
ID2 x7280 / caída180. IDs0–2 antiguos conservados; orden visual oeste→este.
Aterrizar requiere velocidad descendente >6, pies en la altura real de la placa,
centro a menos de 70 y altura suficiente. Una cornisa por encima no activa la
placa de abajo. Los escalones permiten intentos repetidos sin pozos mortales.
Cada placa garantiza XP mínima absoluta 55/140/260/420, sin premios repetidos.

K aceptado en el aire acelera la caída; no otorga altura ni completa objetivos
por sí solo. Impactos válidos abren escudos próximos durante 45 ticks mediante
`_guardBreak`; se conserva protección del jefe. El cambio compartido de escudos
sólo actúa cuando existe esa marca, aplicada únicamente por el capítulo Dino.
Los enemigos de Dino usan `anchorFloor` para colocar sus pies con su altura real;
`anchorY` sigue compatible para otros mapas. Corazas y vigías son criaturas de
suelo, evitando abejas que nacían atravesando el suelo y caían fuera del mapa.

Coloso: creador parametrizado, defaults de hub intactos; capítulo arena8260–9320,
suelo1134, 640PV, ID `w1-dino-colossus-v1`, cuatro patrones, recuperación160PV.
Se dibuja un solo cuerpo propio con pies al suelo y HUD compartido. Contacto y
pisotones consumen el resolver real. Para un sello nuevo se necesitan cuatro
placas y derrota real; sellos antiguos válidos conservan progreso final.

Valle con cielo jade claro, cañones curvos/estratos, cascadas fluidas, manadas,
pterosaurios, helechos y cráneo fósil. Conserva el arte procedural existente,
sin duplicar el render del fondo. Entradas animadas con el actor bebé y terreno
verde propio. Movimiento reducido conservado. No se afirma aceptación humana
ni alcance físico de cien recuerdos.

Piloto `npm run test:browser:dino-chapter`: única fixture de acceso entrar a Dino;
movimiento/combate ganan cinco formas, placas, guardado/Continuar tras dos,
cuatro patrones, victoria y salida a Frita bebé. Salto+K táctil desde save ganado
con reloj determinista; el reloj evita que una máquina ocupada complete el salto
entre dos pulsaciones de prueba. Presentación usa forma/cámara explícitas en
`npm run test:browser:dino-presentation`, sin presentarla como victoria.


Cierre local V508: 1.522 Node PASS; release gate PASS (315 módulos/365 recursos),
auditoría Chromium PASS y regresiones físicas de Kilo/Michi/Cuerno/Dragón PASS.
Dino físico verificado con cuatro placas, cinco formas, Continue, cinco ataques
reales del Coloso y cuatro patrones, cero muertes; salida a Frita bebé. Móvil:
salto real + K desde save ganado, sin posición/vida/forma inyectada. Capturas de
presentación usan fixtures explícitas. Rediseño del Coloso sólo para el capítulo:
dinosaurio de piedra con pies, dientes, placas curvas y grietas/núcleo de ámbar;
el arte histórico del hub sigue disponible. `dino-colossus-design.png` inspeccionada.
No se ejecutó la matriz histórica completa de capturas/campaña; estos resultados
no acreditan campaña entera, aceptación humana ni cien recuerdos alcanzables.


Publicación V508 verificada: commit `bc26ab2`, Pages
https://github.com/GracianB/project-ohana/actions/runs/40183070346 en Success.
https://gracianb.github.io/project-ohana/?release=508 sirve quince archivos runtime
con SHA256 idéntico al candidato, incluidos nuevo capítulo, Coloso, fondo y sw.js.
Informe `/workspace/.cloud-setup/logs/ohana-v508-live-verification.json`.
La repetición del piloto final pasó con cinco ataques, cero muertes, Continue,
caída táctil y Frita bebé; captura móvil renderizada con reloj controlado.
Siguiente: Frita, manteniendo pendientes revisión humana y cien recuerdos.


## V509 · Pizza y ampliación de Dino · 25 de octubre de 2026

El usuario pide Pizza y Dino expresamente; no sustituir Pizza por Frita. Rama
`feat/v509-pizza-dino`, base `6097767`, workspace `/workspace/ohana-stitcho`.
Frita y Yomi siguen pendientes de integración completa de capítulo.

Pizza: `systems/pizza-chapter.js`, secreto `w1-pizza-first-bake-v1` garantiza
primera forma 55XP. Tres repartos garantizan 140/260/420. Horno inicial x1920;
entrega ID1 abre x4320, ID2 abre x5920. El horno original sigue disponible.
Recoger en cualquier horno activo da 1050 ticks de calor; la caja y barra muestran
calor real. Si caduca, volver al horno local sin borrar entregas. Horneado/estaciones
se guardan; comida y reloj en curso no sobreviven a Continue ni muerte, por diseño.
No se repiten premios del primer horneado ni clientes ya servidos.

Chef del capítulo: `w1-pizza-chef-v1`, arena8260–9320, suelo1134, 640PV,
cuatro patrones y ventana160. Los helpers excluyen el horno de la condición de
objetivos resueltos: sólo importan los tres clientes y derrota real para sello nuevo.
Defaults del jefe en hub y sellos antiguos se mantienen. Chef con cuerpo propio,
gorro de tela, guantes, zapatos y pala; sin cangrejo genérico por debajo ni doble HUD.
Puerto de atardecer claro, mar, fachadas, hornos curvos y clientes; llegada animada.

Dino: K aéreo prepara una onda para el siguiente aterrizaje real. Consume una vez
la preparación, abre escudos cercanos y llama a `hitArenaEnemy` (daño/recompensas
reales, protección y presupuesto del jefe respetados). Alcance150+20*evo horizontal,
sólo enemigos con pies a menos de65 de altura. Aire alto fuera del alcance. Cambiar
sala, morir o cambiar actor no puede transportar el ataque a una sala nueva.
K sigue rodando en suelo y la guía explica ambas acciones. Las placas conservan
sus alturas y contacto real. Ondas verificadas con teclas sobre enemigos normales:
se reserva un enemigo vivo para salto+K, en vez de matarlo con H/J antes de medir.

Pilotos físicos: Pizza cinco formas, tres clientes, tres hornos, Continue tras dos,
cuatro patrones, Chef ejecuta8 ataques, cero muertes, móvil J y salida a Yomi bebé.
Dino cinco formas, placas, guardado, siete ataques del jefe, dos impactos con daño
real verificados, cero muertes, móvil salto+K y Frita bebé. Relojes deterministas;
la única fixture de acceso es entrar al capítulo, sin inyectar posición/HP/XP/victoria.
Presentación de Pizza/Dino usa fixtures de forma/cámara explícitas, no victorias.

Validación Node1.526 PASS; release gate316 módulos/366 recursos, Kilo físico PASS.
No se declara campaña completa, matriz histórica entera ni aceptación humana de
balance o alcance físico de cien recuerdos. Siguiente planificación: Frita.


Publicación V509 verificada: commit `ddbe69c`; Pages
https://github.com/GracianB/project-ohana/actions/runs/40184866805 en Success.
https://gracianb.github.io/project-ohana/?release=509 sirve diecinueve archivos runtime
con SHA256 igual al candidato local, incluidos Pizza, Dino, fondos, habilidades y sw.js.
Informe `/workspace/.cloud-setup/logs/ohana-v509-live-verification.json`.
Auditoría Chromium general PASS. Piloto final Pizza: ocho ataques del Chef,
cero muertes, Continue, J táctil y salida a Yomi bebé. Dino: siete ataques,
dos impactos reales verificados, cero muertes, Continue, caída táctil y Frita bebé.
Primera ejecución de Pizza había registrado12 ataques; prevalece el informe final8.


## V510 · Frita y Yomi · 25 de octubre de 2026

Workspace `/workspace/ohana-stitcho`, rama `feat/v510-frita-yomi`, base `cc9d1e0`.
Los diez capítulos tienen ahora integración individual; **eso no acredita campaña
completa ni V1 lista**. Siguiente trabajo: recorrido concatenado, Quimera, balance
humano y auditoría de cien recuerdos. No comenzar multijugador por este hito.

Frita: `frita-yomi-chapters.js`, primer lanzamiento persistente secreto
`w1-frita-first-launch-v1` garantiza55XP. Tres premios garantizan140/260/420.
Conserva IDs0–2. Fuerzas20/22/24, desplazamientos+100/-110/+140 y alturas360/430/500.
Géiser listo105ticks, recarga45, aviso30 dentro de ciclo180 con desfase por estación.
Corredor libre abarca plataforma→premio, no sólo la vertical del géiser. J aceptado
durante ese lanzamiento aplica una corrección limitada, una vez por vuelo. Primer
lanzamiento y premios guardados; trayectoria/cooldowns transitorios no persistidos.

Yomi: IDs0–3 conservados, ciclo180; AHORA55ticks, preparación150–179 y espera entre
ellos. J aceptado dentro230px prolonga75ticks una ventana ya activa, sin conectar
remotamente ni abrir una fase oscura. Conectar requiere acercarse. K conserva su
cortafuegos; cuatro terminales garantizan55/140/260/420XP. Campos temporales no se
guardan. Los terminales pintados consultan el mismo estado real que la interacción.

Ambos jefes parametrizados, defaults del hub intactos. Capítulo640PV en arena8260–
9320, suelo1134, cuatro ataques y recuperación160PV. IDs `w1-frita-king-v1` y
`w1-yomi-custodian-v1`. Objetivos + derrota real para sello nuevo; sellos antiguos
siguen válidos. Contacto/pisotón real, un cuerpo por jefe y HUD único. Cangrejo rey
y autómata del observatorio con superficies/piezas propias y movimiento reducido.

Frita mantiene el diner neón con cielo de hora azul más luminoso; Yomi usa nuevo
`worlds/yomi-dawn.js`: cúpulas de cristal, telescopios, planeta, cables y vegetación.
Plataformas propias y entradas con actores. Fondos no introducen colisiones.

Pilotos con teclas: única fixture de acceso entrar al capítulo, sin posición/vida/
XP/forma/victoria inyectada. Cinco formas, objetivos, Continue tras dos, cuatro
patrones y victoria real. Frita: cinco ataques del jefe, cero muertes, J corrector
real, móvil J y salida a Pizza bebé. Yomi: ocho ataques, cero muertes, J ampliando
ventana real, móvil J y entrada en la procesión final. No representa una campaña
concatenada ni victoria sobre Quimera. Presentación usa fixtures explícitas.

Validación:1531 Node PASS; release gate319 módulos/369 recursos, auditoría Chromium
PASS, regresiones físicas Kilo y Pizza PASS; integridad offline tras el último arte
PASS. Matriz histórica completa no repetida. Aceptación humana pendiente.

Observación para la siguiente integración final: `world1DoorOpen` permite entrar
al final con el sello de Yomi y `spawnFusionBoss` no comprueba explícitamente los
diez sellos, pese al comentario histórico. El piloto aislado entra en la procesión
con sólo el sello de Yomi; se detiene antes de la arena. Auditar/cerrar esa condición
y la selección/forma para Quimera antes de afirmar V1 completa.


Publicación V510 verificada: commit `e2ca7dd`, Pages
https://github.com/GracianB/project-ohana/actions/runs/40186344617 en Success.
https://gracianb.github.io/project-ohana/?release=510 sirve dieciséis archivos runtime
con SHA256 igual al candidato, incluidos módulos nuevos, jefes, fondos y sw.js.
Informe `/workspace/.cloud-setup/logs/ohana-v510-live-verification.json`.
Siguiente tarea: integración final/campaña concatenada; no declarar V1 lista.


## V511 · Diez salas: aspecto y recorrido · 25 de octubre de 2026

El usuario rechaza la calidad de las diez salas y confirma explícitamente que
fallan **tanto aspecto como recorrido**. Reabre las salas, incluida Kilo; no se
replantea su repertorio. Workspace `/workspace/ohana-stitcho`, rama
`feat/v511-ten-authored-rooms`, base `308fa40`. Siguiente: prueba humana de esta
revisión y la integración final pendiente, no otra declaración de V1 lista.

`systems/chapter-room-composition.js`: elimina la plantilla aleatoria MOTIFS;
29 taludes de48–72px repartidos en las diez salas, suelo continuo sin pozos nuevos.
Son colisiones reales que bloquean caminar: se atraviesan saltando o con movilidad.
Perfiles reservan estaciones/talleres/lanzamientos y arena8260–9320 al suelo1134.
Checkpoints y cristales siguen el suelo real. Los enemigos tienen sus pies sobre
la superficie real. Objetivos, XP garantizada, IDs de estación y jefes conservados.

Rutas opcionales por personaje: raíces, muelles, acueductos, setas lunares, terrazas
prismáticas, perchas de forja, mesetas de fósiles, toldos, balcones y pasarelas.
Alturas/anchuras/desniveles distintos; vigía opcional y20 secretos usando los IDs
históricos secret-0/secret-1. No farmear premios de secretos ya guardados.
`campaign-exploration.js` usa estas rutas y deja de insertar ocho repisas/lifts
comunes al entrar a cada sala. No se materializan plataformas al final.

`worlds/chapter-stagecraft.js`: diez materiales con bordes sobre colisiones reales,
sombreado por capas, estratos/mampostería y detalles vegetales/mecánicos. Hitos
escénicos: árboles de raíces, diques/grúas, conductores, sauce lunar, invernadero,
forja, costillas fósiles, mercado, piazza y planetario. Pertenecen al fondo;
los colliders son exclusivamente los del plano. Paisaje base de Kilo conservado.

Correcciones necesarias por el nuevo relieve: criaturas de suelo se detienen y
saltan contra bancos, sin enterrarse ni morir debajo. Al crecer conservan los pies
y no se teletransportan al borde del suelo; prueba roja antes y verde después.
Se limita esta adaptación a roomDef.composition para no alterar mapas históricos.
Proyectiles salen del update al chocar contra terreno, sin golpear después de
consumirse en la pared. Así el relieve sirve como cobertura real.

Validación:1536 Node PASS; release gate321 módulos/371 recursos; auditoría Chromium
PASS. Los diez pilotos físicos ganan sus cinco formas, objetivos, jefes, Continue
y transiciones, sin inyectar posición/vida/XP/forma/victoria. Acceso directo a sala
es fixture explícita. `authored-terrain-controls.mjs` ayuda al piloto manteniendo
W ante un talud real: sólo teclado ordinario, no bypass de colisiones. Se conserva
la prueba completa de habilidades de cada héroe. Evidencia logs ohana-v511-*-verified.

`v511-room-traversal.mjs`: en las diez salas andar se detiene en el talud y saltar
lo cruza; salto táctil sostenido por Input.dispatchTouchEvent de Chromium también
lo cruza. `v511-ten-room-direction.mjs`:30 capturas de fixtures de forma/cámara,
escritorio real separado del contexto móvil táctil, sin afirmar victorias por fotos.
Capturas `test-results/v511/*-arrival.png`, `*-route.png`, `*-mobile.png`.

No se declara aceptada la calidad subjetiva ni verificados los cien recuerdos.
La matriz histórica de75min y sus pilotos anteriores a la campaña V501 no se
han repetido/adaptado; no afirmar ese gate completo. Sigue pendiente el recorrido
concatenado y cierre de Quimera, incluida la observación sobre su guardia de sellos
indicada en V510. No habilitar multijugador por cerrar esta iteración de salas.


Publicación V511 verificada: commit `21fa9c9`, Pages
https://github.com/GracianB/project-ohana/actions/runs/40189221098 en Success.
https://gracianb.github.io/project-ohana/?release=511 sirve los nueve archivos runtime
modificados con SHA256 idéntico al candidato, incluidos composición, superficies,
exploración, enemigos, game.js y sw.js. Informe
`/workspace/.cloud-setup/logs/ohana-v511-live-verification.json`.
Diez pilotos completos de la geometría final PASS; prueba de caminar/saltar y
salto táctil PASS;30 capturas finales separan escritorio y contexto móvil real.
Siguiente: aceptación humana del aspecto/recorrido e integración final pendiente.
