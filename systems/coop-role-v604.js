import {WORLD1_ROOMS} from './world1-rooms.js';
import {ROSTER} from '../characters/roster.js';
import {adventureCamp} from '../multiplayer/adventure-roles.js';
let panel,last='';
export function renderCoopRole(game,snapshot,request){
 if(typeof document==='undefined')return;
 const me=snapshot?.players?.find(p=>p.isYou),owner=WORLD1_ROOMS[game?.roomId]?.hero;
 const visible=game?.onlineAdventure&&snapshot?.mode==='adventure'&&snapshot.phase==='playing'&&me&&owner&&!game.world1Cine&&!game.world1?.cinema&&!game.relicScene;
 if(!visible){if(panel)panel.hidden=true;return;}
 if(!panel){panel=document.createElement('aside');panel.id='ohana-coop-role';panel.setAttribute('aria-label','Relevo de personaje');panel.innerHTML='<strong>RELEVO DE SALA</strong><p></p><div></div><small role="status"></small>';document.body.append(panel);}
 panel.hidden=owner===(me.homeCharacterId||me.characterId)&&me.characterId===owner;
 const camp=adventureCamp(game.roomId,game.player.x,game.player.y,snapshot.adventureProgress)&&game.player.grounded&&!game.player.dead&&me.pose?.grounded!==false&&adventureCamp(game.roomId,me.x,me.y,snapshot.adventureProgress);
 const home=me.homeCharacterId||me.characterId,choices=[...new Set([owner,home])].filter(id=>id!==me.characterId),signature=JSON.stringify([camp,choices,game.roomId,me.characterId]);
 if(signature===last)return;last=signature;
 panel.querySelector('p').textContent=camp?'Puedes usar sus habilidades y volver a tu héroe.':'Relevo en la entrada o junto a un objetivo completado.';
 const buttons=panel.querySelector('div');buttons.replaceChildren();
 for(const id of choices){const button=document.createElement('button');button.type='button';button.disabled=!camp;button.textContent=(id===home?'Volver a ':'Usar a ')+(ROSTER.find(r=>r.id===id)?.name||id);button.onclick=async()=>{button.disabled=true;panel.querySelector('small').textContent='Preparando relevo…';try{await request(id);panel.querySelector('small').textContent='Relevo listo';}catch(e){panel.querySelector('small').textContent=e.message;}finally{button.disabled=!camp;last='';}};buttons.append(button);}
 if(!choices.length)panel.querySelector('p').textContent='Ya tienes al héroe de esta sala.';
}
