# Michi y controles táctiles · V655

Esta entrega reúne el jardín V654 y la base de la PR #488 en una única integración.
No se crean commits de publicación separados ni se lanza la batería de Actions.

## Dos zonas para los pulgares

La izquierda contiene izquierda, derecha y bajar. La derecha reparte ataque,
salto, dash y apertura de poderes en dos alturas. Saltar tiene una superficie de
64 píxeles en vertical. Usar solo aparece con una interacción real; está separado
de ambas zonas. Sus botones mantienen los listeners nativos y los mismos data-k.

La bandeja de poderes se abre encima de las acciones y muestra iconos y nombres,
con estado y recarga. En horizontal utiliza una sola fila. Los blancos táctiles
miden al menos 44 píxeles. Los avisos de interacción quedan por encima de los
controles; se evitan rótulos duplicados y avisos informativos encima de Usar.

## Las cinco formas

La cara se dibuja con planos vectoriales, mejillas claras, iris ámbar, pupilas
verticales, reflejos y expresión ligada a amenaza, compañía y victoria. No usa
gradientes ni imágenes. El cachorro conserva el cuerpo pequeño y las patas
expresivas. El aviador incorpora lentes y membranas más claras. El ratón sigue
siendo diminuto y negro. El hechicero tiene una túnica dividida, bordados y sombrero
flotante. El fantasma conserva su escala pequeña, manos independientes y colores
nacarados. Se mantienen hitboxes, velocidad, ataques y poses de las cinco formas.

## Aceptación

La prueba táctil comprueba blancos visibles y sin solapamiento, movimiento y
salto simultáneos mediante dos contactos nativos, J desde la bandeja y Usar para
escuchar y guardar el recuerdo del banco. Se ejecuta en 320×568, 320×844, 390×844
y 844×390. La lámina de personajes usa el renderer real y compara sus siluetas
sin color. La elección de evolución y Continue se prueban por separado.
