// OHANA multiplayer lobby UX: invite links (?room=CODE), share/copy link,
// live connection pill and an ES/EN toggle. Spanish stays the default so the
// existing flows and tests keep their labels; English is opt-in (?lang=en or toggle).
const $ = (id) => document.getElementById(id);
const CODE = /^[A-HJ-NP-Z2-9]{6}$/;
const LANG_KEY = "ohana-lobby-lang";

const STATIC_EN = [
  [".coop-head h1", 'PROJECT <span>OHANA</span> · TWO ON ONE ISLAND', true],
  [".coop-head a[href='./index.html']", "Back to OHANA"],
  ["#entry > .eyebrow", "TWO PLAYERS · ONE ADVENTURE"],
  ["#entry > h2", "Isla Hoku, now together"],
  ["#entry > p:not(.eyebrow):not(.coop-error):not(#invite-banner)", "Pick different heroes and a mode. Versus pits two heroes against creatures and a guardian; Adventure lets you explore together and vote to move rooms. Create a room, share the code and play with a friend on another device."],
  [".campaign-teaser", '<span>Ten heroes</span><i aria-hidden="true">→</i><span>Adventure or Versus</span><i aria-hidden="true">→</i><strong>One game together</strong>', true],
  [".coop-actions .coop-card:nth-child(1) h3", "Create a room"],
  [".coop-actions .coop-card:nth-child(1) > p", "Create your shared island and pass the code to the other player."],
  [".coop-actions .coop-card:nth-child(2) h3", "Join a room"],
  [".coop-actions .coop-card:nth-child(2) > p", "Enter the code from the player who created the room."],
  ["#create-room", "Create room"],
  ["#join-room", "Join"],
  ["#room-mode option[value='adventure']", "Adventure together"],
  ["#room-mode option[value='versus']", "Versus · three knockouts"],
  ["#lobby > .eyebrow", "BEFORE YOU SET OFF"],
  ["#lobby > h2", "Choose your heroes"],
  ["#lobby > p:not([id]):not(.eyebrow)", "The grid shows OHANA's drawn cast. Each player picks and confirms a hero when ready."],
  [".room-row .sub-label", "ROOM CODE"],
  [".roster-layout h3", "OHANA heroes"],
  ["#share-link", "Share link"],
];
const DYNAMIC_EN = [
  [/^Copiar$/, "Copy"], [/^Copiado$/, "Copied"], [/^Enlace copiado$/, "Link copied"], [/^Compartir enlace$/, "Share link"],
  [/^Confirmar personaje$/, "Confirm hero"], [/^Retirar preparación$/, "Not ready"],
  [/^Elige tu personaje$/, "Choose your hero"], [/^El elenco y sus formas vienen del OHANA original\.$/, "The cast and their forms come from the original OHANA."],
  [/^Esperando a los dos jugadores\.$/, "Waiting for both players."],
  [/^Los dos están preparados\..*$/, "Both players are ready. The intro starts as soon as the second hero is confirmed."],
  [/^Sala (\d)\/2 · .*$/, "Room $1/2 · Pick and confirm your hero. Each player chooses on their own device."],
  [/^Jugador (\d)( · Tú)?$/, (m, n, you) => `Player ${n}${you ? " · You" : ""}`],
  [/^Esperando conexión$/, "Waiting to connect"], [/^Elige personaje$/, "Choosing a hero"],
  [/^(.+) · Preparado$/, "$1 · Ready"], [/^(.+) · Eligiendo$/, "$1 · Choosing"],
  [/^Conexión inestable\. Reintentando automáticamente…$/, "Unstable connection. Retrying automatically…"],
  [/^El servidor tardó demasiado\. Reintentando la conexión\.$/, "The server took too long. Retrying…"],
  [/^Esta sala se reanudó desde otra pestaña\..*$/, "This room was resumed in another tab. Reload this page to recover your session."],
  [/^No se pudo copiar el código\.$/, "Couldn't copy the code."],
];
const PILL = {
  es: { connected: "Conectado", reconnecting: "Reconectando…", offline: "Sin conexión · reintentaremos", "session-conflict": "Sesión abierta en otra pestaña" },
  en: { connected: "Connected", reconnecting: "Reconnecting…", offline: "Offline · we'll retry", "session-conflict": "Session open in another tab" },
};
const INVITE = {
  es: (c) => `Te han invitado a la sala <b>${c}</b>. Pulsa <b>Unirse</b> para entrar.`,
  en: (c) => `You've been invited to room <b>${c}</b>. Press <b>Join</b> to enter.`,
};

const params = new URLSearchParams(location.search);
let lang = (params.get("lang") || localStorage.getItem(LANG_KEY) || "es").toLowerCase().startsWith("en") ? "en" : "es";
const originals = new Map();

function applyStatic() {
  for (const [selector, en, html] of STATIC_EN) {
    for (const el of document.querySelectorAll(selector)) {
      if (!originals.has(el)) originals.set(el, html ? el.innerHTML : el.textContent);
      const value = lang === "en" ? en : originals.get(el);
      if (html) { if (el.innerHTML !== value) el.innerHTML = value; }
      else if (el.textContent !== value) el.textContent = value;
    }
  }
  const input = $("room-input"); if (input) input.setAttribute("aria-label", lang === "en" ? "Room code" : "Código de sala");
  document.documentElement.lang = lang;
  const toggle = $("lang-toggle");
  if (toggle) { toggle.textContent = lang === "en" ? "Español" : "English"; toggle.setAttribute("aria-label", lang === "en" ? "Cambiar a español" : "Switch to English"); }
}
function translateNode(el) {
  if (lang !== "en" || !el) return;
  const walk = (node) => {
    if (node.nodeType === 3) {
      const text = node.nodeValue.trim(); if (!text) return;
      for (const [re, rep] of DYNAMIC_EN) if (re.test(text)) { const out = text.replace(re, rep); if (out !== text) node.nodeValue = node.nodeValue.replace(text, out); return; }
    } else for (const child of node.childNodes) walk(child);
  };
  walk(el);
}
const DYNAMIC_IDS = ["lobby-status", "lobby-error", "entry-error", "player-slots", "lobby-character-name", "lobby-character-detail", "confirm-character", "copy-code", "share-link"];
const observer = new MutationObserver((records) => {
  if (lang !== "en") return;
  observer.disconnect();
  for (const r of records) translateNode(r.target.nodeType === 3 ? r.target.parentNode : r.target);
  observe();
});
function observe() { for (const id of DYNAMIC_IDS) { const el = $(id); if (el) observer.observe(el, { childList: true, characterData: true, subtree: true }); } }

function inviteLink(code) {
  const url = new URL(location.href);
  url.search = ""; url.hash = ""; url.searchParams.set("room", code);
  if (lang === "en") url.searchParams.set("lang", "en");
  return url.href;
}
function currentCode() { return (window.__ohanaRoom?.() || $("room-code")?.textContent || "").trim().toUpperCase(); }

async function share() {
  const code = currentCode(); if (!CODE.test(code)) return;
  const url = inviteLink(code);
  const text = lang === "en" ? `Join my OHANA room ${code} and play with me on Isla Hoku!` : `¡Únete a mi sala de OHANA ${code} y juega conmigo en Isla Hoku!`;
  const btn = $("share-link");
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare({ url }))) { await navigator.share({ title: "Project OHANA", text, url }); return; }
  } catch (error) { if (error?.name === "AbortError") return; }
  try { await (window.__ohanaCopy || ((t) => navigator.clipboard.writeText(t)))(url); btn.textContent = lang === "en" ? "Link copied" : "Enlace copiado"; setTimeout(() => { btn.textContent = lang === "en" ? "Share link" : "Compartir enlace"; }, 1800); }
  catch { const field = $("share-url"); field?.focus(); field?.select(); }
}

function renderLinkField() {
  const code = currentCode(), field = $("share-url");
  if (field && CODE.test(code)) { const link = inviteLink(code); if (field.value !== link) field.value = link; field.hidden = false; }
}
function renderPill() {
  const pill = $("net-pill"); if (!pill) return;
  const net = window.__ohanaNet?.() || (navigator.onLine === false ? "offline" : "connected");
  pill.dataset.state = net;
  const label = (PILL[lang][net] || PILL[lang].connected);
  if (pill.lastChild?.nodeValue !== label) pill.replaceChildren(Object.assign(document.createElement("i"), { ariaHidden: "true" }), document.createTextNode(label));
}

function setupInvite() {
  const code = (params.get("room") || "").trim().toUpperCase();
  if (!CODE.test(code)) return;
  const input = $("room-input"); if (input && !input.value) input.value = code;
  const banner = $("invite-banner");
  const joinCard = document.querySelector(".coop-actions .coop-card:nth-child(2)");
  joinCard?.classList.add("invited");
  if (banner) { banner.hidden = false; banner.innerHTML = INVITE[lang](code); }
  // Only focus when the entry screen is visible (a resumed session skips it).
  setTimeout(() => { if (!$("entry")?.hidden) $("join-room")?.focus({ preventScroll: false }); }, 50);
}

function setLang(next) {
  lang = next; localStorage.setItem(LANG_KEY, lang);
  applyStatic();
  const code = (params.get("room") || "").trim().toUpperCase();
  const banner = $("invite-banner"); if (banner && !banner.hidden && CODE.test(code)) banner.innerHTML = INVITE[lang](code);
  if (lang === "en") for (const id of DYNAMIC_IDS) translateNode($(id));
  else document.dispatchEvent(new CustomEvent("ohana:lang"));
  renderLinkField(); renderPill();
  const url = new URL(location.href); if (lang === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang"); history.replaceState(null, "", url);
}

$("lang-toggle")?.addEventListener("click", () => {
  setLang(lang === "en" ? "es" : "en");
  if (lang === "es") { const copy = $("copy-code"); if (copy) copy.textContent = "Copiar"; const btn = $("share-link"); if (btn) btn.textContent = "Compartir enlace"; }
});
$("share-link")?.addEventListener("click", () => void share());
$("share-url")?.addEventListener("focus", (event) => event.target.select());
applyStatic(); observe(); setupInvite();
if (lang === "en") for (const id of DYNAMIC_IDS) translateNode($(id));
setInterval(() => { if (!$("lobby")?.hidden) { renderPill(); renderLinkField(); } }, 600);
window.addEventListener("online", renderPill); window.addEventListener("offline", renderPill);
