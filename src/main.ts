import { boot, showError } from "./ui/render";

// Any uncaught error shows an on-screen box the player can screenshot.
window.addEventListener("error", (e) => showError(e.error ?? e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason));

try {
  boot();
} catch (e) {
  showError(e);
}
