// V303: a playable storm, with Michi chasing nine electrical tail wisps.
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n)),valid=n=>Number.isFinite(n)&&Math.abs(n)<=20000;
export function readChispinDuet(s){
 if(!s||![s.x,s.y].every(valid)||!Number.isInteger(s.age)||s.age<0||s.age>=120||!Number.isInteger(s.evo)||s.evo<0||s.evo>4||![-1,1].includes(s.facing))return null;
 const tails=s.tails||[],bolts=s.bolts||[];
 if(!Array.isArray(tails)||tails.length>9||tails.some(b=>!b||![b.x,b.y].every(valid)||!Number.isInteger(b.idx)||b.idx<0||b.idx>8||!Number.isFinite(b.life)||b.life<0||b.life>48)||!Array.isArray(bolts)||bolts.length>3||bolts.some(b=>!b||![b.x,b.y].every(valid)||!Number.isFinite(b.life)||b.life<0||b.life>12))return null;
 return {x:s.x,y:s.y,age:s.age,evo:s.evo,facing:s.facing,tails:tails.map(b=>({x:b.x,y:b.y,idx:b.idx,life:b.life})),bolts:bolts.map(b=>({x:b.x,y:b.y,life:b.life}))};
}
export function chispinDuetPose(s){const jump=s.age>=18&&s.age<36?Math.sin((s.age-18)/18*Math.PI)*48:0;return {cloudX:s.x,cloudY:s.y-145,catX:s.x-s.facing*(76+Math.min(1,s.age/18)*10),catY:s.y-jump,range:220+20*s.evo,beat:s.age<18?'arrival':s.age<36?'chase':s.age<104?'conduction':'farewell'};}
export function startChispinDuet(g,power=1){const p=g.player;if(!p||p.dead||p.id!=='chispin')return false;g._chispinDuet={x:p.x+p.w/2,y:p.y+p.h,age:0,evo:clamp(Math.floor(Number(p.evo)||0),0,4),facing:p.facing===-1?-1:1,power:clamp(Number(power)||1,1,2),tails:[],bolts:[]};return true;}
export function updateChispinDuet(g,hit){
 const s=g._chispinDuet,p=g.player;if(!s){if(p)p._chispinDuetT=0;return;}
 if(!p||p.dead||p.id!=='chispin'||s.age>=120){g._chispinDuet=null;if(p)p._chispinDuetT=0;if(g._assist?.heroId==='cat')g._assist.t=0;return;}
 s.x=p.x+p.w/2;s.y=p.y+p.h;const pose=chispinDuetPose(s),damage=(70+s.evo*14)*s.power;
 const alive=e=>e&&e.hp>0&&!e.dying&&!e.fell;
 const targets=(g.enemies||[]).filter(e=>alive(e)&&Math.hypot(e.x+e.w/2-s.x,e.y+e.h/2-(s.y-25))<=pose.range).sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x));
 s.bolts=s.bolts.map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);
 if(s.age>=36&&s.age<=84&&(s.age-36)%6===0){const idx=(s.age-36)/6,a=-1.2+idx*.3;s.tails.push({x:pose.catX,y:pose.catY-28,idx,life:48,vx:Math.cos(a)*s.facing*9,vy:Math.sin(a)*9,target:targets.length?targets[idx%targets.length]:null});}
 for(const b of s.tails){
  if((g.enemies||[]).includes(b.target)&&alive(b.target)&&Math.hypot(b.target.x+b.target.w/2-s.x,b.target.y+b.target.h/2-(s.y-25))<=pose.range){const dx=b.target.x+b.target.w/2-b.x,dy=b.target.y+b.target.h/2-b.y,d=Math.hypot(dx,dy);if(d<=12+Math.min(b.target.w,b.target.h)/2){hit(g,b.target,damage*.06,{color:'#ff9ce8',stun:22,kx:s.facing*2,ky:-2,hitstop:0,shake:0});b.life=0;}else{b.vx=dx/d*12;b.vy=dy/d*12;}}
  else b.target=null;
  b.x+=b.vx;b.y+=b.vy;b.life--;
 }
 s.tails=s.tails.filter(b=>b.life>0);
 if([42,66,90].includes(s.age))for(const e of targets.slice(0,3))if(hit(g,e,damage*.18,{color:'#fff29a',stun:32,kx:s.facing*2,ky:-3,hitstop:0,shake:1}))s.bolts.push({x:e.x+e.w/2,y:e.y+e.h/2,life:12});
 p._chispinDuetAge=s.age;p._chispinDuetT=120-s.age;if(g._assist?.heroId==='cat')g._assist.t=120-s.age;s.age++;
}
export function drawChispinDuet(ctx,value,cam,t,drawActor,roster,reduce=false){
 const s=readChispinDuet(value);if(!s)return;const pose=chispinDuetPose(s),x=s.x-cam.x,y=s.y-cam.y,cx=pose.cloudX-cam.x,cy=pose.cloudY-cam.y;
 ctx.save();ctx.globalAlpha*=s.age>108?(120-s.age)/12:1;
 ctx.fillStyle='#6c548f';ctx.strokeStyle='#291e46';ctx.lineWidth=3;
 ctx.beginPath();for(const [dx,dy,r] of [[-26,0,20],[0,-10,27],[26,0,20]]){ctx.moveTo(cx+dx+r,cy+dy);ctx.arc(cx+dx,cy+dy,r,0,Math.PI*2);}ctx.fill();ctx.stroke();
 const def=roster.find(r=>r.id==='cat'),form=def?.forms?.[s.evo];
 if(def&&form)drawActor(ctx,{...def,...form,id:'cat',evo:s.evo,x:pose.catX-form.w/2,y:pose.catY-form.h,facing:s.facing,vx:s.age<36?s.facing*2:0,vy:0,grounded:true,visualScale:.58,_duetActor:true},cam,t);
 // Nine curved conductors grow from the helper, then release homing wisps.
 if(s.age>=24&&s.age<104)for(let i=0;i<9;i++){const a=-1.25+i*.31,rx=pose.catX-cam.x,ry=pose.catY-cam.y-22,len=26+6*s.evo;ctx.strokeStyle=['#d7b0ff','#ff9ce8','#fff29a'][i%3];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(rx,ry);ctx.quadraticCurveTo(rx-s.facing*18,ry-35,rx+Math.cos(a)*len*s.facing,ry+Math.sin(a)*len);ctx.stroke();}
 for(const b of s.tails){const bx=b.x-cam.x,by=b.y-cam.y;ctx.fillStyle=['#d7b0ff','#ff9ce8','#fff29a'][b.idx%3];ctx.beginPath();ctx.ellipse(bx,by,7,4,reduce?0:t*.08+b.idx,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();}
 for(const b of s.bolts){ctx.strokeStyle='#fff29a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy+10);for(let i=1;i<=6;i++){const k=i/6;ctx.lineTo(cx+(b.x-cam.x-cx)*k+(i<6?(i%2?7:-7):0),cy+10+(b.y-cam.y-cy-10)*k);}ctx.stroke();}
 if(pose.beat==='chase'){ctx.fillStyle='#fff29a';ctx.beginPath();ctx.arc(x-45*s.facing,y-88,5,0,Math.PI*2);ctx.fill();ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.fillText('¡Eso no es un ovillo!',x,y-185);}
 if(pose.beat==='farewell'){ctx.strokeStyle='#ff9ce8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pose.catX-cam.x,pose.catY-cam.y-50,12,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}

// Only visual fields cross the network; no targets, damage or hit sets.
export function readChispinEffects(list){
 if(!Array.isArray(list)||list.length>8)return null;const out=[];
 for(const f of list){if(!f||!['chain','trail','storm'].includes(f.kind)||!Number.isFinite(f.life)||f.life<=0||f.life>260)return null;
 const v={kind:f.kind,life:f.life};
 if(f.kind==='chain'){if(!Array.isArray(f.pts)||f.pts.length<2||f.pts.length>6||f.pts.some(b=>!b||![b.x,b.y].every(valid)))return null;v.pts=f.pts.map(b=>({x:b.x,y:b.y}));}
 if(f.kind==='trail'){if(![f.x1,f.y1,f.x2,f.y2].every(valid))return null;for(const k of ['x1','y1','x2','y2'])v[k]=f[k];}
 if(f.kind==='storm'){if(![f.x,f.y].every(valid)||!Array.isArray(f.bolts)||f.bolts.length>3||f.bolts.some(b=>!b||![b.x,b.y1,b.y2].every(valid)||!Number.isFinite(b.life)||b.life<=0||b.life>10))return null;v.x=f.x;v.y=f.y;v.next=clamp(Number(f.next)||0,0,20);v.bolts=f.bolts.map(b=>({x:b.x,y1:b.y1,y2:b.y2,life:b.life}));}out.push(v);
 }return out;
}
