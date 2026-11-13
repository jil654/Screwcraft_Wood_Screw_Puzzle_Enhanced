# Screwcraft — Wood Screw Puzzle

A responsive React + Vite wood screw sorting and board-clearing puzzle.

## Run locally
1. Install Node.js 18 or newer.
2. Extract this ZIP.
3. In the project folder run `npm install`.
4. Run `npm run dev` and open the local URL printed by Vite.
5. Create a production build with `npm run build`.

## Gameplay
- Tap a screw once to select it.
- Tap an empty hole to move the selected screw.
- Tap the selected screw a second time to collect it in its matching colour tray.
- A wooden plank falls away once none of its assigned holes contain screws.
- Collect all screws before the countdown expires to complete the level and unlock the next one.
- Restart, pause, sound toggle, level map and how-to-play screens are included.

## Included
- 12 progressively larger levels, responsive board and level map.
- Detailed metallic screw heads, recessed holes, layered timber styling.
- Animated selection, screw relocation, plank drops, progress and completion overlays.
- Persistent coin balance, completed levels and unlock progression using browser local storage.
- Animated screw relocation and collection feedback, including reduced-motion support.

## Notes
Progress is saved in this browser using local storage. It is not synchronized across devices; add a backend and player accounts for cross-device saves.
