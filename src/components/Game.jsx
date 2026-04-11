/**
 * AGENT 7 — GAME CANVAS COMPONENT
 * Main gameplay view with canvas rendering, input, and game loop.
 * Includes pause overlay and lobby/pause buttons.
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { GameEngine, CONFIG, STATE } from '../agents/engine.js';
import { Store } from '../agents/store.js';
import { AudioSystem } from '../agents/audio.js';
import { useGameLoop } from '../hooks/useGameLoop.js';
import { useInput } from '../hooks/useInput.js';

/**
 * @param {Object} props
 * @param {number} props.levelId - Level to play
 * @param {Function} props.onLevelComplete - Called when level is beaten
 * @param {Function} props.onExit - Return to lobby
 */
export default function Game({ levelId, onLevelComplete, onExit, onHelp }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Create engine once
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  // Apply upgrades and set level on mount / levelId change
  useEffect(() => {
    const state = Store.getState();
    engine.applyUpgrades(state.upgrades);
    engine.deathCount = 0;
    engine.setLevel(levelId);

    engine.onLevelComplete((result) => {
      const isTimeTrial = result.levelId >= 101;
      if (isTimeTrial) {
        // Time trial: immediately return result, no chaining
        AudioSystem.play('LEVEL_COMPLETE');
        onLevelComplete(result);
        return;
      }
      const isFirstAttempt = result.deathCount === 0;
      const totalGems = result.baseGems + (isFirstAttempt ? result.bonusGems : 0);
      Store.completeLevel(result.levelId, isFirstAttempt, totalGems);
      if (isFirstAttempt) {
        AudioSystem.play('FIRST_ATTEMPT_BONUS');
      }
      // Seamless: load next level directly in engine, no unmount
      const nextId = result.levelId + 1;
      if (nextId <= 20) {
        AudioSystem.play('LEVEL_COMPLETE');
        engine.seamlessNextLevel(nextId);
      } else {
        onLevelComplete(result); // all done, go to lobby
      }
    });

    engine.onDeath(() => {
      Store.recordDeath();
    });
  }, [levelId]);

  // Game loop update — skip when paused
  const update = useCallback((dt) => {
    if (paused) return;
    engine.update(dt);
  }, [engine, paused]);

  // Game loop draw — always draw (shows paused state)
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    engine.draw(ctx);
  }, [engine]);

  useGameLoop(update, draw, true);

  // Input
  const handleJump = useCallback((dir) => {
    if (paused) return;
    AudioSystem.unlock();
    engine.jump(dir);
  }, [engine, paused]);

  const handleMuteToggle = useCallback(() => {
    AudioSystem.toggleMute();
  }, []);

  useInput(canvasRef, handleJump, handleMuteToggle, !paused);

  // Handle keyboard pause (Escape)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setPaused(p => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const containerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    touchAction: 'none',
    position: 'relative',
  }), []);

  const canvasStyle = useMemo(() => ({
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: `${CONFIG.CANVAS_WIDTH} / ${CONFIG.CANVAS_HEIGHT}`,
    imageRendering: 'pixelated',
  }), []);

  return (
    <div style={containerStyle}>
      <canvas
        ref={canvasRef}
        width={CONFIG.CANVAS_WIDTH}
        height={CONFIG.CANVAS_HEIGHT}
        style={canvasStyle}
      />

      {/* Top corner buttons — lobby (left) and pause (right) */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        display: 'flex',
        gap: '8px',
        zIndex: 10,
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onExit(); }}
          style={btnStyle}
          title="Back to lobby"
        >
          ◁
        </button>
      </div>
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 10,
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); setPaused(p => !p); }}
          style={btnStyle}
          title="Pause"
        >
          {paused ? '▶' : '⏸'}
        </button>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          fontFamily: 'monospace',
        }}>
          <div style={{ color: '#FFF', fontSize: '32px', fontWeight: 'bold', marginBottom: '30px' }}>
            PAUSED
          </div>
          <button
            onClick={() => setPaused(false)}
            style={pauseMenuBtn}
          >
            RESUME
          </button>
          <button
            onClick={onExit}
            style={{ ...pauseMenuBtn, marginTop: '12px', backgroundColor: '#333' }}
          >
            LOBBY
          </button>
          {/* Skip level for 250 gems */}
          {levelId <= 20 && (
            <button
              onClick={() => {
                const st = Store.getState();
                if (st.gems >= 250) {
                  Store.collectGems(-250);
                  // Trigger level complete
                  const result = {
                    levelId,
                    gemsCollected: 0,
                    baseGems: 0,
                    bonusGems: 0,
                    deathCount: engine.deathCount,
                  };
                  Store.completeLevel(levelId, false, 0);
                  setPaused(false);
                  onLevelComplete(result);
                }
              }}
              style={{
                ...pauseMenuBtn,
                marginTop: '12px',
                backgroundColor: Store.getState().gems >= 250 ? '#FFD700' : '#555',
                color: '#000',
                opacity: Store.getState().gems >= 250 ? 1 : 0.5,
              }}
            >
              SKIP LEVEL ◆ 250
            </button>
          )}
          {onHelp && (
            <button
              onClick={() => {
                setPaused(false);
                onHelp();
              }}
              style={{ ...pauseMenuBtn, marginTop: '12px', backgroundColor: '#74B9FF', color: '#000' }}
            >
              HELP
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  background: 'rgba(0,0,0,0.5)',
  color: '#FFF',
  border: 'none',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  fontSize: '16px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

const pauseMenuBtn = {
  background: '#FFF',
  color: '#000',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 40px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontFamily: 'monospace',
};
