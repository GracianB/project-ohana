// Operate the production picker; the pilot never writes a selected fighter,
// health, resources, objectives or encounter progress into the game.
export async function selectFinalFighter(page,hero='kilo'){
 const chooser=page.locator('#final-hero-choice');if(!await chooser.count())return false;
 const card=chooser.locator(`.fr-hero[data-hero="${hero}"]`);if(!await card.count())throw Error('Missing earned fighter '+hero);
 await card.click();await chooser.locator('.fr-choice-confirm').click();return true;
}
