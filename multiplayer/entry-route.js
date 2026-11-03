// GitHub Pages serves the solo game and can link to the online lobby, but it
// cannot run the Netlify Functions used by that lobby. Keep the destination
// fixed and leave production Netlify, previews and local test servers alone.
const PAGES_ORIGIN = 'https://gracianb.github.io';
const PAGES_LOBBY_PATHS = new Set([
  '/project-ohana/multiplayer',
  '/project-ohana/multiplayer.html',
  '/project-ohana/multiplayer/',
]);

export function multiplayerEntryRedirect(href) {
  let source;
  try { source = new URL(href); } catch { return null; }
  if (source.origin !== PAGES_ORIGIN || !PAGES_LOBBY_PATHS.has(source.pathname)) return null;
  const target = new URL('https://project-ohana-multiplayer.netlify.app/multiplayer');
  target.search = source.search;
  target.hash = source.hash;
  return target.href;
}
