// Lists the static ES module graph of an entry (relative, deduplicated, in
// discovery order). Used to keep versus.html's <link rel=modulepreload> list
// complete so the arena loads in one parallel wave instead of a waterfall.
import fs from "node:fs";
import path from "node:path";
const IMPORT = /(?:^|[;\s}])import\s*(?:[\w*{}\s,$]+from\s*)?["']([^"']+)["']|export\s*(?:\*|\{[^}]*\})\s*from\s*["']([^"']+)["']/g;
export function moduleGraph(entry, root = process.cwd()) {
  const seen = new Set(); const order = [];
  const visit = (file) => {
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (seen.has(rel)) return; seen.add(rel); order.push(rel);
    const src = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
    for (const m of src.matchAll(IMPORT)) {
      const spec = m[1] || m[2];
      if (!spec || !spec.startsWith(".")) continue;
      visit(path.resolve(path.dirname(file), spec.split("?")[0]));
    }
  };
  visit(path.resolve(root, entry));
  return order;
}
if (import.meta.url === `file://${process.argv[1]}`) console.log(moduleGraph(process.argv[2] || "multiplayer/versus-client.js").join("\n"));
