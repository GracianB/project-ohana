# V501 · La aventura se entiende jugando

Esta entrega parte de V500 (`981526fc51177355f138e6f7f3917f5d037dade7`). El usuario pide aprovechar el contenido construido y corregir las interacciones de antenas, vórtices, catapultas y objetos de activación. No se convierte la evolución en un traje desechable ni se eliminan salas, héroes, formas o colecciones.

## Decisiones jugables

- **Red de Chispín:** la carrera anterior daba siete segundos entre antenas separadas por hasta 1.600 unidades y borraba las conexiones al expirar. Cada antena ahora se conecta por contacto o ataque, en cualquier orden, y conserva lo conseguido. Se necesitan las cuatro conexiones reales para abrir la salida; no basta pasar de largo ni cargar un tiempo ficticio.
- **Viajes con intención:** vórtices y catapultas usan E, muestran su destino y no se activan al pasar. El vórtice conserva su animación y su llegada, pero no altera la velocidad de alguien que camina junto a él. Se respetan las rutas explícitamente cerradas y el bloqueo de Mundo 2.
- **Interacciones con propósito:** la guía comparte los datos del objetivo activo. Una pieza recogida señala su propio taller; una pizza señala un cliente pendiente. El antiguo altar final se representa como un cartel de salida, no como otra activación que buscar.
- **Progreso que se conserva:** cada estación completada se guarda. Los saves v2/v3 anteriores siguen cargando; el campo opcional world1Stations contiene solo IDs existentes, sin hornos, temporizadores ni objetos transportados. Las conexiones y recompensas ya obtenidas no vuelven a pagar al cargar. Prismas conserva su orden I → II → III.
- **Toda la familia permanece:** se conservan 10 héroes, 50 formas, habilidades, diez salas, Quimera y el epílogo V500. La evolución continúa siendo automática por experiencia; se conservan sus umbrales; la ampliación de K/J de Kilo, autorizada después, se describe al final. El álbum es opcional y no bloquea formas ni la campaña.
- **Una sola información principal:** el objetivo usa la tarjeta accesible ya existente, en lugar de competir con otra barra dibujada encima. El contador del álbum vive en su botón; los mensajes de hallazgo y el álbum completo se conservan.

## Validación y alcance de las pruebas

`tests/world1-v501-journey.test.js` prueba guardado/carga de conexiones, datos inválidos, contacto de formas grandes, ataques, recompensas únicas y destino contextual de pieza cero y pizza. Las regresiones de las diez mecánicas mantienen sus requisitos; se actualiza únicamente el contrato intencional de la antigua carrera y el guardado por estación.

`npm run test:browser:journey` comprueba en Chromium que vórtice y catapulta requieren interacción, la ruta cerrada no inicia viaje, y el protagonista de la sala llega a las cuatro antenas de Chispín usando movimiento, ataques y saltos reales, sin curación ni teletransporte. Las dos salas previas se marcan como una **fixture de acceso**: esta prueba no acredita ganar esas dos salas previas ni la campaña entera. La red de Chispín sí se completa físicamente y se comprueba el sello. Comprueba también que esperar más que el plazo anterior no borra el avance, y que el flujo de Continuar restaura la conexión real guardada. Captura escritorio, móvil y la red completada.

Las pruebas existentes de V500 y de personajes se conservan. Sus fixtures de recuerdos prueban interfaz y compatibilidad, no una nueva victoria completa. No se certifica diversión con personas ni balance de todos los héroes a partir de estas pruebas.

### Resultado local de esta entrega

- 1.496 pruebas Node aprobadas, sin fallos ni omisiones.
- Release gate aprobado: ohana-501, 10 héroes, 5 formas por héroe, 360 recursos precacheados y hashes actualizados.
- Auditoría general de navegador aprobada en Chromium instalado, escritorio y móvil.
- Recorrido V501 aprobado: cuatro antenas conectadas y sello conseguido con el protagonista de la sala, con reintentos normales permitidos y recuento en el informe, sin teletransporte ni curación inyectada. Continúa siendo una prueba de esa sala con los dos sellos previos preparados como fixture.
- Regresión de reintento de Kilo aprobada; constelación V500 y pruebas de presentación de personajes aprobadas.
- Capturas revisadas de escritorio y móvil bajo test-results/v501. El modo CHROMIUM_BIN permite usar Chromium instalado sin alterar las aserciones ni el navegador predeterminado de CI.

## Publicación

La caché pasa a ohana-501 con hashes de contenido regenerados. Esta documentación describe una entrega de desarrollo: para anunciar publicación se necesitan CI del commit final, integración y Pages del mismo código. El multijugador continúa fuera de esta entrega y desactivado en hosts públicos.

## Experiencia durante la partida

Las ayudas de poderes consultan la habilidad equipada: muestran su nombre y descripción al probarla, o la forma necesaria si todavía está bloqueada. No enumeran seis controles de golpe. Se muestran una vez por habilidad y estado durante la sesión, respetando las pausas y los paneles abiertos. El minimapa móvil pasa de 176×98 a 144×82 para dejar más escenario visible; conserva terreno, controles y progreso.


### Llegadas, historia y nuevas formas

Las escenas mantienen su historia y sus celebraciones, pero ahora tienen un botón real para avanzar desde el móvil y texto completo accesible. La primera pulsación revela una frase que todavía se está escribiendo; la siguiente avanza. Los primeros veinte fotogramas protegen frente a una pulsación arrastrada de la partida. Mientras dura la escena se bloquean movimiento y poderes; el HUD y el minimapa no cubren la historia. Al terminar vuelve el foco al juego.

Los títulos se ajustan en hasta dos líneas y las frases se distribuyen sin truncar palabras en móvil y escritorio. La comprobación usa métricas reales de Canvas para todas las escenas de introducción, llegada de los diez héroes, celebración de los diez sellos, Quimera y epílogo en 320, 390, 844 y 1440 píxeles de ancho.

Después de una evolución, el aviso presenta el nombre y uso del poder recién abierto: K en forma 2, L en forma 3, I en forma 4 y P en forma 5. U sigue siendo el compañero disponible desde el comienzo. Se conserva la descripción narrativa de las formas dentro de su presentación; no se alteran ataques, estadísticas ni experiencia requerida.

Validación adicional: `npm run test:browser:experience` recorre la introducción real mediante pulsaciones táctiles, comprueba la congelación y recuperación de control, y verifica las cuatro evoluciones mediante el atajo de depuración existente. La experiencia necesaria para esas cuatro formas es una fixture; no se presenta como progreso ganado jugando. La prueba de antenas continúa obteniendo su sello mediante movimiento y combate reales.


### Interacciones con una respuesta clara

- Frita: después del impulso real, el objetivo cambia del géiser a la patata elevada. La guía indica también arriba o abajo, además de este y oeste. Una caída o salto ajeno al géiser no se presenta como un impulso del mecanismo.
- Pizza: mientras transportas una pizza, el objetivo muestra los segundos de calor que quedan en el temporizador real. Al enfriarse, dirige al horno y conserva los clientes ya atendidos.
- Stitcho: cada pieza y su taller comparten número y color; la pieza transportada mantiene esa identificación. La pieza cero sigue siendo válida.
- Yomi: los nodos son terminales de datos con pantalla, trazas y un indicador de fase. «ESPERA» y «AHORA · ACÉRCATE» se corresponden con la ventana de activación existente. No se altera la duración de esa ventana ni se completan terminales por dibujarlos.
- La señal de salida muestra el progreso del sello; intentar salir antes de tiempo explica qué objetivo falta, en lugar de repetir toda la mecánica de la sala.

`npm run test:browser:rooms` recorre mediante teclado los primeros objetivos de Frita, Stitcho, Yomi y Pizza con sus propios héroes. Los sellos de salas anteriores se preparan como fixtures de acceso. No usa teletransporte, curación ni concesión de esos cuatro objetivos; no acredita el resto de cada sala ni una campaña completa. Las capturas quedan en `test-results/v501`.

El objetivo persistente ocupa la misma zona que los avisos y no repite la animación al actualizar la dirección o el calor de una pizza. Se corrige la regla antigua que lo enviaba junto a los controles inferiores.

El impulso del géiser limpia el estado de recorte, coyote y salto pendiente anterior. Soltar un salto previo ya no reduce ese impulso externo; la velocidad del géiser se mantiene en −21 y no cambian las capacidades del personaje. El seguimiento de vuelo se limpia al aterrizar.

El test de las cuatro salas controla el reloj de Playwright entre acciones para que la latencia de la herramienta no desplace al jugador entre una lectura y una pulsación. Avanza los pasos reales del motor y vuelve a renderizar; conserva colisiones, enemigos, temporizadores y daño.


### Álbum que se puede consultar durante una aventura

El botón de álbum de la campaña y B abren ahora la misma colección persistente del héroe de la sala. Antes, el botón llevaba al museo antiguo mientras B tenía dos manejadores distintos; el álbum Canvas tampoco detenía el combate. La galería narrativa del título mantiene sus recuerdos y escenas.

La campaña usa un diálogo con diez páginas de diez recuerdos, botones táctiles Anterior/Siguiente/Volver, navegación por flechas, cierre con B/Escape, foco contenido dentro del panel y retorno al origen al cerrar. Mientras está abierto se detienen los pasos de juego, enemigos y daño; mapa y ayuda no se apilan encima. La interfaz se adapta a móvil vertical, horizontal y escritorio. Los datos, posiciones, premios y migración de la colección permanecen: +10 puntos por recuerdo, hasta +10 de vida por página y una reliquia al reunir los 100.

Los objetos opcionales se dibujan como cromos para distinguirlos de los cristales de experiencia. El contador del botón cambia en cada recogida. Se conservan partículas breves, el aviso del primer recuerdo y las celebraciones de página y reliquia; se elimina el texto flotante de contador en cada objeto que se acumulaba durante el combate. El álbum explica la función de recuerdos, XP y sellos.

`npm run test:browser:album` gana el primer recuerdo mediante movimiento real, abre con el botón táctil, recorre las diez páginas, comprueba foco, pausa efectiva, cierre y recuperación del movimiento, y verifica persistencia tras recargar. Valida el diseño en 390×844, 320×650, 844×390 y 1280×900. El reloj del navegador se controla entre acciones; no se inyectan recuerdos ni premios. Las pruebas Node añaden las 100 entradas, verifican la recompensa de cada página, la reliquia única y la reconstrucción desde guardado.

### Salas, música y bienvenida

Las diez salas conservan sus objetivos y personajes, con una paleta y un paisaje propios: bahía, astillero, templo de nubes, laguna lunar, bosque de auroras, forja, cañón, mercado, puerto de hornos y observatorio. Las rutas opcionales se colocan al entrar y varían según la sala. Frita conserva libre la columna de sus géiseres. El panel de pausa añade una estrategia concreta para el mecanismo de cada héroe.

Se corrige la aparición de plataformas al acercarse al extremo: el generador de escaleras de retorno de otros mundos se estaba aplicando también a las salas de Ohana. Ya no añade terreno al llegar a la salida, incluso con un atajo antiguo guardado. Las rutas de retorno de otros mundos se conservan.

Cada héroe tiene una variación musical procedural propia, con tempo, tono y frase distintos, usando el sintetizador existente. La prueba de navegador renderiza las diez partituras y comprueba señal finita, audible y sin recorte digital; no sustituye una escucha musical humana.

La bienvenida inicial cambia a una bahía luminosa con paseo, faroles y profundidad, manteniendo las conversaciones y animaciones de los diez personajes. El selector muestra también los personajes bloqueados, preserva sus requisitos y usa tres columnas en móvil para que no se recorten. Los paisajes son decorativos y no cambian las colisiones.

### Poderes y combo de Kilo

El HUD y los controles táctiles muestran el estado real del poder: forma necesaria, segundos de recarga o carga pendiente. Intentar usarlo explica por qué todavía no sale. Para I de Kilo, la guía indica el siguiente golpe: acertar H, después J y después H a enemigos en cuatro segundos; pulsar al aire no cuenta. Después quedan seis segundos para usar I. Se conserva la autoridad de `useAbility`, las estadísticas y los costes; P sigue aceptando su ritmo durante la ejecución aunque su barra ya se haya gastado. El aviso de combo ocupa menos pantalla.

`test:browser:powers` comprueba estados y controles reales con fixtures explícitas para las formas avanzadas y la presentación del contador. `test:browser:worlds` captura bienvenida, selector y diez salas, comprueba que no aparezca terreno al salir y audita las diez músicas. Las posiciones de las capturas y los sellos previos son fixtures de acceso; estas pruebas no acreditan una campaña completa ni su dificultad humana.

### Campaña por protagonistas · dirección aceptada

Cada capítulo pertenece a su protagonista. Al cruzar a otra sala, el motor crea su héroe bebé, con XP y recargas nuevas; no arrastra la forma máxima anterior. Reintentar la misma sala conserva el personaje y la evolución; Continuar conserva la forma guardada si corresponde al protagonista de ese capítulo. Los datos de una partida antigua con otro personaje se adaptan al dueño de la sala. Los sellos y recuerdos permanecen. Quimera sigue requiriendo los diez sellos y conserva su combate existente; no se ha implementado un sistema de relevos.

El selector pasa a ser una galería nocturna de capítulos con retratos reales, números de capítulo, progreso y puerta final. Se elimina el paisaje de islas del selector y se mantiene la bienvenida narrativa separada. La primera partida empieza con Kilo. El botón de capítulo respeta los bloqueos, también al seleccionar mediante los accesos HTML.

Primera mejora de aprendizaje de Kilo: su estrategia de pausa cambia con cada forma y explica una decisión concreta para H/J, K, L, I y P, incluyendo límites del vuelo y el siguiente combo. Se conserva su arte, daño, controles y repertorio. La revisión posterior de crecimiento, encuentros y guardián se detalla al final de este documento. Las pruebas nuevas verifican el cambio real Kilo máximo → Stitcho bebé y el reintento de Stitcho evolucionado; las formas usadas para esa prueba son fixtures explícitas.

Continuar toma el protagonista de la partida guardada, aunque el menú tenga seleccionado otro capítulo. La prueba de antenas conserva esa diferencia de selección para verificar el caso. La ejecución anterior con Kilo pertenece al diseño previo; la campaña nueva usa Chispín en su santuario.

Kilo añade respuesta de combate ligada al impacto real: 1/3 pide acertar J, 2/3 pide H y 3/3 anuncia I y sus seis segundos. Los rebotes o impactos repetidos del mismo ataque no duplican el aviso ni avanzan la secuencia. Se mantienen daño, costes y ventanas.

### Claro de Kilo · crecimiento y desenlace jugables

La revisión del capítulo incorpora cuatro encuentros junto a los hibiscos y un desenlace con el Tambor del Claro. Los roles pasan de perseguidor/saltador a disparos, escudos y combinaciones; se mantiene el camino principal por el suelo y las repisas ofrecen alternativas. Las columnas de los hibiscos quedan despejadas: una repisa no oculta el lugar donde hay que detenerse.

Cada nota ganada asegura un mínimo de XP: 55, 140, 260 y 420. Se mantienen los umbrales generales y el crecimiento por combate/exploración. El mínimo no se suma, no reduce XP mayor y no vuelve a pagar al cargar o reintentar. Así pueden recorrerse las cinco formas dentro del capítulo, con Flor Solar disponible para el desenlace. Un enemigo vivo a menos de 270 unidades del hibisco, o recibir daño, interrumpe la interpretación; el objetivo y la flor indican que hay que despejar la zona.

Cuatro notas preparan la canción, pero el sello nuevo exige vencer también al guardián. El cartel y la guía señalan ese paso. El Tambor reutiliza su cuerpo, tres patrones, dos fases y 360 PV, con un escenario y una identidad de guardado propios del capítulo. Su introducción está protegida; durante preparación/ataque recibe el 20% del daño y en recuperación recibe daño completo. La reducción se aplica en la frontera numérica compartida, también a poderes y compañeros; los enemigos sin ese estado mantienen su daño anterior. El Tambor antiguo del Mundo 2 conserva sus reglas y su arena. Los sellos ya ganados en partidas anteriores siguen siendo válidos.

El paisaje de Kilo añade colinas curvas, paseo con hibiscos y un escenario de música con faroles. Las escenas de historia ocultan también el contador de combo y la barra de poderes, para que no cubran el botón de avanzar.

`npm run test:browser:kilo-chapter` recorre el capítulo con teclas y reloj controlado, gana las notas y formas sin inyectar posición, vida, XP, enemigos ni victorias, usa Continuar a mitad del recorrido y derrota al guardián. Registra reintentos naturales, estados del guardián y capturas. No acredita dificultad o diversión humana ni la campaña completa. Las pruebas de las diez mecánicas usan una derrota del guardián preparada explícitamente para aislar la serenata; las nuevas pruebas del capítulo comprueban por separado la puerta, los mínimos de XP, amenazas, daño protegido y persistencia.

### Kilo · cartas de combate entre suelo y cielo

K mantiene la levitación de 4,5–5,5 segundos en las formas intermedias. Flor Solar activa vuelo sostenido en ocho direcciones, sin temporizador de movimiento; otra pulsación de K desciende, incluso durante la recarga. Reiniciar el vuelo respeta la recarga original. Un golpe que causa daño cancela ese vuelo; también se limpia al morir o cambiar de sala. El movimiento puede continuar después de expirar el baile, pero el aura ofensiva, el reflejo de proyectiles y la protección inicial NO se prolongan: mantienen su duración anterior, con seis segundos máximos de aura y 0,2 segundos iniciales de protección.

J conserva sus notas con gravedad, rebotes y búsqueda en su uso normal. Durante vuelo solar, las tres notas forman una ráfaga recta en la última dirección de movimiento, también hacia arriba, abajo o en diagonal. Conservan número y daño; tienen una vida de 90 ticks y terminan al tocar el suelo, en lugar de mantener homing o rebotes infinitos. La barra y el botón táctil de K indican vuelo activo y descenso.

Los escudos usan la misma comprobación de altura y orientación para golpes y habilidades: atacar desde arriba o por detrás abre un flanco. Dos vigías mantienen bandas aéreas propias; no se convierten en perseguidores del suelo. El Tambor prepara un abanico cuando Kilo está alto. Su dirección queda fijada durante el aviso y sus tres rayos dibujados coinciden con los proyectiles lanzados; cambiar de altura permite esquivarlos.

Tres carillones elevados ofrecen una ruta opcional de vuelo solar. Cada contacto válido produce su respuesta musical y +150 puntos una sola vez; los secretos se serializan con IDs de su sala y sobreviven a Continuar. No conceden XP, curación ni carga de P y no bloquean el sello. El piloto físico obtiene los tres usando movimiento real y verifica su persistencia. Las pruebas aisladas de control usan formas, posiciones y un blanco inmóvil como fixtures explícitas; el daño que interrumpe vuelo se prueba mediante el flujo real de daño del Lab, preparado como fixture separada.

La dirección de las diez salas se concreta en `docs/CAPITULOS-IDENTIDAD.md` y en WORLD1_CHAPTER_PLANS. El selector presenta la identidad y movilidad propias de cada capítulo. Es un contrato de diseño para las siguientes entregas, no una declaración de que se hayan rehecho todos sus encuentros.
