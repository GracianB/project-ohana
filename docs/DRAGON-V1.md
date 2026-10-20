# FASE 5: DRAGÓN (CERRADO)

## Resumen Ejecutivo
Dragón (ID de héroe: `dragon`), el reptil de las llamas celestiales, cuenta ahora con su mundo personal completamente cerrado y verificado al 100% en Canvas vectorial (cero dependencias de imágenes o PNGs externos):
1. **Sala Personal Dedicada (4200x1260)**: *Cordillera de las Brasas* (`systems/dragon-room.js`). 4 sectores progresivos: Garganta de Obsidiana, Ríos de Magma y Geiseres, Caverna de las Brasas y Cúspide del Dragón Celestial. 25 plataformas, 10 enemigos, 14 orbes de fuego y 4 checkpoints.
2. **Escenario Procedural Vectorial**: Parallax volcánico, siluetas de basalto, ríos de magma incandescente, columnas de humo y ceniza, y la constelación del Dragón Celestial (`worlds/dragon-caldera.js`).
3. **Mecánicas de Aventura en Solitario**: 4 corrientes térmicas ascendentes (`DRAGON_UPDRAFTS`) que impulsan el vuelo de Dragón, 3 puertas de obsidiana fundibles (`DRAGON_GATES`), 8 brasas primigenias coleccionables (`DRAGON_EMBERS`), 3 faroles volcánicos (`DRAGON_BEACONS`) y el Altar del Dragón Celestial (`systems/dragon-trail.js`).
4. **Mini Boss Personalizado**: *Guardián del Núcleo Ígneo* (`hub-dragon-boss-v1`, 480 HP, 3 fases tácticas: embestida ígnea, lluvia volcánica y sobrecarga solar) (`systems/dragon-boss.js`).
5. **Combos y Remates**: Visuales distintivos en Canvas para el Remate `I` (*Picado del cometa* con estela flamígera descendente) y el Ultimate `P` (*Vuelo volcánico / Despertar Celestial* con alas ígneas y pilares solares) (`systems/hero-combos.js`).
6. **Selección de Personaje & Coreografía**: Pod de descanso con roca volcánica incandescente y antorchas en la *Isla de los Fósiles*; coreografía en 4 actos junto a Dino (`systems/family-islands.js`).
7. **Colección de 100 Objetos & Reliquia**: 100 brasas ancestrales en el Claro personal con la reliquia legendaria *DRAGÓN CELESTIAL* (`systems/hero-collections.js`).
