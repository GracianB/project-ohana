// Verify that the public site serves the same bytes as the local checkout.
// Usage: node tools/check-live-deployment.mjs https://example.netlify.app/
import fs from "node:fs/promises";
import crypto from "node:crypto";
const root=new URL("../",import.meta.url);
const site=new URL(process.argv[2]||"https://gracianb.github.io/project-ohana/");
if(!["https:","http:"].includes(site.protocol))throw Error("Use an HTTP(S) site URL");
if(!site.pathname.endsWith("/"))site.pathname+="/";
const files=["index.html","sw.js","game.js","systems/online-coop.js","systems/coop-v108-direct.js","systems/coop-v109-recovery.js"];
const sha=data=>crypto.createHash("sha256").update(data).digest("hex");
let failed=false;
for(const path of files){
 const local=await fs.readFile(new URL(path,root));
 const url=new URL(path,site);
 try{
  const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(12000),headers:{"cache-control":"no-cache"}});
  if(!response.ok)throw Error("HTTP "+response.status);
  const remote=Buffer.from(await response.arrayBuffer());
  const match=sha(local)===sha(remote);
  console.log(JSON.stringify({path,url:url.href,match,status:response.status,localBytes:local.length,remoteBytes:remote.length}));
  if(!match)failed=true;
 }catch(err){
  failed=true;console.log(JSON.stringify({path,url:url.href,error:String(err.message||err)}));
 }
}
if(failed){
 console.error("DEPLOYMENT_MISMATCH: public files differ or are unreachable. Do not claim the deployed game is current.");
 process.exitCode=1;
}else console.log("DEPLOYMENT_MATCH: inspected public files match this local checkout (not proof of multiplayer latency).");
