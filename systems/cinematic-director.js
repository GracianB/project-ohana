// PROJECT OHANA V44 · CINEMATIC DIRECTOR
// Big cinema is reserved for meaningful beats. Death uses DeathFx; rooms use gameplay presentation.
addEventListener("ohana-death", () => {
  document.body.classList.add("death-beat");
  setTimeout(() => document.body.classList.remove("death-beat"), 420);
});
addEventListener("ohana-boss-fall", () => {
  // systems/ending.js owns the final sequence.
});
addEventListener("ohana-evolve", (event) => {
  const d = event.detail || {};
  document.body.classList.toggle("cinema-final-evolution", !!d.final);
});
addEventListener("ohana-evolve-done", () => {
  document.body.classList.remove("cinema-final-evolution");
});
export const cinematicDirector = { play() {} };
