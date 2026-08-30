export function showNotification(title, message) {
  let box = document.getElementById("notification-container");
  if (!box) {
    box = document.createElement("div");
    box.id = "notification-container";
    document.body.appendChild(box);
  }
  const el = document.createElement("div");
  el.className = "game-notification";
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
  const handler = (e) => {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", handler);
    }
  };
  document.addEventListener("keydown", handler);
  setTimeout(close, 7000);
}
