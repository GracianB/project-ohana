export class DialogueSystem {
  constructor({ events }) {
    this.events = events;
    this.queue = [];
    this.active = null;
    this.index = 0;
    this.visible = false;
  }

  start(dialogue) {
    this.active = dialogue;
    this.index = 0;
    this.visible = true;

    this.events.emit("dialogue:start", {
      dialogue,
      line: dialogue.lines?.[0]
    });
  }

  next() {
    if (!this.active) return false;

    this.index++;

    if (this.index >= this.active.lines.length) {
      this.end();
      return false;
    }

    this.events.emit("dialogue:line", {
      dialogue: this.active,
      line: this.active.lines[this.index],
      index: this.index
    });

    return true;
  }

  end() {
    const dialogue = this.active;
    this.active = null;
    this.visible = false;
    this.events.emit("dialogue:end", { dialogue });
  }

  say(speaker, text) {
    this.start({
      id: `quick-${Date.now()}`,
      lines: [{ speaker, text }]
    });
  }
}
