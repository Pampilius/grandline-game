# Instructions for Claude (read every session)

This is Zohaib's (GitHub: Pampilius) game: a UI-driven, minimal-graphics pirate-life
management/adventure game set in a One Piece-inspired world, in the spirit of Free Cities
and Fort of Chains. Player starts as a nobody in a village in one of the four Blues.

## Start of every session
1. Read `docs/HANDOFF.md` (current state, known bugs, next step) — always.
2. Read `docs/DESIGN.md` sections relevant to the task. It is the source of truth for
   design decisions; Zohaib approves changes to it.
3. Check `docs/ROADMAP.md` for which milestone we're on.

## How we work
- Design before code. If a request conflicts with or isn't covered by DESIGN.md, ask or
  propose the DESIGN.md change first.
- Small milestones. One system/feature per change. Never rewrite working systems wholesale.
- Bugs: Zohaib reports what he did / what happened / expected / screenshot / console errors.
  Reproduce with a test first when possible, then fix.
- On long multi-step tasks, keep working until the response limit rather than stopping
  early to summarise.

## Code rules
- TypeScript, strict. `src/core` and `src/systems` = game rules, no DOM.
  `src/ui` = rendering only, no game rules. `src/data` = content (islands, NPCs, events)
  as typed data — content additions should not need logic changes.
- All state in one JSON-serializable `GameState`. Changing its shape → bump
  `SAVE_VERSION` and add a migration in `src/core/save.ts`. Never break old saves silently.
- All randomness through `Rng` (seeded). Never `Math.random()` in game logic.
- Every new system gets tests, and must be covered by the soak test (many seeds × many
  days, `validateState` must stay clean). Extend `validateState` with new invariants.
- Add debug-panel shortcuts for new systems (jump to island, spawn event, etc.).
- No canon One Piece character art. Graphics = code-drawn UI, maps, icons.

## Before every commit/delivery — all must pass
`npm run check`  (typecheck → unit tests + soak → build → headless-Chrome smoke test)
Then update `CHANGELOG.md`, `docs/HANDOFF.md`, ROADMAP checkboxes, and bump `version`
in package.json. Commit the built `play/GrandLine.html` (that's what Zohaib plays).
Tell Zohaib what was tested.

## Environment notes
- Chrome at /usr/bin/google-chrome; Python Playwright drives it in `scripts/smoke.py`.
- `npm install` after a fresh clone.
