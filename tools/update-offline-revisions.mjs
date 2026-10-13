// Regenerate the content-addressed Service Worker manifest after changing
// source assets and bumping ohana-NNN. No dependencies or network access.
import fs from "node:fs";
import {createHash} from "node:crypto";

const path="sw.js";
const source=fs.readFileSync(path,"utf8");
const start=source.indexOf("const PRECACHE_REVISIONS = {");
const end=source.indexOf("\n};",start);
const pre=source.indexOf("const PRECACHE = [");
const stop=source.indexOf("\n];",pre);
if(start<0||end<0||pre<0||stop<0)throw new Error("Invalid offline precache sections");
const entries=[...source.slice(pre,stop).matchAll(/"\.\/([^"?]+)(?:\?v=" \+ VERSION)?/g)]
  .map(match=>match[1]).filter(name=>name);
const values={};
for(const name of entries){
  if(!fs.existsSync(name))throw new Error("Missing static precache resource: "+name);
  const data=fs.readFileSync(name);
  values[name]=createHash("sha1").update("blob "+data.length)
    .update(Buffer.from([0])).update(data).digest("hex");
}
const updated=source.slice(0,start)+"const PRECACHE_REVISIONS = "+
  JSON.stringify(values,null,2)+source.slice(end+2);
if(updated!==source)fs.writeFileSync(path,updated);
console.log("OHANA incremental cache: "+entries.length+" content hashes refreshed");
