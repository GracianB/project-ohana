import { multiplayerEntryRedirect } from './entry-route.js';

const main = document.getElementById('lobby-main');
const startup = document.getElementById('lobby-startup');
const message = document.getElementById('lobby-startup-message');
const retry = document.getElementById('lobby-startup-retry');
const english = new URLSearchParams(location.search).get('lang')?.toLowerCase().startsWith('en');
document.body.dataset.lobbyReady = 'loading';
if (english) message.textContent = 'Preparing the lobby…';
retry.textContent = english ? 'Try again' : 'Reintentar';
retry.addEventListener('click', () => location.reload());

const redirect = multiplayerEntryRedirect(location.href);
if (redirect) {
  // Do not start the same-origin API client on the static Pages host.
  document.body.dataset.lobbyReady = 'redirecting';
  message.textContent = english ? 'Opening multiplayer…' : 'Abriendo el multijugador…';
  location.replace(redirect);
} else {
  // Preserve the original order: the UI reads the room/network hooks installed
  // by multiplayer.js. Local servers and Netlify retain their own sessions.
  try {
    await import('../multiplayer.js?v=ohana-coop-9');
    await import('./lobby-ux.js?v=ohana-coop-9');
    main.inert = false;
    main.setAttribute('aria-busy', 'false');
    startup.hidden = true;
    document.body.dataset.lobbyReady = 'true';
  } catch {
    // Keep unfinished controls out of the focus order. Reloading retries the
    // complete entry without discarding an invitation or a saved session.
    main.setAttribute('aria-busy', 'false');
    message.textContent = english ? 'The lobby could not load. Try again.' : 'No se pudo cargar el vestíbulo. Reinténtalo.';
    retry.hidden = false;
    document.body.dataset.lobbyReady = 'error';
    retry.focus({ preventScroll: true });
  }
}
