export const FRITA_FIRST_LAUNCH='w1-frita-first-launch-v1';
export const fritaLaunched=g=>!!g.secrets?.['w1-frita']?.includes(FRITA_FIRST_LAUNCH);
export function fritaVentState(tick,s){const phase=((tick+s.id*55)%180+180)%180;return phase<105?'ready':phase<150?'cooldown':'warn';}
export function noteFritaLaunch(g,s){
 if(!g.roomDef?.fritaChapter)return;
 g.world1.fritaSteered=false;g.world1.fritaLaunches=(g.world1.fritaLaunches||0)+1;
 if(fritaLaunched(g))return;g.secrets||={};g.secrets['w1-frita']||=[];g.secrets['w1-frita'].push(FRITA_FIRST_LAUNCH);g.player.xp=Math.max(g.player.xp||0,55);g.save?.();
}
export function yomiNodeState(g,s){
 const tick=g.world1?.tick||0,phase=((tick+(s.phase||0))%180+180)%180;
 if((g.world1?.yomiWindows?.[s.id]||0)>tick||phase<55)return 'live';return phase>=150?'warn':'wait';
}
export function fryerAstralAbility(g,p,index){
 const w=g.world1;if(!w||index!==0)return;
 if(g.roomDef?.fritaChapter&&p.id==='frita'&&!p.grounded&&w.launchedGeyser!=null&&!w.fritaSteered){p.vx=Math.max(-9,Math.min(9,(p.vx||0)+(p.facing||1)*4));p.vy=Math.min(p.vy||0,-4);w.fritaSteered=true;w.fritaAirCorrections=(w.fritaAirCorrections||0)+1;g.nums?.add?.(p.x,p.y-25,'J · CORRECCIÓN DE SAL','#fff0b9',true);}
 if(g.roomDef?.yomiChapter&&p.id==='yomi')for(const s of w.stations)if(!s.done&&Math.abs(p.x+p.w/2-s.x)<230&&Math.abs(p.y+p.h-s.y)<160&&yomiNodeState(g,s)==='live'){
  w.yomiWindows||={};w.yomiWindows[s.id]=w.tick+75;w.yomiWindowExtensions=(w.yomiWindowExtensions||0)+1;g.nums?.add?.(s.x,s.y-145,'J · VENTANA AMPLIADA','#a3e7d6',true);
 }
}
export function drawFritaVent(ctx,g,s,cam,done,t,reduce){
 const x=s.x-cam.x,y=s.y-cam.y,state=fritaVentState(g.world1.tick,s);ctx.save();ctx.fillStyle='#c3afa0';ctx.strokeStyle='#765e59';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y-7,52,13,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#6c6469';ctx.beginPath();ctx.ellipse(x,y-11,35,7,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=state==='ready'?'#f1ca7e':state==='warn'?'#f3e5ad':'#9cabb7';ctx.lineWidth=3;
 for(let i=0;i<3;i++){const rise=reduce?i/3:((t*.012+i/3)%1),yy=y-15-rise*(state==='ready'?95:45);ctx.globalAlpha=1-rise;ctx.beginPath();ctx.moveTo(x-10+i*10,yy);ctx.bezierCurveTo(x-20+i*10,yy-14,x+6+i*10,yy-24,x-10+i*10,yy-34);ctx.stroke();}ctx.globalAlpha=1;
 ctx.fillStyle='#f2dfb0';ctx.strokeStyle='#8e6d51';const px=s.prize.x-cam.x,py=s.prize.y-cam.y+(reduce?0:Math.sin(t*.05)*3);ctx.beginPath();ctx.ellipse(px,py,16,22,.25,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#a88a5c';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(px-6+i*4,py-7+i%2*12,1.7,2,0,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle='#f5e7c6';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(done?'PREMIO '+(s.id+1)+' RECOGIDO ✓':state==='ready'?'PISA · DIRIGE EL VUELO · J CORRIGE':state==='warn'?'PREPÁRATE · A PUNTO DE SALIR':'GÉISER RECARGANDO',x,y-130);ctx.restore();
}
export function drawYomiTerminal(ctx,g,s,cam,done,t,reduce){
 const x=s.x-cam.x,y=s.y-cam.y,state=yomiNodeState(g,s),color=done?'#dce9ab':state==='live'?'#9ee3ce':state==='warn'?'#f1d9aa':'#95b2c2';ctx.save();ctx.fillStyle='#7d99a3';ctx.strokeStyle='#466872';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-28,y);ctx.quadraticCurveTo(x-12,y-28,x-17,y-48);ctx.lineTo(x+17,y-48);ctx.quadraticCurveTo(x+12,y-28,x+28,y);ctx.fill();ctx.stroke();
 ctx.fillStyle='#c2d8d9';ctx.beginPath();ctx.roundRect(x-47,y-119,94,72,16);ctx.fill();ctx.stroke();ctx.fillStyle='#344f65';ctx.beginPath();ctx.roundRect(x-37,y-109,74,47,10);ctx.fill();
 ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-25,y-84);ctx.bezierCurveTo(x-10,y-112,x+6,y-65,x+25,y-90);ctx.stroke();
 for(let i=-1;i<=1;i++){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+i*21,y-54,3,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle='#8bb9bd';ctx.beginPath();ctx.moveTo(x,y-119);ctx.lineTo(x,y-147);ctx.stroke();ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y-150,7,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#e0e8df';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(done?'NODO '+(s.id+1)+' CONECTADO ✓':state==='live'?'AHORA · ACÉRCATE · J PROLONGA':state==='warn'?'PREPARANDO LA VENTANA':'ESPERA · PROTÉGETE CON K',x,y-176);
 ctx.restore();
}
