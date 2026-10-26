// V604 · Film blocking independent of collision, save data and hero art.
export function welcomeSpotlightAllows(id,direction){
  return !direction?.hero||id===direction.hero||id===direction.partner;
}
export function welcomeSpotlightSpot(id,base,width,floor,heroHeight,direction){
  if(!base||!direction?.hero||!welcomeSpotlightAllows(id,direction))return base;
  const pair=typeof direction.partner==='string'&&direction.partner!==direction.hero;
  const mobile=width<760;
  const x=width*(pair?(id===direction.hero?(mobile?.37:.39):(mobile?.67:.63)):.5);
  return Object.freeze({...base,x,foot:floor-heroHeight*(id===direction.hero?.04:.12),
    slotWidth:width*(mobile?.29:.23),row:0});
}
