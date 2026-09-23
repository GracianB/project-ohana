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

export const MAP_LAYOUT = [
  [null, "ridge", "space", "reef", null, null],
  ["lab", "cave", "hub", "beach", "jungle", null],
  [null, null, null, null, "volcano", "boss"]
];

export const ROOMS = {
  hub: {
    id: "hub", name: "Claro Ohana", short: "Claro", world: 0,
    doors: { right: "beach", left: "cave", up: "ridge", down: null },
    hint: "Piso bajo. ESTE costa · OESTE cueva · centro ARRIBA cumbre. Catapulta ESTE → Costa.",
    plats: [[0, 810, 1600, 90], [80, 680, 160, 18], [300, 620, 150, 18], ...stairs(760)],
    foes: [[620, 200, "cucaracho"], [1180, 200, "phosquito"]],
    orbs: [[400, 500], [900, 200]],
    portals: [{ type: "catapult", x: 1310, y: 778, w: 100, h: 34, dest: "beach", label: "Costa" }]
  },
  beach: {
    id: "beach", name: "Costa Hoku", short: "Costa", world: 0,
    doors: { left: "hub", right: "jungle", up: null, down: null },
    pit: true,
    hint: "Hueco central = POZO. Forma 3 abre ESTE a la jungla. Catapulta OESTE → Claro.",
    plats: [
      [0, 810, 600, 90],
      [880, 810, 720, 90],
      [160, 680, 150, 18],
      [360, 560, 140, 18],
      [1000, 660, 160, 18],
      [1220, 540, 150, 18]
    ],
    foes: [[280, 200, "cucaracho"], [980, 200, "planta"], [420, 360, "pez"], [900, 420, "pez"], [1180, 380, "pez"], [1380, 460, "pez"]],
    orbs: [[220, 620], [1280, 480]],
    portals: [{ type: "catapult", x: 70, y: 778, w: 100, h: 34, dest: "hub", label: "Claro" }]
  },
  jungle: {
    id: "jungle", name: "Jungla Alta", short: "Jungla", world: 1,
    doors: { left: "beach", right: null, up: null, down: "volcano" },
    needEvo: 2,
    pit: true,
    hint: "Esquina derecha del mapa. Hueco central ABAJO = Caldera (forma 4). BH → Caldera.",
    plats: [[0, 810, 680, 90], [920, 810, 680, 90], [180, 680, 150, 18], ...stairs(200)],
    foes: [[360, 440, "libelula"], [820, 480, "mosquito"], [1280, 460, "abeja"]],
    orbs: [[520, 420], [800, 180]],
    portals: [{ type: "blackhole", x: 1170, y: 710, w: 80, h: 80, dest: "volcano", label: "Caldera" }]
  },
  cave: {
    id: "cave", name: "Cueva Azul", short: "Cueva", world: 4,
    doors: { right: "hub", left: "lab", up: null, down: null },
    hint: "OESTE lab (forma 2). ESTE claro.",
    plats: [[0, 810, 1600, 90], [180, 660, 160, 18], [480, 520, 150, 18], [880, 620, 180, 18], [1180, 470, 150, 18]],
    foes: [[360, 200, "planta"], [1040, 200, "phosquito"]],
    orbs: [[500, 420], [1200, 400]]
  },
  lab: {
    id: "lab", name: "Alien Lab", short: "Lab", world: 4,
    doors: { right: "cave", left: null, up: null, down: null },
    needEvo: 1,
    hint: "Solo salida ESTE.",
    plats: [[0, 810, 1600, 90], [180, 660, 180, 18], [480, 520, 180, 18], [860, 380, 180, 18], [1220, 540, 180, 18]],
    foes: [[400, 200, "planta"], [820, 200, "phosquito"], [1240, 200, "cucaracho"]],
    orbs: [[520, 440], [900, 300]]
  },
  ridge: {
    id: "ridge", name: "Cumbre", short: "Cumbre", world: 3,
    doors: { down: "hub", right: "space", left: null, up: null },
    pit: true,
    hint: "Hueco central ABAJO = Claro. ESTE = órbita.",
    plats: [[0, 810, 680, 90], [920, 810, 680, 90], [200, 660, 160, 18], [500, 520, 150, 18], [1040, 620, 160, 18]],
    foes: [[480, 200, "phosquito"], [1200, 200, "cucaracho"]],
    orbs: [[720, 420], [1100, 280]]
  },
  space: {
    id: "space", name: "Órbita", short: "Órbita", world: 3,
    doors: { left: "ridge", down: "hub", right: "reef", up: null },
    needEvo: 1,
    pit: true,
    hint: "Pozo central ABAJO = Claro. ESTE = Arrecife secreto. BH → Arrecife.",
    plats: [[0, 810, 680, 90], [920, 810, 680, 90], [220, 640, 150, 18], [560, 480, 150, 18], [1100, 360, 160, 18]],
    foes: [[500, 200, "phosquito"], [1080, 200, "planta"], [1340, 280, "medusa"]],
    orbs: [[640, 390], [1120, 260]],
    portals: [{ type: "blackhole", x: 1270, y: 270, w: 80, h: 80, dest: "reef", label: "Arrecife" }]
  },
  reef: {
    id: "reef", name: "Arrecife Abismo", short: "Arrecife", world: 5,
    doors: { left: "space", right: null, up: null, down: null },
    hint: "Bajo el agua. Peces y medusas. Las medusas sueltan orbes. BH → Órbita.",
    plats: [[0, 810, 1600, 90], [200, 660, 190, 18], [560, 520, 190, 18], [920, 640, 190, 18], [1220, 480, 190, 18], [740, 360, 180, 18]],
    foes: [[420, 300, "medusa"], [1040, 260, "medusa"], [280, 400, "pez"], [620, 360, "pez"], [900, 440, "pez"], [1320, 400, "pez"]],
    orbs: [[300, 560], [640, 440], [1000, 560], [1300, 400], [820, 280]],
    portals: [{ type: "blackhole", x: 90, y: 710, w: 80, h: 80, dest: "space", label: "Órbita" }]
  },
  volcano: {
    id: "volcano", name: "Caldera", short: "Caldera", world: 2,
    doors: { left: "jungle", up: "jungle", right: "boss", down: null },
    needEvo: 3,
    hint: "Llegaste por el hueco de la Jungla. ESTE = nido. BH → Jungla.",
    plats: [[0, 810, 1600, 90], ...stairs(760)],
    foes: [[480, 200, "planta"], [980, 200, "cucaracho"], [1320, 200, "phosquito"]],
    orbs: [[660, 200], [1100, 540]],
    portals: [{ type: "blackhole", x: 190, y: 710, w: 80, h: 80, dest: "jungle", label: "Jungla" }]
  },
  boss: {
    id: "boss", name: "Nido Final", short: "Nido", world: 2,
    doors: { left: "volcano", right: null, up: null, down: null },
    needEvo: 3,
    hint: "El monstruo está aquí. Prepárate. OESTE huye.",
    plats: [[0, 810, 1600, 90], [180, 620, 180, 18], [700, 500, 200, 18], [1180, 620, 180, 18]],
    foes: [],
    orbs: [[800, 420]],
    boss: true
  }
};

function doorLabel(id, arrow, evo) {
  const dest = ROOMS[id];
  if (!dest) return arrow;
  const lock = dest.needEvo != null && (evo || 0) < dest.needEvo;
  if (lock) return arrow + " F" + (dest.needEvo + 1);
  return arrow + " " + (dest.short || dest.name || id);
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawSigns(ctx, room, cam, t, evo) {
  if (!room || !cam) return;
  const pulse = 0.5 + Math.sin(t / 8) * 0.18;
  const stage = evo || 0;

  // One clean, glowing sign per door. `anchor` = "left" | "right" | "center".
  function sign(wx, wy, arrow, destId, anchor) {
    const dest = ROOMS[destId];
    const lock = dest && dest.needEvo != null && stage < dest.needEvo;
    const label = dest ? (lock ? ("Forma " + (dest.needEvo + 1)) : (dest.short || dest.name || destId)) : destId;
    const text = arrow + "  " + label;
    ctx.save();
    ctx.font = "800 14px Outfit, system-ui, sans-serif";
    const w = Math.max(92, ctx.measureText(text).width + 28);
    const h = 32;
    let x = wx - cam.x;
    if (anchor === "right") x -= w;
    else if (anchor === "center") x -= w / 2;
    const y = wy - cam.y;
    const c = lock ? "255,150,170" : "126,231,255";
    ctx.shadowColor = "rgba(" + c + "," + (0.55 * pulse) + ")";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(8,16,22,.85)";
    rrect(ctx, x, y, w, h, 11); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(" + c + "," + (0.55 + pulse * 0.4) + ")";
    ctx.lineWidth = 1.5;
    rrect(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 10); ctx.stroke();
    ctx.fillStyle = lock ? "#ffc2cd" : "#eafcff";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2 + 1);
    ctx.restore();
  }
  function wall(x, y, w, h) {
    ctx.fillStyle = "rgba(12,14,20,.88)";
    ctx.fillRect(x - cam.x, y - cam.y, w, h);
    ctx.fillStyle = "rgba(90,100,120,.4)";
    for (let i = 0; i < w; i += 20) ctx.fillRect(x - cam.x + i, y - cam.y, 8, h);
  }
  // Pit indicator (single): dark elliptical hole + swirl + label at bottom-centre gap.
  function pit(label, deadly) {
    const x = 800 - cam.x, y = ROOM_H - 60 - cam.y;
    const c = deadly ? "255,120,140" : "126,231,255";
    const rim = deadly ? "40,8,14" : "6,28,40";
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // dark elliptical rim / mouth of the pit
    ctx.beginPath();
    ctx.ellipse(x, y + 36, 78, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(" + rim + ",.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(" + c + "," + (0.35 + pulse * 0.35) + ")";
    ctx.lineWidth = 3;
    ctx.stroke();

    // black hole (radial) in the centre
    const hole = ctx.createRadialGradient(x, y + 36, 2, x, y + 36, 52);
    hole.addColorStop(0, "rgba(0,0,0,.98)");
    hole.addColorStop(0.45, "rgba(0,0,0,.85)");
    hole.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hole;
    ctx.beginPath();
    ctx.ellipse(x, y + 36, 58, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // animated swirl / vortex arcs
    ctx.strokeStyle = "rgba(" + c + "," + (0.25 + pulse * 0.35) + ")";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const ang = t / 14 + i * (Math.PI / 2);
      const rx = 18 + i * 8;
      const ry = 6 + i * 3;
      ctx.beginPath();
      ctx.ellipse(x, y + 36, rx, ry, ang * 0.15, ang, ang + 1.4);
      ctx.stroke();
    }

    // chevrons pointing down into the hole
    ctx.strokeStyle = "rgba(" + c + "," + (0.55 + pulse * 0.45) + ")";
    ctx.lineWidth = 3.5;
    for (let i = 0; i < 2; i++) {
      const yy = y + 18 + i * 10 + Math.sin(t / 6 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(x - 14, yy);
      ctx.lineTo(x, yy + 8);
      ctx.lineTo(x + 14, yy);
      ctx.stroke();
    }
    ctx.lineCap = "butt";

    // high-visibility label plate
    ctx.font = "900 16px Outfit, system-ui, sans-serif";
    const tw = Math.max(110, ctx.measureText(label).width + 28);
    const th = 28;
    const lx = x - tw / 2;
    const ly = y - 22;
    ctx.shadowColor = "rgba(" + c + "," + (0.55 * pulse) + ")";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(8,12,18,.9)";
    rrect(ctx, lx, ly, tw, th, 9);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(" + c + "," + (0.6 + pulse * 0.35) + ")";
    ctx.lineWidth = 1.6;
    rrect(ctx, lx + 0.5, ly + 0.5, tw - 1, th - 1, 8);
    ctx.stroke();
    ctx.fillStyle = deadly ? "#ffd0d8" : "#eafcff";
    ctx.fillText(label, x, ly + th / 2 + 1);

    ctx.restore();
  }

  if (room.doors.right) sign(ROOM_W - 40, 356, "→", room.doors.right, "right"); else wall(ROOM_W - 16, 80, 20, 700);
  if (room.doors.left) sign(40, 356, "←", room.doors.left, "left"); else wall(-4, 80, 20, 700);
  if (room.doors.up) sign(800, 22, "↑", room.doors.up, "center");

  // Down / pit: exactly ONE indicator.
  if (room.doors.down) {
    if (room.pit) {
      const dest = ROOMS[room.doors.down];
      pit((dest && (dest.short || dest.name)) || "ABAJO", false);
    } else {
      sign(800, ROOM_H - 56, "↓", room.doors.down, "center");
    }
  } else if (room.pit) {
    pit("POZO MORTAL", true);
  }
}
