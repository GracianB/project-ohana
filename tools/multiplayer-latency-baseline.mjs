/* Local synthetic latency baseline for the Netlify room service.
 * No live requests, no credentials and no changes to game state in production.
 * Run: node tools/multiplayer-latency-baseline.mjs
 */
import { performance } from "node:perf_hooks";
import { createRoomService } from "../netlify/lib/room-service.mjs";

class MemoryStore {
  constructor(latencyMs = 0) { this.rows = new Map(); this.serial = 0; this.latencyMs = latencyMs; this.reads = 0; this.writes = 0; this.conflicts = 0; }
  async delay() { if (this.latencyMs) await new Promise(resolve => setTimeout(resolve, this.latencyMs)); }
  async getWithMetadata(key) {
    this.reads++; await this.delay();
    const row = this.rows.get(key);
    return row ? { data: structuredClone(row.data), etag: row.etag } : null;
  }
  async setJSON(key, data, options = {}) {
    this.writes++; await this.delay();
    const row = this.rows.get(key);
    if ((options.onlyIfNew && row) || (options.onlyIfMatch && (!row || row.etag !== options.onlyIfMatch))) {
      this.conflicts++; return { modified: false };
    }
    const etag = String(++this.serial);
    this.rows.set(key, { data: structuredClone(data), etag });
    return { modified: true, etag };
  }
}
function percentile(samples, pct) {
  const sorted = [...samples].sort((a,b) => a-b);
  return sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*pct/100)-1)];
}
const latency = Number(process.argv[2] ?? 0);
if (!Number.isFinite(latency) || latency < 0 || latency > 250) throw new Error("Storage latency must be between 0 and 250ms");
const store = new MemoryStore(latency);
const service = createRoomService(store);
const created = await service.create();
const joined = await service.join(created.roomId);
await service.choose(created.roomId, created.identity, "kilo");
await service.choose(created.roomId, joined.identity, "dino");
await service.ready(created.roomId, created.identity, true);
await service.ready(created.roomId, joined.identity, true);
const samples = [], accepted = [], failures = [];
for (let i = 1; i <= 50; i++) {
  const who = i%2 ? created.identity : joined.identity;
  const started = performance.now();
  try {
    const result = await service.move(created.roomId, who, {
      mode:"engine", sequence: i, actionId:who.playerId+":"+i,
      positionX:420+i*4, positionY:700, health:100, maxHealth:100, worldRoomId:"hub"
    });
    accepted.push(result.accepted);
  } catch (error) { failures.push(error.code || error.message); }
  samples.push(performance.now()-started);
}
// Stress writes from two separate players against one room. This models
// competing storage transactions, NOT a real internet RTT or WebRTC path.
const burstDurations = [], burstErrors = [];
const burstStart = performance.now();
let burstAccepted = 0;
// Two simultaneous requests per round, one from each player. Rounds wait for
// acknowledgement so a newer sequence never overtakes an older one by design.
for (let round = 0; round < 6; round++) {
  const results = await Promise.all([created.identity, joined.identity].map(async identity => {
    const sequence = 100 + round;
    const started = performance.now();
    try {
      const result = await service.move(created.roomId, identity, {
        mode:"engine", sequence, actionId:identity.playerId+":"+sequence,
        positionX:600+round*8, positionY:710, health:100, maxHealth:100,
        worldRoomId:"hub"
      });
      return { accepted:!!result.accepted };
    } catch (error) {
      burstErrors.push(error.code || error.message);
      return { accepted:false };
    } finally {
      burstDurations.push(performance.now()-started);
    }
  }));
  burstAccepted += results.filter(result=>result.accepted).length;
}
const burst = {
  requests:12, concurrentPlayers:2, rounds:6,
  wallMs:Number((performance.now()-burstStart).toFixed(2)),
  p50ms:Number(percentile(burstDurations,50).toFixed(2)),
  p95ms:Number(percentile(burstDurations,95).toFixed(2)),
  accepted:burstAccepted, errors:burstErrors, conflicts:store.conflicts
};
const stats = {
  scenario:"sequential synthetic engine movement",
  requests:samples.length, simulatedStorageLatencyMs:latency,
  p50ms:Number(percentile(samples,50).toFixed(2)),
  p95ms:Number(percentile(samples,95).toFixed(2)),
  maxMs:Number(Math.max(...samples).toFixed(2)),
  accepted:accepted.filter(Boolean).length, failures, burst,
  storageReads:store.reads, storageWrites:store.writes, conflicts:store.conflicts,
  note:"Measures local room-service/storage processing ONLY. Concurrent bursts intentionally expose contention and may reject requests. This does not measure WebRTC, browsers, real network RTT, Netlify cold starts or render delay."
};
console.log(JSON.stringify(stats,null,2));
if (failures.length || stats.accepted !== 50 || burst.errors.length || burst.accepted !== 12) process.exitCode = 1;
