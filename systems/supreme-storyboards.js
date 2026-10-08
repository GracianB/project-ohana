// PROJECT OHANA V48 · SUPREME STORYBOARDS
// Pure data: safe to import in Node tests and browser runtime.
export const SUPREME_STORYBOARDS = Object.freeze({
  kilo:    { duration:4.80, camera:"rise",    gag:"pollen-bonk",    scene:"bloom",   beat:"MOTA → GOLPE → SOL" },
  stitcho: { duration:5.05, camera:"zip",     gag:"rift-zipper",    scene:"rift",    beat:"GRIETA → MIRADA → COSTURA" },
  chispin: { duration:4.90, camera:"snap",    gag:"overcharge",     scene:"storm",   beat:"CARGA → CALAMBRE → RAYO" },
  cat:     { duration:5.15, camera:"still",   gag:"deadpan-eclipse",scene:"eclipse", beat:"SILENCIO → ECLIPSE → SOMBRA" },
  dragon:  { duration:5.60, camera:"push",    gag:"tiny-sneeze",    scene:"nova",    beat:"ESTORNUDO → PERSECUCIÓN → CORONA → SUPERNOVA" },
  dino:    { duration:6.30, camera:"colossus",gag:"heart-of-colossus",scene:"quake",beat:"LATIDO → DESPERTAR → FRACTURA → COMETAS → CORAZÓN" },
  frita:   { duration:4.85, camera:"whip",    gag:"potato-catch",   scene:"crisp",   beat:"PATATA → CAPTURA → KÉTCHUP → CRUJIDO" },
  pizza:   { duration:5.10, camera:"recoil",  gag:"oven-too-hot",   scene:"oven",    beat:"BOSTEZO → HORNO → ¡QUEMA! → VOLCÁN" },
  yomi:    { duration:6.25, camera:"pull",    gag:"void-looks-back",scene:"maw",     beat:"FAROL → CUERNO → EMBESTIDA → JUICIO" },
  cuerno:  { duration:6.10, camera:"sweep",   gag:"dream-rainbow",   scene:"aurora",  beat:"ALIENTO → CÍRCULO → SUEÑO → AURORA" },
});


// V68: four clear acts for Cuerno's U. Stateless and identical under reduced motion.
export function cuernoGrandStage(value) {
  const k=Math.max(0,Math.min(1,Number(value)||0));
  if(k<.22)return {name:"breath",value:k/.22};
  if(k<.51)return {name:"iris",value:(k-.22)/.29};
  if(k<.76)return {name:"dream",value:(k-.51)/.25};
  return {name:"aurora",value:(k-.76)/.24};
}
