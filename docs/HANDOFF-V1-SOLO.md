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
