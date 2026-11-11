# OHANA V700 · EL MUNDO ESTÁ VIVO
**Plan maestro de la siguiente gran entrega.** Documento de diseño, no una certificación de características ya implementadas.

**Base de partida:** `main` / OHANA 636, commit `3c6ed75c29e64311f02eb549534cbb38ffde125c`.  
**Objetivo de integración:** una sola PR de lanzamiento, fusionada mediante **squash** para producir **un gran commit final verificable**, con tantos commits internos de reparación como sean necesarios. Nunca desarrollar a ciegas directamente sobre `main`.

## 0. La promesa

OHANA aspira a ser un plataformas 2D de acción y exploración que se recuerde por su tacto, sus sorpresas y la conexión con sus personajes. La referencia de **calidad y ritmo** es la mejor tradición del plataformas de Nintendo, **no su propiedad intelectual**: ni niveles, enemigos, música, bloques ni movimientos calcados.

**Una frase jugable:** «Cada héroe cambia de verdad su mundo, y cada rescate deja una huella que la familia recuerda».

No buscamos añadir cincuenta mecánicas invisibles ni aumentar la duración sin propósito. Buscamos que en los primeros 30 segundos se entienda por qué es divertido jugar y que diez minutos después el jugador haya descubierto algo que no esperaba.

## 1. Qué existe y qué debemos respetar

La versión publicada dispone de **10 héroes, 50 formas y 10 capítulos**, un Corazón de Ohana, Quimera, guardados, Canvas 2D, habilidades, física, jefes, efectos, cooperativo y pruebas E2E. `systems/player-movement.js` ya contiene manejo de locomoción; el salto almacenado en búfer vive en `game.js`. No duplicar motores, crear un segundo bucle de juego ni fingir que el modo online está validado entre dos redes si no se ha probado físicamente.

**Invariantes:** IDs, diez personajes, cinco formas por personaje, Stitcho incluido, evolución ganada, controles H/J/K/L/U/I/P, accesibilidad, guardados históricos, selección/reanudación y mapa de campaña, física auténtica y diferenciación de siluetas. OHANA 636 debe seguir siendo jugable hasta que V700 pase su batería.

## 2. Siete pilares de calidad

### A. La sensación de jugar (prioridad máxima)
- Tomar medidas antes de cambiar: altura/tiempo de salto, aceleración, frenada, arranque, salto corto/largo, aire, velocidad de caída, cámara, latencia de teclado/táctil/mando, tasa de muertes injustas.
- Sobre el motor existente, implementar **ventana de gracia al abandonar un borde** y **búfer de salto** calibrables por personaje/forma (punto de partida experimental: 90–130 ms cada uno; no dar por buenos números sin pruebas humanas); altura variable al soltar, gravedad/frenado afinados, aterrizaje con feedback, corrección mínima en bordes, lectura clara de impulso y respuesta aérea.
- Cámara con anticipación por dirección, zona tranquila en vertical, retroceso suave, encuadre de salto y jefe, límite de escenarios sin saltos bruscos. La cámara nunca oculta un pozo o enemigo al que el jugador se aproxima.
- Preservar rasgos únicos: Cuerno corre; Dino pesa; Kilo y Dragón dominan el aire; Michi flota/planea; Stitcho utiliza paredes; Chispín tiene movilidad eléctrica. Unificar **reglas de calidad**, no convertir a todos en el mismo personaje.

### B. Niveles diseñados, no kilómetros de relleno
Cada uno de los 10 capítulos conserva historia y sala actual, pero recibe una **ruta principal remasterizada** de referencia de 6–10 minutos (tiempo objetivo para calibrar, no promesa), compuesta por tres actos: **enseñar sin tutorial, combinar sin confundir y sorprender sin traicionar las reglas**.  
En cada minuto debe haber una decisión, un secreto, un movimiento divertido o una recompensa comprensible. Tres rutas visuales: principal clara, maestría opcional y secreto legible. Puntos de control antes de retos difíciles; muerte y reinicio instantáneos y justos.

### C. «Pulso Ohana» · la innovación propia
Sistema modular de transformaciones **causadas por ayudar**, no por copiar objetos transformadores de otros juegos. En cada capítulo hay un **momento de Pulso**: el mundo reacciona a un poder del héroe/rescate y cambia una regla del escenario **dentro de la misma sala**. Persistencia visual y sonora tras salvar el recuerdo.
- Dos estados declarativos: `normal / resonant`; simulación determinista, colisiones y guardados explícitos, no dibujo que finge ser plataforma.
- Transiciones rápidas, legibles, controlables y reversibles cuando haga falta para evitar softlocks. Modo movimiento reducido conserva todas las rutas.
- La escena culmina con una decisión o maniobra del jugador, jamás una cinemática que juega sola.

### D. Elenco con lenguaje corporal propio
Cada una de las 50 evoluciones debe reconocerse por **silueta, movimiento, anticipación, ataque, celebración y sonido**. Un sistema común de estados/dirección, pero actuaciones originales por héroe y evolución. Animación de aterrizaje, giro, deslizamiento, cansancio, reacción a viento/agua y emoción. Prohibido convertir 50 formas en 50 recoloreados. Mantener cajas físicas coherentes y retratos Canvas coherentes con gameplay.

### E. Enemigos y jefes a la altura
- Enemigos por bioma con lectura de intención: aproximación, anticipación, ataque, recuperación y reacción. Variar comportamiento en vez de inflar la vida; evitar proyectiles invisibles.
- Cada guardián tiene al menos **tres patrones distinguibles**, contraataque ligado al poder de su héroe, ventana clara de vulnerabilidad y adaptación por dificultad. La dificultad aumenta decisiones y sincronía, no solo daño.
- Quimera y el final combinan lo aprendido con diez personajes visibles, preservando guardados, invocaciones y habilidades; final emotivo sin tapar controles.

### F. Dirección artística, música y tacto audiovisual
- Una biblia visual única: escala coherente de personajes, grosor de contornos, jerarquía de plano (fondo / plataforma / enemigo / actor / HUD), paletas propias por capítulo, contraste de peligros y superficies. Parallax y clima responden a acciones; la saturación luminosa no puede impedir distinguir colisiones.
- Música original por capítulos y capas reactivas (exploración, peligro, Pulso, victoria); efectos auditivos de salto, aterrizaje, poder y enemigos identificables sin mirar, con mezclador, silencio, volumen, subtítulos para indicaciones esenciales y ausencia de flashes intensos.
- Mejores transiciones, polvo, agua, impactos, pausas de impacto y feedback de rescate **solo si no introducen lag ni alteran la simulación**.

### G. Experiencia de producto real
Entrada que muestra el juego y permite jugar, selector claro de 10 héroes, elección de forma permitida según progreso, continuar sin reiniciar, mapa vivo con objetivos legibles, ayudas discretas, menú pausa accesible, estados de carga/offline, mando, teclado y táctil. La portada y el README deben vender **el universo y el juego**, nunca funcionar como un changelog de ingeniería.

## 3. Diez capítulos, diez mecánicas y diez Pulsos

| Héroe | Bioma y fantasía principal | Gramática de nivel / Pulso OHANA | Enemigo/jefe |
|---|---|---|---|
| **Kilo** | Jardines colgantes, campanas y corrientes | Vuelo y anillos de viento; rescatar aves convierte ráfagas en puentes de pétalos | Guardián de campanario, ondas visibles |
| **Stitcho** | Astillero nocturno de plasma | Adhesión a paredes, relés eléctricos; la maquinaria se vuelve un circuito de ayuda | Araña mecánica, señales eléctricas con ritmo |
| **Chispín** | Torres de tormenta y nubes musicales | Relés de rayos y saltos sincronizados; el temporal se vuelve una melodía navegable | Polilla de la tormenta, antenas/pulsos |
| **Michi** | Bosque bioluminiscente y mar nocturno | Luz viva ilumina rutas, despierta flores y modifica corrientes; estrella marina y Capibara Astral conservan su carácter | Felino/guardián lunar con sombras muy legibles |
| **Cuerno** | Cañón de prismas y carreras | Velocidad, rebotes y cristales; la carrera dibuja un camino de luz sólida | Ciervo prismático, esquiva por telegráficos |
| **Dragón** | Archipiélago volcánico sobre las nubes | Térmicas, planeo y chimeneas; liberar nidos cambia el viento y abre altura | Wyvern que domina el cielo en tres secuencias |
| **Dino** | Valle fósil, placas tectónicas | Peso y aterrizajes: golpe crea escalones, rompe suelo señalado y despierta colosos | Fósil acorazado, contragolpe después del impacto |
| **Frita** | Mercado aéreo y festival aromático | Corrientes de aire, globos y recetas; alimentar al barrio mueve puestos y rutas | Cangrejo/chef, proyectiles telegrafiados |
| **Pizza** | Puerto de faros y entregas acrobáticas | Encadenar rutas de reparto con recompensa, sin cuenta atrás que impida progresar; el puerto abre atajos | Chef de la marea, lógica de pedidos y contrataque |
| **Yomi** | Biblioteca de sombras y voces | Leer señales, escuchar ecos, revelar plataformas auténticas; rescatar voces transforma silencio en caminos | Custodio del archivo, señales previas de ataque |

Las combinaciones respetarán los kits realmente disponibles; el diseño deberá ajustarse al código y no inventar poderes inaccesibles. Cada capítulo debe tener **1 gran set piece**, **2 secretos de habilidad** y **un pequeño epílogo interactivo**. No ampliar todos a la vez hasta que tres prototipos prueben el sistema.

## 4. Tres vertical slices antes de escalar
Primero demostrar calidad en tres tipos opuestos de juego:
1. **Michi**: luz, vuelo/planeo, atmósfera, legibilidad en oscuridad y mini Pulso bioluminiscente.
2. **Dino**: peso, terreno físico, destrucción auténtica, cámara/feedback de aterrizaje y jefe.
3. **Kilo**: precisión aérea, cambio de altura, carreras de viento y ritmo de plataformas.

Estos tres cortes son el patrón. Si no resulta divertido moverse con ellos sin premios ni cinemáticas, no se autoriza expandir los otros siete.

## 5. Arquitectura: reutilizar antes que añadir
**Puntos de extensión propuestos**, sujetos a lectura de imports, pruebas y revisión de colisiones:
- `systems/player-movement.js` + adaptadores de `game.js`: calidad de locomoción, nunca una física paralela.
- `systems/world1-rooms.js`, `systems/chapter-room-composition.js` y archivos `systems/*-chapter.js`: objetivos y segmentos authored expresados como datos.
- **Nuevo** `systems/v700-level-beats.js`: contratos de enseñar, combinar, sorprender, checkpoint y restauración.
- **Nuevo** `worlds/ohana-pulse.js`: cambios de mundo declarativos respaldados por geometría real y guardado compatible.
- `systems/enemy-director.js`, `systems/chapter-boss-v2.js`: encuentros y telegráficos con estado determinista.
- `characters/draw.js` y `characters/art/*`: interpretación visual separada del daño/hitboxes.
- **Nuevo** `systems/v700-audio-director.js` si la auditoría demuestra que no existe ya un director suficiente.
- `systems/save.js`, `sw.js` y `tools/release-gate.mjs`: migración, assets y verificación integral. Actualizar el `VERSION` y las huellas de cache **al final**, tras la auditoría de assets.

Evitar crear módulos `-v700` duplicando otros si puede ampliarse el existente con contratos y pruebas. Nunca cambiar `cat`, `stitcho` u otros IDs históricos.

## 6. Trabajo en etapas, entrega como un único commit grande

| Fase | Resultado observable | Puerta para continuar |
|---|---|---|
| **F0 · Auditoría** | Capturas reales, mapa de runtime, baseline de saltos, cámaras, colisiones, FPS, audio y puntos de atasco | Informe reproducible, sin suposiciones de calidad |
| **F1 · Game feel** | Movimiento, salto, cámara, mando/táctil, respuesta de impacto en una arena | Personas pueden jugar sin explicaciones; determinismo y física intactos |
| **F2 · Tres capítulos de oro** | Michi, Dino y Kilo rehechos en ritmo y «Pulso» | Recorrido humano + Playwright en PC/móvil |
| **F3 · Siete capítulos restantes** | Gramática de nivel y set pieces originales por héroe | 10 rutas completas, 10 sellos, sin softlocks |
| **F4 · Enemigos y guardianes** | Escuelas de ataque, telegráficos y jefes con personalidad | 10 jefes y Quimera superables en Easy/Normal/Hard |
| **F5 · Arte, animación y sonido** | 50 actuaciones, música dinámica, biomas vivos, HUD estable | Comparación visual/audio, accesibilidad y presupuesto de frame |
| **F6 · Interfaz y continuidad** | Primer minuto, selección, mapa, coleccionables, guardado, offline, mando | 636 -> 700 sin pérdida, pantallas 320/390/1280/1440 |
| **F7 · Cooperativo y pruebas reales** | Confirmar compatibilidad y no regresiones | 2 navegadores y, si se afirma online, **2 dispositivos/redes reales** |
| **F8 · Cierre** | Capturas de gameplay, tráiler corto opcional, README escaparate, certificado y release gate | Todos los Actions verdes en **un SHA**, revisión humana y Pages en SHA fusionado |

**Política de integración:** una rama `feature/ohana-v700-el-mundo-esta-vivo-20261111`; múltiples commits pequeños y comprobados dentro de ella; **una sola PR V700**; squash merge para obtener el «commit enorme» que pide el lanzamiento. Tests primero, no desactivarlos para poner un check verde. Main sigue estable; evitar cambios de 100 ficheros sin comprobar contratos. No fusionar hasta que cierre F8.

## 7. Gates nuevos y criterios verificables

### Técnica
- `npm test`, `npm run release:check`, `npm run test:browser` y todas las suites ya existentes siguen obligatorias, incluidos V410/V494/V500/V501/V507–511/V600/V604/V625.
- `v700-movement`: saltos cortos/largos, buffer, coyote, borde, cámara, cada uno de los 50 kits sin NaN, hitbox no mutada, controles táctiles.
- `v700-level-design`: recorrido físico, cada checkpoint, chasm/caída mortal, reintento, sin objetivos inaccesibles, salida sin encierro.
- `v700-pulse`: 10 cambios de estado deterministas, ida/vuelta, reducción de movimiento y no duplicación de sellos/XP.
- `v700-boss`: telegráfico visible, daño justo, patrones/salida, 3 dificultades y Quimera.
- `v700-save-migration`: iniciar desde partidas antiguas 636 y 10 héroes, guardar tras morir, reanudar, offline, localStorage denegado.
- `v700-visual`: matriz Chromium (320, 390, 768, 1280, 1440), relación Canvas/HTML, superposición HUD, contraste, capturas de 50 formas, enfoque/teclado, movimiento reducido.
- `v700-performance`: dos escenas exigentes por héroe; medidas registradas de p50/p95, memoria y errores en condiciones repetibles. En hardware de prueba especificado, **objetivo** de 60 FPS escritorio, 30 FPS móvil de gama media; no afirmar compatibilidad universal a partir del runner CI.
- `v700-content`: ausencia de audio/arte roto, sonidos originales, rutas secretas accesibles y objetivo principal comprensible.
- **Publicación:** `quality` total + `OHANA CI` + gates V700 + Pages + release gate, todos sobre los SHA correspondientes. CI verde por sí sola no certifica que el juego sea divertido.

### Prueba humana (no sustituible por bots)
- Mínimo **10 sesiones** con personas que no conocen el proyecto, incluyendo móvil y teclado; registrar primer intento de salto, muertes inexplicables, dudas de objetivo, intentos de usar poder y si quieren seguir jugando.
- Umbrales de diseño propuestos: **al menos 8/10** entienden el primer objetivo sin ayuda, **8/10** identifican por qué murieron y **8/10** quieren jugar un segundo capítulo. Si no, iterar antes de escalar el contenido.
- Revisar mandos físicos y dispositivos modestos. Una prueba Chrome emulada no reemplaza la prueba humana/táctil real.

## 8. Riesgos y cosas prohibidas
1. **No rehacer todo el motor** por estética: primero probar un cambio aislado sobre fixtures existentes.
2. **No romper saves ni el multijugador**: migración versionada y regresión cruzada.
3. **No meter luces en zonas peligrosas sin contraste**: peligros y plataformas visibles siempre.
4. **No usar assets de Nintendo**: historia, criaturas, iconografía, melodías y reglas expresivas propias.
5. **No convertir el README en taller**: portada pública en inglés preferiblemente, con la fantasía y capturas de la versión real; ingeniería en `docs/`.
6. **No prometer 60 FPS en cada móvil**, ni online probado sin dos dispositivos, ni diez niveles «AAA» solo porque pasan tests.
7. **No publicar con gates rojos** ni usar test skips, `force`, adelantar el SW o afirmar Pages antes de que confirme.

## 9. Orden de arranque inmediato

**Primer lote ejecutable en esta rama:**
1. Capturar baseline 636 (grabación, imágenes y timings) de Kilo, Michi y Dino.
2. Definir contratos `movement`, `level-beat` y `pulse` y añadir fixtures sin modificar gameplay.
3. Implementar arena de control con salto, caída, cámara, móvil y gamepad.
4. Construir el primer Pulso interactivo de Michi con salida física y continuidad de guardado.
5. Entregar una demo de **3 minutos irresistibles**, someterla a pruebas humanas, luego ampliar el mundo.

**Decisión editorial:** el «mayor commit» no será el que más líneas cambie. Será aquel en que el juego se sienta claramente distinto después de los primeros diez segundos y los diez héroes sigan funcionando al final.

## Inspiración pública, sin copiar
- Nintendo, *Ask the Developer: Super Mario Bros. Wonder*: diseñar una sorpresa genuina por nivel y mantener la confianza del jugador en las reglas físicas. https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-11-super-mario-bros-wonder-part-1/
- Recurso técnico sobre salto variable, *coyote time* y *jump buffering*: https://www.fromscratchlab.com/GameDev/platformer
