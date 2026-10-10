# Multiplayer connectivity

OHANA keeps room authentication and canonical progress on Netlify. WebRTC data
channels carry cosmetic poses every 50 ms and immediate action feedback; server
snapshots remain the fallback. A faster WebRTC connection does not remove the
latency of authoritative HTTP operations.

## Negotiation and recovery

The initial offer/answer waits up to 1,200 ms for ICE gathering. Candidates already
included in SDP add no extra requests. Later candidates are batched through the
existing authenticated room signals, up to four per packet and 1,600 serialized
characters. Candidates arriving before remote SDP are buffered. Signal handling
is serialized, deduplicated, bounded and scoped to the negotiation session.

Only the host (slot 0) initiates automatic recovery, using the existing 16/27/45 s
backoff. The guest keeps its answerer until the replacement offer arrives. Leaving
or replacing a peer discards the old channels and queued negotiation packets.

## TURN deployment

Default ICE configuration contains STUN servers, not a TURN service. Deployment
may supply `globalThis.OHANA_RTC_ICE_SERVERS` before the online game starts:

```js
globalThis.OHANA_RTC_ICE_SERVERS = [{
  urls: ["turns:YOUR_RELAY_HOST:443?transport=tcp"],
  username: "SHORT_LIVED_USERNAME",
  credential: "SHORT_LIVED_CREDENTIAL"
}];
```

Use a real relay hostname, valid TLS certificate, and temporary credentials issued
by a trusted backend. Never commit provider API keys or permanent TURN passwords
in public JavaScript. The TURN service and its reachable transports must be tested
from both players' networks; configuration alone is not proof of connectivity.
The changes here do not provision a TURN server or alter Windows security policy.

## What to measure

- `data-coop-transport`: live WebRTC (`direct`) or HTTP fallback (`server`).
- `data-coop-route`: selected ICE route (`p2p`, `relay`, `unknown`) or `server`.
- `data-coop-rtt-direct`: WebRTC ping/pong round trip; separate from HTTP RTT.
- The badge shows `WEBRTC · TURN` only when the selected candidate pair uses a
  relay. Slow HTTP replies do not label a working WebRTC route as delayed.

Route sampling runs at most once every five seconds. It exposes no addresses,
ports, SDP or credentials. In Firefox, `about:webrtc` can help inspect a failed
negotiation locally; do not publish raw dumps containing network identifiers.

## Verification

```sh
npm test
npm run test:browser:multiplayer
OHANA_TEST_LATE_ICE=1 npm run test:browser:multiplayer
OHANA_TEST_BROWSER=firefox npm run test:browser:multiplayer
npm run release:check
```

The environment-variable syntax above is for CI/POSIX shells. In PowerShell use
`$env:OHANA_TEST_LATE_ICE='1'` or `$env:OHANA_TEST_BROWSER='firefox'` before running
the command, and remove the variable afterward when switching test scenarios.

The late-ICE browser scenario uses real RTCPeerConnections and SCTP channels. It
removes candidates from the relayed SDP and delays candidate events 2.5 seconds,
requiring the candidate signal path to establish and recover the connection.
This verifies signaling behavior, not a paid TURN provider or an actual restrictive
network. Field acceptance requires two physical clients, a selected relay route
when necessary, measured latency and successful recovery after a connection loss.

## Optional automatic TURN/TLS credentials (Netlify)

The game now asks the existing authenticated `game` function for
`action: "rtc-config"` before creating a WebRTC connection. With no TURN
environment configured, the response includes no relay and the default
STUN / HTTPS fallback remains unchanged. Failed requests do not block play.

To enable this route, **first provision and operate a real coturn relay**
with a valid public TLS certificate and TCP port 443, and configure coturn's
`use-auth-secret` and `static-auth-secret` settings. In the Netlify site
environment (server-side only), set:

- `OHANA_TURN_TLS_URL=turns:relay.example.org:443?transport=tcp`
- `OHANA_TURN_SHARED_SECRET=<same long random coturn REST shared secret>`

The relay host must be reachable over TCP 443 from both clients. The
temporary TURN user is authenticated via coturn REST HMAC-SHA1 using an
expiry timestamp; 15-minute credentials are issued only to an authenticated
room participant. No permanent relay secret is sent to the browser or
committed to GitHub. A TURN account, dedicated hostname, port allocation,
TLS configuration, uptime and network acceptance tests are still required.
A successful code deploy **does not** mean TURN is operational.

An authenticated browser receives short-lived ICE configuration via the
same Netlify function already used for room polling. A new credential is
requested on reconnection; ICE negotiations in progress retain their own
current configuration. Avoid printing the response payload in production
logs because ephemeral credentials are still sensitive while valid.
