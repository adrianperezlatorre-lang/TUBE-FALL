/**
 * Tutorial — Interactive playable tutorial level.
 * Player plays through a simple level while tips appear on screen.
 * Shows once, then never again (stored in localStorage).
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

/** Check if tutorial has been completed before. */
export function isTutorialDone() {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}

/** Tutorial level — easy obstacles with tips at specific Y positions */
const TUTORIAL_LEVEL = {
  id: 900,
  color: '#74B9FF',
  height: 2200,
  gems: 0,
  bonusGems: 0,
  obstacles: [
    // Section 1 (y: 0-400) — just fall, learn controls
    // nothing here, just falling

    // Section 2 (y: 400-700) — first spikes, dodge left/right
    { type: 'spike', y: 500, wall: 'right', depth: 50 },
    { type: 'spike', y: 650, wall: 'left', depth: 50 },

    // Section 3 (y: 800-1100) — platform to land on
    { type: 'platform', y: 900, width: 120 },
    { type: 'spike', y: 1050, wall: 'both', depth: 35 },

    // Section 4 (y: 1100-1500) — vanish platform
    { type: 'spike', y: 1200, wall: 'right', depth: 70 },
    { type: 'vanish', y: 1250, width: 90, xPos: TL + 5 },

    // Section 5 (y: 1500-1800) — gem to collect
    { type: 'spike', y: 1600, wall: 'left', depth: 45 },
    { type: 'spike', y: 1750, wall: 'right', depth: 45 },

    // Section 6 (y: 1800-2200) — final run
    { type: 'platform', y: 1900, width: 100, moveRange: 60, speed: 1.0 },
    { type: 'spike', y: 2050, wall: 'both', depth: 40 },
  ],
  gemPositions: [
    { x: CX, y: 1550 },
    { x: CX - 30, y: 1700 },
    { x: CX + 30, y: 2000 },
  ],
};

/** Tips that appear at specific ball Y positions */
const TIPS = [
  { triggerY: 50,   text: 'TAP LEFT or RIGHT\nto jump!', duration: 3000 },
  { triggerY: 400,  text: 'Avoid the spikes!\nJump to dodge.', duration: 2500 },
  { triggerY: 800,  text: 'Land on platforms\nto roll across.', duration: 2500 },
  { triggerY: 1100, text: 'Dashed bars vanish!\nJump off fast.', duration: 2500 },
  { triggerY: 1450, text: 'Collect gems ◆\nfor upgrades!', duration: 2500 },
  { triggerY: 1850, text: 'Almost there!\nReach the bottom.', duration: 2000 },
];

/**
 * @param {Object} props
 * @param {Function} props.onComplete - Called when tutorial finishes
 */
export default function Tutorial({ onComplete }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [currentTip, setCurrentTip] = useState(null);
  const tipTimerRef = useRef(null);
  const shownTipsRef = useRef(new Set());
  const completedRef = useRef(false);

  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  useEffect(() => {
    engine.jumpPower = 1.0;
    engine.fallSpeedMultiplier = 0.85; // slightly easier
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
        // Brief delay so player sees they finished
        setTimeout(() => onComplete(), 800);
      }
    });

    engine.onDeath(() => {});
    engine.onGemCollect(() => {});

    // Show first tip immediately
    setCurrentTip(TIPS[0].text);
    tipTimerRef.current = setTimeout(() => setCurrentTip(null), TIPS[0].duration);
    shownTipsRef.current.add(0);

    return () => {
      engine.state = STATE.LOBBY;
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    };
  }, [onComplete]);

  const update = useCallback((dt) => {
    if (completedRef.current) return;

    // Check for tip triggers based on ball Y
    const ballY = engine.ball.y;
    for (let i = 0; i < TIPS.length; i++) {
      if (!shownTipsRef.current.has(i) && ballY >= TIPS[i].triggerY) {
        shownTipsRef.current.add(i);
        setCurrentTip(TIPS[i].text);
        if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
        tipTimerRef.current = setTimeout(() => setCurrentTip(null), TIPS[i].duration);
      }
    }

    engine.update(dt);
  }, [engine]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    engine.draw(ctx);

    // Draw "TUTORIAL" label at top
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TUTORIAL', CONFIG.CANVAS_WIDTH / 2, 14);
  }, [engine]);

  useGameLoop(update, draw, true);

  const handleJump = useCallback((dir) => {
    AudioSystem.unlock();
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
      <canvas
        ref={canvasRef}
        width={CONFIG.CANVAS_WIDTH}
        height={CONFIG.CANVAS_HEIGHT}
        style={{
          maxWidth: '100%', maxHeight: '100%',
          aspectRatio: `${CONFIG.CANVAS_WIDTH} / ${CONFIG.CANVAS_HEIGHT}`,
        }}
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

      {/* Tip overlay */}
      {currentTip && (
        <div style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.75)',
          color: '#FFF',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          textAlign: 'center',
          whiteSpace: 'pre-line',
          lineHeight: '1.5',
          pointerEvents: 'none',
          zIndex: 15,
          animation: 'tipFadeIn 0.3s ease-out',
        }}>
          {currentTip}
        </div>
      )}

      {/* Left/Right tap zones indicator (first few seconds) */}
      <style>{`
        @keyframes tipFadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
