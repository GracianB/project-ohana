// Interface-only enhancements for the OHANA multiplayer lobby.
// The room lifecycle, mutations and transport stay in multiplayer.js.
import { ROSTER } from "../characters/roster.js";
const $ = (id) => document.getElementById(id);
const LANG_KEY = "ohana-lobby-lang";
const CODE = /^[A-HJ-NP-Z2-9]{6}$/;
const params = new URLSearchParams(location.search);
let lang = (params.get("lang") || localStorage.getItem(LANG_KEY) || "es").toLowerCase().startsWith("en") ? "en" : "es";
if (params.has("lang")) localStorage.setItem(LANG_KEY, lang);

const STATIC = {
  ".coop-head h1": ["PROJECT <span>OHANA</span><small class=\"header-tagline\">· DOS EN LA MISMA ISLA</small>", "PROJECT <span>OHANA</span><small class=\"header-tagline\">· TWO ON ONE ISLAND</small>"],
  ".coop-head-actions > a": ["Volver a OHANA", "Back to OHANA"],
  "#entry > .eyebrow": ["DOS JUGADORES · UNA SOLA ISLA", "TWO PLAYERS · ONE ISLAND"],
  "#entry > h2": ["La aventura cambia cuando la compartes.", "The adventure changes when you share it."],
  ".entry-intro": ["Invita a alguien a Isla Hoku. Elegid un modo, escoged héroes distintos y empezad en unos segundos.", "Invite someone to Isla Hoku. Pick a mode, choose different heroes and start playing in seconds."],
  ".mode-card[data-mode='adventure'] strong": ["Aventura cooperativa", "Co-op adventure"],
  ".mode-card[data-mode='adventure'] small": ["Explorad juntos y enfrentaos a los guardianes de la isla.", "Explore together and face the island guardians."],
  ".mode-card[data-mode='versus'] small": ["Dos héroes, una arena y tres eliminaciones para ganar.", "Two heroes, one arena and three knockouts to win."],
  ".create-card .card-kicker": ["ANFITRIÓN", "HOST"],
  ".create-card h3": ["Crear sala", "Create a room"],
  ".create-card > p": ["Abre una partida y comparte el código con tu compañero.", "Start a match and share the room code with your teammate."],
  "#create-room span:first-child": ["Crear sala", "Create room"],
  ".join-card .card-kicker": ["INVITADO", "GUEST"],
  ".join-card h3": ["Unirse con código", "Join with a code"],
  ".join-card > p": ["Pega el código que te ha enviado quien creó la sala.", "Enter the code sent by the person who created the room."],
  "#join-room": ["Unirse", "Join room"],
  "#room-input": ["ABC · 123", "ABC · 123"],
  "#lobby > .eyebrow": ["ANTES DE PARTIR", "BEFORE YOU SET OFF"],
  "#lobby > h2": ["Elegid a vuestros héroes", "Choose your heroes"],
  "#lobby > p:not([id]):not(.eyebrow)": ["Cada jugador elige su héroe y pulsa Listo cuando quiera partir. Podrás cambiar de idea antes de empezar.", "Choose your hero and press Ready when you are set. You can change your mind before the adventure begins."],
  ".room-row .sub-label": ["CÓDIGO PARA INVITAR", "ROOM INVITE CODE"],
  ".roster-layout > div > h3": ["Elige tu personaje", "Choose your hero"],
  "#share-link": ["Compartir enlace", "Share invite link"],
  "#copy-code": ["Copiar", "Copy code"],
  "#change-character": ["Volver y cambiar héroe", "Back and change hero"],
  "#leave-room .leave-label": ["Volver al inicio", "Back to start"],
  "#room-mode option[value='adventure']": ["Aventura juntos", "Co-op adventure"],
  "#room-mode option[value='versus']": ["Versus · tres eliminaciones", "Versus · three knockouts"],
};
const DYNAMIC = [
  [/^Copiar$/, "Copy"], [/^Copiado$/, "Copied"], [/^Enlace copiado$/, "Link copied"], [/^Compartir enlace$/, "Share invite link"],
  [/^Listo$/, "Ready"], [/^Tu compañero ya eligió a (.+)\. Elige otro héroe\.$/, "Your teammate already picked $1. Choose another hero."],
  [/^Ese héroe ya lo eligió tu compañero\. Elige otro\.$/, "Your teammate already picked that hero. Choose another."],
  [/^Confirmar personaje$/, "Ready · confirm hero"], [/^Retirar preparación$/, "Not ready"], [/^Listo · confirmar héroe$/, "Ready · confirm hero"],
  [/^Elige tu personaje$/, "Choose your hero"], [/^El elenco y sus formas vienen del OHANA original\.$/, "Meet the original OHANA cast."],
  [/^Esperando a los dos jugadores\.$/, "Waiting for both players."],
  [/^Los dos están preparados\..*$/, "Both players are ready. The intro starts when the second hero confirms."],
  [/^Sala (\d)\/2 · .*$/, "Room $1/2 · Pick and confirm your hero. Each player chooses on their own device."],
  [/^Jugador (\d)( · Tú)?$/, (_m, n, you) => `Player ${n}${you ? " · You" : ""}`],
  [/^Esperando conexión$/, "Waiting to connect"], [/^Elige personaje$/, "Choosing a hero"],
  [/^(.+) · Preparado$/, "$1 · Ready"], [/^(.+) · Eligiendo$/, "$1 · Choosing"],
  [/^Conexión inestable\. Reintentando automáticamente…$/, "Connection is unstable. Retrying…"],
  [/^El servidor tardó demasiado\. Reintentando la conexión\.$/, "The server took too long. Retrying…"],
  [/^Esta sala se reanudó desde otra pestaña\..*$/, "This room resumed in another tab. Reload to recover your session."],
  [/^No se pudo copiar el código\.$/, "Couldn't copy the code."],
];
const PILL = {
  es: { connected: "Conectado", reconnecting: "Reconectando…", offline: "Sin conexión · reintentando", "session-conflict": "Sesión abierta en otra pestaña" },
  en: { connected: "Connected", reconnecting: "Reconnecting…", offline: "Offline · retrying", "session-conflict": "Session open in another tab" },
};

function applyStatic() {
  for (const [selector, values] of Object.entries(STATIC)) {
    const element = document.querySelector(selector);
    if (!element) continue;
    const value = values[lang === "en" ? 1 : 0];
    if (selector === "#room-input") {
      element.placeholder = value;
      element.setAttribute("aria-label", lang === "en" ? "Room code" : "Código de sala");
    } else if (element.matches("option")) element.textContent = value;
    else if (selector === "#create-room span:first-child") element.textContent = value;
    else if (selector === "#share-link" || selector === "#copy-code" || selector === "#confirm-character" || selector === "#change-character" || selector === "#join-room") element.textContent = value;
    else if (element.matches(".coop-head h1")) element.innerHTML = value;
    else element.textContent = value;
  }
  document.documentElement.lang = lang;
  const es = $("lang-es"), en = $("lang-en");
  es?.setAttribute("aria-pressed", String(lang === "es"));
  en?.setAttribute("aria-pressed", String(lang === "en"));
  es?.classList.toggle("is-active", lang === "es");
  en?.classList.toggle("is-active", lang === "en");
  document.querySelector(".language-switch")?.setAttribute("aria-label", lang === "en" ? "Language" : "Idioma");
  document.querySelector(".mode-picker")?.setAttribute("aria-label", lang === "en" ? "Game mode" : "Modo de partida");
  if ($("room-input")) $("room-input").setAttribute("aria-label", lang === "en" ? "Room code" : "Código de sala");
  $("leave-room")?.setAttribute("aria-label", lang === "en" ? "Back to start and leave the room" : "Volver al inicio y salir de la sala");
  if (lang === "es" && $("confirm-character")?.textContent.trim() === "Ready") $("confirm-character").textContent = "Listo";
}

function translateNode(element) {
  if (lang !== "en" || !element) return;
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue.trim();
      if (!text) return;
      for (const [pattern, replacement] of DYNAMIC) {
        if (!pattern.test(text)) continue;
        const translated = text.replace(pattern, replacement);
        if (translated !== text) node.nodeValue = node.nodeValue.replace(text, translated);
        return;
      }
    } else for (const child of [...node.childNodes]) walk(child);
  };
  walk(element);
}

const dynamicIds = ["lobby-status", "lobby-error", "entry-error", "player-slots", "lobby-character-name", "lobby-character-detail", "confirm-character", "change-character", "copy-code", "share-link"];
const observer = new MutationObserver((records) => {
  if (lang !== "en") return;
  observer.disconnect();
  for (const record of records) translateNode(record.target.nodeType === Node.TEXT_NODE ? record.target.parentNode : record.target);
  observeDynamic();
});
function observeDynamic() { for (const id of dynamicIds) { const el = $(id); if (el) observer.observe(el, { childList: true, characterData: true, subtree: true }); } }

function setMode(mode, emit = true) {
  const valid = mode === "versus" ? "versus" : "adventure";
  const select = $("room-mode");
  if (select && select.value !== valid) {
    select.value = valid;
    if (emit) select.dispatchEvent(new Event("change", { bubbles: true }));
  }
  for (const card of document.querySelectorAll(".mode-card")) {
    const active = card.dataset.mode === valid;
    card.classList.toggle("is-selected", active);
    card.setAttribute("aria-checked", String(active));
    card.tabIndex = active ? 0 : -1;
  }
  if ($("arena-choice")) $("arena-choice").hidden = valid !== "versus";
}

function setLang(next) {
  lang = next === "en" ? "en" : "es";
  localStorage.setItem(LANG_KEY, lang);
  applyStatic();
  const invite = (params.get("room") || "").trim().toUpperCase();
  const banner = $("invite-banner");
  if (banner && !banner.hidden && CODE.test(invite)) {
    banner.textContent = lang === "en" ? `You've been invited to room ${invite}. Press Join room to enter.` : `Te han invitado a la sala ${invite}. Pulsa Unirse para entrar.`;
  }
  if (lang === "en") for (const id of dynamicIds) translateNode($(id));
  else document.dispatchEvent(new CustomEvent("ohana:lang"));
  renderLink(); renderConnection();
  const url = new URL(location.href);
  if (lang === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
  history.replaceState(null, "", url);
}

function roomCode() { return (window.__ohanaRoom?.() || $("room-code")?.textContent || "").trim().toUpperCase(); }
function inviteUrl(code) {
  const url = new URL(location.href); url.search = ""; url.hash = "";
  url.searchParams.set("room", code); if (lang === "en") url.searchParams.set("lang", "en");
  return url.href;
}
function renderLink() {
  const code = roomCode(), field = $("share-url");
  if (field && CODE.test(code)) { const value = inviteUrl(code); if (field.value !== value) field.value = value; field.hidden = false; }
}
function renderConnection() {
  const pill = $("net-pill"); if (!pill) return;
  const state = window.__ohanaNet?.() || (navigator.onLine === false ? "offline" : "connected");
  pill.dataset.state = state;
  const label = PILL[lang][state] || PILL[lang].connected;
  if (pill.textContent.trim() !== label) pill.replaceChildren(Object.assign(document.createElement("i"), { "aria-hidden": "true" }), document.createTextNode(label));
}
function inviteInit() {
  const code = (params.get("room") || "").trim().toUpperCase();
  if (!CODE.test(code)) return;
  const input = $("room-input"); if (input && !input.value) input.value = code;
  const banner = $("invite-banner");
  document.querySelector(".join-card")?.classList.add("invited");
  if (banner) {
    banner.hidden = false;
    banner.textContent = lang === "en" ? `You've been invited to room ${code}. Press Join room to enter.` : `Te han invitado a la sala ${code}. Pulsa Unirse para entrar.`;
  }
  setTimeout(() => { if (!$("entry")?.hidden) $("room-input")?.focus({ preventScroll: false }); }, 50);
}

function decorateHeroCards() {
  const grid = $("character-grid"); if (!grid) return;
  for (const card of grid.querySelectorAll(".character-card")) {
    const name = card.querySelector("span")?.textContent.trim();
    const hero = ROSTER.find((item) => item.name === name);
    if (hero && !card.querySelector(".hero-ability")) {
      const ability = document.createElement("small");
      ability.className = "hero-ability";
      ability.textContent = hero.tag || hero.role;
      card.append(ability);
    }
  }
  // Partner picks and taken heroes are marked by multiplayer.js from the room snapshot.
}

$("lang-es")?.addEventListener("click", () => setLang("es"));
$("lang-en")?.addEventListener("click", () => setLang("en"));
document.querySelectorAll(".mode-card").forEach((card) => card.addEventListener("click", () => setMode(card.dataset.mode)));
document.querySelectorAll(".mode-card").forEach((card, index, cards) => card.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === "Home" ? 0 : event.key === "End" ? cards.length - 1 : (index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : cards.length - 1)) % cards.length;
  cards[next].focus(); cards[next].click();
}));
$("share-link")?.addEventListener("click", async () => {
  const code = roomCode(); if (!CODE.test(code)) return;
  const url = inviteUrl(code); const button = $("share-link");
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare({ url }))) { await navigator.share({ title: "Project OHANA", text: lang === "en" ? `Join my OHANA room ${code}!` : `¡Únete a mi sala OHANA ${code}!`, url }); return; }
  } catch (error) { if (error?.name === "AbortError") return; }
  try {
    await (window.__ohanaCopy || ((value) => navigator.clipboard.writeText(value)))(url);
    button.textContent = lang === "en" ? "Link copied" : "Enlace copiado";
    setTimeout(() => { button.textContent = lang === "en" ? "Share invite link" : "Compartir enlace"; }, 1800);
  } catch { $("share-url")?.focus(); $("share-url")?.select(); }
});
$("share-url")?.addEventListener("focus", (event) => event.target.select());
$("change-character")?.addEventListener("click", () => {
  // Reuse the lobby's existing ready/unready action. No network behavior is added here.
  $("confirm-character")?.click();
  setTimeout(() => document.querySelector(".character-card.selected")?.focus({ preventScroll: true }), 80);
});

applyStatic(); observeDynamic(); inviteInit();
if (lang === "en") for (const id of dynamicIds) translateNode($(id));
setMode($("room-mode")?.value || "adventure", false);
const heroObserver = new MutationObserver(decorateHeroCards);
if ($("character-grid")) heroObserver.observe($("character-grid"), { childList: true, subtree: true });
if ($("player-slots")) heroObserver.observe($("player-slots"), { childList: true, subtree: true, characterData: true });
decorateHeroCards();
setInterval(() => {
  if (!$("lobby")?.hidden) { renderConnection(); renderLink(); }
  const confirm = $("confirm-character");
  const ready = [...document.querySelectorAll(".player-slot.ready")].some((slot) => /·\s*(Tú|You)/.test(slot.querySelector("b")?.textContent || ""));
  if (confirm) confirm.hidden = ready;
  if ($("change-character")) $("change-character").hidden = !ready;
}, 350);
window.addEventListener("online", renderConnection);
window.addEventListener("offline", renderConnection);
