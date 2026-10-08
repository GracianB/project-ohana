
import { ROOMS } from "../systems/map.js";

const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const unit=(seed)=>{const x=Math.sin(Number(seed)*12.9898+78.233)*43758.5453123;return x-Math.floor(x);};

export const ROOM_ART = Object.freeze({
  hub:Object.freeze({hero:"kilo",accent:"#ffd36a",secondary:"#ff9ad8",mood:"bloom"}),
  beach:Object.freeze({hero:"frita",accent:"#ffd36a",secondary:"#74e7ff",mood:"speed"}),
  jungle:Object.freeze({hero:"stitcho",accent:"#7edfff",secondary:"#8ee58a",mood:"stitch"}),
  cave:Object.freeze({hero:"cat",accent:"#ffb6e4",secondary:"#a9b9ff",mood:"moon"}),
  lab:Object.freeze({hero:"chispin",accent:"#ffe14a",secondary:"#7ee7ff",mood:"storm"}),
  ridge:Object.freeze({hero:"cuerno",accent:"#fff6c8",secondary:"#9fdcff",mood:"aurora"}),
  space:Object.freeze({hero:"yomi",accent:"#ff5b78",secondary:"#b690ff",mood:"void"}),
  reef:Object.freeze({hero:"pizza",accent:"#ff9a52",secondary:"#67e8ff",mood:"coral"}),
  volcano:Object.freeze({hero:"dragon",accent:"#ff6b3d",secondary:"#ffd36a",mood:"thermal"}),
  boss:Object.freeze({hero:"dino",accent:"#c8f04a",secondary:"#ff8a5b",mood:"seismic"}),
});

export function livingWorldSnapshot(roomId="",heroId=""){
  const art=ROOM_ART[roomId]||ROOM_ART.hub;
  return Object.freeze({roomId,hero:art.hero,mood:art.mood,affinity:String(heroId)===art.hero,accent:art.accent,secondary:art.secondary});
}

function visibleWorldX(cam,viewW,pad=220){return [Math.max(0,cam.x-pad),cam.x+viewW+pad];}

function petals(ctx,game,t,art,boost,viewW,viewH){
  const [a,b]=visibleWorldX(game.cam,viewW);
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  for(let i=0;i<28;i++){
    const wx=a+unit(i*7.7+11)*(b-a);
    const base=unit(i*13.1+3)*viewH*.82+80;
    const y=base+Math.sin(t*.018+i)*18-game.cam.y;
    const x=wx-game.cam.x;
    const s=2.4+unit(i*5.9)*3.2;
    ctx.globalAlpha=(.16+unit(i*2.1)*.3)*boost;
    ctx.fillStyle=i%3===0?art.secondary:art.accent;
    ctx.save();ctx.translate(x,y);ctx.rotate(t*.01+i);
    ctx.beginPath();ctx.ellipse(0,0,s,s*.45,0,0,TAU);ctx.fill();ctx.restore();
  }
  ctx.restore();
}

function speedCoast(ctx,game,t,art,boost,viewW,viewH){
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  for(let i=0;i<10;i++){
    const y=viewH*(.18+i*.065)+Math.sin(t*.025+i)*9;
    const phase=((t*2.2+i*91)%(viewW+260))-130;
    const len=90+(i%3)*55;
    const g=ctx.createLinearGradient(phase,y,phase+len,y);
    g.addColorStop(0,"rgba(255,255,255,0)");
    g.addColorStop(.45,i%2?art.secondary:art.accent);
    g.addColorStop(1,"rgba(255,255,255,0)");
    ctx.globalAlpha=(.08+i*.008)*boost;
    ctx.strokeStyle=g;ctx.lineWidth=2+(i%2);
    ctx.beginPath();ctx.moveTo(phase,y);ctx.lineTo(phase+len,y+Math.sin(i)*3);ctx.stroke();
  }
  ctx.restore();
}

function stitchedJungle(ctx,game,t,art,boost,viewW,viewH){
  ctx.save();
  for(let i=0;i<12;i++){
    const x=(i/11)*viewW+Math.sin(i*2.2)*24;
    const sway=Math.sin(t*.018+i)*18;
    ctx.globalAlpha=(.14+(i%3)*.035)*boost;
    ctx.strokeStyle=i%2?art.secondary:art.accent;
    ctx.lineWidth=1.4+(i%3)*.5;
    ctx.setLineDash([7,6]);
    ctx.beginPath();
    ctx.moveTo(x,-20);
    ctx.bezierCurveTo(x+sway,viewH*.28,x-sway,viewH*.52,x+sway*.5,viewH*.78);
    ctx.stroke();
    ctx.setLineDash([]);
    for(let k=0;k<4;k++){
      const y=viewH*(.18+k*.16)+Math.sin(t*.02+i+k)*8;
      ctx.globalAlpha=.12*boost;
      ctx.beginPath();ctx.ellipse(x+sway*.2,y,16,5,.4,0,TAU);ctx.stroke();
    }
  }
  ctx.restore();
}

function lunarCave(ctx,game,t,art,boost,viewW,viewH){
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  for(let i=0;i<16;i++){
    const x=unit(i*17.2+5)*viewW;
    const y=80+unit(i*9.4+2)*viewH*.7;
    const h=24+unit(i*3.7)*54;
    ctx.globalAlpha=(.09+unit(i*4.1)*.18)*boost;
    const g=ctx.createLinearGradient(x,y-h,x,y+h);
    g.addColorStop(0,"rgba(255,255,255,.85)");
    g.addColorStop(.45,i%2?art.secondary:art.accent);
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(x,y-h);ctx.lineTo(x+8,y);ctx.lineTo(x,y+h);ctx.lineTo(x-8,y);ctx.closePath();ctx.fill();
  }
  for(let i=0;i<4;i++){
    const x=viewW*(.18+i*.22),y=viewH*(.36+(i%2)*.16);
    const blink=.2+.8*Math.max(0,Math.sin(t*.035+i*1.7));
    ctx.globalAlpha=.1*blink*boost;ctx.fillStyle="#fff";
    ctx.beginPath();ctx.ellipse(x,y,8,2.3,0,0,TAU);ctx.fill();
  }
  ctx.restore();
}

function stormLab(ctx,game,t,art,boost,viewW,viewH){
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  for(let i=0;i<7;i++){
    const x=viewW*(.10+i*.14);
    const y=viewH*(.18+(i%3)*.16)+Math.sin(t*.025+i)*8;
    ctx.globalAlpha=.11*boost;
    ctx.fillStyle=i%2?art.secondary:"#fff6b0";
    for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(x+k*10,y+Math.sin(k)*5,13-k,0,TAU);ctx.fill();}
    ctx.globalAlpha=.25*boost;
    ctx.strokeStyle=art.accent;ctx.lineWidth=1.4;
    const phase=(t+i*11)%28;
    ctx.beginPath();ctx.moveTo(x+14,y+10);ctx.lineTo(x+8+phase*.25,y+22);ctx.lineTo(x+16,y+28);ctx.lineTo(x+8,y+42);ctx.stroke();
  }
  ctx.restore();
}

function auroraRidge(ctx,game,t,art,boost,viewW,viewH){
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  const colors=["#ffb3d9","#ffe6a0","#9fe8ff","#bfa2ff"];
  for(let i=0;i<4;i++){
    ctx.globalAlpha=(.08+i*.018)*boost;
    ctx.strokeStyle=colors[i];ctx.lineWidth=8-i;
    ctx.beginPath();
    for(let x=-40;x<=viewW+40;x+=60){
      const y=viewH*(.18+i*.035)+Math.sin(x*.006+t*.012+i)*22;
      if(x===-40)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function voidSpace(ctx,game,t,art,boost,viewW,viewH){
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  for(let i=0;i<26;i++){
    const x=unit(i*13.4+7)*viewW,y=unit(i*21.2+2)*viewH*.78+30;
    const tw=.3+.7*Math.max(0,Math.sin(t*.028+i));
    ctx.globalAlpha=.08+.16*tw*boost;
    ctx.fillStyle=i%3?art.secondary:"#fff";
    ctx.beginPath();ctx.arc(x,y,1+(i%3),0,TAU);ctx.fill();
  }
  for(let i=0;i<3;i++){
    const x=viewW*(.25+i*.27),y=viewH*(.32+(i%2)*.2);
    const r=38+i*16+Math.sin(t*.02+i)*6;
    ctx.globalAlpha=.08*boost;ctx.strokeStyle=i%2?art.secondary:art.accent;ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(x,y,r,r*.36,t*.01+i,0,TAU);ctx.stroke();
  }
  ctx.restore();
}

function coralReef(ctx,game,t,art,boost,viewW,viewH){
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  for(let i=0;i<18;i++){
    const x=unit(i*10.7+3)*viewW,y=viewH-(unit(i*4.3+1)*180+30);
    const h=28+unit(i*7.1)*72;
    ctx.globalAlpha=.12*boost;ctx.strokeStyle=i%2?art.accent:art.secondary;ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(x,viewH+10);ctx.quadraticCurveTo(x-14,y+h*.5,x,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x,y+h*.45);ctx.lineTo(x+18,y+h*.25);ctx.stroke();
  }
  for(let i=0;i<12;i++){
    const x=unit(i*8.2+4)*viewW,y=viewH-40-((t*(.4+i*.03)+i*83)%(viewH*.75));
    ctx.globalAlpha=.08+.07*boost;ctx.strokeStyle="#d8fbff";ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(x,y,3+(i%4)*2,0,TAU);ctx.stroke();
  }
  ctx.restore();
}

function thermalVolcano(ctx,game,t,art,boost,viewW,viewH){
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  for(let i=0;i<8;i++){
    const x=viewW*(.08+i*.13)+Math.sin(i)*18;
    const base=viewH*.94;
    const h=180+(i%3)*80;
    const g=ctx.createLinearGradient(x,base,x,base-h);
    g.addColorStop(0,"rgba(255,90,40,.28)");
    g.addColorStop(.45,"rgba(255,190,80,.10)");
    g.addColorStop(1,"rgba(255,255,255,0)");
    ctx.globalAlpha=.32*boost;ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(x-26,base);ctx.quadraticCurveTo(x+Math.sin(t*.02+i)*30,base-h*.52,x,base-h);ctx.quadraticCurveTo(x-26,base-h*.5,x+26,base);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}

function seismicBoss(ctx,game,t,art,boost,viewW,viewH){
  ctx.save();
  const y=viewH*.82;
  for(let i=0;i<9;i++){
    const x=i/8*viewW;
    ctx.globalAlpha=.12*boost;ctx.strokeStyle=i%2?art.accent:art.secondary;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x,y);
    ctx.lineTo(x+22,y-12-(i%3)*10);
    ctx.lineTo(x+38,y+5);
    ctx.lineTo(x+62,y-8);
    ctx.stroke();
  }
  const pulse=.5+.5*Math.sin(t*.05);
  ctx.globalAlpha=.04+.05*pulse*boost;ctx.fillStyle=art.accent;
  ctx.fillRect(0,y-3,viewW,6);
  ctx.restore();
}

const DRAW=Object.freeze({
  hub:petals,beach:speedCoast,jungle:stitchedJungle,cave:lunarCave,lab:stormLab,
  ridge:auroraRidge,space:voidSpace,reef:coralReef,volcano:thermalVolcano,boss:seismicBoss,
});

export function drawLivingWorld(ctx,game,t=0,viewW=1280,viewH=720){
  if(!ctx||!game)return;
  const roomId=String(game.roomId||"hub");
  const art=ROOM_ART[roomId]||ROOM_ART.hub;
  const p=game.player;
  const affinity=!!p && String(p.id)===art.hero;
  const boost=affinity?1.65:1;
  const fn=DRAW[roomId]||DRAW.hub;
  fn(ctx,game,t,art,boost,viewW,viewH);

  if(affinity){
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    ctx.globalAlpha=.045+.025*Math.sin(t*.04);
    const g=ctx.createRadialGradient(viewW*.5,viewH*.48,20,viewW*.5,viewH*.48,Math.max(viewW,viewH)*.65);
    g.addColorStop(0,art.accent);g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g;ctx.fillRect(0,0,viewW,viewH);ctx.restore();
  }
}
