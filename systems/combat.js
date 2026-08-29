export class CombatSystem {
  constructor({ player, enemies, events }) {
    this.player = player;
    this.enemies = enemies;
    this.events = events;
    this.combo = 0;
    this.comboTimer = 0;
  }

  update(dt) {
    this.comboTimer -= dt * 16.67;
    if (this.comboTimer <= 0) this.combo = 0;
  }

  pulse({ range = 190, consumeEnergy = true, method = "pulse" } = {}) {
    if (consumeEnergy && !this.player.useAbility()) {
      this.events.emit("combat:ability-blocked", { reason: "energy-or-cooldown" });
      return 0;
    }

    const defeated = this.enemies.pulse(this.player, this.events, { range, method });

    this.combo += defeated;
    this.comboTimer = 1800;

    this.events.emit("combat:pulse", {
      player: this.player,
      defeated,
      combo: this.combo
    });

    return defeated;
  }

  strike() {
    const defeated = this.enemies.pulse(this.player, this.events, {
      range: 82,
      method: "strike"
    });

    this.events.emit("combat:strike", { player: this.player, defeated });
    return defeated;
  }
}
