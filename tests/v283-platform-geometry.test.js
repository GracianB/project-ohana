import test from "node:test";
import assert from "node:assert/strict";
import {ROSTER} from "../characters/roster.js";
import {supportBelow,formPlatformAudit} from "../systems/platform-geometry.js";
test("V283: all ten heroes expose five measurable hitboxes",()=>{
 const a=formPlatformAudit(ROSTER,[]);
 assert.equal(ROSTER.length,10);
 assert.equal(a.forms.length,50);
 assert.ok(a.tallest>0&&a.widest>0);
 assert.ok(a.forms.every(f=>f.height>0&&f.width>0&&f.jump>0));
});
test("V283: narrow ledges are flagged for large final forms",()=>{
 const a=formPlatformAudit(ROSTER,[{x:0,y:80,w:10,h:12},{x:0,y:120,w:500,h:12}]);
 assert.equal(a.narrowLedges,1);
});
test("V284: pick nearest actual floor beneath enemy, not lowest in entire room",()=>{
 const e={x:40,y:100,w:25,h:35};
 const platforms=[{x:0,y:700,w:250,h:50},{x:0,y:190,w:250,h:14},{x:0,y:300,w:250,h:30}];
 assert.equal(supportBelow(e,platforms).y,190);
});
test("V284: do not teleport across vast chasms or up onto platforms",()=>{
 const e={x:40,y:100,w:25,h:35};
 assert.equal(supportBelow(e,[{x:0,y:800,w:250,h:50}]),null);
 assert.equal(supportBelow(e,[{x:0,y:80,w:250,h:20}]),null);
});
test("V284: invalid platform geometry ignored",()=>{
 const e={x:40,y:100,w:25,h:35};
 assert.equal(supportBelow(e,[{x:0,y:190,w:NaN,h:20}]),null);
});
