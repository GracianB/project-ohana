// Remove incidental low bridges which visually and physically cap a pit.
// Upper routes, banks, arena floors and authored mechanic platforms stay intact.
export function openChapterPits(room){
 if(!room.hazards?.length)return room;
 room.plats=room.plats.filter(p=>!room.hazards.some(h=>{
  const overlap=Math.max(0,Math.min(p[0]+p[2],h.x+h.w)-Math.max(p[0],h.x));
  return p[3]<=30&&p[1]>=h.y-90&&p[1]<=h.y+20&&overlap>=Math.min(h.w,p[2])*.6;
 }));
 return room;
}
