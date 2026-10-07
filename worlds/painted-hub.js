// PROJECT OHANA V40 · compatibility shim.
// Painted bitmap rooms were retired by Living Worlds. Keep the API so older
// imports remain stable, but never request or draw JPG/PNG world art.
export function paintedHubOn() { return false; }
export function drawPaintedHub() { return false; }
