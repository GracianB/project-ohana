// Compact presentation only. Existing native buttons and input own all actions.
export function skillIcon(key){
 const paths={J:'M5 17v-9l12-3v10M5 10l12-3M5 17c-5-3-5 5 0 2M17 15c-5-3-5 5 0 2',K:'M3 15h14l-4-4M17 15l-4 4M6 8h7',L:'M12 3l8 4v6c0 5-8 8-8 8s-8-3-8-8V7zM8 12l3 3 5-6',I:'M5 18l7-12 7 12M12 6v14M8 10l4-4 4 4',P:'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',U:'M9 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0M21 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0M2 20v-3c0-5 8-5 8 0v3M14 20v-3c0-5 8-5 8 0v3'};
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[String(key).toUpperCase()]||paths.J)+'"/></svg>';
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
touch?.append(toggle);const interact=touch?.querySelector('[data-k="e"]');if(interact)touch.append(interact);
toggle.onclick=()=>{const open=doc.body.classList.toggle('touch-powers-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar poderes':'Abrir poderes');};
}
