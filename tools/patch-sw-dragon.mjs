// Inserta los 3 archivos V611 de Dragón en la lista PRECACHE de sw.js
import {readFileSync,writeFileSync} from 'fs';
const swPath=new URL('../sw.js',import.meta.url).pathname.slice(1).replace(/\//g,'\\');
let src=readFileSync(swPath,'utf8');
const MARKER='"./systems/cuerno-encounters-v610.js?v=" + VERSION,';
const INJECT=`"./systems/dragon-chapter-art-v611.js?v=" + VERSION,
  "./systems/dragon-chapter.js?v=" + VERSION,
  "./systems/dragon-encounters-v611.js?v=" + VERSION,`;
if(src.includes('dragon-encounters-v611')){console.log('Ya en precache, nada que hacer.');process.exit(0);}
if(!src.includes(MARKER)){console.error('Marcador no encontrado en sw.js');process.exit(1);}
src=src.replace(MARKER,MARKER+'\n  '+INJECT);
writeFileSync(swPath,src,'utf8');
console.log('sw.js actualizado con dragón V611.');
