# PROJECT OHANA

Aventura 2D en canvas. Elige a Lilo, Stitch, Pikachu, el Dragón o Kawaii Cat, explora un mapa tipo metroidvania y evoluciona tres formas.

**Jugar online (cuando Pages esté activo):**  
https://gracianb.github.io/project-ohana/

**Repo:** https://github.com/GracianB/project-ohana

---

## Jugar sin localhost

El juego es HTML + JS + CSS. No hay backend. Cualquiera puede abrirlo si GitHub Pages (o Netlify / Cloudflare Pages) sirve la carpeta raíz.

### Opción A — GitHub Pages (la buena)

1. Repo → **Settings** → **Pages**
2. Source: **GitHub Actions**  
   o **Deploy from a branch** → `main` / `/ (root)`
3. Espera 1 minuto y abre:
   `https://gracianb.github.io/project-ohana/`

Hay un workflow en `.github/workflows/pages.yml` que publica `main` solo.

### Opción B — Netlify Drop

Arrastra la carpeta del repo a [app.netlify.com/drop](https://app.netlify.com/drop). Te da una URL `*.netlify.app`.

### Opción C — local

```bash
python -m http.server 8080
```

Abre `http://localhost:8080/`  
No abras `index.html` con doble clic: los módulos ES fallan en `file://`.

---

## Controles

| Tecla | Acción |
|---|---|
| WASD / flechas | Mover y saltar |
| Espacio | Saltar |
| Shift | Dash |
| F | Golpe cuerpo a cuerpo |
| J K L | Habilidades |
| E | Evolucionar (3 formas) |
| S | Bajar de plataforma fina |
| R | Volver al claro |
| M | Lista de salas |
| N | Mute |
| Esc | Pausa |

Puertas etiquetadas **ESTE / OESTE / ARRIBA / ABAJO**.  
Jungla, Lab y Órbita piden forma 2. Caldera y Jefe piden forma 3.

```
        Cumbre ── Órbita
           │         │
Lab ─ Cueva ─ Claro ─ Costa ─ Jungla
                               │
                         Caldera ─ JEFE
```

---

## Personajes

| | Lv1 | Lv2 | Lv3 |
|---|---|---|---|
| Lilo | Lilo | Guardiana Ohana | Alma de Kauai |
| Stitch | Stitch | Berserk 626 | Experiment MAX |
| Pikachu | Pikachu | Raichu | Tormenta |
| Dragón | Cría | Dragón de Fuego | Volcánico |
| Gato | Gatito | Neko Shadow | Nueve Vidas |

XP 40 → forma 2. XP 100 → forma 3. O pulsa E.

---

## Estructura

```
index.html          entrada
game.js             bucle, salas, combate
style.css           HUD y menú
characters/         roster + sprites canvas
engine/             audio, enemigos, partículas
systems/            mapa, habilidades, notify
worlds/             fondos por bioma
```

Motor vivo: `game.js` + `systems/map.js` + `characters/draw.js`.  
Hay archivos viejos (`engine/player.js`, etc.) de prototipos anteriores; no los importa el juego actual.

---

## Licencia

Código: MIT.  
Lilo, Stitch y Pikachu son marcas de Disney / Nintendo / The Pokémon Company. Esto es un fan game no comercial.
