// Seeded random number generator (mulberry32).
// Every random roll in the game goes through this, never Math.random(),
// so a save + seed reproduces the exact same outcome — vital for fixing bugs.

export interface Rng {
  /** float in [0, 1) */
  next(): number;
  /** integer in [min, max] inclusive */
  int(min: number, max: number): number;
  /** true with probability p (0..1) */
  chance(p: number): boolean;
  /** random element of a non-empty array */
  pick<T>(items: readonly T[]): T;
  /** current internal state, stored in the save so rolls continue correctly */
  getState(): number;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(min, max) {
      if (max < min) throw new Error(`rng.int: max (${max}) < min (${min})`);
      return min + Math.floor(next() * (max - min + 1));
    },
    chance(p) {
      return next() < p;
    },
    pick(items) {
      if (items.length === 0) throw new Error("rng.pick: empty array");
      return items[Math.floor(next() * items.length)] as (typeof items)[number];
    },
    getState() {
      return s;
    },
  };
}
