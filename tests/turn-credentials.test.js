import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { temporaryTurnConfig } from "../netlify/lib/turn-credentials.mjs";

const secret="a-long-random-shared-secret-for-tests-only";
const url="turns:relay.example.org:443?transport=tcp";

test("coturn credentials expire and have verifiable HMAC without publishing secret",()=>{
  const conf=temporaryTurnConfig({url,secret,playerId:"550e8400-e29b-41d4-a716-446655440000",now:1800000000000});
  assert.equal(conf.expiresAt,1800000900000);
  assert.equal(conf.iceServers.length,1);
  const {username,credential}=conf.iceServers[0];
  assert.equal(username,"1800000900:550e8400-e29b-41d4-a716-446655440000");
  assert.equal(credential,createHmac("sha1",secret).update(username).digest("base64"));
  assert.ok(!JSON.stringify(conf).includes(secret));
});

test("no TURN configuration silently returns no relay",()=>{
  for(const [badUrl,badSecret,badPlayer] of [
    ["",secret,"valid-user"],["turn:relay.example.org:3478",secret,"valid-user"],
    [url,"short","valid-user"],[url,secret,"<script>"],
  ])assert.equal(temporaryTurnConfig({url:badUrl,secret:badSecret,playerId:badPlayer}),null);
});

test("temporary TURN lifetime stays bounded to 30 minutes",()=>{
  const conf=temporaryTurnConfig({url,secret,playerId:"valid-user",now:0,ttlSeconds:999999});
  assert.equal(conf.expiresAt,1800000);
});
