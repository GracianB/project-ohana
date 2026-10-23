import {WORLD1_ROOMS, WORLD1_ORDER, cleanWorld1Seals} from './world1-rooms.js';
export function world1Guidance(id, state={}) {
 const room=WORLD1_ROOMS[id]; if(!room)return null;
 const seals=cleanWorld1Seals(state.world1Seals);
 const done=seals.includes(room.hero);
 return {objective:state.world1Won?'La familia ha vuelto a casa. Puedes regresar al inicio o repetir la Quimera.':room.fusionBoss?'Quimera: esquiva los ataques anunciados y golpea entre sus ataques. Cuatro fases, diez voces.':done?'Sello recuperado. Continúa hacia la salida del este.':room.hint,
 journey:`Mundo 1 · Sellos ${seals.length}/${WORLD1_ORDER.length}`,
 count:seals.length};
}
