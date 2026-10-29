// Default adapter for the actual playable family, including standalone previews.
// A missing external adapter must never replace a hero with a geometric emblem.
import {drawCharacter} from '../characters/draw.js';
import {findRoster} from '../characters/roster.js';
import {heroHeightTarget} from '../characters/visual-size.js';

// External painters may throw after save/clip/transform, or explicitly decline.
// Contain their Canvas stack so the canonical fallback uses the caller's frame.
export function tryFamilyActorAdapter(ctx,paint,...args){
 if(typeof paint!=='function')return false;
 const save=ctx.save,restore=ctx.restore;
 const descriptors={save:Object.getOwnPropertyDescriptor(ctx,'save'),restore:Object.getOwnPropertyDescriptor(ctx,'restore')};
 let depth=0,barrier=false;
 try{
  save.call(ctx);barrier=true;
  Object.defineProperty(ctx,'save',{configurable:true,writable:true,value(){save.call(ctx);depth++;}});
  Object.defineProperty(ctx,'restore',{configurable:true,writable:true,value(){if(depth>0){restore.call(ctx);depth--;}}});
  return paint(ctx,...args)!==false;
 }catch(_){return false;}
 finally{
  while(depth>0){restore.call(ctx);depth--;}
  if(barrier)restore.call(ctx);
  for(const name of['save','restore']){
   if(descriptors[name])Object.defineProperty(ctx,name,descriptors[name]);
   else delete ctx[name];
  }
 }
}

export function createFamilyActor(hero,{form=0,pose='idle',facing=1,visualScale=1}={}){
 const def=findRoster(hero),evo=Math.max(0,Math.min(4,Math.round(Number(form)||0))),f=def?.forms?.[evo];
 if(!f)return null;
 return {id:hero,evo,color:f.color||def.color,w:f.w,h:f.h,x:-f.w/2,y:-f.h,
  facing,grounded:true,vx:0,vy:0,speed:f.speed,health:f.hp,maxHealth:f.hp,
  visualScale,invuln:0,michiSeed:0,_poseOverride:pose,
  _introForceCanvas:true,_duetActor:true,_theatreHQ:true};
}
export function drawFamilyActor(ctx,hero,x,y,scale=1,t=0,acting={},reduced=false){
 const form=Math.max(0,Math.min(4,Math.round(Number(acting.form)||0)));
 const actor=createFamilyActor(hero,{form,pose:acting.pose||'idle',
  visualScale:Math.max(.1,Number(scale)||1)*60/heroHeightTarget(hero,form)});
 if(!actor)return false;
 if(hero==='kilo'&&acting.performance)actor._kiloPerformance={kind:acting.performance,time:reduced?3.5:t/60};
 ctx.save();ctx.translate(x,y);drawCharacter(ctx,actor,{x:0,y:0},reduced?0:t,{reduceMotion:reduced});ctx.restore();
 return true;
}
