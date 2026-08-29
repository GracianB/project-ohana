# PROJECT OHANA

Una aventura de plataformas procedural en canvas, ambientada entre playas, junglas, volcanes, laboratorios alienígenas y espacio profundo.

## Jugar localmente

Abre la carpeta con un servidor estático. Por ejemplo:

```powershell
python -m http.server 4173
```

Después visita `http://localhost:4173`.

## Controles

| Acción | Teclas |
| --- | --- |
| Mover | `A` / `D` o flechas |
| Saltar | `Espacio`, `W` o flecha arriba |
| Ataque básico | `J` |
| Habilidad especial | `K` |
| Ultimate | `L` |
| Evolucionar | `E` |
| Cambiar personaje | `1`–`4` |
| Pausa | `Esc` |

## Personajes

- Lilo — exploradora equilibrada.
- Stitch — experimento resistente.
- Dragón de Milán — guardián de alto impacto.
- Gato Kawaii — explorador rápido y energético.

Cada integrante de la ohana conserva su nivel, XP, energía, habilidades y evolución. Los cristales y enemigos derrotados conceden XP; al alcanzar el nivel necesario, usa `E` para desbloquear una nueva forma y su ultimate.

Para probar el sistema desde la consola del navegador:

```js
ProjectOhana.addXP(5000);
ProjectOhana.evolveCharacter();
ProjectOhana.switchCharacter("dragon");
```
