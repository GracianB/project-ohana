import {CAMP_HEROES} from './family-camp-model.js';
const DATA=[
 ['kilo','Una canción para empezar','pizza','¡Mi queso está bailando!',[.12,2.1]],
 ['stitcho','El atajo imposible','chispin','La próxima cometa la sujeto yo.',[.18,3.1]],
 ['chispin','Una lucecita nada más','stitcho','¡Me has cargado hasta las orejas!',[.19,3.3]],
 ['cat','La gran cazadora','yomi','Esa mariposa es mi servilleta.',[3.1,5.4]],
 ['dragon','Tostadas de nube','dino','Mi sombrero ya no tiene techo.',[2.75,4.85]],
 ['frita','La patata fugitiva','pizza','¡Eso era mi desayuno!',[4.28,7.08]],
 ['pizza','Un abrazo con queso','frita','Bueno. La próxima traigo pan.',[4.28,7.08]],
 ['yomi','La galleta invisible','cat','Yo me he comido la de verdad.',[7.28,9.36]],
 ['cuerno','Una sorpresa elegante','dragon','¡Y luego dicen que yo echo humo!',[9.22,11.07]],
 ['dino','Un salto de puntillas','kilo','¡Nos has afinado toda la isla!',[10.8,12.79]]
];
export function dialogueSeconds(text){return Math.max(4,Math.min(6,String(text).length/12));}
let cursor=0;
export const WELCOME_STORIES=Object.freeze([...DATA.map(([hero,title,partner,reply,range])=>({hero,title,partner,range,lines:[{speaker:hero,text:CAMP_HEROES[hero].lines[0]},{speaker:hero,text:CAMP_HEROES[hero].lines[1]},{speaker:partner,text:reply}]})),
 {hero:null,title:'Mientras tanto, en el islote de enfrente…',partner:null,range:[12.8,13.6],lines:[{speaker:'cangrejo',text:'Plan perfecto: les robamos la merienda.'},{speaker:'avispa',text:'¿Y si primero les pedimos un poquito?'},{speaker:'cangrejo',text:'Eso… eso también es un plan.'}]}].map(scene=>{const duration=scene.lines.reduce((sum,line)=>sum+dialogueSeconds(line.text),0)+1.2;const start=cursor;cursor+=duration;return Object.freeze({...scene,start,duration,end:cursor,lines:Object.freeze(scene.lines.map(Object.freeze))});}));
export const WELCOME_STORY_DURATION=cursor;
export function welcomeStoryAt(seconds=0){
 const time=Math.max(0,Number(seconds)||0),index=Math.max(0,WELCOME_STORIES.findIndex(s=>time<s.end));
 const complete=time>=WELCOME_STORY_DURATION,scene=WELCOME_STORIES[complete?WELCOME_STORIES.length-1:index];
 const local=Math.max(0,Math.min(scene.duration,time-scene.start));let at=0,line=null,lineIndex=-1;
 for(let i=0;i<scene.lines.length;i++){const duration=dialogueSeconds(scene.lines[i].text);if(local>=at&&local<at+duration){line=scene.lines[i];lineIndex=i;break;}at+=duration;}
 const k=Math.min(1,local/(scene.duration-1.2));
 return {...scene,index:WELCOME_STORIES.indexOf(scene),local,line,lineIndex,complete,sceneTime:scene.range[0]+(scene.range[1]-scene.range[0])*k};
}
export function nextWelcomeLine(seconds,direction=1){
 const beat=welcomeStoryAt(seconds),bounds=[];
 for(const scene of WELCOME_STORIES){let at=scene.start;for(const line of scene.lines){bounds.push(at);at+=dialogueSeconds(line.text);}}
 if(direction<0)return [...bounds].reverse().find(at=>at<seconds-.1)??0;
 return bounds.find(at=>at>seconds+.1)??WELCOME_STORY_DURATION;
}
