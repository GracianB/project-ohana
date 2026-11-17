// Compact presentation only. Existing native buttons and input own all actions.
export function skillIcon(key,hero=null){
 const paths={J:'M5 17v-9l12-3v10M5 10l12-3M5 17c-5-3-5 5 0 2M17 15c-5-3-5 5 0 2',K:'M3 15h14l-4-4M17 15l-4 4M6 8h7',L:'M12 3l8 4v6c0 5-8 8-8 8s-8-3-8-8V7zM8 12l3 3 5-6',I:'M5 18l7-12 7 12M12 6v14M8 10l4-4 4 4',P:'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',U:'M9 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0M21 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0M2 20v-3c0-5 8-5 8 0v3M14 20v-3c0-5 8-5 8 0v3'};
 const catPaths={J:'M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0M7 8l10 8M6 12l7 6M11 6l7 7M17 17c4 0 5 2 3 4',K:'M5 7c-4 3-4 7 0 10M9 5c-5 4-5 10 0 14M13 8c-3 2-3 6 0 8M17 10c2-3 5-2 5 1 0 4-5 7-5 7',L:'M12 20c-8-1-12-8-8-12 4-3 6 3 8 12M12 20c-1-9 0-18 4-17 5 2-3 8-4 17M12 20c8-1 12-7 8-10-4-2-5 5-8 10',I:'M5 19c8-2 9-9 7-15M10 20c7-4 10-10 9-15M3 13l5-4M13 5l-1-3-3 3',P:'M18 3a9 9 0 1 0 3 14A8 8 0 0 1 18 3M7 12l2 2 4-5',U:paths.U};
 const glyph=(hero==='cat'?catPaths[String(key).toUpperCase()]:paths[String(key).toUpperCase()])||paths.J;
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+glyph+'"/></svg>';
}
export function mountCompactHud(doc=globalThis.document){
 if(!doc?.getElementById('game')||doc.getElementById('play-options'))return;
 const menu=doc.createElement('details');menu.id='play-options';menu.innerHTML='<summary aria-label="Opciones de juego">☰</summary><nav aria-label="Opciones de juego"><button type="button" data-play-action="btn-help">Guía y controles</button><button type="button" data-play-action="btn-map">Mapa completo</button><button type="button" data-play-action="btn-festival">Colección</button><button type="button" id="play-minimap">Mostrar / ocultar minimapa</button><button type="button" id="play-skills">Nombres de habilidades</button><button type="button" data-play-action="btn-mute">Sonido</button><button type="button" data-play-action="btn-full">Pantalla completa</button><button type="button" id="play-pause">Pausar</button></nav>';
 doc.body.append(menu);doc.body.classList.add('compact-play');
 menu.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;menu.querySelector('summary').focus({preventScroll:true});if(b.id==='play-minimap'){doc.body.classList.toggle('show-local-map');dispatchEvent(new CustomEvent('ohana-minimap',{detail:{show:doc.body.classList.contains('show-local-map')}}));}
 else if(b.id==='play-skills')doc.body.classList.toggle('show-skill-names');
 else if(b.id==='play-pause')doc.getElementById('game')?.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 else if(b.dataset.playAction)doc.getElementById(b.dataset.playAction)?.click();menu.open=false;});
 doc.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});
 const toggle=doc.createElement('button');toggle.id='touch-power-toggle';toggle.type='button';toggle.textContent='✦';toggle.setAttribute('aria-label','Abrir poderes');toggle.setAttribute('aria-controls','touch');toggle.setAttribute('aria-expanded','false');
 const touch=doc.getElementById('touch');
 const attack=touch?.querySelector('[data-k="h"]');if(attack)attack.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 19L19 5M13 4l7 0 0 7M4 13l7 7M6 16l-3 5 5-3"/></svg>';
 for(const key of ['a','d','s']){const b=touch?.querySelector('[data-k="'+key+'"]');if(b)b.textContent={a:'‹',d:'›',s:'⌄'}[key];}
touch?.append(toggle);const interact=touch?.querySelector('[data-k="e"]');if(interact){touch.append(interact);interact.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 12V5a2 2 0 0 1 4 0v6-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v7c0 6-3 8-7 8-3 0-5-2-7-5l-2-3c-1-2 1-3 2-2l2 2"/></svg><span>Usar</span>';}
toggle.onclick=()=>{const open=doc.body.classList.toggle('touch-powers-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar poderes':'Abrir poderes');};
}
