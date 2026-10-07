// PROJECT OHANA V40 · compatibility shim.
// Room bitmap backdrops are intentionally disabled. World identity is rendered
// procedurally by worlds/index.js + worlds/living-worlds.js.
export function paintedRoomOn() { return false; }
export function drawPaintedRoom() { return false; }
