export function showNotification(title, message, kind) {
  let box = document.getElementById("notification-container");
  if (!box) {
    box = document.createElement("div");
    box.id = "notification-container";
    document.body.appendChild(box);
  }
  while (box.children.length > 3) box.firstChild.remove();
  const el = document.createElement("div");
  el.className = "game-notification" + (kind ? " " + kind : "");
  el.innerHTML = `
    <button class="notification-close" type="button">✕</button>
    <h2>${title}</h2>
    <p>${message}</p>
    <small>ESC o ✕ para cerrar</small>
  `;
  box.appendChild(el);
  const close = () => {
    el.classList.add("closing");
    setTimeout(() => el.remove(), 280);
  };
  el.querySelector(".notification-close").addEventListener("click", close);
  setTimeout(close, 4200);
}
