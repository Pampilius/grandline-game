// Game actions: pure-ish functions that take state (+ rng) and change it.
// UI code calls these; tests call these directly. No DOM in here, ever.
import { Rng } from "./rng";
import { GameState } from "./state";

const MAX_LOG = 200;

export function addLog(state: GameState, line: string): void {
  state.log.push(`Day ${state.day}: ${line}`);
  if (state.log.length > MAX_LOG) state.log.splice(0, state.log.length - MAX_LOG);
}

/** Placeholder day-advance so the skeleton has something to test. Will be replaced by real systems. */
export function endDay(state: GameState, rng: Rng): void {
  state.day += 1;
  const found = rng.int(0, 20);
  state.player.berries += found;
  addLog(state, found > 0 ? `You scrounged ${found} berries around the village.` : "A quiet day.");
}
