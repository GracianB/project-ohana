// One author owns the workshop route. Nothing here changes the old hub or
// the nine other heroes; IDs earned by earlier versions remain valid.
import {STITCHO_CHAPTER_ARENA,STITCHO_CHAPTER_BOSS_ID,STITCHO_RAIL,stitchoRailDone} from './stitcho-chapter.js';
const FLOOR=1134;
export const STITCHO_MODULES=Object.freeze([
 {id:0,x:2180,y:FLOOR,kind:'part',name:'Núcleo de arranque',releaseKind:'plasma',action:'J · alimenta el núcleo con plasma',lesson:'Abre el módulo con J, recógelo y llévalo al primer puerto.',target:{x:2800,y:FLOOR}},
 {id:1,x:7420,y:914,kind:'part',name:'Giroscopio del puente',releaseKind:'air',action:'Salta · J en el aire activa el giroscopio',lesson:'Sube por las cornisas, usa J en el aire y baja con la pieza hasta su puerto.',target:{x:8100,y:FLOOR}},
 {id:2,x:10920,y:FLOOR,kind:'part',name:'Reactor de regreso',releaseKind:'roll',action:'K · golpea el cierre rodando',lesson:'Entra rodando desde un lado para soltar el reactor; transpórtalo hasta la nave.',target:{x:11780,y:FLOOR}}
].map(s=>Object.freeze({...s,target:Object.freeze(s.target)})));
export function authorStitchoEncounters(room){
 if(room.hero!=='stitcho')return room;
 room.stitchoEncounterVersion=607;room.width=14400;room.expedition=null;
 room.guardian={encounterId:STITCHO_CHAPTER_BOSS_ID,x:13280,arena:STITCHO_CHAPTER_ARENA};
 room.seal.stations=STITCHO_MODULES.map(s=>({...s,target:{...s.target}}));
 room.seal.altar={x:14200,y:FLOOR};
 room.terraces=[[1110,240,48],[3270,220,64],[5710,230,80],[9000,260,95],[10200,250,70],[12000,220,75]].map(([x,w,rise])=>({x,w,rise,y:FLOOR-rise}));
 const top=x=>room.terraces.find(t=>x>=t.x&&x<t.x+t.w)?.y??FLOOR;
 const floor=[];let end=0;
 for(const b of room.terraces){floor.push([end,FLOOR,b.x-end,126],[b.x,b.y,b.w,126+b.rise]);end=b.x+b.w;}
 floor.push([end,FLOOR,room.width-end,126]);
 // The roll corridor has no raised banks or one-way shelves at body height.
 const shelves=[[1530,1024,200],[1800,924,200],[3480,974,210],[3740,874,220],[5170,1034,210],[5440,934,220],[6430,1034,210],[6720,934,220],[7040,834,220],[7340,914,250],[8400,1034,210],[8690,934,210],[9580,1034,210],[9850,934,210],[12580,974,180],[13700,974,180]];
 room.plats=[...floor,...shelves.map(p=>[...p,22])];
 const cast=[
  [900,'cucaracho','shield',55,0],[1450,'phosquito','shooter',58,0],[1880,'arana','jumper',68,0],
  [3440,'cucaracho','shield',94,1],[3860,'murcielago','flyer',82,1],[4910,'ufo','gunner',108,1],
  [5890,'arana','jumper',120,2],[6460,'phosquito','shooter',106,2],[7040,'murcielago','flyer',112,2],[7760,'cucaracho','shield',142,2],
  [8800,'ufo','gunner',132,3],[9320,'arana','jumper',148,3],[9890,'cucaracho','shield',160,3],[10460,'phosquito','shooter',148,3],[11440,'murcielago','flyer',145,3],
  [12130,'ufo','gunner',164,4],[12410,'arana','jumper',170,4]
 ];
 room.foes=cast.map(([x,kind,role,hp,stage],i)=>{
  const hover=['ufo','phosquito'].includes(kind),air=hover||role==='flyer',support=top(x+25),y=air?(stage===2?760:support-220):support-40;
  return [x,y,kind,false,{role,chapterHP:hp,stitchoEncounter:true,stage,authoredEncounter:stage,variant:i%3,hoverShooter:hover,
   name:{cucaracho:'Escarabajo blindado',phosquito:'Mosquito batería',arana:'Araña de mantenimiento',murcielago:'Vigía del techo',ufo:'Dron del astillero'}[kind],
   anchorFloor:air?undefined:support,anchorY:y,homeX:x,leash:{left:Math.max(650,x-430),right:Math.min(12580,x+520)},flightBand:air?{top:y-110,bottom:y+200}:undefined}];
 });
 room.orbs=[[650,1089],[800,1089],[1220,1040],[1640,978],[1910,878],[3090,1089],[3560,929],[3850,829],[4180,1089],[4890,1089],[5280,989],[5550,889],[6260,1089],[6540,989],[6840,889],[7160,789],[7460,869],[8310,1089],[8510,989],[8800,889],[9460,1089],[9690,989],[9960,889],[10650,1089],[11200,1089],[11910,1089],[12490,1089],[13800,929]];
 for(const o of room.orbs)o[1]=Math.min(o[1],top(o[0])-42);
 const names=['El muelle de los olvidados','El núcleo de arranque','La vía de mantenimiento','La patrulla del astillero','Las grúas del puente','El giroscopio perdido','El corredor del reactor','La nave de regreso','El Núcleo Glitch'];
 room.sectors=names.map((name,i)=>({id:i<6?'w1-stitcho-'+i:'w1-stitcho-act2-'+(i-6),name,x:i*1600,w:1600,role:i===8?'combat':i===4?'platform':'explore'}));
 room.checkpoints=room.sectors.map((s,i)=>({id:s.id,x:i===8?12500:s.x+160,y:top(i===8?12500:s.x+160),sector:i}));
 room.nooks=[{id:'w1-stitcho-secret-0',x:1910,y:878},{id:'w1-stitcho-secret-1',x:7160,y:789}];
 room.hint='J despierta el núcleo. Repara su puerto, cruza la vía con K, recupera el giroscopio en el aire y libera el reactor rodando. Cada reparación te enseña una forma. Glitch custodia la salida.';
 return room;
}
export function stitchoUnlockedForm(g){
 if(!g?.roomDef?.stitchoEncounterVersion||g.world1?.sealed||g.world1Seals?.includes('stitcho'))return 4;
 const s=g.world1?.stations;if(!s?.[0]?.done)return 0;
 if(!stitchoRailDone(g))return 1;
 return s[1]?.done?(s[2]?.done?4:3):2;
}
export function stitchoGrowthWaiting(g){return !!g?.roomDef?.stitchoEncounterVersion&&g.player?.evo<4&&g.player.evo>=stitchoUnlockedForm(g);}
