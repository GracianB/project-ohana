# Stitcho V1 — repertorio cerrado

Versión de juego: **ohana-454**. Referencia de personaje: **stitcho-v1.0.0**.
Esta entrega cierra el diseño de Stitcho y su sala personal; no declara terminada la V1 de toda la campaña. Cambios futuros de contenido se centrarán en los otros personajes (Fase 3: Chispín). Se conservan correcciones necesarias de errores y compatibilidad.

## Estrategia y combate

| Control | Función | Decisión |
| --- | --- | --- |
| **H / F** | Golpe cercano: Zarpazo alienígena | Doble corte de garras de plasma, abre combate cuerpo a cuerpo y genera carga rápida |
| **J** | Distancia: Plasma Bolt | Proyectil errático con rebote que electrifica, daña y cortocircuita arcos eléctricos del escenario |
| **K**, desde forma 2 | Defensa y movilidad: Plasma Roll | Rueda en bola esférica de plasma con armadura (`armor 12`), atraviesa enemigos y rebota contra paredes/suelos ganando impulso vertical |
| **L**, desde forma 3 | Daño de área: Caos Cuántico | Sobrecarga radial de arcos eléctricos y ondas de choque cósmicas en 360°, desatando su aura caótica |
| **I**, desde forma 4 | Remate de combo: Rebote 626 | Embestida relámpago con salto acrobático y cambio de frente que rebota en cadena hacia el siguiente objetivo visible |
| **P**, forma 5 | Ataque de área: Flota 626 | Requiere 100 de barra de remate ganados haciendo daño; despliega retícula holográfica alienígena y solicita bombardeo de rayos orbitales de plasma |
| **U**, desde bebé | Ayuda ofensiva: Dúo Cósmico | Asistencia sincronizada (Dúo de tormenta bajo la nube de Chispín o compañero sorpresa invulnerable) con recarga independiente |

El golpe H y el disparo J tienen registro estricto sin acumulación artificial. Usar J sobre los arcos eléctricos de la sala los desactiva temporalmente durante 145 ticks (2,4 s). Recibir daño severo o cambiar de sala reinicia la inercia del roll.

## Movimiento

- **Trepamuros (Pasiva Climb):** Al entrar en contacto con paredes o muros verticales, Stitcho clava sus garras de tres puntas permitiendo deslizarse o impulsarse en salto de pared (*wall-jump* acrobático).
- **Galope a cuatro patas:** En formas 2 a 5 (*Stitcho Bravo*, *Experimento Ñam*, *Stitcho Nébula*), la carrera adopta postura cuadrúpeda con patas traseras independientes y aleteo de orejas hacia atrás.
- **Saltos acrobáticos según forma:**
  - 2 saltos en *Mini Stitcho* (Bebé) y *Stitcho*.
  - 3 saltos en *Stitcho Bravo* y *Experimento Ñam*.
  - 4 saltos en *Stitcho Nébula* con aura de choque cuántico.
- **Roll en bola:** Al activar K o mantener abajo en rampas, Stitcho se contrae en una bola de energía con franjas giratorias y estela de chispas, permitiendo hasta 3 rebotes consecutivos en paredes.

## Presentación y sala

- **Cinco formas anatómicas:**
  - Forma 1 (*Mini Stitcho*): cuerpo compacto de judía, antenas-muelle elásticas, ojos grandes y curiosos.
  - Forma 2 (*Stitcho*): orejas-aleta triangulares, colmillos pícaros y rayas moradas dorsales.
  - Forma 3 (*Stitcho Bravo*): postura salvaje con espinas en cabeza y espalda, zarpas sobredimensionadas.
  - Forma 4 (*Experimento Ñam*): cuatro brazos funcionales, hombreras cibernéticas y antenas reforzadas.
  - Forma 5 (*Stitcho Nébula*): piel con textura de galaxia profunda y estrellas titilantes, cuatro brazos cósmicos con garras láser y halo de distorsión cuántica.
- **Archipiélago del Caos (Sala de 4.200 px de ancho):**
  - Cuatro sectores: *Playa de chatarra*, *Puentes de resonancia*, *Circuitos cruzados* y *Templo del Núcleo*.
  - Red de plataformas en varias cotas de altura para explotar saltos altos y trepa.
  - Fondo procedimental con nave nodriza estrellada, 3 lunas con anillos planetarios, auroras índigo/cian y espiras de energía.
  - 4 raíles móviles con plataformas que transportan al jugador sin desajuste de físicas.
  - 3 trampolines elásticos de salto gravitatorio (`force 15–17`).
  - 3 arcos eléctricos de advertencia y descarga, desactivables con **J**.
  - 8 fragmentos de energía y 3 balizas interactivas (`CHISPA`, `ECO`, `ESTRELLA`).
  - Altar del **Corazón Galáctico**: pedestal alienígena con reliquia flotante que se activa tras superar los desafíos de la sala.

## Minijefe: Núcleo Glitch (Error 626)

- Mini boss propio de 480 PV, 3 fases de dificultad creciente y 4 patrones telegrafiados:
  - Fase 1 (100%–60% PV): barrido de ondas de plasma y embestida glitch anunciada con estela.
  - Fase 2 (60%–26% PV): ráfagas de plasma cruzadas y aceleración de carga.
  - Fase 3 (<26% PV): sobrecarga crítica con lluvia parabólica de meteoritos de plasma.
- Interrupción por aturdimiento (`stun >= 24`) que abre ventanas seguras de contraataque.
- Persistencia de derrota guardada en `clearedEncounters.hub`.

## Colección y Reliquia de los 100 objetos

- Colección personal: *«Las cien chispas del caos»*.
- Al reunir los 100 recuerdos en el Archipiélago, se otorga la bonificación **CORAZÓN GALÁCTICO** con resistencia aumentada contra descargas eléctricas y cinemática de celebración.

## Cierre de Fase 2

Con esta entrega, **Kilo** (Fase 1) y **Stitcho** (Fase 2) quedan totalmente cerrados, jugables, verificados y con sus identidades visuales y mecánicas al 100%. La siguiente fase se enfoca en **Chispín** (Fase 3: *Islas del Relámpago* y el *Ojo de la Tormenta*).
