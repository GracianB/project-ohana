import { ProceduralGenerator } from "./procedural.js";

export class World {
  constructor({ seed = 626, chunkWidth = 900, events, worldResolver = null }) {
    this.seed = seed;
    this.chunkWidth = chunkWidth;
    this.events = events;
    this.worldResolver = worldResolver;
    this.currentWorld = null;

    this.generator = new ProceduralGenerator(seed);

    this.chunks = new Map();
    this.platforms = [];
    this.decorations = [];
    this.collectibles = [];

    this.generatedUntil = -1;
  }

  initialize(initialChunks = 6) {
    for (let i = 0; i < initialChunks; i++) {
      this.ensureChunk(i);
    }
  }

  ensureAround(x, radius = 2) {
    const center = Math.floor(x / this.chunkWidth);

    for (let i = Math.max(0, center - radius); i <= center + radius; i++) {
      this.ensureChunk(i);
    }
  }

  ensureChunk(index) {
    if (this.chunks.has(index)) return this.chunks.get(index);

    const distance = index * this.chunkWidth;
    const worldConfig = this.worldResolver ? this.worldResolver(distance) : null;
    const chunk = this.generator.generateChunk(index, this.chunkWidth, worldConfig);
    chunk.world = worldConfig;

    this.chunks.set(index, chunk);
    this.platforms.push(...chunk.platforms);
    this.decorations.push(...chunk.decorations);
    this.collectibles.push(...chunk.collectibles);

    this.events?.emit("world:chunk-generated", { chunk, world: worldConfig });

    return chunk;
  }

  getChunk(index) {
    return this.chunks.get(index);
  }

  getWorldAt(x) {
    return this.worldResolver ? this.worldResolver(x) : null;
  }

  drawAtmosphere(ctx, cameraX, time) {
    const centerWorld = this.getWorldAt(cameraX + ctx.canvas.width / 2);
    if (centerWorld?.renderAtmosphere) {
      centerWorld.renderAtmosphere(ctx, ctx.canvas.width, ctx.canvas.height, time);
    }
  }

  drawDecorations(ctx, cameraX) {
    for (const item of this.decorations) {
      const x = item.x - cameraX;

      if (x < -200 || x > ctx.canvas.width + 200) continue;

      if (item.type === "palm") {
        this.drawPalm(ctx, x, item.y, 0.7 + ((item.x % 5) * 0.08));
      }

      if (item.type === "rock") {
        this.drawRock(ctx, x, item.y);
      }

      if (item.type === "flower") {
        this.drawFlower(ctx, x, item.y);
      }
    }
  }

  drawPalm(ctx, x, y, s = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    ctx.strokeStyle = "#563a27";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-8, -90, -28, -170);
    ctx.stroke();

    ctx.translate(-28, -170);

    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate((i / 8) * Math.PI * 2);
      ctx.fillStyle = i % 2 ? "#197c62" : "#23966e";
      ctx.beginPath();
      ctx.ellipse(35, 0, 55, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  drawRock(ctx, x, y) {
    ctx.fillStyle = "#385f63";
    ctx.beginPath();
    ctx.ellipse(x, y - 10, 24, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#547c7b";
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 15, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFlower(ctx, x, y) {
    const colors = ["#ff7096", "#ffd76d", "#9b7cff", "#ff914d"];
    const color = colors[Math.abs(Math.floor(x)) % colors.length];

    ctx.fillStyle = color;

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * 4, y - 5 + Math.sin(angle) * 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ffe58c";
    ctx.beginPath();
    ctx.arc(x, y - 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPlatforms(ctx, cameraX) {
    for (const p of this.platforms) {
      const x = p.x - cameraX;

      if (x + p.w < -100 || x > ctx.canvas.width + 100) continue;

      if (p.type === "ground") {
        ctx.fillStyle = "#d5ad67";
        ctx.fillRect(x, p.y, p.w, p.h);

        ctx.fillStyle = "#4a8c52";
        ctx.fillRect(x, p.y, p.w, 15);
      }

      if (p.type === "leaf") {
        ctx.fillStyle = "#216c55";
        ctx.beginPath();
        ctx.ellipse(x + p.w / 2, p.y + 12, p.w / 2, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#79c67a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, p.y + 12);
        ctx.lineTo(x + p.w - 10, p.y + 12);
        ctx.stroke();
      }

      if (p.type === "rock") {
        ctx.fillStyle = "#365a61";
        ctx.beginPath();
        ctx.roundRect(x, p.y, p.w, p.h, 8);
        ctx.fill();

        ctx.fillStyle = "#547f7c";
        ctx.fillRect(x + 7, p.y + 4, p.w - 14, 4);
      }
    }
  }

  drawCollectibles(ctx, cameraX, time) {
    for (const c of this.collectibles) {
      if (c.taken) continue;

      const x = c.x - cameraX;

      if (x < -40 || x > ctx.canvas.width + 40) continue;

      const y = c.y + Math.sin(time * 0.006 + c.phase) * 5;

      ctx.save();
      ctx.translate(x + 9, y + 13);
      ctx.rotate(Math.sin(time * 0.003 + c.phase) * 0.2);

      ctx.fillStyle = "#6ef4ff";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#5ce8ff";

      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 13);
      ctx.lineTo(-8, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#e8ffff";
      ctx.fillRect(-2, -8, 4, 13);

      ctx.restore();
    }

    ctx.shadowBlur = 0;
  }

  collect(player) {
    let collected = 0;

    for (const c of this.collectibles) {
      if (c.taken) continue;

      const overlap =
        player.x < c.x + c.w &&
        player.x + player.w > c.x &&
        player.y < c.y + c.h &&
        player.y + player.h > c.y;

      if (overlap) {
        c.taken = true;
        collected++;
        this.events?.emit("collectible:collected", { collectible: c });
      }
    }

    return collected;
  }
}
