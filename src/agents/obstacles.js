/**
 * AGENT 3 — OBSTACLE RENDERER + UPDATER
 * Manages all obstacle types: update positions and draw to canvas.
 * All rendering is solid black (#000), flat geometric shapes.
 *
 * OBSTACLE TYPES:
 *  spike     - Triangle from wall, lethal
 *  blocker   - Moving horizontal bar, lethal, has spike teeth
 *  elevator  - Vertical moving platform, ride on top
 *  ramp      - 45° bounce triangle on wall, non-lethal
 *  wallgap   - Two bars with gap, lethal, spike teeth on edges
 *  pendulum  - Swinging spike on rope, lethal
 *  platform  - Static floor you can stand on, spike teeth underneath
 *  vanish    - Platform that disappears 0.4s after ball lands on it
 *  fan       - Upward wind zone that slows/reverses ball fall
 */

import { CONFIG } from './config.js';

const TL = CONFIG.TUBE_INNER_LEFT;
const TR = CONFIG.TUBE_INNER_RIGHT;
const TW = TR - TL;
const CX = (TL + TR) / 2;

export class ObstacleManager {
  constructor() {
    this.obstacles = [];
  }

  init(configs) {
    this.obstacles = configs.map((cfg, idx) => this.createObstacle(cfg, idx));
  }

  createObstacle(cfg, idx) {
    const base = { ...cfg, id: idx, drawPoints: null };
    switch (cfg.type) {
      case 'spike': return this.initSpike(base);
      case 'blocker': return this.initBlocker(base);
      case 'elevator': return this.initElevator(base);
      case 'ramp': return this.initRamp(base);
      case 'wallgap': return this.initWallgap(base);
      case 'pendulum': return this.initPendulum(base);
      case 'platform': return this.initPlatform(base);
      case 'vanish': return this.initVanish(base);
      case 'fan': return this.initFan(base);
      case 'tube': return this.initTube(base);
      case 'bounce': return this.initBounce(base);
      case 'trampoline': return this.initTrampoline(base);
      case 'magnet': return this.initMagnet(base);
      default: return base;
    }
  }

  // ── INIT ──────────────────────────────────────────────

  initSpike(obs) {
    const depth = obs.depth || 40;
    const spikeH = 44;
    if (obs.wall === 'left' || obs.wall === 'both') {
      obs._leftPoints = [
        { x: TL, y: obs.y - spikeH / 2 },
        { x: TL + depth, y: obs.y },
        { x: TL, y: obs.y + spikeH / 2 },
      ];
      obs.drawPoints = obs._leftPoints.map(p => ({ ...p }));
    }
    if (obs.wall === 'right' || obs.wall === 'both') {
      obs._rightPoints = [
        { x: TR, y: obs.y - spikeH / 2 },
        { x: TR - depth, y: obs.y },
        { x: TR, y: obs.y + spikeH / 2 },
      ];
      if (obs.wall === 'both') {
        obs._rightDrawPoints = obs._rightPoints.map(p => ({ ...p }));
      } else {
        obs.drawPoints = obs._rightPoints.map(p => ({ ...p }));
      }
    }
    return obs;
  }

  initBlocker(obs) {
    const w = obs.width || 100;
    obs.height = 22;
    obs._width = w;
    obs.phase = obs.phase || 0;
    if (obs.gapSide === 'left') obs._baseX = TL + 60;
    else if (obs.gapSide === 'right') obs._baseX = TL;
    else obs._baseX = TL + (TW - w) / 2;
    obs.drawX = obs._baseX;
    obs.drawY = obs.y;
    return obs;
  }

  initElevator(obs) {
    obs.width = obs.width || 100;
    obs.height = 18;
    obs.drawX = (obs.xPos !== undefined) ? obs.xPos : CX - obs.width / 2;
    obs.currentY = obs.y;
    obs.vy = 0;
    return obs;
  }

  initRamp(obs) {
    const size = 50;
    if (obs.wall === 'left') {
      obs.drawPoints = [
        { x: TL, y: obs.y - size / 2 },
        { x: TL + size, y: obs.y + size / 2 },
        { x: TL, y: obs.y + size / 2 },
      ];
    } else {
      obs.drawPoints = [
        { x: TR, y: obs.y - size / 2 },
        { x: TR - size, y: obs.y + size / 2 },
        { x: TR, y: obs.y + size / 2 },
      ];
    }
    return obs;
  }

  initWallgap(obs) {
    obs._gapWidth = obs.gapWidth || 80;
    obs._barH = 22;
    obs._baseGapCenter = this.getGapCenter(obs.gapSide, obs._gapWidth);
    obs.leftBar = null;
    obs.rightBar = null;
    this.updateWallgapBars(obs, obs._baseGapCenter);
    return obs;
  }

  initPendulum(obs) {
    obs._ropeLength = 60;
    obs._anchorX = CX;
    obs._anchorY = obs.y - obs._ropeLength;
    obs._swingRadius = 80;
    obs.phase = obs.phase || 0;
    obs.tipX = CX;
    obs.tipY = obs.y;
    return obs;
  }

  /** PLATFORM — static floor, stand on top, spike teeth underneath */
  initPlatform(obs) {
    const w = obs.width || 120;
    obs.width = w;
    obs.height = 16;
    obs.drawX = (obs.xPos !== undefined) ? obs.xPos : CX - w / 2;
    obs.currentY = obs.y;
    // Horizontal movement
    if (obs.moveRange) {
      obs._moveMin = obs.drawX - obs.moveRange / 2;
      obs._moveMax = obs.drawX + obs.moveRange / 2;
      obs._baseDrawX = obs.drawX;
    }
    return obs;
  }

  /** VANISH — platform that disappears after ball lands */
  initVanish(obs) {
    const w = obs.width || 100;
    obs.width = w;
    obs.height = 14;
    obs.drawX = (obs.xPos !== undefined) ? obs.xPos : CX - w / 2;
    obs.currentY = obs.y;
    obs.visible = true;
    obs.touchTimer = 0; // counts up after ball touches
    obs.vanishDuration = 400; // ms before vanish
    obs.respawnTimer = 0;
    obs.respawnDuration = 2000; // ms before respawn
    return obs;
  }

  /** FAN — low gravity zone, fills entire tube width, slows fall */
  initFan(obs) {
    // Always fill full tube width
    obs.fanWidth = TW;
    obs.fanHeight = obs.fanHeight || 150;
    obs.fanX = TL;
    obs.fanY = obs.y; // bottom of the zone
    // Strength is a gravity multiplier (0.3 = 30% gravity = much slower fall)
    obs.gravityMult = obs.gravityMult || 0.3;
    obs._animPhase = 0;
    return obs;
  }

  /** TUBE — mini tunnel that propels ball from entry to exit point */
  initTube(obs) {
    obs.entryX = obs.entryX !== undefined ? obs.entryX : TL + 20;
    obs.entryY = obs.y;
    obs.exitX = obs.exitX !== undefined ? obs.exitX : TR - 20;
    obs.exitY = obs.exitY !== undefined ? obs.exitY : obs.y + (obs.length || 200);
    obs.tubeWidth = 30;
    obs._animPhase = 0;
    obs.captured = false; // is ball inside?
    return obs;
  }

  /** BOUNCE — zone that reflects ball velocity on contact */
  initBounce(obs) {
    obs.bounceW = obs.width || 60;
    obs.bounceH = obs.height || 20;
    obs.bounceX = obs.xPos !== undefined ? obs.xPos : CX - obs.bounceW / 2;
    obs.bounceY = obs.y;
    obs.bounceFactor = obs.factor || 1.3; // velocity multiplier on bounce
    return obs;
  }

  /** TRAMPOLINE — bouncy surface, each consecutive bounce goes higher */
  initTrampoline(obs) {
    obs.tramW = obs.width || 80;
    obs.tramH = 12;
    obs.tramX = obs.xPos !== undefined ? obs.xPos : CX - obs.tramW / 2;
    obs.tramY = obs.y;
    obs.bounceCount = 0;
    obs._squish = 0; // animation
    return obs;
  }

  /** MAGNET — circular area that slowly attracts ball toward center */
  initMagnet(obs) {
    obs.magX = obs.xPos !== undefined ? obs.xPos : CX;
    obs.magY = obs.y;
    obs.magRadius = obs.radius || 80;
    obs.magStrength = obs.strength || 0.4;
    obs._animPhase = 0;
    return obs;
  }

  // ── HELPERS ───────────────────────────────────────────

  getGapCenter(gapSide, gapW) {
    if (gapSide === 'left') return TL + gapW / 2 + 20;
    if (gapSide === 'right') return TR - gapW / 2 - 20;
    return CX;
  }

  updateWallgapBars(obs, gapCenter) {
    const gapW = obs._gapWidth;
    const barH = obs._barH;
    const gapLeft = gapCenter - gapW / 2;
    const gapRight = gapCenter + gapW / 2;
    const leftBarW = gapLeft - TL;
    obs.leftBar = leftBarW > 0 ? { x: TL, y: obs.y, w: leftBarW, h: barH } : null;
    const rightBarW = TR - gapRight;
    obs.rightBar = rightBarW > 0 ? { x: gapRight, y: obs.y, w: rightBarW, h: barH } : null;
  }

  // ── UPDATE ────────────────────────────────────────────

  update(dt, time) {
    const t = time / 1000;
    for (const obs of this.obstacles) {
      switch (obs.type) {
        case 'blocker': {
          const range = TW - obs._width;
          const offset = Math.sin(t * obs.speed + (obs.phase || 0)) * (range / 2);
          obs.drawX = TL + range / 2 + offset;
          obs.drawY = obs.y;
          break;
        }
        case 'elevator': {
          const min = obs.rangeMin;
          const max = obs.rangeMax;
          const range = max - min;
          const prevY = obs.currentY;
          obs.currentY = min + (Math.sin(t * obs.speed) + 1) / 2 * range;
          obs.vy = obs.currentY - prevY;
          break;
        }
        case 'wallgap': {
          if (obs.movingGap) {
            const moveRange = 40;
            const offset = Math.sin(t * (obs.speed || 1)) * moveRange;
            const gc = Math.max(TL + obs._gapWidth / 2 + 5, Math.min(TR - obs._gapWidth / 2 - 5, obs._baseGapCenter + offset));
            this.updateWallgapBars(obs, gc);
          }
          break;
        }
        case 'pendulum': {
          const swingAngle = Math.sin(t * obs.swingSpeed + (obs.phase || 0)) * (Math.PI / 3);
          obs.tipX = obs._anchorX + Math.sin(swingAngle) * obs._swingRadius;
          obs.tipY = obs._anchorY + Math.cos(swingAngle) * obs._ropeLength;
          break;
        }
        case 'platform': {
          if (obs.moveRange) {
            const offset = Math.sin(t * (obs.speed || 1)) * obs.moveRange / 2;
            obs.drawX = obs._baseDrawX + offset;
          }
          break;
        }
        case 'vanish': {
          if (!obs.visible) {
            obs.respawnTimer += dt;
            if (obs.respawnTimer >= obs.respawnDuration) {
              obs.visible = true;
              obs.touchTimer = 0;
              obs.respawnTimer = 0;
            }
          } else if (obs.touchTimer > 0) {
            obs.touchTimer += dt;
            if (obs.touchTimer >= obs.vanishDuration) {
              obs.visible = false;
              obs.respawnTimer = 0;
            }
          }
          break;
        }
        case 'fan': {
          obs._animPhase = (t * 8) % (Math.PI * 2);
          break;
        }
        case 'tube': {
          obs._animPhase = (t * 6) % 1;
          break;
        }
        case 'trampoline': {
          if (obs._squish > 0) obs._squish *= 0.9;
          break;
        }
        case 'magnet': {
          obs._animPhase = t * 2;
          break;
        }
      }
    }
  }

  getActive(ballY) {
    const margin = 400;
    return this.obstacles.filter(obs => {
      if (obs.type === 'fan') {
        // Fan zone extends from (fanY - fanHeight) to fanY
        const top = obs.fanY - obs.fanHeight;
        const bot = obs.fanY;
        return ballY > top - margin && ballY < bot + margin;
      }
      if (obs.type === 'tube') {
        // Tube spans from entryY to exitY
        const top = Math.min(obs.entryY, obs.exitY);
        const bot = Math.max(obs.entryY, obs.exitY);
        return ballY > top - margin && ballY < bot + margin;
      }
      if (obs.type === 'magnet') {
        // Magnet has a radius of influence
        return Math.abs(obs.magY - ballY) < obs.magRadius + margin;
      }
      const obsY = obs.currentY || obs.y;
      return Math.abs(obsY - ballY) < margin;
    });
  }

  // ── DRAW ──────────────────────────────────────────────

  draw(ctx, cameraY) {
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    for (const obs of this.obstacles) {
      const obsY = obs.currentY || obs.fanY || obs.y;
      const screenY = obsY - cameraY;
      if (screenY < -200 || screenY > CONFIG.CANVAS_HEIGHT + 200) continue;

      switch (obs.type) {
        case 'spike': this.drawSpike(ctx, obs, cameraY); break;
        case 'blocker': this.drawBlocker(ctx, obs, cameraY); break;
        case 'elevator': this.drawElevator(ctx, obs, cameraY); break;
        case 'ramp': this.drawRamp(ctx, obs, cameraY); break;
        case 'wallgap': this.drawWallgap(ctx, obs, cameraY); break;
        case 'pendulum': this.drawPendulum(ctx, obs, cameraY); break;
        case 'platform': this.drawPlatform(ctx, obs, cameraY); break;
        case 'vanish': this.drawVanish(ctx, obs, cameraY); break;
        case 'fan': this.drawFan(ctx, obs, cameraY); break;
        case 'tube': this.drawTube(ctx, obs, cameraY); break;
        case 'bounce': this.drawBounce(ctx, obs, cameraY); break;
        case 'trampoline': this.drawTrampoline(ctx, obs, cameraY); break;
        case 'magnet': this.drawMagnet(ctx, obs, cameraY); break;
      }
    }
  }

  drawSpike(ctx, obs, cam) {
    ctx.fillStyle = '#000000';
    if (obs._leftPoints) {
      obs.drawPoints = obs._leftPoints.map(p => ({ x: p.x, y: p.y }));
      ctx.beginPath();
      ctx.moveTo(obs._leftPoints[0].x, obs._leftPoints[0].y - cam);
      ctx.lineTo(obs._leftPoints[1].x, obs._leftPoints[1].y - cam);
      ctx.lineTo(obs._leftPoints[2].x, obs._leftPoints[2].y - cam);
      ctx.closePath();
      ctx.fill();
    }
    if (obs._rightPoints) {
      if (obs.wall === 'both') {
        obs._rightDrawPoints = obs._rightPoints.map(p => ({ x: p.x, y: p.y }));
      } else {
        obs.drawPoints = obs._rightPoints.map(p => ({ x: p.x, y: p.y }));
      }
      ctx.beginPath();
      ctx.moveTo(obs._rightPoints[0].x, obs._rightPoints[0].y - cam);
      ctx.lineTo(obs._rightPoints[1].x, obs._rightPoints[1].y - cam);
      ctx.lineTo(obs._rightPoints[2].x, obs._rightPoints[2].y - cam);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawBlocker(ctx, obs, cam) {
    ctx.fillStyle = '#000000';
    const x = obs.drawX, y = obs.drawY - cam, w = obs._width, h = obs.height;
    ctx.fillRect(x, y, w, h);
    // Spike teeth on top AND bottom edges
    this.drawSpikeTeeth(ctx, x, y, w, 8, 'up');
    this.drawSpikeTeeth(ctx, x, y + h, w, 8, 'down');
  }

  drawElevator(ctx, obs, cam) {
    ctx.fillStyle = '#000000';
    const x = obs.drawX, y = obs.currentY - cam;
    ctx.fillRect(x, y, obs.width, obs.height);
    // Small teeth on bottom to show it's rideable but dangerous
    this.drawSpikeTeeth(ctx, x, y + obs.height, obs.width, 6, 'down');
  }

  drawRamp(ctx, obs, cam) {
    if (!obs.drawPoints) return;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(obs.drawPoints[0].x, obs.drawPoints[0].y - cam);
    ctx.lineTo(obs.drawPoints[1].x, obs.drawPoints[1].y - cam);
    ctx.lineTo(obs.drawPoints[2].x, obs.drawPoints[2].y - cam);
    ctx.closePath();
    ctx.fill();
  }

  drawWallgap(ctx, obs, cam) {
    ctx.fillStyle = '#000000';
    if (obs.leftBar) {
      const b = obs.leftBar;
      ctx.fillRect(b.x, b.y - cam, b.w, b.h);
      // Teeth on top, bottom, and gap-facing edge
      this.drawSpikeTeeth(ctx, b.x, b.y - cam, b.w, 8, 'up');
      this.drawSpikeTeeth(ctx, b.x, b.y - cam + b.h, b.w, 8, 'down');
      this.drawSpikeTeethVertical(ctx, b.x + b.w, b.y - cam, b.h, 10, 'right');
    }
    if (obs.rightBar) {
      const b = obs.rightBar;
      ctx.fillRect(b.x, b.y - cam, b.w, b.h);
      this.drawSpikeTeeth(ctx, b.x, b.y - cam, b.w, 8, 'up');
      this.drawSpikeTeeth(ctx, b.x, b.y - cam + b.h, b.w, 8, 'down');
      this.drawSpikeTeethVertical(ctx, b.x, b.y - cam, b.h, 10, 'left');
    }
  }

  drawPendulum(ctx, obs, cam) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(obs._anchorX, obs._anchorY - cam);
    ctx.lineTo(obs.tipX, obs.tipY - cam);
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(obs.tipX, obs.tipY - cam, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(obs.tipX - 10, obs.tipY - cam + 7);
    ctx.lineTo(obs.tipX, obs.tipY - cam + 22);
    ctx.lineTo(obs.tipX + 10, obs.tipY - cam + 7);
    ctx.closePath();
    ctx.fill();
  }

  /** PLATFORM — solid bar you can stand on, spike teeth underneath */
  drawPlatform(ctx, obs, cam) {
    ctx.fillStyle = '#000000';
    const x = obs.drawX, y = obs.currentY - cam, w = obs.width, h = obs.height;
    ctx.fillRect(x, y, w, h);
    // Teeth underneath to show danger
    this.drawSpikeTeeth(ctx, x, y + h, w, 10, 'down');
    // Small circle anchors on ends
    ctx.beginPath();
    ctx.arc(x + 6, y + h / 2, 5, 0, Math.PI * 2);
    ctx.arc(x + w - 6, y + h / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  /** VANISH — dashed platform that blinks before disappearing */
  drawVanish(ctx, obs, cam) {
    if (!obs.visible) return;
    const x = obs.drawX, y = obs.currentY - cam, w = obs.width, h = obs.height;
    // Blink when about to vanish
    if (obs.touchTimer > 0) {
      const blink = Math.floor(obs.touchTimer / 60) % 2;
      if (blink) return; // skip drawing = blink effect
    }
    // Dashed appearance
    ctx.fillStyle = '#000000';
    const segW = 12;
    const gap = 4;
    for (let sx = x; sx < x + w; sx += segW + gap) {
      const sw = Math.min(segW, x + w - sx);
      ctx.fillRect(sx, y, sw, h);
    }
    // Small dots on ends
    ctx.beginPath();
    ctx.arc(x + 4, y + h / 2, 3, 0, Math.PI * 2);
    ctx.arc(x + w - 4, y + h / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /** FAN — animated wind zone with wavy lines */
  /** LOW GRAVITY ZONE — same color as tube, subtle chevrons, full width */
  drawFan(ctx, obs, cam) {
    const x = obs.fanX, y = obs.fanY - cam, w = obs.fanWidth, h = obs.fanHeight;
    const top = y - h;
    // Zone background — very slight tint, blends with tube
    ctx.fillStyle = 'rgba(200, 220, 240, 0.25)';
    ctx.fillRect(x, top, w, h);
    // Subtle animated chevrons floating upward
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1.5;
    const phase = obs._animPhase;
    const cols = 4;
    const rows = Math.ceil(h / 30);
    for (let col = 0; col < cols; col++) {
      const cx = x + (col + 0.5) * (w / cols);
      for (let row = 0; row < rows; row++) {
        const baseY = top + row * 30;
        const animOffset = (phase * 5) % 30;
        const cy = baseY - animOffset;
        if (cy < top - 10 || cy > y + 10) continue;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy + 5);
        ctx.lineTo(cx, cy - 3);
        ctx.lineTo(cx + 8, cy + 5);
        ctx.stroke();
      }
    }
  }

  /** TUBE — curved tunnel with animated arrows */
  drawTube(ctx, obs, cam) {
    const ex = obs.entryX, ey = obs.entryY - cam;
    const xx = obs.exitX, xy = obs.exitY - cam;
    // Draw tube body (thick line between entry and exit)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = obs.tubeWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    // Curve through midpoint
    const mx = (ex + xx) / 2 + (xx > ex ? -30 : 30);
    const my = (ey + xy) / 2;
    ctx.quadraticCurveTo(mx, my, xx, xy);
    ctx.stroke();
    // Inner white line (tunnel opening)
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = obs.tubeWidth - 10;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.quadraticCurveTo(mx, my, xx, xy);
    ctx.stroke();
    // Entry/exit circles
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(ex, ey, obs.tubeWidth / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(xx, xy, obs.tubeWidth / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    // Animated arrows inside
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      const t = ((i / steps) + obs._animPhase) % 1;
      const ax = ex + (xx - ex) * t;
      const ay = ey + (xy - ey) * t;
      ctx.beginPath();
      ctx.arc(ax, ay, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineCap = 'butt';
  }

  /** BOUNCE — springy wall that reflects ball */
  drawBounce(ctx, obs, cam) {
    const x = obs.bounceX, y = obs.bounceY - cam, w = obs.bounceW, h = obs.bounceH;
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, w, h);
    // Spring zigzag pattern inside
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const zigCount = 5;
    for (let i = 0; i <= zigCount; i++) {
      const zx = x + 4 + (i / zigCount) * (w - 8);
      const zy = y + (i % 2 === 0 ? 3 : h - 3);
      if (i === 0) ctx.moveTo(zx, zy);
      else ctx.lineTo(zx, zy);
    }
    ctx.stroke();
  }

  /** TRAMPOLINE — stretchy bouncy surface */
  drawTrampoline(ctx, obs, cam) {
    const x = obs.tramX, y = obs.tramY - cam, w = obs.tramW, h = obs.tramH;
    const squish = obs._squish || 0;
    // Draw as curved surface
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Curved top (squish effect)
    ctx.quadraticCurveTo(x + w / 2, y - 6 + squish * 8, x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    // Legs
    ctx.fillRect(x + 4, y + h, 4, 10);
    ctx.fillRect(x + w - 8, y + h, 4, 10);
    // Springs
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const sx = x + 12 + i * ((w - 24) / 2);
      ctx.beginPath();
      ctx.moveTo(sx, y + h);
      ctx.lineTo(sx - 3, y + h + 3);
      ctx.lineTo(sx + 3, y + h + 6);
      ctx.lineTo(sx - 3, y + h + 9);
      ctx.stroke();
    }
  }

  /** MAGNET — circular attraction zone with field lines */
  drawMagnet(ctx, obs, cam) {
    const x = obs.magX, y = obs.magY - cam, r = obs.magRadius;
    // Field lines (rotating)
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1.5;
    const phase = obs._animPhase || 0;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + phase;
      const innerR = r * 0.3;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
      ctx.lineTo(x + Math.cos(angle) * innerR, y + Math.sin(angle) * innerR);
      ctx.stroke();
    }
    // Core
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    // U-magnet shape
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 16, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 16, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  }

  // ── SPIKE TEETH HELPERS ────────────────────────────────

  drawSpikeTeeth(ctx, x, y, w, toothH, dir) {
    const toothW = 12;
    const count = Math.floor(w / toothW);
    if (count < 1) return;
    const sign = dir === 'down' ? 1 : -1;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < count; i++) {
      const tx = x + i * toothW;
      ctx.lineTo(tx + toothW / 2, y + sign * toothH);
      ctx.lineTo(tx + toothW, y);
    }
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();
  }

  drawSpikeTeethVertical(ctx, x, y, h, toothW, dir) {
    const toothH = 12;
    const count = Math.max(1, Math.floor(h / toothH));
    const sign = dir === 'right' ? 1 : -1;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < count; i++) {
      const ty = y + i * toothH;
      ctx.lineTo(x + sign * toothW, ty + toothH / 2);
      ctx.lineTo(x, ty + toothH);
    }
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
  }
}
