/**
 * AGENT 2 — LEVEL DATA
 * All 20 level definitions with obstacle placements and gem positions.
 * Tube interior width = 248px (280px total - 2×16px walls).
 * Tube left inner edge = 56px, right inner edge = 304px (centered in 360px canvas).
 */

/** @typedef {'spike'|'blocker'|'elevator'|'ramp'|'wallgap'|'pendulum'} ObstacleType */

/**
 * @typedef {Object} ObstacleConfig
 * @property {ObstacleType} type
 * @property {number} y - Y position from top of level
 * @property {string} [wall] - 'left'|'right'|'both' for spikes/ramps
 * @property {number} [speed] - movement speed in px/frame
 * @property {string} [gapSide] - 'left'|'right'|'center' for blockers/wallgaps
 * @property {number} [gapWidth] - gap width for wallgaps
 * @property {number} [width] - width for blockers
 * @property {number} [rangeMin] - min Y for elevator range
 * @property {number} [rangeMax] - max Y for elevator range
 * @property {number} [swingSpeed] - for pendulums
 * @property {boolean} [movingGap] - wallgap with oscillating gap position
 * @property {number} [phase] - phase offset (0 or Math.PI) for opposite-phase blockers
 * @property {number} [depth] - spike depth in px
 */

/**
 * @typedef {Object} Level
 * @property {number} id
 * @property {string} color - hex background color
 * @property {number} height - total pixel height
 * @property {number} gems - base gems on completion
 * @property {number} bonusGems - extra gems on first attempt
 * @property {ObstacleConfig[]} obstacles
 * @property {{x: number, y: number}[]} gemPositions
 */

import { CONFIG } from './config.js';
const TL = CONFIG.TUBE_INNER_LEFT;
const TR = CONFIG.TUBE_INNER_RIGHT;
const CX = (TL + TR) / 2;

/** @type {Level[]} */
export const LEVELS = [
  // --- LEVEL 1 ---
  {
    id: 1,
    color: '#FF6B9D',
    height: 1200,
    gems: 3,
    bonusGems: 2,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 35 },
      { type: 'platform', y: 300, width: 110 },
      { type: 'spike', y: 450, wall: 'right', depth: 35 },
      { type: 'spike', y: 550, wall: 'left', depth: 45 },
      { type: 'platform', y: 700, width: 110 },
      { type: 'spike', y: 850, wall: 'both', depth: 30 },
      { type: 'platform', y: 1000, width: 110 },
      { type: 'spike', y: 1100, wall: 'right', depth: 40 },
    ],
    gemPositions: [
      { x: CX, y: 150 },
      { x: CX + 30, y: 400 },
      { x: CX - 30, y: 780 },
    ],
  },

  // --- LEVEL 2 ---
  {
    id: 2,
    color: '#FF9F43',
    height: 1300,
    gems: 3,
    bonusGems: 2,
    obstacles: [
      { type: 'spike', y: 180, wall: 'right', depth: 40 },
      { type: 'blocker', y: 280, speed: 1.2, gapSide: 'right', width: 100 },
      { type: 'spike', y: 400, wall: 'left', depth: 45 },
      { type: 'blocker', y: 520, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 650, wall: 'both', depth: 35 },
      { type: 'blocker', y: 780, speed: 1.4, gapSide: 'left', width: 100 },
      { type: 'spike', y: 900, wall: 'right', depth: 50 },
      { type: 'platform', y: 1020, width: 110 },
      { type: 'spike', y: 1150, wall: 'left', depth: 40 },
    ],
    gemPositions: [
      { x: CX - 20, y: 150 },
      { x: CX + 20, y: 460 },
      { x: CX, y: 850 },
    ],
  },

  // --- LEVEL 3 — Introduces platforms (path navigation) ---
  {
    id: 3,
    color: '#FECA57',
    height: 1400,
    gems: 4,
    bonusGems: 2,
    obstacles: [
      { type: 'spike', y: 180, wall: 'right', depth: 45 },
      { type: 'platform', y: 280, width: 100, xPos: TL + 10 },
      { type: 'spike', y: 350, wall: 'left', depth: 40 },
      { type: 'blocker', y: 450, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'platform', y: 580, width: 90, xPos: TR - 100 },
      { type: 'spike', y: 650, wall: 'both', depth: 35 },
      { type: 'blocker', y: 780, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'ramp', y: 900, wall: 'right' },
      { type: 'spike', y: 980, wall: 'left', depth: 50 },
      { type: 'platform', y: 1080, width: 110, moveRange: 60, speed: 1.2 },
      { type: 'platform', y: 1200, width: 110 },
      { type: 'spike', y: 1300, wall: 'right', depth: 45 },
    ],
    gemPositions: [
      { x: CX - 40, y: 240 },
      { x: CX + 40, y: 540 },
      { x: CX, y: 850 },
      { x: CX, y: 1140 },
    ],
  },

  // --- LEVEL 4 — Introduces vanish platforms ---
  {
    id: 4,
    color: '#48DBFB',
    height: 1500,
    gems: 4,
    bonusGems: 2,
    obstacles: [
      { type: 'spike', y: 180, wall: 'left', depth: 40 },
      { type: 'vanish', y: 280, width: 90, xPos: TL + 20 },
      { type: 'spike', y: 360, wall: 'right', depth: 45 },
      { type: 'pendulum', y: 480, swingSpeed: 1.5 },
      { type: 'platform', y: 580, width: 100, xPos: TR - 110 },
      { type: 'platform', y: 700, width: 110 },
      { type: 'spike', y: 820, wall: 'both', depth: 35 },
      { type: 'vanish', y: 920, width: 85 },
      { type: 'spike', y: 1000, wall: 'left', depth: 50 },
      { type: 'blocker', y: 1120, speed: 1.8, gapSide: 'center', width: 100 },
      { type: 'platform', y: 1240, width: 100, moveRange: 80, speed: 1.0 },
      { type: 'spike', y: 1340, wall: 'both', depth: 40 },
      { type: 'spike', y: 1420, wall: 'right', depth: 45 },
    ],
    gemPositions: [
      { x: CX - 30, y: 240 },
      { x: CX + 30, y: 540 },
      { x: CX, y: 870 },
      { x: CX, y: 1180 },
    ],
  },

  // --- LEVEL 5 — Introduces fans + platform path ---
  {
    id: 5,
    color: '#1DD1A1',
    height: 1600,
    gems: 5,
    bonusGems: 3,
    obstacles: [
      { type: 'spike', y: 150, wall: 'right', depth: 40 },
      { type: 'platform', y: 250, width: 110, xPos: TL + 5 },
      { type: 'spike', y: 330, wall: 'left', depth: 45 },
      { type: 'fan', y: 500, fanHeight: 150, gravityMult: 0.25 },
      { type: 'spike', y: 500, wall: 'both', depth: 40 },
      { type: 'vanish', y: 600, width: 90, xPos: TR - 100 },
      { type: 'platform', y: 720, width: 110 },
      { type: 'spike', y: 840, wall: 'left', depth: 50 },
      { type: 'platform', y: 940, width: 100, moveRange: 70, speed: 1.2 },
      { type: 'blocker', y: 1060, speed: 2.0, gapSide: 'center', width: 110 },
      { type: 'spike', y: 1180, wall: 'right', depth: 45 },
      { type: 'platform', y: 1300, width: 110 },
      { type: 'spike', y: 1420, wall: 'both', depth: 40 },
      { type: 'spike', y: 1520, wall: 'right', depth: 50 },
    ],
    gemPositions: [
      { x: CX - 30, y: 120 },
      { x: CX, y: 460 },
      { x: CX + 30, y: 680 },
      { x: CX, y: 900 },
      { x: CX - 20, y: 1240 },
    ],
  },

  // --- LEVEL 6 — All new obstacles combined, path-heavy ---
  {
    id: 6,
    color: '#FF6B6B',
    height: 1700,
    gems: 5,
    bonusGems: 3,
    obstacles: [
      { type: 'spike', y: 180, wall: 'left', depth: 45 },
      { type: 'platform', y: 280, width: 90, xPos: TR - 100 },
      { type: 'blocker', y: 400, speed: 2.0, gapSide: 'right', width: 100, phase: 0 },
      { type: 'spike', y: 520, wall: 'right', depth: 50 },
      { type: 'vanish', y: 620, width: 85, xPos: TL + 15 },
      { type: 'fan', y: 750, fanHeight: 180, gravityMult: 0.2 },
      { type: 'pendulum', y: 800, swingSpeed: 2.2 },
      { type: 'spike', y: 900, wall: 'both', depth: 40 },
      { type: 'platform', y: 1000, width: 110 },
      { type: 'platform', y: 1100, width: 100, moveRange: 80, speed: 1.5 },
      { type: 'spike', y: 1200, wall: 'right', depth: 50 },
      { type: 'elevator', y: 1320, rangeMin: 1270, rangeMax: 1400, speed: 1.5 },
      { type: 'spike', y: 1450, wall: 'both', depth: 50 },
      { type: 'vanish', y: 1550, width: 90 },
      { type: 'spike', y: 1630, wall: 'left', depth: 45 },
    ],
    gemPositions: [
      { x: CX + 30, y: 150 },
      { x: CX - 30, y: 480 },
      { x: CX, y: 700 },
      { x: CX, y: 1060 },
      { x: CX, y: 1380 },
    ],
  },

  // --- LEVEL 7 ---
  {
    id: 7,
    color: '#A29BFE',
    height: 1800,
    gems: 5,
    bonusGems: 3,
    obstacles: [
      { type: 'ramp', y: 200, wall: 'right' },
      { type: 'ramp', y: 350, wall: 'left' },
      { type: 'blocker', y: 550, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 800, swingSpeed: 2.5 },
      { type: 'blocker', y: 830, speed: 2.0, gapSide: 'center', width: 90 },
      { type: 'elevator', y: 1050, rangeMin: 1000, rangeMax: 1150, speed: 1.8 },
      { type: 'spike', y: 1300, wall: 'left', depth: 50 },
      { type: 'platform', y: 1550, width: 110 },
    ],
    gemPositions: [
      { x: CX, y: 280 },
      { x: CX, y: 480 },
      { x: CX, y: 730 },
      { x: CX, y: 980 },
      { x: CX, y: 1430 },
    ],
  },

  // --- LEVEL 8 ---
  {
    id: 8,
    color: '#FD79A8',
    height: 1900,
    gems: 6,
    bonusGems: 3,
    obstacles: [
      { type: 'pendulum', y: 250, swingSpeed: 2.2 },
      { type: 'pendulum', y: 400, swingSpeed: 2.2, phase: Math.PI * 0.5 },
      { type: 'blocker', y: 600, speed: 2.2, gapSide: 'right', width: 100 },
      { type: 'spike', y: 680, wall: 'right', depth: 40 },
      { type: 'blocker', y: 850, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'ramp', y: 1100, wall: 'left' },
      { type: 'ramp', y: 1250, wall: 'right' },
      { type: 'elevator', y: 1350, rangeMin: 1300, rangeMax: 1450, speed: 1.5 },
      { type: 'spike', y: 1380, wall: 'left', depth: 35 },
      { type: 'platform', y: 1600, width: 110 },
    ],
    gemPositions: [
      { x: CX, y: 150 },
      { x: CX - 30, y: 380 },
      { x: CX + 30, y: 680 },
      { x: CX, y: 930 },
      { x: CX, y: 1180 },
      { x: CX, y: 1480 },
    ],
  },

  // --- LEVEL 9 ---
  {
    id: 9,
    color: '#6C5CE7',
    height: 2000,
    gems: 6,
    bonusGems: 3,
    obstacles: [
      { type: 'blocker', y: 200, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 500, swingSpeed: 2.5 },
      { type: 'spike', y: 520, wall: 'both', depth: 55 },
      { type: 'ramp', y: 750, wall: 'left' },
      { type: 'ramp', y: 850, wall: 'right' },
      { type: 'ramp', y: 950, wall: 'left' },
      { type: 'elevator', y: 1050, rangeMin: 1000, rangeMax: 1150, speed: 1.8 },
      { type: 'elevator', y: 1100, rangeMin: 1150, rangeMax: 1000, speed: 1.8 },
      { type: 'blocker', y: 1300, speed: 2.5, gapSide: 'center', width: 110 },
      { type: 'pendulum', y: 1350, swingSpeed: 2.5 },
      { type: 'platform', y: 1600, width: 110 },
      { type: 'spike', y: 1660, wall: 'left', depth: 35 },
    ],
    gemPositions: [
      { x: CX, y: 350 },
      { x: CX, y: 650 },
      { x: CX, y: 900 },
      { x: CX, y: 1150 },
      { x: CX, y: 1450 },
      { x: CX, y: 1750 },
    ],
  },

  // --- LEVEL 10 ---
  {
    id: 10,
    color: '#00CEC9',
    height: 2100,
    gems: 7,
    bonusGems: 4,
    obstacles: [
      { type: 'blocker', y: 200, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 450, swingSpeed: 2.8 },
      { type: 'ramp', y: 620, wall: 'left' },
      { type: 'ramp', y: 680, wall: 'right' },
      { type: 'elevator', y: 650, rangeMin: 600, rangeMax: 750, speed: 1.5 },
      { type: 'blocker', y: 900, speed: 2.5, gapSide: 'right', width: 100, phase: 0 },
      { type: 'blocker', y: 950, speed: 2.5, gapSide: 'left', width: 100, phase: Math.PI },
      { type: 'spike', y: 1150, wall: 'both', depth: 55 },
      { type: 'platform', y: 1210, width: 110 },
      { type: 'pendulum', y: 1400, swingSpeed: 2.8 },
      { type: 'pendulum', y: 1430, swingSpeed: 2.8, phase: Math.PI },
      { type: 'pendulum', y: 1460, swingSpeed: 2.8, phase: Math.PI * 0.5 },
      { type: 'ramp', y: 1650, wall: 'right' },
      { type: 'ramp', y: 1720, wall: 'left' },
      { type: 'ramp', y: 1790, wall: 'right' },
      { type: 'ramp', y: 1860, wall: 'left' },
      { type: 'platform', y: 1900, width: 110 },
    ],
    gemPositions: [
      { x: CX, y: 300 },
      { x: CX, y: 550 },
      { x: CX, y: 800 },
      { x: CX, y: 1050 },
      { x: CX, y: 1300 },
      { x: CX, y: 1550 },
      { x: CX, y: 1800 },
    ],
  },

  // --- LEVEL 11 ---
  {
    id: 11,
    color: '#FDCB6E',
    height: 2200,
    gems: 7,
    bonusGems: 4,
    obstacles: [
      { type: 'blocker', y: 200, speed: 2.2, gapSide: 'left', width: 110 },
      { type: 'pendulum', y: 400, swingSpeed: 2.8 },
      { type: 'spike', y: 420, wall: 'right', depth: 45 },
      { type: 'platform', y: 600, width: 110 },
      { type: 'ramp', y: 800, wall: 'left' },
      { type: 'ramp', y: 900, wall: 'right' },
      { type: 'elevator', y: 1050, rangeMin: 1000, rangeMax: 1150, speed: 2.0 },
      { type: 'blocker', y: 1250, speed: 2.5, gapSide: 'center', width: 110, phase: 0 },
      { type: 'blocker', y: 1380, speed: 2.5, gapSide: 'center', width: 110, phase: Math.PI },
      { type: 'pendulum', y: 1550, swingSpeed: 3.0 },
      { type: 'spike', y: 1750, wall: 'both', depth: 55 },
      { type: 'blocker', y: 1950, speed: 1.5, gapSide: 'center', width: 100 },
    ],
    gemPositions: [
      { x: CX, y: 300 },
      { x: CX, y: 520 },
      { x: CX, y: 740 },
      { x: CX, y: 960 },
      { x: CX, y: 1180 },
      { x: CX, y: 1450 },
      { x: CX, y: 1850 },
    ],
  },

  // --- LEVEL 12 ---
  {
    id: 12,
    color: '#E17055',
    height: 2300,
    gems: 7,
    bonusGems: 4,
    obstacles: [
      { type: 'blocker', y: 200, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 400, wall: 'left', depth: 50 },
      { type: 'spike', y: 430, wall: 'right', depth: 50 },
      { type: 'pendulum', y: 600, swingSpeed: 3.0 },
      { type: 'blocker', y: 800, speed: 2.5, gapSide: 'right', width: 110 },
      { type: 'ramp', y: 1000, wall: 'right' },
      { type: 'ramp', y: 1080, wall: 'left' },
      { type: 'ramp', y: 1160, wall: 'right' },
      { type: 'elevator', y: 1350, rangeMin: 1300, rangeMax: 1450, speed: 2.0 },
      { type: 'spike', y: 1380, wall: 'left', depth: 40 },
      { type: 'platform', y: 1600, width: 110 },
      { type: 'pendulum', y: 1800, swingSpeed: 3.0 },
      { type: 'blocker', y: 1830, speed: 2.5, gapSide: 'center', width: 100 },
      { type: 'blocker', y: 2050, speed: 1.5, gapSide: 'center', width: 100 },
    ],
    gemPositions: [
      { x: CX, y: 300 },
      { x: CX, y: 520 },
      { x: CX, y: 720 },
      { x: CX, y: 940 },
      { x: CX, y: 1200 },
      { x: CX, y: 1500 },
      { x: CX, y: 1900 },
    ],
  },

  // --- LEVEL 13 ---
  {
    id: 13,
    color: '#74B9FF',
    height: 2400,
    gems: 8,
    bonusGems: 4,
    obstacles: [
      { type: 'pendulum', y: 200, swingSpeed: 3.0 },
      { type: 'pendulum', y: 250, swingSpeed: 3.0, phase: Math.PI },
      { type: 'blocker', y: 450, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'blocker', y: 650, speed: 2.8, gapSide: 'left', width: 110, phase: 0 },
      { type: 'blocker', y: 780, speed: 2.8, gapSide: 'right', width: 110, phase: Math.PI },
      { type: 'spike', y: 950, wall: 'both', depth: 55 },
      { type: 'elevator', y: 1100, rangeMin: 1050, rangeMax: 1200, speed: 2.2 },
      { type: 'ramp', y: 1300, wall: 'left' },
      { type: 'spike', y: 1350, wall: 'right', depth: 45 },
      { type: 'platform', y: 1500, width: 110 },
      { type: 'pendulum', y: 1700, swingSpeed: 3.2 },
      { type: 'ramp', y: 1900, wall: 'right' },
      { type: 'ramp', y: 1970, wall: 'left' },
      { type: 'platform', y: 2150, width: 110 },
    ],
    gemPositions: [
      { x: CX, y: 130 },
      { x: CX, y: 350 },
      { x: CX, y: 560 },
      { x: CX, y: 800 },
      { x: CX, y: 1050 },
      { x: CX, y: 1400 },
      { x: CX, y: 1800 },
      { x: CX, y: 2050 },
    ],
  },

  // --- LEVEL 14 ---
  {
    id: 14,
    color: '#55EFC4',
    height: 2500,
    gems: 8,
    bonusGems: 4,
    obstacles: [
      { type: 'ramp', y: 180, wall: 'left' },
      { type: 'ramp', y: 280, wall: 'right' },
      { type: 'ramp', y: 380, wall: 'left' },
      { type: 'pendulum', y: 550, swingSpeed: 3.2 },
      { type: 'spike', y: 580, wall: 'both', depth: 50 },
      { type: 'blocker', y: 750, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'blocker', y: 950, speed: 2.8, gapSide: 'center', width: 110 },
      { type: 'elevator', y: 1100, rangeMin: 1050, rangeMax: 1200, speed: 2.2 },
      { type: 'elevator', y: 1150, rangeMin: 1200, rangeMax: 1050, speed: 2.2 },
      { type: 'blocker', y: 1350, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 1550, swingSpeed: 3.2 },
      { type: 'blocker', y: 1580, speed: 2.8, gapSide: 'left', width: 100 },
      { type: 'spike', y: 1800, wall: 'left', depth: 50 },
      { type: 'spike', y: 1850, wall: 'right', depth: 50 },
      { type: 'blocker', y: 2050, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 2250, swingSpeed: 3.5 },
    ],
    gemPositions: [
      { x: CX, y: 100 },
      { x: CX, y: 450 },
      { x: CX, y: 660 },
      { x: CX, y: 880 },
      { x: CX, y: 1150 },
      { x: CX, y: 1450 },
      { x: CX, y: 1700 },
      { x: CX, y: 2150 },
    ],
  },

  // --- LEVEL 15 ---
  {
    id: 15,
    color: '#FF7675',
    height: 2600,
    gems: 8,
    bonusGems: 5,
    obstacles: [
      { type: 'blocker', y: 200, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 400, swingSpeed: 3.3 },
      { type: 'spike', y: 430, wall: 'left', depth: 50 },
      { type: 'blocker', y: 600, speed: 3.0, gapSide: 'right', width: 110, phase: 0 },
      { type: 'blocker', y: 720, speed: 3.0, gapSide: 'left', width: 110, phase: Math.PI },
      { type: 'ramp', y: 900, wall: 'right' },
      { type: 'spike', y: 960, wall: 'left', depth: 45 },
      { type: 'elevator', y: 1100, rangeMin: 1050, rangeMax: 1200, speed: 2.5 },
      { type: 'platform', y: 1300, width: 110 },
      { type: 'pendulum', y: 1500, swingSpeed: 3.5 },
      { type: 'pendulum', y: 1540, swingSpeed: 3.5, phase: Math.PI },
      { type: 'ramp', y: 1700, wall: 'left' },
      { type: 'ramp', y: 1780, wall: 'right' },
      { type: 'blocker', y: 1950, speed: 3.0, gapSide: 'center', width: 120 },
      { type: 'spike', y: 2150, wall: 'both', depth: 60 },
      { type: 'blocker', y: 2350, speed: 1.5, gapSide: 'center', width: 100 },
    ],
    gemPositions: [
      { x: CX, y: 100 },
      { x: CX, y: 320 },
      { x: CX, y: 530 },
      { x: CX, y: 810 },
      { x: CX, y: 1200 },
      { x: CX, y: 1450 },
      { x: CX, y: 1850 },
      { x: CX, y: 2250 },
    ],
  },

  // --- LEVEL 16 ---
  {
    id: 16,
    color: '#B2BEFF',
    height: 2700,
    gems: 9,
    bonusGems: 5,
    obstacles: [
      { type: 'blocker', y: 200, speed: 3.0, gapSide: 'center', width: 120 },
      { type: 'pendulum', y: 380, swingSpeed: 3.5 },
      { type: 'blocker', y: 550, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'ramp', y: 750, wall: 'left' },
      { type: 'ramp', y: 830, wall: 'right' },
      { type: 'spike', y: 870, wall: 'both', depth: 50 },
      { type: 'elevator', y: 1050, rangeMin: 1000, rangeMax: 1150, speed: 2.5 },
      { type: 'spike', y: 1080, wall: 'right', depth: 40 },
      { type: 'blocker', y: 1250, speed: 3.0, gapSide: 'left', width: 110, phase: 0 },
      { type: 'blocker', y: 1370, speed: 3.0, gapSide: 'right', width: 110, phase: Math.PI },
      { type: 'pendulum', y: 1550, swingSpeed: 3.5 },
      { type: 'pendulum', y: 1590, swingSpeed: 3.5, phase: Math.PI },
      { type: 'platform', y: 1800, width: 110 },
      { type: 'ramp', y: 2000, wall: 'right' },
      { type: 'ramp', y: 2070, wall: 'left' },
      { type: 'ramp', y: 2140, wall: 'right' },
      { type: 'blocker', y: 2350, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 2500, swingSpeed: 3.8 },
    ],
    gemPositions: [
      { x: CX, y: 100 },
      { x: CX, y: 300 },
      { x: CX, y: 480 },
      { x: CX, y: 700 },
      { x: CX, y: 960 },
      { x: CX, y: 1200 },
      { x: CX, y: 1500 },
      { x: CX, y: 1900 },
      { x: CX, y: 2250 },
    ],
  },

  // --- LEVEL 17 ---
  {
    id: 17,
    color: '#FAB1A0',
    height: 2800,
    gems: 9,
    bonusGems: 5,
    obstacles: [
      { type: 'pendulum', y: 200, swingSpeed: 3.5 },
      { type: 'pendulum', y: 240, swingSpeed: 3.5, phase: Math.PI },
      { type: 'spike', y: 400, wall: 'both', depth: 55 },
      { type: 'blocker', y: 460, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'blocker', y: 650, speed: 3.2, gapSide: 'right', width: 120 },
      { type: 'ramp', y: 850, wall: 'left' },
      { type: 'ramp', y: 920, wall: 'right' },
      { type: 'ramp', y: 990, wall: 'left' },
      { type: 'elevator', y: 1150, rangeMin: 1100, rangeMax: 1250, speed: 2.5 },
      { type: 'pendulum', y: 1350, swingSpeed: 3.8 },
      { type: 'pendulum', y: 1380, swingSpeed: 3.8, phase: Math.PI },
      { type: 'platform', y: 1550, width: 110 },
      { type: 'spike', y: 1750, wall: 'left', depth: 50 },
      { type: 'blocker', y: 1780, speed: 3.2, gapSide: 'center', width: 110 },
      { type: 'elevator', y: 1950, rangeMin: 1900, rangeMax: 2050, speed: 2.5 },
      { type: 'spike', y: 1980, wall: 'right', depth: 45 },
      { type: 'platform', y: 2200, width: 110 },
      { type: 'pendulum', y: 2400, swingSpeed: 3.8 },
      { type: 'blocker', y: 2430, speed: 3.2, gapSide: 'left', width: 110 },
      { type: 'blocker', y: 2600, speed: 1.5, gapSide: 'center', width: 100 },
    ],
    gemPositions: [
      { x: CX, y: 100 },
      { x: CX, y: 320 },
      { x: CX, y: 550 },
      { x: CX, y: 770 },
      { x: CX, y: 1060 },
      { x: CX, y: 1280 },
      { x: CX, y: 1650 },
      { x: CX, y: 2050 },
      { x: CX, y: 2500 },
    ],
  },

  // --- LEVEL 18 ---
  {
    id: 18,
    color: '#81ECEC',
    height: 2900,
    gems: 10,
    bonusGems: 5,
    obstacles: [
      { type: 'blocker', y: 200, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 400, swingSpeed: 3.8 },
      { type: 'spike', y: 430, wall: 'both', depth: 55 },
      { type: 'blocker', y: 600, speed: 3.3, gapSide: 'left', width: 120, phase: 0 },
      { type: 'blocker', y: 720, speed: 3.3, gapSide: 'right', width: 120, phase: Math.PI },
      { type: 'ramp', y: 900, wall: 'right' },
      { type: 'ramp', y: 970, wall: 'left' },
      { type: 'elevator', y: 1100, rangeMin: 1050, rangeMax: 1200, speed: 2.8 },
      { type: 'spike', y: 1130, wall: 'left', depth: 45 },
      { type: 'blocker', y: 1350, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 1550, swingSpeed: 4.0 },
      { type: 'pendulum', y: 1580, swingSpeed: 4.0, phase: Math.PI },
      { type: 'blocker', y: 1750, speed: 3.3, gapSide: 'center', width: 120 },
      { type: 'ramp', y: 1950, wall: 'left' },
      { type: 'ramp', y: 2020, wall: 'right' },
      { type: 'ramp', y: 2090, wall: 'left' },
      { type: 'spike', y: 2250, wall: 'both', depth: 60 },
      { type: 'blocker', y: 2310, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'elevator', y: 2500, rangeMin: 2450, rangeMax: 2600, speed: 2.8 },
      { type: 'pendulum', y: 2700, swingSpeed: 4.0 },
    ],
    gemPositions: [
      { x: CX, y: 100 },
      { x: CX, y: 300 },
      { x: CX, y: 520 },
      { x: CX, y: 750 },
      { x: CX, y: 1000 },
      { x: CX, y: 1250 },
      { x: CX, y: 1500 },
      { x: CX, y: 1850 },
      { x: CX, y: 2150 },
      { x: CX, y: 2600 },
    ],
  },

  // --- LEVEL 19 ---
  {
    id: 19,
    color: '#DFE6E9',
    height: 3000,
    gems: 10,
    bonusGems: 5,
    obstacles: [
      { type: 'pendulum', y: 200, swingSpeed: 4.0 },
      { type: 'pendulum', y: 230, swingSpeed: 4.0, phase: Math.PI },
      { type: 'pendulum', y: 260, swingSpeed: 4.0, phase: Math.PI * 0.5 },
      { type: 'blocker', y: 450, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'blocker', y: 650, speed: 3.5, gapSide: 'right', width: 120, phase: 0 },
      { type: 'blocker', y: 770, speed: 3.5, gapSide: 'left', width: 120, phase: Math.PI },
      { type: 'spike', y: 950, wall: 'both', depth: 60 },
      { type: 'ramp', y: 1000, wall: 'left' },
      { type: 'elevator', y: 1150, rangeMin: 1100, rangeMax: 1250, speed: 3.0 },
      { type: 'spike', y: 1180, wall: 'right', depth: 45 },
      { type: 'blocker', y: 1400, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 1600, swingSpeed: 4.2 },
      { type: 'blocker', y: 1630, speed: 3.5, gapSide: 'center', width: 120 },
      { type: 'ramp', y: 1800, wall: 'right' },
      { type: 'ramp', y: 1870, wall: 'left' },
      { type: 'ramp', y: 1940, wall: 'right' },
      { type: 'ramp', y: 2010, wall: 'left' },
      { type: 'platform', y: 2200, width: 110 },
      { type: 'elevator', y: 2400, rangeMin: 2350, rangeMax: 2500, speed: 3.0 },
      { type: 'spike', y: 2420, wall: 'both', depth: 55 },
      { type: 'pendulum', y: 2600, swingSpeed: 4.2 },
      { type: 'pendulum', y: 2630, swingSpeed: 4.2, phase: Math.PI },
      { type: 'platform', y: 2800, width: 110 },
    ],
    gemPositions: [
      { x: CX, y: 100 },
      { x: CX, y: 350 },
      { x: CX, y: 570 },
      { x: CX, y: 830 },
      { x: CX, y: 1080 },
      { x: CX, y: 1300 },
      { x: CX, y: 1700 },
      { x: CX, y: 2100 },
      { x: CX, y: 2500 },
      { x: CX, y: 2700 },
    ],
  },

  // --- LEVEL 20 ---
  {
    id: 20,
    color: '#2D3436',
    height: 3100,
    gems: 12,
    bonusGems: 6,
    obstacles: [
      { type: 'blocker', y: 180, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 350, swingSpeed: 4.5 },
      { type: 'pendulum', y: 380, swingSpeed: 4.5, phase: Math.PI },
      { type: 'pendulum', y: 410, swingSpeed: 4.5, phase: Math.PI * 0.5 },
      { type: 'spike', y: 580, wall: 'both', depth: 65 },
      { type: 'blocker', y: 650, speed: 3.8, gapSide: 'right', width: 120, phase: 0 },
      { type: 'blocker', y: 760, speed: 3.8, gapSide: 'left', width: 120, phase: Math.PI },
      { type: 'platform', y: 920, width: 110 },
      { type: 'ramp', y: 1100, wall: 'left' },
      { type: 'ramp', y: 1160, wall: 'right' },
      { type: 'ramp', y: 1220, wall: 'left' },
      { type: 'elevator', y: 1350, rangeMin: 1300, rangeMax: 1450, speed: 3.0 },
      { type: 'spike', y: 1320, wall: 'right', depth: 50 },
      { type: 'spike', y: 1380, wall: 'left', depth: 50 },
      { type: 'pendulum', y: 1550, swingSpeed: 4.5 },
      { type: 'pendulum', y: 1580, swingSpeed: 4.5, phase: Math.PI },
      { type: 'blocker', y: 1750, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'blocker', y: 1900, speed: 3.8, gapSide: 'center', width: 130, phase: 0 },
      { type: 'blocker', y: 2010, speed: 3.8, gapSide: 'center', width: 130, phase: Math.PI },
      { type: 'elevator', y: 2150, rangeMin: 2100, rangeMax: 2250, speed: 3.0 },
      { type: 'spike', y: 2180, wall: 'both', depth: 60 },
      { type: 'ramp', y: 2350, wall: 'right' },
      { type: 'ramp', y: 2420, wall: 'left' },
      { type: 'ramp', y: 2490, wall: 'right' },
      { type: 'ramp', y: 2560, wall: 'left' },
      { type: 'pendulum', y: 2700, swingSpeed: 4.8 },
      { type: 'pendulum', y: 2730, swingSpeed: 4.8, phase: Math.PI },
      { type: 'pendulum', y: 2760, swingSpeed: 4.8, phase: Math.PI * 0.5 },
      { type: 'blocker', y: 2900, speed: 1.5, gapSide: 'center', width: 100 },
    ],
    gemPositions: [
      { x: CX, y: 100 },
      { x: CX, y: 280 },
      { x: CX, y: 500 },
      { x: CX, y: 730 },
      { x: CX, y: 1000 },
      { x: CX, y: 1250 },
      { x: CX, y: 1480 },
      { x: CX, y: 1650 },
      { x: CX, y: 1850 },
      { x: CX, y: 2100 },
      { x: CX, y: 2450 },
      { x: CX, y: 2800 },
    ],
  },

  // --- LEVEL 21 — Introduces Fan: float through spike corridor ---
  {
    id: 21,
    color: '#FF6B9D',
    height: 1800,
    gems: 5,
    bonusGems: 3,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 40 },
      { type: 'spike', y: 320, wall: 'right', depth: 40 },
      // Fan zone y=400..750 — MUST use to navigate alternating spikes
      { type: 'fan', y: 750, fanHeight: 350, gravityMult: 0.25 },
      { type: 'spike', y: 450, wall: 'right', depth: 65 },
      { type: 'spike', y: 550, wall: 'left', depth: 65 },
      { type: 'spike', y: 650, wall: 'right', depth: 65 },
      // After fan zone
      { type: 'platform', y: 900, width: 110 },
      { type: 'spike', y: 1050, wall: 'both', depth: 35 },
      { type: 'blocker', y: 1200, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1400, wall: 'left', depth: 45 },
      { type: 'spike', y: 1550, wall: 'right', depth: 45 },
      { type: 'platform', y: 1700, width: 110 },
    ],
    gemPositions: [
      { x: TL + 40, y: 500 },
      { x: TR - 40, y: 600 },
      { x: TL + 40, y: 700 },
      { x: CX, y: 1100 },
      { x: CX + 30, y: 1450 },
    ],
  },

  // --- LEVEL 22 — Introduces Tube: teleport past spike wall ---
  {
    id: 22,
    color: '#FF9F43',
    height: 1800,
    gems: 5,
    bonusGems: 3,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 40 },
      { type: 'blocker', y: 350, speed: 1.5, gapSide: 'center', width: 100 },
      // Spike wall blocks path — MUST use tube to pass
      { type: 'spike', y: 550, wall: 'left', depth: 80 },
      { type: 'spike', y: 550, wall: 'right', depth: 80 },
      { type: 'tube', y: 480, entryX: CX, exitX: CX, exitY: 680 },
      // Continue after tube exit
      { type: 'spike', y: 800, wall: 'left', depth: 45 },
      { type: 'platform', y: 920, width: 100 },
      // Second tube bypass
      { type: 'spike', y: 1100, wall: 'left', depth: 85 },
      { type: 'spike', y: 1100, wall: 'right', depth: 85 },
      { type: 'tube', y: 1020, entryX: TR - 40, exitX: TL + 40, exitY: 1220 },
      { type: 'spike', y: 1350, wall: 'right', depth: 45 },
      { type: 'blocker', y: 1500, speed: 1.4, gapSide: 'center', width: 100 },
      { type: 'platform', y: 1650, width: 110 },
    ],
    gemPositions: [
      { x: CX, y: 150 },
      { x: CX, y: 630 },
      { x: TL + 40, y: 1170 },
      { x: CX, y: 1400 },
      { x: CX, y: 1550 },
    ],
  },

  // --- LEVEL 23 — Introduces Trampoline: bounce up to reach platform ---
  {
    id: 23,
    color: '#FECA57',
    height: 1900,
    gems: 5,
    bonusGems: 3,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 40 },
      { type: 'blocker', y: 350, speed: 1.5, gapSide: 'right', width: 100 },
      { type: 'spike', y: 500, wall: 'right', depth: 45 },
      // Trampoline bounces you UP to reach the right-side platform
      { type: 'trampoline', y: 750, width: 90, xPos: TL + 10 },
      { type: 'platform', y: 600, width: 90, xPos: TR - 100 },
      // From that platform, roll off right side to continue down
      { type: 'spike', y: 700, wall: 'left', depth: 70 },
      { type: 'platform', y: 900, width: 100 },
      { type: 'spike', y: 1050, wall: 'both', depth: 35 },
      // Second trampoline section
      { type: 'trampoline', y: 1300, width: 90, xPos: TR - 100 },
      { type: 'platform', y: 1100, width: 90, xPos: TL + 10 },
      { type: 'spike', y: 1200, wall: 'right', depth: 70 },
      { type: 'blocker', y: 1450, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1600, wall: 'left', depth: 45 },
      { type: 'platform', y: 1750, width: 110 },
    ],
    gemPositions: [
      { x: TR - 50, y: 560 },
      { x: CX, y: 850 },
      { x: TL + 50, y: 1060 },
      { x: CX, y: 1400 },
      { x: CX, y: 1650 },
    ],
  },

  // --- LEVEL 24 — Introduces Magnet: get pulled to safety ---
  {
    id: 24,
    color: '#48DBFB',
    height: 1900,
    gems: 5,
    bonusGems: 3,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 45 },
      { type: 'blocker', y: 350, speed: 1.5, gapSide: 'center', width: 100 },
      // Magnet on right pulls you toward the safe gap
      { type: 'spike', y: 550, wall: 'left', depth: 75 },
      { type: 'magnet', y: 520, xPos: TR - 30, radius: 100, strength: 0.18 },
      { type: 'spike', y: 700, wall: 'right', depth: 45 },
      { type: 'platform', y: 850, width: 100 },
      // Magnet on left pulls you through tight gap
      { type: 'spike', y: 1050, wall: 'right', depth: 75 },
      { type: 'magnet', y: 1020, xPos: TL + 30, radius: 100, strength: 0.18 },
      { type: 'spike', y: 1200, wall: 'left', depth: 45 },
      { type: 'blocker', y: 1350, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1500, wall: 'both', depth: 35 },
      { type: 'platform', y: 1650, width: 110 },
      { type: 'spike', y: 1800, wall: 'right', depth: 40 },
    ],
    gemPositions: [
      { x: TR - 40, y: 500 },
      { x: CX, y: 750 },
      { x: TL + 40, y: 980 },
      { x: CX, y: 1400 },
      { x: CX, y: 1700 },
    ],
  },

  // --- LEVEL 25 — Introduces Bounce: bounce pad sends you up ---
  {
    id: 25,
    color: '#1DD1A1',
    height: 1900,
    gems: 5,
    bonusGems: 3,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 40 },
      { type: 'spike', y: 350, wall: 'left', depth: 45 },
      { type: 'platform', y: 500, width: 100 },
      // Falling into spikes below — bounce pad saves you, sends you back up
      { type: 'spike', y: 750, wall: 'left', depth: 75 },
      { type: 'spike', y: 750, wall: 'right', depth: 75 },
      { type: 'bounce', y: 700, width: 80, factor: 1.5 },
      // Bounce sends you UP past the platform to the left path
      { type: 'platform', y: 550, width: 80, xPos: TL + 10 },
      { type: 'spike', y: 650, wall: 'right', depth: 70 },
      // Continue down from left platform
      { type: 'blocker', y: 850, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1000, wall: 'left', depth: 45 },
      // Another bounce section
      { type: 'bounce', y: 1200, width: 80, factor: 1.5 },
      { type: 'spike', y: 1250, wall: 'both', depth: 70 },
      { type: 'platform', y: 1050, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 1150, wall: 'left', depth: 70 },
      { type: 'platform', y: 1400, width: 100 },
      { type: 'spike', y: 1550, wall: 'right', depth: 45 },
      { type: 'platform', y: 1750, width: 110 },
    ],
    gemPositions: [
      { x: TL + 50, y: 510 },
      { x: CX, y: 750 },
      { x: TR - 50, y: 1010 },
      { x: CX, y: 1300 },
      { x: CX, y: 1600 },
    ],
  },


  // --- LEVEL 26 — Fan + Tube combo: float into tube entrance ---
  {
    id: 26,
    color: '#FF6B6B',
    height: 2000,
    gems: 6,
    bonusGems: 4,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 45 },
      { type: 'spike', y: 320, wall: 'right', depth: 45 },
      // Fan zone — float slowly to reach tube entry on left wall
      { type: 'fan', y: 700, fanHeight: 300, gravityMult: 0.25 },
      { type: 'spike', y: 480, wall: 'right', depth: 65 },
      { type: 'spike', y: 580, wall: 'left', depth: 50 },
      { type: 'tube', y: 650, entryX: TL + 20, exitX: TR - 30, exitY: 850 },
      { type: 'spike', y: 680, wall: 'right', depth: 65 },
      // After tube exit
      { type: 'platform', y: 1000, width: 100 },
      { type: 'spike', y: 1150, wall: 'both', depth: 40 },
      { type: 'blocker', y: 1300, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1450, wall: 'left', depth: 50 },
      { type: 'spike', y: 1600, wall: 'right', depth: 50 },
      { type: 'platform', y: 1800, width: 110 },
    ],
    gemPositions: [
      { x: TL + 40, y: 500 },
      { x: TL + 30, y: 620 },
      { x: TR - 40, y: 900 },
      { x: CX, y: 1200 },
      { x: CX, y: 1500 },
      { x: CX, y: 1750 },
    ],
  },

  // --- LEVEL 27 — Trampoline chain: bounce up multiple tiers ---
  {
    id: 27,
    color: '#A29BFE',
    height: 2100,
    gems: 6,
    bonusGems: 4,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 45 },
      { type: 'blocker', y: 350, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 500, wall: 'left', depth: 50 },
      // Must land on trampoline, bounce up to platform, roll right
      { type: 'trampoline', y: 800, width: 80, xPos: TL + 10 },
      { type: 'platform', y: 620, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 700, wall: 'left', depth: 75 },
      // From right platform fall to second trampoline
      { type: 'trampoline', y: 1050, width: 80, xPos: TR - 90 },
      { type: 'platform', y: 870, width: 80, xPos: TL + 10 },
      { type: 'spike', y: 950, wall: 'right', depth: 75 },
      // From left platform continue
      { type: 'platform', y: 1200, width: 100 },
      { type: 'spike', y: 1350, wall: 'both', depth: 35 },
      { type: 'blocker', y: 1500, speed: 1.8, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1650, wall: 'left', depth: 50 },
      { type: 'spike', y: 1800, wall: 'right', depth: 45 },
      { type: 'platform', y: 1950, width: 110 },
    ],
    gemPositions: [
      { x: TR - 50, y: 580 },
      { x: TL + 50, y: 830 },
      { x: CX, y: 1100 },
      { x: CX, y: 1400 },
      { x: CX, y: 1700 },
      { x: CX, y: 1900 },
    ],
  },

  // --- LEVEL 28 — Magnet + Spikes: magnet curves you through gaps ---
  {
    id: 28,
    color: '#FDCB6E',
    height: 2100,
    gems: 6,
    bonusGems: 4,
    obstacles: [
      { type: 'spike', y: 180, wall: 'left', depth: 45 },
      { type: 'pendulum', y: 300, swingSpeed: 2.0 },
      { type: 'spike', y: 450, wall: 'right', depth: 50 },
      // Spike corridor with magnets pulling you through safe path
      { type: 'spike', y: 650, wall: 'left', depth: 80 },
      { type: 'magnet', y: 630, xPos: TR - 30, radius: 120, strength: 0.2 },
      { type: 'spike', y: 800, wall: 'right', depth: 80 },
      { type: 'magnet', y: 780, xPos: TL + 30, radius: 120, strength: 0.2 },
      { type: 'spike', y: 950, wall: 'left', depth: 80 },
      { type: 'magnet', y: 930, xPos: TR - 30, radius: 120, strength: 0.2 },
      // After magnet gauntlet
      { type: 'platform', y: 1100, width: 100 },
      { type: 'blocker', y: 1250, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1400, wall: 'left', depth: 45 },
      { type: 'spike', y: 1550, wall: 'right', depth: 50 },
      { type: 'vanish', y: 1700, width: 90 },
      { type: 'spike', y: 1850, wall: 'both', depth: 35 },
      { type: 'platform', y: 1950, width: 110 },
    ],
    gemPositions: [
      { x: TR - 40, y: 610 },
      { x: TL + 40, y: 760 },
      { x: TR - 40, y: 910 },
      { x: CX, y: 1150 },
      { x: CX, y: 1450 },
      { x: CX, y: 1800 },
    ],
  },

  // --- LEVEL 29 — Bounce + Platform puzzle: redirect upward ---
  {
    id: 29,
    color: '#6C5CE7',
    height: 2200,
    gems: 6,
    bonusGems: 4,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 40 },
      { type: 'blocker', y: 350, speed: 1.8, gapSide: 'right', width: 100 },
      { type: 'spike', y: 500, wall: 'left', depth: 50 },
      // Path blocked below — bounce sends you up to vanish platform
      { type: 'bounce', y: 750, width: 90, factor: 1.6 },
      { type: 'spike', y: 800, wall: 'left', depth: 85 },
      { type: 'spike', y: 800, wall: 'right', depth: 85 },
      { type: 'vanish', y: 600, width: 85, xPos: CX - 42 },
      // From vanish, fall through gap on right
      { type: 'spike', y: 700, wall: 'left', depth: 70 },
      { type: 'platform', y: 950, width: 100 },
      { type: 'spike', y: 1100, wall: 'right', depth: 50 },
      // Second bounce redirect
      { type: 'bounce', y: 1350, width: 90, factor: 1.6 },
      { type: 'spike', y: 1400, wall: 'both', depth: 80 },
      { type: 'vanish', y: 1200, width: 85, xPos: CX - 42 },
      { type: 'spike', y: 1300, wall: 'left', depth: 70 },
      { type: 'platform', y: 1550, width: 100 },
      { type: 'blocker', y: 1700, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1850, wall: 'both', depth: 35 },
      { type: 'platform', y: 2050, width: 110 },
    ],
    gemPositions: [
      { x: CX, y: 580 },
      { x: TR - 40, y: 730 },
      { x: CX, y: 1000 },
      { x: CX, y: 1180 },
      { x: CX, y: 1600 },
      { x: CX, y: 1900 },
    ],
  },

  // --- LEVEL 30 — Fan corridor + trampoline exit ---
  {
    id: 30,
    color: '#E17055',
    height: 2300,
    gems: 7,
    bonusGems: 4,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 50 },
      { type: 'blocker', y: 350, speed: 2.0, gapSide: 'center', width: 100 },
      // Long fan corridor — zigzag through tight spikes
      { type: 'fan', y: 900, fanHeight: 350, gravityMult: 0.2 },
      { type: 'spike', y: 600, wall: 'right', depth: 70 },
      { type: 'spike', y: 700, wall: 'left', depth: 70 },
      { type: 'spike', y: 800, wall: 'right', depth: 70 },
      { type: 'spike', y: 880, wall: 'left', depth: 60 },
      // Exit fan zone, land on trampoline to reach high platform
      { type: 'trampoline', y: 1050, width: 90 },
      { type: 'platform', y: 850, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 950, wall: 'left', depth: 70 },
      // From platform continue
      { type: 'spike', y: 1150, wall: 'right', depth: 50 },
      { type: 'platform', y: 1300, width: 100 },
      { type: 'pendulum', y: 1450, swingSpeed: 2.5 },
      { type: 'spike', y: 1600, wall: 'both', depth: 40 },
      { type: 'spike', y: 1800, wall: 'left', depth: 50 },
      { type: 'vanish', y: 1950, width: 90 },
      { type: 'spike', y: 2100, wall: 'right', depth: 45 },
    ],
    gemPositions: [
      { x: TL + 40, y: 650 },
      { x: TR - 40, y: 750 },
      { x: TL + 40, y: 850 },
      { x: TR - 50, y: 820 },
      { x: CX, y: 1250 },
      { x: CX, y: 1500 },
      { x: CX, y: 1850 },
    ],
  },

  // --- LEVEL 31 — Tube chain: 3 tubes bypass spike walls ---
  {
    id: 31,
    color: '#00B894',
    height: 2400,
    gems: 7,
    bonusGems: 4,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 45 },
      { type: 'pendulum', y: 350, swingSpeed: 2.2 },
      // First spike wall — tube bypass
      { type: 'spike', y: 550, wall: 'left', depth: 90 },
      { type: 'spike', y: 550, wall: 'right', depth: 90 },
      { type: 'tube', y: 470, entryX: CX, exitX: TL + 30, exitY: 680 },
      // Second spike wall — tube bypass
      { type: 'spike', y: 850, wall: 'left', depth: 90 },
      { type: 'spike', y: 850, wall: 'right', depth: 90 },
      { type: 'tube', y: 770, entryX: TL + 30, exitX: TR - 30, exitY: 980 },
      // Third spike wall — tube bypass
      { type: 'spike', y: 1150, wall: 'left', depth: 90 },
      { type: 'spike', y: 1150, wall: 'right', depth: 90 },
      { type: 'tube', y: 1070, entryX: TR - 30, exitX: CX, exitY: 1280 },
      // After tubes, normal obstacles
      { type: 'platform', y: 1400, width: 100 },
      { type: 'blocker', y: 1550, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1700, wall: 'left', depth: 50 },
      { type: 'spike', y: 1850, wall: 'right', depth: 50 },
      { type: 'pendulum', y: 2000, swingSpeed: 2.5 },
      { type: 'spike', y: 2150, wall: 'both', depth: 35 },
    ],
    gemPositions: [
      { x: CX, y: 430 },
      { x: TL + 40, y: 730 },
      { x: TR - 40, y: 1030 },
      { x: CX, y: 1350 },
      { x: CX, y: 1600 },
      { x: CX, y: 1800 },
      { x: CX, y: 2050 },
    ],
  },

  // --- LEVEL 32 — Magnet spiral: pulled through curved path ---
  {
    id: 32,
    color: '#74B9FF',
    height: 2400,
    gems: 7,
    bonusGems: 4,
    obstacles: [
      { type: 'spike', y: 180, wall: 'left', depth: 45 },
      { type: 'blocker', y: 300, speed: 1.5, gapSide: 'center', width: 100 },
      // Magnet pulls right, spikes on left narrow the path
      { type: 'magnet', y: 500, xPos: TR - 20, radius: 130, strength: 0.2 },
      { type: 'spike', y: 480, wall: 'left', depth: 75 },
      { type: 'spike', y: 580, wall: 'left', depth: 75 },
      // Magnet pulls left
      { type: 'magnet', y: 750, xPos: TL + 20, radius: 130, strength: 0.2 },
      { type: 'spike', y: 730, wall: 'right', depth: 75 },
      { type: 'spike', y: 830, wall: 'right', depth: 75 },
      // Platform rest
      { type: 'platform', y: 980, width: 100 },
      // Magnet pulls toward tube entrance
      { type: 'magnet', y: 1150, xPos: TL + 30, radius: 100, strength: 0.2 },
      { type: 'spike', y: 1200, wall: 'right', depth: 70 },
      { type: 'tube', y: 1180, entryX: TL + 30, exitX: TR - 30, exitY: 1380 },
      { type: 'spike', y: 1250, wall: 'left', depth: 85 },
      { type: 'spike', y: 1250, wall: 'right', depth: 85 },
      // After tube
      { type: 'spike', y: 1500, wall: 'left', depth: 50 },
      { type: 'vanish', y: 1650, width: 90 },
      { type: 'spike', y: 1800, wall: 'right', depth: 50 },
      { type: 'blocker', y: 1950, speed: 1.5, gapSide: 'center', width: 100 },
      { type: 'platform', y: 2150, width: 110 },
      { type: 'spike', y: 2300, wall: 'both', depth: 35 },
    ],
    gemPositions: [
      { x: TR - 30, y: 460 },
      { x: TL + 30, y: 710 },
      { x: CX, y: 940 },
      { x: TL + 40, y: 1140 },
      { x: TR - 40, y: 1430 },
      { x: CX, y: 1700 },
      { x: CX, y: 2050 },
    ],
  },

  // --- LEVEL 33 — Fan + Magnet: low grav with magnetic guidance ---
  {
    id: 33,
    color: '#FD79A8',
    height: 2500,
    gems: 7,
    bonusGems: 4,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 50 },
      { type: 'blocker', y: 350, speed: 2.0, gapSide: 'left', width: 100 },
      // Fan zone with magnets guiding you through spike maze
      { type: 'fan', y: 900, fanHeight: 350, gravityMult: 0.2 },
      { type: 'spike', y: 600, wall: 'left', depth: 70 },
      { type: 'magnet', y: 620, xPos: TR - 20, radius: 80, strength: 0.12 },
      { type: 'spike', y: 720, wall: 'right', depth: 70 },
      { type: 'magnet', y: 740, xPos: TL + 20, radius: 80, strength: 0.12 },
      { type: 'spike', y: 840, wall: 'left', depth: 70 },
      { type: 'magnet', y: 860, xPos: TR - 20, radius: 80, strength: 0.12 },
      // After fan zone
      { type: 'platform', y: 1050, width: 100 },
      { type: 'spike', y: 1200, wall: 'both', depth: 40 },
      { type: 'pendulum', y: 1350, swingSpeed: 2.5 },
      { type: 'spike', y: 1500, wall: 'left', depth: 55 },
      { type: 'blocker', y: 1650, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1800, wall: 'right', depth: 55 },
      { type: 'vanish', y: 1950, width: 90 },
      { type: 'spike', y: 2100, wall: 'both', depth: 40 },
      { type: 'platform', y: 2300, width: 110 },
    ],
    gemPositions: [
      { x: TR - 30, y: 580 },
      { x: TL + 30, y: 700 },
      { x: TR - 30, y: 820 },
      { x: CX, y: 1100 },
      { x: CX, y: 1400 },
      { x: CX, y: 1700 },
      { x: CX, y: 2000 },
    ],
  },

  // --- LEVEL 34 — Trampoline + Tube: bounce into tube entrance ---
  {
    id: 34,
    color: '#55EFC4',
    height: 2500,
    gems: 7,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 50 },
      { type: 'spike', y: 350, wall: 'right', depth: 50 },
      { type: 'platform', y: 500, width: 100 },
      // Trampoline bounces you up to tube entrance high above
      { type: 'trampoline', y: 750, width: 90 },
      { type: 'tube', y: 580, entryX: CX, exitX: TL + 30, exitY: 950 },
      { type: 'spike', y: 700, wall: 'left', depth: 70 },
      { type: 'spike', y: 700, wall: 'right', depth: 70 },
      // After tube, navigate spikes
      { type: 'spike', y: 1050, wall: 'right', depth: 55 },
      { type: 'platform', y: 1200, width: 100 },
      // Second trampoline-tube combo
      { type: 'trampoline', y: 1450, width: 90 },
      { type: 'tube', y: 1280, entryX: CX, exitX: TR - 30, exitY: 1650 },
      { type: 'spike', y: 1400, wall: 'left', depth: 70 },
      { type: 'spike', y: 1400, wall: 'right', depth: 70 },
      // Final section
      { type: 'spike', y: 1750, wall: 'left', depth: 50 },
      { type: 'blocker', y: 1900, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2050, wall: 'right', depth: 50 },
      { type: 'vanish', y: 2200, width: 90 },
      { type: 'spike', y: 2350, wall: 'both', depth: 35 },
    ],
    gemPositions: [
      { x: CX, y: 560 },
      { x: TL + 40, y: 1000 },
      { x: CX, y: 1260 },
      { x: TR - 40, y: 1700 },
      { x: CX, y: 1850 },
      { x: CX, y: 2100 },
      { x: CX, y: 2300 },
    ],
  },

  // --- LEVEL 35 — Bounce + Fan: bounce up into low gravity zone ---
  {
    id: 35,
    color: '#0984E3',
    height: 2600,
    gems: 8,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 50 },
      { type: 'pendulum', y: 350, swingSpeed: 2.2 },
      { type: 'spike', y: 500, wall: 'left', depth: 55 },
      // Bounce sends you UP into a fan zone above
      { type: 'bounce', y: 750, width: 90, factor: 1.6 },
      { type: 'fan', y: 700, fanHeight: 300, gravityMult: 0.2 },
      { type: 'spike', y: 450, wall: 'right', depth: 65 },
      { type: 'spike', y: 550, wall: 'left', depth: 65 },
      { type: 'spike', y: 650, wall: 'right', depth: 65 },
      // Exit fan to the right
      { type: 'platform', y: 850, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 780, wall: 'left', depth: 70 },
      // Continue from platform
      { type: 'spike', y: 1000, wall: 'right', depth: 50 },
      { type: 'platform', y: 1150, width: 100 },
      { type: 'blocker', y: 1300, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1450, wall: 'left', depth: 55 },
      { type: 'spike', y: 1600, wall: 'right', depth: 55 },
      { type: 'vanish', y: 1750, width: 90 },
      { type: 'pendulum', y: 1900, swingSpeed: 2.5 },
      { type: 'spike', y: 2050, wall: 'both', depth: 40 },
      { type: 'platform', y: 2250, width: 100 },
      { type: 'spike', y: 2400, wall: 'left', depth: 45 },
    ],
    gemPositions: [
      { x: TL + 40, y: 500 },
      { x: TR - 40, y: 600 },
      { x: TR - 50, y: 810 },
      { x: CX, y: 1100 },
      { x: CX, y: 1350 },
      { x: CX, y: 1550 },
      { x: CX, y: 1800 },
      { x: CX, y: 2150 },
    ],
  },

  // --- LEVEL 36 — Full toolkit: fan → tube → trampoline sequence ---
  {
    id: 36,
    color: '#E74C3C',
    height: 2700,
    gems: 8,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 50 },
      { type: 'blocker', y: 350, speed: 2.0, gapSide: 'right', width: 100 },
      // Fan zone to navigate to tube entry
      { type: 'fan', y: 800, fanHeight: 300, gravityMult: 0.25 },
      { type: 'spike', y: 560, wall: 'right', depth: 70 },
      { type: 'spike', y: 660, wall: 'left', depth: 70 },
      { type: 'tube', y: 750, entryX: TL + 25, exitX: CX, exitY: 950 },
      { type: 'spike', y: 780, wall: 'right', depth: 80 },
      // Tube exits above trampoline
      { type: 'trampoline', y: 1100, width: 90 },
      { type: 'platform', y: 900, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 1000, wall: 'left', depth: 70 },
      // Trampoline bounces to right platform
      { type: 'spike', y: 1150, wall: 'both', depth: 40 },
      { type: 'platform', y: 1300, width: 100 },
      { type: 'pendulum', y: 1450, swingSpeed: 2.5 },
      { type: 'spike', y: 1600, wall: 'left', depth: 55 },
      { type: 'blocker', y: 1750, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1900, wall: 'right', depth: 55 },
      { type: 'vanish', y: 2050, width: 90 },
      { type: 'spike', y: 2200, wall: 'both', depth: 40 },
      { type: 'platform', y: 2400, width: 100 },
      { type: 'spike', y: 2550, wall: 'left', depth: 45 },
    ],
    gemPositions: [
      { x: TL + 30, y: 600 },
      { x: TL + 30, y: 720 },
      { x: TR - 50, y: 860 },
      { x: CX, y: 1050 },
      { x: CX, y: 1350 },
      { x: CX, y: 1550 },
      { x: CX, y: 1850 },
      { x: CX, y: 2300 },
    ],
  },

  // --- LEVEL 37 — Double fan with tube bridge ---
  {
    id: 37,
    color: '#9B59B6',
    height: 2800,
    gems: 8,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 50 },
      { type: 'spike', y: 350, wall: 'left', depth: 55 },
      // First fan zone
      { type: 'fan', y: 750, fanHeight: 300, gravityMult: 0.22 },
      { type: 'spike', y: 500, wall: 'left', depth: 70 },
      { type: 'spike', y: 600, wall: 'right', depth: 70 },
      { type: 'spike', y: 700, wall: 'left', depth: 70 },
      // Tube connects fan zone to second fan zone
      { type: 'tube', y: 740, entryX: TR - 25, exitX: TL + 25, exitY: 950 },
      // Second fan zone
      { type: 'fan', y: 1300, fanHeight: 300, gravityMult: 0.22 },
      { type: 'spike', y: 1050, wall: 'right', depth: 70 },
      { type: 'spike', y: 1150, wall: 'left', depth: 70 },
      { type: 'spike', y: 1250, wall: 'right', depth: 70 },
      // After fans
      { type: 'platform', y: 1450, width: 100 },
      { type: 'pendulum', y: 1600, swingSpeed: 2.5 },
      { type: 'spike', y: 1750, wall: 'both', depth: 40 },
      { type: 'blocker', y: 1900, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2050, wall: 'left', depth: 55 },
      { type: 'spike', y: 2200, wall: 'right', depth: 55 },
      { type: 'vanish', y: 2350, width: 85 },
      { type: 'spike', y: 2500, wall: 'both', depth: 40 },
      { type: 'platform', y: 2650, width: 110 },
    ],
    gemPositions: [
      { x: TR - 40, y: 550 },
      { x: TL + 40, y: 650 },
      { x: TL + 40, y: 1000 },
      { x: TR - 40, y: 1100 },
      { x: CX, y: 1400 },
      { x: CX, y: 1650 },
      { x: CX, y: 1950 },
      { x: CX, y: 2400 },
    ],
  },

  // --- LEVEL 38 — Trampoline staircase with magnets ---
  {
    id: 38,
    color: '#F39C12',
    height: 2800,
    gems: 8,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 50 },
      { type: 'blocker', y: 350, speed: 2.2, gapSide: 'center', width: 100 },
      { type: 'spike', y: 500, wall: 'right', depth: 55 },
      // Trampoline on left, magnet pulls you to platform on right
      { type: 'trampoline', y: 750, width: 80, xPos: TL + 10 },
      { type: 'magnet', y: 580, xPos: TR - 30, radius: 100, strength: 0.15 },
      { type: 'platform', y: 560, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 650, wall: 'left', depth: 75 },
      // Trampoline on right, magnet pulls to left platform
      { type: 'trampoline', y: 1000, width: 80, xPos: TR - 90 },
      { type: 'magnet', y: 830, xPos: TL + 30, radius: 100, strength: 0.15 },
      { type: 'platform', y: 810, width: 80, xPos: TL + 10 },
      { type: 'spike', y: 900, wall: 'right', depth: 75 },
      // Third trampoline with tube exit
      { type: 'trampoline', y: 1250, width: 80, xPos: TL + 10 },
      { type: 'tube', y: 1080, entryX: CX, exitX: CX, exitY: 1400 },
      { type: 'spike', y: 1150, wall: 'left', depth: 70 },
      { type: 'spike', y: 1150, wall: 'right', depth: 70 },
      // After the acrobatics
      { type: 'platform', y: 1550, width: 100 },
      { type: 'spike', y: 1700, wall: 'both', depth: 40 },
      { type: 'pendulum', y: 1850, swingSpeed: 2.5 },
      { type: 'blocker', y: 2000, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2150, wall: 'left', depth: 55 },
      { type: 'spike', y: 2300, wall: 'right', depth: 55 },
      { type: 'vanish', y: 2450, width: 85 },
      { type: 'spike', y: 2600, wall: 'both', depth: 35 },
    ],
    gemPositions: [
      { x: TR - 50, y: 530 },
      { x: TL + 50, y: 780 },
      { x: CX, y: 1060 },
      { x: CX, y: 1450 },
      { x: CX, y: 1600 },
      { x: CX, y: 1900 },
      { x: CX, y: 2200 },
      { x: CX, y: 2500 },
    ],
  },

  // --- LEVEL 39 — Bounce chain: ricochet through blocked sections ---
  {
    id: 39,
    color: '#2ECC71',
    height: 2900,
    gems: 8,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 50 },
      { type: 'pendulum', y: 350, swingSpeed: 2.5 },
      { type: 'platform', y: 500, width: 100 },
      // Bounce redirects you up and right
      { type: 'bounce', y: 700, xPos: TL + 10, width: 70, factor: 1.5 },
      { type: 'spike', y: 750, wall: 'left', depth: 85 },
      { type: 'spike', y: 750, wall: 'right', depth: 85 },
      { type: 'platform', y: 550, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 650, wall: 'left', depth: 70 },
      // Second bounce on right
      { type: 'bounce', y: 950, xPos: TR - 80, width: 70, factor: 1.5 },
      { type: 'spike', y: 1000, wall: 'left', depth: 85 },
      { type: 'spike', y: 1000, wall: 'right', depth: 85 },
      { type: 'platform', y: 800, width: 80, xPos: TL + 10 },
      { type: 'spike', y: 900, wall: 'right', depth: 70 },
      // Continue from left platform
      { type: 'platform', y: 1150, width: 100 },
      { type: 'spike', y: 1300, wall: 'right', depth: 55 },
      { type: 'blocker', y: 1450, speed: 2.0, gapSide: 'center', width: 100 },
      // Fan section
      { type: 'fan', y: 1850, fanHeight: 300, gravityMult: 0.22 },
      { type: 'spike', y: 1600, wall: 'left', depth: 65 },
      { type: 'spike', y: 1700, wall: 'right', depth: 65 },
      { type: 'spike', y: 1800, wall: 'left', depth: 65 },
      { type: 'platform', y: 2000, width: 100 },
      { type: 'spike', y: 2150, wall: 'both', depth: 40 },
      { type: 'pendulum', y: 2300, swingSpeed: 2.8 },
      { type: 'vanish', y: 2450, width: 85 },
      { type: 'spike', y: 2600, wall: 'left', depth: 50 },
      { type: 'spike', y: 2750, wall: 'right', depth: 45 },
    ],
    gemPositions: [
      { x: TR - 50, y: 510 },
      { x: TL + 50, y: 760 },
      { x: CX, y: 1100 },
      { x: CX, y: 1350 },
      { x: TL + 40, y: 1650 },
      { x: TR - 40, y: 1750 },
      { x: CX, y: 2050 },
      { x: CX, y: 2500 },
    ],
  },

  // --- LEVEL 40 — Magnet vortex: 3 magnets pull you through maze ---
  {
    id: 40,
    color: '#2D3436',
    height: 3000,
    gems: 9,
    bonusGems: 5,
    obstacles: [
      { type: 'blocker', y: 200, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 350, wall: 'left', depth: 55 },
      { type: 'pendulum', y: 500, swingSpeed: 2.5 },
      // Magnet vortex section — 3 magnets guide you through spike maze
      { type: 'magnet', y: 700, xPos: TR - 20, radius: 130, strength: 0.22 },
      { type: 'spike', y: 680, wall: 'left', depth: 80 },
      { type: 'spike', y: 780, wall: 'left', depth: 80 },
      { type: 'magnet', y: 920, xPos: TL + 20, radius: 130, strength: 0.22 },
      { type: 'spike', y: 900, wall: 'right', depth: 80 },
      { type: 'spike', y: 1000, wall: 'right', depth: 80 },
      { type: 'magnet', y: 1140, xPos: TR - 20, radius: 130, strength: 0.22 },
      { type: 'spike', y: 1120, wall: 'left', depth: 80 },
      { type: 'spike', y: 1220, wall: 'left', depth: 80 },
      // Rest platform
      { type: 'platform', y: 1350, width: 100 },
      // Tube bypass
      { type: 'spike', y: 1550, wall: 'left', depth: 90 },
      { type: 'spike', y: 1550, wall: 'right', depth: 90 },
      { type: 'tube', y: 1470, entryX: CX, exitX: CX, exitY: 1700 },
      // Final section
      { type: 'blocker', y: 1850, speed: 2.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2000, wall: 'both', depth: 45 },
      { type: 'pendulum', y: 2150, swingSpeed: 3.0 },
      { type: 'vanish', y: 2300, width: 85 },
      { type: 'spike', y: 2450, wall: 'left', depth: 55 },
      { type: 'spike', y: 2600, wall: 'right', depth: 55 },
      { type: 'platform', y: 2800, width: 100 },
    ],
    gemPositions: [
      { x: CX, y: 300 },
      { x: TR - 30, y: 660 },
      { x: TL + 30, y: 880 },
      { x: TR - 30, y: 1100 },
      { x: CX, y: 1300 },
      { x: CX, y: 1650 },
      { x: CX, y: 1900 },
      { x: CX, y: 2350 },
      { x: CX, y: 2700 },
    ],
  },

  // --- LEVEL 41 — Fan tower: vertical fan zones with tube shortcuts ---
  {
    id: 41,
    color: '#E84393',
    height: 3000,
    gems: 9,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 50 },
      { type: 'blocker', y: 350, speed: 2.2, gapSide: 'left', width: 100 },
      // Fan zone 1 — navigate spikes
      { type: 'fan', y: 850, fanHeight: 350, gravityMult: 0.2 },
      { type: 'spike', y: 550, wall: 'right', depth: 70 },
      { type: 'spike', y: 650, wall: 'left', depth: 70 },
      { type: 'spike', y: 750, wall: 'right', depth: 70 },
      // Tube from fan to next section
      { type: 'tube', y: 830, entryX: TL + 25, exitX: TR - 30, exitY: 1050 },
      { type: 'spike', y: 840, wall: 'right', depth: 80 },
      // Normal section
      { type: 'platform', y: 1200, width: 100 },
      { type: 'pendulum', y: 1350, swingSpeed: 2.8 },
      // Fan zone 2 — tighter
      { type: 'fan', y: 1850, fanHeight: 300, gravityMult: 0.2 },
      { type: 'spike', y: 1600, wall: 'left', depth: 75 },
      { type: 'spike', y: 1700, wall: 'right', depth: 75 },
      { type: 'spike', y: 1800, wall: 'left', depth: 75 },
      // Trampoline exit from second fan
      { type: 'trampoline', y: 1950, width: 80 },
      { type: 'platform', y: 1780, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 1880, wall: 'left', depth: 70 },
      // Final stretch
      { type: 'spike', y: 2100, wall: 'right', depth: 55 },
      { type: 'blocker', y: 2250, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2400, wall: 'both', depth: 40 },
      { type: 'vanish', y: 2550, width: 85 },
      { type: 'spike', y: 2700, wall: 'left', depth: 50 },
      { type: 'platform', y: 2850, width: 110 },
    ],
    gemPositions: [
      { x: TL + 40, y: 600 },
      { x: TR - 40, y: 700 },
      { x: TR - 40, y: 1100 },
      { x: CX, y: 1250 },
      { x: TL + 40, y: 1650 },
      { x: TR - 40, y: 1750 },
      { x: TR - 50, y: 1750 },
      { x: CX, y: 2300 },
      { x: CX, y: 2600 },
    ],
  },

  // --- LEVEL 42 — Magnet + Trampoline: magnetic launch pads ---
  {
    id: 42,
    color: '#00CEC9',
    height: 3000,
    gems: 9,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 180, wall: 'left', depth: 50 },
      { type: 'pendulum', y: 300, swingSpeed: 2.5 },
      { type: 'spike', y: 450, wall: 'right', depth: 55 },
      // Magnet pulls you onto trampoline
      { type: 'magnet', y: 700, xPos: TL + 30, radius: 110, strength: 0.18 },
      { type: 'trampoline', y: 720, width: 80, xPos: TL + 10 },
      { type: 'spike', y: 650, wall: 'right', depth: 70 },
      // Trampoline bounces to right platform
      { type: 'platform', y: 550, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 620, wall: 'left', depth: 75 },
      // Second magnet-trampoline
      { type: 'magnet', y: 960, xPos: TR - 30, radius: 110, strength: 0.18 },
      { type: 'trampoline', y: 980, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 910, wall: 'left', depth: 70 },
      { type: 'platform', y: 810, width: 80, xPos: TL + 10 },
      { type: 'spike', y: 880, wall: 'right', depth: 75 },
      // Platform rest
      { type: 'platform', y: 1150, width: 100 },
      // Tube section
      { type: 'spike', y: 1350, wall: 'left', depth: 90 },
      { type: 'spike', y: 1350, wall: 'right', depth: 90 },
      { type: 'tube', y: 1270, entryX: CX, exitX: CX, exitY: 1500 },
      // Bounce + fan finale
      { type: 'fan', y: 1900, fanHeight: 300, gravityMult: 0.22 },
      { type: 'spike', y: 1650, wall: 'right', depth: 70 },
      { type: 'spike', y: 1750, wall: 'left', depth: 70 },
      { type: 'spike', y: 1850, wall: 'right', depth: 70 },
      { type: 'platform', y: 2050, width: 100 },
      { type: 'spike', y: 2200, wall: 'both', depth: 40 },
      { type: 'blocker', y: 2350, speed: 2.2, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2500, wall: 'left', depth: 55 },
      { type: 'vanish', y: 2650, width: 85 },
      { type: 'spike', y: 2800, wall: 'right', depth: 50 },
    ],
    gemPositions: [
      { x: TL + 40, y: 680 },
      { x: TR - 50, y: 520 },
      { x: TL + 50, y: 780 },
      { x: CX, y: 1100 },
      { x: CX, y: 1450 },
      { x: TL + 40, y: 1700 },
      { x: TR - 40, y: 1800 },
      { x: CX, y: 2100 },
      { x: CX, y: 2700 },
    ],
  },

  // --- LEVEL 43 — Tube maze: 4 tubes form a path ---
  {
    id: 43,
    color: '#636E72',
    height: 3200,
    gems: 9,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 50 },
      { type: 'blocker', y: 350, speed: 2.0, gapSide: 'center', width: 100 },
      // Tube 1: center to left
      { type: 'spike', y: 550, wall: 'left', depth: 90 },
      { type: 'spike', y: 550, wall: 'right', depth: 90 },
      { type: 'tube', y: 470, entryX: CX, exitX: TL + 25, exitY: 680 },
      // Tube 2: left to right
      { type: 'spike', y: 850, wall: 'left', depth: 90 },
      { type: 'spike', y: 850, wall: 'right', depth: 90 },
      { type: 'tube', y: 770, entryX: TL + 25, exitX: TR - 25, exitY: 980 },
      // Tube 3: right to center
      { type: 'spike', y: 1150, wall: 'left', depth: 90 },
      { type: 'spike', y: 1150, wall: 'right', depth: 90 },
      { type: 'tube', y: 1070, entryX: TR - 25, exitX: CX, exitY: 1280 },
      // Tube 4: center to right
      { type: 'spike', y: 1450, wall: 'left', depth: 90 },
      { type: 'spike', y: 1450, wall: 'right', depth: 90 },
      { type: 'tube', y: 1370, entryX: CX, exitX: TR - 25, exitY: 1580 },
      // After tube maze, mixed obstacles
      { type: 'platform', y: 1700, width: 100 },
      { type: 'pendulum', y: 1850, swingSpeed: 3.0 },
      { type: 'spike', y: 2000, wall: 'both', depth: 45 },
      { type: 'fan', y: 2350, fanHeight: 250, gravityMult: 0.22 },
      { type: 'spike', y: 2150, wall: 'right', depth: 65 },
      { type: 'spike', y: 2250, wall: 'left', depth: 65 },
      { type: 'blocker', y: 2500, speed: 2.2, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2650, wall: 'left', depth: 55 },
      { type: 'vanish', y: 2800, width: 85 },
      { type: 'spike', y: 2950, wall: 'right', depth: 50 },
      { type: 'platform', y: 3050, width: 110 },
    ],
    gemPositions: [
      { x: CX, y: 430 },
      { x: TL + 40, y: 730 },
      { x: TR - 40, y: 1030 },
      { x: CX, y: 1330 },
      { x: TR - 40, y: 1630 },
      { x: CX, y: 1750 },
      { x: TL + 40, y: 2200 },
      { x: CX, y: 2550 },
      { x: CX, y: 2850 },
    ],
  },

  // --- LEVEL 44 — Bounce gauntlet: multiple redirects ---
  {
    id: 44,
    color: '#FFEAA7',
    height: 3200,
    gems: 9,
    bonusGems: 5,
    obstacles: [
      { type: 'spike', y: 180, wall: 'left', depth: 50 },
      { type: 'spike', y: 320, wall: 'right', depth: 55 },
      { type: 'platform', y: 450, width: 100 },
      // Bounce 1: left bounce sends up-right
      { type: 'bounce', y: 650, xPos: TL + 10, width: 70, factor: 1.5 },
      { type: 'spike', y: 700, wall: 'both', depth: 80 },
      { type: 'platform', y: 500, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 600, wall: 'left', depth: 70 },
      // Bounce 2: right bounce sends up-left
      { type: 'bounce', y: 900, xPos: TR - 80, width: 70, factor: 1.5 },
      { type: 'spike', y: 950, wall: 'both', depth: 80 },
      { type: 'platform', y: 750, width: 80, xPos: TL + 10 },
      { type: 'spike', y: 850, wall: 'right', depth: 70 },
      // Bounce 3: center bounce + fan above
      { type: 'fan', y: 1100, fanHeight: 200, gravityMult: 0.25 },
      { type: 'bounce', y: 1150, width: 80, factor: 1.6 },
      { type: 'spike', y: 1200, wall: 'both', depth: 80 },
      { type: 'spike', y: 950, wall: 'left', depth: 60 },
      { type: 'spike', y: 1050, wall: 'right', depth: 60 },
      // Land on platform after fan
      { type: 'platform', y: 1350, width: 100 },
      // Normal obstacles
      { type: 'pendulum', y: 1500, swingSpeed: 2.8 },
      { type: 'spike', y: 1650, wall: 'both', depth: 40 },
      { type: 'blocker', y: 1800, speed: 2.2, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1950, wall: 'left', depth: 55 },
      { type: 'vanish', y: 2100, width: 85 },
      { type: 'spike', y: 2250, wall: 'right', depth: 55 },
      { type: 'tube', y: 2380, entryX: CX, exitX: CX, exitY: 2580 },
      { type: 'spike', y: 2450, wall: 'left', depth: 90 },
      { type: 'spike', y: 2450, wall: 'right', depth: 90 },
      { type: 'platform', y: 2700, width: 100 },
      { type: 'spike', y: 2850, wall: 'both', depth: 40 },
      { type: 'spike', y: 3000, wall: 'left', depth: 45 },
      { type: 'platform', y: 3100, width: 110 },
    ],
    gemPositions: [
      { x: TR - 50, y: 470 },
      { x: TL + 50, y: 720 },
      { x: CX, y: 1000 },
      { x: CX, y: 1300 },
      { x: CX, y: 1550 },
      { x: CX, y: 1850 },
      { x: CX, y: 2150 },
      { x: CX, y: 2530 },
      { x: CX, y: 2900 },
    ],
  },

  // --- LEVEL 45 — All tools: fan → magnet → tube → trampoline → bounce ---
  {
    id: 45,
    color: '#D63031',
    height: 3300,
    gems: 10,
    bonusGems: 5,
    obstacles: [
      { type: 'blocker', y: 200, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 350, wall: 'left', depth: 55 },
      // Fan zone — navigate to tube entry
      { type: 'fan', y: 800, fanHeight: 300, gravityMult: 0.22 },
      { type: 'spike', y: 550, wall: 'right', depth: 70 },
      { type: 'spike', y: 650, wall: 'left', depth: 70 },
      { type: 'spike', y: 750, wall: 'right', depth: 70 },
      // Tube from fan zone
      { type: 'tube', y: 780, entryX: TL + 25, exitX: CX, exitY: 980 },
      { type: 'spike', y: 790, wall: 'right', depth: 80 },
      // Magnet pulls toward trampoline
      { type: 'magnet', y: 1100, xPos: TL + 30, radius: 100, strength: 0.18 },
      { type: 'trampoline', y: 1130, width: 80, xPos: TL + 10 },
      { type: 'spike', y: 1050, wall: 'right', depth: 70 },
      // Trampoline bounces to high platform
      { type: 'platform', y: 950, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 1020, wall: 'left', depth: 75 },
      // From platform, fall to bounce
      { type: 'bounce', y: 1350, width: 80, factor: 1.5 },
      { type: 'spike', y: 1400, wall: 'left', depth: 85 },
      { type: 'spike', y: 1400, wall: 'right', depth: 85 },
      { type: 'platform', y: 1200, width: 80, xPos: CX - 40 },
      // Continue through mixed section
      { type: 'platform', y: 1550, width: 100 },
      { type: 'pendulum', y: 1700, swingSpeed: 3.0 },
      { type: 'spike', y: 1850, wall: 'both', depth: 45 },
      { type: 'blocker', y: 2000, speed: 2.5, gapSide: 'center', width: 100 },
      // Second tube bypass
      { type: 'spike', y: 2200, wall: 'left', depth: 90 },
      { type: 'spike', y: 2200, wall: 'right', depth: 90 },
      { type: 'tube', y: 2120, entryX: CX, exitX: CX, exitY: 2350 },
      { type: 'spike', y: 2500, wall: 'left', depth: 55 },
      { type: 'vanish', y: 2650, width: 85 },
      { type: 'spike', y: 2800, wall: 'right', depth: 55 },
      { type: 'spike', y: 2950, wall: 'both', depth: 40 },
      { type: 'platform', y: 3150, width: 110 },
    ],
    gemPositions: [
      { x: TL + 40, y: 600 },
      { x: TL + 40, y: 700 },
      { x: TR - 50, y: 920 },
      { x: TL + 50, y: 1090 },
      { x: CX, y: 1180 },
      { x: CX, y: 1500 },
      { x: CX, y: 1750 },
      { x: CX, y: 2050 },
      { x: CX, y: 2400 },
      { x: CX, y: 2700 },
    ],
  },

  // --- LEVEL 46 — Vertical maze: tubes + magnets + platforms ---
  {
    id: 46,
    color: '#6C5CE7',
    height: 3400,
    gems: 10,
    bonusGems: 6,
    obstacles: [
      { type: 'spike', y: 200, wall: 'left', depth: 55 },
      { type: 'pendulum', y: 350, swingSpeed: 3.0 },
      { type: 'spike', y: 500, wall: 'right', depth: 55 },
      // Magnet pulls into tube
      { type: 'magnet', y: 700, xPos: TL + 25, radius: 120, strength: 0.2 },
      { type: 'spike', y: 680, wall: 'right', depth: 75 },
      { type: 'tube', y: 730, entryX: TL + 25, exitX: TR - 25, exitY: 930 },
      { type: 'spike', y: 780, wall: 'left', depth: 90 },
      { type: 'spike', y: 780, wall: 'right', depth: 90 },
      // Magnet pulls into second tube
      { type: 'magnet', y: 1050, xPos: TR - 25, radius: 120, strength: 0.2 },
      { type: 'spike', y: 1030, wall: 'left', depth: 75 },
      { type: 'tube', y: 1080, entryX: TR - 25, exitX: TL + 25, exitY: 1280 },
      { type: 'spike', y: 1130, wall: 'left', depth: 90 },
      { type: 'spike', y: 1130, wall: 'right', depth: 90 },
      // Platform rest
      { type: 'platform', y: 1400, width: 100 },
      // Fan + trampoline combo
      { type: 'fan', y: 1800, fanHeight: 300, gravityMult: 0.2 },
      { type: 'spike', y: 1550, wall: 'right', depth: 70 },
      { type: 'spike', y: 1650, wall: 'left', depth: 70 },
      { type: 'spike', y: 1750, wall: 'right', depth: 70 },
      { type: 'trampoline', y: 1900, width: 80 },
      { type: 'platform', y: 1700, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 1820, wall: 'left', depth: 70 },
      // Final section
      { type: 'blocker', y: 2100, speed: 2.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2250, wall: 'both', depth: 45 },
      { type: 'pendulum', y: 2400, swingSpeed: 3.2 },
      { type: 'vanish', y: 2550, width: 80 },
      { type: 'spike', y: 2700, wall: 'left', depth: 55 },
      { type: 'spike', y: 2850, wall: 'right', depth: 55 },
      { type: 'blocker', y: 3000, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 3150, wall: 'both', depth: 40 },
      { type: 'platform', y: 3250, width: 110 },
    ],
    gemPositions: [
      { x: TL + 40, y: 660 },
      { x: TR - 40, y: 980 },
      { x: TL + 40, y: 1330 },
      { x: CX, y: 1450 },
      { x: TL + 40, y: 1600 },
      { x: TR - 50, y: 1680 },
      { x: CX, y: 2150 },
      { x: CX, y: 2450 },
      { x: CX, y: 2750 },
      { x: CX, y: 3050 },
    ],
  },

  // --- LEVEL 47 — Bounce + Tube combo: bounce into tube entries ---
  {
    id: 47,
    color: '#FDCB6E',
    height: 3400,
    gems: 10,
    bonusGems: 6,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 55 },
      { type: 'blocker', y: 350, speed: 2.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 500, wall: 'left', depth: 55 },
      // Bounce sends you UP to tube entry
      { type: 'bounce', y: 750, width: 80, factor: 1.6 },
      { type: 'tube', y: 580, entryX: CX, exitX: TL + 25, exitY: 950 },
      { type: 'spike', y: 700, wall: 'left', depth: 80 },
      { type: 'spike', y: 700, wall: 'right', depth: 80 },
      // From tube exit, navigate to second bounce
      { type: 'spike', y: 1050, wall: 'right', depth: 55 },
      { type: 'platform', y: 1200, width: 100 },
      // Second bounce-tube combo
      { type: 'bounce', y: 1450, width: 80, factor: 1.6 },
      { type: 'tube', y: 1280, entryX: CX, exitX: TR - 25, exitY: 1650 },
      { type: 'spike', y: 1400, wall: 'left', depth: 80 },
      { type: 'spike', y: 1400, wall: 'right', depth: 80 },
      // After tubes
      { type: 'spike', y: 1750, wall: 'left', depth: 55 },
      { type: 'platform', y: 1900, width: 100 },
      // Fan section with magnet
      { type: 'fan', y: 2350, fanHeight: 300, gravityMult: 0.2 },
      { type: 'spike', y: 2100, wall: 'right', depth: 70 },
      { type: 'magnet', y: 2120, xPos: TL + 25, radius: 90, strength: 0.15 },
      { type: 'spike', y: 2200, wall: 'left', depth: 70 },
      { type: 'magnet', y: 2220, xPos: TR - 25, radius: 90, strength: 0.15 },
      { type: 'spike', y: 2300, wall: 'right', depth: 70 },
      // Final stretch
      { type: 'platform', y: 2500, width: 100 },
      { type: 'pendulum', y: 2650, swingSpeed: 3.0 },
      { type: 'spike', y: 2800, wall: 'both', depth: 45 },
      { type: 'vanish', y: 2950, width: 80 },
      { type: 'spike', y: 3100, wall: 'left', depth: 55 },
      { type: 'platform', y: 3250, width: 110 },
    ],
    gemPositions: [
      { x: CX, y: 560 },
      { x: TL + 40, y: 1000 },
      { x: CX, y: 1250 },
      { x: CX, y: 1260 },
      { x: TR - 40, y: 1700 },
      { x: CX, y: 1950 },
      { x: TL + 40, y: 2080 },
      { x: TR - 40, y: 2180 },
      { x: CX, y: 2550 },
      { x: CX, y: 3000 },
    ],
  },

  // --- LEVEL 48 — Magnet maze: magnets form invisible paths ---
  {
    id: 48,
    color: '#00B894',
    height: 3500,
    gems: 11,
    bonusGems: 6,
    obstacles: [
      { type: 'blocker', y: 200, speed: 2.2, gapSide: 'center', width: 100 },
      { type: 'spike', y: 350, wall: 'left', depth: 55 },
      { type: 'pendulum', y: 500, swingSpeed: 3.0 },
      // Magnet zigzag — each magnet pulls you through the safe gap
      { type: 'magnet', y: 700, xPos: TR - 20, radius: 140, strength: 0.22 },
      { type: 'spike', y: 680, wall: 'left', depth: 85 },
      { type: 'magnet', y: 880, xPos: TL + 20, radius: 140, strength: 0.22 },
      { type: 'spike', y: 860, wall: 'right', depth: 85 },
      { type: 'magnet', y: 1060, xPos: TR - 20, radius: 140, strength: 0.22 },
      { type: 'spike', y: 1040, wall: 'left', depth: 85 },
      { type: 'magnet', y: 1240, xPos: TL + 20, radius: 140, strength: 0.22 },
      { type: 'spike', y: 1220, wall: 'right', depth: 85 },
      // Platform rest
      { type: 'platform', y: 1400, width: 100 },
      // Tube shortcut past double spike wall
      { type: 'spike', y: 1600, wall: 'left', depth: 90 },
      { type: 'spike', y: 1600, wall: 'right', depth: 90 },
      { type: 'tube', y: 1520, entryX: CX, exitX: CX, exitY: 1750 },
      // Trampoline section
      { type: 'trampoline', y: 1950, width: 80, xPos: TL + 10 },
      { type: 'platform', y: 1780, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 1870, wall: 'left', depth: 70 },
      // Fan finale
      { type: 'fan', y: 2450, fanHeight: 300, gravityMult: 0.2 },
      { type: 'spike', y: 2200, wall: 'right', depth: 75 },
      { type: 'spike', y: 2300, wall: 'left', depth: 75 },
      { type: 'spike', y: 2400, wall: 'right', depth: 75 },
      // Final
      { type: 'blocker', y: 2600, speed: 2.5, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2750, wall: 'both', depth: 45 },
      { type: 'pendulum', y: 2900, swingSpeed: 3.2 },
      { type: 'vanish', y: 3050, width: 80 },
      { type: 'spike', y: 3200, wall: 'left', depth: 55 },
      { type: 'platform', y: 3350, width: 110 },
    ],
    gemPositions: [
      { x: TR - 30, y: 660 },
      { x: TL + 30, y: 840 },
      { x: TR - 30, y: 1020 },
      { x: TL + 30, y: 1200 },
      { x: CX, y: 1450 },
      { x: CX, y: 1700 },
      { x: TR - 50, y: 1750 },
      { x: TL + 40, y: 2250 },
      { x: TR - 40, y: 2350 },
      { x: CX, y: 2650 },
      { x: CX, y: 3100 },
    ],
  },

  // --- LEVEL 49 — Ultimate combo: every tool type required ---
  {
    id: 49,
    color: '#E84393',
    height: 3600,
    gems: 11,
    bonusGems: 6,
    obstacles: [
      { type: 'spike', y: 200, wall: 'right', depth: 55 },
      { type: 'pendulum', y: 350, swingSpeed: 3.0 },
      { type: 'blocker', y: 500, speed: 2.5, gapSide: 'left', width: 100 },
      // FAN section — tight zigzag
      { type: 'fan', y: 950, fanHeight: 300, gravityMult: 0.2 },
      { type: 'spike', y: 700, wall: 'right', depth: 75 },
      { type: 'spike', y: 800, wall: 'left', depth: 75 },
      { type: 'spike', y: 900, wall: 'right', depth: 75 },
      // TUBE from fan zone past spike wall
      { type: 'tube', y: 930, entryX: TL + 25, exitX: TR - 25, exitY: 1130 },
      { type: 'spike', y: 940, wall: 'right', depth: 85 },
      // MAGNET pulls toward trampoline
      { type: 'magnet', y: 1250, xPos: TL + 25, radius: 110, strength: 0.2 },
      { type: 'spike', y: 1200, wall: 'right', depth: 70 },
      // TRAMPOLINE bounces to high platform
      { type: 'trampoline', y: 1280, width: 80, xPos: TL + 10 },
      { type: 'platform', y: 1100, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 1180, wall: 'left', depth: 75 },
      // BOUNCE redirects up
      { type: 'bounce', y: 1530, width: 80, factor: 1.6 },
      { type: 'spike', y: 1580, wall: 'left', depth: 85 },
      { type: 'spike', y: 1580, wall: 'right', depth: 85 },
      { type: 'platform', y: 1380, width: 80, xPos: CX - 40 },
      // Continue mixed section
      { type: 'platform', y: 1700, width: 100 },
      { type: 'spike', y: 1850, wall: 'both', depth: 45 },
      { type: 'pendulum', y: 2000, swingSpeed: 3.2 },
      // Second tube bypass
      { type: 'spike', y: 2200, wall: 'left', depth: 90 },
      { type: 'spike', y: 2200, wall: 'right', depth: 90 },
      { type: 'tube', y: 2120, entryX: CX, exitX: CX, exitY: 2350 },
      // Fan + magnet combo
      { type: 'fan', y: 2750, fanHeight: 300, gravityMult: 0.2 },
      { type: 'spike', y: 2500, wall: 'left', depth: 70 },
      { type: 'magnet', y: 2520, xPos: TR - 20, radius: 90, strength: 0.15 },
      { type: 'spike', y: 2600, wall: 'right', depth: 70 },
      { type: 'magnet', y: 2620, xPos: TL + 20, radius: 90, strength: 0.15 },
      { type: 'spike', y: 2700, wall: 'left', depth: 70 },
      // Final
      { type: 'blocker', y: 2900, speed: 2.5, gapSide: 'center', width: 100 },
      { type: 'vanish', y: 3050, width: 80 },
      { type: 'spike', y: 3200, wall: 'both', depth: 45 },
      { type: 'platform', y: 3400, width: 100 },
    ],
    gemPositions: [
      { x: CX, y: 300 },
      { x: TL + 40, y: 750 },
      { x: TR - 40, y: 850 },
      { x: TL + 25, y: 930 },
      { x: TR - 50, y: 1070 },
      { x: TL + 50, y: 1240 },
      { x: CX, y: 1360 },
      { x: CX, y: 1750 },
      { x: CX, y: 2050 },
      { x: TR - 30, y: 2480 },
      { x: TL + 30, y: 2580 },
    ],
  },

  // --- LEVEL 50 — The Final Descent: master level with every mechanic ---
  {
    id: 50,
    color: '#2D3436',
    height: 4000,
    gems: 12,
    bonusGems: 8,
    obstacles: [
      { type: 'blocker', y: 200, speed: 2.5, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 350, swingSpeed: 3.2 },
      { type: 'spike', y: 500, wall: 'both', depth: 50 },
      // Magnet vortex opening
      { type: 'magnet', y: 700, xPos: TR - 20, radius: 130, strength: 0.22 },
      { type: 'spike', y: 680, wall: 'left', depth: 80 },
      { type: 'magnet', y: 880, xPos: TL + 20, radius: 130, strength: 0.22 },
      { type: 'spike', y: 860, wall: 'right', depth: 80 },
      // Fan corridor
      { type: 'fan', y: 1350, fanHeight: 350, gravityMult: 0.18 },
      { type: 'spike', y: 1050, wall: 'right', depth: 75 },
      { type: 'spike', y: 1150, wall: 'left', depth: 75 },
      { type: 'spike', y: 1250, wall: 'right', depth: 75 },
      // Tube from fan past spike wall
      { type: 'tube', y: 1330, entryX: TL + 25, exitX: CX, exitY: 1530 },
      { type: 'spike', y: 1340, wall: 'right', depth: 85 },
      // Trampoline → platform combo
      { type: 'trampoline', y: 1700, width: 80, xPos: TL + 10 },
      { type: 'platform', y: 1530, width: 80, xPos: TR - 90 },
      { type: 'spike', y: 1620, wall: 'left', depth: 75 },
      // Bounce redirect
      { type: 'bounce', y: 1950, width: 80, factor: 1.6 },
      { type: 'spike', y: 2000, wall: 'left', depth: 85 },
      { type: 'spike', y: 2000, wall: 'right', depth: 85 },
      { type: 'platform', y: 1800, width: 80, xPos: CX - 40 },
      // Rest platform
      { type: 'platform', y: 2150, width: 100 },
      // Double tube chain
      { type: 'spike', y: 2350, wall: 'left', depth: 90 },
      { type: 'spike', y: 2350, wall: 'right', depth: 90 },
      { type: 'tube', y: 2270, entryX: CX, exitX: TL + 25, exitY: 2480 },
      { type: 'spike', y: 2600, wall: 'left', depth: 90 },
      { type: 'spike', y: 2600, wall: 'right', depth: 90 },
      { type: 'tube', y: 2520, entryX: TL + 25, exitX: TR - 25, exitY: 2730 },
      // Fan + Magnet finale
      { type: 'fan', y: 3200, fanHeight: 350, gravityMult: 0.18 },
      { type: 'spike', y: 2900, wall: 'left', depth: 75 },
      { type: 'magnet', y: 2920, xPos: TR - 20, radius: 90, strength: 0.15 },
      { type: 'spike', y: 3000, wall: 'right', depth: 75 },
      { type: 'magnet', y: 3020, xPos: TL + 20, radius: 90, strength: 0.15 },
      { type: 'spike', y: 3100, wall: 'left', depth: 75 },
      { type: 'magnet', y: 3120, xPos: TR - 20, radius: 90, strength: 0.15 },
      // Final gauntlet
      { type: 'blocker', y: 3350, speed: 2.8, gapSide: 'center', width: 100 },
      { type: 'pendulum', y: 3500, swingSpeed: 3.5 },
      { type: 'spike', y: 3650, wall: 'both', depth: 50 },
      { type: 'vanish', y: 3750, width: 80 },
      { type: 'spike', y: 3850, wall: 'both', depth: 45 },
    ],
    gemPositions: [
      { x: CX, y: 300 },
      { x: TR - 30, y: 660 },
      { x: TL + 30, y: 840 },
      { x: TL + 40, y: 1100 },
      { x: TR - 40, y: 1200 },
      { x: TR - 50, y: 1500 },
      { x: CX, y: 1780 },
      { x: CX, y: 2100 },
      { x: CX, y: 2430 },
      { x: TR - 40, y: 2780 },
      { x: TR - 30, y: 2880 },
      { x: TL + 30, y: 2980 },
    ],
  },
];


/**
 * TIME TRIAL LEVELS — 3 ultra-hard short levels.
 * Designed to be completable in under 1 second by skilled players.
 * Short height, dense obstacles, tight gaps, requires perfect timing.
 */
export const TIME_TRIAL_LEVELS = [
  // --- TRIAL 1: "THE GAUNTLET" ---
  // Long zigzag, moderate spikes (max depth 60), wide gaps, no vanish
  // Tube inner = 240px. Max spike 60 = 180px clear. Ball = 24px. Very beatable.
  {
    id: 101,
    color: '#E74C3C',
    height: 2500,
    gems: 0,
    bonusGems: 0,
    timeTrial: true,
    obstacles: [
      { type: 'spike', y: 150, wall: 'right', depth: 40 },
      { type: 'spike', y: 300, wall: 'left', depth: 45 },
      { type: 'spike', y: 450, wall: 'right', depth: 50 },
      { type: 'platform', y: 550, width: 110 },
      { type: 'spike', y: 650, wall: 'left', depth: 45 },
      { type: 'spike', y: 800, wall: 'right', depth: 50 },
      { type: 'blocker', y: 950, speed: 1.8, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1100, wall: 'left', depth: 55 },
      { type: 'spike', y: 1250, wall: 'right', depth: 45 },
      { type: 'platform', y: 1350, width: 100, xPos: TL + 10 },
      { type: 'spike', y: 1450, wall: 'both', depth: 35 },
      { type: 'spike', y: 1600, wall: 'left', depth: 50 },
      { type: 'pendulum', y: 1750, swingSpeed: 2.5 },
      { type: 'spike', y: 1900, wall: 'right', depth: 55 },
      { type: 'spike', y: 2050, wall: 'left', depth: 45 },
      { type: 'blocker', y: 2150, speed: 2.0, gapSide: 'right', width: 100 },
      { type: 'spike', y: 2300, wall: 'both', depth: 35 },
      { type: 'spike', y: 2400, wall: 'right', depth: 40 },
    ],
    gemPositions: [],
  },

  // --- TRIAL 2: "NEEDLE THREAD" ---
  // Longer, platforms + pendulums, moderate difficulty
  // Spikes max 65px. Pendulums slow (2.5-3.0). Blockers narrow (100px).
  {
    id: 102,
    color: '#8E44AD',
    height: 3000,
    gems: 0,
    bonusGems: 0,
    timeTrial: true,
    obstacles: [
      { type: 'spike', y: 150, wall: 'left', depth: 50 },
      { type: 'spike', y: 300, wall: 'right', depth: 50 },
      { type: 'platform', y: 400, width: 100, xPos: TL + 10 },
      { type: 'spike', y: 500, wall: 'right', depth: 55 },
      { type: 'pendulum', y: 650, swingSpeed: 2.5 },
      { type: 'spike', y: 800, wall: 'left', depth: 55 },
      { type: 'spike', y: 950, wall: 'right', depth: 60 },
      { type: 'platform', y: 1050, width: 100, xPos: TR - 110 },
      { type: 'spike', y: 1150, wall: 'both', depth: 30 },
      { type: 'blocker', y: 1300, speed: 2.0, gapSide: 'left', width: 100 },
      { type: 'spike', y: 1450, wall: 'right', depth: 55 },
      { type: 'vanish', y: 1550, width: 100 },
      { type: 'spike', y: 1650, wall: 'left', depth: 60 },
      { type: 'pendulum', y: 1800, swingSpeed: 3.0 },
      { type: 'spike', y: 1950, wall: 'right', depth: 50 },
      { type: 'platform', y: 2050, width: 110, moveRange: 60, speed: 1.0 },
      { type: 'spike', y: 2150, wall: 'left', depth: 55 },
      { type: 'spike', y: 2300, wall: 'both', depth: 35 },
      { type: 'blocker', y: 2450, speed: 2.2, gapSide: 'center', width: 100 },
      { type: 'spike', y: 2600, wall: 'right', depth: 60 },
      { type: 'spike', y: 2750, wall: 'left', depth: 50 },
      { type: 'spike', y: 2900, wall: 'both', depth: 30 },
    ],
    gemPositions: [],
  },

  // --- TRIAL 3: "THE LONG RUN" ---
  // Very long, all obstacle types, but generous spacing and moderate depths
  // Spikes max 65px. Fans included. Vanish platforms wide. Definitely beatable.
  {
    id: 103,
    color: '#2C3E50',
    height: 3500,
    gems: 0,
    bonusGems: 0,
    timeTrial: true,
    obstacles: [
      { type: 'spike', y: 150, wall: 'right', depth: 50 },
      { type: 'spike', y: 300, wall: 'left', depth: 55 },
      { type: 'spike', y: 450, wall: 'right', depth: 45 },
      { type: 'platform', y: 550, width: 110, xPos: TL + 10 },
      { type: 'spike', y: 700, wall: 'left', depth: 60 },
      { type: 'pendulum', y: 850, swingSpeed: 2.5 },
      { type: 'spike', y: 1000, wall: 'right', depth: 55 },
      // Low gravity zone
      { type: 'fan', y: 1250, fanHeight: 180, gravityMult: 0.3 },
      { type: 'spike', y: 1100, wall: 'both', depth: 30 },
      { type: 'spike', y: 1200, wall: 'left', depth: 50 },
      // After low grav
      { type: 'spike', y: 1400, wall: 'right', depth: 55 },
      { type: 'vanish', y: 1500, width: 110 },
      { type: 'spike', y: 1600, wall: 'left', depth: 50 },
      { type: 'blocker', y: 1750, speed: 2.0, gapSide: 'center', width: 100 },
      { type: 'spike', y: 1900, wall: 'right', depth: 60 },
      { type: 'platform', y: 2000, width: 100, xPos: TR - 110 },
      { type: 'spike', y: 2100, wall: 'both', depth: 35 },
      { type: 'pendulum', y: 2250, swingSpeed: 2.8 },
      { type: 'spike', y: 2400, wall: 'left', depth: 55 },
      { type: 'spike', y: 2550, wall: 'right', depth: 50 },
      { type: 'vanish', y: 2650, width: 100, xPos: TL + 10 },
      { type: 'spike', y: 2750, wall: 'left', depth: 60 },
      { type: 'blocker', y: 2900, speed: 2.2, gapSide: 'right', width: 100 },
      // Final section
      { type: 'spike', y: 3050, wall: 'both', depth: 35 },
      { type: 'spike', y: 3200, wall: 'right', depth: 55 },
      { type: 'spike', y: 3350, wall: 'left', depth: 45 },
      { type: 'spike', y: 3450, wall: 'right', depth: 40 },
    ],
    gemPositions: [],
  },
];

/**
 * Get a level by its 1-based ID.
 * @param {number} id
 * @returns {Level|undefined}
 */
export function getLevel(id) {
  if (id >= 101) return TIME_TRIAL_LEVELS.find(l => l.id === id);
  return LEVELS.find(l => l.id === id);
}

/**
 * Get the total number of main levels.
 * @returns {number}
 */
export function getLevelCount() {
  return LEVELS.length;
}

/**
 * Get a time trial level by index (0-2).
 * @param {number} idx
 * @returns {Level|undefined}
 */
export function getTimeTrialLevel(idx) {
  return TIME_TRIAL_LEVELS[idx];
}
