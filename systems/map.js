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
    hint: "Recoge orbes dorados. ESTE costa · OESTE cueva · ARRIBA cumbre.",
    goal: "Evoluciona a forma 2 y sigue ESTE hasta la jungla.",
    plats: [
      [0, 810, 1600, 90],
      [80, 680, 160, 18], [300, 620, 150, 18],
      ...stairs(760)
    ],
    foes: [[620, 200, "crawler"], [1180, 200, "flyer"]],
    orbs: [[400, 500], [900, 200]]
  },
  beach: {
    id: "beach", name: "Costa Kauai", world: 0,
    doors: { left: "hub", right: "jungle", up: null, down: null },
    pit: true,
    hint: "El hueco del centro es un POZO. No caigas. Forma 2 abre el ESTE.",
    goal: "Con forma 2 cruza ESTE a la jungla.",
    plats: [
      [0, 810, 620, 90], [860, 810, 740, 90],
      [240, 660, 170, 18], [620, 540, 160, 18], [1040, 620, 180, 18]
    ],
    foes: [[280, 200, "crawler"], [980, 200, "brute"], [1320, 200, "flyer"]],
    orbs: [[280, 520], [1200, 430]]
  },
  jungle: {
    id: "jungle", name: "Jungla Alta", world: 1,
    doors: { left: "beach", right: null, up: "volcano", down: null },
    needEvo: 1,
    hint: "Forma 2. Sube las plataformas. Forma 3 abre ARRIBA hacia la caldera.",
    goal: "Evoluciona a forma 3 y salta ARRIBA.",
    plats: [
      [0, 810, 1600, 90],
      [180, 680, 150, 18],
      ...stairs(760)
    ],
    foes: [[400, 200, "crawler"], [860, 200, "flyer"], [1280, 200, "brute"]],
    orbs: [[520, 420], [800, 180]]
  },
  cave: {
    id: "cave", name: "Cueva Azul", world: 4,
    doors: { right: "hub", left: "lab", up: null, down: null },
    hint: "OESTE es el laboratorio. Pide forma 2. ESTE vuelve al claro.",
    goal: "Con forma 2 entra OESTE al lab.",
    plats: [
      [0, 810, 1600, 90],
      [180, 660, 160, 18], [480, 520, 150, 18], [880, 620, 180, 18], [1180, 470, 150, 18]
    ],
    foes: [[360, 200, "brute"], [1040, 200, "flyer"]],
    orbs: [[500, 420], [1200, 400]]
  },
  lab: {
    id: "lab", name: "Alien Lab", world: 4,
    doors: { right: "cave", left: null, up: null, down: null },
    needEvo: 1,
    hint: "Solo hay salida ESTE. Recoge orbes y vuelve al claro.",
    goal: "Vuelve ESTE cuando tengas XP.",
    plats: [
      [0, 810, 1600, 90], [180, 660, 180, 18], [480, 520, 180, 18], [860, 380, 180, 18], [1220, 540, 180, 18]
    ],
    foes: [[400, 200, "brute"], [820, 200, "flyer"], [1240, 200, "crawler"]],
    orbs: [[520, 440], [900, 300]]
  },
  ridge: {
    id: "ridge", name: "Cumbre", world: 3,
    doors: { down: "hub", right: "space", left: null, up: null },
    hint: "ESTE es órbita (forma 2). ABAJO baja al claro por las plataformas.",
    goal: "Con forma 2 sigue ESTE.",
    plats: [
      [0, 810, 1600, 90],
      [200, 660, 160, 18], [500, 520, 150, 18], [1040, 620, 160, 18]
    ],
    foes: [[480, 200, "flyer"], [1200, 200, "crawler"]],
    orbs: [[720, 420], [1100, 280]]
  },
  space: {
    id: "space", name: "Orbita", world: 3,
    doors: { left: "ridge", down: "volcano", right: null, up: null },
    needEvo: 1,
    pit: true,
    hint: "El hueco es un pozo a la caldera. Solo con forma 3. Si no, no saltes.",
    goal: "Forma 3: cae ABAJO al centro. Si no, vuelve OESTE.",
    plats: [
      [0, 810, 680, 90], [920, 810, 680, 90],
      [220, 640, 150, 18], [560, 480, 150, 18], [1100, 360, 160, 18]
    ],
    foes: [[500, 200, "flyer"], [1080, 200, "brute"], [1340, 200, "flyer"]],
    orbs: [[640, 390], [1120, 260]]
  },
  volcano: {
    id: "volcano", name: "Caldera", world: 2,
    doors: { left: "jungle", up: "space", right: "boss", down: null },
    needEvo: 2,
    hint: "Forma 3. ESTE es el nido del jefe. No hay pozo abajo: hay pared.",
    goal: "Cruza ESTE al jefe.",
    plats: [
      [0, 810, 1600, 90],
      ...stairs(760)
    ],
    foes: [[480, 200, "brute"], [980, 200, "crawler"], [1320, 200, "flyer"]],
    orbs: [[660, 200], [1100, 540]]
  },
  boss: {
    id: "boss", name: "Nido Final", world: 2,
    doors: { left: "volcano", right: null, up: null, down: null },
    needEvo: 2,
    hint: "Solo se sale por OESTE. Derrota al nido.",
    goal: "Pega combos. OESTE si quieres huir.",
    plats: [[0, 810, 1600, 90], [180, 620, 180, 18], [700, 500, 200, 18], [1180, 620, 180, 18]],
    foes: [],
    orbs: [[800, 420]],
    boss: true
  }
};

export function roomHint(room, evo) {
  if (!room) return "";
  if (room.needEvo && evo < room.needEvo) return "Cerrado. Necesitas forma " + (room.needEvo + 1) + ".";
  return room.hint || room.goal || "";
}

export function doorLocked(fromRoom, dir, evo) {
  const id = fromRoom && fromRoom.doors && fromRoom.doors[dir];
  if (!id) return { wall: true, label: "MURO" };
  const dest = ROOMS[id];
  if (dest && dest.needEvo && evo < dest.needEvo) {
    return { wall: false, lock: true, need: dest.needEvo + 1, label: "CERRADO F" + (dest.needEvo + 1), dest: dest.name };
  }
  return { wall: false, lock: false, label: dir.toUpperCase(), dest: dest && dest.name };
}

export function drawRoomFrame(ctx, room, cam, evo, t) {
  const x0 = -cam.x, y0 = -cam.y;
  function wall(x, y, w, h, text) {
    ctx.fillStyle = "rgba(8,10,16,.92)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(80,90,110,.55)";
    for (let i = 0; i < w; i += 22) ctx.fillRect(x + i, y, 10, h);
    if (text) {
      ctx.fillStyle = "#9aa7b8";
      ctx.font = "700 12px Outfit,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text, x + w / 2, y + h / 2 + 4);
    }
  }
  function gate(x, y, w, h, info) {
    const pulse = 0.35 + Math.sin(t / 10) * 0.15;
    ctx.fillStyle = info.lock ? "rgba(90,20,40," + pulse + ")" : "rgba(30,80,90," + pulse + ")";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = info.lock ? "#ff8aa0" : "#7ee7ff";
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = "#fff";
    ctx.font = "700 11px Outfit,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(info.label, x + w / 2, y + 16);
    if (info.dest) ctx.fillText(info.dest, x + w / 2, y + 30);
  }
  const right = doorLocked(room, "right", evo);
  const left = doorLocked(room, "left", evo);
  const up = doorLocked(room, "up", evo);
  const down = doorLocked(room, "down", evo);
  if (right.wall) wall(x0 + ROOM_W - 18, y0 + 80, 22, ROOM_H - 160, "MURO");
  else gate(x0 + ROOM_W - 96, y0 + 348, 90, 44, right);
  if (left.wall) wall(x0 - 4, y0 + 80, 22, ROOM_H - 160, "MURO");
  else gate(x0 + 8, y0 + 348, 90, 44, left);
  if (up.wall) wall(x0 + 620, y0 - 4, 360, 18, "");
  else gate(x0 + 730, y0 + 10, 110, 40, up);
  if (down.wall) {
    /* floor already exists; mark sealed pit zone */
  } else {
    gate(x0 + 730, y0 + ROOM_H - 52, 110, 40, down);
  }
  if (room.pit) {
    ctx.fillStyle = "rgba(126,231,255," + (0.18 + Math.sin(t / 8) * 0.08) + ")";
    ctx.font = "800 13px Outfit,sans-serif";
    ctx.textAlign = "center";
    const msg = down.lock ? "POZO CERRADO · forma " + down.need : (down.wall ? "POZO MORTAL" : "POZO · baja aquí");
    ctx.fillText(msg, x0 + 800, y0 + 790);
  }
}
