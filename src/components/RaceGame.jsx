/**
 * RaceGame — Race mode with finish line, ball recording, and ghost ball playback.
 * Based on InfinityGame but with a fixed height and ghost system.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { GameEngine, CONFIG, STATE } from '../agents/engine.js';
import { Store } from '../agents/store.js';
import { AudioSystem } from '../agents/audio.js';
import { generateRaceMap } from '../agents/raceGenerator.js';
import { submitRaceRun, getRaceRuns, getRaceMap, sendRaceInvite, getFriends } from '../agents/supabase.js';
import { useGameLoop } from '../hooks/useGameLoop.js';
import { useInput } from '../hooks/useInput.js';

const ALL_ICONS = ['👤', '🎮', '🔥', '⭐', '💀', '🎯', '🌈', '👑', '🤖', '💎'];
const RECORD_INTERVAL = 3; // Record every 3 frames
const MAX_LIVES = 5;

export default function RaceGame({ raceMapId, onExit }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [finishTime, setFinishTime] = useState(0);
  const [ghostRuns, setGhostRuns] = useState([]);
  const [friends, setFriends] = useState([]);
  const [inviteSent, setInviteSent] = useState(false);
  const [raceData, setRaceData] = useState(null);
  const livesRef = useRef(MAX_LIVES);
  const deathYRef = useRef(0);
  const gameOverRef = useRef(false);
  const startTimeRef = useRef(0);
  const recordingRef = useRef([]); // [{x, y, frame}]
  const frameRef = useRef(0);
  const ghostFrameRef = useRef(0);
  const mapHeightRef = useRef(6000);

  if (!engineRef.current) engineRef.current = new GameEngine();
  const engine = engineRef.current;

  useEffect(() => {
    let cancelled = false;
    async function init() {
      // Load race map info
      const mapData = await getRaceMap(raceMapId);
      if (!mapData || cancelled) return;
      setRaceData(mapData);

      // Load ghost runs from friends
      const runs = await getRaceRuns(raceMapId);
      if (!cancelled) setGhostRuns(runs);

      // Load friends for invite
      const f = await getFriends();
      if (!cancelled) setFriends(f);

      // Generate the same map from seed
      const { obstacles, gemPositions, height } = generateRaceMap(mapData.seed, mapData.difficulty);
      mapHeightRef.current = height;

      // Setup engine
      const state = Store.getState();
      engine.applyUpgrades(state.upgrades);
      engine.deathCount = 0;
      gameOverRef.current = false;
      livesRef.current = MAX_LIVES;
      recordingRef.current = [];
      frameRef.current = 0;
      ghostFrameRef.current = 0;

      const color = mapData.difficulty === 'easy' ? '#2ECC71' : mapData.difficulty === 'hard' ? '#E74C3C' : '#F39C12';
      engine.level = {
        id: 998, color, height,
        gems: 0, bonusGems: 0,
        obstacles,
        gemPositions,
      };
      engine.currentLevelId = 998;
      engine.obstacleManager.init(engine.level.obstacles);

      const cx = (CONFIG.TUBE_INNER_LEFT + CONFIG.TUBE_INNER_RIGHT) / 2;
      engine.ball = { x: cx, y: 60, vx: 0, vy: 0, radius: CONFIG.BALL_RADIUS, alive: true, rotation: 0 };
      engine.cameraY = 0;
      engine.time = 0;
      engine.collectedGems = new Set();
      engine.particles = [];
      engine.deathTimer = 0;
      engine.ridingElevator = null;
      engine.state = STATE.PLAYING;

      engine.onDeath(() => { deathYRef.current = engine.ball.y; });
      engine.onGemCollect(() => {});
      engine.onLevelComplete(() => {});

      startTimeRef.current = performance.now();
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; engine.state = STATE.LOBBY; };
  }, [raceMapId]);

  const handleFinish = useCallback(async () => {
    if (finished) return;
    const timeMs = Math.floor(performance.now() - startTimeRef.current);
    setFinishTime(timeMs);
    setFinished(true);
    gameOverRef.current = true;

    // Downsample recording for storage (keep every 3rd frame already recorded)
    const recording = recordingRef.current;
    await submitRaceRun(raceMapId, timeMs, recording);

    // Reload runs to see updated leaderboard
    const runs = await getRaceRuns(raceMapId);
    setGhostRuns(runs);
  }, [raceMapId, finished]);

  const update = useCallback((dt) => {
    if (paused || loading || gameOverRef.current) return;

    // Check finish line
    if (engine.ball.y >= mapHeightRef.current - 100) {
      handleFinish();
      return;
    }

    // Death handling (same as InfinityGame)
    if (engine.state === STATE.DEAD && engine.deathTimer === 0) {
      deathYRef.current = engine.ball.y;
    }
    const wasDead = engine.state === STATE.DEAD;
    const wasNearEnd = wasDead && engine.deathTimer + dt >= CONFIG.DEATH_ANIM_DURATION;

    engine.update(dt);

    if (wasDead && wasNearEnd && engine.state === STATE.PLAYING) {
      livesRef.current--;
      if (livesRef.current <= 0) {
        gameOverRef.current = true;
        setFinished(true);
        setFinishTime(-1); // DNF
        return;
      }
      const cx = (CONFIG.TUBE_INNER_LEFT + CONFIG.TUBE_INNER_RIGHT) / 2;
      engine.ball.x = cx;
      engine.ball.y = deathYRef.current;
      engine.ball.vx = 0;
      engine.ball.vy = 0;
      engine.ball.rotation = 0;
      engine.cameraY = Math.max(0, engine.ball.y - CONFIG.CANVAS_HEIGHT * CONFIG.CAMERA_BALL_RATIO);
      engine.ridingElevator = null;
      return;
    }

    if (engine.state === STATE.DEAD) return;
    if (engine.state !== STATE.PLAYING) return;

    // Record ball position
    frameRef.current++;
    if (frameRef.current % RECORD_INTERVAL === 0) {
      recordingRef.current.push({
        x: Math.round(engine.ball.x),
        y: Math.round(engine.ball.y),
        f: frameRef.current,
      });
    }

    // Advance ghost playback frame
    ghostFrameRef.current++;
  }, [engine, paused, loading, handleFinish]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (loading) {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LOADING RACE...', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
      return;
    }

    engine.draw(ctx);

    // Draw finish line
    const finishY = mapHeightRef.current - 100 - engine.cameraY;
    if (finishY > -20 && finishY < CONFIG.CANVAS_HEIGHT + 20) {
      // Checkered pattern
      const squareSize = 12;
      const numSquares = Math.ceil(CONFIG.CANVAS_WIDTH / squareSize);
      for (let i = 0; i < numSquares; i++) {
        for (let row = 0; row < 2; row++) {
          ctx.fillStyle = (i + row) % 2 === 0 ? '#FFF' : '#000';
          ctx.fillRect(i * squareSize, finishY + row * squareSize, squareSize, squareSize);
        }
      }
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FINISH', CONFIG.CANVAS_WIDTH / 2, finishY - 6);
    }

    // Draw ghost balls
    const gf = ghostFrameRef.current;
    for (const run of ghostRuns) {
      if (!run.ball_recording || run.ball_recording.length === 0) continue;
      // Find the closest recorded frame
      let closest = run.ball_recording[0];
      for (const pt of run.ball_recording) {
        if (pt.f <= gf) closest = pt;
        else break;
      }
      // Draw ghost ball
      const ghostScreenY = closest.y - engine.cameraY;
      if (ghostScreenY < -30 || ghostScreenY > CONFIG.CANVAS_HEIGHT + 30) continue;

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#AAA';
      ctx.beginPath();
      ctx.arc(closest.x, ghostScreenY, CONFIG.BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw icon above ghost
      ctx.globalAlpha = 0.7;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = ALL_ICONS[run.icon_index] || '👤';
      ctx.fillText(icon, closest.x, ghostScreenY - CONFIG.BALL_RADIUS - 10);
      ctx.globalAlpha = 1.0;

      // Username below
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '8px monospace';
      ctx.fillText(run.username, closest.x, ghostScreenY + CONFIG.BALL_RADIUS + 10);
    }

    // HUD: lives
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

    // Timer
    if (!gameOverRef.current) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(elapsed.toFixed(1) + 's', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 14);
    }

    // Progress bar (how far to finish)
    const progress = Math.min(1, engine.ball.y / mapHeightRef.current);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 12, 55, 6, CONFIG.CANVAS_HEIGHT - 80);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 12, 55, 6, (CONFIG.CANVAS_HEIGHT - 80) * progress);
  }, [engine, loading, ghostRuns]);

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

  // Finished overlay
  if (finished) {
    const dnf = finishTime < 0;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#0d0d1a',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, fontFamily: 'monospace', color: '#FFF',
      }}>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
          {dnf ? 'DID NOT FINISH' : 'RACE COMPLETE!'}
        </div>
        {!dnf && (
          <div style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 6, color: '#FFD700' }}>
            {(finishTime / 1000).toFixed(2)}s
          </div>
        )}
        {dnf && (
          <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 6, color: '#E74C3C' }}>DNF</div>
        )}

        {/* Leaderboard */}
        <div style={{ marginTop: 16, marginBottom: 16, width: '80%', maxWidth: 300 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8, textAlign: 'center' }}>RACE TIMES</div>
          {ghostRuns.slice(0, 10).map((run, i) => (
            <div key={run.id} style={{
              display: 'flex', justifyContent: 'space-between', padding: '6px 10px',
              backgroundColor: i % 2 === 0 ? '#1a1a2e' : '#111',
              borderRadius: 4, marginBottom: 2, fontSize: 12,
            }}>
              <span>{ALL_ICONS[run.icon_index] || '👤'} @{run.username}</span>
              <span style={{ color: '#FFD700' }}>{(run.time_ms / 1000).toFixed(2)}s</span>
            </div>
          ))}
        </div>

        {/* Invite friends */}
        {friends.length > 0 && !inviteSent && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6, textAlign: 'center' }}>
              CHALLENGE A FRIEND
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {friends.slice(0, 6).map(f => (
                <button
                  key={f.id}
                  onClick={async () => {
                    await sendRaceInvite(raceMapId, f.id);
                    setInviteSent(true);
                  }}
                  style={{
                    padding: '5px 10px', backgroundColor: '#667eea', color: '#FFF',
                    border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 'bold',
                    cursor: 'pointer', fontFamily: 'monospace',
                  }}
                >
                  @{f.username}
                </button>
              ))}
            </div>
          </div>
        )}
        {inviteSent && (
          <div style={{ fontSize: 11, color: '#2ECC71', marginBottom: 16 }}>Invite sent!</div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => {
              setFinished(false);
              setFinishTime(0);
              gameOverRef.current = false;
              livesRef.current = MAX_LIVES;
              recordingRef.current = [];
              frameRef.current = 0;
              ghostFrameRef.current = 0;
              startTimeRef.current = performance.now();
              const cx = (CONFIG.TUBE_INNER_LEFT + CONFIG.TUBE_INNER_RIGHT) / 2;
              engine.ball = { x: cx, y: 60, vx: 0, vy: 0, radius: CONFIG.BALL_RADIUS, alive: true, rotation: 0 };
              engine.cameraY = 0;
              engine.time = 0;
              engine.collectedGems = new Set();
              engine.particles = [];
              engine.deathTimer = 0;
              engine.ridingElevator = null;
              engine.state = STATE.PLAYING;
            }}
            style={{
              background: '#667eea', color: '#FFF', border: 'none', borderRadius: 8,
              padding: '12px 28px', fontSize: 15, fontWeight: 'bold',
              cursor: 'pointer', fontFamily: 'monospace',
            }}
          >
            RETRY
          </button>
          <button onClick={onExit} style={{
            background: '#333', color: '#FFF', border: 'none', borderRadius: 8,
            padding: '12px 28px', fontSize: 15, fontWeight: 'bold',
            cursor: 'pointer', fontFamily: 'monospace',
          }}>
            BACK
          </button>
        </div>
      </div>
    );
  }

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
      {/* Race label */}
      <div style={{
        position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, backgroundColor: 'rgba(102,126,234,0.8)', color: '#FFF',
        padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 'bold',
        fontFamily: 'monospace',
      }}>
        RACE
      </div>
      {paused && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 20, fontFamily: 'monospace',
        }}>
          <div style={{ color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 30 }}>PAUSED</div>
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
