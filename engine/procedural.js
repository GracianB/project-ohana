// PROJECT OHANA · Procedural Generation
// Generador determinista basado en seed.

export class ProceduralGenerator {
  constructor(seed = 626) {
    this.seed = seed >>> 0;
  }

  random() {
    this.seed += 0x6D2B79F5;

    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min, max) {
    return min + this.random() * (max - min);
  }

  integer(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  choose(items) {
    return items[Math.floor(this.random() * items.length)];
  }

  generateChunk(chunkIndex, chunkWidth = 900, worldConfig = null) {
    const startX = chunkIndex * chunkWidth;
    const platforms = [];
    const decorations = [];
    const collectibles = [];
    const enemies = [];

    const biome = worldConfig?.id || this.choose(["beach", "jungle", "rocky"]);

    let cursor = startX;
    const end = startX + chunkWidth;

    while (cursor < end) {
      const gap = this.range(0, 90);
      const width = this.range(180, 420);
      const groundY = this.range(520, 550);

      platforms.push({
        x: cursor + gap,
        y: groundY,
        w: width,
        h: 220,
        type: "ground"
      });

      if (this.random() > 0.45) {
        const px = cursor + gap + this.range(30, width - 120);

        platforms.push({
          x: px,
          y: groundY - this.range(90, 190),
          w: this.range(110, 190),
          h: 25,
          type: this.random() > 0.45 ? "leaf" : "rock"
        });
      }

      const decorationCount = this.integer(1, 4);

      for (let i = 0; i < decorationCount; i++) {
        decorations.push({
          ...(worldConfig?.generateDecoration
            ? worldConfig.generateDecoration(this, cursor + gap + this.range(20, Math.max(40, width - 20)), groundY)
            : { type: this.choose(["palm", "rock", "flower"]), x: cursor + gap + this.range(20, Math.max(40, width - 20)), y: groundY })
        });
      }

      if (this.random() > 0.42) {
        collectibles.push({
          x: cursor + gap + this.range(40, Math.max(50, width - 40)),
          y: groundY - this.range(70, 160),
          w: 18,
          h: 26,
          taken: false,
          phase: this.random() * Math.PI * 2
        });
      }

      if (this.random() > 0.6) {
        enemies.push({
          x: cursor + gap + this.range(50, Math.max(60, width - 60)),
          y: groundY - 40,
          min: cursor + gap + 20,
          max: cursor + gap + width - 40
        });
      }

      cursor += width + gap;
    }

    return {
      id: chunkIndex,
      biome,
      startX,
      endX: end,
      platforms,
      decorations,
      collectibles,
      enemies
    };
  }
}
