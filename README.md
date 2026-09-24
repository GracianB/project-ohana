<div align="center">

<a href="https://gracianb.github.io/project-ohana/">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=240&color=0:071226,40:102A43,78:7EE7FF,100:071226&text=PROJECT%20OHANA&fontColor=F4F3EE&fontSize=56&fontAlignY=34&desc=ISLA%20HOKU%20%C2%B7%20CANVAS%202D%20%C2%B7%20BEB%C3%89%20%E2%86%92%20GOD&descAlignY=58&descSize=16&animation=twinkling" width="100%" alt="Project Ohana, isla Hoku, de bebé a GOD"/>
</a>

<a href="https://gracianb.github.io/project-ohana/">
  <img src="https://readme-typing-svg.demolab.com?font=Fraunces&weight=600&size=24&duration=2600&pause=700&color=7EE7FF&center=true&vCenter=true&width=760&height=52&lines=No+te+lo+explico.+P%C3%BAlsalo.;Kilo+%C2%B7+Stitcho+%C2%B7+Chisp%C3%ADn+%C2%B7+Michi+%C2%B7+Drag%C3%B3n;Dino+%C2%B7+Frita+%C2%B7+Pizza+%C2%B7+Yomi+%C2%B7+Cuerno;10+salas+%C2%B7+5+formas+%C2%B7+1+Reina" alt="Elenco y tamaño del juego"/>
</a>

<br/>

<a href="https://gracianb.github.io/project-ohana/"><img src="https://img.shields.io/badge/JUGAR_AHORA-7EE7FF?style=for-the-badge&labelColor=071226" alt="Jugar ahora"/></a>
<a href="https://gracianb.github.io/systems-lab/"><img src="https://img.shields.io/badge/02-SYSTEMS_LAB-7AF3FF?style=for-the-badge&labelColor=071226" alt="Systems Lab"/></a>
<a href="https://gracianb.github.io/GracianB/"><img src="https://img.shields.io/badge/00-GRACIANB-C4A574?style=for-the-badge&labelColor=071226" alt="Hub GracianB"/></a>

<br/><br/>

<img src="https://img.shields.io/badge/LIVE-PLAYABLE-7EE7FF?style=flat-square&labelColor=071226" alt="Jugable"/>
<img src="https://img.shields.io/github/stars/GracianB/project-ohana?style=flat-square&label=STARS&color=7EE7FF&labelColor=071226" alt="Estrellas"/>
<img src="https://img.shields.io/github/last-commit/GracianB/project-ohana?style=flat-square&label=LAST&color=F4F3EE&labelColor=071226" alt="Último commit"/>
<img src="https://img.shields.io/github/license/GracianB/project-ohana?style=flat-square&color=C4A574&labelColor=071226" alt="Licencia"/>
<img src="https://img.shields.io/badge/ROOMS-10-F4F3EE?style=flat-square&labelColor=071226" alt="10 salas"/>
<img src="https://img.shields.io/badge/CAST-10-7EE7FF?style=flat-square&labelColor=071226" alt="10 personajes"/>
<img src="https://img.shields.io/badge/FORMS-5-F4F3EE?style=flat-square&labelColor=071226" alt="5 formas"/>
<img src="https://img.shields.io/badge/BOSS-REINA-EA6A6A?style=flat-square&labelColor=071226" alt="Un jefe"/>

</div>

---

<div align="center">

### [Abrir el juego](https://gracianb.github.io/project-ohana/)

Nueva partida: bebé, en el Claro. Continuar: tu forma y tu sala. Si la Reina cae, la partida queda como Ohana completado.

<img src="https://skillicons.dev/icons?i=js,html,css&theme=dark" alt="JavaScript, HTML y CSS" height="40"/>

</div>

---

## El bucle

```mermaid
%%{init: {'theme':'dark'}}%%
flowchart LR
  A[Claro] --> B[Explorar]
  B --> C[Pegar]
  C --> D[XP]
  D --> E[Evolucionar]
  E --> B
  E --> F[Nido]
  F --> G[Reina]
```

Cinco formas. El XP es absoluto: al llegar al número, esa es la forma. No se suman entre sí.

```mermaid
%%{init: {'theme':'dark'}}%%
stateDiagram-v2
  direction LR
  [*] --> Bebe
  Bebe --> Base: 55
  Base --> Evo: 140
  Evo --> Final: 260
  Final --> GOD: 420
```

Con la barra llena, <kbd>E</kbd> evoluciona. Hay cinemática. Las chispas pasan por detrás de la cara.

Un golpe normal para el mundo un instante. Un golpe gordo —forma alta, Dino, o un poder de 40 o más— lo para más rato y el número sale en dorado. El combo se queda desde el primer golpe. Se rompe si te dan, o si pasas unos ocho segundos sin pegar. La puerta espera medio segundo y entonces te suelta.

---

## Elenco

Diez personajes originales. La <kbd>H</kbd> es siempre un golpe cercano y no cambia de nombre al evolucionar. <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> son los tres poderes, y esos sí cambian con la forma.

<table>
<tr>
<td align="center"><img src="https://img.shields.io/badge/Kilo-F%C3%A1cil-e23b3d?style=for-the-badge&labelColor=071226" alt="Kilo, fácil"/></td>
<td align="center"><img src="https://img.shields.io/badge/Pizza-F%C3%A1cil-ffb43a?style=for-the-badge&labelColor=071226" alt="Pizza, fácil"/></td>
<td align="center"><img src="https://img.shields.io/badge/Michi-F%C3%A1cil-ffb6e4?style=for-the-badge&labelColor=071226" alt="Michi, fácil"/></td>
<td align="center"><img src="https://img.shields.io/badge/Cuerno-F%C3%A1cil-f2c1ff?style=for-the-badge&labelColor=071226" alt="Cuerno, fácil"/></td>
<td align="center"><img src="https://img.shields.io/badge/Chisp%C3%ADn-MEDIA-ffd83a?style=for-the-badge&labelColor=071226" alt="Chispín, media"/></td>
</tr>
<tr>
<td align="center"><img src="https://img.shields.io/badge/Stitcho-MEDIA-2f6bff?style=for-the-badge&labelColor=071226" alt="Stitcho, media"/></td>
<td align="center"><img src="https://img.shields.io/badge/Drag%C3%B3n-MEDIA-e8452f?style=for-the-badge&labelColor=071226" alt="Dragón, media"/></td>
<td align="center"><img src="https://img.shields.io/badge/Dino-DIF%C3%8DCIL-4cbf56?style=for-the-badge&labelColor=071226" alt="Dino, difícil"/></td>
<td align="center"><img src="https://img.shields.io/badge/Frita-DIF%C3%8DCIL-f0b43a?style=for-the-badge&labelColor=071226" alt="Frita, difícil"/></td>
<td align="center"><img src="https://img.shields.io/badge/Yomi-DIF%C3%8DCIL-e8c090?style=for-the-badge&labelColor=071226" alt="Yomi, difícil"/></td>
</tr>
</table>

| Personaje | Golpe con H | Pasiva | GOD |
| --- | --- | --- | --- |
| **Kilo** | Nota | Caída lenta. En GOD, un vuelo corto | KILO GOD |
| **Pizza** | Porción | Caer sobre un bicho lo aplasta y te rebota | PIZZA GOD |
| **Michi** | Zarpazo | Aguanta un golpe mortal por sala | MICHI GOD |
| **Cuerno** | Puya | Al caer, el cuerno brilla y te da un saltito | CUERNO GOD |
| **Chispín** | Chispa | Tras correr un segundo va más rápido y deja chispas | CHISPÍN GOD |
| **Stitcho** | Zarpa | Se agarra a las paredes y trepa | STITCHO GOD |
| **Dragón** | Garra | Mantén el salto para planear. En GOD, vuela | DRAGÓN GOD |
| **Dino** | Mordisco | Abajo en el aire: picado con onda | DINO GOD |
| **Frita** | Corte | Abajo mientras corres: se desliza y arrolla | KÉTCHUP GOD |
| **Yomi** | Fauces | Cae más rápido. En el aire, salto es un paso espectral | YOMI FAUCES |

La dificultad es la de la portada. Fácil se lee pronto. Difícil pide más la sala.

---

## Isla Hoku

Diez salas. Visitar Claro, Costa, Jungla, Caldera, Cueva, Lab, Cumbre y Órbita despierta el Nido. El Arrecife es el desvío del agua.

```mermaid
%%{init: {'theme':'dark'}}%%
flowchart TB
  ridge[Cumbre] --- space[Órbita]
  lab[Alien Lab] --- cave[Cueva Azul] --- hub[Claro Ohana] --- beach[Costa Hoku] --- jungle[Jungla Alta]
  ridge --- hub
  beach --- reef[Arrecife Abismo]
  space -.->|vórtice| reef
  jungle --- volcano[Caldera] --- boss[Nido · Reina]
```

| Sala | Para entrar | Qué hace |
| --- | --- | --- |
| **Claro Ohana** | — | Centro. Este costa, oeste cueva, arriba cumbre. |
| **Costa Hoku** | — | El hueco baja al Arrecife. Este, la jungla, pide forma 3. |
| **Jungla Alta** | Forma 3 | El hueco o el vórtice bajan a la Caldera. |
| **Caldera** | Forma 4 | Este es el Nido. |
| **Nido Final** | Forma 4 | La Reina. No se sale a medias. |
| **Cueva Azul** | — | Oeste, el Lab, pide forma 2. |
| **Alien Lab** | Forma 2 | Solo se vuelve por el este. |
| **Cumbre** | — | El hueco devuelve al Claro. Este, la Órbita. |
| **Órbita** | Forma 2 | Un vórtice secreto baja al Arrecife. |
| **Arrecife Abismo** | — | Agua. Arriba vuelve a la Costa. |

La catapulta y el vórtice también cambian de sala. Se usan con <kbd>E</kbd>.

---

## Las dos manos

<table>
<tr>
<td width="50%" valign="top">

### Izquierda · mover

| Tecla | Acción |
| --- | --- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Caminar. También las flechas |
| <kbd>W</kbd> o espacio | Saltar |
| <kbd>S</kbd> o <kbd>↓</kbd> | Soltar una plataforma. En el aire, la pasiva de algunos |
| <kbd>Shift</kbd> | Dash |

</td>
<td width="50%" valign="top">

### Derecha · pegar

| Tecla | Acción |
| --- | --- |
| <kbd>H</kbd> | Golpe normal. También vale <kbd>F</kbd> |
| <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> | Poder corto, medio y definitivo |
| <kbd>E</kbd> | Evolucionar, catapulta o vórtice |
| <kbd>R</kbd> | Volver al Claro |
| <kbd>M</kbd> | Mapa |
| <kbd>º</kbd> | Ayuda |
| <kbd>N</kbd> | Silencio |
| <kbd>Esc</kbd> | Pausa |

</td>
</tr>
</table>

En el teléfono hay botones en pantalla. El juego está pensado primero para teclado.

---

## Qué recuerda la partida

Al cruzar una puerta se guarda la versión 2.

```mermaid
%%{init: {'theme':'dark'}}%%
flowchart LR
  subgraph partida [Save v2]
    id[Personaje]
    evo[Forma y XP]
    hp[Vida]
    room[Sala y mapa visitado]
    score[Puntos y bajas]
    won[Nido caído]
  end
  id --- evo --- hp --- room --- score --- won
```

Continuar no mezcla personajes. Una partida de Kilo no abre a Dino. Los ids viejos de prueba `lilo`, `stitch` y `pikachu` se leen como Kilo, Stitcho y Chispín.

---

## Hecho en el navegador

<table>
<tr>
<td width="58%" valign="top">

Canvas 2D a la resolución de la pantalla. JavaScript en módulos, sin framework. HTML y CSS para el marco. Teclado y botones táctiles. Publicado en GitHub Pages.

Los personajes son vector y se animan. Cucaracho, mosquito y cangrejo tienen cara, paso, aviso y embestida. El jefe es la Reina del Nido.

Doble clic en `index.html` no arranca: los módulos no cargan por `file://`.

</td>
<td width="42%" valign="top">

<a href="https://github.com/GracianB/project-ohana">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=GracianB&repo=project-ohana&theme=tokyonight&hide_border=true&bg_color=071226&border_color=102A43&title_color=7EE7FF&icon_color=C4A574&text_color=F4F3EE" alt="Tarjeta del repositorio project-ohana"/>
</a>

</td>
</tr>
</table>

<details>
<summary><b>Jugar en local y pasar los tests</b></summary>

<br/>

```powershell
cd project-ohana
python -m http.server 8080
```

Abre [http://localhost:8080](http://localhost:8080).

```powershell
node --test tests/core.test.js
```

</details>

---

## Original

Nombres, dibujos, salas y poderes son de Ohana. No hay marcas de terceros ni afiliación con ninguna. Isla, criatura, dragón, evolución y jefe son el lenguaje del género. El universo concreto es este.

**MIT © 2026 Gracián Baena**

---

<div align="center">

<a href="https://gracianb.github.io/project-ohana/">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=110&section=footer&color=0:7EE7FF,45:102A43,100:071226&reversal=true&text=BEB%C3%89%20%E2%86%92%20GOD&fontColor=F4F3EE&fontSize=28&fontAlignY=62&animation=fadeIn" width="100%" alt="De bebé a GOD"/>
</a>

<br/>

[Hub](https://gracianb.github.io/GracianB/) · [Systems Lab](https://gracianb.github.io/systems-lab/) · [Experience](https://gracianb.github.io/professional-deck/) · [Yoga](https://gracianb.github.io/yoga-instructor/)

<sub>PLAY · Murcia · 2026</sub>

</div>
