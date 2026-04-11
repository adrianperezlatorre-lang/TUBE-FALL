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
