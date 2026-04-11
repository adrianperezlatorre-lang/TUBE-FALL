/**
 * AGENT 1 — GAME ENGINE
 * Main game loop, ball physics, camera, state machine.
 */

import { CONFIG, STATE } from './config.js';
import { checkCollisions } from './physics.js';
import { ObstacleManager } from './obstacles.js';
import { getLevel } from './levels.js';
import { AudioSystem } from './audio.js';
import { heldDirection } from '../hooks/useInput.js';
import { ParticleSystem } from './particles.js';

export { CONFIG, STATE };

/**
 * @typedef {Object} Particle
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} life
 * @property {number} size
 */

/**
 * @typedef {Object} Ball
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} radius
 * @property {boolean} alive
 */

/**
 * GameEngine — manages the core game simulation.
 */
export class GameEngine {
  constructor() {
    /** @type {Ball} */
    this.ball = { x: 0, y: 0, vx: 0, vy: 0, radius: CONFIG.BALL_RADIUS, alive: true, rotation: 0 };
    this.cameraY = 0;
    this.state = STATE.LOBBY;
    this.currentLevelId = 1;
    this.level = null;
    this.time = 0;
    this.deathCount = 0;
    this.collectedGems = new Set();
    this.obstacleManager = new ObstacleManager();
    this.trailParticles = new ParticleSystem();

    // Upgrades (set from store before starting)
    this.jumpPower = 1.0;
    this.fallSpeedMultiplier = 1.0;
    this.skinIndex = 0;

    // Death animation
    /** @type {Particle[]} */
    this.particles = [];
    this.deathTimer = 0;

    // Riding elevator
    this.ridingElevator = null;

    // Callbacks
    this._onDeath = null;
    this._onLevelComplete = null;
    this._onGemCollect = null;
  }

  /**
   * Set callbacks for game events.
   * @param {Function} cb
   */
  onDeath(cb) { this._onDeath = cb; }
  onLevelComplete(cb) { this._onLevelComplete = cb; }
  onGemCollect(cb) { this._onGemCollect = cb; }

  /**
   * Apply upgrade values from the store.
   * @param {{ jumpPower: number, fallSpeed: number, skin: number }} upgrades
   */
  applyUpgrades(upgrades) {
    const jumpTiers = [1.0, 1.15, 1.3, 1.5];
    const fallTiers = [1.0, 0.9, 0.8, 0.7];
    this.jumpPower = jumpTiers[upgrades.jumpPower] || 1.0;
    this.fallSpeedMultiplier = fallTiers[upgrades.fallSpeed] || 1.0;
    this.skinIndex = upgrades.skin || 0;
    this.trailParticles.setDesign(upgrades.particleDesign || 0);
  }

  /**
   * Load and start a level.
   * @param {number} levelId
   */
  setLevel(levelId) {
    this.currentLevelId = levelId;
    this.level = getLevel(levelId);
    if (!this.level) return;
    this.reset();
    this.state = STATE.PLAYING;
  }

  /** Reset ball and state for current level (full reset on death). */
  reset() {
    const cx = (CONFIG.TUBE_INNER_LEFT + CONFIG.TUBE_INNER_RIGHT) / 2;
    this.ball.x = cx;
    this.ball.y = 60;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.alive = true;
    this.ball.rotation = 0;
    this.cameraY = 0;
    this.time = 0;
    this.collectedGems = new Set();
    this.particles = [];
    this.deathTimer = 0;
    this.ridingElevator = null;
    if (this.level) {
      this.obstacleManager.init(this.level.obstacles);
    }
  }

  /**
   * Seamless transition to next level — keeps ball momentum.
   * Ball appears at top with same velocity, just new obstacles.
   * @param {number} nextLevelId
   */
  seamlessNextLevel(nextLevelId) {
    const prevVx = this.ball.vx;
    const prevVy = this.ball.vy;
    this.currentLevelId = nextLevelId;
    this.level = getLevel(nextLevelId);
    if (!this.level) return;
    // Keep horizontal velocity, keep downward momentum
    const cx = (CONFIG.TUBE_INNER_LEFT + CONFIG.TUBE_INNER_RIGHT) / 2;
    this.ball.x = cx;
    this.ball.y = 40; // enter from top
    this.ball.vx = prevVx;
    this.ball.vy = Math.max(prevVy, 2); // ensure still falling down
    this.ball.alive = true;
    this.cameraY = 0;
    this.time = 0;
    this.collectedGems = new Set();
    this.particles = [];
    this.deathTimer = 0;
    this.ridingElevator = null;
    this.obstacleManager.init(this.level.obstacles);
    this.state = STATE.PLAYING;
  }

  /**
   * Handle jump input.
   * @param {'left'|'right'} direction
   */
  jump(direction) {
    if (this.state !== STATE.PLAYING || !this.ball.alive) return;
    const sign = direction === 'left' ? -1 : 1;

    if (this.ridingElevator) {
      const plat = this.ridingElevator;
      if (plat.type === 'vanish') {
        // On vanish bar: full jump to escape
        this.ball.vx = sign * CONFIG.JUMP_VX * this.jumpPower;
        this.ball.vy = CONFIG.JUMP_VY * this.jumpPower;
        this.ridingElevator = null;
        AudioSystem.play('JUMP');
      } else {
        // On rolling bar: horizontal roll, tiny hop
        this.ball.vx = sign * CONFIG.JUMP_VX * this.jumpPower * 1.2;
        this.ball.vy = -1.5; // tiny hop to feel responsive
        // Stay on platform if still within bounds next frame
        AudioSystem.play('JUMP');
      }
    } else if (this.isInLowGravity()) {
      // In low gravity zone: gentle nudge (8x less than normal jump)
      this.ball.vx += sign * (CONFIG.JUMP_VX / 8) * this.jumpPower;
      AudioSystem.play('JUMP');
    } else {
      // In the air: normal diagonal jump
      this.ball.vx = sign * CONFIG.JUMP_VX * this.jumpPower;
      this.ball.vy = CONFIG.JUMP_VY * this.jumpPower;
      AudioSystem.play('JUMP');
    }
  }

  /** Check if ball is currently inside a low gravity (fan) zone. */
  isInLowGravity() {
    const ball = this.ball;
    for (const obs of this.obstacleManager.getActive(ball.y)) {
      if (obs.type === 'fan') {
        if (ball.x > obs.fanX && ball.x < obs.fanX + obs.fanWidth &&
            ball.y > obs.fanY - obs.fanHeight && ball.y < obs.fanY) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Main update step, called at fixed timestep.
   * @param {number} dt - delta time in ms
   */
  update(dt) {
    if (this.state === STATE.DEAD) {
      this.deathTimer += dt;
      // Update particles
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= dt;
        p.size *= 0.96;
      }
      if (this.deathTimer >= CONFIG.DEATH_ANIM_DURATION) {
        this.state = STATE.PLAYING;
        this.reset();
        if (this._onDeath) this._onDeath(this.deathCount);
      }
      return;
    }

    if (this.state !== STATE.PLAYING) return;

    this.time += dt;

    const ball = this.ball;
    const level = this.level;
    if (!level) return;

    // Update obstacles
    this.obstacleManager.update(dt, this.time);

    // Check if ball is in a low-gravity zone
    let gravMult = 1.0;
    for (const obs of this.obstacleManager.getActive(ball.y)) {
      if (obs.type === 'fan') {
        const inZone = ball.x > obs.fanX && ball.x < obs.fanX + obs.fanWidth &&
          ball.y > obs.fanY - obs.fanHeight && ball.y < obs.fanY;
        if (inZone) {
          gravMult = obs.gravityMult;
          break;
        }
      }
    }

    // Apply gravity (with fall speed modifier + low gravity zone)
    if (!this.ridingElevator) {
      ball.vy += CONFIG.GRAVITY * this.fallSpeedMultiplier * gravMult;
      const termVel = CONFIG.TERMINAL_VELOCITY * this.fallSpeedMultiplier * gravMult;
      if (ball.vy > termVel) {
        ball.vy = termVel;
      }
    }

    // Move ball
    if (this.ridingElevator) {
      // Rolling on platform
      const elev = this.ridingElevator;
      ball.y = elev.currentY - ball.radius;
      ball.vy = elev.vy || 0;

      // Continuous rolling force while direction is held
      const rollAccel = 0.6;
      if (heldDirection.left) ball.vx -= rollAccel;
      if (heldDirection.right) ball.vx += rollAccel;
      // Cap roll speed
      const maxRoll = 5;
      if (ball.vx > maxRoll) ball.vx = maxRoll;
      if (ball.vx < -maxRoll) ball.vx = -maxRoll;

      ball.x += ball.vx;
      // Rolling rotation based on horizontal movement
      ball.rotation += ball.vx * 0.08;
      // Only apply friction when NOT holding a direction
      if (!heldDirection.left && !heldDirection.right) {
        ball.vx *= 0.88;
        if (Math.abs(ball.vx) < 0.1) ball.vx = 0;
      } else {
        ball.vx *= 0.96; // light drag while rolling
      }
    } else {
      // In low gravity: gentle continuous drift (8x less than normal)
      if (this.isInLowGravity()) {
        const accel = 0.15;
        if (heldDirection.left) ball.vx -= accel;
        if (heldDirection.right) ball.vx += accel;
        const maxSpeed = 2;
        if (ball.vx > maxSpeed) ball.vx = maxSpeed;
        if (ball.vx < -maxSpeed) ball.vx = -maxSpeed;
      }
      ball.x += ball.vx;
      ball.y += ball.vy;
    }

    // Wall bounces
    if (ball.x - ball.radius <= CONFIG.TUBE_INNER_LEFT) {
      ball.x = CONFIG.TUBE_INNER_LEFT + ball.radius;
      ball.vx = Math.abs(ball.vx);
    }
    if (ball.x + ball.radius >= CONFIG.TUBE_INNER_RIGHT) {
      ball.x = CONFIG.TUBE_INNER_RIGHT - ball.radius;
      ball.vx = -Math.abs(ball.vx);
    }

    // Air friction on vx — less friction in low gravity zones
    ball.vx *= this.isInLowGravity() ? 0.995 : 0.98;

    // Update trail particles
    if (ball.alive) {
      this.trailParticles.update(ball.x, ball.y, ball.vx, ball.vy, dt);
    }

    // Collision detection
    const result = checkCollisions(ball, this.obstacleManager.getActive(ball.y), this.level.gemPositions, this.collectedGems);

    if (result.dead) {
      this.die();
      return;
    }

    if (result.rideElevator) {
      this.ridingElevator = result.rideElevator;
      ball.vy = 0;
      AudioSystem.play('LAND_ON_ELEV');
    } else if (this.ridingElevator) {
      const elev = this.ridingElevator;
      // Drop if vanish platform disappeared
      if (elev.type === 'vanish' && !elev.visible) {
        this.ridingElevator = null;
      } else {
        // Check if still on top
        const onTop = Math.abs(ball.y + ball.radius - elev.currentY) < 5 &&
          ball.x + ball.radius > elev.drawX &&
          ball.x - ball.radius < elev.drawX + elev.width;
        if (!onTop) {
          this.ridingElevator = null;
        }
      }
    }

    if (result.rampBounce) {
      ball.vx = result.rampBounce;
    }

    // Low gravity zone — reduce gravity effect this frame
    // (handled below in gravity application)

    // Vanish platform touched — start its timer
    if (result.vanishTouch) {
      result.vanishTouch.touchTimer = 1;
    }

    // Tube transport — teleport ball to exit
    if (result.tubeTransport) {
      ball.x = result.tubeTransport.exitX;
      ball.y = result.tubeTransport.exitY;
      ball.vy = Math.max(ball.vy, 4); // propel downward
      AudioSystem.play('JUMP');
    }

    // Bounce — reverse and amplify velocity
    if (result.bounceEffect) {
      ball.vy = -Math.abs(ball.vy) * result.bounceEffect.factor;
      ball.vx *= -0.8;
      AudioSystem.play('LAND_ON_ELEV');
    }

    // Trampoline — bounce higher each consecutive time
    if (result.trampolineBounce) {
      const tram = result.trampolineBounce;
      tram.bounceCount = Math.min((tram.bounceCount || 0) + 1, 5);
      tram._squish = 1;
      const power = 6 + tram.bounceCount * 2; // 8, 10, 12, 14, 16
      ball.vy = -power;
      this.ridingElevator = null;
      AudioSystem.play('JUMP');
    }

    // Magnet — slowly pull ball toward center
    if (result.magnetPull) {
      ball.vx += result.magnetPull.dx;
      ball.vy += result.magnetPull.dy;
    }

    for (const gemIdx of result.collected) {
      this.collectedGems.add(gemIdx);
      AudioSystem.play('GEM_COLLECT');
      if (this._onGemCollect) this._onGemCollect();
    }

    // Camera follows ball
    this.cameraY = ball.y - CONFIG.CANVAS_HEIGHT * CONFIG.CAMERA_BALL_RATIO;
    if (this.cameraY < 0) this.cameraY = 0;

    // Level complete check
    if (ball.y >= level.height) {
      this.state = STATE.LEVEL_COMPLETE;
      AudioSystem.play('LEVEL_COMPLETE');
      if (this._onLevelComplete) {
        this._onLevelComplete({
          levelId: this.currentLevelId,
          gemsCollected: this.collectedGems.size,
          baseGems: level.gems,
          bonusGems: level.bonusGems,
          deathCount: this.deathCount,
        });
      }
    }
  }

  /** Trigger death state. */
  die() {
    this.ball.alive = false;
    this.state = STATE.DEAD;
    this.deathCount++;
    AudioSystem.play('DEATH');

    // Spawn particles
    this.particles = [];
    for (let i = 0; i < CONFIG.DEATH_PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / CONFIG.DEATH_PARTICLE_COUNT;
      this.particles.push({
        x: this.ball.x,
        y: this.ball.y,
        vx: Math.cos(angle) * (3 + Math.random() * 2),
        vy: Math.sin(angle) * (3 + Math.random() * 2),
        life: CONFIG.DEATH_ANIM_DURATION,
        size: CONFIG.BALL_RADIUS * 0.6,
      });
    }
  }

  /**
   * Draw the entire game frame.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const level = this.level;
    if (!level) return;

    const cam = this.cameraY;
    const w = CONFIG.CANVAS_WIDTH;
    const h = CONFIG.CANVAS_HEIGHT;

    // Clear with level background color
    ctx.fillStyle = level.color;
    ctx.fillRect(0, 0, w, h);

    // Tube interior (white)
    const interiorColor = level.id === 20 ? '#FFFFFF' : '#FFFFFF';
    ctx.fillStyle = interiorColor;
    ctx.fillRect(CONFIG.TUBE_X + CONFIG.WALL_THICKNESS, 0, CONFIG.TUBE_WIDTH - 2 * CONFIG.WALL_THICKNESS, h);

    // Draw obstacles
    this.obstacleManager.draw(ctx, cam);

    // Draw gems
    this.drawGems(ctx, cam);

    // Draw trail particles (behind ball)
    this.trailParticles.draw(ctx, cam);

    // Draw ball or death particles
    if (this.ball.alive && this.state === STATE.PLAYING) {
      this.drawBall(ctx, cam);
    } else if (this.state === STATE.DEAD) {
      this.drawParticles(ctx, cam);
    }

    // Tube walls (on top of everything inside tube)
    ctx.fillStyle = '#000000';
    // Left wall
    ctx.fillRect(CONFIG.TUBE_X, 0, CONFIG.WALL_THICKNESS, h);
    // Right wall
    ctx.fillRect(CONFIG.TUBE_X + CONFIG.TUBE_WIDTH - CONFIG.WALL_THICKNESS, 0, CONFIG.WALL_THICKNESS, h);

    // Exit gate at bottom of level — thick V-shaped opening
    const exitY = level.height - cam;
    if (exitY >= -60 && exitY <= h + 60) {
      const exL = CONFIG.TUBE_INNER_LEFT;
      const exR = CONFIG.TUBE_INNER_RIGHT;
      const exW = exR - exL;
      const exCX = (exL + exR) / 2;
      // Thick black bar with V-notch opening
      ctx.fillStyle = '#000000';
      // Left part of gate
      ctx.fillRect(exL, exitY - 6, exW * 0.3, 12);
      // Right part of gate
      ctx.fillRect(exR - exW * 0.3, exitY - 6, exW * 0.3, 12);
      // V-notch chevrons (white, pointing down) — "exit here" indicator
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const cy = exitY - 40 + i * 14;
        ctx.beginPath();
        ctx.moveTo(exCX - 12, cy);
        ctx.lineTo(exCX, cy + 10);
        ctx.lineTo(exCX + 12, cy);
        ctx.stroke();
      }
    }

    // Center guide line (very subtle)
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    // HUD
    this.drawHUD(ctx);
  }

  /**
   * Draw the ball with current skin.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cam
   */
  drawBall(ctx, cam) {
    const bx = this.ball.x;
    const by = this.ball.y - cam;
    const r = this.ball.radius;
    const rot = this.ball.rotation || 0;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    switch (this.skinIndex) {
      case 0: // Default: white circle with bold black outline
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        // Inner dot (eye) — rotates with ball
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(3, -3, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 1: // Solid black circle
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 2: // Black square
        ctx.fillRect(-r, -r, r * 2, r * 2);
        break;
      case 3: // Black diamond
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();
        break;
      case 4: // Black star
        this.drawStar(ctx, 0, 0, 5, r, r * 0.5);
        ctx.fill();
        break;
      case 5: // Black triangle
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r, r);
        ctx.lineTo(-r, r);
        ctx.closePath();
        ctx.fill();
        break;
      case 6: // 8-Ball
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${r}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('8', 0, 1);
        break;
      case 7: // Pizza
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#F4A460';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.fillStyle = '#C0392B';
        for (const [px, py] of [[-4, -3], [4, 2], [-1, 5]]) {
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 8: // 67
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${r * 0.9}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('67', 0, 1);
        break;
      case 9: // Donut
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#D2691E';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#FF69B4';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        break;
      case 10: // Eye
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.65, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#2C3E50';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        break;
      case 11: // Skull
        ctx.beginPath();
        ctx.arc(0, -1, r - 1, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-4, -3, 3, 0, Math.PI * 2);
        ctx.arc(4, -3, 3, 0, Math.PI * 2);
        ctx.fill();
        for (let tx = -4; tx <= 4; tx += 4) {
          ctx.fillRect(tx - 1, 5, 2, 4);
        }
        break;
      default:
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Draw a star shape.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx
   * @param {number} cy
   * @param {number} spikes
   * @param {number} outerRadius
   * @param {number} innerRadius
   */
  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = -Math.PI / 2;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    for (let i = 0; i < spikes; i++) {
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    }
    ctx.closePath();
  }

  /**
   * Draw death particles.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cam
   */
  drawParticles(ctx, cam) {
    ctx.fillStyle = '#000000';
    for (const p of this.particles) {
      if (p.life > 0 && p.size > 0.5) {
        ctx.fillRect(p.x - p.size / 2, p.y - cam - p.size / 2, p.size, p.size);
      }
    }
  }

  /**
   * Draw gem collectibles.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cam
   */
  drawGems(ctx, cam) {
    if (!this.level) return;
    const gems = this.level.gemPositions;
    const size = CONFIG.GEM_SIZE / 2;

    for (let i = 0; i < gems.length; i++) {
      if (this.collectedGems.has(i)) continue;
      const gx = gems[i].x;
      const gy = gems[i].y - cam;
      if (gy < -20 || gy > CONFIG.CANVAS_HEIGHT + 20) continue;

      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(gx, gy - size);
      ctx.lineTo(gx + size, gy);
      ctx.lineTo(gx, gy + size);
      ctx.lineTo(gx - size, gy);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Draw the HUD overlay (non-scrolling).
   * @param {CanvasRenderingContext2D} ctx
   */
  drawHUD(ctx) {
    if (!this.level) return;

    // Level number pill - top center
    const levelText = this.level.id === 900 ? 'TUTORIAL' : this.level.id === 999 ? 'INFINITY' : this.level.id >= 101 ? `TRIAL ${this.level.id - 100}` : `LEVEL ${this.level.id}`;
    ctx.font = 'bold 16px monospace';
    const textW = ctx.measureText(levelText).width;
    const pillW = textW + 20;
    const pillX = (CONFIG.CANVAS_WIDTH - pillW) / 2;

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(pillX, 10, pillW, 28, 14);
    ctx.fill();
    ctx.fillStyle = this.level.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(levelText, CONFIG.CANVAS_WIDTH / 2, 24);

    // Gem count - top right
    const gemText = `${this.collectedGems.size}`;
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'right';
    ctx.fillText('\u25C6 ' + gemText, CONFIG.CANVAS_WIDTH - 15, 24);

    // Death count - top left
    if (this.deathCount > 0) {
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.fillText('\u2620 ' + this.deathCount, 15, 24);
    }

    ctx.textAlign = 'left';
  }

  /** @returns {{ state: string, ball: Ball, cameraY: number, level: object, deathCount: number, collectedGems: number }} */
  getState() {
    return {
      state: this.state,
      ball: { ...this.ball },
      cameraY: this.cameraY,
      level: this.level,
      deathCount: this.deathCount,
      collectedGems: this.collectedGems.size,
    };
  }
}
