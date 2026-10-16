const VERSION = "ohana-430";
const CACHE = "ohana-static-" + VERSION;
const PRECACHE = [
  "./characters/adventure-profiles.js?v=" + VERSION,
  "./systems/adventure-state.js?v=" + VERSION,
  "./systems/stellar-power.js?v=" + VERSION,
  "./systems/welcome-story.js?v=" + VERSION,
  "./family-camp.css?v=" + VERSION,
  "./systems/family-camp.js?v=" + VERSION,
  "./systems/family-camp-model.js?v=" + VERSION,
  "./systems/evo-cine/real-actor.js?v=" + VERSION,
  "./characters/cuerno-stagecraft.js?v=" + VERSION,
  "./systems/roster-navigation.js?v=" + VERSION,
  "./characters/visual-size.js?v=" + VERSION,
  "./",
  "./index.html",
  "./multiplayer.html?v=" + VERSION,
  "./multiplayer.css?v=" + VERSION,
  "./multiplayer.js",
  "./multiplayer/mission.js",
  "./multiplayer/duo-altars.js",
  "./manifest.json",
  "./favicon.svg",
  "./style.css?v=" + VERSION,
  "./title-stage.css?v=" + VERSION,
  "./atrium-interact.css?v=" + VERSION,
  "./hud.css?v=" + VERSION,
  "./evo.css?v=" + VERSION,
  "./ending.css?v=" + VERSION,
  "./intro.css?v=" + VERSION,
  "./demo.css?v=" + VERSION,
  "./experience.css?v=" + VERSION,
  "./cinematic-ui.css?v=" + VERSION,
  "./supreme.css?v=" + VERSION,
  "./world-map.css?v=" + VERSION,
  "./mobile-v96.css?v=" + VERSION,
  "./v100-special.css?v=" + VERSION,
  "./v100-2.css?v=" + VERSION,
  "./v101-milestones.css?v=" + VERSION,
  "./v106-memory-museum.css?v=" + VERSION,
  "./game.js?v=" + VERSION,
  "./characters/art/_template.js?v=" + VERSION,
  "./characters/art/cat.js?v=" + VERSION,
  "./characters/art/chispin.js?v=" + VERSION,
  "./characters/art/cuerno.js?v=" + VERSION,
  "./characters/art/dino.js?v=" + VERSION,
  "./characters/art/dragon.js?v=" + VERSION,
  "./characters/art/frita.js?v=" + VERSION,
  "./characters/art/index.js?v=" + VERSION,
  "./characters/art/kilo.js?v=" + VERSION,
  "./characters/art/lilo.js?v=" + VERSION,
  "./characters/art/pikachu.js?v=" + VERSION,
  "./characters/art/pizza.js?v=" + VERSION,
  "./characters/art/stitch.js?v=" + VERSION,
  "./characters/art/stitcho.js?v=" + VERSION,
  "./characters/art/yomi.js?v=" + VERSION,
  "./characters/draw.js?v=" + VERSION,
  "./characters/kinetic-stagecraft.js?v=" + VERSION,
  "./characters/evolution.js?v=" + VERSION,
  "./characters/costume.js?v=" + VERSION,
  "./characters/definitive.js?v=" + VERSION,
  "./characters/look.js?v=" + VERSION,
  "./characters/rig.js?v=" + VERSION,
  "./characters/roster.js?v=" + VERSION,
  "./characters/signature.js?v=" + VERSION,
  "./characters/sprites.js?v=" + VERSION,
  "./engine/audio.js?v=" + VERSION,
  "./engine/boss-art.js?v=" + VERSION,
  "./engine/clock.js?v=" + VERSION,
  "./engine/collide.js?v=" + VERSION,
  "./engine/enemies.js?v=" + VERSION,
  "./engine/foe-brain.js?v=" + VERSION,
  "./engine/foe-rig.js?v=" + VERSION,
  "./engine/foes/kilo-foes.js?v=" + VERSION,
  "./engine/foes/stitcho-foes.js?v=" + VERSION,
  "./engine/foes/michi-foes.js?v=" + VERSION,
  "./engine/foes/chispin-foes.js?v=" + VERSION,
  "./engine/foes/dino-foes.js?v=" + VERSION,
  "./engine/foes/kilo-ai.js?v=" + VERSION,
  "./engine/foes/stitcho-ai.js?v=" + VERSION,
  "./engine/foes/michi-ai.js?v=" + VERSION,
  "./engine/foes/chispin-ai.js?v=" + VERSION,
  "./engine/foes/dino-ai.js?v=" + VERSION,
  "./systems/select-screen.js?v=" + VERSION,
  "./systems/evo-cine/kilo.js?v=" + VERSION,
  "./systems/evo-cine/frita.js?v=" + VERSION,
  "./systems/evo-cine/stitcho.js?v=" + VERSION,
  "./systems/evo-cine/cuerno.js?v=" + VERSION,
  "./systems/evo-cine/chispin.js?v=" + VERSION,
  "./systems/evo-cine/pizza.js?v=" + VERSION,
  "./systems/evo-cine/michi.js?v=" + VERSION,
  "./systems/evo-cine/yomi.js?v=" + VERSION,
  "./systems/evo-cine/dino.js?v=" + VERSION,
  "./systems/evo-cine/dragon.js?v=" + VERSION,
  "./engine/foes.js?v=" + VERSION,
  "./engine/input.js?v=" + VERSION,
  "./engine/platform-drop.js?v=" + VERSION,
  "./engine/music.js?v=" + VERSION,
  "./engine/particles.js?v=" + VERSION,
  "./systems/atrium-interact.js?v=" + VERSION,
  "./systems/abilities.js?v=" + VERSION,
  "./systems/u-field-targeting.js?v=" + VERSION,
  "./systems/family-duets.js?v=" + VERSION,
  "./systems/u-partners.js?v=" + VERSION,
  "./systems/u-duet-chemistry.js?v=" + VERSION,
  "./systems/u-duet-direction-v315.js?v=" + VERSION,
  "./systems/ability-catalog.js?v=" + VERSION,
  "./systems/boss-fall-scene.js?v=" + VERSION,
  "./systems/dragon-trial.js?v=" + VERSION,
  "./systems/canvas-gradient-cache.js?v=" + VERSION,
  "./systems/cinema-kit.js?v=" + VERSION,
  "./systems/cinema-loader.js?v=" + VERSION,
  "./systems/render-profiler.js?v=" + VERSION,
  "./systems/coop-resilience.js?v=" + VERSION,
  "./systems/coop-v95-presence.js?v=" + VERSION,
  "./systems/dino-combat.js?v=" + VERSION,
  "./systems/dino-coop-effects.js?v=" + VERSION,
  "./systems/dragon-supreme.js?v=" + VERSION,
  "./systems/dino-quake-u.js?v=" + VERSION,
  "./systems/dino-stagecraft.js?v=" + VERSION,
  "./systems/cuerno-fantasy.js?v=" + VERSION,
  "./systems/cuerno-fx.js?v=" + VERSION,
  "./systems/cuerno-kit.js?v=" + VERSION,
  "./systems/cuerno-play-v373.js?v=" + VERSION,
  "./systems/cuerno-evo-v373.js?v=" + VERSION,
  "./characters/art/cuerno-v373.js?v=" + VERSION,
  "./systems/cuerno-v92-resonance.js?v=" + VERSION,
  "./systems/cuerno-v93-metamorphosis.js?v=" + VERSION,
  "./systems/cuerno-v91-illusions.js?v=" + VERSION,
  "./systems/dino-ultimate-film.js?v=" + VERSION,
  "./systems/boss-adaptation.js?v=" + VERSION,
  "./systems/boss-bait-feedback.js?v=" + VERSION,
  "./systems/boss-bait.js?v=" + VERSION,
  "./systems/boss-behavior.js?v=" + VERSION,
  "./systems/boss-combat.js?v=" + VERSION,
  "./systems/boss-counterplay.js?v=" + VERSION,
  "./systems/boss-v94-readability.js?v=" + VERSION,
  "./systems/boss-encounter-memory.js?v=" + VERSION,
  "./systems/boss-fx.js?v=" + VERSION,
  "./systems/boss-hud.js?v=" + VERSION,
  "./systems/boss-nido.js?v=" + VERSION,
  "./systems/combat-fx.js?v=" + VERSION,
  "./systems/combat-feedback.js?v=" + VERSION,
  "./systems/death-fx.js?v=" + VERSION,
  "./systems/demo.js?v=" + VERSION,
  "./systems/dialogs.js?v=" + VERSION,
  "./systems/ending.js?v=" + VERSION,
  "./systems/ending-duo.js?v=" + VERSION,
  "./systems/v100-family-choreography.js?v=" + VERSION,
  "./systems/v1002-festival.js?v=" + VERSION,
  "./systems/v101-milestones.js?v=" + VERSION,
  "./systems/v102-living-memories.js?v=" + VERSION,
  "./systems/v103-living-stories.js?v=" + VERSION,
  "./systems/v104-living-stories.js?v=" + VERSION,
  "./systems/v105-living-stories.js?v=" + VERSION,
  "./systems/v106-final-memories.js?v=" + VERSION,
  "./systems/v106-memory-gallery.js?v=" + VERSION,
  "./systems/coop-v103-pacing.js?v=" + VERSION,
  "./systems/coop-v104-sync.js?v=" + VERSION,
  "./systems/coop-v107-room-follow.js?v=" + VERSION,
  "./systems/coop-v108-direct.js?v=" + VERSION,
  "./systems/coop-combat-mirror.js?v=" + VERSION,
  "./systems/coop-peer-effects.js?v=" + VERSION,
  "./systems/coop-ability-hits.js?v=" + VERSION,
  "./systems/kilo-duet.js?v=" + VERSION,
  "./systems/stitcho-duet.js?v=" + VERSION,
  "./systems/chispin-duet.js?v=" + VERSION,
  "./systems/michi-duet.js?v=" + VERSION,
  "./systems/stitcho-cuerno-play.js?v=" + VERSION,
  "./systems/michi-yomi-play.js?v=" + VERSION,
  "./systems/kilo-frita-interactions.js?v=" + VERSION,
  "./systems/dino-dragon-play.js?v=" + VERSION,
  "./systems/chispin-pizza-play.js?v=" + VERSION,
  "./systems/coop-challenge.js?v=" + VERSION,
  "./systems/platform-geometry.js?v=" + VERSION,
  "./systems/room-strategy.js?v=" + VERSION,
  "./systems/chispin-cloud.js?v=" + VERSION,
  "./systems/coop-v109-recovery.js?v=" + VERSION,
  "./systems/menu-visibility.js?v=" + VERSION,
  "./systems/enemy-director.js?v=" + VERSION,
  "./systems/encounter-spatial.js?v=" + VERSION,
  "./systems/encounter-signals.js?v=" + VERSION,
  "./systems/enemy-ecology.js?v=" + VERSION,
  "./systems/enemy-species.js?v=" + VERSION,
  "./systems/world-cinema.js?v=" + VERSION,
  "./systems/cinematic-director.js?v=" + VERSION,
  "./systems/supreme-cinema.js?v=" + VERSION,
  "./systems/supreme-storyboards.js?v=" + VERSION,
  "./systems/evo-cinema.js?v=" + VERSION,
  "./systems/floaters.js?v=" + VERSION,
  "./systems/hud.js?v=" + VERSION,
  "./systems/a11y-v97.js?v=" + VERSION,
  "./systems/render-v98-culling.js?v=" + VERSION,
  "./systems/frame-pressure.js?v=" + VERSION,
  "./systems/hero-mastery.js?v=" + VERSION,
  "./systems/hazards.js?v=" + VERSION,
  "./systems/intro.js?v=" + VERSION,
  "./systems/intro-cast-fit.js?v=" + VERSION,
  "./systems/intro-dragon-stage.js?v=" + VERSION,
  "./systems/intro-dino-stage.js?v=" + VERSION,
  "./systems/intro-frita-stage.js?v=" + VERSION,
  "./systems/intro-pizza-stage.js?v=" + VERSION,
  "./systems/intro-yomi-stage.js?v=" + VERSION,
  "./systems/intro-cuerno-stage.js?v=" + VERSION,
  "./systems/intro-kilo-stage.js?v=" + VERSION,
  "./systems/intro-stitcho-stage.js?v=" + VERSION,
  "./systems/intro-chispin-stage.js?v=" + VERSION,
  "./systems/intro-michi-stage.js?v=" + VERSION,
  "./systems/intro-fantasy.js?v=" + VERSION,
  "./systems/magic.js?v=" + VERSION,
  "./systems/map.js?v=" + VERSION,
  "./systems/traversal-nodes.js?v=" + VERSION,
  "./systems/traversal-safety.js?v=" + VERSION,
  "./systems/world-graph.js?v=" + VERSION,
  "./systems/mutations.js?v=" + VERSION,
  "./systems/message-manager.js?v=" + VERSION,
  "./systems/notify.js?v=" + VERSION,
  "./systems/evolution-timing.js?v=" + VERSION,
  "./systems/objectives.js?v=" + VERSION,
  "./systems/passives.js?v=" + VERSION,
  "./systems/portals.js?v=" + VERSION,
  "./systems/rain.js?v=" + VERSION,
  "./systems/runtime.js?v=" + VERSION,
  "./systems/save.js?v=" + VERSION,
  "./systems/surprises.js?v=" + VERSION,
  "./systems/title-fx.js?v=" + VERSION,
  "./systems/title.js?v=" + VERSION,
  "./systems/experience.js?v=" + VERSION,
  "./systems/online-coop.js?v=" + VERSION,
  "./systems/duo-altar-art.js?v=" + VERSION,
  "./systems/xp.js?v=" + VERSION,
  "./worlds/index.js?v=" + VERSION,
  "./worlds/odyssey-sectors.js?v=" + VERSION,
  "./worlds/room-atmosphere.js?v=" + VERSION,
  "./worlds/living-worlds.js?v=" + VERSION,
  "./worlds/painted-hub.js?v=" + VERSION,
  "./worlds/terrain.js?v=" + VERSION,
  "./worlds/painted-rooms.js?v=" + VERSION,
  "./assets/sprites/bodies/cuerno-idle.svg?v=" + VERSION,
  "./assets/sprites/bodies/cuerno-run.svg?v=" + VERSION,
  "./assets/sprites/bodies/cuerno-jump.svg?v=" + VERSION,
  "./assets/sprites/bodies/cuerno-atk.svg?v=" + VERSION,
  "./assets/sprites/forms/kilo-0.png?v=" + VERSION,
  "./assets/sprites/forms/kilo-4.png?v=" + VERSION,
  "./assets/sprites/forms/pizza-0.png?v=" + VERSION,
  "./assets/sprites/forms/pizza-4.png?v=" + VERSION,
  "./assets/sprites/forms/cat-0.png?v=" + VERSION,
  "./assets/sprites/forms/cat-4.png?v=" + VERSION,
  "./assets/sprites/forms/yomi-0.png?v=" + VERSION,
  "./assets/sprites/forms/yomi-4.png?v=" + VERSION,
  "./assets/sprites/boss-queen.png?v=" + VERSION
];

// Exact Git blob IDs, not timestamps: unchanged assets are safe to reuse across
// versions. Generated from committed source files; the release gate verifies
// every digest against the working tree before publication.
const PRECACHE_REVISIONS = {
  "characters/adventure-profiles.js": "b3277f8a6655731950360be8366a32ccde6bc907",
  "systems/adventure-state.js": "9ccba2f3f8eb5defa4101aee14ae6e990e81ccf7",
  "systems/stellar-power.js": "0b87fb930357456c260182eb3147045fcc5c3ae9",
  "systems/welcome-story.js": "4f26e793194cf16fd68ee39d4cd3e1b477e8a49e",
  "family-camp.css": "5e107cb7d8c96964f4e1c65dc6e62767634bfebf",
  "systems/family-camp.js": "95cfb9db85570cd40eeb3c74520e1e3530fcf6d8",
  "systems/family-camp-model.js": "e8e91d57eaa24b539c27e89307966d4cc55cac49",
  "systems/evo-cine/real-actor.js": "5adcb1dfc4015eb7bedc41c5303cc7961a4c6fda",
  "characters/cuerno-stagecraft.js": "43d8fbec8ae0514aac549769e2a7cee77a44fc0b",
  "systems/roster-navigation.js": "424d91e1dd30404a83119ceb13ebcbbccdcfb54a",
  "characters/visual-size.js": "3f43688c000f17ef710204163b7f67b7b7e37f1f",
  "index.html": "435e5dbe0decf8830f6dcb9e5e22f31268d0a763",
  "multiplayer.html": "8d58e873acb79c46e341587e581ac8924a73de89",
  "multiplayer.css": "1ccb496c2e795a36ecdfb3c0023aa204802c5930",
  "multiplayer.js": "80a4df82fe9afb1d0d4209d57448cb24956fffdc",
  "multiplayer/mission.js": "e94f85833c4c66f3ac8e2e51d1162d7e6db1cdd1",
  "multiplayer/duo-altars.js": "29aafd8ca96cd1320d75cbd2b7be6bd107a569b0",
  "manifest.json": "3e910803d5c4ea7d158370d0b5becb462c23d77b",
  "favicon.svg": "0abf301dd591cf61ff22025c55d3308d6a61c8d7",
  "style.css": "88c2a07e405acbd6888f7a809cc0621d2ecad514",
  "title-stage.css": "41ea8c5624ffc4472576032d9fbccc1285066df4",
  "atrium-interact.css": "d7da49b1a7d2c0d5ac3bef25d5ba8fd79e86ea5b",
  "hud.css": "88c412da08269725aa72d3edcd52011f26bf4287",
  "evo.css": "e0c4685187247fbe8986811927fe6e94286c7710",
  "ending.css": "82ec666c39ff1163eacbaa38f8710364e2d64a7b",
  "intro.css": "4d66fe8ecb60e7284393804c59899b83cc5c90f8",
  "demo.css": "44b745dbace004886fc317f8c9ea0a654cd37de2",
  "experience.css": "b091139825feb6be1a678f3ba5ebd77f2bb29306",
  "cinematic-ui.css": "4f413944a0ba3c63d43c078c3565f223df736c38",
  "supreme.css": "8cdec07251d4a7f268ec50fb3f96a199c32287f5",
  "world-map.css": "9700cb42230a70d3d551f1d327d0bfe19026086d",
  "mobile-v96.css": "d9ab3041736bf7af70c3af1118e0cead577a580c",
  "v100-special.css": "0e9d0b30a4955be103011c8818f0302b29d22c30",
  "v100-2.css": "f17852938ed2e501b6208cfe46bdda9f4ae41bdd",
  "v101-milestones.css": "580faa55039560a48a88844578ac30bbab5087c3",
  "v106-memory-museum.css": "ac809c9d0a468b6798968fc0a54bcee10d34cdc2",
  "game.js": "c8382eb85c1317a21fc49a14c6fc0eae01f288fb",
  "characters/art/_template.js": "3b988ab8c3f7b71c3b6cc83358acea551572e58f",
  "characters/art/cat.js": "94f88e26fc0ce982547bfd2e8d292299ed17c0c2",
  "characters/art/chispin.js": "f0b5134dc95a00e583bc309dcaeb462c7ee78f56",
  "characters/art/cuerno.js": "ef4f38a0d525d5e9d8aaeaa13d08aef07c85b581",
  "characters/art/dino.js": "89f11598288a5526db7f31fc5d37266d2dc8ca02",
  "characters/art/dragon.js": "56486023cd78180d64bb474f77098710441abedd",
  "characters/art/frita.js": "1e761e90bf01e73150a5302a39311f9be3570434",
  "characters/art/index.js": "5c738ee0f3205254935f678bc6d586345ed98479",
  "characters/art/kilo.js": "6cb085e45287bb7d32a8d19606506437c8d23ce6",
  "characters/art/lilo.js": "2545ace985c84888d2ca1e0b504fe5a3b35bdf4a",
  "characters/art/pikachu.js": "cf6e2559c82b26c6b99c55607d044cae922a68bd",
  "characters/art/pizza.js": "4ea37610815133b9db63fedefb9535ebc3e598af",
  "characters/art/stitch.js": "0fdd609ddb8cf44a7bd918fe6ac4e744d3e16824",
  "characters/art/stitcho.js": "cdc8f5ec3158c79ca9600bcd5b40dbd8b3e94cdc",
  "characters/art/yomi.js": "afe3a1db9b73eaa46d40517b8161ce28626d72ba",
  "characters/draw.js": "ad15b2ef8e8907d4a669cb975d0912ad00ea1213",
  "characters/kinetic-stagecraft.js": "892f6728bf8fc00c28f5798da41514d62b12e3a8",
  "characters/evolution.js": "79ae360268f3131e3ea4cf1bb5e99fdaaba4bfc9",
  "characters/costume.js": "ac0a620099244df844bee9cddac6c68149a0a960",
  "characters/definitive.js": "de08a60a9ae7198707cb68f557a6d7be15b2ea3a",
  "characters/look.js": "39154d7e158f0105c35bad3db455aa2ba85fd340",
  "characters/rig.js": "709eef2e67c4fe6e0e8d09b6057e5cf3c80cfdfe",
  "characters/roster.js": "baa15ae16983721148ad1d8fae42c01add89a323",
  "characters/signature.js": "835675968554270015edda645cca8e340978ce70",
  "characters/sprites.js": "3c1785be5f0da46f16d277ca56091fa35f6f764a",
  "engine/audio.js": "aeaa09c21cc1d9de0b69ebca1ebab9ec0bedcc34",
  "engine/boss-art.js": "96c97aec57c49f96f699391c79026212eb78ec8e",
  "engine/clock.js": "106823291b4a2ee05eaab098704322207ef26e2e",
  "engine/collide.js": "b8ddb9a49ba45fa1f792f3818e3045f9d5bc946d",
  "engine/enemies.js": "f405d4659a64bb66d5d10489d23509815d8fa1d4",
  "engine/foe-brain.js": "92da318a15a4b8de745f706584844550eebc714d",
  "engine/foe-rig.js": "4bd9f8a0d8125fa72c700226e7c38664ad65d8a9",
  "engine/foes/kilo-foes.js": "6f63d4cccead3d2d608330e36ee52e4de09df8a9",
  "engine/foes/stitcho-foes.js": "101632806b45d8f9a33b576b4aeee456c52d040b",
  "engine/foes/michi-foes.js": "aa8d9c02a6331eb2981fde98d1ac6eb48a88bb82",
  "engine/foes/chispin-foes.js": "045868012e1aa87285a55c0d8b9f35d448c23435",
  "engine/foes/dino-foes.js": "0f85f45b4e1ca99e1c0d2fed3999f049071a3a61",
  "engine/foes/kilo-ai.js": "32526908f9fedfd94b79520d316a84e06187bfa6",
  "engine/foes/stitcho-ai.js": "57812496cc2dbb6cd291ea58c46f0c3f5c1980bc",
  "engine/foes/michi-ai.js": "001fbec5c231dadfc96e61b4e1323a9060e78897",
  "engine/foes/chispin-ai.js": "5c08de57edc87d775d97186e1890037bc87ebb7e",
  "engine/foes/dino-ai.js": "91f166d92f871cc8c4d67fdecb10e8c4c4017617",
  "systems/select-screen.js": "ac5a0608f352eb59dafed831f9ebb2cb9a880e19",
  "systems/evo-cine/kilo.js": "7c8850102962935334d53f4cd8a21fd9e59dbf4e",
  "systems/evo-cine/frita.js": "32bd6b2de6ca880b5b25d882ad83da53701d8861",
  "systems/evo-cine/stitcho.js": "623798860993ee413880d267598010172b55f36d",
  "systems/evo-cine/cuerno.js": "890edcfdb2877ca4736abc3e046a72fd2bca4575",
  "systems/evo-cine/chispin.js": "950ba67afb4711967291b222e8f016fedf829acc",
  "systems/evo-cine/pizza.js": "ff81084feff4b0f62e8d19b3bd5dbf7f0fdb18e7",
  "systems/evo-cine/michi.js": "e7d05336670c0efebd6cedb90abeeb0a581c4a8d",
  "systems/evo-cine/yomi.js": "1d7c30124e64a3fe061a45199d01b2e2529bb8f2",
  "systems/evo-cine/dino.js": "fc356b5e946345dbf856173fdf293b4cb0e9b654",
  "systems/evo-cine/dragon.js": "4cfec65095a07be5942c45bc47bf119725c61b35",
  "engine/foes.js": "250d28a48300ca924fb7da7edf12674a5798bd6c",
  "engine/input.js": "73be22d662f0ba410952e7eabc8913e841acb21f",
  "engine/platform-drop.js": "ec1f2a91aa47bfeba0b387d560bf736a1217bd84",
  "engine/music.js": "1f1c2f8e63dcd8f0cce018cdc67421867075482b",
  "engine/particles.js": "c51fc9989a5facbd1be415bead79faf6f351bf96",
  "systems/atrium-interact.js": "d30ef90c40018bc35c64194811c3df9e08aae911",
  "systems/abilities.js": "116d006b7283f6834681e8c8fb38d0817a054907",
  "systems/u-field-targeting.js": "9a90034059647cd7b8f9c4b0c08a500344513c9c",
  "systems/family-duets.js": "c84379447dc57cff4474d01b07d3a8123f9dd859",
  "systems/u-partners.js": "96868a9ccc9c2f748b0b452d863c1f7cbfc1e891",
  "systems/u-duet-chemistry.js": "3989b02fad26154a7a4db9699ee65e6fff939269",
  "systems/u-duet-direction-v315.js": "60ac41d64cfd7412d12b92cacefbb1b87d388e1d",
  "systems/ability-catalog.js": "4166d1e81e67ccf78455fcb4af2dd9c9550421d8",
  "systems/boss-fall-scene.js": "fd1eb014e509495a167dbcffc49261351df950e8",
  "systems/dragon-trial.js": "d8da8839b6ec952cd7efd4b9795469773205c6dd",
  "systems/canvas-gradient-cache.js": "a33dd6799c3dff42fc484c16a4aff51b6ec31072",
  "systems/cinema-kit.js": "ebeaf62b588fd3504f33bbb2e4117f5fe287c843",
  "systems/cinema-loader.js": "a7fd7e8e8ae0da9716e87cd9e5f5ff5a443022ca",
  "systems/render-profiler.js": "3e74625b9200a9baa40d84190ca7f358719133db",
  "systems/coop-resilience.js": "9a0c97f656a8c0bbaca4b95ba6cec99e6896e5eb",
  "systems/coop-v95-presence.js": "3c71b45510b2cdd7b5f3635217fe3cf8bf8e41a1",
  "systems/dino-combat.js": "5b9a81c156973144f708bc6690f9c70ecef873ad",
  "systems/dino-coop-effects.js": "8879261283b0983a11b9364ff04302c6a1916e31",
  "systems/dragon-supreme.js": "76608fc09e28f9ae26e24f91e25de0b6a0c0275e",
  "systems/dino-quake-u.js": "4931e0abccf2bcf14ab4aab19b97f7ef0e0f4afd",
  "systems/dino-stagecraft.js": "760e17083ab7587894966d93b3e57b95e61f923f",
  "systems/cuerno-fantasy.js": "c61206d82c35b6d6d54d9406c58743e14c45adf9",
  "systems/cuerno-fx.js": "c582fda411e56482eb096dc38146c4723f80a152",
  "systems/cuerno-kit.js": "4c34498745bd2d92d7f54fecceca706832edab97",
  "systems/cuerno-play-v373.js": "fc9adf47204ded5e3dae48e26c25e5002b039f7c",
  "systems/cuerno-evo-v373.js": "27e336a70c2cbc022d918596ec356c0fc7e44bf5",
  "characters/art/cuerno-v373.js": "058ce31adad3234a0166b8d68ee9737e9b2ef10f",
  "systems/cuerno-v92-resonance.js": "20f145a444f37b11a55d3437486a4dcedae3d14c",
  "systems/cuerno-v93-metamorphosis.js": "e57d82a29cb96e5f194cfa95c6074ac503426851",
  "systems/cuerno-v91-illusions.js": "6d54567cb5c51c224e84ab1651d284ef505981de",
  "systems/dino-ultimate-film.js": "1fc8e80f257b444cb45d6ac99a5037e89eaa8114",
  "systems/boss-adaptation.js": "55f52a286af58399dbbd4ccf0c45f1ac9728c3c4",
  "systems/boss-bait-feedback.js": "7886698c7886569888d0d5732b931202a86ed070",
  "systems/boss-bait.js": "6ca3bde204828a69256528f541234a81f3eb7f23",
  "systems/boss-behavior.js": "bc3727e8c83a4f372a4ecc888a4ad0ae627b0bf8",
  "systems/boss-combat.js": "1a8fc9c40db8010349fa7041cac6eb074bf98fba",
  "systems/boss-counterplay.js": "ed979670ce894feffa098a1fee1d722addfa19a4",
  "systems/boss-v94-readability.js": "e315c3601c1ec7f5213d8235a05c4d003ec409b8",
  "systems/boss-encounter-memory.js": "061fec279fb2d7ed6ecdd0488607c6753f35f6ef",
  "systems/boss-fx.js": "82f960bd5ef9806e95735a22cf7429353cfb361b",
  "systems/boss-hud.js": "e90159158c27a3ba5db5ff685d6fd139077dca7e",
  "systems/boss-nido.js": "4595361af406ef1afd1f891140dfa16f59e0f946",
  "systems/combat-fx.js": "e70331cc3edd9b07e4e6f5ce1959fd1f221d7fae",
  "systems/combat-feedback.js": "535bdb2e5f923d10e554a7f8f605cf8f0f2f984d",
  "systems/death-fx.js": "b373412bd245f196d6d484007814301d773fc145",
  "systems/demo.js": "59f2808ccaabe0e279398918df36724f481b1d0f",
  "systems/dialogs.js": "f71fe7e537278185e260369284dc8391566e9848",
  "systems/ending.js": "f21c9645e90e484f926e1a24728e0be460051ba9",
  "systems/ending-duo.js": "1a0dbbe4c814935ef6ebed4f0a254ded3f70b5af",
  "systems/v100-family-choreography.js": "5f8ebb3851d3131394e6e198d32645ef1b2bf3c7",
  "systems/v1002-festival.js": "15ffcc231d6ebd47d2790d87bfd512b30d5f214f",
  "systems/v101-milestones.js": "cb40a244bfe688023d3558fb470b83d4ec67c2dd",
  "systems/v102-living-memories.js": "dede717c97d83b272de230ca3db2a9dcdbbf6f6b",
  "systems/v103-living-stories.js": "5f69faff9d7728c91d1984bd53299ec712342c61",
  "systems/v104-living-stories.js": "864b8884079503890ea3c75121a5c760accc6aa2",
  "systems/v105-living-stories.js": "f0c4c1a537bb6347c372cbdfdadf1e9be197ed6f",
  "systems/v106-final-memories.js": "b42d9c79cbda7ef39e2c6828194925a9837b2db0",
  "systems/v106-memory-gallery.js": "247c6b7dfab681adb289c5c7fb48251fe54271b9",
  "systems/coop-v103-pacing.js": "d11337685492515876b1b45a17a6c84131269c24",
  "systems/coop-v104-sync.js": "5d17e2eb197aff95f07887bf089a6f7aab5a4f14",
  "systems/coop-v107-room-follow.js": "9c8f21bb62748f6c6bef97e6fc0df63abce5d9be",
  "systems/coop-v108-direct.js": "48acc28b903e8809f7ce0e03e7cf73cb91f4d437",
  "systems/coop-combat-mirror.js": "7190de1ac8184f4fba7bb5fe7e4886dd201ec021",
  "systems/coop-peer-effects.js": "a1c64be2fcca40fa9aac435213dbc1065823d4a3",
  "systems/coop-ability-hits.js": "8e8559d5539b7e8a4ece3fca5b96ec920c41dfad",
  "systems/kilo-duet.js": "03de1337958491caab8e9aad404e889632d7617b",
  "systems/stitcho-duet.js": "47e8b9b043ba9e1407aba11c522fe0a2950c51d5",
  "systems/chispin-duet.js": "48f78d499228803648b4f397baac313e57d22210",
  "systems/michi-duet.js": "4f70a5494780e84e10d6df528b35462e8cb94087",
  "systems/stitcho-cuerno-play.js": "099203e8e4f51da33a9351aca361e6c7a025ea4c",
  "systems/michi-yomi-play.js": "4b7470b951e79575c39650c14c22a11c1381d64f",
  "systems/kilo-frita-interactions.js": "3b262a53f5e5e6746b7078908feda85f76340251",
  "systems/dino-dragon-play.js": "29b30ceeb06363499c6bd6111e266aa6b46f6f7b",
  "systems/chispin-pizza-play.js": "14f2ad3335d851eaaa4d1f65572c1a22f13136a7",
  "systems/coop-challenge.js": "b3f47ac8cec7092f81f7a9db2d632d3b29fb1bf5",
  "systems/platform-geometry.js": "2c94566f8d7e28f38e610ffcea7285432f858149",
  "systems/room-strategy.js": "892f1a531cf19931eba9e12345b805d5540cfb4d",
  "systems/chispin-cloud.js": "ab120d3b913e6902983161d7df1dbbdf108d174b",
  "systems/coop-v109-recovery.js": "d9fa781d392838208a35d478cea0986fb3b21fce",
  "systems/menu-visibility.js": "4a779b567eaf1c0a4d8fa9c4c056c10816410382",
  "systems/enemy-director.js": "748bbd96bbc90832272557356ec3210f4aceee9d",
  "systems/encounter-spatial.js": "4f50b64880f8182f0db121dd353067eba2276668",
  "systems/encounter-signals.js": "70b550e019561332fa598584938c888edf40106b",
  "systems/enemy-ecology.js": "b50f47be30c5ddb5e86de25986ed737529367d0d",
  "systems/enemy-species.js": "54fb76ba1b7125a2c6177588cc5cd5f5e0ac9190",
  "systems/world-cinema.js": "61000e8b753af29a327d145663faf109aec7cb69",
  "systems/cinematic-director.js": "b238f8829d833dae6756b22ea4067a808c1992d3",
  "systems/supreme-cinema.js": "1ff12dcff311bd1ccbe5879908a807e4884cf0e1",
  "systems/supreme-storyboards.js": "9ebe3ba6f15a2cd2e23d2c0e307b8b8ddf0acb26",
  "systems/evo-cinema.js": "50b82f71bd2366e27676d9dee4b89ce64f55e597",
  "systems/floaters.js": "c48b4756cd81b32860752a06a600339dfb14adbd",
  "systems/hud.js": "5a168383aeb7896cb86991f4812040b80f548eee",
  "systems/a11y-v97.js": "a636eae0e6b45bd8896d931d2e459e8049d4623f",
  "systems/render-v98-culling.js": "64725ac71706a84351b645c44b6615d8cebaf030",
  "systems/frame-pressure.js": "0386d6604ecfaa482a482eb9216962bf7413c720",
  "systems/hero-mastery.js": "830da8e6a6b2eb2352024b22b2b10cd69373c020",
  "systems/hazards.js": "2b5761f15ca57e4a22c2368142de78d64ab277ba",
  "systems/intro.js": "710c106b8d16398ada92acc4ff3052953a1cfb79",
  "systems/intro-cast-fit.js": "9c97bb2367f339ad775fc18b671fb68937a9574e",
  "systems/intro-dragon-stage.js": "d7a0d895dc6406011b408fc16c4ae6a0a9566eed",
  "systems/intro-dino-stage.js": "e866d1dce44c4f50164e944ff3791d616699f060",
  "systems/intro-frita-stage.js": "246eac271ef254625ffdf81a19d6846cf98b30a3",
  "systems/intro-pizza-stage.js": "a5a4a1852ecacdd8f0b50ba4bf6a0d92a834cce6",
  "systems/intro-yomi-stage.js": "8cf0e3e2c81593d28ac2a4642999a9d2137b3717",
  "systems/intro-cuerno-stage.js": "0c77a0a1423c5d43352f03505583c6ac918a3c5f",
  "systems/intro-kilo-stage.js": "89c4d649e598e2c7ad5ec51daecf0b8904fc374b",
  "systems/intro-stitcho-stage.js": "55d59da936c32ecc447078b83b18323c257c36b4",
  "systems/intro-chispin-stage.js": "32f0aef73a213c183d0f162c6262f6c42dec169b",
  "systems/intro-michi-stage.js": "a89f2ad4ada0c4fb89af14324d08ad7377d5a579",
  "systems/intro-fantasy.js": "4af41b9fc17ba8736ab2b8306167f270de242b80",
  "systems/magic.js": "4f737b1eda71e63ffd62ed28a88fcf54993945c8",
  "systems/map.js": "29dcac55f3db21eb77c1f258a50b09d759d428a8",
  "systems/traversal-nodes.js": "8e25357893f8354e637bed008c6e74a770ef9bb7",
  "systems/traversal-safety.js": "22dd9d72a4a9e2f3d4bc79e5a90c61a3eb03f812",
  "systems/world-graph.js": "b3fd20dd7d5325133e8b5b818a2fdb8ae231cb10",
  "systems/mutations.js": "58fa2d31dd265dbf045314363b49b4ad0e1b71bb",
  "systems/message-manager.js": "bbae3a1611d1d31810c9f76bf16cc71e79379f8a",
  "systems/notify.js": "d6ab13a1955952106587e945a0291ca29c21663d",
  "systems/evolution-timing.js": "31195d306f284aecd436e85d89a4650845b2bb1f",
  "systems/objectives.js": "74e96109895e8bb32ab852f3b0019f57bfa6a5ca",
  "systems/passives.js": "4b392b85b9379b6ecb9ff4a17b5ac2c8c3a97626",
  "systems/portals.js": "3a0fa97d105647de3551bc81bc7c0e1e8431a8ee",
  "systems/rain.js": "02c82578fd89f44120a607b21138c6ca62fe2be2",
  "systems/runtime.js": "805100524fc731356e6a90b53b69eb59573548f5",
  "systems/save.js": "2fce7a49f93d810855dbf95633f2fcd8eadb3356",
  "systems/surprises.js": "85e1a21e2018fb6ad6479a108784878323ebc4bd",
  "systems/title-fx.js": "f394d4642051f290c2964e8c919fea24e2020242",
  "systems/title.js": "f8e838da03c482ac55301fa3be7e3a8c459c3fd2",
  "systems/experience.js": "6b20279a96a9e62ac62edc27baaeab76024b54b5",
  "systems/online-coop.js": "7754f26715587617ab4b18ff5f45d86bf6308cb9",
  "systems/duo-altar-art.js": "2563f6d83f5428ff00af011fff13a542ba6dfae4",
  "systems/xp.js": "df3fba7395dfacd5fe3dc37826c6cb10c244856a",
  "worlds/index.js": "27332abeebee80c8eddc5aaffcce3a22603bbbcd",
  "worlds/odyssey-sectors.js": "5292d72c89432f2b0b2e35570d29c2d79cd7061d",
  "worlds/room-atmosphere.js": "99be70792882ff5b396e792bb50922b0bafe86fd",
  "worlds/living-worlds.js": "79435db96328f216b138de6031b76449d4b2f511",
  "worlds/painted-hub.js": "c845ee06119088951a6b30cae2cd5696535c774a",
  "worlds/terrain.js": "942f80bad7eee6133ff7faddede5ffa0d8155df7",
  "worlds/painted-rooms.js": "a93d5d0c8c5cc76845f6dac4196f36d10b56895f",
  "assets/sprites/bodies/cuerno-idle.svg": "ca6854839be73b1d927e0ec4ca85905840531db3",
  "assets/sprites/bodies/cuerno-run.svg": "ade90a6428f1821aa832e089861034c16131ce3a",
  "assets/sprites/bodies/cuerno-jump.svg": "7f3307b5ea02d6ede8d1c37e27e32275e7b5080a",
  "assets/sprites/bodies/cuerno-atk.svg": "20ac9419be1e3a9c8293670a310810cfd04b1ab6",
  "assets/sprites/forms/kilo-0.png": "cb3cbc49a2a3704a7eae33cd3725caf3f4a67b18",
  "assets/sprites/forms/kilo-4.png": "cdda4c84ea921d89a175e451b38f552b4ddf9f14",
  "assets/sprites/forms/pizza-0.png": "71f4560b9cf590d2d899e020dcff20df1da5482e",
  "assets/sprites/forms/pizza-4.png": "88a1acdec38521e3335f74316cfb60ec7f713dda",
  "assets/sprites/forms/cat-0.png": "e86ac2c2eb47ee20310cf25a504fb0a19109bace",
  "assets/sprites/forms/cat-4.png": "798687a48289d5282fc1fcc1e2482f910de89f33",
  "assets/sprites/forms/yomi-0.png": "4638db96f86599be2e710c15d253974958fe291e",
  "assets/sprites/forms/yomi-4.png": "ca3291ea61481948429594c2902b6db8cdbe229d",
  "assets/sprites/boss-queen.png": "df621d3e67969bc84df44cf2ab04173184ce29e3"
};
const REVISION_METADATA = "./.ohana-revisions.json";
const INSTALL_STATS = "./.ohana-install-stats.json";
const MAX_INSTALL_FETCHES = 6;
const PRIORITY_ASSETS = new Set([
  "./index.html","./game.js","./style.css","./title-stage.css",
  "./systems/title.js","./systems/intro.js","./systems/cinema-kit.js",
  "./characters/draw.js","./characters/roster.js"
]);
const assetPath = path => path.slice(2).split("?",1)[0];

async function installOfflineRelease() {
  const cache = await caches.open(CACHE);
  const olderKeys = (await caches.keys())
    .filter(key => /^ohana-static-ohana-\d+$/.test(key) && key !== CACHE)
    .sort((a,b)=>Number(b.split("-").pop())-Number(a.split("-").pop()));
  const previous = [];
  for(const key of olderKeys) {
    const oldCache=await caches.open(key);
    const manifestResponse=await oldCache.match(REVISION_METADATA);
    if(!manifestResponse)continue; // V367 and earlier had no trusted digests.
    try {
      const manifest=await manifestResponse.json();
      if(manifest&&typeof manifest==="object")previous.push({cache:oldCache,manifest});
    } catch (_) {} // Invalid old metadata cannot authorize reuse.
  }

  // A directory navigation and index.html are identical on GitHub Pages:
  // cache the exact same response at both URLs, using one network transfer.
  const work=PRECACHE.filter(asset=>asset!=="./")
    .sort((a,b)=>Number(PRIORITY_ASSETS.has(b))-Number(PRIORITY_ASSETS.has(a)));
  let cursor=0;
  let reused=0;
  let downloaded=0;
  async function prepare(asset) {
    const path=assetPath(asset),digest=PRECACHE_REVISIONS[path];
    if(!digest)throw new Error("OHANA missing revision for "+path);
    for(const old of previous) {
      if(old.manifest[path]!==digest)continue;
      const response=await old.cache.match(asset,{ignoreSearch:true});
      if(!response || !response.ok)continue;
      await cache.put(asset,response);
      reused++;
      return;
    }
    // No response mixing across versions unless Git blob content is identical.
    // 6 workers avoid competing with game/intro fetches on cold 4G devices.
    const response=await fetch(asset,{cache:"reload"});
    if(!response || !response.ok)throw new Error("OHANA precache failed: "+asset);
    await cache.put(asset,response);
    downloaded++;
  }
  async function worker() {
    for(;;) {
      const position=cursor++;
      if(position>=work.length)return;
      await prepare(work[position]);
    }
  }
  await Promise.all(Array.from({length:Math.min(MAX_INSTALL_FETCHES,work.length)},worker));
  const entry=await cache.match("./index.html");
  if(!entry)throw new Error("OHANA offline index missing");
  await cache.put("./",entry.clone());
  // Write the manifest only *after* ALL resources have been cached.
  // A failed install never claims a partial new offline release.
  await cache.put(REVISION_METADATA,new Response(JSON.stringify(PRECACHE_REVISIONS),{
    headers:{"Content-Type":"application/json; charset=utf-8"}
  }));
  // Local-only diagnostics for actual device updates. Never log URLs, keys,
  // player data or user identifiers and never send telemetry to a server.
  await cache.put(INSTALL_STATS,new Response(JSON.stringify({
    version:VERSION,reused,downloaded,total:work.length,
    incremental:previous.length>0
  }),{headers:{"Content-Type":"application/json; charset=utf-8"}}));
  return {reused,downloaded};
}

self.addEventListener("install", (event) => {
  event.waitUntil(installOfflineRelease().then(()=>self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("ohana-static-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Static-only GitHub Pages runtime: zero Netlify/Cloudflare requests are
// generated by the cache. Dynamic APIs cannot be cached as HTML responses.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/.netlify/functions/")) return;

  const isScript = url.pathname.endsWith(".js");
  const isNavigation = request.mode === "navigate";
  const staticAsset = /\.(?:js|css|svg|png|jpe?g|webp|json|woff2?)$/i.test(url.pathname);
  const unavailable = () => new Response("OHANA: offline asset unavailable", {
    status: 503, statusText: "Offline", headers: { "Content-Type": "text/plain; charset=utf-8" }
  });

  // V364: The 180+ version-pinned modules are *already* precached on install.
  // Network-first fetched them again on EVERY visit, wasting requests, latency
  // and battery. Reuse only the CURRENT cache; never mix in old versions.
  // URL search is ignored for internal ES imports and the ?v= cache key.
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached && (isScript || staticAsset || !isNavigation)) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        event.waitUntil(cache.put(request, copy).catch(() => {}));
      }
      return response;
    } catch (_) {
      if (cached) return cached;
      // Never answer a JavaScript/CSS/image request with index.html:
      // an HTML module body would cause "Unexpected token '<'".
      if (staticAsset) return unavailable();
      return (await cache.match("./index.html")) || unavailable();
    }
  }));
});
