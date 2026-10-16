const IDS=['hub','beach','cave','lab','ridge','jungle','reef','space','volcano','boss'];
export function roomDimensions(room={},scale=1){
 const finite=(v,f)=>Number.isFinite(Number(v))?Number(v):f;
 const s=Math.max(.5,Math.min(2.2,finite(scale,1)));
 return {width:Math.round(Math.max(800,Math.min(9000,finite(room.width,2240)))*s),height:Math.round(Math.max(720,Math.min(6000,finite(room.height,1260)))*s)};
}
export function sanitizeCheckpoints(raw){
 const value={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return value;
 for(const id of IDS){const key=raw[id];if(typeof key==='string'&&/^[a-z0-9_-]{1,30}$/.test(key))value[id]=key;}
 return value;
}
export function roomCheckpoints(room,scale=1){
 const size=roomDimensions(room,scale);
 return (Array.isArray(room?.checkpoints)?room.checkpoints:[]).slice(0,6).filter(p=>p&&typeof p.id==='string'&&/^[a-z0-9_-]{1,30}$/.test(p.id)&&Number.isFinite(p.x)&&Number.isFinite(p.y)).map(p=>({id:p.id,label:String(p.label||'Punto de control').slice(0,60),x:Math.max(40,Math.min(size.width-80,p.x*scale)),y:Math.max(100,Math.min(size.height-80,p.y*scale))}));
}
export function checkpointAt(points,key){return points.find(p=>p.id===key)||points[0]||null;}
export function reachedCheckpoint(points,player){if(!player||player.dead||!player.grounded)return null;return points.find(p=>Math.abs(player.x+player.w/2-p.x)<55&&Math.abs(player.y+player.h-p.y)<35)||null;}
export function drawCheckpoints(ctx,points,current,cam){
 for(const p of points){const x=p.x-cam.x,y=p.y-cam.y;if(x<-50||x>ctx.canvas.width+50)continue;ctx.save();ctx.lineWidth=3;ctx.strokeStyle='#e6d3b2';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-56);ctx.stroke();ctx.fillStyle=current===p.id?'#a6e5bf':'#b8bec4';ctx.beginPath();ctx.moveTo(x,y-56);ctx.lineTo(x+30,y-46);ctx.lineTo(x,y-35);ctx.closePath();ctx.fill();ctx.restore();}
}
export const TRAINING_ROOM=Object.freeze({id:'hub',name:'Islote de pruebas',world:6,width:3000,height:1260,doors:{},hint:'Prueba las cinco formas, los poderes y la estrella. Tu partida y tu álbum permanecen intactos.',
 plats:[[0,810,3000,90],[300,680,220,20],[670,570,200,20],[1080,660,240,20],[1540,540,220,20],[2050,660,280,20]],
 foes:[[630,770,'cangrejo'],[1200,770,'cucaracho'],[1900,770,'cangrejo']],orbs:[],portals:[],stars:[[900,770]],
 checkpoints:[{id:'inicio',label:'Primer salto',x:180,y:810},{id:'combate',label:'Poderes en acción',x:1100,y:810},{id:'altura',label:'Movilidad avanzada',x:2200,y:810}]
});
