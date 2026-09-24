<div align="center">

<a href="https://gracianb.github.io/project-ohana/">

<img src="https://capsule-render.vercel.app/api?type=waving&height=230&color=0:071226,45:102A43,75:7EE7FF,100:071226&text=PROJECT%20OHANA&fontColor=F4F3EE&fontSize=58&fontAlignY=37&desc=PLAY%20%C2%B7%20CANVAS%202D%20%C2%B7%2010%20PERSONAJES%20%C2%B7%20ISLA%20HOKU&descAlignY=61&descSize=16&animation=fadeIn" width="100%"/>

</a>

<br/>

[![Typing](https://readme-typing-svg.demolab.com?font=Fraunces&weight=500&size=26&duration=2800&pause=800&color=7EE7FF&center=true&vCenter=true&width=920&height=58&lines=PROJECT+OHANA;No+te+lo+explico.+P%C3%BAlsalo.;Kilo+%C2%B7+Stitcho+%C2%B7+Chisp%C3%ADn+%C2%B7+Michi+%C2%B7+Drag%C3%B3n;Dino+%C2%B7+Frita+%C2%B7+Pizza+%C2%B7+Yomi+%C2%B7+Cuerno;Beb%C3%A9+%E2%86%92+GOD;10+salas+%C2%B7+5+formas+%C2%B7+1+nido)](https://gracianb.github.io/project-ohana/)

# PROJECT OHANA

**Un platformer que se abre en el navegador.** Isla, combate cuerpo a cuerpo y cinco formas. Sin instalar nada.

[![Jugar ahora](https://img.shields.io/badge/JUGAR_AHORA-7EE7FF?style=for-the-badge&labelColor=071226)](https://gracianb.github.io/project-ohana/)
[![Systems Lab](https://img.shields.io/badge/02-SYSTEMS_LAB-7AF3FF?style=for-the-badge&labelColor=071226)](https://gracianb.github.io/systems-lab/)
[![Hub](https://img.shields.io/badge/00-GRACIANB-C4A574?style=for-the-badge&labelColor=071226)](https://gracianb.github.io/GracianB/)

<br/>

<img src="https://img.shields.io/badge/LIVE-PLAYABLE-7EE7FF?style=flat-square&labelColor=071226"/>
<img src="https://img.shields.io/badge/ENGINE-CANVAS_2D-7EE7FF?style=flat-square&labelColor=071226"/>
<img src="https://img.shields.io/badge/WORLD-ISLA_HOKU-C4A574?style=flat-square&labelColor=071226"/>
<img src="https://img.shields.io/badge/ROOMS-10-F4F3EE?style=flat-square&labelColor=071226"/>
<img src="https://img.shields.io/badge/CHARACTERS-10-7EE7FF?style=flat-square&labelColor=071226"/>
<img src="https://img.shields.io/badge/FORMS-5-F4F3EE?style=flat-square&labelColor=071226"/>
<img src="https://img.shields.io/badge/BOSS-REINA_DEL_NIDO-EA6A6A?style=flat-square&labelColor=071226"/>

</div>

---

<div align="center">

### [Jugar Project Ohana](https://gracianb.github.io/project-ohana/)

Nueva partida empieza en bebé, en el Claro. Continuar vuelve a tu forma y a tu sala. Si la Reina cae, la partida queda como Ohana completado.

</div>

---

## Qué es

Project Ohana es un platformer de Canvas 2D. Caminas por Isla Hoku, pegas, ganas experiencia y cambias de forma. Cada forma se dibuja distinta. El mapa son salas unidas por puertas, catapultas y vórtices.

No es una captura ni un mockup. Es el juego.

Parte del mundo PLAY de [GracianB](https://gracianb.github.io/GracianB/).

---

## El bucle

```text
Claro  →  explorar  →  pegar  →  XP  →  evolucionar  →  salas nuevas  →  Nido  →  Reina
```

Cinco formas, en este orden:

| Forma | Nombre en juego | XP para llegar |
| :---: | --- | ---: |
| 1 | Bebé | empiezas aquí |
| 2 | Base | 55 |
| 3 | Evo | 140 |
| 4 | Final | 260 |
| 5 | GOD | 420 |

Los números son absolutos: al llegar a 420 estás en GOD, no hace falta sumar los anteriores. Con la barra llena, **E** evoluciona. Hay una cinemática. Las chispas pasan por detrás de la cara.

---

## Elenco

Diez personajes jugables. Todos originales. La **H** es siempre un golpe cercano. El nombre del golpe no cambia al evolucionar. **J**, **K** y **L** sí: son los tres poderes de esa forma.

La dificultad es la de la portada. Fácil se lee pronto. Difícil pide más la sala.

| Personaje | Dificultad | Golpe (H) | Pasiva | Forma GOD |
| --- | :---: | --- | --- | --- |
| **Kilo** | Fácil | Nota | Caída lenta. En GOD, un vuelo corto | KILO GOD |
| **Pizza** | Fácil | Porción | Aplastar a un bicho al caer te hace rebotar | PIZZA GOD |
| **Michi** | Fácil | Zarpazo | Aguanta un golpe mortal por sala | MICHI GOD |
| **Cuerno** | Fácil | Puya | Al caer, el cuerno brilla y te da un saltito | CUERNO GOD |
| **Chispín** | Media | Chispa | Tras correr un segundo va más rápido y deja chispas | CHISPÍN GOD |
| **Stitcho** | Media | Zarpa | Se agarra a las paredes y trepa | STITCHO GOD |
| **Dragón** | Media | Garra | Mantén el salto para planear. En GOD, vuela | DRAGÓN GOD |
| **Dino** | Difícil | Mordisco | ↓ en el aire: picado con onda | DINO GOD |
| **Frita** | Difícil | Corte | ↓ corriendo: se desliza y arrolla | KÉTCHUP GOD |
| **Yomi** | Difícil | Fauces | Cae más rápido. En el aire, salto = un paso espectral | YOMI FAUCES |

Un golpe normal para un instante el mundo. Un golpe gordo (forma alta, Dino, o un poder de 40 o más) lo para más rato y el número sale en dorado.

El combo se queda en pantalla desde el primer golpe. Se rompe si te dan, o si pasas unos ocho segundos sin pegar.

---

## Isla Hoku

Diez salas. Visitar las ocho de la ruta (Claro, Costa, Jungla, Caldera, Cueva, Lab, Cumbre, Órbita) despierta el Nido.

```text
                 CUMBRE ── ÓRBITA
                    │         │
   LAB ── CUEVA ── CLARO ── COSTA ── JUNGLA
                    │         │         │
                    │      ARRECIFE   CALDERA ── NIDO
```

| Sala | Qué pasa |
| --- | --- |
| **Claro Ohana** | Centro. Este a la costa, oeste a la cueva, arriba a la cumbre. |
| **Costa Hoku** | El hueco del centro baja al Arrecife. Este, la jungla, pide forma 3. |
| **Jungla Alta** | Pide forma 3. El hueco, o el vórtice, baja a la Caldera. |
| **Caldera** | Pide forma 4. Este es el Nido. |
| **Nido Final** | La Reina. No sales hasta terminar. La puerta espera medio segundo antes de soltarte en cualquier sala. |
| **Cueva Azul** | Oeste, el Lab, pide forma 2. |
| **Alien Lab** | Solo se vuelve por el este. |
| **Cumbre** | El hueco devuelve al Claro. Este, la Órbita. |
| **Órbita** | Pide forma 2. Un vórtice secreto baja al Arrecife. |
| **Arrecife Abismo** | Agua. Arriba vuelve a la Costa. |

Catapulta: te lanza a otra sala. Vórtice: también, y a veces no está en la puerta.

---

## Controles

La izquierda mueve. La derecha pega.

| Tecla | Acción |
| :---: | --- |
| `W` `A` `S` `D` o flechas | Mover. `W` o espacio, saltar |
| `S` o `↓` | Caer de una plataforma. En el aire, la pasiva de algunos |
| `Shift` | Dash |
| `H` | Golpe normal. También vale `F` |
| `J` `K` `L` | Poder corto, medio y definitivo. Cambian con el personaje y con la forma |
| `E` | Evolucionar, si la barra está llena. También usa catapulta o vórtice |
| `R` | Volver al Claro |
| `M` | Mapa |
| `º` | Ayuda. También `` ` `` |
| `N` | Silencio |
| `Esc` | Pausa |

En el teléfono hay botones en pantalla. El juego está pensado primero para teclado.

---

## Partida guardada

Al cruzar una sala se guarda la versión 2: personaje, forma, XP, vida, sala, salas visitadas, puntuación, bajas, si el nido ya cayó, la vida extra de Michi y la magia de esa forma.

Continuar no mezcla personajes. Una partida de Kilo no abre a Dino.

Ids viejos de pruebas (`lilo`, `stitch`, `pikachu`) se leen como Kilo, Stitcho y Chispín.

---

## Cómo está hecho

| Capa | Qué es |
| --- | --- |
| Dibujo | Canvas 2D, a la resolución de la pantalla |
| Reglas | JavaScript, módulos, sin framework |
| Interfaz | HTML y CSS |
| Mando | Teclado y botones táctiles |
| Publicación | GitHub Pages |

Personajes en vector, animados. Cucaracho, mosquito y cangrejo tienen cara, paso, aviso y embestida. El resto de bichos tiene su propio dibujo. El jefe es la Reina del Nido.

Para jugar en local hace falta un servidor. Doble clic en `index.html` no vale: los módulos no cargan por `file://`.

```powershell
cd project-ohana
python -m http.server 8080
```

Abre [http://localhost:8080](http://localhost:8080).

```powershell
node --test tests/core.test.js
```

---

## Trabajo original

Nombres, dibujos, salas y poderes son de Ohana. No hay marcas de terceros ni afiliación con ninguna.

Isla, criatura, dragón, evolución y jefe son el lenguaje del género. El universo concreto es este.

**MIT © 2026 Gracián Baena**

---

<div align="center">

### [Jugar Project Ohana](https://gracianb.github.io/project-ohana/)

Bebé, base, evo, final, GOD.

10 salas · 10 personajes · 1 Reina

<br/>

[Hub](https://gracianb.github.io/GracianB/) · [Systems Lab](https://gracianb.github.io/systems-lab/) · [Experience](https://gracianb.github.io/professional-deck/) · [Yoga](https://gracianb.github.io/yoga-instructor/)

<sub>PLAY · Murcia · 2026</sub>

<br/>

<a href="https://gracianb.github.io/systems-lab/">

<img src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=0:7EE7FF,50:102A43,100:071226" width="100%"/>

</a>

</div>
