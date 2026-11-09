# OHANA · Michi Biolumina · dirección de arte y contrato técnico

## Identidad
Michi conserva el ID interno `cat` para proteger guardados, poderes, selección de héroes,
progreso, cooperativo y estadísticas. La pantalla muestra **Michicornio**, criatura que
se descubre como una luz viva en un bosque sumergido en la oscuridad. No es un cambio
de especie arbitrario: la misma chispa del gato original evoluciona por simbiosis con
el jardín lunar, las mareas y la vida que encuentra.

## Cinco actos, cinco siluetas inequívocas
1. **Michi · Luciérnaga Lunar:** gato bebé, contornos blandos y enormes ojos;
   cápsula de luz orgánica, latido cálido, respiración, membrana semitransparente.
2. **Hada del Firmamento:** simbiosis felina y ala de hada; aleteo segmentado,
   estelas frías cian y violeta, nariz y gestualidad todavía reconocibles.
3. **Medusa de las Mareas:** campana viva y tentáculos articulados independientes;
   crece y se contrae, salpicaduras de neón biológico, deriva vertical.
4. **Estrella de Marea:** cinco brazos suaves con rotaciones diferentes; membrana
   turquesa, perlas, contracción radial y brillo coral.
5. **Capibara Astral:** cuerpo voluminoso y alargado, orejas pequeñas, hocico ancho,
   patas cortas; órganos luminosos distribuidos en el lomo, pisada tranquila y
   resplandor final. No reciclar el conejo lunar ni el arte de estrella F5.

## Dirección de iluminación
- Oscuridad con base fría `#030919`, pero **nunca negro total**: se preservan
  contornos, señalización de riesgos, plataformas y ojos de adversarios.
- La luz principal sigue la posición real de Michi y aumenta al evolucionar:
  radios 115 → 145 → 175 → 190 → 240.
- Flores y hongos reaccionan por proximidad real al protagonista. Enemigos
  emiten luz propia; los jefes tienen un halo mayor para mantener legibilidad.
- Gradientes sobre lienzo secundario de media resolución para limitar coste.
  El campo oscuro se compone después del escenario y enemigos, antes del actor
  y HUD: jamás atenúa los controles.
- Movimiento reducido elimina oscilación temporal y parpadeo.
- Nada de sombras de colisión falsas, hitboxes nuevas ni cambios de daño.

## Acciones y animación
El vocabulario de `idle/run/jump/fall/glide/wall/attack/cast/hurt/victory/dead`
permanece invariable. Los seis poderes J/K/L/I/P/U conservan botones y
reglas existentes mientras el nuevo dibujo representa seis gestos distintos.
`michiPerformance()` nunca muta el estado del juego.

## Panel de ayuda
Se reescribe la **presentación** como libro de campo: jerarquía editorial,
contraste real, capítulos navegables, ayudas por héroe, tarjetas de controles
grandes y CTA de salida accesible. Mantener roles, `aria-pressed`,
navegación por teclado y preferencias de accesibilidad.

## Riesgos y condiciones de aceptación
- [ ] Unit tests: todas las formas y estados finitos, determinismo y reducción de movimiento.
- [ ] Browser: tamaño por forma, siluetas, animación, modo móvil 390px y escritorio.
- [ ] La quinta forma debe leerse como capibara sin referencia textual.
- [ ] Validar brillo de enemigos sin flashes agresivos ni dejar pozos invisibles.
- [ ] Validar rendimiento en móvil de gama media (presupuesto 30/60 FPS).
- [ ] Validar recarga sin conexión y huellas del service worker.
- [ ] Validar guardados antiguos y transición de cuatro evoluciones.
- [ ] Integrar solo después de #456 para resolver conflictos de cat.js, CSS y SW.

Esta rama experimental apunta a `main` únicamente para aislar el trabajo
visual: **NO MERGE** mientras las pruebas y la integración #456 sigan abiertas.

## Arte en caché y radio de luz
El halo local de los personajes está limitado a 83px en el espacio vectorial para no recortar el arte en retratos de 240px. **No** reduce el radio real que ilumina el escenario (115–240px). La nueva prueba Playwright mide píxeles en ambos bordes del retrato: las cinco siluetas deben quedar dentro del Canvas. Los brazos de Estrella se redondean con curvas cuadráticas, no esquinas triangulares.
