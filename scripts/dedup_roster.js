const fs = require('fs');
const path = 'C:/Users/graci/.gemini/antigravity/scratch/project-ohana/characters/roster.js';
let code = fs.readFileSync(path, 'utf8');
// Simple regex to extract ALL_ROSTER array content
const rosterMatch = code.match(/export const ALL_ROSTER = \[(.*?\n\s*\]);/s);
if (!rosterMatch) { console.error('Roster not found'); process.exit(1); }
let rosterContent = rosterMatch[1];
// Split by objects assuming each object starts with { on its own line
let objects = rosterContent.split(/\n\s*\{\s*\n/).map((segment, idx) => {
  if (idx === 0) return segment; // before first { (should be empty)
  return '{\n' + segment;
});
// Parse each object to get id
function getId(objStr) {
  const idMatch = objStr.match(/id:\s*"(.*?)"/);
  return idMatch ? idMatch[1] : null;
}
const unique = [];
const seen = new Set();
for (let obj of objects) {
  const id = getId(obj);
  if (id && seen.has(id)) continue;
  if (id) seen.add(id);
  unique.push(obj.trim().replace(/,$/, '')); // remove trailing comma
}
// Reconstruct roster array
const newRoster = 'export const ALL_ROSTER = [\n' + unique.map(o => '  ' + o.replace(/\n/g, '\n  ')).join(',\n') + '\n];';
// Replace in original code
const newCode = code.replace(/export const ALL_ROSTER = \[.*?\n\s*\];/s, newRoster);
fs.writeFileSync(path, newCode, 'utf8');
console.log('Deduplication done');
