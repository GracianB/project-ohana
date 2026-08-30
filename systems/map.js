export const ROOM_W = 1600;
export const ROOM_H = 900;

function stairs(x) {
  return [
    [x - 90, 700, 300, 22],
    [x - 60, 580, 280, 22],
    [x - 40, 460, 280, 22],
    [x - 20, 340, 280, 22],
    [x - 10, 220, 280, 22],
    [x, 110, 280, 22]
  ];
}

export const ROOMS = {
  hub: {
    id: "hub", name: "Claro Ohana", world: 0,
    doors: { right: "beach", left: "cave", up: "ridge", down: null },
    hint: "Piso bajo. ESTE costa · OESTE cueva · centro ARRIBA cumbre.",
    plats: [[0, 810, 1600, 90], [80, 680, 160, 18], [300, 620, 150, 18], ...stairs(760)],
    foes: [[620, 200, "crawler"], [1180, 200, "flyer"]],
    orbs: [[400, 500], [900, 200]]
  },
  beach: {
    id: "beach", name: "Costa Kauai", world: 0,
    doors: { left: "hub", right: "jungle", up: null, down: null },
    pit: true,
    hint: "Hueco central = POZO. Forma 2 abre ESTE a la jungla.",
    plats: [[0, 810, 620, 90], [860, 810, 740, 90], [240, 660, 170, 18], [620, 540, 160, 18], [1040, 620, 180, 18]],
    foes: [[280, 200, "crawler"], [980, 200, "brute"], [1320, 200, "flyer"]],
    orbs: [[280, 520], [1200, 430]]
  },
  jungle: {
    id: "jungle", name: "Jungla Alta", world: 1,
    doors: { left: "beach", right: null, up: null, down: "volcano" },
    needEvo: 2,
    pit: true,
    hint: "Esquina derecha del mapa. Hueco central ABAJO = Caldera (forma 4).",
    plats: [[0, 810, 680, 90], [920, 810, 680, 90], [180, 680, 150, 18], ...stairs(200)],
    foes: [[400, 200, "crawler"], [860, 200, "flyer"], [1280, 200, "brute"]],
    orbs: [[520, 420], [800, 180]]
  },
  cave: {
    id: "cave", name: "Cueva Azul", world: 4,
    doors: { right: "hub", left: "lab", up: null, down: null },
    hint: "OESTE lab (forma 2). ESTE claro.",
    plats: [[0, 810, 1600, 90], [180, 660, 160, 18], [480, 520, 150, 18], [880, 620, 180, 18], [1180, 470, 150, 18]],
    foes: [[360, 200, "brute"], [1040, 200, "flyer"]],
    orbs: [[500, 420], [1200, 400]]
  },
  lab: {
    id: "lab", name: "Alien Lab", world: 4,
    doors: { right: "cave", left: null, up: null, down: null },
    needEvo: 1,
    hint: "Solo salida ESTE.",
    plats: [[0, 810, 1600, 90], [180, 660, 180, 18], [480, 520, 180, 18], [860, 380, 180, 18], [1220, 540, 180, 18]],
    foes: [[400, 200, "brute"], [820, 200, "flyer"], [1240, 200, "crawler"]],
    orbs: [[520, 440], [900, 300]]
  },
  ridge: {
    id: "ridge", name: "Cumbre", world: 3,
    doors: { down: "hub", right: "space", left: null, up: null },
    pit: true,
    hint: "Hueco central ABAJO = Claro. ESTE = órbita.",
    plats: [[0, 810, 680, 90], [920, 810, 680, 90], [200, 660, 160, 18], [500, 520, 150, 18], [1040, 620, 160, 18]],
    foes: [[480, 200, "flyer"], [1200, 200, "crawler"]],
    orbs: [[720, 420], [1100, 280]]
  },
  space: {
    id: "space", name: "Orbita", world: 3,
    doors: { left: "ridge", down: "hub", right: null, up: null },
    needEvo: 1,
    pit: true,
    hint: "Pozo central ABAJO = Claro.",
    plats: [[0, 810, 680, 90], [920, 810, 680, 90], [220, 640, 150, 18], [560, 480, 150, 18], [1100, 360, 160, 18]],
    foes: [[500, 200, "flyer"], [1080, 200, "brute"], [1340, 200, "flyer"]],
    orbs: [[640, 390], [1120, 260]]
  },
  volcano: {
    id: "volcano", name: "Caldera", world: 2,
    doors: { left: "jungle", up: "jungle", right: "boss", down: null },
    needEvo: 3,
    hint: "Llegaste por el hueco de la Jungla. ESTE = nido.",
    plats: [[0, 810, 1600, 90], ...stairs(760)],
    foes: [[480, 200, "brute"], [980, 200, "crawler"], [1320, 200, "flyer"]],
    orbs: [[660, 200], [1100, 540]]
  },
  boss: {
    id: "boss", name: "Nido Final", world: 2,
    doors: { left: "volcano", right: null, up: null, down: null },
    needEvo: 3,
    hint: "Jefe. OESTE huye.",
    plats: [[0, 810, 1600, 90], [180, 620, 180, 18], [700, 500, 200, 18], [1180, 620, 180, 18]],
    foes: [],
    orbs: [[800, 420]],
    boss: true
  }
};

export function drawSigns(ctx, room, cam, t) {
  if (!room) return;
  const pulse = 0.45 + Math.sin(t / 8) * 0.2;
  function mark(wx, wy, label, lock) {
    const x = wx - cam.x, y = wy - cam.y;
    ctx.fillStyle = lock ? "rgba(80,16,24," + pulse + ")" : "rgba(10,40,50," + pulse + ")";
    ctx.fillRect(x, y, 96, 36);
    ctx.strokeStyle = lock ? "#ff8aa0" : "#7ee7ff";
    ctx.strokeRect(x + 1, y + 1, 94, 34);
    ctx.fillStyle = "#fff";
    ctx.font = "800 12px Outfit,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + 48, y + 23);
  }
  function wall(x, y, w, h) {
    ctx.fillStyle = "rgba(12,14,20,.88)";
    ctx.fillRect(x - cam.x, y - cam.y, w, h);
    ctx.fillStyle = "rgba(90,100,120,.45)";
    for (let i = 0; i < w; i += 20) ctx.fillRect(x - cam.x + i, y - cam.y, 8, h);
    ctx.fillStyle = "#8b98a8";
    ctx.font = "700 11px Outfit,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MURO", x - cam.x + w / 2, y - cam.y + h / 2);
  }
  if (room.doors.right) mark(ROOM_W - 110, 360, "→ " + (ROOMS[room.doors.right].name || "ESTE"), ROOMS[room.doors.right].needEvo);
  else wall(ROOM_W - 16, 80, 20, 700);
  if (room.doors.left) mark(14, 360, "← " + (ROOMS[room.doors.left].name || "OESTE"), ROOMS[room.doors.left].needEvo);
  else wall(-4, 80, 20, 700);
  if (room.doors.up) mark(752, 16, "↑ " + (ROOMS[room.doors.up].name || "ARRIBA"), ROOMS[room.doors.up].needEvo);
  if (room.doors.down) mark(752, ROOM_H - 50, "↓ " + (ROOMS[room.doors.down].name || "ABAJO"), ROOMS[room.doors.down].needEvo);
  if (room.pit) {
    ctx.fillStyle = "rgba(126,231,255," + pulse + ")";
    ctx.font = "800 14px Outfit,sans-serif";
    ctx.textAlign = "center";
    const dest = room.doors.down ? ("ABAJO ↓ " + ROOMS[room.doors.down].name) : "POZO MORTAL";
    ctx.fillText(dest, 800 - cam.x, 790 - cam.y);
  }
}
