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
// Netlify Pretty URLs rewrites exactly the co-op link in index.html.
// Permit only that known single-tag transformation on the production host.
export function expectedNetlifyHtml(html){
 return html.replace(
  /<a id="btn-coop" class="cta ghost" href="https:\/\/project-ohana-multiplayer\.netlify\.app\/multiplayer\.html" title="El mismo OHANA original, ahora con dos jugadores">/,
  "<a class='cta ghost' href='https://project-ohana-multiplayer.netlify.app/multiplayer' id='btn-coop' title='El mismo OHANA original, ahora con dos jugadores'>"
 );
}
let failed=false;
let htmlMismatch=false;
for(const path of files){
 const local=await fs.readFile(new URL(path,root));
 const url=new URL(path,site);
 try{
  const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(12000),headers:{"cache-control":"no-cache"}});
  if(!response.ok)throw Error("HTTP "+response.status);
  const remote=Buffer.from(await response.arrayBuffer());
  const exact=sha(local)===sha(remote);
  const transformed=path==="index.html"&&site.hostname==="project-ohana-multiplayer.netlify.app"&&
   expectedNetlifyHtml(local.toString("utf8"))===remote.toString("utf8");
  const match=exact||transformed;
  console.log(JSON.stringify({path,url:url.href,match,transformed:!exact&&transformed,status:response.status,localBytes:local.length,remoteBytes:remote.length}));
  if(!match){
   if(path==="index.html"&&site.hostname==="project-ohana-multiplayer.netlify.app"){
    htmlMismatch=true;
    const a=local.toString("utf8"),b=remote.toString("utf8");
    let at=0;while(at<a.length&&at<b.length&&a[at]===b[at])at++;
    console.warn(JSON.stringify({warning:"NETLIFY_HTML_DIFF",firstDifferenceAt:at,
      localExcerpt:a.slice(Math.max(0,at-90),at+180),remoteExcerpt:b.slice(Math.max(0,at-90),at+180)}));
   }else failed=true;
  }
 }catch(err){
  failed=true;console.log(JSON.stringify({path,url:url.href,error:String(err.message||err)}));
 }
}
if(failed){
 console.error("DEPLOYMENT_MISMATCH: public files differ or are unreachable. Do not claim the deployed game is current.");
 process.exitCode=1;
}else if(htmlMismatch){
 console.log("DEPLOYMENT_CODE_MATCH_HTML_DIFF: verified all critical public code and service-worker bytes. Netlify index.html differs and has NOT been verified equivalent; inspect NETLIFY_HTML_DIFF. This is NOT full deployment equivalence.");
}else console.log("DEPLOYMENT_MATCH: inspected public files match this local checkout (not proof of multiplayer latency).");
