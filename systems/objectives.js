const DEFAULT_REQUIREMENT = "Sin requisito adicional";

export const OBJECTIVE_DEFS = Object.freeze({
  hub: Object.freeze({
    id: "route-beach",
    title: "RUTA · COSTA",
    text: "Reúne los cristales del claro y abre la ruta hacia la costa.",
    destination: "Playa",
    requirement: DEFAULT_REQUIREMENT,
  }),
  beach: Object.freeze({
    id: "route-jungle",
    title: "RUTA · JUNGLA",
    text: "Cruza el hueco y continúa hacia la jungla.",
    destination: "Jungla",
    requirement: DEFAULT_REQUIREMENT,
  }),
  jungle: Object.freeze({
    id: "route-volcano",
    title: "RUTA · CALDERA",
    text: "Busca la bajada central y llega a la caldera.",
    destination: "Caldera",
    requirement: "Forma 4 o superior",
    gated: true,
  }),
  volcano: Object.freeze({
    id: "route-nest",
    title: "RUTA · NIDO",
    text: "Sigue hacia la derecha. La entrada del Nido está al final de la ruta.",
    destination: "Nido",
    requirement: DEFAULT_REQUIREMENT,
  }),
  boss: Object.freeze({
    id: "world1-boss",
    title: "MUNDO 1 · FINAL",
    text: "Derrota a la Reina del Nido y cierra el Mundo 1.",
    destination: "Reina del Nido",
    requirement: "Forma 5 recomendada",
  }),
  cave: Object.freeze({
    id: "route-lab",
    title: "RUTA · LABORATORIO",
    text: "Ve hacia el laboratorio por la izquierda.",
    destination: "Laboratorio",
    requirement: "Forma 2 o superior",
    gated: true,
  }),
  lab: Object.freeze({
    id: "route-cave",
    title: "RUTA · REGRESO",
    text: "Vuelve a la cueva por la salida de la derecha.",
    destination: "Cueva",
    requirement: DEFAULT_REQUIREMENT,
  }),
  ridge: Object.freeze({
    id: "route-space",
    title: "RUTA · ÓRBITA",
    text: "Sube hacia la órbita y descubre la conexión con el agua.",
    destination: "Órbita",
    requirement: DEFAULT_REQUIREMENT,
  }),
  space: Object.freeze({
    id: "route-reef",
    title: "RUTA · ARRECIFE",
    text: "Entra en el vórtice de la derecha y baja al arrecife.",
    destination: "Arrecife",
    requirement: DEFAULT_REQUIREMENT,
  }),
  reef: Object.freeze({
    id: "route-return",
    title: "RUTA · REGRESO A LA COSTA",
    text: "Recoge los cristales del agua y vuelve a la costa por arriba.",
    destination: "Playa",
    requirement: DEFAULT_REQUIREMENT,
  }),
});

export function objectiveForRoom(id, state = {}) {
  const key = String(id || "hub");
  const base = OBJECTIVE_DEFS[key] || OBJECTIVE_DEFS.hub;
  const evo = Number.isFinite(Number(state.evo)) ? Number(state.evo) : 0;

  if (key === "jungle" && evo < 3) {
    return {
      ...base,
      text: "Necesitas más evolución antes de bajar a la caldera. Reúne XP y alcanza la forma 4.",
      requirement: "Forma 4 o superior",
      blocked: true,
    };
  }

  if (key === "cave" && evo < 1) {
    return {
      ...base,
      text: "El laboratorio pide una evolución temprana. Reúne XP y alcanza la forma 2.",
      requirement: "Forma 2 o superior",
      blocked: true,
    };
  }

  if (key === "boss" && state.won) {
    return {
      id: "world1-complete",
      title: "MUNDO 1 · CERRADO",
      text: "La Reina ha caído. La ruta principal del Mundo 1 está completada.",
      destination: "Salida",
      requirement: "Victoria",
      completed: true,
    };
  }

  return base;
}

export function formatObjective(objective) {
  if (!objective) return "";
  const parts = [objective.text];
  if (objective.destination) parts.push("Destino: " + objective.destination + ".");
  if (objective.requirement && objective.requirement !== DEFAULT_REQUIREMENT) {
    parts.push("Requisito: " + objective.requirement + ".");
  }
  return parts.join(" ");
}
