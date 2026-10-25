export const PIZZA_FIRST_BAKE='w1-pizza-first-bake-v1';
export const PIZZA_ROUTE_TICKS=1050;
export const pizzaBaked=g=>!!g.secrets?.['w1-pizza']?.includes(PIZZA_FIRST_BAKE);
export function pizzaOvens(g){
 if(!g.roomDef?.pizzaChapter)return [];
 const stations=g.world1?.stations||[],base=stations.find(s=>s.kind==='oven');
 return [base,...[{id:'relay1',x:4320,after:1},{id:'relay2',x:5920,after:2}].filter(o=>stations.some(s=>s.id===o.after&&s.done)).map(o=>({...o,y:1134,kind:'oven'}))].filter(Boolean);
}
export function nearestPizzaOven(g){return pizzaOvens(g).sort((a,b)=>Math.abs(a.x-g.player.x)-Math.abs(b.x-g.player.x))[0];}
export function notePizzaBake(g){
 if(!g.roomDef?.pizzaChapter||pizzaBaked(g))return;
 g.secrets||={};g.secrets['w1-pizza']||=[];g.secrets['w1-pizza'].push(PIZZA_FIRST_BAKE);g.player.xp=Math.max(g.player.xp||0,55);g.save?.();
}
export function drawPizzaOven(ctx,s,cam,relay=false){
 const x=s.x-cam.x,y=s.y-cam.y;ctx.save();ctx.fillStyle='#d9aa87';ctx.strokeStyle='#805d50';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-60,y);ctx.lineTo(x-60,y-45);ctx.bezierCurveTo(x-64,y-139,x+64,y-139,x+60,y-45);ctx.lineTo(x+60,y);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#f5d5af';ctx.lineWidth=2;for(let row=0;row<3;row++){const yy=y-30-row*23;ctx.beginPath();ctx.moveTo(x-48,yy);ctx.quadraticCurveTo(x,yy-20,x+48,yy);ctx.stroke();}
 ctx.fillStyle='#4c3432';ctx.beginPath();ctx.ellipse(x,y-34,35,42,0,Math.PI,0);ctx.lineTo(x+35,y-9);ctx.lineTo(x-35,y-9);ctx.fill();
 for(let i=0;i<3;i++){ctx.fillStyle=['#e98d58','#ffc47c','#fff0bc'][i];ctx.beginPath();ctx.moveTo(x-24+i*6,y-13);ctx.bezierCurveTo(x-31,y-43,x+8,y-42-i*6,x+5,y-69+i*9);ctx.quadraticCurveTo(x+30-i*5,y-32,x+24-i*6,y-13);ctx.fill();}
 ctx.fillStyle='#f3e9ce';ctx.strokeStyle='#6e8272';ctx.beginPath();ctx.roundRect(x-82,y-166,164,25,7);ctx.fill();ctx.stroke();ctx.fillStyle='#4e6156';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(relay?'HORNO DE BARRIO · RECOGE':'PRIMER HORNEADO · RECOGE',x,y-149);ctx.restore();
}
export function drawPizzaCustomer(ctx,s,cam,done){
 const x=s.x-cam.x,y=s.y-cam.y;ctx.save();ctx.fillStyle='#d2b79b';ctx.strokeStyle='#7a6c61';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x-48,y-10,96,10,4);ctx.fill();ctx.stroke();
 ctx.fillStyle=['#8baba4','#bc927f','#9b92ad'][(s.id-1)%3];ctx.beginPath();ctx.moveTo(x-19,y-12);ctx.bezierCurveTo(x-27,y-48,x+27,y-48,x+19,y-12);ctx.fill();ctx.stroke();
 ctx.fillStyle='#f2cda9';ctx.beginPath();ctx.ellipse(x,y-62,19,22,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#725d55';ctx.beginPath();ctx.ellipse(x-2,y-81,20,9,-.15,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle='#394c48';for(const side of [-1,1]){ctx.beginPath();ctx.arc(x+side*6,y-62,2,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#946952';ctx.beginPath();ctx.arc(x,y-57,7,.2,Math.PI-.2);ctx.stroke();
 if(done){ctx.fillStyle='#efd4a1';ctx.strokeStyle='#a47756';ctx.beginPath();ctx.roundRect(x-28,y-38,56,12,3);ctx.fill();ctx.stroke();}
 ctx.fillStyle='#435d52';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(done?'REPARTO '+s.id+' ENTREGADO ✓':'CLIENTE '+s.id+' · PIZZA CALIENTE',x,y-110);ctx.restore();
}
export function drawPizzaChapter(ctx,g,cam){
 if(!g.roomDef?.pizzaChapter)return;
 for(const oven of pizzaOvens(g).filter(o=>o.id!=='0'&&o.id!==0))drawPizzaOven(ctx,oven,cam,true);
 const w=g.world1,p=g.player;if(w?.carry!=='pizza')return;
 const x=p.x+p.w/2-cam.x,y=p.y-cam.y-34,ratio=Math.max(0,Math.min(1,(w.pizzaUntil-w.tick)/PIZZA_ROUTE_TICKS));ctx.save();ctx.fillStyle='#f3deba';ctx.strokeStyle='#846e58';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x-22,y,44,12,3);ctx.fill();ctx.stroke();
 ctx.fillStyle='#3c5552';ctx.fillRect(x-40,y-15,80,5);ctx.fillStyle=ratio>.3?'#edba73':'#d18472';ctx.fillRect(x-40,y-15,80*ratio,5);ctx.fillStyle='#3c5552';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('CALIENTE · '+Math.ceil((w.pizzaUntil-w.tick)/60)+' s',x,y-23);ctx.restore();
}
