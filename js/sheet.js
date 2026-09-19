// Bottom sheet (mobile) / centered dialog (desktop) with 1:1 drag, rubber-banding,
// velocity-based dismissal and interruptible animations (WAAPI, from the live value).
const DESKTOP_QUERY = "(min-width: 720px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const EASE_DRAWER = "cubic-bezier(0.32, 0.72, 0, 1)";
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const OPEN_MS = 380;
const CLOSE_MS = 260;
const FADE_MS = 200;
const DRAG_START_PX = 6;
const DISMISS_VELOCITY_PX_PER_MS = 0.45;
const DISMISS_FRACTION = 0.4;
const RUBBER_CONSTANT = 0.4;
const HISTORY_WINDOW_MS = 80;

function rubberband(overshoot, dimension) {
  return (overshoot * dimension * RUBBER_CONSTANT) / (dimension + RUBBER_CONSTANT * Math.abs(overshoot));
}

function currentTranslateY(el) {
  const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return matrix.m42;
}

function velocityFrom(history) {
  const last = history[history.length - 1];
  const first = history.find((p) => last.t - p.t <= HISTORY_WINDOW_MS) ?? history[0];
  const dt = last.t - first.t;
  return dt > 0 ? (last.y - first.y) / dt : 0;
}

export function createSheet(root, { onClose } = {}) {
  const panel = root.querySelector(".sheet-panel");
  const scrim = root.querySelector(".sheet-scrim");
  const grip = root.querySelector(".sheet-grip");
  const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;
  const reducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
  let open = false;
  let returnFocusTo = null;
  let drag = null;

  function cancelAnimations() {
    panel.getAnimations().forEach((a) => a.cancel());
    scrim.getAnimations().forEach((a) => a.cancel());
  }

  function enterKeyframes() {
    if (reducedMotion()) return [{ opacity: 0 }, { opacity: 1 }];
    if (isDesktop()) return [{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "scale(1)" }];
    return [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }];
  }

  function exitKeyframes() {
    if (reducedMotion()) return [{ opacity: 1 }, { opacity: 0 }];
    if (isDesktop()) return [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.98)" }];
    return [{ transform: `translateY(${currentTranslateY(panel)}px)` }, { transform: "translateY(100%)" }];
  }

  function show() {
    if (open) return;
    open = true;
    returnFocusTo = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add("sheet-open");
    cancelAnimations();
    const duration = reducedMotion() ? FADE_MS : OPEN_MS;
    scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: EASE_OUT, fill: "both" });
    panel.animate(enterKeyframes(), { duration, easing: EASE_DRAWER, fill: "both" });
    panel.style.transform = "";
    panel.querySelector("[data-autofocus]")?.focus({ preventScroll: true });
  }

  function finishHide() {
    root.hidden = true;
    panel.style.transform = "";
    document.documentElement.classList.remove("sheet-open");
    onClose?.();
    if (returnFocusTo instanceof HTMLElement) returnFocusTo.focus({ preventScroll: true });
  }

  function hide() {
    if (!open) return;
    open = false;
    cancelAnimations();
    const duration = reducedMotion() ? FADE_MS : CLOSE_MS;
    scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: EASE_OUT, fill: "both" });
    const anim = panel.animate(exitKeyframes(), { duration, easing: EASE_OUT, fill: "both" });
    anim.onfinish = finishHide;
    anim.oncancel = () => { if (!open) finishHide(); };
  }

  function onPointerDown(event) {
    if (isDesktop() || drag || !event.isPrimary) return;
    cancelAnimations();
    const startOffset = currentTranslateY(panel);
    panel.style.transform = `translateY(${startOffset}px)`;
    drag = { pointerId: event.pointerId, startY: event.clientY, startOffset, moved: false, history: [] };
    grip.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(dy) < DRAG_START_PX) return;
    drag.moved = true;
    const raw = drag.startOffset + dy;
    const offset = raw < 0 ? rubberband(raw, panel.offsetHeight) : raw;
    panel.style.transform = `translateY(${offset}px)`;
    drag.history.push({ y: event.clientY, t: event.timeStamp });
    scrim.style.opacity = String(Math.max(0, 1 - Math.max(0, offset) / panel.offsetHeight));
  }

  function settleBack() {
    const from = currentTranslateY(panel);
    panel.style.transform = "";
    panel.animate([{ transform: `translateY(${from}px)` }, { transform: "translateY(0)" }], {
      duration: OPEN_MS, easing: EASE_DRAWER, fill: "both",
    });
    scrim.animate([{ opacity: scrim.style.opacity || 1 }, { opacity: 1 }], { duration: FADE_MS, fill: "both" });
    scrim.style.opacity = "";
  }

  function onPointerUp(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const wasDrag = drag.moved;
    const velocity = drag.history.length ? velocityFrom(drag.history) : 0;
    const offset = currentTranslateY(panel);
    drag = null;
    if (!wasDrag) return;
    const shouldDismiss = velocity > DISMISS_VELOCITY_PX_PER_MS || offset > panel.offsetHeight * DISMISS_FRACTION;
    scrim.style.opacity = "";
    if (shouldDismiss) hide();
    else settleBack();
  }

  function onKeyDown(event) {
    if (event.key === "Escape" && open) hide();
  }

  grip.addEventListener("pointerdown", onPointerDown);
  grip.addEventListener("pointermove", onPointerMove);
  grip.addEventListener("pointerup", onPointerUp);
  grip.addEventListener("pointercancel", onPointerUp);
  scrim.addEventListener("click", hide);
  root.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", hide));
  document.addEventListener("keydown", onKeyDown);

  return { open: show, close: hide, isOpen: () => open };
}
