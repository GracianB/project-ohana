export class QuestSystem {
  constructor({ events }) {
    this.events = events;
    this.quests = new Map();
    this.activeQuestId = null;
  }

  add(quest) {
    const normalized = {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      target: quest.target || 1,
      progress: quest.progress || 0,
      reward: quest.reward || 0,
      completed: false
    };

    this.quests.set(normalized.id, normalized);
    return normalized;
  }

  activate(id) {
    if (!this.quests.has(id)) return false;
    this.activeQuestId = id;
    this.events.emit("quest:activated", { quest: this.quests.get(id) });
    return true;
  }

  progress(id, amount = 1) {
    const quest = this.quests.get(id);
    if (!quest || quest.completed) return false;

    quest.progress = Math.min(quest.target, quest.progress + amount);

    this.events.emit("quest:progress", { quest });

    if (quest.progress >= quest.target) {
      quest.completed = true;
      this.events.emit("quest:completed", { quest });
    }

    return quest;
  }

  getActive() {
    return this.quests.get(this.activeQuestId) || null;
  }

  getAll() {
    return [...this.quests.values()];
  }
}
