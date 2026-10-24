# OHANA V457 · Cierre responsable de la aventura individual

Documento histórico. La estructura anterior de variantes del Claro queda sustituida, para la campaña actual, por [V1-SOLO-ESTRATEGIA.md](V1-SOLO-ESTRATEGIA.md): diez capítulos del Mundo 1 con su protagonista y Quimera. Se conservan la pausa de infraestructura externa y la distinción entre código, pruebas y publicación. El inventario de PR de abajo corresponde a su fecha; comprobar su estado antes de actuar.
**21 octubre 2026 · Rama de consolidación: fix/ohana-solo-closure-20261021**

## Contrato de lanzamiento
- Diez héroes con cinco evoluciones y diez salas **canónicas** de la campaña Isla Hoku.
- Variantes individuales de la sala Claro, sin ampliar artificialmente el grafo canónico.
- Una fase solo se considera cerrada al superar partida real desde forma 0, derrota del minijefe propio, los 100 objetos realmente alcanzables, recompensa aplicada (no solo una etiqueta), cambio de sala, persistencia tras recarga, controles táctiles y calidad visual.
- No presentar tests Node, una PR verde o un módulo importable como prueba de publicación de la URL.
- Multijugador, Netlify, relay, TURN y otro servidor externo: **PAUSA EXPLÍCITA POR CRÉDITOS**. No despliegues ni pruebas remotas ni llamadas pagadas. Solo pruebas locales optativas y manuales, sin servicios externos.

## Matriz de héroes
| Héroe | Variante en motor de juego | Pruebas individuales de cierre pendientes |
|---|---|---|
| Kilo | Claro / Bahía del Compás | Progresión completa, Tambor, 100 flores, ukelele, móvil y recarga |
| Stitcho | Archipiélago del Caos | Núcleo Glitch, 100 chispas, Corazón Galáctico, plataformas móviles |
| Chispín | Islas del Relámpago | Contrastar main con PR #390, jefe Ojo/Titán, recompensas y flor de salto |
| Michi | Jardines de la Luna | Revisar las cinco formas del rediseño, jefe felino, sueño, 100 objetos |
| Dragón | Cordillera de las Brasas | Batida J/K, 4 corrientes, guardián, colisiones y recarga |
| Dino | Valle de los Gigantes | Géiseres J/K, Coloso, huecos, fósiles y guardado |
| Frita | Mercado Dorado | Turbo derrape, Rey Crujiente, plataformas, 100 objetos |
| Pizza | Reino del Horno | Rebotes, Chef Magmático, colisiones del horno y recompensa |
| Yomi | Observatorio Astral | Ofrenda espiritual, jefe, escudos y portales |
| Cuerno | Bosque del Prisma | Corona L, cuernos/arcos, cristales, minijefe y render móvil |

**Estado:** integración de código observada, aceptación manual completa **NO ACREDITADA** en la auditoría. No confundir “Fase cerrada” en textos históricos con versión publicada y jugable de extremo a extremo.

## Inventario de PR existentes (no fusionar a ciegas)
- **#390 Chispín V454.2:** batería en verde en su SHA, pero rama apilada sobre #389 y divergente de main; requiere resolver dependencias/contratos y repetir pruebas con versión integrada.
- **#389 sincronización Chispín:** pausada como parte del multijugador; quality falló en su SHA.
- **#388 mundos personales:** arquitectura preliminar; reconciliar con implementaciones de diez variantes ya presentes en main antes de fusionar; CI falló.
- **#386 reintentos J/K/L:** supersesión probable por #389, **no cerrar sin comparar diferencias**.
- **#380 entrenamiento/estrella/checkpoints:** revisar contra implementación presente y migración de guardado.
- **#331 Cuerno, #330 Yomi, #329 Pizza, #328 Frita, #327 Michi, #326 Dino:** PR artísticas históricas, clasificar como ya implementado / aporte único / descartado tras diff verificable; nunca fusionar antiguas automáticamente.
- **#272 Netlify polling:** congelada por pausa de infraestructura externa.
- **#238 roadmap V101-111:** histórica, candidata a archivo tras comprobar referencias.
- **#227 Reina V94:** antigua PR apilada, comparar con boss actual.
- **#171 Stitcho Soul Pass V50:** antigua y parcial, revisar si sus efectos ya están presentes.

## Calidad requerida en cada commit publicable
1. `npm ci && npm test`.
2. `npm run test:browser && npm run test:visual`, incluidos móviles y accesibilidad.
3. `npm run release:check` con hashes reales del precache, versión offline alineada.
4. GitHub Actions `OHANA CI` y `pages` completamente verdes para el **mismo SHA**.
5. Comprobar URL Pages en navegador y el SW tras actualización.
6. Prueba humana de dificultad, cámara, saltos, plataformas alcanzables, minijefes y recompensas en cada héroe.

## Cambios seguros y obligaciones pendientes
- CI cooperativa local opcional con `run_multiplayer`; no despliegue a Netlify.
- Históricos como `HANDOFF_V373.md`, `IMPROVEMENTS.md` y `PROGRESS.md` se mantienen para trazabilidad, no se borran para simular limpieza.
- Los créditos pagados agotados no se eluden creando otra infraestructura.
- Una PR con validación positiva en su cabeza no equivale a tests pasados sobre main.
