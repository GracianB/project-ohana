// V604 · Film blocking independent of collision, save data and hero art.
export function welcomeSpotlightAllows(id,direction){
  // The final pause also shows a two-character scene, never a ten-rig grid.
  const hero=direction?.hero||'kilo',partner=direction?.partner||'stitcho';
  return id===hero||id===partner;
}
export function welcomeSpotlightSpot(id,base,width,floor,heroHeight,direction){
  if(!base||!welcomeSpotlightAllows(id,direction))return base;
  const stage=direction?.hero?direction:{hero:'kilo',partner:'stitcho'};
  const pair=typeof stage.partner==='string'&&stage.partner!==stage.hero;
  const mobile=width<760;
  const x=width*(pair?(id===stage.hero?(mobile?.37:.39):(mobile?.67:.63)):.5);
  return Object.freeze({...base,x,foot:floor-heroHeight*(id===stage.hero?.04:.12),
    slotWidth:width*(mobile?.29:.23),row:0});
}
