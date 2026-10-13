import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const sw = fs.readFileSync("sw.js", "utf8");
const home = fs.readFileSync("index.html", "utf8");
const title = fs.readFileSync("systems/title.js", "utf8");
const currentVersion = sw.match(/const VERSION = "(ohana-\\d+)"/)?.[1];

function harness({ offline = false } = {}) {
  const handlers = {};
  const storage = new Map();
  const prefix = "https://example.com/project-ohana/";
  let networkCalls = 0;
  const absolute = request => new URL(typeof request === "string" ? request : request.url, prefix).pathname;
  storage.set("/project-ohana/game.js", new Response("export const cached = 1;", {
    headers: { "Content-Type": "text/javascript" }
  }));
  storage.set("/project-ohana/index.html", new Response("<title>OHANA</title>", {
    headers: { "Content-Type": "text/html" }
  }));
  const cache = {
    match: async (request) => storage.get(absolute(request))?.clone(),
    put: async (request, response) => { storage.set(absolute(request), response); },
    addAll: async () => {}
  };
  const caches = {
    open: async () => cache,
    keys: async () => [],
    delete: async () => true
  };
  const self = {
    location: { origin: "https://example.com" },
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener: (name, fn) => { handlers[name] = fn; }
  };
  const fetch = async () => {
    networkCalls++;
    if (offline) throw new TypeError("offline");
    return new Response("export const live = 2;", {
      headers: { "Content-Type": "text/javascript" }
    });
  };
  vm.runInNewContext(sw, { self, caches, fetch, URL, Response }, { filename: "sw.js" });
  const dispatch = async (path, mode = "same-origin") => {
    let promise;
    const event = {
      request: { url: new URL(path, prefix).href, method: "GET", mode },
      respondWith: p => { promise = p; },
      waitUntil: () => {}
    };
    handlers.fetch(event);
    return promise ? await promise : null;
  };
  return { dispatch, networkCalls: () => networkCalls };
}

test("V364 JS cache-first: pinned and bare ES imports do not refetch after installation", async () => {
  const h = harness();
  for (const path of ["game.js?v="+currentVersion, "game.js", "game.js?v=ohana-230"]) {
    const result = await h.dispatch(path);
    assert.equal(result.status, 200);
    assert.match(await result.text(), /cached = 1/);
  }
  assert.equal(h.networkCalls(), 0, "warm-cache JS must generate zero repeat network calls");
});

test("V364 offline: unknown JavaScript must NOT be mistaken for HTML", async () => {
  const h = harness({ offline: true });
  const missing = await h.dispatch("systems/not-cached.js?v="+currentVersion);
  assert.equal(missing.status, 503);
  assert.match(missing.headers.get("content-type"), /text\/plain/);
  assert.doesNotMatch(await missing.text(), /<html|<title/i);
  const nav = await h.dispatch("index.html", "navigate");
  assert.equal(nav.status, 200);
  assert.match(await nav.text(), /OHANA/);
});

test("V364 leaves dynamic backends untouched and never caches external origins", async () => {
  const h = harness();
  assert.equal(await h.dispatch("/.netlify/functions/game"), null);
  assert.equal(await h.dispatch("/.netlify/functions/rtc-config"), null);
  assert.equal(await h.dispatch("https://fonts.googleapis.com/css?family=Outfit"), null);
  assert.equal(h.networkCalls(), 0);
});

test("V364 static distribution and UI do not point players to exhausted Netlify", () => {
  assert.ok(currentVersion && Number(currentVersion.slice(6)) >= 364);
  assert.ok([...home.matchAll(/ohana-\d+/g)].every(x => x[0] === currentVersion));
  assert.match(home, /id="btn-coop"[^>]+disabled/);
  assert.doesNotMatch(home, /netlify\.app/);
  assert.match(sw, /const isScript = url\.pathname\.endsWith\("\.js"\)/);
  const precachedScripts = [...sw.matchAll(/"\.\/[^"]+\.js\?v=" \+ VERSION/g)];
  assert.ok(precachedScripts.length > 100, "preserve full offline module graph");
});

test("V364 game renderer keeps full-speed play but idles while stopped/paused", () => {
  const game = fs.readFileSync("game.js", "utf8");
  assert.match(game, /if \(game\.running && !paused && !document\.hidden\) requestAnimationFrame\(loop\)/);
  assert.match(game, /else setTimeout\(\(\) => requestAnimationFrame\(loop\), 120\)/);
  assert.match(game, /clock\.advance\(now, step\)/, "simulation must preserve its fixed clock");
});

test("V364 portrait aura is reused, but resize invalidates the cached gradient", () => {
  assert.match(title, /cv\._context \|\| \(cv\._context = cv\.getContext/);
  assert.match(title, /if \(cv\._glowKey !== glowKey\)/);
  assert.match(title, /cv\._glow = glow/);
  assert.match(title, /cv\._glowKey = null/);
});
