import cat from '../../characters/art/cat.js';
import chispin from '../../characters/art/chispin.js';
import pizza from '../../characters/art/pizza.js';
import yomi from '../../characters/art/yomi.js';
import {R} from '../../characters/rig.js';
import {flatCtx} from './stitcho.js';
const ART={cat,chispin,pizza,yomi};
const HEIGHT={cat:[72,88,94,108,116],chispin:[80,94,105,114,125],pizza:[102,107,129,135,134],yomi:[66,86,92,98,116]};
export function drawEvolutionActor(ctx,id,x,y,s,form,t,options={}){
 const f=Math.max(0,Math.min(4,(form|0)-1));
 const motion=id==='cat'&&!options.reducedMotion;
 const state=motion?(options.state||'victory'):'idle';
 const clock=motion?(Number.isFinite(t)?t*60:0):0;
 ctx.save();ctx.translate(x,y);
 const size=id==='cat'||id==='yomi'?52:68;
 ctx.scale(s*size/HEIGHT[id][f],s*size/HEIGHT[id][f]);
 // V460: Michicornio cinematics render the actual animated anatomy, never
 // the previous frozen reducedMotion=true portrait. Others stay compatible.
 ART[id].draw(flatCtx(ctx),{form:f,state,t:clock,phase:clock*.17,
  look:{x:.2,y:0},speed:1,reduceMotion:!motion,flourish:0,
  cast:options.cast??.55,atk:options.atk??.45,castSlot:2},R);
 ctx.restore();
}
