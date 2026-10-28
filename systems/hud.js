import { announceAccessibleGameState } from "./a11y-v97.js";
import {XP_NEED} from './xp.js';
function setAttribute(el, name, value) {
  if (el && el.getAttribute(name) !== String(value)) el.setAttribute(name, value);
}

export function progressState(value, max, text) {
  return {
    now: Math.round(Math.max(0, Math.min(100, value / Math.max(1, max) * 100))),
    text
  };
}

function syncProgress(el, state) {
  setAttribute(el, "aria-valuenow", state.now);
  setAttribute(el, "aria-valuetext", state.text);
}

export function syncHudStatus({ player, hp, xpPct, boss, evolutionLocked=false, objective=null, document: doc = document }) {
  const hud = doc.getElementById("hud");
  if (!hud) return;
  setAttribute(hud, "data-health-state", player.health / Math.max(1, player.maxHealth) <= .28 ? "danger" : "healthy");
  setAttribute(hud, "data-form", player.evo + 1);
  setAttribute(hud, "data-hero", player.id);
  const maximum=player.evo>=4,waiting=!maximum&&evolutionLocked&&xpPct>=100;
  setAttribute(hud,"data-evolution-state",maximum?'maximum':waiting?'instrument':'growing');
  syncProgress(hud.querySelector(".bar.hp"), progressState(player.health, player.maxHealth, `${hp} de ${player.maxHealth} puntos de salud`));
  const xp=Math.max(0,Math.floor(Number(player.xp)||0)),need=XP_NEED[player.evo+1];
  const xpDescription=maximum?'Evolución máxima':waiting?`${xp} de ${need} de experiencia. ${player.id==='stitcho'?'Completa':'Despierta'} ${objective?.label||'el siguiente instrumento'} para evolucionar`:`${xp} de ${need} de experiencia; ${Math.round(xpPct)}% hasta la siguiente forma`;
  syncProgress(hud.querySelector(".bar.xp"), progressState(xpPct, 100, xpDescription));
  setAttribute(hud.querySelector('.bar.xp'),'title',xpDescription);
  const xpText=doc.getElementById('xp-text'),meta=doc.getElementById('hud-meta');
  const visibleXP=maximum?'MÁXIMO':`${xp}/${need}${waiting?(player.id==='stitcho'?' · REPARA':' · INSTR.'):''}`;
  if(xpText&&xpText.textContent!==visibleXP)xpText.textContent=visibleXP;
  const formName=player.evoNames?.[player.evo]||player.forms?.[player.evo]?.name;
  const metaText=waiting?(player.id==='stitcho'?'XP lista · completa la reparación':'XP lista · toca el instrumento'):`Forma ${player.evo+1}/5${formName?' · '+formName:''}`;
  if(meta&&meta.textContent!==metaText)meta.textContent=metaText;
  if (boss) syncProgress(doc.querySelector(".bar.boss"), progressState(boss.hp, boss.max, `${Math.max(0, Math.ceil(boss.hp))} de ${boss.max} puntos de salud`));
  setAttribute(doc.getElementById("form-pips"), "aria-label", `Forma ${player.evo + 1} de 5`);
  const avatar=doc.getElementById("hud-avatar");
  setAttribute(avatar, "aria-label", `${player.name} · ${formName||'forma '+(player.evo+1)} · ${player.evo+1} de 5`);
  setAttribute(avatar,'data-form',player.evo+1);
  hud.querySelector(".hud-block.player")?.classList.toggle("hurt", player.health / Math.max(1, player.maxHealth) <= 0.28);
  announceAccessibleGameState(doc,player,boss);
  const tint = player.color || "#7ee7ff";
  if (hud.style.getPropertyValue("--tint") !== tint) hud.style.setProperty("--tint", tint);
}

