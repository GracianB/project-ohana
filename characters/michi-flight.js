// Only Michi's two winged forms can fly. A fairy has a short wing effort;
// Eclipse sustains lift. Holding jump is shared by keyboard, touch and gamepad.
export const MICHI_FAIRY_FLIGHT_FRAMES=90;
const winged=p=>(p?.characterId??p?.id)==='cat'&&(p.evo===1||p.evo===4);
export function michiFlightState(p){
 if(!winged(p))return null;
 return {mode:p._michiWingMode||'ground',unlimited:p.evo===4,remaining:p.evo===4?null:Math.max(0,p._michiWingFuel??MICHI_FAIRY_FLIGHT_FRAMES)};
}
export function steerMichiFlight(p,input={}){
 if((p?.characterId??p?.id)!=='cat')return false;
 if(!winged(p)||p.dead||p.health<=0||p.hp<=0){
  if(p._michiWingForm!=null){p._michiWingForm=null;p._michiWingMode=null;p._michiWingAir=false;p._gliding=false;}
  return false;
 }
 if(p._michiWingForm!==p.evo){p._michiWingForm=p.evo;p._michiWingFuel=MICHI_FAIRY_FLIGHT_FRAMES;p._michiWingAir=false;}
 if(p.grounded){p._michiWingFuel=MICHI_FAIRY_FLIGHT_FRAMES;p._michiWingAir=false;p._michiWingMode='ground';p._gliding=false;return false;}
 // Keep the ordinary takeoff impulse before the wings assume control.
 if(!p._michiWingAir&&(!input.jump||p.vy< -3.6))return false;
 p._michiWingAir=true;p._gliding=true;
 const unlimited=p.evo===4;
 if(input.drop){p._michiWingMode='descend';p.vy=Math.max(4.5,p.vy);}
 else if(input.jump&&(unlimited||p._michiWingFuel>0)){
  p._michiWingMode='ascend';if(!unlimited)p._michiWingFuel--;
  const target=unlimited?-3.8:-2.5;p.vy+=(target-p.vy)*.3;
 }else{p._michiWingMode='glide';p.vy=unlimited?.65:1.4;}
 return true;
}
