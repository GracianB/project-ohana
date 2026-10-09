// OHANA Contest · compact Canvas twin shrines; only drawn in online mode.
import {DUO_ALTARS,DUO_CUES,duoPlateState,DUO_HOLD_MS} from "../multiplayer/duo-altars.js";
const TAU=Math.PI*2;
export function drawDuoAltars(ctx,game,remote,snapshot,t=0,reduce=false){
 const room=game?.roomId,altar=DUO_ALTARS[room];
 if(!ctx||!altar||!game?.player)return;
 const completed=!!snapshot?.duoAltars?.[room];
 const players=[{x:game.player.x,y:game.player.y,health:game.player.health,connected:true,worldRoomId:room,lastSeenAt:0}];
 if(remote?.playerId)players.push({x:remote.x,y:remote.y,health:remote.health,connected:true,worldRoomId:remote.worldRoomId||room,lastSeenAt:0});
 const visual=duoPlateState(players,room,0,1);
 const padY=1128-(game.cam?.y||0);
 const channel=snapshot?.duoCharge?.roomId===room && visual?.ready&&!completed?snapshot.duoCharge:null;
 const charged=channel?Math.max(0,Math.min(1,(Date.now()-channel.startedAt)/(channel.durationMs||DUO_HOLD_MS))):0;
 ctx.save();
 for(let i=0;i<2;i++){
  const x=altar.pads[i]-(game.cam?.x||0);
  if(x< -80||x>(Number(game.viewW)||2800)+80)continue;
  const active=completed||!!visual?.occupied?.[i];
  const r=active?31:25,alpha=reduce?0.78:0.74+Math.sin(t*.06+i*1.7)*.08;
  ctx.save();ctx.translate(x,padY);ctx.globalAlpha=alpha;
  ctx.lineWidth=active?4:2.5;ctx.strokeStyle=active?"#fff0b0":altar.color;
  ctx.fillStyle=active?"rgba(255,232,159,.26)":"rgba(17,32,45,.55)";
  ctx.beginPath();ctx.ellipse(0,0,r,12,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-9,-9);ctx.lineTo(0,-22);ctx.lineTo(9,-9);ctx.stroke();
  ctx.textAlign="center";ctx.fillStyle=completed?"#fff5bc":altar.color;
  ctx.font="800 11px Outfit, sans-serif";
  ctx.fillText(completed?"✦":String(i+1),0,-31);
  ctx.restore();
 }
 const mid=(altar.pads[0]+altar.pads[1])/2-(game.cam?.x||0);
 if(mid> -200&&mid<(Number(game.viewW)||2800)+200&&charged>0&&!completed){
   const barWidth=116;
   ctx.fillStyle="rgba(8,22,35,.8)";
   ctx.fillRect(mid-barWidth/2,padY-88,barWidth,7);
   ctx.fillStyle=altar.color;
   ctx.fillRect(mid-barWidth/2,padY-88,barWidth*charged,7);
   if(!reduce){
     ctx.strokeStyle=altar.color;ctx.globalAlpha=.32;
     ctx.beginPath();ctx.arc(mid,padY-74,15+Math.sin(t*.12)*3,0,TAU);ctx.stroke();
   }
 }
 ctx.textAlign="center";ctx.font="800 12px Outfit, sans-serif";
 ctx.fillStyle=completed?"#fff7c8":altar.color;
 ctx.globalAlpha=.9;
 ctx.fillText(completed?"✦ "+altar.name.toUpperCase()+" · COMPLETADO":charged>0?"✦ VÍNCULO DE DOS · "+Math.floor(charged*100)+"%":visual?.ready?"✦ MANTENED AMBAS PLACAS":"✦ "+altar.name.toUpperCase()+" · DOS PLACAS",mid,padY-66);
 ctx.font="600 10px Outfit, sans-serif";
 ctx.globalAlpha=.82;
 ctx.fillText(DUO_CUES[room]||"Dos héroes, un mundo",mid,padY-53);
 ctx.restore();
}
