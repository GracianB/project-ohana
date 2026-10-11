import test from "node:test";
import assert from "node:assert/strict";
import {drawPlatform} from "../worlds/terrain.js";
function fakeContext(){
 const rectangles=[];
 const ctx={
  canvas:{width:2560},globalAlpha:1,fillStyle:"",strokeStyle:"",lineWidth:1,
  beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},fill(){},stroke(){},
  save(){},restore(){},clip(){},rect(){},arc(){},
  createLinearGradient(){return {addColorStop(){}}},
  fillRect(x,y,w,h){rectangles.push({x,y,w,h})}
 };
 return {ctx,rectangles};
}
test("V289 draws a distinct 2-pixel walkable top line and both edge caps",()=>{
 const {ctx,rectangles}=fakeContext();
 drawPlatform(ctx,{x:100,y:200,w:180,h:18},{id:"cave",edge:"#a9cfff"},{x:0,y:0},0);
 assert.ok(rectangles.some(r=>r.x===102&&r.y===198&&r.h===2));
 assert.ok(rectangles.some(r=>r.x===100&&r.y===198&&r.h===7));
 assert.ok(rectangles.some(r=>r.x===272&&r.y===198&&r.h===7));
});
test("V289 off-camera platforms remain culled",()=>{
 const {ctx,rectangles}=fakeContext();
 drawPlatform(ctx,{x:3000,y:200,w:140,h:18},{id:"cave"},{x:0,y:0},0);
 assert.equal(rectangles.length,0);
});
