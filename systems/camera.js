export class CameraSystem {
  constructor({ width, height }) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;

    this.target = null;
    this.followSpeed = 0.08;
    this.offsetX = width * 0.36;
    this.shake = 0;
  }

  follow(target) {
    this.target = target;
  }

  update(dt) {
    if (!this.target) return;

    const desiredX = Math.max(0, this.target.x - this.offsetX);
    this.x += (desiredX - this.x) * this.followSpeed * dt;

    if (this.shake > 0) {
      this.shake -= dt * 16.67;
    }
  }

  screenX(worldX) {
    return worldX - this.x + this.shakeOffsetX();
  }

  shakeCamera(duration = 220) {
    this.shake = duration;
  }

  shakeOffsetX() {
    if (this.shake <= 0) return 0;
    return (Math.random() - 0.5) * 8;
  }
}
