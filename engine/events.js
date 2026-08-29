export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(name, callback) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, new Set());
    }

    this.listeners.get(name).add(callback);

    return () => this.off(name, callback);
  }

  off(name, callback) {
    this.listeners.get(name)?.delete(callback);
  }

  emit(name, payload = {}) {
    this.listeners.get(name)?.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`[OHANA EVENT ERROR] ${name}`, error);
      }
    });
  }

  clear(name) {
    if (name) this.listeners.delete(name);
    else this.listeners.clear();
  }
}
