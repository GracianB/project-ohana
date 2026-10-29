# V626 · Los mismos ojos que los demás héroes

El usuario rechaza la mirada de V625 y pide explícitamente que Michi use ojos como los demás personajes. Las cinco formas pasan a llamar al mismo `R.eye` de `characters/rig.js` que ya usan Kilo, Chispín, Dino y Cuerno. Se eliminan los tres dibujos particulares de ojos almendrados de Michi. El renderizador compartido y los demás héroes no se modifican.

`characters/michi-eyes.js` limita los valores de mirada/parpadeo y delega el dibujo al helper común con el iris violeta que utiliza Cuerno. Cada forma conserva su posición y tamaño de ojos, la perspectiva del rostro y sus expresiones. Los dos pequeños degradados de iris proceden del dibujador existente; el arte sigue siendo Canvas en directo. No cambian cuerpos, vuelo, controles, colisiones, recursos ni guardados.

Las pruebas comparan la salida de Michi con `R.eye`, revisan expresiones y valores no finitos y vuelven a comprobar las cinco formas en selección, acciones y HUD. Los resultados efectivos y la publicación figuran en V626-VALIDATION.json y V626-PUBLICATION.json. La aprobación visual del jugador sigue pendiente.
