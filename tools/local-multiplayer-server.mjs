// Disposable local rooms for development. No Netlify, TURN or paid requests.
import http from'node:http';import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{createRoomService,RoomError}from'../netlify/lib/room-service.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export class LocalRoomStore{
 entries=new Map();revision=0;
 async getWithMetadata(key){const e=this.entries.get(key);return e?{data:structuredClone(e.data),etag:e.etag}:null;}
 async setJSON(key,data,options={}){const prev=this.entries.get(key);if(options.onlyIfNew&&prev||options.onlyIfMatch&&prev?.etag!==options.onlyIfMatch)return{modified:false};this.entries.set(key,{data:structuredClone(data),etag:String(++this.revision)});return{modified:true};}
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
export async function startMultiplayerServer({port=0,host='127.0.0.1',store=new LocalRoomStore(),now=Date.now}={}){
 const service=createRoomService(store,{now});
 const server=http.createServer(async(req,res)=>{
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/.netlify/functions/')){
   if(req.method!=='POST')return send(405,{error:{code:'METHOD_NOT_ALLOWED',message:'Usa POST.'}});
   try{let text='';for await(const chunk of req){text+=chunk;if(text.length>65536)return send(413,{error:{code:'BODY_TOO_LARGE',message:'Solicitud demasiado grande.'}});}const b=JSON.parse(text);let data;
    if(url.pathname.endsWith('/rtc-config')){await service.poll(b.roomId,b.identity);data={status:'unavailable',iceServers:[]};}
    else switch(b.action){
     case'create':data=await service.create(b.mode,b.arenaId);break;case'join':data=await service.join(b.roomId,b.identity);break;case'choose':data=await service.choose(b.roomId,b.identity,b.characterId);break;case'ready':data=await service.ready(b.roomId,b.identity,b.ready);break;case'move':data=await service.move(b.roomId,b.identity,b);break;case'role':data=await service.role(b.roomId,b.identity,b.characterId,b.roleEpoch);break;case'travel':data=await service.travel(b.roomId,b.identity,b);break;case'signal':data=await service.signal(b.roomId,b.identity,b);break;case'poll':data=await service.poll(b.roomId,b.identity);break;case'disconnect':data=await service.disconnect(b.roomId,b.identity);break;case'attack':case'ability':case'dodge':data=await service.action(b.roomId,b.identity,b,b.action);break;default:throw new RoomError('UNKNOWN_ACTION','Acción desconocida.');
    }return send(200,{data});
   }catch(e){return send(e.status||400,{error:{code:e.code||'INVALID_REQUEST',message:e.message}});}
  }
  let raw;try{raw=decodeURIComponent(url.pathname);}catch{return send(400,{error:{code:'BAD_PATH'}});}
  const file=path.resolve(root,'.'+(raw==='/'?'/index.html':raw));
  if(!file.startsWith(root+path.sep)||raw.split('/').some(p=>p.startsWith('.')&&p))return send(403,{error:{code:'FORBIDDEN'}});
  const ext=path.extname(file);if(!mime[ext])return send(404,{error:{code:'NOT_FOUND'}});
  fs.stat(file,(e,s)=>{if(e||!s.isFile()){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':mime[ext],'Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);});
 });
 await new Promise(r=>server.listen(port,host,r));return{server,service,store,url:`http://${host}:${server.address().port}`,close:()=>new Promise(r=>{server.closeAllConnections();server.close(r);})};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const s=await startMultiplayerServer({port:Number(process.env.PORT)||4173});console.log('OHANA local multiplayer: '+s.url+'/multiplayer.html');}
