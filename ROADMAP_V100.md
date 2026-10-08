# OHANA · Camino hasta la V100

## Principios de lanzamiento

Cada versión debe mejorar algo que se **juegue**, no solo algo que se mire. Seguridad del multijugador, FPS estables, controles responsivos, accesibilidad y estilo 100 % vectorial en los héroes principales.

| Versión | Entrega | Verificación necesaria |
|---|---|---|
| V93 | Cuerno: metamorfosis cinematográfica en cuatro rituales | PR #225 independiente, CI y publicación |
| **V94** | **Diez mundos: amenazas legibles y director escalable** | Escenas, stress del director, browser, coop, visual |
| V95 | Exploración con secretos de cada bioma y recompensas justas | Rutas completas, guardado, accesibilidad |
| V96 | Enemigos y arenas con comportamientos contrastados | Patrones sin daño injusto ni picos CPU |
| V97 | Santuario del Dragón jugable y antesala del Nido | Plataformas, retos, multiplayer sin bloqueo |
| V98 | Reina: anticipación, contraataques y derrota con clímax | Fases 1–3, muerte y ending sin residuos |
| V99 | Cooperativo: latencia, pérdida de conexión y rendimiento | 2 jugadores, 10 mapas, 10 héroes, móviles |
| **V100** | **Lanzamiento final: 10 mundos, 10 personajes, juego completo** | CI/Release Gate, balance, visual, accesibilidad, Pages |

## Criterios globales de aceptación

- **Jugabilidad**: acciones J/K/L/U comprensibles, jefes con ventanas de respuesta, sin partes vacías.
- **Rendimiento**: presupuestos de JavaScript y render preservados; VFX acotados y sin asignaciones ilimitadas.
- **Multijugador**: todas las mejoras jugables probadas en dos clientes y sin progreso local que bloquee al otro.
- **Narrativa**: introducción OHANA, recorrido por mundos, Caldera, Reina y final familiar coherentes.
- **Publicación**: nunca hacer merge si fallan Node, Browser E2E, Multiplayer E2E, Visual o Release Gate.
