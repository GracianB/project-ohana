# Michi · El jardín que recuerda · V654

Integra la PR #488: brújula, vuelo, controles táctiles, correcciones del ritual
y pilotos de navegador. La entrega añade un capítulo espacial y mecanismos reales.

El patio tiene tres accesos separados por más de 800 unidades: el pozo de raíces
al oeste, el espejo del balcón a 284 unidades de altura y el umbral del laberinto
al este. El guardián se alcanza desde el extremo del laberinto. La barca de salida
espera al otro lado del santuario, después del sello y de los tres ecos.

Un canal de lluvia tiene una repisa de recuperación debajo. Puedes saltarlo o
activar la rueda con E para cultivar un puente físico de raíces. Ese puente queda
guardado y se reconstruye al continuar. La campana de la cripta calma durante un
tiempo a la fauna cercana; no afecta al jefe ni a enemigos lejanos. La flor del
viento crea una corriente para alcanzar tres recuerdos altos: debes saltar hacia
ella, no arrastra al personaje que permanece en el suelo.

Tres lugares permiten escuchar recuerdos: el banco con una bufanda, las marcas
de la familia bajo las raíces y una luz entre las ramas. No conceden experiencia
ni cambian la forma elegida. Sus pequeñas luces acompañan a Michi. Los diez lazos
del árbol familiar y los faroles reflejan progreso real. Las escenas de entrada,
reencuentro con la Polilla y salida usan personajes y elementos del juego.

Michi conserva sus cinco siluetas, velocidades y controles. Se refinan las cejas,
los reflejos de los ojos y las costuras de su pañuelo sin gradientes en el actor.
La Polilla tiene alas grabadas, ocelos, antenas plumosas y un farol abierto durante
la recuperación real. Se conservan los avisos, patrones y ventanas de daño.

Los grupos de hojas y cada panel de cristal se generan desde geometría y se reutilizan en cachés acotadas; conservan posiciones independientes y cambian al ganar luz. No se descarga ninguna ilustración.

Todo el escenario es vectorial, con capas independientes, descarte por cámara y
movimiento reducido. Los 100 recuerdos conservan sus identificadores. Los tres
recuerdos altos y uno que quedaba sobre el nuevo canal se recolocan sobre soportes.
Las partidas antiguas conservan los objetos, sellos, evolución y recorridos nuevos.

La validación local incluye guardado saneado de mecanismos, rutas, física de las
interacciones, render, escritorio y móvil. Una sola integración con [skip ci]
evita la batería automática de PRs; Pages se publica con una única invocación
manual de su workflow. No se alteran ni desactivan los workflows de otros trabajos.
