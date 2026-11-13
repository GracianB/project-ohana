import {ROSTER} from '../characters/roster.js';
import {WORLD1_ORDER} from './world1-rooms.js';
import {canonId} from './save.js';
const bound=v=>Math.max(0,Math.min(4,Math.floor(Number.isFinite(Number(v))?Number(v):0)));
export function atlasEarnedForm(hero,{save=null,seals=[],earned={}}={}){
 if(!ROSTER.some(r=>r.id===hero))return 0;
 return Math.max(bound(earned[hero]),seals.includes(hero)?4:0,save&&canonId(save.id)===hero?bound(save.evo):0);
}
export function atlasSelection(hero,room,form,progress={}){
 const def=ROSTER.find(r=>r.id===hero)||ROSTER[0],final=room==='w1-final';
 // Chapters currently teach their owner's unique skills. Never silently swap a
 // confirmed fighter after the player enters the game.
 const owner=WORLD1_ORDER.find(id=>room==='w1-'+id);
 const id=final?def.id:owner||def.id;
 return {hero:id,room:final?'w1-final':'w1-'+id,form:Math.min(bound(form),atlasEarnedForm(id,progress)),allowed:!final||WORLD1_ORDER.every(id=>(progress.seals||[]).includes(id))};
}
export function atlasProgress(storage,save,seals=[]){
 let earned={};try{const raw=JSON.parse(storage?.getItem('ohana-atlas-earned-v1')||'{}');for(const id of WORLD1_ORDER)earned[id]=bound(raw?.[id]);}catch{}
 for(const id of WORLD1_ORDER)earned[id]=atlasEarnedForm(id,{save,seals,earned});
 try{storage?.setItem('ohana-atlas-earned-v1',JSON.stringify(earned));}catch{}
 return {save,seals,earned};
}
export const ATLAS_MODES=Object.freeze([
 {id:'adventure',name:'Aventura cooperativa',text:'Recorred Hoku juntos. Una historia compartida.',href:'https://project-ohana-multiplayer.netlify.app/multiplayer?mode=adventure'},
 {id:'versus',name:'Versus',text:'Dos héroes. Una arena. Un duelo entre amigos.',href:'https://project-ohana-multiplayer.netlify.app/multiplayer?mode=versus'}
]);
export function atlasGamepadIntent(pad,previous={}){
 const pressed=i=>!!pad?.buttons?.[i]?.pressed;
 const direction=pressed(15)||(pad?.axes?.[0]||0)>.6?1:pressed(14)||(pad?.axes?.[0]||0)<-.6?-1:pressed(13)||(pad?.axes?.[1]||0)>.6?1:pressed(12)||(pad?.axes?.[1]||0)<-.6?-1:0;
 const next={direction,confirm:pressed(0),back:pressed(1)};
 return {state:next,move:direction!==previous.direction?direction:0,confirm:next.confirm&&!previous.confirm,back:next.back&&!previous.back};
}
