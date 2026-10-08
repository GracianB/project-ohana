// PROJECT OHANA V44 · ROOM PRESENTATION
// Fullscreen chapter cards were removed. Room identity stays in the world, HUD and room messages.
function play(detail = {}) {
  const id = String(detail.id || "");
  if (id) document.body.dataset.ohanaRoomBeat = id;
}
addEventListener("ohana-cinema-room", (e) => play(e.detail || {}));
export const worldCinema = { play };
