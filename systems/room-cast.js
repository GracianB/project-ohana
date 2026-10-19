const CAST={hub:['cucaracho','rana','phosquito','planta'],beach:['cangrejo','gaviota','cucaracho','rana'],jungle:['arana','rana','abeja','planta'],cave:['cucaracho','rana','murcielago','planta'],lab:['cucaracho','rana','ufo','planta'],ridge:['cucaracho','rana','gaviota','planta'],space:['cucaracho','rana','ufo','planta'],reef:['cangrejo','rana','medusa','planta'],volcano:['cucaracho','rana','brasita','planta'],boss:['cucaracho','rana','phosquito','planta']};
export const ROOM_POPULATION={hub:10,beach:12,jungle:14,cave:12,lab:12,ridge:10,space:10,reef:12,volcano:14,boss:6};
const SPECIAL={hub:['Tambor del Claro','cangrejo','jumper'],beach:['Vigía de espuma','gaviota','flyer'],jungle:['Tejedora del dosel','arana','burrower'],cave:['Eco lunar','murcielago','flyer'],lab:['Centinela 626','ufo','gunner'],ridge:['Guardián del viento','rana','jumper'],space:['Faro orbital','medusa','shooter'],reef:['Aguja de coral','anguila','pursuer'],volcano:['Corazón de brasa','brasita','gunner'],boss:['Heraldo del Nido','avispa','flyer']};
const ROLES={cucaracho:'pursuer',rana:'jumper',phosquito:'flyer',planta:'shooter',cangrejo:'shield',gaviota:'flyer',arana:'burrower',abeja:'flyer',murcielago:'flyer',ufo:'gunner',medusa:'flyer',brasita:'gunner'};
export function installRoomCast(room){
 const count=ROOM_POPULATION[room.id],cast=CAST[room.id],original=room.foes.filter(f=>f[2]==='boss');
 room.foes=original;
 const floors=room.plats.filter(p=>p[3]>40),ledges=room.plats.filter(p=>p[3]<=40&&p[1]>350);
 for(let i=original.length;i<count;i++){
  const special=i===count-1,kind=special?SPECIAL[room.id][1]:cast[i%4],role=special?SPECIAL[room.id][2]:ROLES[kind];
  // Small groups separated by quiet approaches; keep the first checkpoint clear.
  const group=Math.floor(i/3),groups=Math.ceil(count/3),target=600+(group+.5)/groups*(room.width-1000)+(i%3-1)*110;
  const pool=i%3===1&&ledges.length?ledges:floors;
  const platform=pool.reduce((best,p)=>Math.abs(p[0]+p[2]/2-target)<Math.abs(best[0]+best[2]/2-target)?p:best,pool[0]);
  const x=Math.max(platform[0]+18,Math.min(target,platform[0]+platform[2]-45));
  room.foes.push([x,platform[1]-48,kind,false,{role,variant:special?2:0,special,name:special?SPECIAL[room.id][0]:kind,color:room.color,anchorY:platform[1]-48}]);
 }
}
