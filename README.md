# PROJECT OHANA — rebuild

Motor canvas modular. Sirve con:

```
python -m http.server 8080
```

Abre `http://localhost:8080/`

## Controles

- WASD / flechas: mover y saltar
- J K L: habilidades 1 / 2 / ultimate
- E: evolucionar (3 formas)
- 1-5: mundos (playa, jungla, volcán, espacio, lab)
- R: reaparecer
- ESC / ✕: cerrar notificación

## Qué se ha reconstruido

1. Caer bajo el mundo = muerte + respawn
2. Notificaciones con botón cerrar y ESC
3. Pikachu completo
4. Render distinto por personaje (Lilo, Stitch, Pikachu, Dragón, Gato)
5. Habilidades únicas
6. Evoluciones que cambian tamaño, aura y nombre
7. Fondo distinto por mundo

## Git (en tu PC)

```
cd "X:\GitHub\systems-lab\project-ohana"
git fetch origin
git status
git pull origin main --rebase
```

Copia estos archivos encima de los tuyos, luego:

```
git add -A
git commit -m "rebuild: unique characters, pikachu, void death, worlds, abilities"
git push origin main
```

Si hay conflicto: `git status` y pégame la salida. No uses `--force` salvo que quieras pisar GitHub a propósito.

No subas `PROJECT-OHANA-COMPLETE.zip` al repo.
