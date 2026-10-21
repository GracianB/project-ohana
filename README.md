<div align="center">

<img src="favicon.svg" alt="Símbolo de Project OHANA" width="76" />

# PROJECT OHANA

### Diez héroes. Cincuenta formas. Una isla llena de aventuras.

**Plataformas · exploración · combate · evolución · mundos personales**

**10 personajes** · **5 formas por héroe** · **10 salas canónicas conectadas**

[**JUGAR EN EL NAVEGADOR**](https://gracianb.github.io/project-ohana/) · [**VER PERSONAJES EN CANVAS**](https://gracianb.github.io/project-ohana/gallery.html) · [**VER EL CÓDIGO**](https://github.com/GracianB/project-ohana)

<sub>La web pública se sirve desde <code>main</code>. El cierre V457 se documenta en la <a href="https://github.com/GracianB/project-ohana/pull/391">PR #391</a>. **Michicornio V458** está en la <a href="https://github.com/GracianB/project-ohana/pull/392">PR #392</a>, no publicada todavía. La publicación efectiva se comprueba en <a href="https://github.com/GracianB/project-ohana/actions/workflows/pages.yml">GitHub Pages</a>; una PR aprobada no equivale a un despliegue.</sub>

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

## V459 · Cien animaciones de personaje y evolución felina coherente

**Diez héroes × diez acciones corporales**, con perfiles de peso, elasticidad, ritmo y reacción distintos por personaje. No son diez GIF ni cambios de color: el renderizador transforma el cuerpo en cada acción (`idle`, carrera, salto, caída, planeo, pared, ataque, magia, daño y celebración) sin alterar las colisiones.

**Michicornio ya no cambia de gato a conejo.** Su árbol es **Gatito Lunar → Lince Lunar → Medusa Onírica con orejas gatunas → Dragón Astral con vibrisas y filamentos → Michicornio Eclipse con nueve tentáculos cristalinos**. El cuerno, la anatomía de orejas y el hilo onírico permiten reconocer el personaje incluso cuando cambia por completo de forma.

[**Estudio vivo de las cinco formas de Michicornio**](previews/michi-design.html) · [**Laboratorio interactivo: diez héroes y diez animaciones**](previews/animation-lab.html) · [**Código de actuación compartida**](characters/ten-action-acting.js)

> **Estado de versión:** estos cambios se desarrollan en la [PR V459 #393](https://github.com/GracianB/project-ohana/pull/393). El enlace a la web pública no garantiza mostrar V459 hasta que dicha PR se integre y GitHub Pages apruebe el mismo commit.

## La familia: diez maneras distintas de jugar

Cada héroe cuenta con identidad, movimiento, estadísticas, evoluciones y habilidades propias. Pulsa en su nombre para verlo dibujado por el motor, en lugar de consultar un retrato estático desactualizado.

| Héroe y galería en vivo | Personalidad jugable | Héroe y galería en vivo | Personalidad jugable |
| :--- | :--- | :--- | :--- |
| [**Kilo**](https://gracianb.github.io/project-ohana/gallery.html?id=kilo) | Ukelele, ritmo y planeo | [**Stitcho**](https://gracianb.github.io/project-ohana/gallery.html?id=stitcho) | Plasma, caos y paredes |
| [**Chispín**](https://gracianb.github.io/project-ohana/gallery.html?id=chispin) | Electricidad y aceleración | [**Michicornio**](https://gracianb.github.io/project-ohana/gallery.html?id=cat) | Sueños, esquiva y nueve vidas |
| [**Dragón**](https://gracianb.github.io/project-ohana/gallery.html?id=dragon) | Fuego, viento y altura | [**Dino**](https://gracianb.github.io/project-ohana/gallery.html?id=dino) | Fuerza e impacto |
| [**Frita**](https://gracianb.github.io/project-ohana/gallery.html?id=frita) | Velocidad y derrape | [**Pizza**](https://gracianb.github.io/project-ohana/gallery.html?id=pizza) | Rebotes y giros |
| [**Yomi**](https://gracianb.github.io/project-ohana/gallery.html?id=yomi) | Energía espiritual | [**Cuerno**](https://gracianb.github.io/project-ohana/gallery.html?id=cuerno) | Luz, prismas y protección |

### De bebé a forma final

**50 combinaciones jugables**: cada uno de los diez héroes tiene cinco formas, de la inicial a su evolución definitiva. El crecimiento modifica tamaño visual, atributos, animación y posibilidades de combate, **sin confundir la silueta pintada con la caja física de colisión**.

El combate usa **H** para el ataque base y **J / K / L** para las habilidades. No todos los personajes saltan, vuelan o atacan igual: esa diferencia es parte del diseño.

**Michicornio V458 (PR #392, sin publicar):** el arte actual dibuja una evolución de siluetas diferenciadas: bebé felino → lince lunar → medusa felina con orejas → dragón astral → guardián de nueve tentáculos. [Ver su implementación Canvas](characters/art/cat.js). Este rediseño pertenece a la PR, no necesariamente a la galería pública.

## Isla Hoku: una aventura compartida, diez salas reales

La campaña común mantiene **diez salas canónicas conectadas**. Su recorrido atraviesa el Claro, Costa, Jungla, Cueva, Laboratorio, Cumbre, Caldera, Órbita, Arrecife y el Nido de la Reina.

No es una presentación de fondos: las zonas se recorren saltando entre plataformas, combinando poderes, descubriendo rutas y enfrentándose a enemigos y jefes. El enfrentamiento principal es la **Reina del Nido**, con tres fases.

**[Explorar el juego](https://gracianb.github.io/project-ohana/)** · **[Código del mapa](systems/world-graph.js)** · **[Escenarios generados](worlds/)**

### Diez aventuras personales

La rama V457 añade variantes de aventura para los diez protagonistas, **sin duplicar artificialmente las diez salas del mapa compartido**.

| Héroe | Identidad del recorrido | Héroe | Identidad del recorrido |
| :--- | :--- | :--- | :--- |
| Kilo | Bahía del Compás | Stitcho | Archipiélago del Caos |
| Chispín | Islas del Relámpago | Michicornio | Jardines de la Luna |
| Dragón | Cordillera de las Brasas | Dino | Valle de los Gigantes |
| Frita | Mercado Dorado | Pizza | Reino del Horno |
| Yomi | Observatorio Astral | Cuerno | Bosque del Prisma |

Se ha implementado el estado de **100 coleccionables por héroe**, con persistencia y recompensas. La prueba automatizada valida contratos de estado y navegación, pero **no acredita por sí sola que los 1.000 objetos sean físicamente alcanzables ni que las diez campañas hayan superado una partida humana completa**. Esa aceptación sigue abierta.

[Ver los criterios reales de cierre de cada mundo](docs/V457-CIERRE-SOLO.md). [**Michicornio: 10 versiones y QA**](docs/MICHICORNIO-V458.md).

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

## Estado verificable · V457

| Área | Situación |
| :--- | :--- |
| **Motor y diez héroes** | Implementados y sometidos a pruebas automatizadas |
| **Diez salas compartidas** | Implementadas |
| **Variantes y coleccionables personales** | Integrados; falta aceptación manual de todas las rutas y recompensas |
| **Calidad de la PR #391** | [CI y quality aprobados para el código V457](https://github.com/GracianB/project-ohana/actions/runs/39637919429), incluido arte de Michi y regresión visual |
| **Publicación** | Verificar en [GitHub Pages Actions](https://github.com/GracianB/project-ohana/actions/workflows/pages.yml) que el commit de `main` se ha desplegado correctamente |
| **Multijugador remoto** | **En pausa** por créditos de Netlify y del servidor externo; sin reactivaciones ni consumo de servicios |

**Importante:** una PR en verde es un paso de calidad; la publicación real requiere un Pages correcto para el commit de `main` y después validación manual completa.

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
