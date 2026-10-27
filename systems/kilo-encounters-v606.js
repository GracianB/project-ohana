// A single authored route replaces the overlapping encounter generators in Kilo.
// Other chapters keep their accepted layouts and growth rules.
import {KILO_CHAPTER_ARENA,KILO_CHAPTER_BOSS_ID} from './kilo-chapter.js';
const FLOOR=1134;
export const KILO_INSTRUMENTS=Object.freeze([
 {id:0,x:2400,y:FLOOR,name:'Caracola del arroyo',instrument:'conch',action:'E o J · despierta la caracola',lesson:'Mantén distancia con J y escucha la primera voz.'},
 {id:1,x:5200,y:FLOOR,name:'Bambú del viento',instrument:'bamboo',action:'J · toca sus tres barras',lesson:'El escudo mira al frente: pasa por encima con K o busca su espalda.'},
 {id:2,x:8200,y:914,name:'Arpa del dosel',instrument:'harp',action:'Salta o levita con K · toca J en el aire',lesson:'Las avispas vigilan el dosel. Cambia de altura y dispara desde un lugar seguro.'},
 {id:3,x:11550,y:FLOOR,name:'Hibisco del compás',instrument:'flower',action:'Tres notas J preparan I · I hace florecer el hibisco',lesson:'Puedes preparar I luchando o practicar tres notas sobre el hibisco.'}
].map(Object.freeze));
const CAST=Object.freeze({cucaracho:'pursuer',cangrejo:'shield',rana:'jumper',planta:'gunner',avispa:'flyer'});
export const KILO_FOE_ROLES=CAST;
export function authorKiloEncounters(room){
 if(room.hero!=='kilo')return room;
 room.kiloEncounterVersion=606;room.width=14400;room.expedition=null;
 room.seal.stations=KILO_INSTRUMENTS.map(s=>({...s,kind:'flower',note:s.id}));
 room.seal.altar={x:14200,y:FLOOR};
 const banks=[[1080,280,48],[2820,240,72],[3650,260,80],[6200,280,95],[9300,300,110],[10150,250,80],[12000,240,75]];
 room.terraces=banks.map(([x,w,rise])=>({x,w,y:FLOOR-rise,rise}));
 const topAt=x=>room.terraces.find(b=>x>=b.x&&x<b.x+b.w)?.y??FLOOR;
 const floor=[];let end=0;
 for(const b of room.terraces){floor.push([end,FLOOR,b.x-end,126],[b.x,b.y,b.w,126+b.rise]);end=b.x+b.w;}
 floor.push([end,FLOOR,room.width-end,126]);
 const shelves=[[1650,1024,220],[1940,924,240],[4380,1034,200],[4680,934,220],[6580,1034,200],[6890,934,200],[7210,834,220],[7530,734,220],[7850,814,210],[8070,914,260],[9720,1034,200],[10010,934,210],[10700,1034,210],[11020,934,210],[12800,974,180],[13640,974,180]];
 room.plats=[...floor,...shelves.map(p=>[...p,22])];
 // Species have anatomy-compatible roles, clear commitment and a home range.
 const cast=[
  [930,'cucaracho',46,0],[1540,'planta',62,0],[2140,'rana',66,0],[2680,'cucaracho',58,0],
  [4010,'cangrejo',106,1],[4520,'planta',90,1],[4980,'avispa',82,1],
  [6420,'rana',116,2],[6910,'planta',118,2],[7490,'avispa',102,2],[7900,'cangrejo',136,2],
  [9340,'cucaracho',140,3],[9870,'planta',142,3],[10420,'rana',148,3],[11000,'cangrejo',158,3],[11670,'avispa',138,3],
  [12120,'rana',156,4],[12390,'planta',158,4]
 ];
 room.foes=cast.map(([x,kind,hp,stage],i)=>{
  const role=CAST[kind],air=role==='flyer',support=topAt(x+20),y=air?(stage===2?710:stage===3?820:support-230):support-40;
  return [x,y,kind,false,{role,chapterHP:hp,variant:i%3,name:{cucaracho:'Escarabajo de raíz',cangrejo:'Cangrejo de corteza',rana:'Rana del compás',planta:'Flor lanzasemillas',avispa:'Avispa del dosel'}[kind],kiloEncounter:true,stage,authoredEncounter:stage,anchorFloor:air?undefined:support,anchorY:y,homeX:x,leash:{left:Math.max(650,x-430),right:Math.min(12540,x+530)},flightBand:air?{top:y-150,bottom:y+220}:undefined}];
 });
 room.foes.push([13280,FLOOR-48,'cangrejo',false,{special:true,name:'Tambor del Claro',arena:KILO_CHAPTER_ARENA,encounterId:KILO_CHAPTER_BOSS_ID}]);
 // Gems lead along real surfaces and alternate routes, never a dense XP carpet.
 room.orbs=[];
 for(const [x,y] of [[650,1089],[800,1089],[1230,1035],[1760,978],[2050,878],[2940,1017],[3200,1089],[3460,1089],[4480,989],[4790,889],[5900,1089],[6700,989],[7000,889],[7330,789],[7650,689],[7950,769],[8410,1089],[8840,1089],[9480,979],[9830,989],[10120,889],[10800,989],[11120,889],[11830,1089],[12230,1089],[12500,1089],[13000,929],[13720,929]])room.orbs.push([x,y]);
 for(const o of room.orbs)o[1]=Math.min(o[1],topAt(o[0])-42);
 const names=['La bienvenida del arroyo','La voz de la caracola','Los guardias de corteza','El bambú del viento','El ascenso del dosel','Las cuerdas del cielo','El jardín del compás','La última voz','El gran Tambor'];
 room.sectors=names.map((name,i)=>({id:i<6?'w1-kilo-'+i:'w1-kilo-act2-'+(i-6),name,x:i*1600,w:1600,role:i===8?'combat':i===4?'platform':'explore'}));
 room.checkpoints=room.sectors.map((s,i)=>({id:s.id,x:i===8?12480:s.x+160,y:topAt(i===8?12480:s.x+160),sector:i}));
 room.nooks=[{id:'w1-kilo-secret-0',x:2060,y:880},{id:'w1-kilo-secret-1',x:7650,y:690}];
 room.hint='Devuelve su voz a la caracola, toca el bambú, alcanza el arpa del dosel y remata el hibisco con I. Cada instrumento despierta una forma. El gran Tambor protege la salida.';
 return room;
}
export function kiloUnlockedForm(g){
 if(!g?.roomDef?.kiloEncounterVersion||g.world1?.sealed||g.world1Seals?.includes('kilo'))return 4;
 return Math.min(4,g.world1?.stations?.filter(s=>s.done).length||0);
}
export function kiloGrowthWaiting(g){return !!g?.roomDef?.kiloEncounterVersion&&g.player?.evo<4&&g.player.evo>=kiloUnlockedForm(g);}
