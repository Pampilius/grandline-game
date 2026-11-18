// The entire game state lives in ONE plain object (GameState).
// Rules:
//  - It must be JSON-serializable (no functions, classes, Maps, Dates).
//  - Systems change it only through functions in src/systems/ or here.
//  - Bump SAVE_VERSION and add a migration in save.ts whenever its shape changes.

export const SAVE_VERSION = 1;

export interface PlayerState {
  name: string;
  berries: number;
  bounty: number;
}

export interface GameState {
  saveVersion: number;
  seed: number;
  rngState: number;
  day: number;
  player: PlayerState;
  log: string[];
}

export function newGame(playerName: string, seed: number): GameState {
  return {
    saveVersion: SAVE_VERSION,
    seed,
    rngState: seed >>> 0,
    day: 1,
    player: { name: playerName.trim() || "Nameless", berries: 100, bounty: 0 },
    log: [`Day 1: ${playerName.trim() || "Nameless"} dreams of the sea.`],
  };
}

/** Checks invariants. Returns a list of problems; empty list = healthy. Used by tests + debug panel. */
export function validateState(state: GameState): string[] {
  const problems: string[] = [];
  const isBadNumber = (n: number) => !Number.isFinite(n);
  if (!Number.isInteger(state.day) || state.day < 1) problems.push(`day is invalid: ${state.day}`);
  if (isBadNumber(state.player.berries) || state.player.berries < 0)
    problems.push(`berries invalid: ${state.player.berries}`);
  if (isBadNumber(state.player.bounty) || state.player.bounty < 0)
    problems.push(`bounty invalid: ${state.player.bounty}`);
  if (!state.player.name) problems.push("player has no name");
  return problems;
}
