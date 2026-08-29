export class AbilitySystem {
  use(character, abilityName) {
    const ability = character?.abilities?.[abilityName];
    if (!ability) return { success: false, reason: "ability_not_found" };
    if (!character.unlockedAbilities.includes(abilityName)) return { success: false, reason: "ability_locked", ability };
    if ((character.cooldowns[abilityName] || 0) > 0) return { success: false, reason: "cooldown", ability, remaining: character.cooldowns[abilityName] };
    if (character.energy < ability.cost) return { success: false, reason: "not_enough_energy", ability };

    character.energy -= ability.cost;
    character.cooldowns[abilityName] = ability.cooldown;
    return { success: true, abilityName, ability, character };
  }

  update(character, deltaTime) {
    if (!character?.cooldowns) return;
    for (const name of Object.keys(character.cooldowns)) {
      character.cooldowns[name] = Math.max(0, character.cooldowns[name] - deltaTime);
    }
  }
}

const abilitySystem = new AbilitySystem();
export default abilitySystem;
