/**
 * InfinityMode — Difficulty selection for procedural endless mode.
 */

import { useState } from 'react';

const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'EASY',
    color: '#2ECC71',
    desc: 'Wider gaps, slower obstacles. Good for warming up.',
    gemMult: '1x',
  },
  {
    key: 'medium',
    label: 'MEDIUM',
    color: '#F39C12',
    desc: 'Tighter paths, faster blockers. The real challenge.',
    gemMult: '2x',
  },
  {
    key: 'hard',
    label: 'HARD',
    color: '#E74C3C',
    desc: 'Razor-thin gaps, max speed. Only the best survive.',
    gemMult: '3x',
  },
];

/**
 * @param {Object} props
 * @param {Function} props.onStart - Called with difficulty key ('easy'|'medium'|'hard')
 * @param {Function} props.onClose
 */
export default function InfinityMode({ onStart, onClose }) {
  const [selected, setSelected] = useState('medium');

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#0d0d1a',
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
        borderBottom: '2px solid #222',
      }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '3px' }}>
          INFINITY
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

      {/* Infinity symbol */}
      <div style={{
        textAlign: 'center',
        padding: '30px 0 10px',
        fontSize: '60px',
        opacity: 0.15,
      }}>
        ∞
      </div>

      {/* Description */}
      <div style={{
        textAlign: 'center',
        padding: '0 24px 24px',
        fontSize: '13px',
        color: '#666',
        lineHeight: '1.5',
      }}>
        Procedurally generated endless tube.
        10 lives. Respawn where you died.
        Gems based on distance + difficulty.
      </div>

      {/* Difficulty cards */}
      <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {DIFFICULTIES.map((diff) => (
          <div
            key={diff.key}
            onClick={() => setSelected(diff.key)}
            style={{
              border: `2px solid ${selected === diff.key ? diff.color : '#333'}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              backgroundColor: selected === diff.key ? `${diff.color}15` : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: diff.color,
              }}>
                {diff.label}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#888',
                backgroundColor: '#1a1a2e',
                padding: '3px 10px',
                borderRadius: '10px',
              }}>
                Gems {diff.gemMult}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#777', marginTop: '6px' }}>
              {diff.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Start button */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <button
          onClick={() => onStart(selected)}
          style={{
            backgroundColor: DIFFICULTIES.find(d => d.key === selected)?.color || '#FFF',
            color: '#FFF',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 60px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'monospace',
            letterSpacing: '2px',
          }}
        >
          START
        </button>
      </div>
    </div>
  );
}
