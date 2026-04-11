/**
 * Tutorial — Interactive playable tutorial level.
 * Ball freezes when a tip appears. Player taps to dismiss tip and resume.
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { GameEngine, CONFIG, STATE } from '../agents/engine.js';
import { AudioSystem } from '../agents/audio.js';
import { useGameLoop } from '../hooks/useGameLoop.js';
import { useInput } from '../hooks/useInput.js';

const STORAGE_KEY = 'tubeFall_tutorialDone';

const TL = CONFIG.TUBE_INNER_LEFT;
const TR = CONFIG.TUBE_INNER_RIGHT;
const CX = (TL + TR) / 2;

export function isTutorialDone() {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}

const TUTORIAL_LEVEL = {
  id: 900, color: '#74B9FF', height: 2200, gems: 0, bonusGems: 0,
  obstacles: [
    { type: 'spike', y: 500, wall: 'right', depth: 50 },
    { type: 'spike', y: 650, wall: 'left', depth: 50 },
    { type: 'platform', y: 900, width: 120 },
    { type: 'spike', y: 1050, wall: 'both', depth: 35 },
    { type: 'spike', y: 1200, wall: 'right', depth: 70 },
    { type: 'vanish', y: 1250, width: 90, xPos: TL + 5 },
    { type: 'spike', y: 1600, wall: 'left', depth: 45 },
    { type: 'spike', y: 1750, wall: 'right', depth: 45 },
    { type: 'platform', y: 1900, width: 100, moveRange: 60, speed: 1.0 },
    { type: 'spike', y: 2050, wall: 'both', depth: 40 },
  ],
  gemPositions: [
    { x: CX, y: 1550 },
    { x: CX - 30, y: 1700 },
    { x: CX + 30, y: 2000 },
  ],
};

const TIPS = [
  { triggerY: 50,   text: 'TAP LEFT or RIGHT\nto jump!' },
  { triggerY: 400,  text: 'Avoid the spikes!\nJump to dodge.' },
  { triggerY: 800,  text: 'Land on platforms\nto roll across.' },
  { triggerY: 1100, text: 'Dashed bars vanish!\nJump off fast.' },
  { triggerY: 1450, text: 'Collect gems ◆\nfor upgrades!' },
  { triggerY: 1850, text: 'Almost there!\nReach the bottom.' },
];

export default function Tutorial({ onComplete }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [currentTip, setCurrentTip] = useState(null);
  const shownTipsRef = useRef(new Set());
  const completedRef = useRef(false);
  const frozenRef = useRef(false);

  if (!engineRef.current) engineRef.current = new GameEngine();
  const engine = engineRef.current;

  useEffect(() => {
    engine.jumpPower = 1.0;
    engine.fallSpeedMultiplier = 0.85;
    engine.skinIndex = 0;
    engine.level = TUTORIAL_LEVEL;
    engine.currentLevelId = 900;
    engine.deathCount = 0;
    const cx = (CONFIG.TUBE_INNER_LEFT + CONFIG.TUBE_INNER_RIGHT) / 2;
    engine.ball = { x: cx, y: 60, vx: 0, vy: 0, radius: CONFIG.BALL_RADIUS, alive: true, rotation: 0 };
    engine.cameraY = 0;
    engine.time = 0;
    engine.collectedGems = new Set();
    engine.particles = [];
    engine.deathTimer = 0;
    engine.ridingElevator = null;
    engine.obstacleManager.init(TUTORIAL_LEVEL.obstacles);
    engine.state = STATE.PLAYING;

    engine.onLevelComplete(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
        setTimeout(() => onComplete(), 800);
      }
    });
    engine.onDeath(() => {});
    engine.onGemCollect(() => {});

    // First tip: freeze immediately
    frozenRef.current = true;
    setCurrentTip(TIPS[0].text);
    shownTipsRef.current.add(0);

    return () => { engine.state = STATE.LOBBY; };
  }, [onComplete]);

  const update = useCallback((dt) => {
    if (completedRef.current || frozenRef.current) return;

    // Check for tip triggers
    const ballY = engine.ball.y;
    for (let i = 0; i < TIPS.length; i++) {
      if (!shownTipsRef.current.has(i) && ballY >= TIPS[i].triggerY) {
        shownTipsRef.current.add(i);
        setCurrentTip(TIPS[i].text);
        // Freeze the ball
        frozenRef.current = true;
        engine.ball.vx = 0;
        engine.ball.vy = 0;
        return; // stop updating this frame
      }
    }

    engine.update(dt);
  }, [engine]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    engine.draw(ctx);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TUTORIAL', CONFIG.CANVAS_WIDTH / 2, 14);
  }, [engine]);

  useGameLoop(update, draw, true);

  // When frozen with a tip: any tap/key dismisses the tip and resumes
  const handleJump = useCallback((dir) => {
    AudioSystem.unlock();
    if (frozenRef.current) {
      // Dismiss tip and resume
      frozenRef.current = false;
      setCurrentTip(null);
      return;
    }
    engine.jump(dir);
  }, [engine]);

  const handleMuteToggle = useCallback(() => AudioSystem.toggleMute(), []);
  useInput(canvasRef, handleJump, handleMuteToggle, true);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#000', touchAction: 'none', position: 'relative',
    }}>
      <canvas ref={canvasRef} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT}
        style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${CONFIG.CANVAS_WIDTH} / ${CONFIG.CANVAS_HEIGHT}` }}
      />

      {/* Skip button */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
        <button
          onClick={() => {
            try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
            onComplete();
          }}
          style={{
            background: 'rgba(0,0,0,0.4)', color: '#FFF', border: 'none',
            borderRadius: 6, padding: '6px 12px', fontSize: 11,
            cursor: 'pointer', fontFamily: 'monospace',
          }}
        >
          SKIP
        </button>
      </div>

      {/* Tip overlay — ball is frozen, tap anywhere to continue */}
      {currentTip && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.35)',
          zIndex: 15,
          pointerEvents: 'none',
        }}>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: '#FFF',
            padding: '20px 30px',
            borderRadius: '14px',
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            lineHeight: '1.5',
          }}>
            {currentTip}
          </div>
          <div style={{
            marginTop: '16px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            animation: 'pulse 1.5s infinite',
          }}>
            TAP TO CONTINUE
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
