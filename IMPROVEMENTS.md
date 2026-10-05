# 76 mejoras · Demo Mundo 1

## Jugabilidad y presentación

1. Portada océano + CTA
2. Cartas con bebés chibi
3. Intro al pulsar Jugar
4. Nueva partida borra save
5. Continuar recupera forma y sala
6. 5 formas reales
7. Bebé sin cine de evo
8. forma final
9. HUD cristal
10. Pips 1/5
11. Objetivo por sala (demo-obj)
12. Tutorial en 5 pasos
13. Cinta DEMO Mundo 1
14. Flechas ESTE/OESTE/ARRIBA/ABAJO
15. MURO en callejones
16. Pozo mortal rotulado en Costa
17. Hueco Jungla ↓ Caldera
18. Hueco Cumbre ↓ Claro
19. Hueco Órbita ↓ Arrecife
20. No saltar dos pisos
21. Caer de plataforma ≠ morir
22. Solo pozos matan
23. Coyote time + buffer
24. Wall jump
25. Dash + afterimage
26. Combo + rank
27. Daño flotante
28. J a distancia en todos
29. K / L únicos
30. Proyectiles con forma
31. Enemigos crawler / flyer / brute
32. Jefe con fases visuales
33. Barra de jefe
34. **10 salas → Nido**
35. Ending Ohana completado
36. Notificaciones cerrables
37. Cine de evolución
38. Mapa de archipiélago
39. Pausa Esc
40. Mute N
41. Fullscreen
42. Toque móvil
43. Canvas responsive
44. Partículas cap 72
45. Fondos ligeros
46. Save localStorage
47. GitHub Pages + .nojekyll
48. README demo
49. Ruta Mundo 1 cerrada
50. Versión DEMO jugable online
51. Evolución visual por forma: silueta, postura y firma 0 → forma final
52. Evolución aplicada al combate: H/J/K/L escalan su lectura por forma y héroe
53. Cinemática de evolución 2.0: firma gráfica por héroe y etapa, medidor 0→forma final y reveal reforzado
54. Rediseño de formas finales: nombres únicos y siluetas ornamentales específicas para cada personaje

55. **Director de combate del boss**: rutinas encadenadas, selección contextual, recuperación vulnerable y fase 3 con presión creciente
56. **Boss Reactive Director**: memoria de dash/aire/presión, adaptación por patrón, desesperación determinista y recompensa de `PUNISH` en ventanas vulnerables
57. **Boss Counterplay**: esquivas DASH/AIRE/DISTANCIA, racha defensiva, `BREAK` tras tres respuestas y recompensa de ejecución limpia
58. **Boss Adaptive Encounter**: memoria de respuestas, presión por repetición, CEBO y cambio determinista de preferencia sin abandonar patrones autorizados

## Cifras maestras

La demo publicada se documenta con estas cifras:

- **10 personajes**
- **5 formas por personaje**
- **10 salas**
- **1 Reina del Nido**
- **3 habilidades por personaje: J / K / L**

Estas cifras deben permanecer alineadas entre el código, manifest.json, README.md, PROGRESS.md y el pipeline de GitHub Pages.

59. **Boss Adaptive Bait**: dos respuestas defensivas iguales arman un CEBO de un solo uso, con rutina autorizada por fase y rearme tras una nueva observación limpia
60. **Boss Bait Feedback**: el boss registra si el jugador leyó o cayó en el CEBO y ajusta el tempo siguiente de forma determinista y acotada
61. **Boss Encounter Memory**: memoria acotada del encuentro que usa el historial reciente para orientar rutinas cortas o largas sin salir del repertorio autorizado
62. **Ability Reliability**: corrección del updater ausente de Kilo Hula y endurecimiento del agarre de queso de Pizza para evitar bloqueo de control
63. Phase 25: abilities endurecido con cooldown determinista a 60 Hz, RNG inyectable, VFX reproducible, limpieza de estados, hitboxes seguras y límite de proyectiles.
64. Phase 26: VFX de pasivos y partículas deterministas, sin `Math.random()`, partículas acotadas a 72 y sanitización de valores numéricos.

65. Phase 27: firewall de mutaciones de combate; daño, XP, puntuación y bajas se normalizan con valores finitos y se eliminan operaciones aritméticas directas sobre estado crítico.

66. Phase 28: presupuesto de runtime para colecciones transitorias, números flotantes acotados y VFX de portales deterministas, sin `Math.random()` ni `performance.now()`.

67. Phase 29: Runtime Integrity Guard para sanear estado crítico antes de cada paso y evitar propagación de valores no finitos en juego y colecciones.

68. Phase 30: bucle runtime fail-closed con captura separada de fallos de simulación y render, registro, reset y pausa segura.

69. Phase 31: pipeline CI actualizado a actions/checkout@v7 y setup-node@v7, con timeouts explícitos para evitar jobs colgados.

70. Phase 32: separación de dominios RNG para impedir que render/VFX alteren la reproducibilidad de la simulación.
71. Phase 33: decisiones jugables de sorpresas y lluvia pasan por RNG inyectable y la llegada del Nido queda ligada al reloj fijo de simulación, sin temporizador de pared.
72. Phase 34: firewall global de mutaciones críticas mediante `systems/mutations.js`; los sistemas de gameplay comparten daño, curación, XP, puntuación, combo y escalado seguro de vida.

73. Phase 35: presupuesto runtime compartido para colecciones transitorias, caps para bolts/slashes y compactación in-place sin reconstruir arrays válidos en cada tick.

74. Phase 36: E2E de gameplay en navegador con secuencia reproducible de inicio, habilidades, evolución, lluvia, Nido, daño real al boss y transición a fase 3.

75. Phase 37: aislamiento del harness E2E para impedir que la API de pruebas se exponga en el dominio publicado.

76. Phase 38: cierre final del firewall de mutaciones, incluyendo combo, para eliminar la última aritmética directa sobre un contador crítico de combate.

## Phase 40 - Cache Graph Closure

77. Phase 40: cierre del grafo de caché del runtime; todos los módulos JavaScript de producción quedan precacheados con `ohana-114` y una regresión automática impide dejar módulos nuevos fuera del Service Worker.

## Phase 39 - Session Reset Closure

El arranque de una nueva partida no debe heredar estado transitorio de una sesión anterior. Se cubren countdown del Nido, finale, transiciones de puertas, cámara, flashes, pausa y runtime faults.

La progresión persistente sigue restaurándose exclusivamente desde `saveStore`.
