import { Physics } from "./physics.js";

export class Enemy {
  constructor(config) {
    this.type = config.type || "crawler";

    this.x = config.x;
    this.y = config.y;
    this.w = config.w || 36;
    this.h = config.h || 38;

    this.min = config.min ?? this.x - 150;
    this.max = config.max ?? this.x + 150;

    this.vx = config.speed || 1.1;
    this.health = config.health || 1;
    this.dead = false;

    this.bob = Math.random() * Math.PI * 2;
    this.animationTime = 0;
  }

  update(dt) {
    if (this.dead) return;

    this.animationTime += dt * 16.67;
    this.x += this.vx * dt;

    if (this.x < this.min || this.x > this.max) {
      this.vx *= -1;
      this.x = Math.max(this.min, Math.min(this.max, this.x));
    }
  }

  hit() {
    this.health--;

    if (this.health <= 0) {
      this.dead = true;
      return true;
    }

    return false;
  }

  draw(ctx, cameraX) {
    if (this.dead) return;

    const x = this.x - cameraX;
    const bob = Math.sin(this.animationTime * 0.004 + this.bob) * 2;

    ctx.save();
    ctx.translate(x, this.y + bob);

    ctx.fillStyle = "#26324b";
    ctx.beginPath();
    ctx.ellipse(18, 22, 18, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff8c9e";
    ctx.beginPath();
    ctx.arc(18, 15, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#151a28";
    ctx.fillRect(7, 10, 22, 7);

    ctx.fillStyle = "#75f3ff";
    ctx.fillRect(10, 11, 5, 5);
    ctx.fillRect(22, 11, 5, 5);

    ctx.restore();
  }
}

export class EnemyManager {
  constructor() {
    this.enemies = [];
  }

  add(config) {
    const enemy = new Enemy(config);
    this.enemies.push(enemy);
    return enemy;
  }

  update(player, dt, events) {
    for (const enemy of this.enemies) {
      enemy.update(dt);

      if (enemy.dead) continue;

      if (Physics.overlap(player, enemy)) {
        const stomp = player.vy > 0 &&
          player.y + player.h - player.vy * dt < enemy.y + 14;

        if (stomp) {
          enemy.dead = true;
          player.vy = -9;
          events.emit("enemy:defeated", { enemy, method: "stomp" });
        } else {
          const result = player.damage(20);

          if (result) {
            events.emit("player:damaged", { enemy, result });
          }
        }
      }
    }
  }

  pulse(player, events, { range = 190, method = "pulse" } = {}) {
    let defeated = 0;

    for (const enemy of this.enemies) {
      if (enemy.dead) continue;

      if (Physics.distance(player, enemy) < range) {
        enemy.dead = true;
        defeated++;
        events.emit("enemy:defeated", { enemy, method });
      }
    }

    return defeated;
  }

  draw(ctx, cameraX) {
    for (const enemy of this.enemies) {
      enemy.draw(ctx, cameraX);
    }
  }
}
