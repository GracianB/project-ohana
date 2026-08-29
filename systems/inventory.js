export class InventorySystem {
  constructor({ capacity = 30, events }) {
    this.capacity = capacity;
    this.events = events;
    this.items = new Map();
  }

  add(item, amount = 1) {
    const current = this.items.get(item.id);

    if (current) {
      current.amount += amount;
    } else {
      if (this.items.size >= this.capacity) {
        this.events.emit("inventory:full", { item });
        return false;
      }

      this.items.set(item.id, {
        ...item,
        amount
      });
    }

    this.events.emit("inventory:added", {
      item: this.items.get(item.id),
      amount
    });

    return true;
  }

  remove(id, amount = 1) {
    const item = this.items.get(id);
    if (!item) return false;

    item.amount -= amount;

    if (item.amount <= 0) {
      this.items.delete(id);
    }

    this.events.emit("inventory:removed", { id, amount });
    return true;
  }

  count(id) {
    return this.items.get(id)?.amount || 0;
  }

  list() {
    return [...this.items.values()];
  }

  serialize() {
    return this.list();
  }
}
