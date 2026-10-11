import { getStore } from "@netlify/blobs";
import { createRoomService } from "../lib/room-service.mjs";
import { createRtcConfigHandler } from "../lib/rtc-config-service.mjs";

export default async function handler(request: Request) {
 return createRtcConfigHandler({
  service:createRoomService(getStore("ohana-multiplayer-rooms")),
  store:getStore("ohana-rtc-credentials"),env:process.env,
 })(request);
}

// Protect credential retrieval without throttling movement or game polling.
export const config={rateLimit:{windowLimit:12,windowSize:60,aggregateBy:["ip","domain"]}};
