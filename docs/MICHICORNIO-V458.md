# OHANA V458 · Michicornio · diez versiones de cierre

**Base:** OHANA V457 publicada. **Rama:** `feat/michicornio-v01-v10-20261021`.
**Regla:** `cat` continúa como identificador canónico en guardado, combate y colección; `michi` y `michicornio` se resuelven a ese ID. Nunca eliminar o migrar sin necesidad los saves existentes.

## Contrato del personaje

El personaje visible **Michicornio** dispone de cinco formas de biología fantástica con un rasgo visual permanente: **cuerno lunar**. No son cinco tamaños del mismo gato.

| Forma | Silueta | Rasgos jugables y legibilidad |
|---|---|---|
| F0 | Gatito lunar | Cola creciente, orejas asimétricas y mini cuerno |
| F1 | Lince lunar | Cuerpo felino adulto, cuatro patas articuladas, cuerno central y cola creciente |
| F2 | **Medusa Onírica** | Campana translúcida de cristal, siete tentáculos independientes, nervaduras y ataque telegrafiado |
| F3 | Dragón Astral | Cuerpo serpentino, cuernos laterales y cuerno lunar central |
| F4 | Michicornio Eclipse | Nueve tentáculos de cristal nacidos de la Medusa Onírica, orejas de gato, cuerno y halo astral |

El arte se genera en Canvas. Respeta movimiento reducido y no modifica `w/h` físicos de las formas.

## Santuario Lunar de Michicornio

La sala es una **variante individual del Claro** (`hub`), no una undécima sala del grafo compartido. Mantiene cuatro sectores, cuatro checkpoints, dos fosos con peligro y una ruta de tres campanas y ocho esencias. Se han incorporado **14 conectores físicos** a los recorridos verticales y una capa decorativa de cuarzo vinculada a los mismos `platforms` utilizados para las colisiones.

**Enemigos propios** sobre cinco arquetipos de IA existente, sin inventar otros cinco motores de combate: Polilla de Nácar (vuelo), Medusilla Lunar (pulso), Zarza de Amatista (defensa/torreta), Lince del Velo (persecución) y Prisma del Sueño (disparo). El sprite dibujado para cada enemigo es 100 % procedural, telegráfico y respeta `reduceMotion`.

**Minijefe:** Oráculo Medusaluna, con silueta de catedral de cristal, siete tentáculos, corona y núcleos orbitales. Conserva el combate de tres fases por umbrales de vida (60 % y 26 %), cuatro patrones anunciados, descanso/exposición e identidad de derrota almacenada; el arte no cambia hitbox, HP ni contacto. En V458 se clarifican las flechas de pounce, barrera y eclipse.

## Programa de cierre: 10 V × 10 personajes

| Versión | Contrato verificable | Michicornio |
|---|---|---|
| V01 | Identidad y guardado compatibilidad | Implementado |
| V02 | Cinco siluetas y escala óptica | Implementado, QA requerido |
| V03 | Animaciones/sentimiento de cada forma | Medusa rediseñada, QA requerido |
| V04 | Topología, plataformas y checkpoint | 14 conectores integrados |
| V05 | Enemigos singulares, telégrafos y tácticas | Cinco familias gráficas integradas |
| V06 | Minijefe con fases, arena, ataque legible | Oráculo integrado |
| V07 | Mundo vivo, colores, audio, partículas | Ambiente y constelaciones integrados |
| V08 | Interacción, 100 coleccionables y recompensa | Estado implementado; **faltan pruebas físicas de alcance** |
| V09 | Móvil, reduced-motion, rendimiento | Tests automatizados añadidos; balance pendiente |
| V10 | Prueba manual, persistencia, CI, Pages mismo SHA | Pendiente de aceptación final |

Orden después del cierre de Michicornio: Chispín, Stitcho, Kilo, Dragón, Dino, Frita, Pizza, Yomi, Cuerno. Cada uno seguirá el mismo contrato, sin ampliar mundos antes de estabilizar las diez identidades.

### Política de calidad

- `npm test` y `tests/browser/v458-michicornio.mjs`.
- Matriz visual de cinco formas, móvil, rendimiento y prefetched offline íntegro.
- Tests de jefes y objetos **no** se interpretan como partida física completa por reproducir un estado.
- PR aislada hasta que CI y `quality` estén verdes; publicar solo después de validar Pages en el SHA final.
- Netlify, TURN, relay y multijugador remoto siguen en pausa por créditos.
