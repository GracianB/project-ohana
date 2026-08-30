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
    hint: "Este es el piso de abajo. ESTE costa. OESTE cueva. ARRIBA cumbre.",
    plats: [[0, 810, 1600, 90], [80, 680, 160, 18], [300, 620, 150, 18], ...stairs(760)],
    foes: [[620, 200, "crawler"], [1180, 200, "flyer"]],
    orbs: [[400, 500], [900, 200]]
  },
  beach: {
    id: "beach", name: "Costa Kauai", world: 0,
    doors: { left: "hub", right: "jungle", up: null, down: null },
    pit: true,
    hint: "El hueco del centro es POZO mortal. No es bajada de sala.",
    plats: [[0, 810, 620, 90], [860, 810, 740, 90], [240, 660, 170, 18], [620, 540, 160, 18], [1040, 620, 180, 18]],
    foes: [[280, 200, "crawler"], [980, 200, "brute"], [1320, 200, "flyer"]],
    orbs: [[280, 520], [1200, 430]]
  },
  jungle: {
    id: "jungle", name: "Jungla Alta", world: 1,
    doors: { left: "beach", right: null, up: "volcano", down: null },
    needEvo: 1,
    hint: "Aquí no se baja de sala. Forma 3: salta ARRIBA a la caldera.",
    plats: [[0, 810, 1600, 90], [180, 680, 150, 18], ...stairs(760)],
    foes: [[400, 200, "crawler"], [860, 200, "flyer"], [1280, 200, "brute"]],
    orbs: [[520, 420], [800, 180]]
  },
  cave: {
    id: "cave", name: "Cueva Azul", world: 4,
    doors: { right: "hub", left: "lab", up: null, down: null },
    hint: "OESTE laboratorio (forma 2). ESTE vuelve al claro.",
    plats: [[0, 810, 1600, 90], [180, 660, 160, 18], [480, 520, 150, 18], [880, 620, 180, 18], [1180, 470, 150, 18]],
    foes: [[360, 200, "brute"], [1040, 200, "flyer"]],
    orbs: [[500, 420], [1200, 400]]
  },
  lab: {
    id: "lab", name: "Alien Lab", world: 4,
    doors: { right: "cave", left: null, up: null, down: null },
    needEvo: 1,
    hint: "Solo se sale por ESTE.",
    plats: [[0, 810, 1600, 90], [180, 660, 180, 18], [480, 520, 180, 18], [860, 380, 180, 18], [1220, 540, 180, 18]],
    foes: [[400, 200, "brute"], [820, 200, "flyer"], [1240, 200, "crawler"]],
    orbs: [[520, 440], [900, 300]]
  },
  ridge: {
    id: "ridge", name: "Cumbre", world: 3,
    doors: { down: "hub", right: "space", left: null, up: null },
    pit: true,
    hint: "Hueco del centro = baja al Claro (piso de abajo). ESTE = órbita.",
    plats: [[0, 810, 680, 90], [920, 810, 680, 90], [200, 660, 160, 18], [500, 520, 150, 18], [1040, 620, 160, 18]],
    foes: [[480, 200, "flyer"], [1200, 200, "crawler"]],
    orbs: [[720, 420], [1100, 280]]
  },
  space: {
    id: "space", name: "Orbita", world: 3,
    doors: { left: "ridge", down: "hub", right: null, up: null },
    needEvo: 1,
    pit: true,
    hint: "El pozo del centro baja al Claro. Caldera = Jungla ARRIBA.",
    plats: [[0, 810, 680, 90], [920, 810, 680, 90], [220, 640, 150, 18], [560, 480, 150, 18], [1100, 360, 160, 18]],
    foes: [[500, 200, "flyer"], [1080, 200, "brute"], [1340, 200, "flyer"]],
    orbs: [[640, 390], [1120, 260]]
  },
  volcano: {
    id: "volcano", name: "Caldera", world: 2,
    doors: { left: "jungle", up: "space", right: "boss", down: null },
    needEvo: 2,
    hint: "Aquí no hay pozo. ESTE = nido. OESTE = jungla.",
    plats: [[0, 810, 1600, 90], ...stairs(760)],
    foes: [[480, 200, "brute"], [980, 200, "crawler"], [1320, 200, "flyer"]],
    orbs: [[660, 200], [1100, 540]]
  },
  boss: {
    id: "boss", name: "Nido Final", world: 2,
    doors: { left: "volcano", right: null, up: null, down: null },
    needEvo: 2,
    hint: "Tumba al nido. Salida solo OESTE.",
    plats: [[0, 810, 1600, 90], [180, 620, 180, 18], [700, 500, 200, 18], [1180, 620, 180, 18]],
    foes: [],
    orbs: [[800, 420]],
    boss: true
  }
};
