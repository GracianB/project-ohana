// Authoring data: no random platform motifs, no new progression keys.
const FLOOR=1134;
export const ROOM_COMPOSITIONS=Object.freeze({
 kilo:{name:'Sendero de raíces y agua',material:'grove',terraces:[[1080,280,48],[4540,300,64],[6580,250,48]],branch:[[1540,1054,180],[1780,954,260],[2100,1014,190]],landmark:'arbor'},
 stitcho:{name:'Muelles y diques del astillero',material:'dock',terraces:[[1160,280,56],[3900,310,72],[6060,260,56]],branch:[[2980,1054,160],[3160,974,170],[3360,894,160]],landmark:'drydock'},
 chispin:{name:'Acueductos del relámpago',material:'marble',terraces:[[1140,280,56],[4760,280,64],[6660,260,56]],branch:[[3200,1054,180],[3450,954,220],[3740,954,180]],landmark:'conductor'},
 cat:{name:'Jardín suspendido de los sueños',material:'lunar',terraces:[[1080,260,48],[3780,300,64],[6700,260,56]],branch:[[3840,1054,180],[4100,934,180],[4370,1014,180]],landmark:'willow'},
 cuerno:{name:'Invernadero de cristal',material:'prism',terraces:[[1560,260,48],[3520,320,72],[6160,270,56]],branch:[[4230,1034,180],[4460,914,190],[4720,974,210]],landmark:'glasshouse'},
 dragon:{name:'Terrazas de la forja',material:'basalt',terraces:[[1360,280,56],[3500,280,72],[5220,250,56]],branch:[[3400,974,190],[3650,814,190],[3890,714,210]],landmark:'forge'},
 dino:{name:'Cañón de las costillas gigantes',material:'fossil',terraces:[[1160,280,56],[4660,300,64],[6200,280,56]],branch:[[4450,1054,180],[4680,974,260],[4990,974,180]],landmark:'ribs'},
 frita:{name:'Pasarelas del mercado',material:'diner',terraces:[[1080,260,48],[5100,300,64],[6040,270,56]],branch:[[5040,974,240],[5370,914,220],[5650,1034,220]],landmark:'market'},
 pizza:{name:'Balcones del puerto',material:'brick',terraces:[[1080,250,48],[3020,300,64],[6380,280,56]],branch:[[4700,1054,210],[4970,934,240],[5290,1014,180]],landmark:'piazza'},
 yomi:{name:'Pasarelas del observatorio',material:'alloy',terraces:[[1100,280,48],[3060,280,64],[6220,280,56]],branch:[[4640,1054,210],[4900,974,260],[5220,974,210]],landmark:'orrery'}
});
const overlap=(a,b,pad=0)=>a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad;
export function composeChapterRoom(hero,room){
 const plan=ROOM_COMPOSITIONS[hero];if(!plan)return room;
 const reserved=(room.seal?.stations||[]).flatMap(s=>s.kind==='geyser'?[{x:Math.min(s.x,s.prize.x)-130,w:Math.abs(s.x-s.prize.x)+260}]:[{x:s.x-180,w:360},...(s.target?[{x:s.target.x-180,w:360}]:[])]);
 const terraces=plan.terraces.map(([x,w,rise])=>({x,w,y:FLOOR-rise,rise})).filter(t=>!reserved.some(r=>overlap(t,r,30)));
 const floors=[];let end=0;for(const tr of terraces){if(tr.x>end)floors.push([end,FLOOR,tr.x-end,126]);floors.push([tr.x,tr.y,tr.w,126+tr.rise]);end=tr.x+tr.w;}floors.push([end,FLOOR,room.width-end,126]);
 const topAt=x=>terraces.find(t=>x>=t.x&&x<t.x+t.w)?.y??FLOOR;
 // Keep the authored mechanics, remove incidental shelves that form low ceilings.
 const upper=room.plats.filter((p,i)=>i>0&&!terraces.some(t=>overlap({x:p[0],w:p[2]},t,40)&&p[1]>t.y-130));
 const route=plan.branch.filter(p=>!reserved.some(r=>overlap({x:p[0],w:p[2]},r,55)));
 for(const p of route)if(!upper.some(q=>Math.abs(q[0]-p[0])<90&&Math.abs(q[1]-p[1])<60))upper.push([...p,22]);
 const branchEnd=route.at(-1),late=upper.filter(p=>p[0]>5700&&p[0]<8100&&p[1]<1035&&p[1]>650).sort((a,b)=>a[1]-b[1])[0],lastBank=terraces.at(-1);
 const nooks=[...(branchEnd?[{id:room.id+'-secret-0',x:branchEnd[0]+branchEnd[2]/2,y:branchEnd[1]-40}]:[]),...(late?[{id:room.id+'-secret-1',x:late[0]+late[2]/2,y:late[1]-40}]:lastBank?[{id:room.id+'-secret-1',x:lastBank.x+lastBank.w/2,y:lastBank.y-40}]:[])];
 // Physical enemies and XP follow the actual surface, rather than being buried
 // inside a raised bank or dropped through the floor at spawn.
 for(const f of room.foes){if(f[4]?.role&&f[4].role!=='flyer'&&!f[4].special){f[4]={...f[4],anchorFloor:topAt(f[0]+20)};f[1]=topAt(f[0]+20)-40;}}
 for(const orb of room.orbs){const y=topAt(orb[0]);if(orb[1]>y-20)orb[1]=y-42;}
 for(const cp of room.checkpoints)cp.y=topAt(cp.x);
 if(branchEnd){const x=branchEnd[0]+branchEnd[2]/2;room.foes.push([x,branchEnd[1]-40,'cucaracho',false,{role:'shooter',name:'Vigía de '+plan.name,anchorFloor:branchEnd[1],chapterHP:105}]);}
 const encounterLanes=terraces.map((tr,i)=>({x:tr.x,w:tr.w,name:plan.name+' · '+(i+1)}));
 return {...room,plats:[...floors,...upper],composition:plan,terraces,nooks,encounterLanes};
}
