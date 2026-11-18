import { GameState, SAVE_VERSION, validateState } from "./state";

const STORAGE_KEY = "grandline.save.v1";

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

/** Parses a save string, migrating old versions forward. Throws a readable error on bad data. */
export function deserialize(text: string): GameState {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Save file is not valid JSON.");
  }
  if (typeof raw !== "object" || raw === null || !("saveVersion" in raw)) {
    throw new Error("This doesn't look like a Grand Line save.");
  }
  const state = migrate(raw as { saveVersion: number });
  const problems = validateState(state);
  if (problems.length > 0) throw new Error("Save is damaged: " + problems.join("; "));
  return state;
}

function migrate(raw: { saveVersion: number }): GameState {
  if (raw.saveVersion > SAVE_VERSION) {
    throw new Error(`Save is from a newer version (v${raw.saveVersion}) of the game.`);
  }
  // Future: if (raw.saveVersion === 1) { ...upgrade to 2...; raw.saveVersion = 2; }
  return raw as GameState;
}

// Browser storage can be missing or blocked (e.g. some file:// setups) — never crash on it.
export function saveToBrowser(state: GameState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state));
    return true;
  } catch {
    return false;
  }
}

export function loadFromBrowser(): GameState | null {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    return text ? deserialize(text) : null;
  } catch {
    return null;
  }
}
