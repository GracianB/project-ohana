<div align="center">

<img src="favicon.svg" alt="Símbolo de Project Ohana" width="76" />

# PROJECT OHANA

### Diez héroes. Cincuenta formas. Una familia que vuelve a encontrarse.

Una aventura de plataformas en Canvas 2D: explora Isla Hoku, descubre qué hace único a cada héroe, evoluciona desde bebé y reúne a Ohana.

[**JUGAR OHANA**](https://gracianb.github.io/project-ohana/) · [**VER LOS DIEZ HÉROES**](https://gracianb.github.io/project-ohana/gallery.html) · [**CÓMO EMPEZAR**](#empieza-a-jugar) · [**INFORMAR DE UN PROBLEMA**](https://github.com/GracianB/project-ohana/issues)

<br />

**10 héroes** · **50 formas** · **10 capítulos** · **1 final de Mundo 1**

</div>

---

## La aventura

La familia Ohana vive en Isla Hoku. Cada héroe tiene una manera propia de moverse, luchar y atravesar el mundo. Empiezas como bebé, ganas experiencia jugando y ves cómo tu personaje cambia de forma. Las salas mezclan plataformas, criaturas, mecanismos, secretos y recuerdos. Al reunir los diez sellos, se abre el camino al final de Mundo 1.

El juego se dibuja en tiempo real con Canvas 2D. Personajes, criaturas, efectos y paisajes forman parte del motor; la galería muestra los personajes que realmente pinta el juego.

## Empieza a jugar

1. [Abre Ohana en tu navegador](https://gracianb.github.io/project-ohana/).
2. Elige un héroe en el campamento. Puedes cambiarlo más adelante.
3. Sigue el objetivo que aparece en pantalla, explora la sala y combate para ganar experiencia.
4. Usa los portales para continuar la historia. Al terminar Mundo 1, podrás enfrentarte al desafío final.

No necesitas instalar nada. En ordenador se juega con teclado; en móvil aparecen controles táctiles. El progreso se guarda en el navegador de ese dispositivo.

### Controles

| Acción | Teclado |
| :--- | :--- |
| Moverse | **A / D** o **← / →** |
| Saltar | **W**, **↑** o **Espacio** |
| Bajar de una plataforma | **S** o **↓** |
| Correr | **Shift** o doble toque de dirección |
| Atacar | **H** |
| Habilidades del héroe | **J / K / L** |
| Interactuar o usar portal | **E** |
| Mapa | **M** |
| Pausa | **Esc** |

Las habilidades disponibles y sus efectos dependen del héroe y de su forma. Consulta la ayuda dentro del juego para ver las del personaje elegido.

## La familia

Cada personaje tiene cinco formas y una identidad de combate. Selecciona uno para ver su arte en la [galería interactiva](https://gracianb.github.io/project-ohana/gallery.html).

| Héroe | Su estilo |
| :--- | :--- |
| [Kilo](https://gracianb.github.io/project-ohana/gallery.html?id=kilo) | Ritmo, ukelele y vuelo con hula |
| [Stitcho](https://gracianb.github.io/project-ohana/gallery.html?id=stitcho) | Plasma, acrobacias y rutas por paredes |
| [Chispín](https://gracianb.github.io/project-ohana/gallery.html?id=chispin) | Velocidad y ataques eléctricos encadenados |
| [Michicornio](https://gracianb.github.io/project-ohana/gallery.html?id=cat) | Agilidad lunar, sueños y nueve colas |
| [Dragón](https://gracianb.github.io/project-ohana/gallery.html?id=dragon) | Fuego, corrientes térmicas y vuelo |
| [Dino](https://gracianb.github.io/project-ohana/gallery.html?id=dino) | Fuerza, embestidas e impactos de suelo |
| [Frita](https://gracianb.github.io/project-ohana/gallery.html?id=frita) | Derrapes, velocidad y terreno abrasador |
| [Pizza](https://gracianb.github.io/project-ohana/gallery.html?id=pizza) | Porciones, rebotes y ataques giratorios |
| [Yomi](https://gracianb.github.io/project-ohana/gallery.html?id=yomi) | Pasos espectrales y lectura del campo |
| [Cuerno](https://gracianb.github.io/project-ohana/gallery.html?id=cuerno) | Prismas, luz y protección |

La evolución cambia las posibilidades y la animación del héroe. Las formas son visualmente distintas y mantienen una colisión separada del dibujo para conservar un control predecible.

## Isla Hoku y el final de Mundo 1

La campaña reúne diez capítulos inspirados en sus protagonistas: Claro, Bahía, Santuario del Trueno, Jardines Lunares, Caldera, Valle de los Gigantes, Mercado Dorado, Reino del Horno, Observatorio Astral y Bosque del Prisma. Cada capítulo añade su propio recorrido, objetivos, enemigos y guardián. Los sellos abren el avance entre salas; la Quimera Ohana espera al final.

Los recuerdos opcionales amplían el álbum de cada personaje. Explorar también puede revelar rutas alternativas, secretos y objetos especiales. El progreso de la aventura y las colecciones se conservan en el guardado local.

**Mundo 2 no está anunciado como campaña terminada.** El contenido se presenta desde la selección y los portales del juego según su disponibilidad; tener archivos o prototipos en el repositorio no significa que sean una aventura publicada.

## Publicación y estado del proyecto

El código de `main` incluye trabajo hasta la serie **V620**. El número de una versión de desarrollo no certifica por sí solo una publicación. La web oficial se sirve desde GitHub Pages; su estado debe comprobarse junto a las ejecuciones de CI del commit integrado. El registro de la última entrega publicada con evidencia detallada es [V606](docs/V606-PUBLICATION.json), con sus [pruebas y límites](docs/V606-VALIDATION.json).

La campaña y las mejoras recientes se siguen desarrollando. Las pruebas automatizadas ayudan a comprobar movimiento, guardado, interfaz y recorridos; no sustituyen jugar cada capítulo en dispositivos reales ni aceptar personalmente su dificultad y ritmo.

El cooperativo remoto no se anuncia aquí como servicio disponible. Algunas pruebas usan un servidor local, y eso no equivale a tener una conexión pública activada.

## Tecnología

- JavaScript modular, HTML y CSS; dibujo con **Canvas 2D**.
- Simulación de juego a pasos fijos y sistemas de personaje desacoplados de la presentación.
- Guardado local, modo web instalable y caché para recursos sin conexión.
- Pruebas con Node.js y Playwright; comprobación de recursos offline antes de publicar.

## Ejecutar el proyecto

Necesitas Node.js. Sirve los archivos por HTTP; no abras `index.html` directamente con `file://`.

```bash
git clone https://github.com/GracianB/project-ohana.git
cd project-ohana
npm ci
npm test
npm run test:browser
```

Para jugar durante el desarrollo, inicia un servidor estático en la carpeta del proyecto y abre su dirección local. Algunos navegadores pueden requerir instalar Chromium para las pruebas de Playwright.

### Comprobaciones de publicación

```bash
npm run test:visual
npm run release:check
```

El flujo de GitHub Actions ejecuta las comprobaciones asociadas a la integración y a GitHub Pages. Si falla una prueba, consulta el registro de esa ejecución y su commit antes de atribuir el resultado a una versión posterior.

## Contribuir

Lee [`AGENTS.md`](AGENTS.md) y el [plan de entrega por personaje y sala](docs/CHARACTER-PHASES.md) antes de cambiar mecánicas compartidas. Conserva las pruebas de regresión y verifica que los recursos offline siguen incluyendo los módulos nuevos.

Para un error, abre un [issue](https://github.com/GracianB/project-ohana/issues) con navegador, dispositivo, personaje, sala y pasos para reproducirlo. Para proponer una mejora, describe qué debería poder hacer quien juega y cómo comprobar el resultado.

## Documentación del proyecto

| Tema | Documento |
| :--- | :--- |
| Plan para cerrar la campaña individual | [Estrategia V1](docs/V1-SOLO-ESTRATEGIA.md) |
| Estado y límites por capítulo | [Estado single player](docs/v1-solo-status.json) |
| Punto de reanudación | [Handoff de campaña](docs/HANDOFF-V1-SOLO.md) |
| Última entrega publicada con evidencia | [Publicación V606](docs/V606-PUBLICATION.json) |
| Pruebas y limitaciones de esa entrega | [Validación V606](docs/V606-VALIDATION.json) |

---

<div align="center">

**Una isla, muchas formas de jugar. Ohana significa que nadie se queda atrás.**

[Jugar ahora](https://gracianb.github.io/project-ohana/) · [Galería](https://gracianb.github.io/project-ohana/gallery.html) · [Código fuente](https://github.com/GracianB/project-ohana)

</div>
