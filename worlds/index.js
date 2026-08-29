
import { BeachWorld } from "./beach.js";
import { JungleWorld } from "./jungle.js";
import { VolcanoWorld } from "./volcano.js";
import { AlienLabWorld } from "./alien_lab.js";
import { SpaceWorld } from "./space.js";

export const Worlds = {
  beach: BeachWorld,
  jungle: JungleWorld,
  volcano: VolcanoWorld,
  alien_lab: AlienLabWorld,
  space: SpaceWorld
};

export const WorldOrder = [
  "beach",
  "jungle",
  "volcano",
  "alien_lab",
  "space"
];

export function getWorldByDistance(distance) {
  if (distance < 4500) return Worlds.beach;
  if (distance < 9000) return Worlds.jungle;
  if (distance < 13500) return Worlds.volcano;
  if (distance < 18000) return Worlds.alien_lab;
  return Worlds.space;
}
