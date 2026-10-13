// OHANA V344 · Dragón's personal welcome. A deterministic stage performance,
// separate from abilities, cooldowns, physics, health and online replication.
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{const k=clamp(v);return k*k*(3-2*k);};
const rise=(t,a,b)=>ease((t-a)/(b-a));
const fall=(t,a,b)=>1-rise(t,a,b);
const pulse=(t,a,b,c,d)=>rise(t,a,b)*fall(t,c,d);

export const DRAGON_WELCOME_BEATS=Object.freeze({
  inhale:Object.freeze([2.62,2.90,3.17,3.37]),
  sneeze:Object.freeze([3.32,3.49,3.58,3.81]),
  recoil:Object.freeze([3.61,3.75,3.95,4.13]),
  proud:Object.freeze([4.08,4.27,4.60,4.88])
});

/** Every state is analytic, repeatable and bounded. No timers or randomness. */
export function dragonWelcomeBeat(seconds, reduceMotion=false){
  const raw=Number.isFinite(seconds)?seconds:0;
  // A shared 14-second time base keeps idle breathing and the acted beats
  // seamless and exactly repeatable at each new welcome loop.
  const time=Math.round((((raw%14)+14)%14)*10000)/10000;
  const inhale=pulse(time,...DRAGON_WELCOME_BEATS.inhale);
  const sneeze=pulse(time,...DRAGON_WELCOME_BEATS.sneeze);
  const recoil=pulse(time,...DRAGON_WELCOME_BEATS.recoil);
  const proud=pulse(time,...DRAGON_WELCOME_BEATS.proud);
  const breath=(1+Math.sin(time*TAU*5/14))*.5;
  const phase=sneeze>.17?"sneeze":recoil>.25?"recoil":inhale>.17?"inhale":proud>.25?"proud":"idle";
  if(reduceMotion)return Object.freeze({
    phase:"idle",inhale:0,sneeze:0,recoil:0,proud:.22,
    breath:.5,wing:0,tail:0,glow:.12,reduced:true
  });
  return Object.freeze({
    phase,inhale,sneeze,recoil,proud,breath,
    wing:clamp(.22+.15*Math.sin(time*TAU*6/14)+inhale*.42+sneeze*.42+proud*.28),
    tail:clamp(.34*Math.sin(time*TAU*4/14)+recoil*.66-proud*.25,-1,1),
    glow:clamp(.10+sneeze*.9+proud*.36),
    reduced:false
  });
}

/** Stage lighting and a tiny breath of fire: no damage or interaction. */
export function drawDragonWelcomeFX(ctx,x,foot,height,seconds,beat,layer="front"){
  if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
  const h=height,t=seconds;
  ctx.save();
  if(layer==="back"){
    // Warm, restrained light behind the wings makes the dragon read against
    // a dark shoreline, without the huge generic hero aura.
    const a=.10+beat.glow*.20;
    const gx=x+h*.06,gy=foot-h*.51;
    const grd=ctx.createRadialGradient(gx,gy,0,gx,gy,h*.62);
    grd.addColorStop(0,"rgba(255,201,109,"+a+")");
    grd.addColorStop(.55,"rgba(255,125,59,"+(a*.36)+")");
    grd.addColorStop(1,"rgba(255,125,59,0)");
    ctx.fillStyle=grd;
    ctx.beginPath();ctx.arc(gx,gy,h*.62,0,TAU);ctx.fill();
    ctx.globalAlpha=.22+beat.breath*.09+beat.proud*.14;
    ctx.strokeStyle="#ffd6a0";ctx.lineWidth=1.7;
    ctx.beginPath();ctx.ellipse(x,foot+4,h*.27,h*.065,0,0,TAU);ctx.stroke();
  }else if(layer==="front"){
    if(!beat.reduced){
      // Cartoon inhalation curls, then a tiny incandescent sneeze with
      // escaping embers. Anchored to the hero's snout, not the viewport.
      const noseX=x+h*.30,noseY=foot-h*.64;
      if(beat.inhale>.08){
        ctx.globalAlpha=.18+beat.inhale*.47;
        ctx.strokeStyle="#ffe2bd";ctx.lineWidth=1.8;ctx.lineCap="round";
        for(let i=0;i<2;i++){
          const dx=h*(.18+i*.11),dy=h*(-.08+i*.12);
          ctx.beginPath();ctx.arc(noseX+dx,noseY+dy,h*(.065+i*.012),
            -Math.PI*.25,Math.PI*.92);ctx.stroke();
        }
      }
      if(beat.sneeze>.01){
        const k=beat.sneeze,size=h*(.09+.17*k);
        const fx=noseX+h*.12+k*h*.10,fy=noseY+h*.035;
        ctx.globalCompositeOperation="lighter";
        const flame=ctx.createRadialGradient(fx,fy,0,fx,fy,size*1.7);
        flame.addColorStop(0,"rgba(255,253,211,"+(.85*k)+")");
        flame.addColorStop(.35,"rgba(255,184,56,"+(.85*k)+")");
        flame.addColorStop(.72,"rgba(255,90,33,"+(.55*k)+")");
        flame.addColorStop(1,"rgba(255,90,33,0)");
        ctx.fillStyle=flame;
        ctx.beginPath();ctx.ellipse(fx,fy,size*1.7,size*.9,-.19,0,TAU);ctx.fill();
        for(let i=0;i<4;i++){
          const a=-.65+i*.39,travel=.35+.65*k;
          const px=fx+Math.cos(a)*size*(1+i*.45)*travel;
          const py=fy+Math.sin(a)*size*(1+i*.45)*travel;
          ctx.fillStyle=i%2?"#fff6ce":"#ffae58";
          ctx.globalAlpha=k*(.75-i*.10);
          ctx.beginPath();ctx.arc(px,py,Math.max(1.1,h*.012*(1-i*.1)),0,TAU);ctx.fill();
        }
      }
      if(beat.recoil>.06){
        ctx.globalCompositeOperation="source-over";
        ctx.strokeStyle="#f7e2d7";ctx.lineWidth=2;
        ctx.globalAlpha=beat.recoil*.52;
        for(let i=0;i<3;i++){
          const r=h*(.07+i*.05+beat.recoil*.05);
          ctx.beginPath();ctx.arc(noseX+h*.10,noseY-h*.02,r,-.55,1.05);ctx.stroke();
        }
      }
    }
    if(beat.proud>.05){
      // One calm final sparkle over the tail when the dragon regains dignity.
      ctx.globalCompositeOperation="lighter";
      ctx.globalAlpha=.50*beat.proud;
      const sx=x-h*.23,sy=foot-h*.78;
      ctx.strokeStyle="#ffe2a3";ctx.lineWidth=1.8;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(sx-h*.045,sy);ctx.lineTo(sx+h*.045,sy);
      ctx.moveTo(sx,sy-h*.045);ctx.lineTo(sx,sy+h*.045);ctx.stroke();
    }
  }
  ctx.restore();
}
