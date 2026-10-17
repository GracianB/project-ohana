import test from 'node:test';
import assert from 'node:assert/strict';
import { horizontalLook, clearBufferedActions } from '../engine/camera.js';
import { compactLiveList } from '../systems/runtime.js';
import { Floaters } from '../systems/floaters.js';
import { ParticleSystem } from '../engine/particles.js';
import { ExperienceDirector } from '../systems/experience.js';

test('camera anticipation is symmetric and dash uses its latched direction', () => {
  assert.equal(horizontalLook({vx:-4,facing:-1}),-18);
  assert.equal(horizontalLook({vx:4,facing:1}),18);
  assert.equal(horizontalLook({vx:0,facing:-1}),0);
  assert.equal(horizontalLook({_dashGo:3,_dashFace:-1,facing:1}),-48);
  assert.equal(horizontalLook({_dashGo:3,_dashFace:1,facing:-1}),48);
});

test('pause clears queued actions but preserves the active jump and dash', () => {
  const p={buffer:10,dashBuf:8,meleeBuf:8,vx:5,vy:-8,_dashGo:3,dash:12,melee:4};
  clearBufferedActions(p);
  assert.deepEqual(p,{buffer:0,dashBuf:0,meleeBuf:0,vx:5,vy:-8,_dashGo:3,dash:12,melee:4});
  assert.doesNotThrow(()=>clearBufferedActions(null));
});

test('transient compaction keeps list identity, order and newest bounded entries', () => {
  const a={life:4},b={life:0},c={life:2},d={life:5};
  const list=[a,b,c,d];
  assert.equal(compactLiveList(list,{tickLife:true,max:2}),list);
  assert.deepEqual(list,[c,d]);
  assert.deepEqual([a.life,b.life,c.life,d.life],[3,-1,1,4]);
  compactLiveList(list);
  assert.deepEqual([c.life,d.life],[1,4]);
  compactLiveList(list,{max:0});assert.equal(list.length,0);
});

test('floating damage labels retain their pool across expiration', () => {
  const f=new Floaters();f.add(20,20,'KO');const pool=f.items;
  for(let i=0;i<41;i++)f.update();
  assert.equal(f.items,pool);assert.equal(pool.length,0);
});

test('offscreen particle culling reduces draws and preserves simulation and edge effects', () => {
  const p=new ParticleSystem();p.emit(50,50,{count:3});p.emit(5000,5000,{count:7});
  let draws=0;const ctx={globalAlpha:1,save(){},restore(){},fillRect(){draws++}};
  const state=JSON.stringify(p.items);
  p.render(ctx,{x:0,y:0},{width:100,height:100});assert.equal(draws,3);
  assert.equal(JSON.stringify(p.items),state);
  draws=0;p.render(ctx,{x:0,y:0});assert.equal(draws,10);
});

test('unchanged experience UI causes no DOM writes after its first update', () => {
  const previous=globalThis.document;let writes=0;
  const element=()=>{
    let text='',width='';const attrs=new Map(),classes=new Set();
    return {
      classList:{contains:k=>classes.has(k),toggle(k,on){writes++;on?classes.add(k):classes.delete(k);}},
      getAttribute:k=>attrs.get(k),setAttribute(k,v){writes++;attrs.set(k,v);},
      get textContent(){return text;},set textContent(v){writes++;text=v;},
      style:{get width(){return width;},set width(v){writes++;width=v;}}
    };
  };
  try {
    const body=element();body.dataset=new Proxy({}, {set(o,k,v){writes++;o[k]=v;return true;}});
    globalThis.document={body};
    const director=new ExperienceDirector();director.ui=element();director.uiTitle=element();director.uiNote=element();director.uiBar=element();
    const game={combo:0,enemies:[],reduceMotion:false};director.update(game);writes=0;
    for(let i=0;i<120;i++)director.update(game);
    assert.equal(writes,0);
    game.combo=4;director.update(game);director.updateUI(game);writes=0;
    for(let i=0;i<120;i++)director.updateUI(game);
    assert.equal(writes,0);
    game.boss={phase:2};director.updateUI(game);
    assert.equal(director.uiTitle.textContent,'FASE 2');assert.equal(director.uiNote.textContent,'REINA DEL NIDO');
  } finally {if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
