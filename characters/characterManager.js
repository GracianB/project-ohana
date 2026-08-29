import LILO from "./lilo.js";
import STITCH from "./stitch.js";
import DRAGON from "./dragon.js";
import KAWAII_CAT from "./kawaii-cat.js";
import abilitySystem from "./abilities.js";
import evolutionSystem from "../systems/evolution.js";

const clone = value => structuredClone(value);

export class CharacterManager {
  constructor() {
    this.definitions = new Map();
    this.characters = new Map();
    this.listeners = new Map();
    this.activeCharacterId = null;
    [LILO, STITCH, DRAGON, KAWAII_CAT].forEach(definition => this.register(definition));
  }

  register(definition) {
    if (!definition?.id) return false;
    this.definitions.set(definition.id, definition);
    this.emit("character_registered", { id: definition.id, name: definition.name });
    return true;
  }

  getDefinition(characterId) { return this.definitions.get(characterId) || null; }

  getAvailableCharacters() {
    return [...this.definitions.values()].map(({ id, name, role, description, colors, stats, evolution }) => ({
      id, name, role, description, colors, stats: clone(stats), evolution: clone(evolution)
    }));
  }

  createCharacter(characterId) {
    const definition = this.getDefinition(characterId);
    if (!definition) return null;

    const stats = clone(definition.stats || {});
    const initialForm = definition.evolution?.forms?.[0] || { name: definition.name };
    const unlockedAbilities = Object.entries(definition.abilities || {})
      .filter(([, ability]) => (ability.requiredEvolutionStage || 0) === 0)
      .map(([name]) => name);
    const character = {
      id: definition.id,
      definitionId: definition.id,
      name: definition.name,
      role: definition.role,
      description: definition.description,
      colors: clone(definition.colors || {}),
      level: 1,
      xp: 0,
      health: stats.maxHealth || 100,
      maxHealth: stats.maxHealth || 100,
      energy: stats.maxEnergy || 100,
      maxEnergy: stats.maxEnergy || 100,
      stats,
      abilities: clone(definition.abilities || {}),
      evolutionStage: 0,
      currentForm: initialForm.name,
      unlockedAbilities,
      cooldowns: {},
      dead: false
    };
    this.characters.set(characterId, character);
    this.emit("character_created", { character });
    return character;
  }

  getCharacter(characterId) { return this.characters.get(characterId) || null; }
  getOrCreate(characterId) { return this.getCharacter(characterId) || this.createCharacter(characterId); }
  getActiveCharacter() { return this.activeCharacterId ? this.getCharacter(this.activeCharacterId) : null; }

  selectCharacter(characterId, player) {
    const character = this.getOrCreate(characterId);
    if (!character) return { success: false, reason: "character_not_found" };
    const previousCharacter = this.getActiveCharacter();
    if (player && previousCharacter) this.syncFromPlayer(player, previousCharacter);

    this.activeCharacterId = characterId;
    if (player) this.applyToPlayer(player, character);
    this.emit("character_selected", { previousCharacter, character });
    return { success: true, character, previousCharacter };
  }

  switchCharacter(characterId, player) { return this.selectCharacter(characterId, player); }

  syncFromPlayer(player, character = this.getActiveCharacter()) {
    if (!player || !character) return null;
    character.energy = Math.max(0, Math.min(character.maxEnergy, player.energy));
    return character;
  }

  applyToPlayer(player, character = this.getActiveCharacter()) {
    if (!player || !character) return null;
    player.character = character;
    player.characterId = character.id;
    player.maxEnergy = character.maxEnergy;
    player.energy = Math.min(player.maxEnergy, character.energy);
    player.speed = character.stats.speed || player.speed;
    player.jumpPower = character.stats.jumpPower || player.jumpPower;
    return character;
  }

  addXP(amount, characterId = this.activeCharacterId) {
    const character = this.getCharacter(characterId);
    const definition = this.getDefinition(characterId);
    if (!character || !definition) return { success: false, reason: "character_not_found" };
    const result = evolutionSystem.addExperience(character, definition, amount);
    if (result.success) {
      this.emit("xp_gained", { character, amount, result });
      if (result.levelsGained) this.emit("level_up", { character, result });
      if (result.evolutionAvailable) this.emit("evolution_available", { character, nextEvolution: result.nextEvolution });
    }
    return result;
  }

  canEvolve(characterId = this.activeCharacterId) {
    const character = this.getCharacter(characterId);
    const definition = this.getDefinition(characterId);
    return character && definition ? evolutionSystem.checkEvolution(character, definition) : { available: false, nextEvolution: null };
  }

  evolve(characterId = this.activeCharacterId, player) {
    const character = this.getCharacter(characterId);
    const definition = this.getDefinition(characterId);
    if (!character || !definition) return { success: false, reason: "character_not_found" };
    const result = evolutionSystem.evolve(character, definition);
    if (result.success) {
      if (player && characterId === this.activeCharacterId) this.applyToPlayer(player, character);
      this.emit("character_evolved", { character, result });
    }
    return result;
  }

  getEvolutionProgress(characterId = this.activeCharacterId) {
    const character = this.getCharacter(characterId);
    const definition = this.getDefinition(characterId);
    return character && definition ? evolutionSystem.getEvolutionProgress(character, definition) : null;
  }

  useAbility(abilityName, characterId = this.activeCharacterId, player) {
    const character = this.getCharacter(characterId);
    if (!character) return { success: false, reason: "character_not_found" };
    if (player) this.syncFromPlayer(player, character);
    const result = abilitySystem.use(character, abilityName);
    if (result.success) {
      if (player && characterId === this.activeCharacterId) this.applyToPlayer(player, character);
      this.emit("ability_used", { character, abilityName, result });
    }
    return result;
  }

  useUltimate(characterId = this.activeCharacterId, player) { return this.useAbility("ultimate", characterId, player); }

  update(deltaTime) {
    for (const character of this.characters.values()) abilitySystem.update(character, deltaTime);
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
    this.listeners.get(eventName).add(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) { this.listeners.get(eventName)?.delete(callback); }

  emit(eventName, data) {
    this.listeners.get(eventName)?.forEach(callback => {
      try { callback(data); } catch (error) { console.error(`[OHANA CHARACTER ERROR] ${eventName}`, error); }
    });
  }
}

export const characterManager = new CharacterManager();
export default characterManager;
