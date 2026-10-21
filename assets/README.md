# OHANA · Inventario de recursos

El **motor de presentación principal** se implementa en [`characters/draw.js`](../characters/draw.js) y en [`characters/art/`](../characters/art/), mediante Canvas 2D y rigs por personaje. El mundo se compone en [`worlds/`](../worlds/).

Este directorio también conserva **recursos rasterizados reales**: no deben confundirse con la apariencia actual de todos los héroes o escenarios.

| Carpeta | Naturaleza | Uso/documentación |
| :--- | :--- | :--- |
| `portraits/` | Retratos JPG históricos | **No usarlos como showcase de las diez evoluciones actuales** |
| `sprites/bodies/` | PNG y algunos SVG de distintas etapas | Recursos de sprites y compatibilidad; no equivalen automáticamente al render del rig actual |
| `sprites/forms/` | Capturas o representaciones PNG puntuales | No abarcan el conjunto de 50 formas de V457 |
| `sprites/` | Atlas de Chispín, efectos y otros recursos | Ver referencias reales en el motor; algunos modos los cargan durante la partida |
| `worlds/` | Fondos JPG y elementos raster | Recursos ambientales históricos o del modo pintado, distintos del mundo procedural actual |
| `fonts/` | Fuentes WOFF2 y sus licencias | Tipografía de interfaz y experiencia local |

## Regla para documentación pública

El README principal no debe usar retratos, fondos o PNG antiguos para simular capturas de V457. Para mostrar **los personajes actuales**, usar la [galería Canvas](../gallery.html) o crear una captura **directamente desde el ejecutable de la revisión correspondiente**, indicando commit y origen. El formato de una captura puede ser PNG, pero eso no la convierte en un sprite o en el arte fuente del juego.

La selección visual `vector` / `paint` se gestiona en [`characters/look.js`](../characters/look.js). La presencia de archivos PNG en el repositorio **no contradice** que muchas siluetas, animaciones y escenarios se dibujen proceduralmente. Tampoco sería correcto afirmar «cero bitmaps» o «100 % vectorial» para todos los modos y personajes sin verificarlo.

No borrar recursos raster solo para mejorar la apariencia de la documentación: antes hay que revisar las referencias en runtime, la caché offline y las pruebas de regresión.
