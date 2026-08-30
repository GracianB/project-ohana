export const ROOM_W = 1600;
export const ROOM_H = 900;

export const ROOMS = {
  hub: {
    id: "hub", name: "Claro Ohana", world: 0,
    doors: { right: "beach", left: "cave", up: "ridge", down: null },
    plats: [
      [0, 810, 420, 90], [520, 810, 280, 90], [900, 810, 700, 90],
      [260, 660, 160, 18], [640, 560, 150, 18], [1000, 620, 180, 18]
    ],
    foes: [[600, 200], [1100, 200]],
    orbs: [[400, 500], [900, 480]]
  },
  beach: {
    id: "beach", name: "Costa Kauai", world: 0,
    doors: { left: "hub", right: "jungle", up: null, down: null },
    plats: [
      [0, 810, 360, 90], [460, 810, 240, 90], [820, 810, 780, 90],
      [300, 640, 170, 18], [700, 520, 160, 18], [1100, 600, 180, 18]
    ],
    foes: [[500, 200], [900, 200], [1300, 200]],
    orbs: [[280, 520], [1200, 430]]
  },
  jungle: {
    id: "jungle", name: "Jungla Alta", world: 1,
    doors: { left: "beach", right: null, up: "volcano", down: null },
    needEvo: 1,
    plats: [
      [0, 810, 500, 90], [620, 810, 200, 90], [960, 810, 640, 90],
      [220, 650, 140, 18], [500, 500, 140, 18], [820, 370, 150, 18], [1180, 500, 160, 18]
    ],
    foes: [[400, 200], [800, 200], [1250, 200]],
    orbs: [[520, 420], [840, 300]]
  },
  cave: {
    id: "cave", name: "Cueva Azul", world: 4,
    doors: { right: "hub", left: "lab", up: null, down: null },
    plats: [
      [0, 810, 700, 90], [820, 810, 780, 90],
      [200, 640, 160, 18], [500, 500, 150, 18], [900, 620, 180, 18], [1200, 480, 140, 18]
    ],
    foes: [[350, 200], [1000, 200]],
    orbs: [[500, 420], [1200, 400]]
  },
  lab: {
    id: "lab", name: "Alien Lab", world: 4,
    doors: { right: "cave", left: null, up: null, down: null },
    needEvo: 1,
    plats: [
      [0, 810, 1600, 90], [200, 660, 180, 18], [500, 520, 180, 18], [900, 400, 180, 18], [1240, 560, 180, 18]
    ],
    foes: [[400, 200], [800, 200], [1200, 200]],
    orbs: [[520, 440], [920, 320]]
  },
  ridge: {
    id: "ridge", name: "Cumbre", world: 3,
    doors: { down: "hub", right: "space", left: null, up: null },
    plats: [
      [200, 810, 400, 90], [720, 810, 280, 90], [1120, 810, 360, 90],
      [360, 640, 140, 18], [700, 500, 150, 18], [1080, 360, 160, 18]
    ],
    foes: [[500, 200], [900, 200]],
    orbs: [[720, 420], [1100, 280]]
  },
  space: {
    id: "space", name: "Orbita", world: 3,
    doors: { left: "ridge", down: "volcano", right: null, up: null },
    needEvo: 1,
    plats: [
      [80, 810, 300, 90], [500, 810, 260, 90], [900, 810, 600, 90],
      [240, 620, 150, 18], [620, 470, 150, 18], [1040, 340, 160, 18]
    ],
    foes: [[560, 200], [1000, 200], [1300, 200]],
    orbs: [[640, 390], [1060, 260]]
  },
  volcano: {
    id: "volcano", name: "Caldera", world: 2,
    doors: { left: "jungle", up: "space", right: "boss", down: null },
    needEvo: 2,
    plats: [
      [0, 810, 380, 90], [480, 810, 240, 90], [840, 810, 760, 90],
      [280, 640, 150, 18], [640, 500, 160, 18], [1080, 620, 170, 18]
    ],
    foes: [[500, 200], [900, 200], [1300, 200]],
    orbs: [[660, 420], [1100, 540]]
  },
  boss: {
    id: "boss", name: "Nido Final", world: 2,
    doors: { left: "volcano", right: null, up: null, down: null },
    needEvo: 2,
    plats: [[0, 810, 1600, 90], [200, 620, 180, 18], [700, 500, 200, 18], [1200, 620, 180, 18]],
    foes: [],
    orbs: [[800, 420]],
    boss: true
  }
};

export const MAP_LAYOUT = [
  [null, "ridge", "space"],
  ["lab", "cave", "hub", "beach", "jungle"],
  [null, null, null, null, "volcano", "boss"]
];
