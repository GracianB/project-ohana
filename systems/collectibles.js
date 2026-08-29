export class CollectibleSystem {
  constructor({ world, player, inventory, events }) {
    this.world = world;
    this.player = player;
    this.inventory = inventory;
    this.events = events;
  }

  update() {
    for (const collectible of this.world.collectibles) {
      if (collectible.taken) continue;

      const hit =
        this.player.x < collectible.x + collectible.w &&
        this.player.x + this.player.w > collectible.x &&
        this.player.y < collectible.y + collectible.h &&
        this.player.y + this.player.h > collectible.y;

      if (!hit) continue;

      collectible.taken = true;

      const item = {
        id: "energy_crystal",
        name: "Cristal de Energía",
        type: "resource",
        value: 150,
        x: collectible.x,
        y: collectible.y
      };

      this.inventory.add(item, 1);
      this.events.emit("collectible:collected", { collectible, item });
    }
  }
}
