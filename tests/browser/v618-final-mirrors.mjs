// V618 real Chromium check: canonical hero renderer inside the ten mirrors,
// energy build-up, corrupted/freed ending, reduced-motion and narrow screens.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {startServer} from './server.mjs';

const server = await startServer(0);
let browser;
try {
  browser = await chromium.launch(process.env.CHROMIUM_BIN ? {executablePath:process.env.CHROMIUM_BIN} : {});
  const page = await browser.newPage({viewport:{width:1280,height:800}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:' + server.address().port + '/?e2e=1', {waitUntil:'domcontentloaded'});
  await fs.mkdir('test-results/v618', {recursive:true});
  const view = async (cameraX, playerX, reduced, bossActive, victory, width) => {
    await page.setViewportSize({width, height:800});
    return page.evaluate(async args => {
      const {drawPortalMirrors, FINAL_PORTALS, FINAL_HEART, finalMirrorCharge} =
        await import('/systems/final-portal-mirrors.js');
      document.getElementById('v618-canvas')?.remove();
      const canvas = document.createElement('canvas');
      canvas.id = 'v618-canvas';
      canvas.width = args.width;
      canvas.height = 680;
      canvas.style.cssText = 'position:fixed;z-index:999999;left:0;top:0;max-width:100%;height:auto;pointer-events:none;background:radial-gradient(ellipse at center,#17294a,#090e25 75%);';
      document.body.append(canvas);
      const ctx = canvas.getContext('2d', {willReadFrequently:true});
      const player = {x:args.playerX,y:1094,w:40,h:40};
      drawPortalMirrors(ctx, FINAL_PORTALS, {x:args.cameraX,y:600}, 250, player,
        args.reduced, {bossActive:args.bossActive,victory:args.victory});
      const pixels = ctx.getImageData(0,0,canvas.width,canvas.height).data;
      let nonTransparent = 0;
      for (let i=3; i<pixels.length; i+=4) if (pixels[i]>10) nonTransparent++;
      return {charge:finalMirrorCharge(FINAL_PORTALS,player),nonTransparent,
        heroes:FINAL_PORTALS.map(p=>p.hero),heartX:FINAL_HEART.x-args.cameraX};
    }, {cameraX, playerX, reduced, bossActive, victory, width});
  };
  const approach = await view(150, 1200, false, false, false, 1280);
  assert.equal(approach.heroes.length, 10);
  assert.ok(approach.nonTransparent > 10000, 'the first real hero mirrors must render');
  await page.locator('#v618-canvas').screenshot({path:'test-results/v618/family-mirrors-desktop.png'});
  const ending = await view(5500, 6500, false, true, false, 1280);
  assert.equal(ending.charge,1);
  assert.ok(ending.nonTransparent > 5000, 'the corrupted heart must render');
  await page.locator('#v618-canvas').screenshot({path:'test-results/v618/heart-quimera-desktop.png'});
  const restored = await view(6300, 6500, true, false, true, 390);
  assert.equal(restored.charge,1);
  assert.ok(restored.nonTransparent > 2500, 'the restored heart must render on narrow screens');
  await page.locator('#v618-canvas').screenshot({path:'test-results/v618/heart-restored-mobile.png'});
  assert.deepEqual(errors, []);
  console.log('PASS V618: ten real reflections, crescendo, corrupted/restored heart, mobile and reduced motion');
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
