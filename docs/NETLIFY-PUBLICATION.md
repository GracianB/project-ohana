# Publicar Ohana en el sitio existente de Netlify

Sitio: `project-ohana-multiplayer` (`122287e0-6454-4ac3-955b-26d63b83b13b`). Registro efectivo: [V640-PUBLICATION.json](V640-PUBLICATION.json).

Autenticar con la autorización oficial de Netlify CLI; no pegar credenciales en el chat ni guardarlas en el repositorio. El CLI actual permite `netlify login --request "Publicar Ohana"` y comprobar el ticket con `netlify login --check TICKET`.

Preparar un directorio limpio a partir de los archivos versionados. Instalar las dependencias con `npm ci`: **node_modules debe contener archivos reales, no un enlace a otro directorio**. El empaquetador NFT puede conservar ese enlace en el ZIP y dejar fuera `@netlify/blobs`, lo que rompe las funciones al arrancar.

Vincular y compilar:

```sh
netlify link --id 122287e0-6454-4ac3-955b-26d63b83b13b
netlify build --context production
netlify deploy --no-build --site project-ohana-multiplayer --dir .
```

El último comando crea una versión de comprobación, sin sustituir producción. Si el acceso de red del compilador local impide consultar la cuenta, este proyecto permite `netlify build --offline --context production`: sus funciones leen la configuración sensible durante la ejecución, no durante esta compilación.

Verificar el ZIP de las funciones y el arranque de sus dependencias. En la URL de comprobación, `GET /.netlify/functions/game` debe devolver el error controlado 405, no 502. Crear dos sesiones propias para Aventura y Versus, confirmar héroes y preparación, y comprobar el movimiento entre clientes. Desconectar las sesiones al terminar. Promover ese mismo despliegue comprobado a producción mediante Netlify y repetir las comprobaciones de versión y API en el dominio público.

No declarar publicada una versión por haber subido únicamente los archivos estáticos. Deben estar desplegadas `game` y `rtc-config`, y el service worker y los módulos públicos deben corresponder al mismo código comprobado.
