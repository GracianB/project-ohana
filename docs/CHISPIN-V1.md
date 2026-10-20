# CHISPÍN V1 — Especificación de Cierre (Fase 3)

## 1. Identidad y Filosofía
- **Arte 100% Canvas Vectorial:** Renderizado exclusivamente en [`characters/art/pikachu.js`](../characters/art/pikachu.js) y [`characters/art/chispin.js`](../characters/art/chispin.js), sin mapas de bits ni texturas externas.
- **Cinco Formas Canónicas:**
  1. *Chispín Bebé:* Silueta compacta, orejas redondeadas, cola pequeña.
  2. *Chispín:* Ágil, mejillas brillantes palpitantes, cola en zigzag.
  3. *Voltín:* Cresta puntiaguda, zancada alargada, mayor velocidad.
  4. *Trueno Gordo:* Silueta esférica y rechoncha clásica, masa pesada, rebotes de alto impacto y nubes eléctricas orbitales.
  5. *Chispín Tormenta:* Plasma violeta y dorado continuo, aura voltaica y cuádruple salto.

## 2. Movimiento y Combate
- <kbd>A</kbd> / <kbd>D</kbd>: Carrera progresiva con estela de chispas a partir de 1 segundo.
- <kbd>W</kbd> / <kbd>Espacio</kbd>: Salto elástico con resorte de cola.
- <kbd>H</kbd>: Ataque básico de descarga y latigazo voltaico.
- <kbd>J</kbd> (`chain`): Cadena eléctrica que marca hasta 3 enemigos y cortocircuita compuertas de arco temporalmente.
- <kbd>K</kbd> (`blink`): Paso relámpago con teletransporte direccional (145-240 px), *i-frames* y estela lesiva.
- <kbd>L</kbd> (`storm`): Descarga de tormenta con rayos verticales sobre enemigos con marcas de J.
- <kbd>I</kbd> (Remate): *Carrera Relámpago*, barrido a hipervelocidad conectando todas las marcas con corte en zigzag y detonación estática.
- <kbd>P</kbd> (Ultimate): *Tormenta Enlazada*, vórtice electromagnético de atracción y columnas de rayos continuos desde el cielo.

## 3. Sala: Las Islas del Relámpago (`systems/chispin-room.js`, `worlds/chispin-sanctuary.js`)
- **Escala:** 4000 × 2400 px, 4 sectores de alta tensión:
  - *Sector 0:* Playa Electrostática (arena de cuarzo y terrazas de inducción).
  - *Sector 1:* Pilares de Alto Voltaje (raíles móviles de alta tensión).
  - *Sector 2:* Cañón de las Nubes (plataformas altas y nubes de tormenta).
  - *Sector 3:* Santuario de la Tormenta (torre dinamo y arena del jefe).
- **Mecánicas:**
  - 4 raíles móviles electromagnéticos.
  - 3 condensadores elásticos de rebote vertical.
  - 3 compuertas de arco voltaico (desactivables con J o cruzables con K).
  - 8 bobinas voltaicas de historia y 14 orbes de energía.
  - Fondo procedural de tormenta crepuscular, relámpagos distantes deterministas, torres Tesla y cumulonimbos volumétricos.

## 4. Colección y Reliquia Legendaria (`systems/chispin-trail.js`, `systems/hero-collections.js`)
- 100 coleccionables temáticos distribuidos por la sala (baterías voltaicas, condensadores, bobinas y fragmentos de rayo).
- **Altar de la Tormenta (`x: 3820, y: 1134`):** Entrega la reliquia legendaria **Relámpago Dorado** con cinemática de sobrecarga luminosa, fanfarria y efecto estático permanente para Chispín.

## 5. Minijefe: Titán de Trueno (`systems/chispin-boss.js`)
- Autómata colosal de cobre y latón (480 PV, 3 fases):
  - *Fase 1:* Ondas de choque de arco terrestre por el suelo.
  - *Fase 2:* Despliegue de esferas de plasma y bobinas defensivas.
  - *Fase 3:* Sobrecarga voltaica con bombardeo cenital y embestida de alto voltaje.

## 6. Selección de Personajes (`systems/family-islands.js`)
- Puesto avanzado en el *Santuario del Trueno* con bobinas de chispa y pararrayos.
- Coreografía en `pairedScene` de 4 actos mostrando la transición cómica y poderosa de *Trueno Gordo*.
