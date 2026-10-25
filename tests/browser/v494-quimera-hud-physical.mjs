// V514 supersedes the original V494 test, which stopped after Kilo's
// fourth flower and incorrectly presumed an earned seal before the chapter
// guardian. The original implementation remains in Git history.
//
// Run the strictly stronger genuine NORMAL campaign instead. It traverses
// all ten earned chapters, defeats the chapter guardians and Quimera through
// ordinary physics/input, then asserts the dedicated Quimera HUD is accessible
// and takes authentic screenshots at EACH of four boss phases.
// No save editing, scripted boss HP, teleportation or forged achievements.
import './v513-full-campaign.mjs';
