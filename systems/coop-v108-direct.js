// OHANA V108 · WebRTC fast lane.
// Netlify still authenticates the room and persists canonical progress.
// Only time-sensitive cosmetic poses and actions take the direct channel.
// ICE negotiation is relayed through existing authenticated 'action' signals;
// no external API keys, polling loops, server protocol migrations or timers per frame.
export const REALTIME_POSE_MS=50;
export const ICE_GATHER_WAIT_MS=1200;
const MAX_CANDIDATES=64;
const validSession=s=>typeof s==="string"&&/^[A-Za-z0-9._:-]{5,80}$/.test(s);
// Copy only browser ICE fields. Never forward arbitrary objects or credentials.
export function safeIceCandidate(value){
 if(!value||typeof value.candidate!=="string"||!value.candidate.startsWith("candidate:")||
    value.candidate.length>1000||/[\r\n]/.test(value.candidate))return null;
 const mid=value.sdpMid??null,index=value.sdpMLineIndex??null;
 if(mid!==null&&(typeof mid!=="string"||mid.length>64))return null;
 if(index!==null&&(!Number.isInteger(index)||index<0||index>16))return null;
 if(mid===null&&index===null)return null;
 const result={candidate:value.candidate,sdpMid:mid,sdpMLineIndex:index};
 if(value.usernameFragment!=null){
  if(typeof value.usernameFragment!=="string"||value.usernameFragment.length>256)return null;
  result.usernameFragment=value.usernameFragment;
 }
 return result;
}
export function isRtcCandidateSignal(message){
 return message?.action==="rtc"&&message.kind==="candidates"&&validSession(message.sid)&&
  Array.isArray(message.candidates)&&message.candidates.length>0&&message.candidates.length<=4&&
  JSON.stringify(message).length<=1600&&message.candidates.every(c=>safeIceCandidate(c)!==null);
}
// TURN is required on networks where direct ICE candidates cannot connect.
// Accept credentials only from explicit, trusted deployment configuration.
export function rtcIceServers(extra=[]){
 const base=[{urls:"stun:stun.cloudflare.com:3478"},{urls:"stun:stun.l.google.com:19302"}];
 if(!Array.isArray(extra))return base;
 for(const item of extra.slice(0,4)){
  if(!item||typeof item!=="object")continue;
  const urls=typeof item.urls==="string"?[item.urls]:Array.isArray(item.urls)?item.urls:[];
  if(!urls.length||urls.length>4||!urls.every(u=>typeof u==="string"&&u.length<250&&/^turns?:/.test(u)))continue;
  if(typeof item.username!=="string"||!item.username||item.username.length>256||typeof item.credential!=="string"||!item.credential||item.credential.length>512)continue;
  base.push({urls:urls.length===1?urls[0]:urls,username:item.username,credential:item.credential});
 }
 return base;
}
// V110: most SDP exchanges take one authenticated Netlify mutation.
const MAX_SIGNAL_PARTS=4;
const PART_LENGTH=12000;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const finite=v=>typeof v==="number"&&Number.isFinite(v);
export function safeDirectPose(message,prevSeq=0){
 if(!message||message.t!=="pose"||!Number.isSafeInteger(message.seq)||message.seq<=prevSeq)return null;
 if(!finite(message.x)||!finite(message.y)||message.x<0||message.y<0||message.x>2400||message.y>1450)return null;
 if(typeof message.room!=="string"||!/^(hub|beach|jungle|cave|lab|ridge|space|reef|volcano|boss)$/.test(message.room))return null;
 return {
  seq:message.seq,x:message.x,y:message.y,room:message.room,
  vx:finite(message.vx)?clamp(message.vx,-45,45):0,
  vy:finite(message.vy)?clamp(message.vy,-65,65):0,
  facing:message.facing===-1?-1:1,
  evo:finite(message.evo)?clamp(Math.floor(message.evo),0,4):0,
  grounded:message.grounded!==false,
  melee:finite(message.melee)?clamp(message.melee,0,30):0,
  dash:finite(message.dash)?clamp(message.dash,0,30):0
 };
}
export function splitDirectDescription(kind,sid,sdp){
 if(!["offer","answer"].includes(kind)||typeof sid!=="string"||sid.length>80||typeof sdp!=="string"||sdp.length>PART_LENGTH*MAX_SIGNAL_PARTS||!sdp.length)return [];
 // Escaped JSON (especially SDP CRLF) can be larger than raw SDP.
 // Adapt each chunk to the ACTUAL serialized size accepted by Netlify.
 const chunks=[];
 for(let offset=0;offset<sdp.length;){
  let span=Math.min(PART_LENGTH,sdp.length-offset);
  while(span>0){
   const data=sdp.slice(offset,offset+span);
   const encoded=JSON.stringify({action:"rtc",kind,sid,part:0,total:MAX_SIGNAL_PARTS,data,roomId:"volcano"});
   if(encoded.length<=12350)break;
   span=Math.floor(span*.9);
  }
  if(span<1)return [];
  chunks.push(sdp.slice(offset,offset+span));
  offset+=span;
  if(chunks.length>MAX_SIGNAL_PARTS)return [];
 }
 const total=chunks.length;
 return chunks.map((data,part)=>({action:"rtc",kind,sid,part,total,data}));
}
export function createDirectAssembler(){
 const pending=new Map();
 return {
  accept(m){
   if(!m||!["offer","answer"].includes(m.kind)||typeof m.sid!=="string"||m.sid.length>80||
      !/^[A-Za-z0-9._:-]{5,80}$/.test(m.sid)||
      !Number.isInteger(m.part)||!Number.isInteger(m.total)||
      m.total<1||m.total>MAX_SIGNAL_PARTS||m.part<0||m.part>=m.total||
      typeof m.data!=="string"||m.data.length>PART_LENGTH)return null;
   const key=m.kind+":"+m.sid;
   if(!pending.has(key)){
    if(pending.size>3)pending.clear();
    pending.set(key,{parts:Array(m.total).fill(null),total:m.total});
   }
   const state=pending.get(key);
   if(state.total!==m.total){pending.delete(key);return null;}
   state.parts[m.part]=m.data;
   if(state.parts.some(p=>p===null))return null;
   pending.delete(key);
   const sdp=state.parts.join("");
   if(!sdp.startsWith("v=0"))return null;
   return {kind:m.kind,sid:m.sid,sdp};
  },
  reset(){pending.clear();}
 };
}
export class DirectPeerLink{
 constructor({initiator,relay,onPose,onEvent,onState,RTC=globalThis.RTCPeerConnection,now=()=>performance.now(),iceServers=[]}={}){
  this.initiator=!!initiator;
  this.relay=relay;
  this.onPose=onPose;this.onEvent=onEvent;this.onState=onState;
  this.RTC=RTC;this.now=now;this.iceServers=rtcIceServers(iceServers);
  this.pc=null;this.poseChannel=null;this.eventChannel=null;
  this.ready=false;this.closed=false;this.lastPoseAt=0;this.nextSeq=0;this.receivedSeq=0;
  this.sessionId=null;this.assembler=createDirectAssembler();this.negotiating=false;
  this.pingSeq=0;this.pendingPing=null;this.lastPingSentAt=0;this.directRttMs=0;this.lastPongAt=0;this.onMetrics=null;
  this.priorOffers=new Set();this.iceState="new";this.connectionState="new";this.onIceStatus=null;
  this.signalQueue=Promise.resolve();this.queuedSignals=0;
  this.remoteCandidates=new Map();this.appliedCandidates=new Set();
  this.localCandidates=[];this.localCandidateKeys=new Set();this.descriptionPublished=false;
  this.candidateTimer=null;this.cancelIceWait=null;
  this.route="unknown";this.statsBusy=false;this.lastStatsAt=-Infinity;this.onRoute=null;
 }
 get available(){return typeof this.RTC==="function";}
 get active(){return this.ready&&this.poseChannel?.readyState==="open"&&this.eventChannel?.readyState==="open";}
 _state(){
  const on=this.poseChannel?.readyState==="open"&&this.eventChannel?.readyState==="open";
  if(on!==this.ready){this.ready=on;this.onState?.(on);}
 }
 _attach(channel){
  if(!channel)return;
  if(channel.label==="poses"){
   this.poseChannel=channel;
   channel.onmessage=e=>{
    if(this.closed||this.poseChannel!==channel)return;
    if(typeof e.data!=="string"||e.data.length>1000)return;
    let msg;try{msg=JSON.parse(e.data);}catch{return;}
    const pose=safeDirectPose(msg,this.receivedSeq);
    if(!pose)return;
    this.receivedSeq=pose.seq;
    this.onPose?.(pose);
   };
  }else if(channel.label==="events"){
   this.eventChannel=channel;
   channel.onmessage=e=>{
    if(this.closed||this.eventChannel!==channel)return;
    if(typeof e.data!=="string"||e.data.length>900)return;
    let msg;try{msg=JSON.parse(e.data);}catch{return;}
    if(msg?.t==="ping"&&Number.isSafeInteger(msg.id)&&msg.id>0){
      if(channel.readyState==="open"&&channel.bufferedAmount<16000){
       try{channel.send(JSON.stringify({t:"pong",id:msg.id}));}catch{}
      }
      return;
    }
    if(msg?.t==="pong"&&this.pendingPing?.id===msg.id){
      const delta=this.now()-this.pendingPing.sent;
      if(Number.isFinite(delta)&&delta>=0&&delta<12000){
        this.directRttMs=this.directRttMs?Math.round(this.directRttMs*.75+delta*.25):Math.round(delta);
        this.lastPongAt=this.now();this.pendingPing=null;this.onMetrics?.(this.directRttMs);
      }
      return;
    }
    if(msg?.t==="event"&&["action","room","state"].includes(msg.kind))this.onEvent?.(msg);
   };
  }else{try{channel.close();}catch{}return;}
  channel.onopen=()=>this._state();
  channel.onclose=()=>this._state();
  channel.onerror=()=>this._state();
  // Browsers may deliver negotiated channels already OPEN by the time the
  // handler attaches. An existing open channel is just as valid.
  if(channel.readyState==="open")this._state();
 }
 _makeConnection(){
  if(this.closed||!this.available)return false;
  this.cancelIceWait?.();clearTimeout(this.candidateTimer);this.candidateTimer=null;
  this.localCandidates=[];this.localCandidateKeys.clear();this.descriptionPublished=false;
  this.appliedCandidates.clear();this.route="unknown";this.lastStatsAt=-Infinity;
  if(this.pc)try{this.pc.close();}catch{}
  this.pc=new this.RTC({iceServers:this.iceServers});
  this.poseChannel=null;this.eventChannel=null;this.receivedSeq=0;this.lastPoseAt=0;
  this.pendingPing=null;this.lastPongAt=0;this.lastPingSentAt=0;this.directRttMs=0;
  this.ready=false;
  this.pc.ondatachannel=e=>this._attach(e.channel);
  const current=this.pc;
  current.onicecandidate=event=>{
   if(this.closed||this.pc!==current)return;
   const candidate=safeIceCandidate(event.candidate?.toJSON?.()||event.candidate);
   if(!candidate)return;
   const key=JSON.stringify(candidate);
   if(this.localCandidateKeys.has(key)||this.localCandidateKeys.size>=MAX_CANDIDATES)return;
   this.localCandidateKeys.add(key);this.localCandidates.push(candidate);
   if(this.descriptionPublished&&this.candidateTimer===null)
    this.candidateTimer=setTimeout(()=>{this.candidateTimer=null;this._flushLocalCandidates(current);},120);
  };
  const reportIce=()=>{
   if(this.closed||this.pc!==current)return;
   this.iceState=current.iceConnectionState||"unknown";
   this.connectionState=current.connectionState||"unknown";
   this.onIceStatus?.({ice:this.iceState,connection:this.connectionState,turnConfigured:this.iceServers.some(x=>String(x.urls).includes("turn"))});
  };
  current.oniceconnectionstatechange=reportIce;
  this.pc.onconnectionstatechange=()=>{
   reportIce();
   if(["failed","closed","disconnected"].includes(this.pc?.connectionState||"")){
    this.ready=false;this.onState?.(false);
   }
  };
  if(this.initiator){
   this._attach(this.pc.createDataChannel("poses",{ordered:false,maxRetransmits:0}));
   this._attach(this.pc.createDataChannel("events",{ordered:true}));
  }
  return true;
 }
 async _waitForIce(){
  const pc=this.pc;
  if(!pc||pc.iceGatheringState==="complete")return;
  // Prefer one gathered SDP to many HTTP mutations. Bound the initial wait;
  // candidates gathered later continue through authenticated batched signals.
  await new Promise(resolve=>{
   let finished=false;
   const done=()=>{if(finished)return;finished=true;clearTimeout(timeout);pc.removeEventListener?.("icegatheringstatechange",check);if(this.cancelIceWait===done)this.cancelIceWait=null;resolve();};
   const check=()=>{if(pc.iceGatheringState==="complete")done();};
   const timeout=setTimeout(done,ICE_GATHER_WAIT_MS);
   this.cancelIceWait=done;
   pc.addEventListener?.("icegatheringstatechange",check);
   check();
  });
 }
 async _publish(kind){
  const pc=this.pc,sid=this.sessionId;
  await this._waitForIce();
  if(this.closed||this.pc!==pc||this.sessionId!==sid||!pc?.localDescription)return;
  const sdp=pc.localDescription.sdp;
  for(const fragment of splitDirectDescription(kind,sid,sdp))this.relay?.(fragment);
  // Candidates already present in SDP need no additional Netlify mutation.
  this.localCandidates=this.localCandidates.filter(c=>!sdp.split(/\r?\n/).includes("a="+c.candidate));
  this.descriptionPublished=true;
  this._flushLocalCandidates(pc);
 }
 _flushLocalCandidates(pc){
  if(this.closed||this.pc!==pc||!this.descriptionPublished||!validSession(this.sessionId))return;
  while(this.localCandidates.length){
   const candidates=[];
   while(this.localCandidates.length&&candidates.length<4){
    const next=this.localCandidates[0];
    if(JSON.stringify({action:"rtc",kind:"candidates",sid:this.sessionId,candidates:[...candidates,next],roomId:"volcano"}).length>1600)break;
    candidates.push(this.localCandidates.shift());
   }
   if(!candidates.length){this.localCandidates.shift();continue;}
   this.relay?.({action:"rtc",kind:"candidates",sid:this.sessionId,candidates});
  }
 }
 async _applyRemoteCandidates(){
  const pc=this.pc,sid=this.sessionId;
  if(!pc?.remoteDescription||typeof pc.addIceCandidate!=="function")return;
  const candidates=this.remoteCandidates.get(sid)||[];
  this.remoteCandidates.delete(sid);
  for(const candidate of candidates){
   if(this.closed||this.pc!==pc||this.sessionId!==sid)return;
   const key=JSON.stringify(candidate);
   if(this.appliedCandidates.has(key)||this.appliedCandidates.size>=MAX_CANDIDATES)continue;
   this.appliedCandidates.add(key);
   try{await pc.addIceCandidate(candidate);}catch{}
  }
 }
 async start(){
  if(this.closed||!this.available||this.pc)return false;
  try{
   if(!this._makeConnection())return false;
   if(!this.initiator)return true;
   this.sessionId=(globalThis.crypto?.randomUUID?.()||"rtc-"+String(Math.round(this.now()))).replaceAll("-","");
   const offer=await this.pc.createOffer();
   await this.pc.setLocalDescription(offer);
   await this._publish("offer");
   return true;
  }catch{this.close();return false;}
 }
 signal(message){
  if(this.closed||this.queuedSignals>=64)return Promise.resolve(false);
  // A poll can contain offer + candidates together. Preserve order across awaits.
  this.queuedSignals++;
  const task=this.signalQueue.then(()=>this._signal(message)).catch(()=>false);
  this.signalQueue=task.finally(()=>{this.queuedSignals--;});
  return task;
 }
 async _signal(message){
  if(this.closed||!this.available||message?.action!=="rtc")return false;
  if(message.kind==="candidates"){
   if(!isRtcCandidateSignal(message)||this.priorOffers.has(message.sid)||
     (this.initiator&&message.sid!==this.sessionId))return false;
   if(!this.remoteCandidates.has(message.sid)){
    if(this.remoteCandidates.size>=4)return false;
    this.remoteCandidates.set(message.sid,[]);
   }
   const pending=this.remoteCandidates.get(message.sid);
   for(const value of message.candidates){
    const candidate=safeIceCandidate(value),key=JSON.stringify(candidate);
    if(pending.length<MAX_CANDIDATES&&!this.appliedCandidates.has(key)&&!pending.some(c=>JSON.stringify(c)===key))pending.push(candidate);
   }
   if(message.sid===this.sessionId)await this._applyRemoteCandidates();
   return true;
  }
  const assembled=this.assembler.accept(message);
  if(!assembled)return false;
  if(assembled.kind==="offer"&&this.initiator)return false;
  if(assembled.kind==="answer"&&(!this.initiator||assembled.sid!==this.sessionId))return false;
  if(assembled.kind==="offer"&&this.priorOffers.has(assembled.sid))return false;
  if(assembled.kind==="offer"&&this.sessionId===assembled.sid&&this.pc?.remoteDescription)return false;
  try{
   if(assembled.kind==="offer"){
    if(this.sessionId&&this.sessionId!==assembled.sid){
      // A new authenticated offer replaces a previous failed/reopened peer
      // connection. Never call setRemoteDescription(offer) on a live answerer
      // that is still holding the previous answer.
      this.priorOffers.add(this.sessionId);
      this.remoteCandidates.delete(this.sessionId);
      if(this.priorOffers.size>8)this.priorOffers.delete(this.priorOffers.values().next().value);
      this._makeConnection();
    }
    this.sessionId=assembled.sid;
    if(!this.pc||this.pc.connectionState==="failed"||this.pc.connectionState==="closed")this._makeConnection();
    if(!this.pc||this.negotiating)return false;
    this.negotiating=true;
    await this.pc.setRemoteDescription({type:"offer",sdp:assembled.sdp});
    await this._applyRemoteCandidates();
    if(this.closed)return false;
    const answer=await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    await this._publish("answer");
   }else{
    if(!this.pc||this.pc.remoteDescription)return false;
    await this.pc.setRemoteDescription({type:"answer",sdp:assembled.sdp});
    await this._applyRemoteCandidates();
   }
   return true;
  }catch{return false;}finally{this.negotiating=false;}
 }
 ping(){
  if(!this.active)return false;
  const now=this.now();
  if(now-this.lastPingSentAt<1500||this.eventChannel.bufferedAmount>12000)return false;
  if(this.pendingPing&&now-this.pendingPing.sent<4500)return false;
  const id=++this.pingSeq;
  this.pendingPing={id,sent:now};
  this.lastPingSentAt=now;
  try{this.eventChannel.send(JSON.stringify({t:"ping",id}));return true;}
  catch{this.pendingPing=null;return false;}
 }
 async sampleRoute(){
  const pc=this.pc,now=this.now();
  if(!this.active||this.statsBusy||typeof pc?.getStats!=="function"||now-this.lastStatsAt<5000)return;
  this.lastStatsAt=now;this.statsBusy=true;
  try{
   const stats=await pc.getStats();
   if(this.closed||this.pc!==pc)return;
   let pair;
   for(const value of stats.values())if(value.type==="transport"&&value.selectedCandidatePairId)pair=stats.get(value.selectedCandidatePairId);
   if(!pair)for(const value of stats.values())if(value.type==="candidate-pair"&&value.state==="succeeded"&&(value.selected||value.nominated)){pair=value;break;}
   if(!pair)return;
   const local=stats.get(pair.localCandidateId),remote=stats.get(pair.remoteCandidateId);
   this.route=local?.candidateType==="relay"||remote?.candidateType==="relay"?"relay":local&&remote?"p2p":"unknown";
   // Expose route only: no addresses, SDP, ports or TURN credentials in UI.
   this.onRoute?.(this.route);
  }catch{}finally{this.statsBusy=false;}
 }
 sendPose(game){
  if(!this.active||!game?.player)return false;
  const now=this.now();
  if(now-this.lastPoseAt<REALTIME_POSE_MS||this.poseChannel.bufferedAmount>12000)return false;
  const p=game.player;
  const frame=JSON.stringify({
   t:"pose",seq:this.nextSeq+1,room:game.roomId,
   x:p.x,y:p.y,vx:p.vx,vy:p.vy,facing:p.facing,
   evo:p.evo,grounded:p.grounded,melee:p.melee,dash:p.dash
  });
  try{
   this.poseChannel.send(frame);
   this.nextSeq++;this.lastPoseAt=now;
   return true;
  }catch{return false;}
 }
 sendEvent(kind,payload={}){
  if(!this.active||this.eventChannel.bufferedAmount>16000||!["action","room","state"].includes(kind))return false;
  try{this.eventChannel.send(JSON.stringify({t:"event",kind,payload}));return true;}
  catch{return false;}
 }
 close(){
  this.closed=true;
  this.cancelIceWait?.();clearTimeout(this.candidateTimer);this.candidateTimer=null;
  this.remoteCandidates.clear();this.localCandidates=[];this.appliedCandidates.clear();
  this.assembler.reset();
  try{this.poseChannel?.close();}catch{}
  try{this.eventChannel?.close();}catch{}
  try{this.pc?.close();}catch{}
  this.pc=null;this.poseChannel=null;this.eventChannel=null;
  this.pendingPing=null;
  if(this.ready){this.ready=false;this.onState?.(false);}
 }
}
