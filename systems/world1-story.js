// OHANA V467 · Una sola historia para el Mundo 1.
// Intro → diez salas (entrada + sello) → Quimera (aparición, fases, caída) → final.
// Todas las frases viven aquí para que la narrativa sea coherente de punta a punta.
export const WORLD1_TITLE = "Mundo 1 · La Ruta de los Diez";
export const WORLD1_PREMISE = "El Eco robó la canción de cada héroe y la cosió en la Quimera Ohana. Despierta los diez sellos para recuperarla.";

// Cada sala: lo que dice su héroe al entrar y al despertar su sello.
export const WORLD1_ROOM_STORY = Object.freeze({
  kilo:    { enter: "Kilo: «Mi ukelele suena hueco… el Eco se llevó la canción del hogar».",      seal: "Kilo: «¡Ahí está! Cuatro notas y la casa vuelve a sonar»." },
  stitcho: { enter: "Stitcho: «¡Mi nave! El Eco la ha descosido pieza a pieza».",                 seal: "Stitcho: «Cosida y brillando. Ningún experimento se queda atrás»." },
  chispin: { enter: "Chispín: «Sin mi chispa el trueno no tiene voz. Ayúdame a encadenarla».",    seal: "Chispín: «¡PIKA-BUM! El cielo vuelve a reír»." },
  cat:     { enter: "Michi: «Mis medusas lunares se han dormido. Sin ellas no sé soñar».",        seal: "Michi: «Brillan otra vez. El sueño era nuestro, no del Eco»." },
  cuerno:  { enter: "Cuerno: «La aurora está rota en tres prismas. Hay que ordenarla».",          seal: "Cuerno: «I, II, III… la aurora vuelve a pintar el bosque»." },
  dragon:  { enter: "Dragón: «Mis braseros están fríos. El Eco se bebió el fuego del hogar».",    seal: "Dragón: «Cuatro llamas. Ahora el fuego calienta, no asusta»." },
  dino:    { enter: "Dino: «Los fósiles duermen. Con un buen pisotón se despiertan»." ,           seal: "Dino: «¡BUM! La tierra recuerda quiénes somos»." },
  frita:   { enter: "Frita: «Mis patatas doradas han volado a las nubes. ¡A por ellas!».",         seal: "Frita: «Crujientes y calentitas. El banquete vuelve a estar servido»." },
  pizza:   { enter: "Pizza: «Hay clientes con hambre y el Eco apagó mi horno. ¡Reparto exprés!».", seal: "Pizza: «Tres pizzas, tres sonrisas. Eso es Ohana con queso»." },
  yomi:    { enter: "Yomi: «Detecto la firma del Eco en mi red. Sincronicemos los nodos».",       seal: "Yomi: «Red restaurada. Ya sé dónde se esconde: en el Corazón de Ohana»." }
});

export const FUSION_STORY = Object.freeze({
  procession: "Diez estatuas. Diez sellos encendidos. Al fondo late algo que tiene la voz de toda la familia.",
  intro: ["El Eco recoge las diez canciones robadas…", "…y las cose en un solo cuerpo.", "LA QUIMERA OHANA"],
  phases: {
    2: { name: "ECO DE LA FAMILIA", line: "La Quimera imita las voces de los diez. Ninguna suena a hogar." },
    3: { name: "ERUPCIÓN DE LOS DIEZ", line: "Fuego, trueno y marea a la vez. Las costuras empiezan a brillar." },
    4: { name: "OHANA ROTA", line: "Los ecos se separan y cargan uno a uno. ¡Aguanta, ya casi vuelven a casa!" }
  },
  fall: [
    "Las costuras de la Quimera se sueltan.",
    "Diez luces vuelven, cada una a su héroe.",
    "Ohana significa familia. Y la familia nunca se copia: se cuida."
  ]
});

export const WORLD1_ENDING = Object.freeze({
  kicker: "Mundo 1 completado · La Ruta de los Diez",
  act: "LAS DIEZ CANCIONES VUELVEN A CASA",
  title: "NADIE SE QUEDA ATRÁS",
  jun: "LA QUIMERA SE DESCOSE",
  sub: "Diez sellos, diez héroes y una sola canción. Más allá del Corazón de Ohana espera el Mundo 2, todavía en construcción."
});
