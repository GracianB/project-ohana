import test from 'node:test';import assert from 'node:assert/strict';import {WELCOME_STORIES,WELCOME_STORY_DURATION,welcomeStoryAt,nextWelcomeLine,dialogueSeconds} from '../systems/welcome-story.js';import {ROSTER} from '../characters/roster.js';
test('V420 ten protagonists each have a family interaction, plus an enemy coda',()=>{
 assert.equal(WELCOME_STORIES.length,11);assert.deepEqual(new Set(WELCOME_STORIES.map(s=>s.hero).filter(Boolean)),new Set(ROSTER.map(r=>r.id)));
 for(const s of WELCOME_STORIES){assert.equal(s.lines.length,3);if(s.hero)assert.notEqual(s.hero,s.partner);for(const line of s.lines){assert.ok(line.text.length<=55);assert.ok(dialogueSeconds(line.text)>=2.8&&dialogueSeconds(line.text)<=6);}}
});
test('V420 a single dialogue holds for its reading time and leaves a pause between scenes',()=>{
 for(const s of WELCOME_STORIES){let time=s.start;for(let i=0;i<3;i++){const duration=dialogueSeconds(s.lines[i].text);assert.equal(welcomeStoryAt(time+.01).line.text,s.lines[i].text);assert.equal(welcomeStoryAt(time+duration-.01).line.text,s.lines[i].text);time+=duration;}assert.equal(welcomeStoryAt(s.end-.1).line,null);}
 assert.equal(welcomeStoryAt(WELCOME_STORY_DURATION).complete,true);assert.equal(welcomeStoryAt(-100).index,0);
});
test('V420 next and previous move between actual dialogue boundaries, without changing durations',()=>{
 assert.equal(nextWelcomeLine(0),4);assert.equal(nextWelcomeLine(4,-1),0);assert.equal(nextWelcomeLine(0,-1),0);assert.equal(nextWelcomeLine(WELCOME_STORY_DURATION),WELCOME_STORY_DURATION);
});
