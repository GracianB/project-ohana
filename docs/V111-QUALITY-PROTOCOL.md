# OHANA · Pruebas y entregas hasta V111

**Acuerdo de trabajo:** no se pide al creador que pruebe, despliegue, actualice Netlify ni repita pasos manuales después de cada versión V104–V110. El juego continúa desarrollándose por iteraciones pequeñas y seguras con las pruebas de GitHub.

## Automatización por versión

Una PR debe pasar en GitHub Actions:
- Node / pruebas de regresión (todos los módulos).
- Browser E2E del modo individual.
- Multiplayer E2E con dos contextos de navegador y servidor simulado.
- Matriz visual de personajes, mundos y escenas.
- Release Gate y control de presupuesto de peso.
- CI de main y publicación verificada en GitHub Pages antes de marcar individual como publicada.

Añadir pruebas específicas en cada versión: red lenta, sesiones caducadas, ataques duplicados, señales manipuladas, progreso de sala, objetos inaccesibles y pérdida de conexión. Las métricas de red se pueden inspeccionar en los datos `coopRtt`, `coopNetwork`, `coopOutOfOrder` de `document.body.dataset`.

## Regla honesta de Netlify

**El despliegue de GitHub Pages no publica las funciones de Netlify.** El proyecto usa Netlify CLI con `netlify/functions/game.ts`; no hay evidencias de un pipeline automático Netlify ↔ GitHub main configurado para esa instalación. No dar por desplegadas online las versiones intermedias.

Se evita pedir el despliegue manual de V104–V110. Para evaluar el código se usan pruebas del servicio Node con almacenamiento simulado y E2E local. **Estas pruebas no demuestran latencia real en Netlify** ni conectividad pública con dos dispositivos.

Antes de declarar V111 lista para concurso:
1. Verificar/sincronizar main en el equipo y publicar Netlify una vez o habilitar integración automática con credenciales autorizadas.
2. Probar partida real en dos navegadores/dispositivos diferentes, sin sesión compartida, en la dirección pública.
3. Medir ping/red y FPS en ambas máquinas, detectar causa de cualquier lentitud.
4. Validar crear sala, seleccionar héroes, mismos diez escenarios, sincronizar ataques/evoluciones, santuarios, derrota/victoria, reconexión y guardado.
5. Corregir P0/P1 y volver a automatizar esos casos antes de etiquetar la V111.

## Evolución de contenidos

V104: escenas 41–60 y red tolerante a jitter/snapshots atrasados. V105: escenas 61–80 y cooperación relevante en diez santuarios. V106: escenas 81–100 y álbum/final de colección. V107–V110: juego cooperativo completo, Reina, optimización y beta virtual de QA, no asumir pruebas humanas no realizadas. V111: **release candidate** con controles y evidencias verificables, y prueba humana final.

**No crear un tag de lanzamiento si el modo concurso carece de la validación pública, incluso cuando GitHub esté verde.**
