# OHANA · World 1 Closure Candidate

Fecha: 05/10/2026

## Estado

Esta rama es el **candidato consolidado de cierre de Mundo 1**. No se declara el mundo cerrado hasta que GitHub Actions confirme la suite completa.

## Lo que queda protegido

### Experiencia
- una sola voz para mensajes temporales
- objetivos persistentes separados
- tutorial contextual
- entradas de sala con narración única
- evolución breve y sin letterbox
- boss con HUD compacto
- combate visual-first
- telegraphs direccionales
- presencia individual de los 10 héroes

### Integridad
- 10 personajes
- 5 formas por personaje
- 10 salas
- Reina del Nido
- 30 habilidades
- save v2
- reloj fijo
- RNG reproducible
- runtime fail-closed
- Service Worker coherente

### Calidad
- `npm test`
- `npm run test:browser`
- `npm run test:visual`
- `npm run release:check`

## Criterio de cierre

El cierre solo puede pasar a `main` cuando los cuatro comandos anteriores terminen en PASS en CI y la auditoría de navegador confirme:

1. una sola tarjeta de mensaje activa;
2. ningún overlay legacy;
3. ninguna banda negra accidental;
4. ningún solape crítico del HUD;
5. entrada a salas y Nido correctamente narrada;
6. evolución y boss visualmente estables;
7. desktop, mobile y reduced-motion operativos;
8. cache y precache coherentes.

## Nota

No se ha eliminado el arte útil introducido durante las fases anteriores. Se ha eliminado únicamente la duplicación de presentación y se han puesto límites para que futuras mejoras no vuelvan a romper la experiencia.
