# Handoff — current state

_Last updated: 2026-11-18 (v0.0.1)_

## Where things stand
- Project skeleton is done: TypeScript + esbuild build into one file (`play/GrandLine.html`),
  seeded RNG, save/load (browser storage + export/import JSON), on-screen error box,
  debug panel, unit tests, soak test, headless-Chrome smoke test. All passing.
- The only "gameplay" is a placeholder day counter in the home village.

## Waiting on
- Zohaib's big design detail dump → Claude turns it into `docs/DESIGN.md` → Zohaib
  approves → plan Milestone 1 in `docs/ROADMAP.md`.

## Known bugs
- None.

## Decisions so far
- Only playable as a pirate at first, starting in a normal village in one of the four Blues.
- World is One Piece-universe based, not a retelling of the story.
- Factions: pirates, Marines, World Government, Revolutionary Army.
- Many islands; the Grand Line; rival pirates/marines who get in your way.
- Minimal code-drawn graphics; no canon character art.
