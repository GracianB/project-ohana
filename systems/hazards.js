
export const HAZARD_TYPES = Object.freeze({
  TRANSFER: "transfer",
  DEATH: "death",
  RESCUE: "rescue",
});

export const ROOM_HAZARDS = Object.freeze({
  beach: Object.freeze([
    Object.freeze({ id:"reef-drop", type:"transfer", x:900, y:1040, w:440, h:260, dest:"reef", label:"ARRECIFE", color:"#6ee8ff" }),
  ]),
  jungle: Object.freeze([
    Object.freeze({ id:"caldera-drop", type:"transfer", x:900, y:1040, w:440, h:260, dest:"volcano", label:"CALDERA", color:"#ff9a52" }),
  ]),
  ridge: Object.freeze([
    Object.freeze({ id:"hub-drop-ridge", type:"transfer", x:900, y:1040, w:440, h:260, dest:"hub", label:"CLARO", color:"#d9f6ff" }),
  ]),
  space: Object.freeze([
    Object.freeze({ id:"hub-drop-space", type:"transfer", x:900, y:1040, w:440, h:260, dest:"hub", label:"CAÍDA ORBITAL", color:"#bf9cff" }),
  ]),
  volcano: Object.freeze([
    Object.freeze({ id:"magma-pit", type:"death", x:1080, y:1098, w:160, h:202, label:"MAGMA", color:"#ff5c36", heroEscape:"dragon" }),
  ]),
});

const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));

export function hazardsForRoom(roomId="") {
  return ROOM_HAZARDS[String(roomId)] || Object.freeze([]);
}

export function hazardAt(roomId, player) {
  if (!player) return null;
  const px=(Number(player.x)||0)+(Number(player.w)||0)/2;
  const py=(Number(player.y)||0)+(Number(player.h)||0);
  for (const h of hazardsForRoom(roomId)) {
    if (px > h.x && px < h.x+h.w && py > h.y && py < h.y+h.h) return h;
  }
  return null;
}

export function hazardContainsX(roomId, player) {
  if (!player) return null;
  const px=(Number(player.x)||0)+(Number(player.w)||0)/2;
  return hazardsForRoom(roomId).find((h)=>px>h.x&&px<h.x+h.w)||null;
}

export function hazardTrigger(roomId, player) {
  const h=hazardAt(roomId,player);
  if (!h || !player || Number(player.vy)<0) return null;
  const feet=(Number(player.y)||0)+(Number(player.h)||0);
  const depth=clamp((feet-h.y)/Math.max(1,h.h),0,1);
  if (depth < (h.type===HAZARD_TYPES.TRANSFER ? 0.34 : 0.46)) return null;
  return Object.freeze({...h,depth});
}

export function drawHazards(ctx, roomId, cam, t=0, reduceMotion=false) {
  if (!ctx || !cam) return;
  for (const h of hazardsForRoom(roomId)) {
    const x=h.x-cam.x,y=h.y-cam.y,w=h.w;
    const cx=x+w/2;
    const pulse=reduceMotion?0.5:(0.5+Math.sin(t*0.075+h.x*0.01)*0.5);
    ctx.save();

    const depth=ctx.createLinearGradient(0,y,0,y+h.h);
    if(h.type===HAZARD_TYPES.DEATH){
      depth.addColorStop(0,"rgba(20,4,8,.08)");
      depth.addColorStop(.22,"rgba(80,10,8,.58)");
      depth.addColorStop(1,"rgba(3,0,0,.98)");
    }else{
      depth.addColorStop(0,"rgba(0,18,28,.04)");
      depth.addColorStop(.22,"rgba(8,55,75,.42)");
      depth.addColorStop(1,"rgba(0,4,12,.96)");
    }
    ctx.fillStyle=depth;
    ctx.fillRect(x,y,w,h.h);

    ctx.globalCompositeOperation="lighter";
    ctx.globalAlpha=.28+.22*pulse;
    ctx.strokeStyle=h.color||"#7ee7ff";
    ctx.lineWidth=2;
    for(let i=0;i<4;i++){
      const yy=y+18+i*22+Math.sin(t*.08+i)*5;
      ctx.beginPath();
      ctx.moveTo(x+20,yy);
      ctx.quadraticCurveTo(cx,yy+12*Math.sin(t*.04+i),x+w-20,yy);
      ctx.stroke();
    }

    if(h.type===HAZARD_TYPES.DEATH){
      ctx.globalAlpha=.3+.2*pulse;
      ctx.fillStyle=h.color||"#ff5c36";
      for(let i=0;i<7;i++){
        const a=i/6*Math.PI;
        const px=cx+Math.cos(a)*w*.34;
        const py=y+44+Math.sin(t*.11+i)*8;
        ctx.beginPath();ctx.arc(px,py,3+(i%3),0,Math.PI*2);ctx.fill();
      }
    }else{
      ctx.globalAlpha=.38+.22*pulse;
      ctx.strokeStyle=h.color||"#7ee7ff";
      ctx.lineWidth=3;
      for(let i=0;i<2;i++){
        const yy=y+26+i*16;
        ctx.beginPath();
        ctx.moveTo(cx-18,yy);
        ctx.lineTo(cx,yy+10);
        ctx.lineTo(cx+18,yy);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
