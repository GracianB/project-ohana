// OHANA V312 · Movimiento y combate con vocabulario visual propio por héroe.
// Sólo Canvas. Ningún efecto aquí cambia la hitbox, vida, física o red.
// drawCharacter ya orienta el Canvas hacia la derecha; NO duplicar el facing.
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number.isFinite(v)?v:0));
const make=(type,colors,phrase)=>Object.freeze({type,colors:Object.freeze(colors),phrase});
export const KINETIC_IDENTITIES=Object.freeze({
 kilo:make("petals",["#ff9fc7","#ffed98","#fff6e9"],"Flores en compás"),
 stitcho:make("stitches",["#74e4fa","#83a6fc","#ffdbff"],"Costuras rebeldes"),
 chispin:make("sparks",["#fff18c","#f9ca38","#f6fbff"],"Electricidad traviesa"),
 cat:make("yarn",["#ffb9e0","#d9b7ff","#fff7dd"],"Ovillos fugaces"),
 dragon:make("embers",["#ff9a4b","#ffd46b","#fff8d0"],"Alas de fuego"),
 dino:make("fossils",["#c0ed84","#dfc6a6","#fff3ce"],"Pisadas jurásicas"),
 frita:make("salt",["#fff6c7","#fda970","#fffdf0"],"Sal y velocidad"),
 pizza:make("cheese",["#ffe48e","#ed7354","#fff8d0"],"Queso en el aire"),
 yomi:make("ofuda",["#f8dccd","#f38c9e","#b9a5ee"],"Ofuda entre sombras"),
 cuerno:make("prism",["#fff5c6","#eab4ff","#9befff"],"Luz de siete colores")
});
export const KINETIC_STAGES=Object.freeze(["landing","turn","brake","attack","air","run"]);
export function kineticSignature(p,pose,reduced=false){
 const identity=KINETIC_IDENTITIES[p?.id];
 if(!identity||!pose||p?.dead)return null;
 // Do not turn malformed remote/QA state into a huge Canvas animation.
 // Values produced by the normal rig are all normalized well below this bound.
 if(["impact","atk","land","turnPulse","brake","speed","vy"].some(key=>
  pose[key]!=null&&(!Number.isFinite(pose[key])||Math.abs(pose[key])>8)))return null;
 const form=clamp(Math.trunc(Number(p.evo)||0),0,4);
 const impact=clamp(Number(pose.impact)||0,0,1.2);
 const atk=clamp(Number(pose.atk)||0,0,1);
 const land=clamp(Number(pose.land)||0,0,1);
 const turn=clamp(Number(pose.turnPulse)||0,0,1);
 const brake=clamp(Number(pose.brake)||0,0,1);
 const speed=clamp(Number(pose.speed)||0,0,1.5);
 let stage="",strength=0;
 if(pose.state==="attack"&&(impact>.08||atk>.15)){stage="attack";strength=Math.max(impact,atk*.66);}
 else if(!pose.air&&land>.12){stage="landing";strength=land;}
 else if(!pose.air&&turn>.08){stage="turn";strength=turn;}
 else if(!pose.air&&brake>.08){stage="brake";strength=brake;}
 else if(pose.air&&["jump","fall","glide"].includes(pose.state)){stage="air";strength=clamp(Math.abs(Number(pose.vy)||0)*.75+.35,.35,1);}
 else if(pose.state==="run"&&speed>.25){stage="run";strength=speed*.75;}
 if(!stage)return null; 
 // Stitcho, Kilo, Michi and Chispín already have authored main-body FX.
 // Keep the extra signature visibly softer instead of overpainting their art.
 const restrained=["kilo","stitcho","chispin","cat"].includes(p.id);
 return Object.freeze({hero:p.id,type:identity.type,stage,form,
  count:reduced?2:2+form,accent:identity.colors[0],alt:identity.colors[1],glint:identity.colors[2],
  magnitude:clamp(strength,.05,1),alpha:clamp(strength*(restrained?.35:.55)*(reduced?.60:1),.02,.55),
  reduced:!!reduced});
}
function ellipse(ctx,x,y,rx,ry,col,rotation=0){
 ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,TAU);ctx.fill();
}
function line(ctx,a,b,c,d,color,width){
 ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();
}
function diamond(ctx,x,y,r,col){
 ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);
 ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();ctx.fill();
}
function curve(ctx,x1,y1,cx,cy,x2,y2,color,width){
 ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;
 ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);ctx.stroke();
}
// The Canvas stage is already at the character's feet, facing +X.
export function drawKineticSignature(ctx,p,H,pose,t=0,reduced=false){
 const a=kineticSignature(p,pose,reduced);
 if(!a||!ctx||!Number.isFinite(H)||H<=0)return false;
 const h=clamp(H,16,260),e=a.form,k=a.magnitude;
 const stamp=a.reduced?0:Number.isFinite(t)?t:0;
 const attack=a.stage==="attack",air=a.stage==="air";
 const landing=a.stage==="landing",turn=a.stage==="turn",brake=a.stage==="brake";
 const x=h*(attack?.38:air?-.26:landing?0:turn?-.16:brake?-.28:-.24);
 const y=h*(attack?-.48:air?-.40:landing?-.02:turn?-.24:brake?-.11:-.08);
 const radius=h*(.10+.025*e),width=Math.max(1.1,h*.015);
 const n=a.count;
 ctx.save();
 ctx.globalAlpha*=a.alpha;
 ctx.lineCap="round";
 switch(a.type){
  case "petals":
   for(let i=0;i<n;i++){
    const dx=(i-(n-1)/2)*h*.10;
    const dy=(i%2?-1:1)*h*.05-(air?h*.12:0);
    ctx.save();ctx.translate(x+dx,y+dy);
    ctx.rotate((a.reduced?0:stamp*.025)+i*.7);
    ellipse(ctx,0,0,radius*.36,radius*.18,i%2?a.alt:a.accent,.2);
    ctx.restore();
   }break;
  case "stitches":
   for(let i=0;i<n;i++){
    const xx=x+i*h*.075,yy=y-(i%2)*h*.045;
    line(ctx,xx,yy,xx+h*.06,yy-h*.07,i%2?a.alt:a.accent,width*1.15);
    line(ctx,xx+h*.06,yy-h*.07,xx+h*.08,yy+h*.028,a.glint,width*.85);
   }
   curve(ctx,x-h*.09,y-h*.07,x+h*.13,y-h*.35,x+h*.32,y-h*.08,a.alt,width);
   break;
  case "sparks":
   for(let i=0;i<n;i++){
    const xx=x+i*h*.09,yy=y-i*h*.055;
    line(ctx,xx,yy,xx+h*.065,yy-h*.115,i%2?a.alt:a.accent,width*1.3);
    line(ctx,xx+h*.065,yy-h*.115,xx+h*.028,yy-h*.13,a.glint,width);
    line(ctx,xx+h*.028,yy-h*.13,xx+h*.12,yy-h*.22,a.accent,width);
   }break;
  case "yarn":
   for(let i=0;i<n;i++){
    const rr=radius*(.42+i*.20),xx=x+i*h*.08;
    ctx.beginPath();ctx.strokeStyle=i%2?a.alt:a.accent;ctx.lineWidth=width;
    ctx.arc(xx,y-h*.06,rr,-.8,Math.PI*1.16);ctx.stroke();
    if(i%2===0)diamond(ctx,xx+rr*.9,y-h*.12,radius*.22,a.glint);
   }break;
  case "embers":
   for(let i=0;i<n;i++){
    const xx=x+i*h*.085,yy=y-(i%3)*h*.08-(air?h*.10:0);
    const wobble=a.reduced?0:Math.sin(stamp*.09+i)*h*.025;
    ctx.fillStyle=i%2?a.alt:a.accent;ctx.beginPath();
    ctx.moveTo(xx+wobble,yy-radius*.70);
    ctx.quadraticCurveTo(xx+radius*.50,yy-radius*.18,xx+radius*.35,yy+radius*.23);
    ctx.quadraticCurveTo(xx-radius*.55,yy+radius*.50,xx-radius*.25,yy);
    ctx.closePath();ctx.fill();
    diamond(ctx,xx,yy,radius*.15,a.glint);
   }
   if(air||attack)curve(ctx,x-h*.22,y+h*.15,x+h*.12,y-h*.34,x+h*.40,y-h*.12,a.alt,width*1.4);
   break;
  case "fossils":
   ctx.beginPath();ctx.strokeStyle=a.alt;ctx.lineWidth=width*1.5;
   ctx.moveTo(x-h*.28,y+h*.035);
   for(let i=0;i<n+1;i++)ctx.lineTo(x-h*.22+i*h*.11,y+(i%2?-.12:.025)*h*k);
   ctx.stroke();
   for(let i=0;i<n;i++){
    const xx=x-h*.18+i*h*.11,yy=y-h*.04-(i%2)*h*.04;
    line(ctx,xx,yy,xx+h*.03,yy-h*.05,a.accent,width*.80);
    diamond(ctx,xx+h*.02,yy-h*.09,radius*.21,a.glint);
   }break;
  case "salt":
   for(let i=0;i<n;i++){
    const xx=x+i*h*.08,yy=y-(i%3)*h*.065;
    const theta=a.reduced?i*.4:i*.4+stamp*.05;
    ctx.save();ctx.translate(xx,yy);ctx.rotate(theta);
    ctx.fillStyle=i%2?a.alt:a.glint;
    ctx.fillRect(-radius*.20,-radius*.20,radius*.4,radius*.4);
    ctx.restore();
   }
   if(brake||turn)curve(ctx,x-h*.2,y+h*.03,x-h*.40,y-h*.2,x-h*.45,y+h*.06,a.accent,width);
   break;
  case "cheese":
   for(let i=0;i<n;i++){
    const xx=x+i*h*.09,yy=y-i*h*.035;
    curve(ctx,xx-h*.06,yy-h*.11,xx+h*.02,yy+(i%2?h*.06:-h*.10),
     xx+h*.10,yy-h*.02,i%2?a.alt:a.accent,width*1.4);
    ellipse(ctx,xx+h*.065,yy-h*.02,radius*.20,radius*.16,i%2?a.glint:a.alt);
   }break;
  case "ofuda":
   for(let i=0;i<n;i++){
    const xx=x+i*h*.078,yy=y-h*(.08+(i%3)*.052);
    ctx.save();ctx.translate(xx,yy);ctx.rotate(a.reduced?i*.1:Math.sin(stamp*.055+i)*.18);
    ctx.fillStyle=a.accent;ctx.fillRect(-radius*.22,-radius*.55,radius*.44,radius*.95);
    line(ctx,-radius*.12,-radius*.25,radius*.10,-radius*.10,a.alt,width*.65);
    line(ctx,radius*.10,-radius*.10,-radius*.08,radius*.13,a.alt,width*.65);
    ctx.restore();
   }
   if(air)curve(ctx,x-h*.14,y+h*.04,x+h*.28,y-h*.38,x+h*.5,y-h*.03,a.alt,width);
   break;
  case "prism":{
   const palette=["#ffb9c7","#ffe6a6","#cbf2a0","#a4f2e5","#a9c4ff","#d9b5ff","#fff3d0"];
   const bands=a.reduced?2:Math.min(7,3+e);
   for(let i=0;i<bands;i++){
    ctx.beginPath();ctx.strokeStyle=palette[i];ctx.lineWidth=width*.83;
    ctx.arc(x,y-h*.15,radius*.7+i*h*.028,-Math.PI*.88,-Math.PI*.12);ctx.stroke();
   }
   for(let i=0;i<n;i++)diamond(ctx,x+i*h*.072,y-h*.19-(i%2)*h*.045,radius*.16,i%2?a.alt:a.glint);
   break;
  }
 }
 ctx.restore();
 return true;
}
