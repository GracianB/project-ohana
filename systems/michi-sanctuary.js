// Michi's authored, branching chapter. Stable room/station/memory IDs preserve saves.
export const MICHI_SANCTUARY_VERSION=648;
export const SANCTUARY_PALETTE=Object.freeze({sky:'#102c38',deep:'#071e2a',stone:'#34525a',ivory:'#e9dfbc',teal:'#8dd7c6',coral:'#e7a394'});
const passage=(id,x,floor,toX,toFloor,label,need=0,extra={})=>({id,x,floor,toX,toFloor,label,need,...extra});
export function authorMichiSanctuary(room){
 if(room.hero!=='cat')return room;
 const zones=[{id:'court',name:'Patio de los faroles',x:3300,y:700,w:2500,h:560,floor:1134}, {id:'crypt',name:'Cripta de las raíces',x:400,y:1280,w:2800,h:780,floor:1860},{id:'gallery',name:'Galería del recuerdo',x:400,y:380,w:2800,h:600,floor:820},{id:'maze',name:'Laberinto de los ecos',x:5800,y:720,w:2400,h:540,floor:1134},{id:'canopy',name:'Jardín suspendido',x:5800,y:80,w:2400,h:640,floor:620},{id:'arena',name:'Santuario del Farol',x:8200,y:600,w:1400,h:660,floor:1134},{id:'return',name:'Muelle del alba',x:9600,y:700,w:4800,h:560,floor:1134}];
 const passages=[passage('court-crypt',3870,1134,900,1860,'Cripta de las raíces',1),passage('crypt-court',2860,1860,4130,1134,'Volver al patio'),passage('crypt-gallery',1150,1860,900,820,'Galería del recuerdo',4),passage('gallery-crypt',2860,820,1420,1860,'Bajar a las raíces'),passage('court-maze',5340,1134,6000,1134,'Laberinto de los ecos',2),passage('maze-court',7820,1134,5020,1134,'Volver al patio'),passage('maze-canopy',6180,1134,6210,620,'Ascenso al jardín',3),passage('canopy-maze',7780,620,7440,1134,'Bajar al laberinto'),passage('court-gallery',4670,1134,2680,820,'Galería del recuerdo',4),passage('gallery-court',610,820,4480,1134,'Volver al patio'),passage('court-arena',5680,1134,8370,1134,'Santuario del Farol',5),passage('arena-court',8340,1134,5510,1134,'Volver al patio'),passage('court-exit',3540,1134,14000,1134,'Camino de Cuerno',5,{exit:true})];
 const stations=[{id:0,x:4360,y:950,name:'Farol I · La chispa',lesson:'Salta hasta el farol. Tu primera luz abre la cripta.'},{id:1,x:1910,y:1680,name:'Farol II · Ser pequeño',lesson:'Salta para devolver la luz a las raíces. La cripta recuerda una forma diminuta.'},{id:2,x:7110,y:950,name:'Farol III · El eco',lesson:'Busca el claro entre los muros y salta hacia el farol.'},{id:3,x:7030,y:440,name:'Farol IV · La confianza',lesson:'Asciende al jardín; el farol espera sobre la terraza.'},{id:4,x:1860,y:640,name:'Farol V · La memoria',lesson:'La galería reúne las cinco luces. Vuelve al patio para abrir el santuario.'}].map(s=>({...s,kind:'jelly'}));
 const floors=[[0,1134,3300,100],[3300,1134,4900,126],[400,1860,2800,160],[400,820,2800,70],[5800,620,2400,70],[8200,1134,1400,126],[9600,1134,4800,126],[0,0,42,2100],[14358,0,42,900]];
 const ledges=[];for(const [base,y]of[[4040,1134],[1590,1860],[6790,1134],[6710,620],[1540,820]])for(let i=1;i<=2;i++)ledges.push([base+i*95,y-i*75,170,18]);
 // Real switchback routes, with recoverable floor beneath both paths.
 for(let i=0;i<7;i++)ledges.push([5900+i*260,1034-(i%3)*95,180,20]);
 ledges.push([6420,904,28,230],[6800,794,28,230],[7480,904,28,230],[5960,534,170,18],[6350,444,170,18],[7490,454,180,18],[780,734,180,18],[1160,634,180,18],[2310,634,180,18],[2650,734,180,18]);
 const species=['arana','murcielago','phosquito','ufo','medusa'];
 const entries=[[4620,1134,0,'pursuer'],[1220,1860,0,'pursuer'],[2320,1860,3,'shield'],[1640,1660,1,'flyer'],[1120,820,2,'gunner'],[2420,820,4,'flyer'],[6300,1134,0,'pursuer'],[7040,1134,3,'shield'],[7550,970,2,'gunner'],[6410,620,1,'flyer'],[7390,620,4,'flyer'],[7700,620,2,'gunner'],[10900,1134,0,'pursuer'],[12100,960,1,'flyer']];
 room.foes=entries.map(([x,floor,s,role],i)=>[x,floor-(['flyer','gunner'].includes(role)?130:45),species[s],false,{role,name:['Hiladora de raíces','Polilla del farol','Vigía de cobre','Caracola del umbral','Faroluna errante'][s],chapterHP:44+Math.min(i,8)*6,anchorFloor:floor,anchorY:floor-130,flightBand:['flyer','gunner'].includes(role)?{top:floor-270,bottom:floor-20}:null,catEncounter:true,michiSanctuary:true,leash:{left:x-170,right:x+240}}]);
 room.width=14400;room.height=2100;room.name='Michi · El jardín de las nueve vidas';room.color=SANCTUARY_PALETTE.teal;room.plats=[...floors,...ledges];room.hazards=[];room.catPearls=[];room.catUpdrafts=[];room.catTraps=[];
 room.seal.stations=stations;room.seal.altar={x:14230,y:1134};
 room.orbs=zones.slice(0,5).flatMap(z=>[0,1,2].map(i=>[z.x+350+i*390,z.floor-80]));room.nooks=[{id:'w1-cat-secret-0',x:1510,y:1815},{id:'w1-cat-secret-1',x:7560,y:575}];
 room.sectors=zones.map((z,i)=>({...z,id:'w1-cat-zone-'+i,role:'explore'}));room.checkpoints=zones.map((z,i)=>({id:'w1-cat-sanctuary-'+i,x:z.x+220,y:z.floor,sector:i}));
 room.expedition={...room.expedition,name:'Las tres voces del hogar',verb:'Después del guardián, salta hacia los tres ecos de la familia',kind:'moon',nodes:[{id:'w1-cat-v2-trial-0',x:4100,y:930,kind:'moon'},{id:'w1-cat-v2-trial-1',x:5070,y:930,kind:'moon'},{id:'w1-cat-v2-trial-2',x:7400,y:450,kind:'moon'}]};
 const memories=[];for(let zone=0;zone<5;zone++)for(let i=0;i<20;i++){const id=zone*20+i,starts=[3650,900,900,5910,6130],ys=[1134,1860,820,1134,620];memories.push({id,page:Math.floor(id/10),x:starts[zone]+i*72,y:ys[zone]-27,challenge:i>=16});}
 for(const m of memories)for(const wall of room.plats)if(wall[3]>24&&wall[1]<m.y&&wall[1]+wall[3]>m.y&&m.x>wall[0]-18&&m.x<wall[0]+wall[2]+18)m.x=wall[0]+wall[2]+27;
 room.michiSanctuary={version:648,zones,passages,memories,spawn:{x:4360,floor:1134}};
 room.hint='Devuelve la luz a cinco faroles. Las madrigueras del patio conectan las raíces, el laberinto, el jardín y la galería. Mira las señales de cada arco.';
 return room;
}
export const sanctuaryGuardianDefeated=g=>!!g.clearedEncounters?.['w1-cat']?.includes('w1-cat-astral-v1');
export const isMichiSanctuary=g=>!!g?.roomDef?.michiSanctuary;
export function sanctuaryZone(g){const p=g.player;if(!p)return null;return g.roomDef.michiSanctuary.zones.find(z=>p.x>=z.x&&p.x<z.x+z.w&&p.y+p.h>=z.y&&p.y+p.h<=z.y+z.h)||g.roomDef.michiSanctuary.zones[0];}
export function passageReady(g,a){const n=g.world1?.stations?.filter(s=>s.done).length||0;if(n<a.need)return false;if(a.exit)return !!g.world1?.sealed&&(g.expedition?.done?.length||0)>=3;return true;}
export function nearestSanctuaryPassage(g){if(!isMichiSanctuary(g)||!g.player)return null;const p=g.player;return g.roomDef.michiSanctuary.passages.find(a=>Math.abs(p.x+p.w/2-a.x)<65&&Math.abs(p.y+p.h-a.floor)<95)||null;}
export function interactMichiSanctuary(g){
 const a=nearestSanctuaryPassage(g),p=g.player;if(!a||p.dead||g._michiTransitCooldown>0)return false;
 if(!passageReady(g,a)){g.nums?.add?.(a.x,a.floor-100,a.exit?'RECUPERA LOS TRES ECOS DEL HOGAR':'FAROLES · '+(g.world1?.stations.filter(s=>s.done).length||0)+'/'+a.need,'#edd4ac');return true;}
 g._michiTransitCooldown=55;p.x=a.toX-p.w/2;p.y=a.toFloor-p.h-3;p.vx=0;p.vy=0;p.grounded=false;p.buffer=0;p._jumpPrev=false;g.resetInput?.();
 g.cam.x=Math.max(0,Math.min(g.worldW-(g.viewW||1280),p.x-(g.viewW||1280)/2));g.cam.y=Math.max(0,Math.min(g.worldH-(g.viewH||720),p.y-(g.viewH||720)*.65));g.fading=g.reduceMotion?3:12;
 g.fx?.emit?.(p.x+p.w/2,p.y,{color:SANCTUARY_PALETTE.teal,count:g.reduceMotion?3:9,size:2,life:20});
 if(a.exit&&!g._michiExitScene){g._michiExitScene=true;g.playWorld1Cine?.('chapterExit','cat');}return true;
}
export function updateMichiSanctuary(g){
 if(!isMichiSanctuary(g)||!g.player||g.player.dead)return;
 g._michiTransitCooldown=Math.max(0,(g._michiTransitCooldown||0)-1);
 if(sanctuaryGuardianDefeated(g)&&!g.world1?.sealed&&typeof g.playWorld1Cine==='function'){const seen='w1-cat-sanctuary-victory';g.secrets||={};const secrets=g.secrets['w1-cat']||=[];if(!secrets.includes(seen)){secrets.push(seen);g.playWorld1Cine?.('chapterBossVictory','cat');g.save?.();}}
 const p=g.player,done=g.world1?.stations?.every(s=>s.done);
 if(done&&!sanctuaryGuardianDefeated(g)&&!g._michiBossArrival&&p.x>8200&&p.x<9400&&!g.world1.sealed){g._michiBossArrival=true;g.playWorld1Cine?.('chapterBossIntro','cat');}
}
// Route advice uses the same directed passage graph as actual interactions.
export function sanctuaryObjective(g){
 if(!isMichiSanctuary(g)||!g.world1)return null;
 const current=sanctuaryZone(g),target=g.world1.stations.find(s=>!s.done);
 const echo=g.roomDef.expedition?.nodes?.find(n=>!g.expedition?.done.includes(n.id));
 let goal=target?{x:target.x,y:target.y,label:target.name,action:target.lesson}:g.world1.sealed?{x:3540,y:1074,label:'Camino de Cuerno',action:'Vuelve al arco del patio · ↓ / E para viajar al muelle'}:sanctuaryGuardianDefeated(g)?echo?{...echo,label:'Eco del hogar '+((g.expedition?.done.length||0)+1)+'/3',action:'Salta hacia el farol para escuchar a la familia'}:null:{x:8750,y:1134,label:'Polilla del Farol',action:'Observa el aviso. Ataca cuando abra el farol.'};
 if(!goal)return null;
 const zones=g.roomDef.michiSanctuary.zones,zone=zones.find(z=>goal.x>=z.x&&goal.x<z.x+z.w&&goal.y>=z.y&&goal.y<=z.y+z.h);
 if(!zone||zone.id===current.id)return goal;
 const zoneAt=(x,f)=>zones.find(z=>x>=z.x&&x<z.x+z.w&&f>=z.y&&f<=z.y+z.h),queue=[{id:current.id,first:null}],seen=new Set();
 while(queue.length){const q=queue.shift();if(seen.has(q.id))continue;seen.add(q.id);if(q.id===zone.id&&q.first)return{x:q.first.x,y:q.first.floor-60,label:q.first.label,action:'Entra en el arco con ↓ / E · '+goal.label};for(const a of g.roomDef.michiSanctuary.passages){if(!passageReady(g,a)||zoneAt(a.x,a.floor)?.id!==q.id)continue;const to=zoneAt(a.toX,a.toFloor);if(to)queue.push({id:to.id,first:q.first||a});}}
 return goal;
}
