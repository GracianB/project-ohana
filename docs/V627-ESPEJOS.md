# V627 · Personajes reales en los diez espejos

La sala final ya dibujaba actores reales, pero debajo seguía pintando las esculturas antiguas: un óvalo con símbolos por personaje. Se retira esa segunda figura y su haz de luz. Cada espejo conserva un pedestal con nombre y recuerdo, recibe cristal oscuro y encuadra el dibujo real completo con mediciones de reposo y celebración. Orejas, alas y patas quedan dentro del óvalo; el cristal deja libre la placa. Los cristales de XP se apartan del rostro, manteniendo su cantidad y valor.

Los retratos usan `drawCharacter` y las formas canónicas de la familia, con animación en directo y descarte de espejos fuera de pantalla. La selección final también muestra los diez actores. Si no existe el adaptador de dibujo de una selección o cinemática, o si falla, el adaptador por defecto dibuja el personaje canónico y conserva su expresión, en lugar de sustituirlo por un emblema geométrico.

Se mantiene la corrección de ojos de V626: las cinco formas de Michi usan exactamente `R.eye`, igual que Kilo, Chispín, Dino y Cuerno. Esta entrega no vuelve a rediseñar su cara ni cambia los otros héroes, los controles, el vuelo o las reglas del combate.

La revisión de navegador entra en `w1-final` desde un respaldo de campaña previamente ganado y observa los diez espejos en escritorio y móvil mediante posiciones de inspección. Esas posiciones son fixtures de arte, no una nueva campaña completada. También se comparan los retratos con cristales vacíos y se comprueban las rutas sin adaptador o con adaptador fallido. Resultados efectivos: V627-VALIDATION.json y V627-PUBLICATION.json. La valoración visual del jugador sigue pendiente.
