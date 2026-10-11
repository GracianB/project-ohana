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

The game asks the authenticated `rtc-config` function before creating a WebRTC
connection. Older clients using `action: "rtc-config"` on `game` share the same
credential cache and global issuance budget. With no TURN
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
dedicated Netlify function. Credentials are reused until one minute before expiry;
provider errors are cached for 30 seconds. ICE negotiations retain their own
current configuration. Avoid printing the response payload in production
logs because ephemeral credentials are still sensitive while valid.

## Cloudflare managed TURN, no private VPS required

Cloudflare Realtime TURN credentials can be issued by Netlify after the room
session has been authenticated. The server requests short-lived credentials
from Cloudflare's documented `generate-ice-servers` API, forwarding **only**
`turns:turn.cloudflare.com:443?transport=tcp` to the browser.

1. In Cloudflare Dashboard, activate Realtime TURN and create a TURN key.
2. In the Netlify site environment settings add (scope: Functions):
   - `OHANA_CF_TURN_KEY_ID` (Cloudflare TURN key identifier)
   - `OHANA_CF_TURN_API_TOKEN` (the private key API token; secret)
3. Redeploy the Netlify site with its functions. Never paste the token in
   GitHub, browser console, game room chat or any published script.
4. Test two browsers: inspect `document.body.dataset.coopTransport` and
   `document.body.dataset.coopRoute`. A working relay reports `direct`
   and `relay`. If `server` remains, inspect Firefox `about:webrtc`
   locally without sharing unredacted network identifiers.

Cloudflare is tried first if configured, with self-hosted coturn as optional
fallback. If neither is configured or credentials cannot be obtained promptly,
STUN and HTTP fallback remain available. This feature does not guarantee
that the user's egress policies allow TURN/TLS, and does not modify the firewall.

Pricing, plan eligibility and payment requirements must be verified in the
Cloudflare account before enabling paid usage.

## Issuance protection and deployment verification

Credential retrieval has its own per-IP platform limit (12 requests/minute), so
movement and polling are unaffected. A shared store with conditional lease claims
allows at most 30 new issuance attempts/minute across all players and function
instances, including legacy clients. The fixed 30 budget slots are reused; the
limit cannot be bypassed by creating more rooms. Credential caches are scoped to
the authenticated participant, connection epoch and provider configuration.
These limits bound credential issuance, not relay bandwidth. Provider traffic
quotas and billing limits remain necessary when enabling a paid relay.

The browser E2E fixture runs the actual credential HTTP handler with a mocked
provider and verifies both RTCPeerConnections receive the temporary credentials.
The guest response is delayed; a deterministic regression test forces an offer
to arrive before TURN setup is complete and checks that it is processed later.
This is a credential-integration test, not proof of a live relay. Production
acceptance still requires a selected `relay` route between physical clients.
