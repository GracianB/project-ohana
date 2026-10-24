# Kilo V1 — repertorio cerrado

Versión de juego: **ohana-445**. Referencia de personaje: **kilo-v1.0.0**.
Esta entrega cierra el diseño de Kilo; no declara terminada la V1 de toda la campaña. Cambios futuros de contenido se centrarán en los otros personajes. Se conservan correcciones necesarias de errores y compatibilidad.

## Estrategia

| Control | Función | Decisión |
| --- | --- | --- |
| H / F | Golpe cercano | Acercarse, abrir el combo y responder sin gastar recargas |
| J | Distancia: notas con rebotes | Acertar da pétalos y enlaza el golpe cercano |
| K, desde forma 2 | Defensa y movilidad | Vuelo libre 4,5–6 s, protección inicial de 0,2 s y reflejo de disparos; no cura ni protege todo el vuelo |
| L, desde forma 3 | Daño de área y recuperación | Guardianes durante 4–5 s; curación limitada por impactos reales; los pétalos mejoran alcance y daño |
| I, desde forma 4 | Remate de combo | Acertar H → J → H en cuatro segundos habilita seis segundos para activarlo; consume la oportunidad, concede diez fotogramas de evasión y atraviesa golpeando una vez a cada objetivo |
| P, forma 5 | Ataque de área con ritmo | Requiere 100 de barra ganados haciendo daño; tres señales con ventana de ±8 fotogramas; cada acierto mejora alcance y daño antes de resolver el golpe |
| U, desde bebé | Ayuda ofensiva | Compañero invulnerable que actúa dentro del escenario; recarga propia, independiente de I y P |

Cada lanzamiento de J y cada golpe H cuentan una sola vez en el combo aunque toquen varios enemigos o reboten. Repetir una tecla sin acertar no avanza. Recibir daño, morir o cambiar de sala cancela el progreso. Una habilidad bloqueada no consume recarga ni barra.

## Movimiento

Doble toque lateral en 16 fotogramas (unos 267 ms) para correr mientras se mantiene la dirección, a 1,4 veces la velocidad normal y con tope de 12 unidades/fotograma. Soltar, invertir, bajar o recibir daño detiene la carrera. Funciona con teclas, botones táctiles y cambios de dirección del eje del mando. La carrera no acelera el vuelo ni sustituye al dash.

Mantener salto permite modular la altura y planear. Pulsaciones nuevas permiten saltos adicionales según forma: uno en bebé/Kilo, dos en Ohana/Super y tres en Flor Solar. La repetición automática de una tecla no crea saltos nuevos. K dirige el vuelo en ocho direcciones y queda suspendida al soltar; no atraviesa el suelo ni evita los pozos al terminar.

## Presentación y sala

Cinco formas, pelo creciente, cuatro escenas de evolución con el poder desbloqueado, aro dibujado por detrás y delante del cuerpo, I con preparación/avance/golpe/recuperación y P con tres indicadores. Efectos sin círculos heredados de pantalla completa. Se respeta movimiento reducido.

Claro: jardín y palmeras, casa sobre pilotes, balsas horizontal/vertical, tres repisas frágiles, dos pozos con recuperación, secreto musical, diez enemigos repartidos y Tambor del Claro. Álbum persistente de 100 fragmentos y ukelele con escena de diez segundos al completarlo, disponible para cualquier héroe.

## Verificación de cierre

Pruebas de secuencia, orden incorrecto, repetición multigolpe, expiración, consumo, cambio de sala, daño, desbloqueos, daño del remate, barra/ritmo, vuelo/reflejo, curación por impacto, carrera y saltos. Recorridos reales de navegador con teclado y capturas de escritorio/móvil, cinco formas/cuatro evoluciones y álbum/peligros. La lista final ejecutada figura en PROGRESS.md.

## Cierre de fase 1 · ohana-452

El repertorio de ohana-445 se conserva. La selección mejora Bahía del compás con la escena de Kilo y Stitcho. Tambor del Claro pasa a minijefe de 360 PV y 100×76, con tres ataques anunciados, dos fases, recuperación y guardado de derrota. Se integra la campaña/cooperativo de main V451. El checklist compartido vive en CHARACTER-PHASES.md.

## Reapertura explícita · campaña V501

El usuario ha reabierto el trabajo de Kilo para la campaña por protagonistas. La referencia V445 anterior se conserva como historial del repertorio. V501 mantiene arte, daño base y umbrales; las formas intermedias conservan la levitación temporal. Flor Solar añade vuelo sostenido con K, otra K desciende y el daño aceptado lo interrumpe. El aura ofensiva/reflejo mantiene su duración máxima de seis segundos. J puede dirigirse durante ese vuelo; su uso normal conserva rebotes y búsqueda. El Claro del Mundo 1 incorpora sus cuatro encuentros, crecimiento por notas, ruta opcional de carillones y respuestas aéreas del Tambor. La sala y el Tambor del Mundo 2 conservan sus reglas previas. Detalles y alcance de validación en V501-AVENTURA-CLARA.md; contratos para las demás salas en CAPITULOS-IDENTIDAD.md. No se declara aceptación humana del balance ni publicación.
