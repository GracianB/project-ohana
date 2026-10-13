# V323 Fase 1 · Aplicación

El archivo `systems/abilities.js` debe contener la versión con autoridad U telegrafiada.

## Cambios realizados

En `castSupreme`, para los seis héroes legacy (Dragón, Dino, Frita, Pizza, Yomi, Cuerno):

- Eliminado el `hitEnemy` inmediato.
- Conservados los efectos de estado (vuelo, sueño, invuln, curación, etc.).
- La llamada a `startFamilyDuet` recibe `[]` como `legacyTargets`.

El daño solo ocurre en los beats telegrafiados del dúo (42/66/90).

## Cómo aplicarlo

Si el archivo en main no está actualizado, aplica el patch:

```bash
git apply V323-phase1.patch
```

O reemplaza manualmente el bloque a partir de `} else if (p.id === "dragon") {` dentro de `castSupreme` con la versión comentada `// V323 Phase 1`.

## Verificación

- No debe quedar ningún `hitEnemy` inmediato en el bloque de los seis héroes.
- Debe existir `startFamilyDuet(..., [], chosen)`.
- Tests de daño único y autoridad deben pasar.

Cache objetivo posterior: `ohana-340`.
