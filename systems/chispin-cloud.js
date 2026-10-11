// V287: Chispin's finite, steerable cloud after evolution 3.
// Trigger: hold jump while airborne, after exhausting ordinary jumps.
// Ground contact replenishes charge. It never changes collision geometry.
export function stepChispinCloud(player,input={}){
 if(!player)return false;
 const eligible=player.id==="chispin"&&(player.evo||0)>=2;
 if(!eligible){player._cloudFuel=0;player._cloudActive=false;return false;}
 const maxFuel=player.evo>=4?150:player.evo>=3?105:72;
 if(!Number.isFinite(player._cloudFuel))player._cloudFuel=maxFuel;
 if(player.grounded){player._cloudFuel=maxFuel;player._cloudActive=false;return false;}
 const active=!!input.jump&&player.jumps>=player.maxJumps&&player._cloudFuel>0&&
   !player.dead&&!player._dashGo&&!player._specialFlightT;
 player._cloudActive=active;
 if(!active)return false;
 player._cloudFuel=Math.max(0,player._cloudFuel-1);
 // Airborne steering remains under player's control; finite sustained descent.
 player.vy=Math.min(player.vy,player.evo>=4?0.48:0.85);
 if(input.left&&!input.right)player.vx=Math.max(-player.speed,player.vx-0.15);
 if(input.right&&!input.left)player.vx=Math.min(player.speed,player.vx+0.15);
 return true;
}
export function drawChispinCloud(ctx,p,cam,t){
 if(!p?._cloudActive)return;
 const x=p.x+p.w/2-(cam?.x||0);
 const y=p.y+p.h+3-(cam?.y||0);
 const w=Math.max(34,p.w+12);
 const bob=Math.sin(t/10)*1.2;
 ctx.save();ctx.globalAlpha=.93;
 ctx.fillStyle="#d7f7ff";ctx.strokeStyle="#70cfff";ctx.lineWidth=2;
 ctx.beginPath();
 ctx.ellipse(x,y+bob,w*.53,8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();
 ctx.arc(x-w*.22,y-2+bob,7,Math.PI,Math.PI*2);
 ctx.arc(x,y-5+bob,10,Math.PI,Math.PI*2);
 ctx.arc(x+w*.23,y-1+bob,7,Math.PI,Math.PI*2);
 ctx.fill();ctx.stroke();
 ctx.restore();
}
