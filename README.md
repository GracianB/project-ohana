# PROJECT OHANA

Aventura 2D en canvas. Elige a Lilo, Stitch, Pikachu, el Dragón o Kawaii Cat, explora un mapa tipo metroidvania, encadena combos y evoluciona tres formas.

**Jugar online (cuando Pages esté activo):**  
https://gracianb.github.io/project-ohana/

**Repo:** https://github.com/GracianB/project-ohana

Oleada 2: HUD de cristal, mapa grande, pausa, continuar partida, hitstop, crits, fase 2 del jefe, biomes con más atmósfera. Lista en `IMPROVEMENTS.md`.

---

## Jugar sin localhost

El juego es HTML + JS + CSS. No hay backend.

### Opción A — GitHub Pages
1. Repo → **Settings** → **Pages**
2. Source: **GitHub Actions** o **Deploy from a branch** → `main` / `/ (root)`
3. Abre `https://gracianb.github.io/project-ohana/`

Workflow: `.github/workflows/pages.yml`

### Opción B — Netlify Drop
Arrastra la carpeta a [app.netlify.com/drop](https://app.netlify.com/drop).

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
| Espacio | Saltar (soltar = salto corto) |
| Shift / clic derecho | Dash |
| F / clic | Golpe |
| J K L | Habilidades |
| E | Evolucionar |
| S | Bajar de plataforma fina |
| R | Volver al claro |
| M | Mapa grande |
| N | Mute |
| Esc | Pausa |
| H | Ayuda |
| 1–5 | Elegir personaje en el menú |

```
        Cumbre ── Órbita
           │         │
Lab ─ Cueva ─ Claro ─ Costa ─ Jungla
                               │
                         Caldera ─ JEFE
```

Jungla, Lab y Órbita piden forma 2. Caldera y Jefe piden forma 3.

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

## Licencia

Código: MIT.  
Lilo, Stitch y Pikachu son marcas de Disney / Nintendo / The Pokémon Company. Fan game no comercial.
