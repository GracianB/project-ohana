# Última revisión: V628 · Cierre y recuperación de actores

Se corrigen el estado Canvas filtrado por adaptadores fallidos y el caso false; se limpia el resumen final. Revancha de Quimera y cierre sin solapamientos, selector y recuerdos se verifican con controles. Ver [alcance](V628-CIERRE.md), [validación](V628-VALIDATION.json), [publicación](V628-PUBLICATION.json).

# Última revisión: V627 · Espejos con la familia real

Se retiran esculturas geométricas superpuestas y se encuadran actores reales dentro de los diez cristales. Selección y cinemáticas usan actores canónicos si falta o falla su adaptador. Los ojos compartidos de V626 se conservan. Ver [alcance](V627-ESPEJOS.md), [validación](V627-VALIDATION.json) y [publicación](V627-PUBLICATION.json).

# Última revisión: V626 · Ojos compartidos con los demás héroes

El usuario rechaza los ojos de V625. Michi usa ahora `R.eye` sin modificarlo, igual que Kilo/Chispín/Dino/Cuerno. Ver [alcance](V626-MICHI-EYES.md), [validación](V626-VALIDATION.json) y [publicación](V626-PUBLICATION.json).

# Última revisión: V625 · Las cinco formas de Michi

El usuario reabre toda la familia visual. Se corrige la perspectiva imposible del conejo y se revisan las cinco anatomías, las caras y las poses. El vuelo ganado en V624 se conserva. Alcance: [V625-MICHI.md](V625-MICHI.md). Resultados efectivos: [validación](V625-VALIDATION.json) y [publicación](V625-PUBLICATION.json). No equivale a aceptación humana del arte.

# Última entrega: V624 · Michicornio

Bebé y Conejornio Lunar con anatomía propia, ojos suaves y animaciones diferenciadas. Hada, Medusa y Eclipse conservan el dibujo aceptado; Hada gana aleteo limitado y Eclipse vuelo sostenido mediante salto mantenido, con teclado y táctil. Cámara y guía acompañan el vuelo. Alcance exacto: [V624-MICHICORNIO.md](V624-MICHICORNIO.md). Verificación y publicación: V624-VALIDATION.json y V624-PUBLICATION.json. El informe V623 inferior conserva la base de la campaña completa.

---

# OHANA · V1.0 · aventura individual

Cierre solicitado por el usuario el 28 de octubre de 2026. Build de entrega: `ohana-623`. Estado verificable: [v1-solo-status.json](v1-solo-status.json). Alcance y criterios: [V1.0.0-CIERRE.md](V1.0.0-CIERRE.md). Evidencia de esta entrega: `V623-VALIDATION.json`; publicación: `V623-PUBLICATION.json`.

## Alcance

Diez capítulos con protagonista propio, cinco formas, encuentros y guardián; revancha de diez guardianes evolucionados, diez recuerdos personales y Quimera en cuatro fases. Inicio de cada capítulo nuevo como bebé; los capítulos ya ganados se pueden revisitar con la forma conseguida. Mil recuerdos opcionales, diez reliquias, celebraciones, mapa, libro, pausa y Continue persistente. Todo el escenario y personajes se dibujan con Canvas.

Conserva el trabajo integrado hasta V622. V623 corrige selección, retratos en espejos, transparencia y resolución de las cinemáticas; rediseña la cuarta forma de Michi como Conejornio Lunar y acentúa la carrera de Frita. Añade constelaciones y neón propio por sala, mejora materiales/poses de guardianes y el acabado anatómico de enemigos. Retira puentes bajos que tapaban pozos en siete capítulos y cambia el rótulo por un poste DANGER. Aclara enlaces e I/P/U y confirma el guardado en pausa. No cambia daño, hitboxes, velocidades, costes ni dificultad. Alcance exacto en V1.0.0-CIERRE.md.

## Reproducir la validación

Desde la raíz del repositorio, instalar dependencias con `npm ci`. Usar Chromium de Playwright o definir `CHROMIUM_BIN` si ya existe una instalación local.

- `npm test` y `npm run release:check`.
- `npm run test:browser` para la auditoría general.
- `CHROMIUM_BIN=/ruta/chromium npm run test:browser:campaign`: campaña limpia hasta el cierre; produce `test-results/v600/earned-campaign-storage.json`.
- `npm run test:browser:release-polish`: usa ese respaldo ganado para comprobar enlaces, pausa, libro y Continue a tres tamaños.
- `npm run test:browser:startup`: carga lenta, descarga fallida, reintento y Enter temprano.
- Los mil recuerdos se recogieron físicamente en V622. Su respaldo `test-results/v600/all-memory-storage.json` permite verificar la restauración con `npm run test:browser:memory-save`. Los artefactos locales no se versionan ni se sustituyen por progreso inventado.

## Multijugador

Netlify sigue pausado. Aventura y Versus se verifican con el servidor local; esto no acredita conexión entre dispositivos por el servidor público. No reactivar servicios de pago ni declarar validado el transporte remoto sin una prueba real. La V1 de aventura individual no depende de ese servicio.

## Mantenimiento

La V1 queda congelada para correcciones de fallos. Conservar IDs y guardados, cambios recientes del usuario y límites por héroe de AGENTS.md. Antes de otra entrega, consultar main y el registro vigente; no integrar ramas V607 alternativas ni propuestas incompletas de Yomi V617 por encima de la campaña funcional. No reutilizar como estado actual documentos V501–V603.

La evaluación de diversión, arte y dificultad percibida sigue siendo una valoración al jugar. El cierre fue pedido por el usuario; los tests acreditan únicamente los escenarios registrados.

El [handoff anterior](HANDOFF-V1-SOLO-HISTORICAL.md) y el [estado V603](v1-solo-status-v603.json) se conservan como referencia histórica.
