// V369 deterministic source-byte accounting for first incremental offline release.
// Reports potential payload avoided; browser transfer sizes may be compressed.
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";

const old=JSON.parse(fs.readFileSync("tools/offline-baseline-v368.json","utf8"));
const sw=fs.readFileSync("sw.js","utf8");
const currentVersion=sw.match(/const VERSION = "(ohana-\d+)"/)?.[1];
const start=sw.indexOf("const PRECACHE_REVISIONS = {");
const end=sw.indexOf("\n};",start);
if(!currentVersion||start<0||end<0)throw Error("Missing current Service Worker revision table");
const current=JSON.parse(sw.slice(sw.indexOf("{",start),end+2));
if(old.version===""+currentVersion)throw Error("Need distinct old and new revisions");
const entries=Object.entries(current);
if(entries.length<180)throw Error("Unexpectedly small current precache");
let reused=0,downloaded=0,reusedSourceBytes=0,downloadedSourceBytes=0;
const changed=[],reusedPaths=[],removed=[];
for(const [name,sha] of entries){
 const data=fs.readFileSync(name);
 const actual=createHash("sha1").update("blob "+data.length).update(Buffer.from([0])).update(data).digest("hex");
 if(actual!==sha)throw Error("Stale revision for "+name);
 const prev=old.resources[name];
 if(prev?.sha===sha){
  reused++;
  reusedSourceBytes+=data.length;
  if(prev.bytes!==data.length)throw Error("Reused asset changed byte size: "+name);
  reusedPaths.push(name);
 }else{
  downloaded++;
  downloadedSourceBytes+=data.length;
  changed.push({path:name,bytes:data.length,oldBytes:prev?.bytes??0,kind:prev?"changed":"new"});
 }
}
for(const [name,info] of Object.entries(old.resources)){
 if(!Object.hasOwn(current,name))removed.push({path:name,oldBytes:info.bytes});
}
const total=reused+downloaded;
const priorSourceBytes=Object.values(old.resources).reduce((s,item)=>s+item.bytes,0);
const report={
 sourceVersion:old.version,
 targetVersion:currentVersion,
 sourceCommit:old.commit,
 classification:"source-byte model (uncompressed); browser network bytes depend on transfer encoding",
 total,
 reused,
 downloaded,
 reusePct:Number((100*reused/total).toFixed(2)),
 avoidedSourceBytes:reusedSourceBytes,
 changedSourceBytes:downloadedSourceBytes,
 priorFullSourceBytes:priorSourceBytes,
 currentFullSourceBytes:reusedSourceBytes+downloadedSourceBytes,
 changed,removed,
 guarantee:"Each identical asset is eligible for CacheStorage reuse; a successful real upgrade depends on prior cached bytes being available."
};
fs.mkdirSync("test-results/performance",{recursive:true});
fs.writeFileSync("test-results/performance/v369-offline-upgrade.json",JSON.stringify(report,null,2)+"\n");
console.log("OHANA "+old.version+" → "+currentVersion+": "+reused+"/"+total+
  " assets unchanged ("+report.reusePct+"%); "+downloaded+" to fetch; "+
  (reusedSourceBytes/1024/1024).toFixed(2)+" MiB unchanged source potentially reused");
console.log("Changed: "+changed.map(v=>v.path).join(", "));
