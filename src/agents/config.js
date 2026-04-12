/**
 * Shared configuration constants.
 * Extracted to avoid circular dependencies between engine <-> physics/obstacles.
 */

export const CONFIG = {
  GRAVITY: 0.3,
  TERMINAL_VELOCITY: 6.5,
  JUMP_VX: 2.5,
  JUMP_VY: -5.5,
  TUBE_WIDTH: 280,
  WALL_THICKNESS: 20, // Thick bold walls
  CANVAS_WIDTH: 360,
  CANVAS_HEIGHT: 640,
  BALL_RADIUS: 12,
  CAMERA_BALL_RATIO: 0.35,
  TUBE_X: 40, // (360 - 280) / 2
  TUBE_INNER_LEFT: 60, // TUBE_X + WALL_THICKNESS
  TUBE_INNER_RIGHT: 300, // TUBE_X + TUBE_WIDTH - WALL_THICKNESS
  FIXED_DT: 16.67,
  DEATH_PARTICLE_COUNT: 8,
  DEATH_ANIM_DURATION: 250, // Faster death restart
  GEM_SIZE: 26,
};

/** Game states */
export const STATE = {
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  DEAD: 'DEAD',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
};
