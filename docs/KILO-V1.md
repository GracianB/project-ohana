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
