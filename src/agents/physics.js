/**
 * AGENT 4 — PHYSICS + COLLISION
 * Pure collision detection functions. No side effects.
 */

import { CONFIG } from './config.js';

/**
 * @typedef {Object} CollisionResult
 * @property {boolean} dead - Ball hit a lethal obstacle
 * @property {number[]} collected - Indices of collected gems
 * @property {object|null} rideElevator - Elevator/platform object to ride, or null
 * @property {number|null} rampBounce - New vx value from ramp bounce, or null
 * @property {number|null} gravityMult - gravity multiplier from low-gravity zone (e.g. 0.3)
 * @property {object|null} vanishTouch - Vanish platform the ball touched
 */

/**
 * Check all collisions between ball and active obstacles.
 * @param {Object} ball - { x, y, vx, vy, radius }
 * @param {Object[]} obstacles - Active obstacle objects (pre-culled)
 * @param {Object[]} gemPositions - All gem positions for the level
 * @param {Set<number>} collectedGems - Already collected gem indices
 * @returns {CollisionResult}
 */
export function checkCollisions(ball, obstacles, gemPositions, collectedGems) {
  const result = {
    dead: false,
    collected: [],
    rideElevator: null,
    rampBounce: null,
    gravityMult: null,
    vanishTouch: null,
  };

  for (const obs of obstacles) {
    switch (obs.type) {
      case 'spike':
        if (checkSpikeCollision(ball, obs)) {
          result.dead = true;
          return result;
        }
        // For "both" wall spikes, also check right side
        if (obs._rightDrawPoints && checkSpikeCollisionPoints(ball, obs._rightDrawPoints)) {
          result.dead = true;
          return result;
        }
        break;

      case 'blocker':
        if (circleRectCollision(ball, obs.drawX, obs.drawY, obs.width, obs.height)) {
          result.dead = true;
          return result;
        }
        break;

      case 'elevator': {
        const elevResult = checkElevatorCollision(ball, obs);
        if (elevResult === 'dead') {
          result.dead = true;
          return result;
        }
        if (elevResult === 'ride') {
          result.rideElevator = obs;
        }
        break;
      }

      case 'ramp': {
        const bounce = checkRampCollision(ball, obs);
        if (bounce !== null) {
          result.rampBounce = bounce;
        }
        break;
      }

      case 'wallgap':
        if (checkWallgapCollision(ball, obs)) {
          result.dead = true;
          return result;
        }
        break;

      case 'pendulum':
        if (checkPendulumCollision(ball, obs)) {
          result.dead = true;
          return result;
        }
        break;

      case 'platform': {
        const platResult = checkPlatformCollision(ball, obs);
        if (platResult === 'dead') {
          result.dead = true;
          return result;
        }
        if (platResult === 'ride') {
          result.rideElevator = obs; // reuse ride logic
        }
        break;
      }

      case 'vanish': {
        if (!obs.visible) break;
        const vanResult = checkPlatformCollision(ball, obs);
        if (vanResult === 'dead') {
          result.dead = true;
          return result;
        }
        if (vanResult === 'ride') {
          result.rideElevator = obs;
          if (obs.touchTimer === 0) {
            result.vanishTouch = obs;
          }
        }
        break;
      }

      case 'fan': {
        if (checkFanZone(ball, obs)) {
          result.gravityMult = obs.gravityMult;
        }
        break;
      }
    }
  }

  // Gem collection
  if (gemPositions) {
    for (let i = 0; i < gemPositions.length; i++) {
      if (collectedGems.has(i)) continue;
      const gem = gemPositions[i];
      const dx = ball.x - gem.x;
      const dy = ball.y - gem.y;
      if (dx * dx + dy * dy < (ball.radius + 14) * (ball.radius + 14)) {
        result.collected.push(i);
      }
    }
  }

  return result;
}

/**
 * Check spike collision against explicit points array.
 * @param {Object} ball
 * @param {Object[]} points - [{x,y},{x,y},{x,y}]
 * @returns {boolean}
 */
function checkSpikeCollisionPoints(ball, points) {
  if (!points || points.length < 3) return false;
  const margin = 3;
  const cx = (points[0].x + points[1].x + points[2].x) / 3;
  const cy = (points[0].y + points[1].y + points[2].y) / 3;
  const shrunk = points.map(p => ({
    x: p.x + (cx - p.x) * (margin / 20),
    y: p.y + (cy - p.y) * (margin / 20),
  }));
  return circleTriangleCollision(ball, shrunk[0], shrunk[1], shrunk[2]);
}

/**
 * Circle vs Rectangle collision.
 * @param {Object} ball - { x, y, radius }
 * @param {number} rx - rect left
 * @param {number} ry - rect top
 * @param {number} rw - rect width
 * @param {number} rh - rect height
 * @returns {boolean}
 */
function circleRectCollision(ball, rx, ry, rw, rh) {
  const closestX = clamp(ball.x, rx, rx + rw);
  const closestY = clamp(ball.y, ry, ry + rh);
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  return (dx * dx + dy * dy) < (ball.radius * ball.radius);
}

/**
 * Check spike collision (triangle hitbox with 3px margin).
 * @param {Object} ball
 * @param {Object} spike - { drawPoints: [{x,y},{x,y},{x,y}] }
 * @returns {boolean}
 */
function checkSpikeCollision(ball, spike) {
  if (!spike.drawPoints) return false;
  const pts = spike.drawPoints;
  // Shrink triangle by margin for forgiving hitbox
  const margin = 3;
  const cx = (pts[0].x + pts[1].x + pts[2].x) / 3;
  const cy = (pts[0].y + pts[1].y + pts[2].y) / 3;
  const shrunk = pts.map(p => ({
    x: p.x + (cx - p.x) * (margin / 20),
    y: p.y + (cy - p.y) * (margin / 20),
  }));
  return circleTriangleCollision(ball, shrunk[0], shrunk[1], shrunk[2]);
}

/**
 * Circle vs Triangle collision.
 * @param {Object} ball - { x, y, radius }
 * @param {Object} a - {x,y}
 * @param {Object} b - {x,y}
 * @param {Object} c - {x,y}
 * @returns {boolean}
 */
function circleTriangleCollision(ball, a, b, c) {
  // Check if circle center is inside triangle
  if (pointInTriangle(ball.x, ball.y, a, b, c)) return true;

  // Check if circle intersects any edge
  if (circleLineSegmentIntersect(ball, a, b)) return true;
  if (circleLineSegmentIntersect(ball, b, c)) return true;
  if (circleLineSegmentIntersect(ball, c, a)) return true;

  return false;
}

/**
 * Point in triangle test using barycentric coordinates.
 */
function pointInTriangle(px, py, a, b, c) {
  const d1 = sign(px, py, a.x, a.y, b.x, b.y);
  const d2 = sign(px, py, b.x, b.y, c.x, c.y);
  const d3 = sign(px, py, c.x, c.y, a.x, a.y);
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(hasNeg && hasPos);
}

function sign(px, py, x1, y1, x2, y2) {
  return (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
}

/**
 * Circle vs line segment intersection.
 * @param {Object} ball - { x, y, radius }
 * @param {Object} p1 - {x,y}
 * @param {Object} p2 - {x,y}
 * @returns {boolean}
 */
function circleLineSegmentIntersect(ball, p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const fx = p1.x - ball.x;
  const fy = p1.y - ball.y;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - ball.radius * ball.radius;
  let discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false;
  discriminant = Math.sqrt(discriminant);
  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
}

/**
 * Check elevator collision.
 * Landing on top = ride. Side/bottom = death.
 * @param {Object} ball
 * @param {Object} elev - { drawX, currentY, width, height }
 * @returns {'dead'|'ride'|null}
 */
function checkElevatorCollision(ball, elev) {
  const rx = elev.drawX;
  const ry = elev.currentY;
  const rw = elev.width;
  const rh = elev.height;

  if (!circleRectCollision(ball, rx, ry, rw, rh)) return null;

  // Check if ball is coming from above and hitting the top surface
  const ballBottom = ball.y + ball.radius;
  const prevBottom = ball.y + ball.radius - ball.vy;

  if (ball.vy >= 0 && prevBottom <= ry + 4 && ballBottom >= ry) {
    return 'ride';
  }

  return 'dead';
}

/**
 * Check ramp collision. Returns new vx if bounced, null otherwise.
 * @param {Object} ball
 * @param {Object} ramp - { drawPoints, wall }
 * @returns {number|null}
 */
function checkRampCollision(ball, ramp) {
  if (!ramp.drawPoints) return null;
  const pts = ramp.drawPoints;

  if (circleTriangleCollision(ball, pts[0], pts[1], pts[2])) {
    // Reflect based on which wall the ramp is on
    if (ramp.wall === 'left') {
      return Math.abs(ball.vx) + 2; // Bounce right
    } else {
      return -(Math.abs(ball.vx) + 2); // Bounce left
    }
  }

  return null;
}

/**
 * Check wallgap collision (two bars with a gap).
 * @param {Object} ball
 * @param {Object} wg - { leftBar, rightBar }  - each { x, y, w, h }
 * @returns {boolean}
 */
function checkWallgapCollision(ball, wg) {
  if (wg.leftBar && circleRectCollision(ball, wg.leftBar.x, wg.leftBar.y, wg.leftBar.w, wg.leftBar.h)) {
    return true;
  }
  if (wg.rightBar && circleRectCollision(ball, wg.rightBar.x, wg.rightBar.y, wg.rightBar.w, wg.rightBar.h)) {
    return true;
  }
  return false;
}

/**
 * Check pendulum collision (circle vs circle at spike tip).
 * @param {Object} ball
 * @param {Object} pend - { tipX, tipY }
 * @returns {boolean}
 */
function checkPendulumCollision(ball, pend) {
  if (pend.tipX === undefined) return false;
  const dx = ball.x - pend.tipX;
  const dy = ball.y - pend.tipY;
  const hitRadius = ball.radius + 8; // 8px pendulum spike radius
  return (dx * dx + dy * dy) < (hitRadius * hitRadius);
}

/**
 * Check platform/vanish collision (same as elevator: ride on top, die from sides).
 * @param {Object} ball
 * @param {Object} plat - { drawX, currentY, width, height }
 * @returns {'dead'|'ride'|null}
 */
function checkPlatformCollision(ball, plat) {
  return checkElevatorCollision(ball, plat);
}

/**
 * Check if ball is inside a fan zone.
 * @param {Object} ball
 * @param {Object} fan - { fanX, fanY, fanWidth, fanHeight }
 * @returns {boolean}
 */
function checkFanZone(ball, fan) {
  return ball.x + ball.radius > fan.fanX &&
    ball.x - ball.radius < fan.fanX + fan.fanWidth &&
    ball.y + ball.radius > fan.fanY - fan.fanHeight &&
    ball.y - ball.radius < fan.fanY;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
