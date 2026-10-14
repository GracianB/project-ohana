/** Move through the rendered grid, including its responsive column count. */
export function rosterIndex(index, key, count, columns = 1) {
  if (!count) return -1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const stride = Math.max(1, Math.floor(columns));
  const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -stride, ArrowDown: stride }[key];
  return delta === undefined ? index : ((index + delta) % count + count) % count;
}
