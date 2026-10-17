# Cuerno: refinado celeste, v430

Se conserva la línea de cinco cuadrúpedos y su renderer nativo Canvas. No se añaden sprites ni descargas externas.

- Cuernín: ojos grandes, brote y proporciones chibi; articulaciones suaves y cascos pequeños.
- Destello: expresión de cristal, pestaña suave y silueta de poni.
- Potro Iris: crin de aurora y joya de pecho.
- Estelar: alas nacaradas de siete plumas con coberteras, nervaduras y diadema.
- Negro: pelaje de medianoche con planos lila, cola barrida, plumas de constelación, joya cian y luna.

Las patas siguen cuatro puntos de anclaje: dos hombros y dos caderas. El galope lee la fase del rig en la partida; la API de previsualización mantiene su reloj determinista. El modo de movimiento reducido fija la fase. El origen del cuerno y la cola conserva su cálculo anterior, compatible con los ataques. No se alteran estadísticas ni hitboxes.

Validación: pruebas del arte Canvas y expresiones, tamaños de las 50 formas, escenas de ataque y evolución, partida real con J/K/L/U, móvil y movimiento reducido. Vista: previews/cuerno-design.html.
