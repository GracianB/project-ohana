# Single player · candidata de cierre

Fecha de auditoría: 23 de octubre de 2026. El número de una prueba V493/V494 no identifica por sí solo una versión publicada. La caché vigente continúa siendo `ohana-470`.

## Alcance cerrado

Mundo 1: diez salas de personaje, diez sellos y Quimera de cuatro fases; cinemáticas de caída y reunión, tarjeta final y regreso al inicio. Diez héroes y cincuenta formas existentes. Se conserva el repertorio cerrado de Kilo conforme a AGENTS.md. Sin nuevas salas, habilidades, mundos ni infraestructura multijugador durante este cierre.

## Estado observado

- `main` en `e757073b3576dd32397902a3db67f13e7b7b1b36`: V492 integrada; CI y Pages aprobados.
- V493, PR #431: victoria física histórica aprobada en `8a9725ea`; la cabeza posterior `d6c73083` falla al comprobar la cinemática de caída. Una victoria histórica no certifica otra cabeza.
- V494, PR #434: HUD aprobado en `1f6a48ef`; CI falla por expectativas antiguas del README.
- PR #435: candidata consolidada que conserva ambos historiales y corrige el bloqueo de dirección durante la secuencia genérica de muerte. No está publicada mientras no se acredite merge y Pages del mismo commit.

## Puertas de salida

| Puerta | Evidencia exigida | Estado al preparar la candidata |
|---|---|---|
| Integridad | Node y release gate | 1451 pruebas aprobadas localmente, incluidas las dos regresiones del final; release gate aprobado |
| Campaña | Partida nueva, diez sellos, cuatro fases y victoria física | Nueva ejecución en GitHub pendiente |
| Cierre narrativo | Caída → reunión → tarjeta accesible | Regresión normal/reducida aprobada; navegador pendiente |
| Interfaz | HUD de Quimera sin panel antiguo ni solapamiento | Aprobado en V494 anterior; repetir sobre candidata |
| Persistencia | Sellos, muerte/reintento y recarga | Exigir pruebas de Quality; revisión humana pendiente |
| Controles | Teclado y táctil; mando solo si se acredita | Quality y revisión humana pendientes |
| Rendimiento y visual | Pruebas existentes de escritorio, móvil y movimiento reducido | Quality pendiente |
| Publicación | Pages aprobado sobre el commit fusionado y comprobación de URL/SW | Pendiente |
| Jugabilidad humana | Objetivos, cámara, señales, dificultad y satisfacción del final | Pendiente; no sustituible por piloto automatizado |

## Orden de trabajo

1. Cerrar la candidata #435 con sus validaciones. Ante fallo, leer evidencia y corregir la causa; no rebajar las aserciones ni alterar HP/sellos para obtener verde.
2. Revisar los artefactos visuales y el recorrido completo sobre esa cabeza. Registrar defectos observables, no mejoras ilimitadas.
3. Corregir bloqueos y defectos que impidan comprender o completar la demo. Las ideas de contenido se aplazan.
4. Integrar con los controles aprobados y publicar. Comparar el commit desplegado y el manifiesto offline antes de anunciar disponibilidad.
5. Entregar una versión identificable con compatibilidad y limitaciones acreditadas; mantener una ventana corta de correcciones.

## Clasificación de incidencias

- Bloqueante: inicio imposible, pérdida de partida, progreso o final bloqueado, controles esenciales rotos. Impide publicar.
- Necesaria: objetivos confusos, señales ilegibles, fallos repetidos de presentación/rendimiento. Resolver sobre evidencia antes del cierre.
- Posterior: nuevas animaciones, rediseños amplios, habilidades, contenido o multijugador. No amplían esta candidata.

No se anuncia cierre completo hasta superar todas las puertas aplicables. Una prueba en dificultad fácil acredita ese recorrido; no acredita automáticamente el equilibrio de las demás dificultades, los cien recuerdos de cada héroe ni todos los dispositivos físicos.
