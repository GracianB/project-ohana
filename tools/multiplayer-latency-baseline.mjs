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
const stats = {
  scenario:"sequential synthetic engine movement",
  requests:samples.length, simulatedStorageLatencyMs:latency,
  p50ms:Number(percentile(samples,50).toFixed(2)),
  p95ms:Number(percentile(samples,95).toFixed(2)),
  maxMs:Number(Math.max(...samples).toFixed(2)),
  accepted:accepted.filter(Boolean).length, failures,
  storageReads:store.reads, storageWrites:store.writes, conflicts:store.conflicts,
  note:"Measures local room-service/storage processing ONLY. It does not measure WebRTC, browsers, real network RTT, Netlify cold starts or render delay."
};
console.log(JSON.stringify(stats,null,2));
if (failures.length || stats.accepted !== 50) process.exitCode = 1;
