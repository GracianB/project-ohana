export async function earnKiloRemate(page){
 return page.evaluate(()=>{const e=window.__OHANA_E2E;e.setInvulnerable(600);e.step(12);e.setPlayer(800,1080);e.step(12);e.combatTarget();e.attack();e.step(12);e.combatTarget();e.cast(0);e.step(14);e.combatTarget();e.attack();e.step(1);return e.state().kiloCombo;});
}
