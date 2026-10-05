export function bindDialogs({ document: doc, onChange = () => {}, onEscape = () => {} }) {
  const layers = [...doc.querySelectorAll("[data-dialog]")];
  let active = null;
  let returnFocus = null;
  const originalInert = new Map();
  const focusable = (layer) => [...layer.querySelectorAll("button, a[href], [tabindex], input, select, textarea")]
    .filter((el) => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length > 0);
  function sync() {
    const next = layers.findLast((layer) => layer.classList.contains(layer.dataset.dialog));
    for (const layer of layers) layer.setAttribute("aria-hidden", layer === next ? "false" : "true");
    if (next) {
      for (const el of doc.body.children) {
        if (!originalInert.has(el)) originalInert.set(el, el.inert);
        el.inert = el !== next;
      }
    } else {
      for (const [el, inert] of originalInert) el.inert = inert;
      originalInert.clear();
    }
    if (next === active) return;
    if (!active && next) returnFocus = doc.activeElement;
    active = next;
    onChange(active);
    if (active) {
      active.tabIndex = -1;
      (focusable(active)[0] || active).focus({ preventScroll: true });
    } else {
      const fallback = doc.querySelector(doc.body.classList.contains("playing") ? "#game" : ".char-card.selected");
      const target = returnFocus?.isConnected && returnFocus.getClientRects().length && !returnFocus.closest("[inert]") ? returnFocus : fallback;
      target?.focus({ preventScroll: true });
      returnFocus = null;
    }
  }
  function trap(event) {
    if (!active) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onEscape(active);
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable(active);
    const index = items.indexOf(doc.activeElement);
    event.preventDefault();
    const next = event.shiftKey ? (index <= 0 ? items.length - 1 : index - 1) : (index + 1) % items.length;
    (items[next] || active).focus();
  }
  const observer = new MutationObserver(sync);
  for (const layer of layers) observer.observe(layer, { attributes: true, attributeFilter: ["class"], childList: true });
  observer.observe(doc.body, { childList: true });
  doc.addEventListener("keydown", trap, true);
  sync();
  return {
    sync,
    destroy() {
      observer.disconnect();
      doc.removeEventListener("keydown", trap, true);
      for (const [el, inert] of originalInert) el.inert = inert;
      originalInert.clear();
      active = null;
      returnFocus = null;
    }
  };
}
