# TUBE FALL

An addictive vertical tube platformer where a ball falls through obstacle-filled tubes, level by level, with a gem economy and progression system.

**Core philosophy:** SIMPLICITY — ORIGINALITY — ADDICTIVE — DIE & RETRY FAST — PROGRESS

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## How to Play

- **Tap left half** of screen (or press A / Left Arrow) = jump diagonally up-left
- **Tap right half** of screen (or press D / Right Arrow) = jump diagonally up-right
- **M key** = toggle mute
- Avoid all black obstacles — contact = instant death
- Collect yellow gems (diamond shapes) for currency
- Reach the green line at the bottom to complete the level

## Architecture

```
src/
  agents/
    config.js        — Shared constants (CONFIG, STATE)
    engine.js        — Game engine: loop, ball physics, camera, state machine
    levels.js        — All 20 level definitions with obstacle placements
    obstacles.js     — Obstacle manager: update + render for all 6 types
    physics.js       — Pure collision detection (circle vs rect/tri/circle)
    store.js         — State management + localStorage persistence
    audio.js         — Procedural audio via Web Audio API (zero files)
  components/
    Game.jsx         — Canvas game view with input handling
    Lobby.jsx        — Level select screen with stats
    Shop.jsx         — Upgrade shop (jump power, fall speed, skins)
    LevelTransition.jsx — 400ms color flash between levels
  hooks/
    useGameLoop.js   — RAF + setInterval game loop with fixed timestep
    useInput.js      — Touch + mouse + keyboard input
    usePersistence.js — localStorage load/save wrapper
  App.jsx            — Root component, view state machine
  main.jsx           — Entry point
```

## Features

- 20 hand-designed levels with progressive difficulty
- 6 obstacle types: spikes, blockers, elevators, ramps, wall gaps, pendulums
- Gem economy: earn gems by completing levels, spend in shop
- 3-tier jump power upgrade
- 3-tier fall speed upgrade
- 6 ball skins
- Procedural audio (7 sound effects, zero audio files)
- Auto-save to localStorage
- Mobile touch + desktop mouse/keyboard support
- 60fps target with fixed timestep physics

## Tech Stack

- React 18 + Vite
- HTML5 Canvas for rendering
- Web Audio API for sound
- localStorage for persistence
- Zero external game libraries
