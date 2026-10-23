<div align="center">

<img src="favicon.svg" alt="Símbolo de Project OHANA" width="76" />

# PROJECT OHANA

### Diez héroes. Cincuenta formas. Una historia para toda la familia.

**Plataformas · exploración · combate · evolución · aventura narrativa en Canvas 2D**

**10 héroes** · **50 formas** · **10 salas temáticas + final de Mundo 1**

[**JUGAR EN EL NAVEGADOR**](https://gracianb.github.io/project-ohana/) · [**VER PERSONAJES EN CANVAS**](https://gracianb.github.io/project-ohana/gallery.html) · [**VER EL CÓDIGO**](https://github.com/GracianB/project-ohana)

<sub>Estado comprobado el 23 oct 2026: <strong>V491 fusionada en <code>main</code></strong>, con diez sellos físicos y primer golpe legítimo a la Quimera. <a href="https://github.com/GracianB/project-ohana/pull/431">V493</a> ha demostrado una victoria completa en Chromium; <a href="https://github.com/GracianB/project-ohana/pull/434">V494</a> pule el HUD. <strong>PR aprobada no equivale a Pages desplegada:</strong> comprueba <a href="https://github.com/GracianB/project-ohana/actions/workflows/pages.yml">GitHub Pages</a> para el commit público. Multijugador remoto en pausa.</sub>

</div>

---

## Un videojuego que se dibuja en tiempo real

OHANA es un plataformas 2D construido con **JavaScript modular y Canvas 2D**. Los personajes reaccionan al movimiento, el combate y sus poderes; los escenarios tienen plataformas, rutas verticales, peligros y encuentros propios.

**El arte que se debe evaluar es el que pinta el motor del juego, no los retratos JPG ni los sprites PNG históricos del repositorio.** Por eso este README enlaza las vistas **renderizadas de verdad** y deja de presentar imágenes antiguas como si fueran el diseño de V457.

| Ver el juego real | Dónde |
| :--- | :--- |
| **Aventura y controles** | [Abrir OHANA](https://gracianb.github.io/project-ohana/) |
| **Galería del motor** | [Diez héroes en Canvas](https://gracianb.github.io/project-ohana/gallery.html) |
| **Evoluciones de Cuerno** | [Estudio interactivo de sus cinco formas](https://gracianb.github.io/project-ohana/previews/cuerno-design.html) |
| **Implementación gráfica** | [Renderizador](characters/draw.js) · [Arte de personajes](characters/art/) · [Mundos](worlds/) |

> **Fidelidad visual:** la galería pública utiliza la versión desplegada, que puede ir por detrás de V457. Para comprobar el arte exacto de esta PR, ejecuta el proyecto desde su rama. El motor combina dibujo procedural y, en ciertos casos o modos, atlas pintados; **no se afirma que se hayan eliminado todos los PNG del código**.

## Mundo 1 · La Ruta de los Diez

El Eco ha robado las canciones de la familia. La aventura recorre **diez salas de personaje en un solo mundo**, desde el Claro de Kilo hasta el Observatorio de Yomi, y desemboca en el **Corazón de Ohana**. Cada sala tiene una misión de sello propia, plataformas, enemigos, puntos de control y un capítulo de la misma historia. Al reunir los diez sellos aparece la **Quimera Ohana**, el jefe que reúne los ecos de los protagonistas.

Las salas se abren en orden. Elegir personaje en el campamento enseña sus cinco formas y su portal; las salas cerradas indican qué sello hace falta. La salida de V470 presenta **«Mundo 2 · en construcción»** en lugar de enviar silenciosamente al jugador a contenido anterior. El código de ese contenido se conserva, sin anunciarlo como un segundo mundo terminado.

**Ver el diseño ejecutable:** [grafo y salas](systems/world1-rooms.js) · [historia completa](systems/world1-story.js) · [selector de portales](systems/world1-select.js) · [estado de sellos](systems/world1-progress.js) · [PR V470](https://github.com/GracianB/project-ohana/pull/404).

> **Aceptación diferenciada:** Chromium ya ha completado una ruta física con diez sellos y derrota de la Quimera, sin alterar los estados de salud, sellos o victoria. Esto **no sustituye** la prueba humana de accesibilidad, mando, móvil, todos los recuerdos y persistencia, ni certifica por sí solo el despliegue de Pages.

## V460 · Michicornio vivo: actuación corporal e intro / evolución cinematográfica

Michicornio deja de limitarse a diez poses estáticas. Ahora su **carrera articula patas y hombros**, las orejas reaccionan, **parpadea y mira alrededor**, la Medusa respira con su campana y sus **siete filamentos se desplazan independientemente**. El dragón hereda ese movimiento y el Guardián Eclipse lo culmina con **nueve tentáculos de vidrio animados**. Todo sucede en Canvas, sin alterar hitboxes.

La **intro familiar** incorpora corona, iris lunar y gestos de personalidad exclusivos. La **cinemática de evolución** pasa de un retrato inmóvil a cuatro actos con dos formas pintadas durante la metamorfosis, luz en el cuerno y presentación animada.

[**Ver el storyboard cinematográfico V460**](previews/michicornio-cinema.html) · [**Laboratorio de cinco formas y diez acciones**](previews/michi-design.html) · [**Comprobar el movimiento de los diez héroes**](previews/animation-lab.html)

> **Control de publicación:** La publicación de V460 se acredita únicamente con CI, regresión visual y GitHub Pages aprobados para el commit de <code>main</code>. El modo de movimiento reducido mantiene las escenas principales sin vibración.

## V459 · Cien animaciones de personaje y evolución felina coherente

**Diez héroes × diez acciones corporales**, con perfiles de peso, elasticidad, ritmo y reacción distintos por personaje. No son diez GIF ni cambios de color: el renderizador transforma el cuerpo en cada acción (`idle`, carrera, salto, caída, planeo, pared, ataque, magia, daño y celebración) sin alterar las colisiones.

**Michicornio ya no cambia de gato a conejo.** Su árbol es **Gatito Lunar → Hada Felina → Medusa Onírica con orejas gatunas → Dragón Astral con vibrisas y filamentos → Michicornio Eclipse con nueve tentáculos cristalinos**. El cuerno, la anatomía de orejas y el hilo onírico permiten reconocer el personaje incluso cuando cambia por completo de forma.

[**Estudio vivo de las cinco formas de Michicornio**](previews/michi-design.html) · [**Laboratorio interactivo: diez héroes y diez animaciones**](previews/animation-lab.html) · [**Código de actuación compartida**](characters/ten-action-acting.js)

> **Historial de arte:** V459 y V460 están fusionadas en `main`. Sus galerías siguen siendo útiles para inspeccionar animaciones; su disponibilidad pública depende del último despliegue de Pages.

## La familia: diez maneras distintas de jugar

Cada héroe cuenta con identidad, movimiento, estadísticas, evoluciones y habilidades propias. Pulsa en su nombre para verlo dibujado por el motor, en lugar de consultar un retrato estático desactualizado.

| Héroe y galería en vivo | Personalidad jugable | Héroe y galería en vivo | Personalidad jugable |
| :--- | :--- | :--- | :--- |
| [**Kilo**](https://gracianb.github.io/project-ohana/gallery.html?id=kilo) | Ukelele, ritmo y planeo | [**Stitcho**](https://gracianb.github.io/project-ohana/gallery.html?id=stitcho) | Plasma, caos y paredes |
| [**Chispín**](https://gracianb.github.io/project-ohana/gallery.html?id=chispin) | Electricidad y aceleración | [**Michicornio**](https://gracianb.github.io/project-ohana/gallery.html?id=cat) | Sueños, esquiva y nueve vidas |
| [**Dragón**](https://gracianb.github.io/project-ohana/gallery.html?id=dragon) | Fuego, viento y altura | [**Dino**](https://gracianb.github.io/project-ohana/gallery.html?id=dino) | Fuerza e impacto |
| [**Frita**](https://gracianb.github.io/project-ohana/gallery.html?id=frita) | Velocidad y derrape | [**Pizza**](https://gracianb.github.io/project-ohana/gallery.html?id=pizza) | Rebotes y giros |
| [**Yomi**](https://gracianb.github.io/project-ohana/gallery.html?id=yomi) | IA familiar, análisis y red neuronal | [**Cuerno**](https://gracianb.github.io/project-ohana/gallery.html?id=cuerno) | Luz, prismas y protección |

### De bebé a forma final

**50 combinaciones jugables**: cada uno de los diez héroes tiene cinco formas, de la inicial a su evolución definitiva. El crecimiento modifica tamaño visual, atributos, animación y posibilidades de combate, **sin confundir la silueta pintada con la caja física de colisión**.

El combate usa **H** para el ataque base y **J / K / L** para las habilidades. No todos los personajes saltan, vuelan o atacan igual: esa diferencia es parte del diseño.

**Michicornio V458–V459 (ya integrado):** el arte actual dibuja una evolución de siluetas diferenciadas: bebé felino → lince lunar → medusa felina con orejas → dragón astral → guardián de nueve tentáculos. [Ver su implementación Canvas](characters/art/cat.js). El diseño se encuentra en el código de `main` desde V459 y se refina en V460.

## Un mundo ahora, el siguiente después

**Mundo 1**, la campaña actual, tiene diez salas grandes de héroe y un escenario final. El Claro, Costa, Jungla, Cueva, Laboratorio, Cumbre, Caldera, Órbita, Arrecife y el antiguo Nido de la Reina permanecen en el código histórico como base del **Mundo 2**, pero no se presentan como contenido completado en el modo individual V470.

Hay un álbum y progresión de recuerdos por protagonista; la lógica de recompensas está automatizada, aunque la accesibilidad física de todos los objetos no se ha demostrado recorriendo cada nivel manualmente.

La ruta, sus sellos y sus enemigos están definidos en [Mundo 1](systems/world1-rooms.js). Para la estructura de combate, consulta [motor](game.js) y [sistemas](systems/).

## Cómo se juega

| Acción | Teclado |
| :--- | :--- |
| Movimiento | **A / D** o flechas |
| Salto | **W** o **Espacio** |
| Descender de plataforma | **S** o **↓** |
| Dash | **Shift** |
| Ataque | **H** |
| Habilidades | **J / K / L** |
| Interacción | **E** |
| Mapa | **M** |
| Pausa | **Esc** |

Hay controles táctiles en móvil.

## Estado verificable · Mundo 1 validado físicamente

| Área | Estado del código |
| :--- | :--- |
| **Motor, diez héroes y cincuenta formas** | Integrados en `main`; existe galería Canvas y batería de regresión. |
| **Mundo 1: diez salas + Quimera Ohana** | Diez sellos físicos fusionados desde V490; V491 acredita el primer golpe en `main`. V493 demuestra las cuatro fases y el jefe a 0 HP en una PR candidata. |
| **Selección de personajes** | Portales Canvas con navegación por teclado, sincronizados con las tarjetas HTML. |
| **Progresión y coleccionables** | Contratos y guardado implementados. Los diez sellos y las puertas se han recorrido en Chromium; pendientes las auditorías exhaustivas de recuerdos y persistencia. |
| **Pruebas y publicación** | [Diez sellos V490](https://github.com/GracianB/project-ohana/actions/runs/40008443953) · [Victoria física V493](https://github.com/GracianB/project-ohana/actions/runs/40017010179) · [HUD V494](https://github.com/GracianB/project-ohana/actions/runs/40012431683). Exigir además Quality, CI y Pages del commit de publicación. |
| **Multijugador remoto** | En pausa; sin reactivar servidores ni créditos de servicios. |

### Evidencia reproducible del Mundo 1

La campaña de Chromium comienza con **cero sellos**, usa movimiento, saltos, ataques y habilidades reales, y admite muertes/reapariciones normales. La prueba [V493 de victoria física](https://github.com/GracianB/project-ohana/actions/runs/40017010179) registró **10/10 sellos, fases 1–4, Quimera a 0 HP y `world1Won=true`**, con una muerte y sin intervenciones sobre vida, posiciones, sellos ni estado de victoria. Su artefacto incluye captura y JSON.

- [V490 · Ruta física de diez sellos](tests/browser/v490-ten-physical-seals.mjs)
- [V493 · Quimera con controles reales y final de campaña](tests/browser/v493-quimera-full-victory.mjs)
- [V494 · HUD de jefe y accesibilidad](tests/browser/v494-quimera-hud-physical.mjs)

La [PR #431](https://github.com/GracianB/project-ohana/pull/431) amplía la aceptación a las escenas de derrota, reunión y resultados. Las PR #431 y #434 pueden seguir abiertas mientras se repiten las Quality completas. **El sello de publicación corresponde únicamente al mismo SHA aprobado en Pages.**

**No confundimos tres cosas:** código fusionado, pruebas automáticas y juego realmente publicado. Para concursar debe existir un mismo commit con CI, pruebas de navegador, regresión visual, puerta de lanzamiento y Pages aprobados, seguido de revisión manual.

## Desarrollo local

Requiere Node.js y un navegador compatible. Los módulos ES se deben servir por HTTP; **no** abras `index.html` con `file://`.

```bash
npm ci
npm test
npm run test:browser
npm run test:visual
npm run release:check
```

Para ejecutar el juego, sirve esta carpeta mediante un servidor HTTP local y abre `index.html`. Las pruebas de navegador usan **Playwright**.

El motor, los rigs, el progreso, el combate y la interfaz están versionados en este repositorio. Los archivos raster de `assets/` se conservan donde siguen siendo necesarios para modos opcionales, compatibilidad o recursos históricos, **pero no se utilizan como presentación visual oficial de este README**. [Ver inventario de recursos](assets/README.md).

<details>
<summary><strong>Arquitectura y seguimiento técnico</strong></summary>

- [Motor de dibujo](characters/draw.js) y [arte por héroe](characters/art/).
- [Estadísticas y cinco formas](characters/roster.js), [modo visual](characters/look.js).
- [Escenarios](worlds/), [mapa canónico](systems/world-graph.js) y [colecciones por héroe](systems/hero-collections.js).
- [Pruebas de diez héroes V457](tests/browser/v457-ten-heroes.mjs) y [proporciones visuales](tests/browser/character-size.mjs).
- [Checklist de cierre, pendientes y clasificación de PR](docs/V457-CIERRE-SOLO.md).

**Criterio de publicación:** CI + quality + release gate + Pages para el mismo commit; después, prueba real del juego, accesibilidad, móvil, colisiones, jefes, progresión y guardado.

</details>

---

<div align="center">

**OHANA está hecho para jugarlo. Su README debe mostrar lo que realmente existe.**

[**JUGAR**](https://gracianb.github.io/project-ohana/) · [**GALERÍA CANVAS**](https://gracianb.github.io/project-ohana/gallery.html) · [**SYSTEMS LAB**](https://gracianb.github.io/systems-lab/)

<sub>© 2026 Gracián Baena · Licencia MIT</sub>

</div>
