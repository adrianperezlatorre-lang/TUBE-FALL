/**
 * RACE GENERATOR — Seed-based procedural race map.
 * Like InfinityGenerator but deterministic (seeded RNG) and has a finish line.
 */

import { CONFIG } from './config.js';

const TL = CONFIG.TUBE_INNER_LEFT;
const TR = CONFIG.TUBE_INNER_RIGHT;
const TW = TR - TL;
const CX = (TL + TR) / 2;

/** Simple seeded PRNG (mulberry32) */
function createRNG(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RACE_HEIGHT = {
  easy: 4000,
  medium: 6000,
  hard: 8000,
};

const CHUNK_SPACING = {
  easy: 130,
  medium: 110,
  hard: 90,
};

const SPIKE_DEPTH = {
  easy: { min: 30, max: 50 },
  medium: { min: 45, max: 70 },
  hard: { min: 60, max: 90 },
};

/**
 * Generate a complete race map from a seed.
 * @param {number} seed
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {{ obstacles: Object[], gemPositions: Object[], height: number }}
 */
export function generateRaceMap(seed, difficulty = 'medium') {
  const rng = createRNG(seed);
  const rand = (min, max) => min + rng() * (max - min);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];

  const height = RACE_HEIGHT[difficulty] || 6000;
  const spacing = CHUNK_SPACING[difficulty] || 110;
  const spk = SPIKE_DEPTH[difficulty] || SPIKE_DEPTH.medium;
  const obstacles = [];
  const gemPositions = [];

  let y = 80;
  let lastSide = 'left';

  while (y < height - 200) {
    y += spacing;
    const roll = rng();
    const side = lastSide === 'left' ? 'right' : 'left';

    if (roll < 0.30) {
      // Zigzag spikes
      const depth = rand(spk.min, spk.max);
      obstacles.push({ type: 'spike', y, wall: side, depth });
      if (rng() < 0.4) {
        obstacles.push({
          type: 'spike', y,
          wall: side === 'left' ? 'right' : 'left',
          depth: depth * 0.4,
        });
      }
      lastSide = side;

    } else if (roll < 0.50) {
      // Platform + spike
      const platSide = side === 'left' ? TL + 5 : TR - 95;
      obstacles.push({ type: 'platform', y, width: 90, xPos: platSide });
      obstacles.push({
        type: 'spike', y,
        wall: side === 'left' ? 'right' : 'left',
        depth: rand(spk.min, spk.max * 0.8),
      });
      lastSide = side;

    } else if (roll < 0.65) {
      // Blocker
      obstacles.push({
        type: 'blocker', y,
        speed: 2 + rng(),
        gapSide: pick(['left', 'right', 'center']),
        width: 100 + Math.floor(rng() * 30),
      });

    } else if (roll < 0.78) {
      // Pendulum
      obstacles.push({
        type: 'pendulum', y,
        swingSpeed: 3 + rng(),
        phase: rng() * Math.PI * 2,
      });
      if (rng() < 0.5) {
        obstacles.push({
          type: 'spike', y: y + 60,
          wall: pick(['left', 'right']),
          depth: rand(spk.min, spk.max * 0.7),
        });
      }

    } else if (roll < 0.88) {
      // Vanish platform
      const vSide = side === 'left' ? TL + 5 : TR - 85;
      obstacles.push({ type: 'vanish', y, width: 80, xPos: vSide });
      obstacles.push({
        type: 'spike', y,
        wall: side === 'left' ? 'right' : 'left',
        depth: rand(spk.min, spk.max),
      });
      lastSide = side;

    } else {
      // Fan zone
      obstacles.push({ type: 'fan', y: y + 80, fanHeight: 120, gravityMult: 0.25 + rng() * 0.15 });
      obstacles.push({ type: 'spike', y: y + 20, wall: 'both', depth: rand(spk.min * 0.8, spk.max * 0.6) });
      y += 60;
    }

    // Gem chance
    if (rng() < 0.3) {
      const gemX = CX + (rng() - 0.5) * (TW * 0.5);
      gemPositions.push({ x: gemX, y: y - 40 });
    }
  }

  return { obstacles, gemPositions, height };
}

/** Generate a random seed */
export function randomSeed() {
  return Math.floor(Math.random() * 2147483647);
}
