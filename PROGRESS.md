## OHANA V323 · Cierre de Mundo 1 · Autoridad U completa y pulido vectorial máximo (ohana-340)

Plan detallado en [V323-PLAN.md](V323-PLAN.md). 10 fases para resolver #318 de forma definitiva, extender protección visual U a los 10 héroes, cerrar cobertura multiplayer ambos sentidos, robustecer fingerprint de poses, alinear actuación residual, pulir Boss Director, confirmar presupuestos, a11y/mobile, integridad de save/festival/afinidad y Release Gate final.

Contrato: vector, sin cambios de física/hitbox/daño base, sin Mundo 2. Cache objetivo `ohana-340`.

---

## OHANA V322 · Postintegración de seis héroes y Leyenda (ohana-339)

- Integradas #317, #314, #321, #320, #322, #323 y #324: seis personajes vectoriales y host/invitado para los diez. No afirmar Netlify publicado hasta tener cuota y validar dos dispositivos.
- Rangos de afinidad: el tercer rango da una acción escénica distinta a las seis parejas canónicas dentro del mundo, sin alterar los golpes L en ticks 42/66/90, las otras 84 parejas ni sus EXP.
- Rendimiento/a11y: caché Canvas incluye giro, frenada, anticipación y movimiento reducido. Invalida la antigua caché de 338 para servir las poses mejoradas.
- Regresión obligatoria en PR: Node, Browser, 1.350 escenas U, Chromium/Firefox host/invitado, Visual, release:check; en main GitHub CI + Pages posterior.
- Pendiente coordinado #318: el impacto legacy de lanzamiento de U sigue siendo inmediato y amplio para algunos héroes; no se ha convertido a daño local telegrafiado ni se presenta como resuelto.
