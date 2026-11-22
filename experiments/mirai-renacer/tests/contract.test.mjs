import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const source = readFileSync(new URL('../codigo/mirai_reborn.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../codigo/mirai_reborn.css', import.meta.url), 'utf8');

test('engine is valid JavaScript', () => assert.doesNotThrow(() => new Script(source)));
test('only dedicated fantasy save key is declared', () => assert.match(source, /const SAVE_KEY='mirai_reborn_rpg_1'/));
test('save import validates and allowlists its fields', () => { assert.match(source, /function sanitizeSave\(s\)/); assert.match(source, /Object\.assign\(save,clean\)/); });
test('A-star rejects diagonal clipping', () => assert.match(source, /if\(dx&&dy&&\(!pass\(cx\+dx,cy\)\|\|!pass\(cx,cy\+dy\)\)\)continue/));
test('scene transitions use a safe spawn', () => assert.match(source, /function safeSpawn\(x,y\)/));
test('one render loop per activation', () => { assert.match(source, /loop!==state\.loopId/); assert.match(source, /\+\+state\.loopId/); });
test('optional memories are persisted and allowlisted', () => { assert.match(source, /const MEMORY_IDS=/); assert.match(source, /t\.memories=ids\(s\.memories,MEMORY_IDS\)/); });
test('reduced motion and mobile controls are considered', () => { assert.match(source, /save\.reduceMotion/); assert.match(styles, /\.rb-touch\{bottom:105px/); });
test('employment providers are not read by the RPG engine', () => { assert.doesNotMatch(source, /fetch\([^)]*(gmail|linkedin)/i); assert.doesNotMatch(source, /localStorage\.(getItem|setItem)\(['"](?:candidaturas|applications|employment)/i); });
