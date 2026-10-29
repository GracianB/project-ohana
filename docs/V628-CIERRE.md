# V628 · Recuperación del dibujo y cierre de partida

La revisión de V627 completa la revancha contra las cuatro fases de Quimera en Normal desde un respaldo de campaña previamente ganado, sigue las cinemáticas de derrota y cierre y vuelve al selector, tanto en escritorio como en móvil. Las diez celebraciones de recuerdos ya ganados se pueden reproducir y cerrar. Esto no equivale a una nueva campaña de diez capítulos ni a una nueva recogida de mil recuerdos.

La prueba de fallos del adaptador de personajes detecta un defecto real: si el dibujador externo guardaba el lienzo y después fallaba, quedaban transformaciones y recortes activos. La recuperación podía desplazar los actores y acumular estados. Ahora se controla la profundidad de save/restore durante la llamada, se protege el estado del propietario y se libera cualquier guardado pendiente antes de pintar el actor canónico. Un retorno explícito false también activa ese actor por defecto. Las propiedades originales del contexto se reponen al terminar. No se modifica el prototipo global ni se intenta deshacer píxeles que el adaptador haya pintado antes de fallar.

También se corrige el reintento de Quimera: al recargar su sala se descarta el director del jefe anterior. Su barra y sus avisos desaparecen mientras el jefe está ausente, y el siguiente encuentro crea su propio director. Se conservan sellos y recuerdos ganados.

El resumen final deja de duplicar el nombre cuando héroe y forma coinciden, llama Rango a la calificación y elimina el número técnico V500 del botón de la constelación. Los tiempos y propietarios de las cinemáticas, los héroes, los ojos compartidos, los espejos, las habilidades, las colisiones y las reglas del combate se conservan.

Resultados efectivos: V628-VALIDATION.json y V628-PUBLICATION.json. La aprobación estética y de dificultad del jugador sigue pendiente.
