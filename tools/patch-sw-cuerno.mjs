// Inserta los 3 archivos V610 de Cuerno en la lista PRECACHE de sw.js
import {readFileSync,writeFileSync} from 'fs';
const swPath=new URL('../sw.js',import.meta.url).pathname.slice(1).replace(/\//g,'\\');
let src=readFileSync(swPath,'utf8');
const MARKER='"./systems/cat-encounters-v609.js?v=" + VERSION,';
const INJECT=`"./systems/cuerno-chapter-art-v610.js?v=" + VERSION,
  "./systems/cuerno-chapter.js?v=" + VERSION,
  "./systems/cuerno-encounters-v610.js?v=" + VERSION,`;
if(src.includes('cuerno-encounters-v610')){console.log('Ya en precache, nada que hacer.');process.exit(0);}
if(!src.includes(MARKER)){console.error('Marcador no encontrado en sw.js');process.exit(1);}
src=src.replace(MARKER,MARKER+'\n  '+INJECT);
writeFileSync(swPath,src,'utf8');
console.log('sw.js actualizado con cuerno V610.');
