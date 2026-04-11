/**
 * App.jsx — Root component.
 * LOBBY → PLAYING (with seamless level chaining)
 * LOBBY → TIME_TRIAL → PLAYING_TRIAL
 */

import { useState, useCallback, useRef } from 'react';
import { usePersistence } from './hooks/usePersistence.js';
import { AudioSystem } from './agents/audio.js';
import { Store } from './agents/store.js';
import { getLevel, getLevelCount } from './agents/levels.js';
import Lobby from './components/Lobby.jsx';
import Shop from './components/Shop.jsx';
import Game from './components/Game.jsx';
import TimeTrial from './components/TimeTrial.jsx';
import InfinityMode from './components/InfinityMode.jsx';
import InfinityGame from './components/InfinityGame.jsx';
import LevelTransition from './components/LevelTransition.jsx';
import Tutorial, { isTutorialDone } from './components/Tutorial.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import Account from './components/Account.jsx';
import ScoreSubmit from './components/ScoreSubmit.jsx';

const VIEW = {
  LOBBY: 'LOBBY',
  TRANSITION: 'TRANSITION',
  PLAYING: 'PLAYING',
  TIME_TRIAL: 'TIME_TRIAL',
  PLAYING_TRIAL: 'PLAYING_TRIAL',
  TRIAL_RESULT: 'TRIAL_RESULT',
  INFINITY_SELECT: 'INFINITY_SELECT',
  INFINITY_PLAYING: 'INFINITY_PLAYING',
  INFINITY_RESULT: 'INFINITY_RESULT',
};

export default function App() {
  const { loaded } = usePersistence();
  const [showTutorial, setShowTutorial] = useState(!isTutorialDone());
  const [view, setView] = useState(VIEW.LOBBY);
  const [shopOpen, setShopOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [transitionColor, setTransitionColor] = useState('#FF6B9D');
  const [transitionNumber, setTransitionNumber] = useState(1);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);
  const [trialResult, setTrialResult] = useState(null);
  const trialStartTime = useRef(0);
  const [infinityDifficulty, setInfinityDifficulty] = useState('medium');
  const [infinityResult, setInfinityResult] = useState(null);
  const [showScoreSubmit, setShowScoreSubmit] = useState(null); // { category, score, options }

  const startLevel = useCallback((levelId) => {
    AudioSystem.unlock();
    const level = getLevel(levelId);
    if (!level) return;
    setCurrentLevelId(levelId);
    setTransitionColor(level.color);
    setTransitionNumber(level.id);
    setView(VIEW.TRANSITION);
    AudioSystem.play('LEVEL_TRANSITION');
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setShowTransitionOverlay(false);
    setView(VIEW.PLAYING);
  }, []);

  const handleLevelComplete = useCallback((result) => {
    // For normal levels, seamless chaining is handled inside Game.jsx/engine
    // This only fires when all 20 levels are done
    setView(VIEW.LOBBY);
  }, []);

  const handleExit = useCallback(() => {
    setView(VIEW.LOBBY);
  }, []);

  // Time trial
  const startTrial = useCallback((trialId) => {
    AudioSystem.unlock();
    setCurrentLevelId(trialId);
    trialStartTime.current = performance.now();
    setView(VIEW.PLAYING_TRIAL);
  }, []);

  const handleTrialComplete = useCallback((result) => {
    const elapsed = (performance.now() - trialStartTime.current) / 1000;
    const reward = Store.completeTimeTrial(result.levelId, elapsed);
    setTrialResult({
      trialId: result.levelId,
      time: elapsed,
      ...reward,
    });
    setView(VIEW.TRIAL_RESULT);
  }, []);

  if (!loaded) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#000', color: '#FFF',
        fontFamily: 'monospace', fontSize: '18px',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      {showTutorial && (
        <Tutorial onComplete={() => setShowTutorial(false)} />
      )}

      {view === VIEW.LOBBY && !showTutorial && (
        <Lobby
          onPlay={startLevel}
          onOpenShop={() => setShopOpen(true)}
          onOpenTimeTrial={() => setView(VIEW.TIME_TRIAL)}
          onOpenInfinity={() => setView(VIEW.INFINITY_SELECT)}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          onOpenAccount={() => setAccountOpen(true)}
          onSubmitGems={(gems) => setShowScoreSubmit({
            category: 'gems',
            score: gems,
            options: {},
          })}
        />
      )}

      {view === VIEW.TRANSITION && (
        <LevelTransition
          color={transitionColor}
          levelNumber={transitionNumber}
          isDeath={false}
          onComplete={handleTransitionComplete}
        />
      )}

      {view === VIEW.PLAYING && (
        <Game
          levelId={currentLevelId}
          onLevelComplete={handleLevelComplete}
          onExit={handleExit}
          onHelp={() => setShowTutorial(true)}
        />
      )}

      {view === VIEW.TIME_TRIAL && (
        <TimeTrial
          onPlay={startTrial}
          onClose={() => setView(VIEW.LOBBY)}
        />
      )}

      {view === VIEW.PLAYING_TRIAL && (
        <Game
          key={`trial-${currentLevelId}`}
          levelId={currentLevelId}
          onLevelComplete={handleTrialComplete}
          onExit={() => setView(VIEW.TIME_TRIAL)}
        />
      )}

      {/* Trial result overlay */}
      {view === VIEW.TRIAL_RESULT && trialResult && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#1a1a2e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          fontFamily: 'monospace',
          color: '#FFF',
        }}>
          <div style={{ fontSize: '18px', color: '#888', marginBottom: '8px' }}>
            {trialResult.isFirstClear ? 'FIRST CLEAR!' : trialResult.isNewBest ? 'NEW BEST!' : 'COMPLETED'}
          </div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
            {trialResult.time.toFixed(2)}s
          </div>
          <div style={{
            fontSize: '22px',
            color: '#FFD700',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}>
            ◆ +{trialResult.gems} gems
          </div>
          {trialResult.isFirstClear && (
            <div style={{
              fontSize: '14px',
              color: '#FFD700',
              backgroundColor: 'rgba(255,215,0,0.15)',
              padding: '8px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              GEM DOUBLER ACTIVATED (30 min)
            </div>
          )}
          <button
            onClick={() => setShowScoreSubmit({
              category: 'timing',
              score: trialResult.time,
              options: { trialId: trialResult.trialId },
            })}
            style={{
              background: '#FFD700', color: '#000', border: 'none', borderRadius: 8,
              padding: '12px 28px', fontSize: 15, fontWeight: 'bold',
              cursor: 'pointer', fontFamily: 'monospace', marginBottom: '12px',
            }}
          >
            👑 SUBMIT SCORE
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                trialStartTime.current = performance.now();
                setView(VIEW.PLAYING_TRIAL);
              }}
              style={{
                background: '#E74C3C',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              RETRY
            </button>
            <button
              onClick={() => setView(VIEW.TIME_TRIAL)}
              style={{
                background: '#333',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              BACK
            </button>
          </div>
        </div>
      )}

      {/* Seamless level transition overlay */}
      {showTransitionOverlay && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: transitionColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          animation: 'fadeOut 0.25s ease-out forwards',
        }}>
          <div style={{
            fontSize: '72px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: '#000',
          }}>
            {transitionNumber}
          </div>
          <style>{`@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }`}</style>
        </div>
      )}

      {/* Infinity mode */}
      {view === VIEW.INFINITY_SELECT && (
        <InfinityMode
          onStart={(diff) => {
            AudioSystem.unlock();
            setInfinityDifficulty(diff);
            setView(VIEW.INFINITY_PLAYING);
          }}
          onClose={() => setView(VIEW.LOBBY)}
        />
      )}

      {view === VIEW.INFINITY_PLAYING && (
        <InfinityGame
          key={`inf-${Date.now()}`}
          difficulty={infinityDifficulty}
          onGameOver={(result) => {
            setInfinityResult(result);
            setView(VIEW.INFINITY_RESULT);
          }}
          onExit={() => setView(VIEW.INFINITY_SELECT)}
        />
      )}

      {/* Infinity result */}
      {view === VIEW.INFINITY_RESULT && infinityResult && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#0d0d1a',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, fontFamily: 'monospace', color: '#FFF',
        }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>GAME OVER</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '6px' }}>
            {infinityResult.distance}m
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            {infinityResult.difficulty.toUpperCase()}
          </div>
          <div style={{ fontSize: '22px', color: '#FFD700', fontWeight: 'bold', marginBottom: '20px' }}>
            ◆ +{infinityResult.gems} gems
          </div>
          <button
            onClick={() => setShowScoreSubmit({
              category: 'infinity',
              score: infinityResult.distance,
              options: { difficulty: infinityResult.difficulty },
            })}
            style={{
              background: '#FFD700', color: '#000', border: 'none', borderRadius: 8,
              padding: '12px 28px', fontSize: 15, fontWeight: 'bold',
              cursor: 'pointer', fontFamily: 'monospace', marginBottom: '12px',
            }}
          >
            👑 SUBMIT SCORE
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setView(VIEW.INFINITY_PLAYING)}
              style={{
                background: '#667eea', color: '#FFF', border: 'none', borderRadius: 8,
                padding: '12px 28px', fontSize: 15, fontWeight: 'bold',
                cursor: 'pointer', fontFamily: 'monospace',
              }}
            >
              RETRY
            </button>
            <button
              onClick={() => setView(VIEW.INFINITY_SELECT)}
              style={{
                background: '#333', color: '#FFF', border: 'none', borderRadius: 8,
                padding: '12px 28px', fontSize: 15, fontWeight: 'bold',
                cursor: 'pointer', fontFamily: 'monospace',
              }}
            >
              BACK
            </button>
          </div>
        </div>
      )}

      {shopOpen && (
        <Shop onClose={() => setShopOpen(false)} />
      )}

      {leaderboardOpen && (
        <Leaderboard onClose={() => setLeaderboardOpen(false)} />
      )}

      {accountOpen && (
        <Account onClose={() => setAccountOpen(false)} />
      )}

      {showScoreSubmit && (
        <ScoreSubmit
          category={showScoreSubmit.category}
          score={showScoreSubmit.score}
          options={showScoreSubmit.options}
          onDone={() => setShowScoreSubmit(null)}
        />
      )}
    </>
  );
}
