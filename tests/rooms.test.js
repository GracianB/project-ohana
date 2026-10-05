import test from "node:test";
import assert from "node:assert/strict";
import { ROOMS, ROOM_W, ROOM_H, drawSigns } from "../systems/map.js";
import { WORLDS } from "../worlds/index.js";

test("room visual contract: 10 salas con identidad y mundo válidos", () => {
  const ids = Object.keys(ROOMS);
  assert.equal(ids.length, 10);
  assert.ok(ROOM_W >= 2000);
  assert.ok(ROOM_H >= 1000);
  assert.equal(typeof drawSigns, "function");

  const names = new Set();
  for (const room of Object.values(ROOMS)) {
    assert.ok(room.name);
    assert.ok(room.short);
    assert.ok(!names.has(room.name), "nombre de sala duplicado: " + room.name);
    names.add(room.name);

    assert.ok(Number.isInteger(room.world));
    assert.ok(room.world >= 0 && room.world < WORLDS.length);

    for (const [direction, dest] of Object.entries(room.doors || {})) {
      if (dest == null) continue;
      assert.ok(ROOMS[dest], room.id + "." + direction + " apunta a sala inexistente: " + dest);
    }

    for (const portal of room.portals || []) {
      assert.ok(ROOMS[portal.dest], room.id + " tiene portal hacia sala inexistente: " + portal.dest);
      assert.ok(portal.label);
    }

    if (room.needEvo != null) {
      assert.ok(Number.isInteger(room.needEvo));
      assert.ok(room.needEvo >= 0 && room.needEvo <= 4);
    }
  }
});

test("room visual contract: jefe y navegación mantienen roles claros", () => {
  assert.equal(ROOMS.boss.boss, true);
  assert.ok(ROOMS.boss.name.includes("Nido"));
  assert.ok(ROOMS.beach.portals?.some((p) => p.dest === "hub"));
  assert.ok(ROOMS.jungle.portals?.some((p) => p.dest === "volcano"));
  assert.ok(ROOMS.space.portals?.some((p) => p.dest === "reef"));
  assert.ok(ROOMS.reef.portals?.some((p) => p.dest === "beach"));
});
