export function formatBossStatus(boss = {}, phaseName = "") {
  const phase = Math.max(1, Math.min(3, Number(boss.phase) || 1));
  const hp = Math.max(0, Math.ceil(
    (Number(boss.hp) / Math.max(1, Number(boss.max) || 1)) * 100
  ));

  const title = "REINA DEL NIDO · FASE " + phase;
  const visible = phaseName ? title + " · " + phaseName : title;

  const states = [];
  if (boss.vulnerable) states.push("vulnerable");
  if (boss.telegraph) states.push("ataque telegrafiado");
  if (boss.counterplay?.streak) states.push("racha " + boss.counterplay.streak + "/3");

  const accessible = visible + ". Salud " + hp + "%."
    + (states.length ? " Estado: " + states.join(", ") + "." : "");

  return Object.freeze({ title, visible, accessible, hp });
}
