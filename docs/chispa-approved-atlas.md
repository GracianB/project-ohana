# Criatura de trueno blanco y oro · jefe del Mundo 2

**Implementación en V454:** diseño reservado y conectado como **Kirin, guardián secreto opcional del segundo mundo personal (Stitcho, Archipiélago del Caos)**. Se desbloquea tras la baliza ECO y tiene su propio registro de derrota y combate. El Núcleo Glitch sigue siendo el jefe principal. Los archivos de arte no están en el registro de personajes jugables. Este cambio está en desarrollo en la PR #390, no publicado.

Diseño reservado para el jefe del Mundo 2. No es el Chispín jugable: ese conserva su cuerpo redondo, branquias violetas y cola de muelle, con «Trueno Gordo» como cuarta evolución. Esta criatura blanca y dorada tiene cinco anatomías propias: semilla eléctrica, familiar bípedo, kirin de cuatro patas, asceta de cuatro brazos y deidad serpentina con colmillos. Las últimas etapas pasan de adorables a amenazantes; sus descargas son angulosas, blancas y con borde cian.

Asset: `assets/sprites/chispa-white-gold-v3.png`. Generado con imagegen integrado, alfa original conservado. Ocho poses por forma: reposo, cuatro de desplazamiento, salto, ataque y canalización. Coordenadas y anclajes medidos por forma en chispa-sprite.js. La carga invalida la caché del renderizador. Colisiones y estadísticas físicas conservadas.

Prompt final: Edit the exact 8 column 5 row game sprite atlas, preserve all 40 poses and five evolution models. Remove external fuzzy halos and particle pixels. Shrink each complete sprite within its cell. Preserve white body, gold armor, cyan edged hard zigzag lightning, adorable first forms, four-legged third, fourarmed spiritual fourth, fearsome fanged serpentine fifth. No fire, background, text, grid or drop shadows. Transparent alpha.

La L representa un sello conductor suspendido con rayos ramificados. No se ha desplegado ni reactivado el multijugador.

Corrección anatómica: Kirin usa un atlas independiente `assets/sprites/chispa-kirin-four-legs-v4.png`, ocho poses con exactamente cuatro patas; la fila antigua del atlas general no se dibuja. Prompt: replacement sprites for the thunder kirin, exactly FOUR legs total, TWO FRONT and TWO HIND, eight isolated poses idle/run x4/jump/claw attack/cast, white near limbs and pale gray far limbs, no extra limbs, no fire, transparent alpha.
