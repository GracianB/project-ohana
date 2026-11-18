import {drawMichiFilmStage,michiFilmFrame} from './michi-film-stage.js';
// Events are independent of the room topology. Other chapters can opt into the
// same entry/victory/album/exit contract without changing the cinematic player.
export const CHAPTER_STORY=Object.freeze({kilo:'La canción',stitcho:'El vínculo',chispin:'La chispa',cat:'La luz pequeña',cuerno:'La confianza',dragon:'El calor',dino:'La memoria',frita:'La mesa',pizza:'El hogar',yomi:'Las voces'});
// Optional future same-origin media. Empty entries deliberately use live Canvas.
export const CHAPTER_MEDIA={};
const TEXT={
 roomEnter:[['UN SITIO PARA TI','La bufanda sigue en el banco. Alguien la dejó porque sabía que volverías.'],['UNA LUZ PEQUEÑA','Michi no necesita hacerse grande. Cada forma encuentra otra manera de avanzar.'],['EL JARDÍN ESCUCHA','Cuida las raíces, escucha a la familia y devuelve la luz a los cinco faroles. El camino también puede crecer.']],
 chapterBossIntro:[['ALGO SIGUE DESPIERTO','La Polilla guarda la última luz. Lleva mucho tiempo esperando.'],['DENTRO DEL FAROL','Sus alas anuncian la carga, el polen y la lluvia. Cuando abra el farol, podrás alcanzarla.']],
 awaken:[['LA NOCHE RESPIRA','El guardián baja la mirada. Los faroles ya no le temen a la oscuridad.'],['LAS VOCES DEL HOGAR','Tres ecos esperan entre el patio y las ramas. Recógelos para abrir el camino de Cuerno.'],['NADIE VUELVE SOLO','Una luz pequeña puede guiar a toda una familia.']],
 chapterHundred:[['CIEN RECUERDOS','Michi reconoce cada rincón. Nada de lo que parecía pequeño se ha perdido.'],['DIEZ VOCES, UNA HISTORIA','Kilo trae la canción. Stitcho, el vínculo. Chispín, la chispa. Los demás siguen esperando.'],['EL JARDÍN RECUERDA','Cien luces forman un camino hacia casa. Este recuerdo ya es tuyo.']],
 chapterExit:[['TE GUARDÉ UN SITIO','Cuerno esperaba junto al agua. No pregunta cuánto has tardado.'],['NADIE VUELVE SOLO','Michi deja un farol encendido para quien aún busca el camino.'],['LA LUZ PEQUEÑA','La barca se aleja. En la orilla queda un jardín que ya sabe recordar.']]
};
TEXT.chapterBossVictory=[['EL GUARDIÁN RECUERDA','La Polilla no guardaba un tesoro. Esperaba que alguien volviera a encender la luz.'],TEXT.awaken[1],['NO ESTABAS SOLO','El jardín guarda tres voces del hogar. Escúchalas antes de subir a la barca.']];
TEXT.awaken=[['EL SELLO DE MICHI','Las tres voces vuelven a cantar juntas. El jardín recuerda a su familia.'],['EL CAMINO DE CUERNO','La barca espera tras el santuario de la Polilla. Cuerno guarda un sitio para ti.']];
export const CHAPTER_FILMS={cat:TEXT};
export function buildChapterFilm(id,hero,{form=0}={}){
 const script=CHAPTER_FILMS[hero]?.[id];if(!script)return null;
 const staging={roomEnter:['arrival','bench-close','first-light'],chapterBossIntro:['watcher','open-lantern'],chapterBossVictory:['release','voices','first-light'],awaken:['seal','boat-wait'],chapterHundred:['constellation','family','home-path'],chapterExit:['boat-wait','boat-board','boat-home']}[id]||[];
 return script.map(([title,text],i)=>({layout:'chapter-film',title,line:text,text,dur:260,staging:staging[i],close:['bench-close','open-lantern','release'].includes(staging[i]),chapter:hero,event:id,shot:i,form:Math.max(0,Math.min(4,form)),media:CHAPTER_MEDIA[hero]?.[id]?.[i]||null}));
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
 const cine=g.world1Cine,s=cine.shots[cine.i],reduced=!!g.reduceMotion,frame=michiFilmFrame(s,cine.t,reduced);
 c.save();c.fillStyle='#17283f';c.fillRect(0,0,W,H);
 if(!mediaFrame(c,s,W,H,reduced))drawMichiFilmStage(c,g,s,frame,W,H,reduced);
 const compact=W<650,short=H<500,top=Math.min(34,H*.06),captionTop=short?Math.max(H*.60,H-132):H<700?H*.66:H*.75;
 c.fillStyle='#091426';c.fillRect(0,0,W,top);c.fillRect(0,captionTop,W,H-captionTop);
 c.fillStyle='#acb9bb';c.textAlign='left';c.font='600 10px sans-serif';c.fillText('MICHI  /  LA LUZ PEQUEÑA',compact?18:30,Math.max(14,top*.66),W-50);
 const margin=compact?18:30,space=Math.max(140,W-margin*2-(short?300:0)),titleY=captionTop+(short?24:Math.min(38,H*.046));
 c.fillStyle='#e5c6a4';c.font='600 '+(compact?15:short?17:24)+'px sans-serif';c.fillText(s.title,margin,titleY,space);
 c.fillStyle='#e4e4d4';let size=compact?13:short?12:17;
 const full=String(s.text||''),text=reduced||cine.revealed?full:full.slice(0,Math.floor(cine.t*1.6)),startY=titleY+(short?20:26),limit=short?H-18:H-64;
 const wrap=()=>{const rows=[];let row='';for(const word of text.split(' ')){if(c.measureText(row+word).width>space&&row){rows.push(row);row='';}row+=word+' ';}if(row)rows.push(row);return rows;};
 c.font=size+'px sans-serif';let rows=wrap(),lineHeight=short?16:compact?19:24;
 while(startY+(rows.length-1)*lineHeight>limit&&size>10){size--;lineHeight=Math.ceil(size*1.35);c.font=size+'px sans-serif';rows=wrap();}
 rows.forEach((row,i)=>c.fillText(row,margin,startY+i*lineHeight));
 c.fillStyle='#829f9f';c.font='10px sans-serif';c.textAlign='right';c.fillText(String(cine.i+1).padStart(2,'0')+' / '+String(cine.shots.length).padStart(2,'0'),W-margin,top*.66);
 c.restore();
}
