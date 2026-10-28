import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {ROSTER} from '../characters/roster.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readme=await readFile(path.join(root,'README.md'),'utf8');

test('README official showcase does not reuse old raster portraits, sprites or backgrounds',()=>{
  assert.doesNotMatch(readme, /<img[^>]+src=["'][^"']+\.(?:png|jpe?g|webp|gif)(?:["'?])/i);
  assert.doesNotMatch(readme, /!\[[^\]]*\]\([^)]*\.(?:png|jpe?g|webp|gif)(?:\)|\?)/i);
  assert.doesNotMatch(readme, /assets\/(?:portraits|worlds|sprites)\/[^\s)"]+\.(?:png|jpe?g|webp|gif)/i);
  assert.match(readme,/gallery\.html/);
  assert.match(readme,/Canvas 2D/);
});

test('each canonical hero opens the actual Canvas gallery with a valid id',()=>{
  const ids=ROSTER.map(hero=>hero.id);
  assert.equal(ids.length,10);
  for(const id of ids)assert.ok(
    readme.includes('gallery.html?id='+id),
    'Gallery entry absent from README: '+id
  );
});

test('README local source and docs links resolve to existing repository paths',async()=>{
  const refs=[...readme.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map(match=>match[1])
    .filter(ref=>!(/^(?:https?:|mailto:|#)/.test(ref)));
  const img=[...readme.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map(match=>match[1]);
  assert.ok(refs.includes('docs/V457-CIERRE-SOLO.md'));
  assert.ok(img.includes('favicon.svg'));
  for(const ref of [...refs,...img]){
    const candidate=path.resolve(root,decodeURIComponent(ref.split('#')[0].split('?')[0]));
    assert.ok(candidate.startsWith(root+path.sep),'Path outside repository: '+ref);
    await access(candidate);
  }
});

test('README truthfully distinguishes World 1 candidate, deployment and paused multiplayer',()=>{
  assert.match(readme,/ohana-623/);
  assert.match(readme,/V623-VALIDATION.json/);
  assert.match(readme,/V623-PUBLICATION.json/);
  assert.match(readme,/Mundo 2[^\n]*en construcción/i);
  assert.match(readme,/multijugador remoto[^\n]*en pausa/i);
  assert.match(readme,/No confundimos tres cosas/i);
  assert.match(readme,/GitHub Pages/i);
  assert.doesNotMatch(readme,/V460 permanece en revisión/i);
});
