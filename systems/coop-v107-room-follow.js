// V107: follow only NEW remote room transitions, never a persistent mismatch.
// Prevents peers bouncing each other back to the previous world while network
// responses are temporarily out of order. Real "room" signals are handled separately.
export function shouldFollowPeerRoom(previousPeerRoom,nextPeerRoom,localRoom,now=0,graceUntil=0){
 if(typeof previousPeerRoom!=="string"||!previousPeerRoom)return false;
 if(typeof nextPeerRoom!=="string"||!nextPeerRoom)return false;
 if(nextPeerRoom===previousPeerRoom||nextPeerRoom===localRoom)return false;
 if(!Number.isFinite(now)||!Number.isFinite(graceUntil)||now<graceUntil)return false;
 return true;
}
