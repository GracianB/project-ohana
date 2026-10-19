export const ALBUM_ROOMS=['hub','beach','jungle','cave','lab','ridge','space','reef','volcano','boss'];
export const ROOM_RELICS={hub:['kilo','Ukelele del hogar','#ffacc2'],beach:['frita','Salero de marea','#ffe9a8'],jungle:['stitcho','Nave de la familia','#67ddff'],cave:['cat','Ovillo lunar','#ceb2ff'],lab:['chispin','Corazón de tormenta','#fff29a'],ridge:['cuerno','Lanza de aurora','#eccbff'],space:['yomi','Farol del regreso','#ff6b91'],reef:['pizza','Porción del océano','#ffd36a'],volcano:['dragon','Brasa del hogar','#ff905d'],boss:['dino','Fósil de la familia','#b8ef6b']};
const KEY='ohana-room-albums-v1';
export function cleanRoomAlbums(raw){
 const result={};for(const room of ALBUM_ROOMS){const value=raw?.[room];if(!value)continue;const found=[...new Set((Array.isArray(value.found)?value.found:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<100))].sort((a,b)=>a-b);result[room]={found,relic:found.length===100&&value.relic===true};}return result;
}
export function readRoomAlbums(storage=globalThis.localStorage){try{return cleanRoomAlbums(JSON.parse(storage?.getItem(KEY)||'{}'));}catch{return {};}}
export function mergeRoomAlbums(a,b){const result=cleanRoomAlbums(a);for(const [id,v] of Object.entries(cleanRoomAlbums(b))){const old=result[id]||{found:[]};result[id]={found:[...new Set([...old.found,...v.found])].sort((a,b)=>a-b),relic:!!(old.relic||v.relic)};}return result;}
export function persistRoomAlbums(g,storage=globalThis.localStorage){try{g.roomAlbums=mergeRoomAlbums(readRoomAlbums(storage),g.roomAlbums);storage?.setItem(KEY,JSON.stringify(g.roomAlbums));}catch{}g.onRoomAlbumChange?.();g.save?.();}
export function roomAlbumPlacements(room){
 const all=room.plats.filter(p=>p[2]>=90),ground=all.filter(p=>p[3]>40),ledges=all.filter(p=>p[3]<=40&&p[1]>120);
 return Array.from({length:100},(_,id)=>{
  const challenge=id>=70,regular=[...ground,...ledges.filter(p=>p[1]>700)],pool=challenge&&ledges.length?ledges:regular.length?regular:all;
  const platform=pool[challenge?(id-70)%pool.length:id%pool.length],lap=Math.floor((challenge?id-70:id)/pool.length);
  const u=challenge?(.12+((lap*.37)% .76)):(.03+((lap+.5)*.61803398875%1)*.94);
  return {id,x:platform[0]+18+u*Math.max(0,platform[2]-36),y:platform[1]-(challenge&&id%3===0?72:30),challenge};
 });
}
export function enterRoomAlbum(g){if(g.relicScene)g.onRelicEnd?.();g.roomAlbums||={};g.roomAlbums[g.roomId]||={found:[],relic:false};g.roomAlbumItems=roomAlbumPlacements(g.roomDef);g.relicScene=null;}
export function takeRoomItem(g,id){const album=g.roomAlbums?.[g.roomId];if(!album||album.found.includes(id)||!Number.isInteger(id)||id<0||id>=100)return false;album.found.push(id);g.score=(g.score||0)+10;persistRoomAlbums(g);return true;}
export function claimRoomRelic(g){const a=g.roomAlbums?.[g.roomId];if(!a||a.found.length!==100||a.relic)return false;a.relic=true;g.relicScene={room:g.roomId,age:0,duration:600};g.renderDirty=true;g.onRelicBegin?.();persistRoomAlbums(g);g.resetInput?.();return true;}
export function updateRoomAlbum(g){
 const p=g.player,a=g.roomAlbums?.[g.roomId];if(g.heroCollection||!p||p.dead||!a)return;
 const found=new Set(a.found);let changed=false;
 for(const item of g.roomAlbumItems||[])if(!found.has(item.id)&&Math.abs(p.x+p.w/2-item.x)<25&&Math.abs(p.y+p.h/2-item.y)<32){a.found.push(item.id);found.add(item.id);g.score=(g.score||0)+10;changed=true;}
 if(changed){g.nums?.add?.(p.x,p.y-20,`${a.found.length}/100 · RECUERDOS`,ROOM_RELICS[g.roomId][2],false);if(a.found.length===100)g.nums?.add?.(p.x,p.y-65,'OBJETO ESPECIAL · VUELVE A LA BANDERA DE ENTRADA','#fff1b5',true);persistRoomAlbums(g);}
 const home=g.roomDef.checkpoints?.[0]||{x:180,y:1134};
 if(a.found.length===100&&!a.relic&&Math.hypot(p.x+p.w/2-home.x,p.y+p.h-(home.y-25))<70)claimRoomRelic(g);
}
export function tickRelicScene(g){if(!g.relicScene)return false;g.relicScene.age++;g.renderDirty=true;if(g.relicScene.age>=120&&g.relicScene.age<480&&g.relicScene.age%45===0)g.onRelicBeat?.(Math.floor((g.relicScene.age-120)/45));if(g.relicScene.age>=600){g.relicScene=null;g.onRelicEnd?.();g.resetInput?.();}return true;}
export function drawRoomAlbum(ctx,g,cam){
 const a=g.roomAlbums?.[g.roomId];if(g.heroCollection||!a)return;const found=new Set(a.found),color=ROOM_RELICS[g.roomId][2];ctx.save();ctx.fillStyle=color;ctx.strokeStyle='#fff5dc';ctx.lineWidth=1.5;
 for(const item of g.roomAlbumItems||[]){const x=item.x-cam.x,y=item.y-cam.y;if(found.has(item.id)||x<-15||x>(g.viewW||1600)+15||y<-15||y>(g.viewH||1000)+15)continue;ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x+5,y);ctx.lineTo(x,y+6);ctx.lineTo(x-5,y);ctx.closePath();ctx.fill();if(item.challenge)ctx.stroke();}
 if(a.found.length===100&&!a.relic){const c=g.roomDef.checkpoints?.[0]||{x:180,y:1134},x=c.x-cam.x,y=c.y-25-cam.y;ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('✦ '+ROOM_RELICS[g.roomId][1],x,y-50);ctx.save();ctx.translate(x,y-18);ctx.rotate(-.6);ctx.fillStyle="#e0b47b";ctx.fillRect(0,-3,36,6);ctx.beginPath();ctx.ellipse(0,0,13,18,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#604335";ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff1ca";ctx.lineWidth=.8;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-6,i*1.5);ctx.lineTo(35,i*1.5);ctx.stroke();}ctx.restore();}
 ctx.restore();
}
export function roomAlbumSnapshot(g){const a=g.roomAlbums?.[g.roomId];return {room:g.roomId,count:a?.found.length||0,total:100,relic:!!a?.relic,scene:g.relicScene?{...g.relicScene}:null};}
