# OHANA · Mundos individuales (desarrollo por entregas)

**Estado:** contrato de arquitectura. El catálogo no desbloquea todavía escenarios jugables.

## Separación de sistemas
- **Isla Hoku:** campaña existente de diez salas, compartida.
- **Islas familiares:** cinco ilustraciones y escenas de parejas en `systems/family-islands.js`.
- **Mundos individuales:** diez identidades únicas en `worlds/hero-worlds.js`. No son alias de las salas antiguas.
- **Kilo:** `feat/kilo-a-compas` (PR #387) contiene su primera fase jugable. No declarar `playable` hasta integrarla, entrar desde el selector y verificar guardado, reinicio y navegador.
  
## Contrato de publicación para cada mundo
1. Entrada real desde selección de personaje, con retorno al menú y sin romper partidas de Hoku.
2. Bioma y arte propios, escenario navegable, cámara y límites físicos.
3. Tres desafíos y un encuentro jefe con estados y recompensas persistentes.
4. Guardado aislado por héroe/mundo y compatibilidad con partidas anteriores.
5. Controles teclado/móvil, accesibilidad, rendimiento y pruebas E2E.
6. Solo entonces cambiar `phase` de `planned`/`development` a `playable`.

## Orden
1. Finalizar Kilo V452 y validar conexión desde selección.
2. Stitcho como mundo independiente (sin copiar el de Kilo).
3. Los ocho mundos restantes por parejas temáticas, con revisiones jugables individuales.

**No dibujar diez botones que prometan diez juegos que todavía no existen.**
