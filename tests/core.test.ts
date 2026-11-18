import { describe, expect, it } from "vitest";
import { endDay } from "../src/core/actions";
import { createRng } from "../src/core/rng";
import { deserialize, serialize } from "../src/core/save";
import { newGame, validateState } from "../src/core/state";

describe("rng", () => {
  it("is deterministic for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });
  it("int stays in range", () => {
    const r = createRng(1);
    for (let i = 0; i < 5000; i++) {
      const n = r.int(3, 7);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(7);
    }
  });
});

describe("save", () => {
  it("round-trips a game", () => {
    const g = newGame("Zoro", 7);
    expect(deserialize(serialize(g))).toEqual(g);
  });
  it("rejects garbage with a readable error", () => {
    expect(() => deserialize("not json")).toThrow(/not valid JSON/);
    expect(() => deserialize("{}")).toThrow(/doesn't look like/);
  });
});

describe("simulation soak test", () => {
  it("survives 5,000 days across many seeds with a healthy state", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const g = newGame("Tester", seed);
      const rng = createRng(seed);
      for (let d = 0; d < 250; d++) {
        endDay(g, rng);
        const problems = validateState(g);
        if (problems.length) throw new Error(`seed ${seed}, day ${g.day}: ${problems.join("; ")}`);
      }
      expect(g.log.length).toBeLessThanOrEqual(200);
    }
  });
});
