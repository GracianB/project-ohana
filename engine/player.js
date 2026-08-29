import { Physics } from "./physics.js";

export class Player {
  constructor() {
    this.spawnX = 180;
    this.spawnY = 350;

    this.x = this.spawnX;
    this.y = this.spawnY;
    this.w = 42;
    this.h = 50;

    this.vx = 0;
    this.vy = 0;

    this.speed = 5.2;
    this.jumpPower = 13;

    this.facing = 1;
    this.onGround = false;

    this.energy = 100;
    this.maxEnergy = 100;

    this.abilityCooldown = 0;
    this.invulnerable = 0;

    this.state = "idle";
    this.animationTime = 0;
  }

  update(input, platforms, dt) {
    this.animationTime += dt * 16.67;

    let direction = 0;
    if (input.left) direction--;
    if (input.right) direction++;

    this.vx += (direction * this.speed - this.vx) * 0.18;

    if (!direction) this.vx *= 0.78;
    if (direction) this.facing = direction;

    this.x += this.vx * dt;

    Physics.applyGravity(this, dt);
    this.y += this.vy * dt;

    Physics.resolvePlayerPlatforms(this, platforms, dt);

    if (this.abilityCooldown > 0) this.abilityCooldown -= dt * 16.67;
    if (this.invulnerable > 0) this.invulnerable -= dt * 16.67;

    this.energy = Math.min(this.maxEnergy, this.energy + 0.015 * dt * 16.67);

    this.updateState(direction);
  }

  updateState(direction) {
    if (!this.onGround) {
      this.state = "jump";
    } else if (Math.abs(this.vx) > 0.8 || direction) {
      this.state = "run";
    } else {
      this.state = "idle";
    }
  }

  jump() {
    if (!this.onGround) return false;

    this.vy = -this.jumpPower;
    this.onGround = false;
    return true;
  }

  damage(amount, knockback = 7) {
    if (this.invulnerable > 0) return false;

    this.energy -= amount;
    this.invulnerable = 900;
    this.vx = -this.facing * knockback;
    this.vy = -6;

    if (this.energy <= 0) {
      this.respawn();
      return "respawn";
    }

    return true;
  }

  respawn() {
    this.energy = this.maxEnergy;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.invulnerable = 1200;
  }

  canUseAbility() {
    return this.abilityCooldown <= 0 && this.energy >= 15;
  }

  useAbility() {
    if (!this.canUseAbility()) return false;

    this.energy -= 15;
    this.abilityCooldown = 700;
    return true;
  }

  draw(ctx, cameraX) {
    const x = Math.round(this.x - cameraX);
    const y = Math.round(this.y);
    const walk = Math.sin(this.animationTime * 0.012) * Math.min(1, Math.abs(this.vx) / 2);
    const character = this.character || {};
    const colors = character.colors || {};
    const primary = colors.primary || "#258fe6";
    const secondary = colors.secondary || "#f27d9f";
    const glow = colors.glow || "#75f3ff";

    ctx.save();

    if (character.evolutionStage > 0) {
      ctx.globalAlpha = 0.18 + Math.sin(this.animationTime * 0.006) * 0.06;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x + this.w / 2, y + this.h / 2, 38 + character.evolutionStage * 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (this.invulnerable > 0 && Math.floor(this.invulnerable / 90) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    if (this.facing < 0) {
      ctx.translate(x + this.w, y);
      ctx.scale(-1, 1);
      ctx.translate(-x - this.w, -y);
    }

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.ellipse(x + 21, y + 31, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.ellipse(x + 21, y + 17, 19, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 15, 12, 7, -0.45, 0, Math.PI * 2);
    ctx.ellipse(x + 38, y + 15, 12, 7, 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 15, 6, 3, -0.45, 0, Math.PI * 2);
    ctx.ellipse(x + 38, y + 15, 6, 3, 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#081322";
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 16, 4, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 28, y + 16, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 14, y + 13, 2, 3);
    ctx.fillRect(x + 27, y + 13, 2, 3);

    ctx.fillStyle = "#172033";
    ctx.beginPath();
    ctx.arc(x + 21, y + 23, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#12233b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 21, y + 24, 8, 0.15, Math.PI - 0.15);
    ctx.stroke();

    ctx.strokeStyle = primary;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 31);
    ctx.lineTo(x + 1, y + 39);
    ctx.moveTo(x + 35, y + 31);
    ctx.lineTo(x + 41, y + 38);
    ctx.stroke();

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 46);
    ctx.lineTo(x + 12 + walk * 3, y + 51);
    ctx.moveTo(x + 28, y + 46);
    ctx.lineTo(x + 31 - walk * 3, y + 51);
    ctx.stroke();

    ctx.restore();
  }
}
