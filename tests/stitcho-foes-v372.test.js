import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { drawStitchoFoe, stitchoFoePose, stitchoFoeVariant, STITCHO_FOE_KINDS, isAvispa } from "../engine/foes/stitcho-foes.js";

function mockCtx() {
  const calls = { n: 0 };
  return new Proxy({ calls }, { get(o, k) { if (k in o) return o[k]; return (...a) => { calls.n++; return { addColorStop() {} }; }; }, set(o, k, v) { o[k] = v; return true; } });
}
const SRC = fs.readFileSync("engine/foes/stitcho-foes.js", "utf8");

test("V372 dibuja abeja, libélula, araña y murciélago en todas las poses", () => {
  const poses = [{}, { vx: 1.2 }, { telegraph: true }, { lunge: 5 }, { flash: 10 }, { hp: 0 }, { elite: true }];
  for (const kind of STITCHO_FOE_KINDS) for (const extra of poses) {
    const ctx = mockCtx();
    assert.equal(drawStitchoFoe(ctx, { kind, w: 34, h: 30, hp: 10, vx: 0, vy: 0, ...extra }, 40), true, kind);
    assert.ok(ctx.calls.n > 20, kind + " dibuja algo");
  }
});
test("V372 la avispa queda para kilo-foes y otros kinds no se tocan", () => {
  assert.equal(drawStitchoFoe(mockCtx(), { kind: "avispa", w: 40, h: 42, hp: 5 }, 0), false);
  assert.equal(drawStitchoFoe(mockCtx(), { kind: "abeja", variant: "avispa", w: 40, h: 42, hp: 5 }, 0), false);
  assert.equal(isAvispa({ kind: "abeja" }), false);
  assert.equal(drawStitchoFoe(mockCtx(), { kind: "cucaracho", w: 20, h: 20, hp: 5 }, 0), false);
});
test("V372 poses y variantes legibles", () => {
  assert.equal(stitchoFoePose({ kind: "abeja", hp: 0 }), "die");
  assert.equal(stitchoFoePose({ kind: "abeja", hp: 5, telegraph: true }), "telegraph");
  assert.equal(stitchoFoePose({ kind: "abeja", hp: 5, flash: 10 }), "hurt");
  assert.equal(stitchoFoeVariant({ kind: "arana", elite: true }), "elite");
});
test("V372 sin gradientes y sin tocar daño/vida", () => {
  assert.doesNotMatch(SRC, /create(Linear|Radial|Conic)Gradient/);
  assert.doesNotMatch(SRC, /\.(hp|dmg|damage)\s*=[^=]/);
});

// --- V372 hitbox: la silueta cabe en la caja (≤10 % de desborde) ---
function bboxCtx(){
 let m=[1,0,0,1,0,0];const st=[];const b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};
 const P=(x,y)=>{const X=m[0]*x+m[2]*y+m[4],Y=m[1]*x+m[3]*y+m[5];if(!Number.isFinite(X)||!Number.isFinite(Y))return;b.x0=Math.min(b.x0,X);b.x1=Math.max(b.x1,X);b.y0=Math.min(b.y0,Y);b.y1=Math.max(b.y1,Y);};
 const mul=(a,c)=>[a[0]*c[0]+a[2]*c[1],a[1]*c[0]+a[3]*c[1],a[0]*c[2]+a[2]*c[3],a[1]*c[2]+a[3]*c[3],a[0]*c[4]+a[2]*c[5]+a[4],a[1]*c[4]+a[3]*c[5]+a[5]];
 let clip=0;const cs=[];
 const ell=(x,y,rx,ry,r=0)=>{if(clip)return;for(let i=0;i<16;i++){const a=i/16*Math.PI*2,cx=Math.cos(a)*rx,cy=Math.sin(a)*ry;P(x+cx*Math.cos(r)-cy*Math.sin(r),y+cx*Math.sin(r)+cy*Math.cos(r));}};
 const pt=(x,y)=>{if(!clip)P(x,y)};
 const o={b,save(){st.push(m.slice());cs.push(clip)},restore(){m=st.pop()||m;clip=cs.pop()||0},translate(x,y){m=mul(m,[1,0,0,1,x,y])},scale(x,y){m=mul(m,[x,0,0,y,0,0])},rotate(a){m=mul(m,[Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0])},
 moveTo:pt,lineTo:pt,quadraticCurveTo(a,b2,c,d){pt(a,b2);pt(c,d)},bezierCurveTo(a,b2,c,d,e,f){pt(a,b2);pt(c,d);pt(e,f)},
 ellipse:ell,arc(x,y,r){ell(x,y,r,r)},fillRect(x,y,w,h){pt(x,y);pt(x+w,y+h)},clip(){clip=1},
 beginPath(){},closePath(){},fill(){},stroke(){},setLineDash(){},fillText(){},strokeText(){},measureText(){return{width:0}}};
 return new Proxy(o,{get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});
}
test("V372 hitbox: silueta de cada bicho en todas las poses dentro de e.w×e.h (+10 %)", async () => {
  const { STITCHO_FOE_FIT } = await import("../engine/foes/stitcho-foes.js");
  const boxes = [["abeja", 42, 48], ["libelula", 40, 42], ["murcielago", 34, 26], ["arana", 30, 22], ["arana", 44, 44], ["murcielago", 44, 44], ["libelula", 60, 30]];
  const poses = [{}, { vx: 1.2 }, { telegraph: true, vx: 1 }, { lunge: 5, vx: 2 }, { flash: 10 }, { hp: 0 }, { elite: true, vx: 1 }, { vx: -1.2 }];
  for (const [kind, w, h] of boxes) for (const p of poses) for (let t = 0; t < 60; t += 3) {
    const c = bboxCtx();
    drawStitchoFoe(c, { kind, w, h, hp: 10, vx: 0, vy: 0, ...p }, t, { fx: false });
    const tag = `${kind} ${w}x${h} ${JSON.stringify(p)} t=${t}`;
    assert.ok(Math.max(c.b.x1 - c.b.x0, c.b.y1 - c.b.y0) > Math.min(w, h) * .5, "dibujo no vacío " + tag);
    assert.ok(Math.max(-c.b.x0, c.b.x1) <= w / 2 * STITCHO_FOE_FIT + .5, "ancho " + tag);
    assert.ok(Math.max(-c.b.y0, c.b.y1) <= h / 2 * STITCHO_FOE_FIT + .5, "alto " + tag);
  }
});
