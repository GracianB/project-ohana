# OHANA · POLISH ROADMAP 20 FASES

Objetivo: convertir Mundo 1 en una experiencia cerrada, legible y agradable de jugar, sin sacrificar las 10 salas, los 10 héroes, las 5 formas ni el combate existente.

## 20 fases de desarrollo

1. **Fuente visual única del héroe**  
   Arte orgánico de `characters/art` como fuente primaria. Los overlays geométricos quedan fuera del cuerpo del héroe.

2. **Cinemática de evolución limpia**  
   Un solo héroe, crossfade continuo, flash corto, partículas con propósito y salida rápida al gameplay.

3. **Modo QA de evolución**  
   `Ctrl+Z` fuerza una evolución para probar las 5 formas sin farmear XP.

4. **Controles físicos robustos**  
   WASD por `KeyboardEvent.code`, fallback a `event.key`, watchdog de foco y limpieza de entradas.

5. **Game feel de movimiento**  
   Aceleración más directa, frenado mejorado, inversión rápida y control aéreo consistente.

6. **Carrusel de roster profesional**  
   Cinco posiciones en escritorio, tres en móvil, centro dominante, laterales atenuados y cero fugas de contenido.

7. **Fondos procedurales como default**  
   Las escenas pintadas dejan de imponerse por accidente. El modo visual base vuelve al arte procedural del juego.

8. **Identidad visual de las 10 salas**  
   Cada sala recibe una capa atmosférica propia aunque comparta bioma con otra.

9. **Rutas y saltos legibles**  
   Añadir piedras de paso donde los huecos exigían demasiada precisión, manteniendo los peligros.

10. **Balance de gates y progresión**  
    Revisar XP, formas requeridas y orden de desbloqueo para que cada sala tenga una razón de existir.

11. **Tutorial contextual**  
    Explicar movimiento, salto, dash, combate, poderes y evolución cuando el jugador los necesita.

12. **Telegraphing de peligros**  
    Pozos, lava, ataques y enemigos peligrosos deben anunciarse con antelación y geometría legible.

13. **Legibilidad de enemigos y proyectiles**  
    Silueta, color, núcleo, trayectoria y punto de impacto deben distinguirse a primera vista.

14. **Cámara y framing**  
    Mantener al héroe y el peligro relevante dentro de una ventana estable, con zoom dinámico moderado.

15. **Boss justo, no arbitrario**  
    Tres fases con telegraphs claros, ventanas de castigo comprensibles y recuperación sin trampas.

16. **Audio por bioma**  
    Música y efectos deben cambiar de identidad con cada transición sin destruir el ritmo del combate.

17. **PWA y caché confiables**  
    Una versión única de caché, precache completo y actualización sin quedar atrapado en assets antiguos.

18. **Save / Continue sólido**  
    Checkpoints válidos, rechazo de partidas corruptas y recuperación limpia de sesión.

19. **Mobile UX real**  
    Controles táctiles grandes, feedback de pulsación, disposición que no tapa gameplay y soporte de orientación.

20. **QA integral de producción**  
    Matriz 10 héroes × 5 formas × 10 salas × estados de combate × desktop/mobile, con Unit + Browser + Visual + Release Gate.

## 20 propuestas adicionales

1. **Sala de entrenamiento secreta** para practicar salto, dash y poderes sin enemigos.
2. **Replay de la evolución** desde pausa para revisar una transformación ya conseguida.
3. **Remapeo de controles** para teclado y mando.
4. **Modo alto contraste** para separar personaje, suelo, enemigos y proyectiles.
5. **Indicador de peligro predictivo** alrededor de proyectiles de alta amenaza.
6. **Medallas por sala** por tiempo, daño recibido y objetivos opcionales.
7. **Temporizador speedrun** visible solo cuando se activa el modo correspondiente.
8. **Resumen de partida** con salas visitadas, formas obtenidas, poderes y mejores tiempos.
9. **Prueba de rendimiento automática** que reduzca VFX antes de que el navegador empiece a sufrir.
10. **Semillas de VFX reproducibles** para poder comparar visuales entre builds.
11. **Occlusion budget** para limitar partículas, bloom y capas cuando hay demasiadas entidades.
12. **Safe landing assist** que dé unos pocos frames de margen al aterrizar en plataformas estrechas.
13. **Recovery grace** muy corto tras daño fuerte para evitar cadenas injustas.
14. **Room cards** al entrar en cada sala con objetivo y mecánica principal.
15. **Objetivos opcionales** de exploración que no bloqueen el progreso principal.
16. **Visualizador de hitboxes QA** activable solo con atajo de pruebas.
17. **Estado de evolución visible** durante la carga para anticipar el desbloqueo.
18. **Micro-animaciones de transición** entre salas para que las puertas no parezcan teletransporte.
19. **Sistema de prioridades visuales**: héroe > amenaza > objetivo > decoración.
20. **Auditoría de consistencia automática** que compare roster, formas, assets, nombres, caché y documentación en CI.

## Criterio de acabado

La regla de diseño es simple: una mecánica que existe pero cuesta entender no está terminada. Una sala que se puede superar por precisión quirúrgica pero no por lectura tampoco está terminada. Y un personaje cuya identidad queda tapada por sus propios FX necesita menos FX, no más.

## Estado de esta oleada

Ya están aplicadas las correcciones estructurales de las fases 1-9: arte orgánico, evolución, QA, input, movimiento, carrusel, fondos, identidad atmosférica y rutas.
Las fases 10-20 quedan formalizadas como la siguiente batería de producción y QA, con las 20 propuestas como backlog de acabado.
