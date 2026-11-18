// UI layer: reads state, draws HTML, wires buttons to actions. Holds no game rules.
import { endDay } from "../core/actions";
import { createRng, Rng } from "../core/rng";
import { deserialize, loadFromBrowser, saveToBrowser, serialize } from "../core/save";
import { GameState, newGame, validateState } from "../core/state";

declare const __GAME_VERSION__: string;

let state: GameState | null = null;
let rng: Rng | null = null;
let debugOpen = false;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

function root(): HTMLElement {
  const el = document.getElementById("app");
  if (!el) throw new Error("#app element missing");
  return el;
}

function startGame(s: GameState): void {
  state = s;
  rng = createRng(s.rngState);
  draw();
}

function persist(): void {
  if (state && rng) {
    state.rngState = rng.getState();
    saveToBrowser(state);
  }
}

export function boot(): void {
  const existing = loadFromBrowser();
  if (existing) startGame(existing);
  else drawTitle();
}

function drawTitle(): void {
  root().innerHTML = `
    <main class="title">
      <h1>Grand Line</h1>
      <p class="sub">A life at sea — v${esc(__GAME_VERSION__)}</p>
      <label>Your name <input id="name" maxlength="24" placeholder="Nameless"></label>
      <button id="start" class="primary">Set out</button>
      <button id="import">Import save</button>
    </main>`;
  byId("start").onclick = () => {
    const name = (byId("name") as HTMLInputElement).value;
    startGame(newGame(name, (Math.random() * 2 ** 32) >>> 0));
    persist();
  };
  byId("import").onclick = importSave;
}

function draw(): void {
  if (!state) return drawTitle();
  const s = state;
  const problems = validateState(s);
  root().innerHTML = `
    <header class="bar">
      <span><b>${esc(s.player.name)}</b></span>
      <span>Day ${s.day}</span>
      <span>฿ ${s.player.berries.toLocaleString()}</span>
      <span>Bounty ฿ ${s.player.bounty.toLocaleString()}</span>
      <span class="spacer"></span>
      <button id="export">Export save</button>
      <button id="debug">Debug</button>
    </header>
    <main class="layout">
      <section class="panel">
        <h2>Home village</h2>
        <p>The real game starts here soon. For now: a day counter, so we know the engine, saving and testing all work.</p>
        <button id="end-day" class="primary">End day</button>
      </section>
      <section class="panel log">
        <h2>Log</h2>
        <ul>${s.log.slice(-30).reverse().map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
      </section>
    </main>
    ${debugOpen ? debugPanel(problems) : ""}`;

  byId("end-day").onclick = () => {
    if (state && rng) endDay(state, rng);
    persist();
    draw();
  };
  byId("export").onclick = exportSave;
  byId("debug").onclick = () => {
    debugOpen = !debugOpen;
    draw();
  };
  if (debugOpen) wireDebug();
}

function debugPanel(problems: string[]): string {
  return `
    <aside class="panel debug">
      <h2>Debug</h2>
      <p>State check: ${problems.length === 0 ? "✅ healthy" : "❌ " + esc(problems.join("; "))}</p>
      <button id="dbg-money">+10,000 berries</button>
      <button id="dbg-skip">Skip 10 days</button>
      <button id="dbg-reset" class="danger">Delete save &amp; restart</button>
    </aside>`;
}

function wireDebug(): void {
  byId("dbg-money").onclick = () => {
    if (state) state.player.berries += 10_000;
    persist();
    draw();
  };
  byId("dbg-skip").onclick = () => {
    if (state && rng) for (let i = 0; i < 10; i++) endDay(state, rng);
    persist();
    draw();
  };
  byId("dbg-reset").onclick = () => {
    if (!window.confirm("Delete your save and restart?")) return;
    try {
      localStorage.clear();
    } catch {
      /* storage unavailable */
    }
    state = null;
    rng = null;
    debugOpen = false;
    drawTitle();
  };
}

function exportSave(): void {
  if (!state) return;
  persist();
  const blob = new Blob([serialize(state)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `grandline-day${state.day}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importSave(): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      startGame(deserialize(await file.text()));
      persist();
    } catch (e) {
      showError(e);
    }
  };
  input.click();
}

function byId(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`UI element #${id} missing`);
  return el;
}

export function showError(e: unknown): void {
  const msg = e instanceof Error ? `${e.message}\n\n${e.stack ?? ""}` : String(e);
  console.error(e);
  const box = document.createElement("pre");
  box.className = "error-box";
  box.textContent = "Something went wrong — screenshot this for Claude:\n\n" + msg;
  box.onclick = () => box.remove();
  document.body.appendChild(box);
}
