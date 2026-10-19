import {CAMPAIGN_ROLES} from './campaign-enemies.js';
const CAST={hub:['cucaracho','rana','phosquito','planta'],beach:['cangrejo','gaviota','cucaracho','rana'],jungle:['arana','rana','abeja','planta'],cave:['cucaracho','rana','murcielago','planta'],lab:['cucaracho','rana','ufo','planta'],ridge:['cucaracho','rana','gaviota','planta'],space:['cucaracho','rana','ufo','planta'],reef:['cangrejo','rana','medusa','planta'],volcano:['cucaracho','rana','brasita','planta'],boss:['cucaracho','rana','phosquito','planta']};
const NAMES={pursuer:'Rastreador',shield:'Guardián',shooter:'Semillero',jumper:'Saltador',flyer:'Vigía',burrower:'Excavador',gunner:'Artillero',captain:'Director'};
export function installRoomCast(room){
 const cast=CAST[room.id],floors=room.plats.filter(p=>p[3]>40),ledges=room.plats.filter(p=>p[3]<=40&&p[1]>150);
 while(room.foes.length<32){const i=room.foes.length,role=CAMPAIGN_ROLES[i%8],squad=Math.floor(i/8),target=350+(i+.5)/32*(room.width-700);
  const pool=i%3===0&&ledges.length?ledges:floors,platform=pool.reduce((best,p)=>Math.abs(p[0]+p[2]/2-target)<Math.abs(best[0]+best[2]/2-target)?p:best,pool[0]);
  const x=Math.max(platform[0]+18,Math.min(target,platform[0]+platform[2]-45));
  room.foes.push([x,platform[1]-48,cast[role==='flyer'?2:i%4],false,{role,variant:squad,name:`${NAMES[role]} ${room.short} ${squad+1}`,color:room.color,anchorY:platform[1]-48}]);
 }
 // Give the existing creatures an identity too, preserving their authored AI.
 room.foes.forEach((f,i)=>{if(!f[4])f[4]={variant:Math.floor(i/8),name:`${NAMES[CAMPAIGN_ROLES[i%8]]} ${room.short} ${Math.floor(i/8)+1}`,color:room.color};});
}
