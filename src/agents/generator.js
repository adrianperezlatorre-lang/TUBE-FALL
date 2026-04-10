/**
 * PROCEDURAL LEVEL GENERATOR — Infinity Mode
 * Generates obstacle chunks on-the-fly based on difficulty.
 * Each chunk is ~400px tall with obstacles that force navigation.
 */

import { CONFIG } from './config.js';

const TL = CONFIG.TUBE_INNER_LEFT;
const TR = CONFIG.TUBE_INNER_RIGHT;
const TW = TR - TL;
const CX = (TL + TR) / 2;

/** Difficulty presets */
const DIFFICULTY = {
  easy: {
    spikeDepthMin: 30, spikeDepthMax: 50,
    spikeChance: 0.5, platformChance: 0.4, blockerChance: 0.2,
    pendulumChance: 0.1, vanishChance: 0.05, fanChance: 0.08,
    blockerSpeed: 1.5, pendulumSpeed: 2.5,
    chunkSpacing: 130, // vertical space between obstacles
    gemChance: 0.4,
    label: 'EASY',
  },
  medium: {
    spikeDepthMin: 45, spikeDepthMax: 70,
    spikeChance: 0.6, platformChance: 0.35, blockerChance: 0.3,
    pendulumChance: 0.2, vanishChance: 0.15, fanChance: 0.1,
    blockerSpeed: 2.5, pendulumSpeed: 3.5,
    chunkSpacing: 110,
    gemChance: 0.3,
    label: 'MEDIUM',
  },
  hard: {
    spikeDepthMin: 60, spikeDepthMax: 90,
    spikeChance: 0.75, platformChance: 0.3, blockerChance: 0.35,
    pendulumChance: 0.3, vanishChance: 0.25, fanChance: 0.12,
    blockerSpeed: 3.5, pendulumSpeed: 4.5,
    chunkSpacing: 90,
    gemChance: 0.25,
    label: 'HARD',
  },
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * InfinityGenerator — generates obstacles chunk by chunk.
 */
export class InfinityGenerator {
  /**
   * @param {'easy'|'medium'|'hard'} difficulty
   */
  constructor(difficulty) {
    this.diff = DIFFICULTY[difficulty] || DIFFICULTY.medium;
    this.difficulty = difficulty;
    this.obstacles = [];
    this.gemPositions = [];
    this.generatedUpTo = 0; // Y position generated so far
    this.lastSide = 'left'; // alternate sides for zigzag
    this.chunkIndex = 0;
  }

  /**
   * Ensure obstacles are generated up to at least targetY.
   * Call this each frame with ball.y + buffer.
   * @param {number} targetY
   */
  generateUpTo(targetY) {
    while (this.generatedUpTo < targetY) {
      this.generateChunk();
    }
  }

  /**
   * Generate one chunk of obstacles (~400px).
   */
  generateChunk() {
    const d = this.diff;
    const startY = this.generatedUpTo + 80; // small gap from last chunk
    let y = startY;
    const chunkObstacles = [];

    // Each chunk has 3-5 obstacle groups
    const groupCount = 3 + Math.floor(Math.random() * 3);

    for (let g = 0; g < groupCount; g++) {
      y += d.chunkSpacing;
      const roll = Math.random();
      const side = this.lastSide === 'left' ? 'right' : 'left';

      if (roll < 0.30) {
        // Zigzag spikes — force side navigation
        const depth = rand(d.spikeDepthMin, d.spikeDepthMax);
        chunkObstacles.push({ type: 'spike', y, wall: side, depth });
        // Smaller spike on opposite side to narrow the path
        if (Math.random() < d.spikeChance * 0.5) {
          chunkObstacles.push({
            type: 'spike', y,
            wall: side === 'left' ? 'right' : 'left',
            depth: depth * 0.4,
          });
        }
        this.lastSide = side;

      } else if (roll < 0.50) {
        // Platform (rideable) — on one side, spikes on the other
        const platSide = side === 'left' ? TL + 5 : TR - 95;
        chunkObstacles.push({ type: 'platform', y, width: 90, xPos: platSide });
        const spikeWall = side === 'left' ? 'right' : 'left';
        chunkObstacles.push({
          type: 'spike', y,
          wall: spikeWall,
          depth: rand(d.spikeDepthMin, d.spikeDepthMax * 0.8),
        });
        this.lastSide = side;

      } else if (roll < 0.65) {
        // Blocker (moving bar)
        const gapSide = pick(['left', 'right', 'center']);
        chunkObstacles.push({
          type: 'blocker', y,
          speed: d.blockerSpeed + Math.random() * 0.5,
          gapSide,
          width: 100 + Math.floor(Math.random() * 30),
        });

      } else if (roll < 0.78) {
        // Pendulum
        chunkObstacles.push({
          type: 'pendulum', y,
          swingSpeed: d.pendulumSpeed + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
        });
        // Add spike below to make it harder
        if (Math.random() < 0.5) {
          chunkObstacles.push({
            type: 'spike', y: y + 60,
            wall: pick(['left', 'right']),
            depth: rand(d.spikeDepthMin, d.spikeDepthMax * 0.7),
          });
        }

      } else if (roll < 0.88) {
        // Vanish platform — must jump off quickly
        const vSide = side === 'left' ? TL + 5 : TR - 85;
        chunkObstacles.push({ type: 'vanish', y, width: 80, xPos: vSide });
        chunkObstacles.push({
          type: 'spike', y,
          wall: side === 'left' ? 'right' : 'left',
          depth: rand(d.spikeDepthMin, d.spikeDepthMax),
        });
        this.lastSide = side;

      } else {
        // Low gravity zone + spikes
        chunkObstacles.push({
          type: 'fan', y: y + 80,
          fanHeight: 120,
          gravityMult: 0.25 + Math.random() * 0.15,
        });
        chunkObstacles.push({
          type: 'spike', y: y + 20,
          wall: 'both',
          depth: rand(d.spikeDepthMin * 0.8, d.spikeDepthMax * 0.6),
        });
        y += 60; // extra space for the zone
      }

      // Gem chance
      if (Math.random() < d.gemChance) {
        const gemX = CX + (Math.random() - 0.5) * (TW * 0.5);
        this.gemPositions.push({ x: gemX, y: y - 40 });
      }
    }

    this.obstacles.push(...chunkObstacles);
    this.generatedUpTo = y + 60;
    this.chunkIndex++;
  }

  /**
   * Get all generated obstacles (for ObstacleManager).
   * @returns {Object[]}
   */
  getObstacles() {
    return this.obstacles;
  }

  /**
   * Get all generated gem positions.
   * @returns {{x: number, y: number}[]}
   */
  getGemPositions() {
    return this.gemPositions;
  }

  /**
   * Get the current generated depth.
   * @returns {number}
   */
  getDepth() {
    return this.generatedUpTo;
  }
}

export { DIFFICULTY };
