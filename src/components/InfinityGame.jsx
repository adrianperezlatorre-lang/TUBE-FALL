/**
 * InfinityGame — Endless procedural mode with 10 lives and near-death respawn.
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { GameEngine, CONFIG, STATE } from '../agents/engine.js';
import { Store } from '../agents/store.js';
import { AudioSystem } from '../agents/audio.js';
import { InfinityGenerator } from '../agents/generator.js';
import { useGameLoop } from '../hooks/useGameLoop.js';
import { useInput } from '../hooks/useInput.js';

const MAX_LIVES = 10;
const GENERATE_AHEAD = 1500;
const GEM_MULTIPLIER = { easy: 1, medium: 2, hard: 3 };

export default function InfinityGame({ difficulty, onGameOver, onExit }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const genRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const livesRef = useRef(MAX_LIVES);
  const maxYRef = useRef(0);
  const gemsCollectedRef = useRef(0);
  const gameOverRef = useRef(false);
  const deathYRef = useRef(0);

  if (!engineRef.current) engineRef.current = new GameEngine();
  if (!genRef.current) genRef.current = new InfinityGenerator(difficulty);

  const engine = engineRef.current;
  const gen = genRef.current;

  useEffect(() => {
    const state = Store.getState();
    engine.applyUpgrades(state.upgrades);
    engine.deathCount = 0;
    gameOverRef.current = false;
    livesRef.current = MAX_LIVES;
    maxYRef.current = 0;
    gemsCollectedRef.current = 0;

    // Generate initial obstacles
    gen.generateUpTo(GENERATE_AHEAD);

    // Build a fake infinite level
    const color = difficulty === 'easy' ? '#2ECC71' : difficulty === 'hard' ? '#E74C3C' : '#F39C12';
    engine.level = {
      id: 999, color, height: 999999,
      gems: 0, bonusGems: 0,
      obstacles: gen.getObstacles(),
      gemPositions: gen.getGemPositions(),
    };
    engine.currentLevelId = 999;
    engine.obstacleManager.init(engine.level.obstacles);

    // Place ball
    const cx = (CONFIG.TUBE_INNER_LEFT + CONFIG.TUBE_INNER_RIGHT) / 2;
    engine.ball = { x: cx, y: 60, vx: 0, vy: 0, radius: CONFIG.BALL_RADIUS, alive: true, rotation: 0 };
    engine.cameraY = 0;
    engine.time = 0;
    engine.collectedGems = new Set();
    engine.particles = [];
    engine.deathTimer = 0;
    engine.ridingElevator = null;
    engine.state = STATE.PLAYING;

    // Override the death callback to track lives
    engine.onDeath(() => {
      deathYRef.current = engine.ball.y;
    });

    engine.onGemCollect(() => {
      gemsCollectedRef.current++;
    });

    // Don't let engine auto-complete the level (height is 999999)
    engine.onLevelComplete(() => {});

    setTimeout(() => setLoading(false), 2000);

    return () => { engine.state = STATE.LOBBY; };
  }, [difficulty]);

  const update = useCallback((dt) => {
    if (paused || loading || gameOverRef.current) return;

    // If dead: handle custom respawn near death
    if (engine.state === STATE.DEAD) {
      engine.deathTimer += dt;
      for (const p of engine.particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15;
        p.life -= dt; p.size *= 0.96;
      }
      if (engine.deathTimer >= CONFIG.DEATH_ANIM_DURATION) {
        livesRef.current--;
        if (livesRef.current <= 0) {
          gameOverRef.current = true;
          const mult = GEM_MULTIPLIER[difficulty] || 1;
          const dist = Math.floor(maxYRef.current);
          const gemsEarned = Math.floor(dist / 100) * mult + gemsCollectedRef.current;
          Store.collectGems(gemsEarned);
          onGameOver({ distance: dist, gems: gemsEarned, difficulty });
          return;
        }
        // Respawn exactly where died
        const cx = (CONFIG.TUBE_INNER_LEFT + CONFIG.TUBE_INNER_RIGHT) / 2;
        engine.ball.x = cx;
        engine.ball.y = deathYRef.current;
        engine.ball.vx = 0;
        engine.ball.vy = 0;
        engine.ball.alive = true;
        engine.ball.rotation = 0;
        engine.cameraY = Math.max(0, engine.ball.y - CONFIG.CANVAS_HEIGHT * CONFIG.CAMERA_BALL_RATIO);
        engine.particles = [];
        engine.deathTimer = 0;
        engine.ridingElevator = null;
        engine.state = STATE.PLAYING;
      }
      return;
    }

    if (engine.state !== STATE.PLAYING) return;

    // Generate more obstacles ahead of ball
    gen.generateUpTo(engine.ball.y + GENERATE_AHEAD);
    const newObs = gen.getObstacles();
    if (newObs.length > engine.obstacleManager.obstacles.length) {
      const existing = engine.obstacleManager.obstacles.length;
      for (let i = existing; i < newObs.length; i++) {
        engine.obstacleManager.obstacles.push(
          engine.obstacleManager.createObstacle(newObs[i], i)
        );
      }
      engine.level.gemPositions = gen.getGemPositions();
    }

    // Track distance
    if (engine.ball.y > maxYRef.current) {
      maxYRef.current = engine.ball.y;
    }

    // Run normal engine update
    engine.update(dt);
  }, [engine, gen, paused, loading, difficulty, onGameOver]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (loading) {
      const color = difficulty === 'easy' ? '#2ECC71' : difficulty === 'hard' ? '#E74C3C' : '#F39C12';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GENERATING...', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 15);
      ctx.font = '40px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillText('∞', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 70);
      return;
    }

    engine.draw(ctx);

    // HUD: lives as dots below level pill
    const lv = livesRef.current;
    const dotSize = 6;
    const dotGap = 3;
    const totalDotsW = MAX_LIVES * dotSize + (MAX_LIVES - 1) * dotGap;
    const dotsStartX = (CONFIG.CANVAS_WIDTH - totalDotsW) / 2;
    for (let i = 0; i < MAX_LIVES; i++) {
      ctx.fillStyle = i < lv ? '#FF4444' : 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(dotsStartX + i * (dotSize + dotGap) + dotSize / 2, 42, dotSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distance - bottom center
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(maxYRef.current) + 'm', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 12);
  }, [engine, loading, difficulty]);

  useGameLoop(update, draw, true);

  const handleJump = useCallback((dir) => {
    if (paused || loading || gameOverRef.current) return;
    AudioSystem.unlock();
    engine.jump(dir);
  }, [engine, paused, loading]);

  const handleMuteToggle = useCallback(() => AudioSystem.toggleMute(), []);

  useInput(canvasRef, handleJump, handleMuteToggle, !paused && !loading);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') setPaused(p => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', backgroundColor: '#000', touchAction: 'none', position: 'relative',
    }}>
      <canvas ref={canvasRef} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT}
        style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${CONFIG.CANVAS_WIDTH} / ${CONFIG.CANVAS_HEIGHT}` }}
      />
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
        <button onClick={(e) => { e.stopPropagation(); onExit(); }} style={btnS}>◁</button>
      </div>
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
        <button onClick={(e) => { e.stopPropagation(); setPaused(p => !p); }} style={btnS}>
          {paused ? '▶' : '⏸'}
        </button>
      </div>
      {paused && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 20, fontFamily: 'monospace',
        }}>
          <div style={{ color: '#FFF', fontSize: '32px', fontWeight: 'bold', marginBottom: 30 }}>PAUSED</div>
          <button onClick={() => setPaused(false)} style={menuS}>RESUME</button>
          <button onClick={onExit} style={{ ...menuS, marginTop: 12, backgroundColor: '#333' }}>QUIT</button>
        </div>
      )}
    </div>
  );
}

const btnS = {
  background: 'rgba(0,0,0,0.5)', color: '#FFF', border: 'none',
  borderRadius: '50%', width: 36, height: 36, fontSize: 16,
  cursor: 'pointer', fontFamily: 'monospace',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
};
const menuS = {
  background: '#FFF', color: '#000', border: 'none', borderRadius: 8,
  padding: '12px 40px', fontSize: 16, fontWeight: 'bold',
  cursor: 'pointer', fontFamily: 'monospace',
};
