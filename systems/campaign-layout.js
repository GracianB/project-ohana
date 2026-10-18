// World geometry is also the source for falls, checkpoints and the local map.
const PALETTES={hub:'#9cdb9a',beach:'#f5d595',jungle:'#7ed399',cave:'#95b9ef',lab:'#80e1df',ridge:'#d9e8fb',space:'#c8a5f5',reef:'#7edbd8',volcano:'#ffad77',boss:'#d5aec6'};
const SECTORS={
 beach:['Orilla de las conchas','Muelles de marea','Acantilado Hoku','Gruta del oleaje','Faro del regreso'],
 jungle:['Raíces antiguas','Puentes de copa','Dosel de las abejas','Árbol del eco','Boca de la caldera'],
 cave:['Vestíbulo azul','Terrazas de cristal','Galería del murciélago','Cámara del agua','Umbral del laboratorio'],
 lab:['Recepción abandonada','Conductos de plasma','Cámaras de ensayo','Reactor alienígena','Hangar del regreso'],
 ridge:['Pie de la cumbre','Escaleras del viento','Nidos suspendidos','Paso de las nubes','Observatorio'],
 space:['Muelle orbital','Jardín de meteoritos','Satélites perdidos','Anillo de estrellas','Umbral del vacío'],
 reef:['Jardín de coral','Pozas de luz','Arcos sumergidos','Abismo de medusas','Torre de las mareas'],
 volcano:['Camino de ceniza','Terrazas de basalto','Forja del dragón','Puente de brasas','Puertas del Nido'],
};
const CASTS={beach:['cangrejo','gaviota','planta','rana'],jungle:['rana','abeja','arana','libelula'],cave:['arana','murcielago','planta','cucaracho'],lab:['ufo','cucaracho','arana','phosquito'],ridge:['gaviota','rana','murcielago','planta'],space:['ufo','phosquito','brasita','medusa'],reef:['pez','anguila','medusa','cangrejo'],volcano:['escoria','brasita','planta','rana']};
export function groundGaps(plats,width){
 const floors=plats.filter(p=>p[3]>40).sort((a,b)=>a[0]-b[0]),gaps=[];let end=0;
 for(const p of floors){if(p[0]>end+1)gaps.push({x:end,w:p[0]-end,y:p[1]});end=Math.max(end,p[0]+p[2]);}
 if(end<width)gaps.push({x:end,w:width-end,y:floors.at(-1)?.[1]||1134});return gaps;
}
export function installCampaign(rooms){
 for(const r of Object.values(rooms)){
  r.width=r.id==='hub'?4200:r.boss?3360:7200;r.height=1260;r.color=PALETTES[r.id];
  const names=SECTORS[r.id]||(r.boss?['Umbral de raíces','Antesala de la Reina','Trono del Nido']:['Claro de la familia','Sendero del viento','Mirador Ohana']);
  r.sectors=names.map((name,i)=>({id:`${r.id}-${i}`,name,x:i*r.width/names.length,w:r.width/names.length,role:['explore','combat','platform','secret','rest'][i%5]}));
  if(!r.boss){
   const floors=r.plats.filter(p=>p[3]>40),end=Math.max(...floors.map(p=>p[0]+p[2]));
   // Keep the original district, then author new terraces rather than stretching it.
   if(end<r.width)r.plats.push([end,1134,r.width-end,126]);
   for(let i=0;i<r.sectors.length;i++){
    const s=r.sectors[i],x=s.x+160;
    // Baby-accessible ascent: 80px rises, broad shared landing areas.
    for(let j=0;j<4;j++)r.plats.push([x+j*115,1054-j*80,250,22]);
    r.plats.push([x+560,814,320,22],[x+870,894,260,22]);
    if(i>1){const cast=CASTS[r.id]||['cucaracho','phosquito','rana','planta'];
     r.foes.push([x+230,1030,cast[(i-2)%cast.length]],[x+650,760,cast[(i-1)%cast.length]],[x+1000,1040,cast[i%cast.length],i===3]);
     r.orbs.push([x+310,910],[x+680,750],[x+1000,830]);
    }
   }
  }
  r.hazards=groundGaps(r.plats,r.width).map((gap,i)=>({id:({beach:"reef-drop",jungle:"caldera-drop",ridge:"hub-drop-ridge",space:"hub-drop-space",volcano:"magma-pit"}[r.id]||`${r.id}-fall`)+ (i?`-${i}`:""),x:gap.x,y:gap.y-36,w:gap.w,h:r.height-gap.y+200,type:r.doors.down?'transfer':'death',dest:r.doors.down||null,label:r.doors.down?rooms[r.doors.down]?.short||r.doors.down:r.id==='volcano'?'MAGMA MORTAL':'ABISMO MORTAL',color:r.doors.down?'#7eeaff':'#ff765f',...(r.id==='volcano'?{heroEscape:'dragon'}:{})}));
  // Large drop mouths have visible stepping stones; missing one still takes the labelled route.
  if(!r.boss)for(const h of r.hazards)if(h.w>140)for(let x=h.x+45;x<h.x+h.w-40;x+=105)r.plats.push([x,h.y-25,90,22]);
  r.checkpoints=r.sectors.map((s,i)=>{const wanted=Math.min(r.width-180,s.x+100),floors=r.plats.filter(p=>p[3]>40).sort((a,b)=>a[0]-b[0]);const floor=floors.find(p=>wanted>=p[0]+80&&wanted<=p[0]+p[2]-80)||floors.find(p=>p[0]>wanted)||floors.at(-1);return {id:s.id,x:Math.max(floor[0]+80,Math.min(wanted,floor[0]+floor[2]-80)),y:floor[1],sector:i};});
  // Upper exits are physically connected to the highest existing ledge.
  const top=r.plats.filter(p=>p[3]<40).sort((a,b)=>a[1]-b[1])[0];
  r.upExit=r.doors.up?{x:top?.[0]||r.width/2,w:top?.[2]||280,dest:r.doors.up}:null;
  if(r.upExit)for(let y=1054;y>=14;y-=80)r.plats.push([r.upExit.x,y,r.upExit.w,22]);
 }
 return rooms;
}
export function checkpointFor(room,id){return room?.checkpoints?.find(c=>c.id===id)||room?.checkpoints?.[0]||null;}
export function updateCampaignProgress(g){
 const p=g.player,r=g.roomDef;if(!p||p.dead||!r?.sectors)return;
 g.explored||={};const explored=g.explored[r.id]||=[];
 const sector=r.sectors.find(s=>p.x+p.w/2>=s.x&&p.x+p.w/2<s.x+s.w);
 if(sector&&!explored.includes(sector.id))explored.push(sector.id);
 if(!p.grounded)return;
 const c=r.checkpoints.find(c=>Math.abs(p.x+p.w/2-c.x)<85&&Math.abs(p.y+p.h-c.y)<12);
 if(c){g.checkpoints||={};if(g.checkpoints[r.id]!==c.id){g.checkpoints[r.id]=c.id;g.clearedEncounters||={};g.clearedEncounters[r.id]=[...new Set([...(g.clearedEncounters[r.id]||[]),...(g._defeatedThisVisit||[])])];g.nums?.add?.(p.x,p.y-30,'PUNTO DE CONTROL','#b2ffe1',true);g.save?.();}}
}
export function drawCheckpoints(ctx,g,cam,t){
 for(const c of g.roomDef?.checkpoints||[]){const x=c.x-cam.x,y=c.y-cam.y;if(x<-80||x>1600)continue;
  const active=g.checkpoints?.[g.roomId]===c.id;ctx.save();ctx.strokeStyle=active?'#aaffda':'#c9dadd';ctx.fillStyle=active?'#8bf2bd':'#d8b977';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-65);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-65);ctx.lineTo(x+30,y-55+(g.reduceMotion?0:Math.sin(t*.07)*3));ctx.lineTo(x,y-42);ctx.fill();ctx.restore();
 }
}
