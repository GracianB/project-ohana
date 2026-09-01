# PROJECT OHANA · DEMO Mundo 1

Fan game 2D en canvas. Isla Kauai, cinco formas, un jefe.

**Jugar la demo:** https://gracianb.github.io/project-ohana/

Nueva partida = bebé. Continuar = tu forma y sala. Al tumbar el nido: *Ohana completado*.

## Mundo 1

```
        Cumbre ── Órbita
           |
Lab ─ Cueva ─ Claro ─ Costa ─ Jungla
                               |
                            Caldera ─ Nido
```

- Costa: hueco central = pozo mortal.
- Jungla: hueco central = baja a la Caldera (forma 4).
- Cumbre / Órbita: hueco = vuelve al Claro.
- 8 salas visitadas llaman al jefe.

## Controles

| Tecla | Acción |
| --- | --- |
| WASD | Mover / saltar |
| Shift | Dash |
| F | Golpe |
| J K L | Lejos / medio / definitivo |
| E | Evolucionar (5 formas) |
| S | Bajar plataforma |
| R | Claro |
| M H N Esc | Mapa / ayuda / mute / pausa |

## Formas

1 Bebé · 2 Base · 3 Evo · 4 Final · 5 GOD

XP 18 / 40 / 70 / 110. O pulsa E con barra llena.

## Local

```powershell
cd "X:\GitHub\systems-lab\project-ohana"
git pull origin main
python -m http.server 8080
```

http://localhost:8080 — no abras `index.html` a doble clic.

MIT. Personajes: Disney / Nintendo / TPC. Fan game no comercial.
