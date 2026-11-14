import {drawFamilyActor} from './family-actor.js';
import {drawSanctuaryLantern,drawMichiSanctuaryBackdrop} from '../worlds/michi-sanctuary-art.js';
// Events are independent of the room topology. Other chapters can opt into the
// same entry/victory/album/exit contract without changing the cinematic player.
export const CHAPTER_STORY=Object.freeze({kilo:'La canción',stitcho:'El vínculo',chispin:'La chispa',cat:'La luz pequeña',cuerno:'La confianza',dragon:'El calor',dino:'La memoria',frita:'La mesa',pizza:'El hogar',yomi:'Las voces'});
// Optional future same-origin media. Empty entries deliberately use live Canvas.
export const CHAPTER_MEDIA={};
const TEXT={
 roomEnter:[['EL JARDÍN DE LAS NUEVE VIDAS','El Eco apagó los faroles. Las raíces olvidaron el camino a casa.'],['UNA LUZ PEQUEÑA','Michi no necesita hacerse grande. Cada forma encuentra otra manera de avanzar.'],['CINCO FAROLES, UN HOGAR','Enciende el primer farol. Sigue las madrigueras hacia las raíces y devuelve la luz al jardín.']],
 chapterBossIntro:[['EL GUARDIÁN DEL UMBRAL','La última luz despierta a quien custodia el recuerdo. Observa su aviso; responde cuando descanse.']],
 awaken:[['LA NOCHE RESPIRA','El guardián baja la mirada. Los faroles ya no le temen a la oscuridad.'],['LAS VOCES DEL HOGAR','Tres ecos esperan entre el patio y las ramas. Recógelos para abrir el camino de Cuerno.'],['NADIE VUELVE SOLO','Una luz pequeña puede guiar a toda una familia.']],
 chapterHundred:[['CIEN RECUERDOS','Michi reconoce cada rincón. Nada de lo que parecía pequeño se ha perdido.'],['DIEZ VOCES, UNA HISTORIA','Kilo trae la canción. Stitcho, el vínculo. Chispín, la chispa. Los demás siguen esperando.'],['EL JARDÍN RECUERDA','Cien luces forman un camino hacia casa. Este recuerdo ya es tuyo.']],
 chapterExit:[['AL OTRO LADO DE LAS RAÍCES','Michi deja un farol encendido. Cuerno reconocerá el camino.']]
};
TEXT.chapterBossVictory=[TEXT.awaken[0],TEXT.awaken[1],['REGRESA POR LAS MADRIGUERAS','El patio y el jardín guardan las tres voces. El farol abierto te señala el regreso.']];
TEXT.awaken=[['EL SELLO DE MICHI','Las tres voces vuelven a cantar juntas. El jardín recuerda a su familia.'],['EL CAMINO DE CUERNO','Vuelve al patio. Su arco del oeste te lleva al muelle del este y al siguiente capítulo.']];
export const CHAPTER_FILMS={cat:TEXT};
export function buildChapterFilm(id,hero,{form=0}={}){
 const script=CHAPTER_FILMS[hero]?.[id];if(!script)return null;
 return script.map(([title,text],i)=>({layout:'chapter-film',title,line:text,text,dur:260,chapter:hero,event:id,shot:i,form:Math.max(0,Math.min(4,form)),media:CHAPTER_MEDIA[hero]?.[id]?.[i]||null}));
}
const mediaCache=new Map();
export function stopChapterMedia(){for(const m of mediaCache.values())m.pause();}
function mediaFrame(c,shot,W,H,reduced){
 const src=shot.media?.video;if(!src||reduced||typeof document==='undefined')return false;
 let url;try{url=new URL(src,location.href);if(url.origin!==location.origin||!url.pathname.startsWith(new URL('assets/cinema/',document.baseURI).pathname))return false;}catch{return false;}
 let v=mediaCache.get(src);if(!v){v=document.createElement('video');v.src=url.href;v.muted=true;v.playsInline=true;v.preload='auto';mediaCache.set(src,v);}
 if(v.readyState<2)return false;if(v.paused&&!v.ended)v.play().catch(()=>{});c.drawImage(v,0,0,W,H);return true;
}
export function drawChapterFilm(c,g,W,H,t){
 const cine=g.world1Cine,s=cine.shots[cine.i],reduced=!!g.reduceMotion,k=reduced?.5:Math.min(1,cine.t/s.dur),foot=H*.71;
 c.save();c.fillStyle='#102c38';c.fillRect(0,0,W,H);
 if(!mediaFrame(c,s,W,H,reduced)){
  if(!drawMichiSanctuaryBackdrop(c,g,{x:s.shot*240,y:0},t,W,H)){c.fillStyle='#e9dfbc';c.beginPath();c.arc(W*.79,H*.24,Math.min(W,H)*.075,0,Math.PI*2);c.fill();}
  c.fillStyle='#24434b';c.fillRect(0,foot,W,H-foot);c.fillStyle='#73978b';c.fillRect(0,foot,W,4);
  const lit=s.event!=='roomEnter'||s.shot>0;for(let i=0;i<5;i++)drawSanctuaryLantern(c,W*(.18+i*.16),foot-70,lit&&(i<=s.shot||s.event!=='roomEnter'),t,true);
  const x=W*(.28+k*.17),height=Math.min(H*.29,W*.22,150),pose=reduced?'idle':s.event==='roomEnter'&&s.shot===0?'run':s.event==='awaken'?'victory':s.shot===1?'cast':'idle';
  if(!(s.event==='chapterHundred'&&s.shot===1))drawFamilyActor(c,'cat',x,foot,height/60,t,{form:s.form,pose},reduced);
  if(s.event==='chapterHundred'&&s.shot===1){Object.keys(CHAPTER_STORY).forEach((hero,i)=>{const compact=W<650,xx=compact?W*(.12+(i%5)*.19):W*(.06+i*.098),yy=compact?foot-(i<5?H*.12:0):foot;drawFamilyActor(c,hero,xx,yy,Math.min(compact?58:95,W*(compact?.15:.075))/60,t,{form:0,pose:'victory'},reduced);});}
  if(s.event==='chapterExit')drawFamilyActor(c,'cuerno',W*.73,foot,height*.78/60,t,{form:0,pose:'idle'},reduced);
  if(s.event==='chapterBossIntro'){c.fillStyle='#8dd7c6';for(const side of[-1,1]){c.beginPath();c.ellipse(W*.73+side*35,foot-80,50,24,side*.6,0,Math.PI*2);c.fill();}drawSanctuaryLantern(c,W*.73,foot-60,true,t);}
 }
 const bar=Math.min(86,H*.12);c.fillStyle='#071e2a';c.fillRect(0,0,W,bar);c.fillRect(0,H*.76,W,H*.24);c.fillStyle='#8dd7c6';c.textAlign='left';c.font='600 '+Math.max(13,Math.min(24,W*.032))+'px sans-serif';c.fillText(s.title,24,H*.815,Math.max(1,W-48));
 c.fillStyle='#e9dfbc';c.font=Math.max(12,Math.min(17,W*.024))+'px sans-serif';const words=s.text.split(' '),max=W-48;let line='',y=H*.86;for(const word of words){if(c.measureText(line+word).width>max&&line){c.fillText(line,24,y);line='';y+=22;}line+=word+' ';}c.fillText(line,24,y);
 c.fillStyle='#a8c9bf';c.font='11px sans-serif';c.textAlign='right';c.fillText(''+(cine.i+1)+'/'+cine.shots.length,W-24,H-13);c.restore();
}
