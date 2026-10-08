import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
 accessibleGameSnapshot,advanceAccessibleGameState
} from "../systems/a11y-v97.js";
const hero=(health=100,evo=0)=>accessibleGameSnapshot({
 id:"cuerno",evo,health,maxHealth:100},null);

test("V97 initial snapshot is silent, health message comes only at threshold",()=>{
 const first=advanceAccessibleGameState(null,hero());
 assert.equal(first.message,"");
 const normal=advanceAccessibleGameState(first.state,hero(40));
 assert.equal(normal.message,"");
 const danger=advanceAccessibleGameState(normal.state,hero(25));
 assert.match(danger.message,/Salud crítica/);
 let snapshot=danger.state;
 for(let i=0;i<120;i++){
  const s=advanceAccessibleGameState(snapshot,hero(20));
  assert.equal(s.message,"","No repeated narration every game frame");
  snapshot=s.state;
 }
 const midway=advanceAccessibleGameState(snapshot,hero(35));
 assert.equal(midway.message,"","Recovery requires hysteresis");
 const recovered=advanceAccessibleGameState(midway.state,hero(50));
 assert.match(recovered.message,/recuperada/);
});
test("V97 boss phases, evolution and new hero reset are discrete",()=>{
 const alive=hero();
 const boss=accessibleGameSnapshot({id:"cuerno",evo:0,health:100,maxHealth:100},{phase:1});
 const appeared=advanceAccessibleGameState(alive,boss);
 assert.match(appeared.message,/Reina del Nido/);
 const phase2=advanceAccessibleGameState(appeared.state,{...boss,bossPhase:2});
 assert.match(phase2.message,/fase 2/);
 const same=advanceAccessibleGameState(phase2.state,{...boss,bossPhase:2});
 assert.equal(same.message,"");
 const evolved=advanceAccessibleGameState(same.state,{...boss,bossPhase:2,evo:1});
 assert.match(evolved.message,/Forma 2 de 5/);
 const newHero=advanceAccessibleGameState(evolved.state,{
   ...boss,id:"dino",bossPhase:0,evo:0
 });
 assert.equal(newHero.message,"");
});
test("V97 live region and HUD remain part of offline runtime",()=>{
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const hud=fs.readFileSync("systems/hud.js","utf8");
 const css=fs.readFileSync("hud.css","utf8");
 const version=sw.match(/const VERSION = "(ohana-[0-9]+)"/)?.[1];
 assert.ok(version && Number(version.slice(6))>=297);
 assert.ok(html.includes(version));
 assert.match(sw,/systems\/a11y-v97\.js\?v=/);
 assert.match(html,/id="a11y-game-announcements"[^>]+aria-live="polite"/);
 assert.match(hud,/announceAccessibleGameState\(doc,player,boss\)/);
 assert.match(css,/forced-colors: active/);
 assert.match(css,/\.game-sr-only/);
 assert.doesNotMatch(fs.readFileSync("systems/a11y-v97.js","utf8"),
  /Math\.random|setInterval|requestAnimationFrame|fetch\(/);
});
