// OHANA V107 · Stop invisible selection renders during welcome/start films.
// Pure predicate for both selector and ambient background; the game is never throttled.
export function menuPaintAllowed({ playing=false, introPending=false, introPlaying=false,
  startIntro=false, hidden=false }={}){
 return !playing&&!introPending&&!introPlaying&&!startIntro&&!hidden;
}
export function menuPaintAllowedInDocument(doc=globalThis.document){
 const body=doc?.body;
 return menuPaintAllowed({
  playing:!!body?.classList?.contains("playing"),
  introPending:!!body?.classList?.contains("intro-pending"),
  introPlaying:!!body?.classList?.contains("intro-playing"),
  startIntro:!!doc?.querySelector?.("#start-intro.show"),
  hidden:doc?.visibilityState==="hidden"
 });
}
