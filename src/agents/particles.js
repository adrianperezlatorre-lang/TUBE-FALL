/**
 * PARTICLE SYSTEM — Visual trail effects for the ball.
 * 10 particle designs, purchasable in shop.
 * Each design defines how particles are spawned and rendered.
 */

import { CONFIG } from './config.js';

/** Particle design definitions */
export const PARTICLE_DESIGNS = [
  { id: 0, name: 'None', cost: 0, desc: 'No particles' },
  { id: 1, name: 'Fire', cost: 30, desc: 'Flames behind the ball', color: '#FF4500' },
  { id: 2, name: 'Ice', cost: 30, desc: 'Frozen crystals', color: '#00CED1' },
  { id: 3, name: 'Stars', cost: 35, desc: 'Twinkling stars', color: '#FFD700' },
  { id: 4, name: 'Smoke', cost: 25, desc: 'Dark smoke trail', color: '#555555' },
  { id: 5, name: 'Bubbles', cost: 40, desc: 'Floating bubbles', color: '#87CEEB' },
  { id: 6, name: 'Electric', cost: 45, desc: 'Lightning sparks', color: '#00FFFF' },
  { id: 7, name: 'Hearts', cost: 35, desc: 'Love trail', color: '#FF69B4' },
  { id: 8, name: 'Confetti', cost: 40, desc: 'Party confetti', color: '#FF6B9D' },
  { id: 9, name: 'Neon', cost: 50, desc: 'Glowing neon trail', color: '#39FF14' },
  { id: 10, name: 'Galaxy', cost: 60, desc: 'Cosmic dust', color: '#9B59B6' },
];

const MAX_PARTICLES = 40;

/**
 * ParticleSystem — manages trail particles for the ball.
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.designId = 0;
    this.spawnTimer = 0;
  }

  /** Set active particle design. */
  setDesign(id) {
    this.designId = id;
    if (id === 0) this.particles = [];
  }

  /**
   * Update: spawn new particles and age existing ones.
   * @param {number} ballX
   * @param {number} ballY
   * @param {number} ballVx
   * @param {number} ballVy
   * @param {number} dt
   */
  update(ballX, ballY, ballVx, ballVy, dt) {
    if (this.designId === 0) return;

    // Spawn particles
    this.spawnTimer += dt;
    const spawnRate = 30; // ms between spawns
    if (this.spawnTimer >= spawnRate) {
      this.spawnTimer = 0;
      if (this.particles.length < MAX_PARTICLES) {
        this.particles.push(this.createParticle(ballX, ballY, ballVx, ballVy));
      }
    }

    // Update existing
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      p.size *= 0.97;
      p.alpha -= 0.02;

      // Design-specific updates
      if (this.designId === 5) p.vy -= 0.05; // bubbles float up
      if (this.designId === 6) { p.vx += (Math.random() - 0.5) * 0.5; p.vy += (Math.random() - 0.5) * 0.5; } // electric jitter

      if (p.life <= 0 || p.alpha <= 0 || p.size < 0.5) {
        this.particles.splice(i, 1);
      }
    }
  }

  /** Create a particle based on current design. */
  createParticle(bx, by, bvx, bvy) {
    const d = this.designId;
    const base = {
      x: bx + (Math.random() - 0.5) * 8,
      y: by + (Math.random() - 0.5) * 8,
      vx: -bvx * 0.1 + (Math.random() - 0.5) * 1.5,
      vy: -bvy * 0.1 + (Math.random() - 0.5) * 1.5,
      size: 3 + Math.random() * 4,
      life: 400 + Math.random() * 200,
      alpha: 0.8,
    };

    // Design-specific spawn
    switch (d) {
      case 1: // Fire — upward, orange/red
        base.vy = -1 - Math.random() * 2;
        base.vx = (Math.random() - 0.5) * 1;
        base.size = 4 + Math.random() * 5;
        break;
      case 2: // Ice — slow, small
        base.size = 2 + Math.random() * 3;
        base.life = 300;
        break;
      case 3: // Stars — slow float
        base.vx = (Math.random() - 0.5) * 0.5;
        base.vy = (Math.random() - 0.5) * 0.5;
        base.size = 2 + Math.random() * 4;
        break;
      case 5: // Bubbles — float up
        base.vy = -0.5 - Math.random();
        base.size = 3 + Math.random() * 5;
        base.life = 600;
        break;
      case 6: // Electric — fast jitter
        base.vx = (Math.random() - 0.5) * 4;
        base.vy = (Math.random() - 0.5) * 4;
        base.size = 1.5 + Math.random() * 2;
        base.life = 200;
        break;
      case 7: // Hearts — slow rise
        base.vy = -0.5 - Math.random() * 0.5;
        base.size = 4 + Math.random() * 3;
        break;
      case 8: // Confetti — random scatter
        base.vx = (Math.random() - 0.5) * 3;
        base.vy = (Math.random() - 0.5) * 3;
        base.size = 2 + Math.random() * 4;
        break;
      case 9: // Neon — tight trail
        base.vx = -bvx * 0.2;
        base.vy = -bvy * 0.2;
        base.size = 3 + Math.random() * 2;
        break;
      case 10: // Galaxy — orbiting
        const angle = Math.random() * Math.PI * 2;
        base.vx = Math.cos(angle) * 1.5;
        base.vy = Math.sin(angle) * 1.5;
        base.size = 1.5 + Math.random() * 3;
        break;
    }

    return base;
  }

  /**
   * Draw all particles.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cameraY
   */
  draw(ctx, cameraY) {
    if (this.designId === 0 || this.particles.length === 0) return;

    const design = PARTICLE_DESIGNS[this.designId];
    const color = design?.color || '#FFF';

    for (const p of this.particles) {
      const sx = p.x;
      const sy = p.y - cameraY;
      if (sy < -20 || sy > CONFIG.CANVAS_HEIGHT + 20) continue;

      ctx.globalAlpha = Math.max(0, p.alpha);

      switch (this.designId) {
        case 1: // Fire — orange/yellow circles
          ctx.fillStyle = Math.random() > 0.3 ? '#FF4500' : '#FFD700';
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 2: // Ice — blue diamonds
          ctx.fillStyle = color;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
          break;

        case 3: // Stars — 4-point stars
          ctx.fillStyle = color;
          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(sx, sy - s);
          ctx.lineTo(sx + s * 0.3, sy);
          ctx.lineTo(sx, sy + s);
          ctx.lineTo(sx - s * 0.3, sy);
          ctx.closePath();
          ctx.fill();
          break;

        case 4: // Smoke — grey circles
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 5: // Bubbles — hollow circles
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          ctx.stroke();
          break;

        case 6: // Electric — bright dots with lines
          ctx.fillStyle = color;
          ctx.fillRect(sx - 1, sy - 1, 2, 2);
          break;

        case 7: // Hearts
          ctx.fillStyle = color;
          ctx.font = `${Math.floor(p.size * 2)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('♥', sx, sy);
          break;

        case 8: // Confetti — colored rectangles
          const colors = ['#FF6B9D', '#FFD700', '#2ECC71', '#3498DB', '#9B59B6'];
          ctx.fillStyle = colors[Math.floor(p.x * 7) % colors.length];
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.life * 0.01);
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
          break;

        case 9: // Neon — glowing circles
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;

        case 10: // Galaxy — purple/blue dots
          ctx.fillStyle = Math.random() > 0.5 ? '#9B59B6' : '#3498DB';
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        default:
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }
}
