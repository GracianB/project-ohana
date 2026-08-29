const clone = value => structuredClone(value);

export class EvolutionSystem {
  getRequiredXP(level) {
    return Math.round(90 + level * 65 + level * level * 8);
  }

  addExperience(character, definition, amount) {
    if (!Number.isFinite(amount) || amount <= 0) return { success: false, reason: "invalid_xp" };

    const levelBefore = character.level;
    character.xp += Math.floor(amount);
    let requiredXP = this.getRequiredXP(character.level, definition);

    while (character.xp >= requiredXP) {
      character.xp -= requiredXP;
      character.level += 1;
      requiredXP = this.getRequiredXP(character.level, definition);
    }

    const evolution = this.checkEvolution(character, definition);
    return {
      success: true,
      amount: Math.floor(amount),
      levelsGained: character.level - levelBefore,
      level: character.level,
      xp: character.xp,
      requiredXP,
      evolutionAvailable: evolution.available,
      nextEvolution: evolution.nextEvolution
    };
  }

  checkEvolution(character, definition) {
    const forms = definition?.evolution?.forms || [];
    const nextEvolution = forms[character.evolutionStage + 1] || null;
    return {
      available: Boolean(nextEvolution && character.level >= nextEvolution.level),
      nextEvolution
    };
  }

  evolve(character, definition) {
    const result = this.checkEvolution(character, definition);
    if (!result.available) return { success: false, reason: "evolution_not_available", ...result };

    character.evolutionStage += 1;
    const form = result.nextEvolution;
    character.currentForm = form.name;
    this.applyFormStats(character, definition);

    for (const abilityName of form.unlocks || []) {
      if (!character.unlockedAbilities.includes(abilityName)) character.unlockedAbilities.push(abilityName);
    }

    return { success: true, newForm: form.name, form, character };
  }

  applyFormStats(character, definition) {
    const baseStats = clone(definition.stats || {});
    const forms = definition?.evolution?.forms || [];

    for (let stage = 1; stage <= character.evolutionStage; stage += 1) {
      const bonuses = forms[stage]?.bonuses || {};
      for (const [key, value] of Object.entries(bonuses)) {
        baseStats[key] = (baseStats[key] || 0) + value;
      }
    }

    const oldMaxEnergy = character.maxEnergy || baseStats.maxEnergy || 100;
    character.stats = baseStats;
    character.maxHealth = baseStats.maxHealth || character.maxHealth;
    character.maxEnergy = baseStats.maxEnergy || character.maxEnergy;
    character.energy = Math.min(character.maxEnergy, character.energy + Math.max(0, character.maxEnergy - oldMaxEnergy));
  }

  getEvolutionProgress(character, definition) {
    const status = this.checkEvolution(character, definition);
    const requiredXP = this.getRequiredXP(character.level, definition);
    return {
      level: character.level,
      xp: character.xp,
      requiredXP,
      stage: character.evolutionStage,
      form: character.currentForm,
      ...status
    };
  }
}

const evolutionSystem = new EvolutionSystem();
export default evolutionSystem;
