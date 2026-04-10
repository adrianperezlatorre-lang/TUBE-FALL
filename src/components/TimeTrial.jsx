/**
 * TimeTrial — Select and play time trial levels.
 * Shows 3 trials with best times, rewards, and doubler status.
 */

import { useState, useEffect } from 'react';
import { Store } from '../agents/store.js';
import { TIME_TRIAL_LEVELS } from '../agents/levels.js';

const TRIAL_NAMES = ['THE GAUNTLET', 'NEEDLE THREAD', 'IMPOSSIBLE DROP'];

/**
 * @param {Object} props
 * @param {Function} props.onPlay - Called with trialId to start playing
 * @param {Function} props.onClose - Close the time trial screen
 */
export default function TimeTrial({ onPlay, onClose }) {
  const [state, setState] = useState(Store.getState());
  const [doublerTime, setDoublerTime] = useState(Store.getDoublerRemaining());

  useEffect(() => {
    const unsub = Store.subscribe((s) => setState({ ...s }));
    const timer = setInterval(() => {
      setDoublerTime(Store.getDoublerRemaining());
    }, 1000);
    return () => { unsub(); clearInterval(timer); };
  }, []);

  const formatTime = (ms) => {
    if (ms <= 0) return null;
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#1a1a2e',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
      color: '#FFF',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '2px solid #333',
      }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px' }}>
          TIME TRIALS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: '#FFD700',
            color: '#000',
            padding: '6px 14px',
            borderRadius: '16px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}>
            ◆ {state.gems}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '2px solid #FFF',
              color: '#FFF',
              fontSize: '18px',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Doubler status */}
      {doublerTime > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '10px',
          backgroundColor: '#FFD700',
          color: '#000',
          fontWeight: 'bold',
          fontSize: '14px',
        }}>
          GEM DOUBLER ACTIVE — {formatTime(doublerTime)} remaining
        </div>
      )}

      {/* Description */}
      <div style={{
        textAlign: 'center',
        padding: '16px 20px',
        fontSize: '13px',
        color: '#888',
        lineHeight: '1.5',
      }}>
        Complete each trial as fast as possible.
        First clear: 50 gems + gem doubler (30 min).
        Earn 1 gem for every second under 10s.
      </div>

      {/* Trial cards */}
      <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {TIME_TRIAL_LEVELS.map((trial, idx) => {
          const best = Store.getTrialBest(trial.id);
          const completed = Store.isTrialCompleted(trial.id);

          return (
            <div
              key={trial.id}
              style={{
                border: `2px solid ${trial.color}`,
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
            >
              {/* Trial number */}
              <div style={{
                width: 50, height: 50,
                backgroundColor: trial.color,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#FFF',
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                  {TRIAL_NAMES[idx]}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  {best !== undefined
                    ? `Best: ${best.toFixed(2)}s`
                    : 'Not completed'
                  }
                  {completed && ' ✓'}
                </div>
              </div>

              {/* Rewards */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {!completed && (
                  <div style={{ fontSize: '11px', color: '#FFD700', marginBottom: '6px' }}>
                    ◆ 50 + doubler
                  </div>
                )}
                <button
                  onClick={() => onPlay(trial.id)}
                  style={{
                    backgroundColor: trial.color,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  {completed ? 'RETRY' : 'PLAY'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{
        textAlign: 'center',
        padding: '14px',
        fontSize: '11px',
        color: '#555',
      }}>
        Survive the gauntlet. Beat the clock.
      </div>
    </div>
  );
}
