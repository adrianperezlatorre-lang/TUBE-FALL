/**
 * AGENT 8 — LOBBY COMPONENT
 * Full screen lobby with level list, stats, and shop access.
 */

import { useState, useEffect } from 'react';
import { Store } from '../agents/store.js';
import { LEVELS } from '../agents/levels.js';

/**
 * @param {Object} props
 * @param {Function} props.onPlay - Called with levelId when user taps play
 * @param {Function} props.onOpenShop - Opens shop overlay
 */
export default function Lobby({ onPlay, onOpenShop, onOpenTimeTrial, onOpenInfinity, onOpenLeaderboard, onOpenAccount }) {
  const [state, setState] = useState(Store.getState());

  useEffect(() => {
    return Store.subscribe((s) => setState({ ...s, upgrades: { ...s.upgrades } }));
  }, []);

  const { currentLevel, completedLevels, gems, upgrades } = state;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#F8F8F8',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '2px solid #000',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Account icon */}
          <button onClick={onOpenAccount} style={{
            background: '#EEE', border: 'none', borderRadius: '50%',
            width: 30, height: 30, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>👤</button>
          <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>
            TUBE FALL
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{
            backgroundColor: '#000',
            color: '#FFD700',
            padding: '5px 10px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '12px',
          }}>
            ◆ {gems}
          </div>
          <button
            onClick={onOpenShop}
            style={{
              background: '#000',
              color: '#FFF',
              border: 'none',
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
          >
            SHOP
          </button>
          <button
            onClick={onOpenTimeTrial}
            style={{
              background: '#E74C3C',
              color: '#FFF',
              border: 'none',
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
          >
            TIMING
          </button>
          <button
            onClick={onOpenInfinity}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#FFF',
              border: 'none',
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
          >
            ∞
          </button>
          <button
            onClick={onOpenLeaderboard}
            style={{
              background: '#F39C12',
              color: '#FFF',
              border: 'none',
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
          >
            👑
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '12px 20px',
        borderBottom: '1px solid #DDD',
        fontSize: '12px',
        color: '#666',
        flexShrink: 0,
      }}>
        <span>Jump: {'●'.repeat(upgrades.jumpPower)}{'○'.repeat(3 - upgrades.jumpPower)}</span>
        <span>Speed: {'●'.repeat(upgrades.fallSpeed)}{'○'.repeat(3 - upgrades.fallSpeed)}</span>
        <span>Levels: {completedLevels.length}/50</span>
      </div>

      {/* Level list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        WebkitOverflowScrolling: 'touch',
      }}>
        {LEVELS.map((level) => {
          const completed = completedLevels.includes(level.id);
          const unlocked = level.id <= currentLevel;
          const isNext = level.id === currentLevel && !completed;

          return (
            <div
              key={level.id}
              onClick={() => unlocked && onPlay(level.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                marginBottom: '8px',
                borderRadius: '10px',
                border: isNext ? `3px solid ${level.color}` : '2px solid #E0E0E0',
                backgroundColor: unlocked ? '#FFF' : '#F0F0F0',
                cursor: unlocked ? 'pointer' : 'default',
                opacity: unlocked ? 1 : 0.5,
                transition: 'transform 0.1s',
              }}
            >
              {/* Level color box */}
              <div style={{
                width: 44, height: 44,
                backgroundColor: level.color,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{
                  color: level.id === 20 ? '#FFF' : '#000',
                  fontWeight: 'bold',
                  fontSize: '18px',
                }}>
                  {level.id}
                </span>
              </div>

              {/* Level info */}
              <div style={{ flex: 1, marginLeft: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  LEVEL {level.id}
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                  {completed ? '✓ Completed' : unlocked ? 'Ready to play' : 'Locked'}
                </div>
              </div>

              {/* Gem reward */}
              <div style={{
                fontSize: '13px',
                color: completed ? '#CCC' : '#FFD700',
                fontWeight: 'bold',
              }}>
                ◆ {level.gems + level.bonusGems}
              </div>

              {/* Play button for current level */}
              {isNext && (
                <div style={{
                  marginLeft: '10px',
                  backgroundColor: level.color,
                  color: level.id === 20 ? '#FFF' : '#000',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}>
                  PLAY
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div style={{
        textAlign: 'center',
        padding: '12px',
        fontSize: '12px',
        color: '#AAA',
        borderTop: '1px solid #EEE',
        flexShrink: 0,
      }}>
        tap left / tap right to jump
      </div>
    </div>
  );
}
