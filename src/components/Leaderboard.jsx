/**
 * Leaderboard — Worldwide rankings for gems, timing, and infinity.
 */

import { useState, useEffect } from 'react';
import { getLeaderboard } from '../agents/supabase.js';

const TABS = [
  { key: 'gems', label: 'GEMS', icon: '◆', unit: '', desc: 'Most gems accumulated' },
  { key: 'timing', label: 'TIMING', icon: '⏱', unit: 's', desc: 'Fastest trial time' },
  { key: 'infinity', label: 'INFINITY', icon: '∞', unit: 'm', desc: 'Farthest distance' },
];

export default function Leaderboard({ onClose }) {
  const [tab, setTab] = useState('gems');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(tab, 50).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [tab]);

  const currentTab = TABS.find(t => t.key === tab);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#0a0a1a', zIndex: 50,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'monospace', color: '#FFF',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px', borderBottom: '2px solid #222',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>👑</span>
          <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>LEADERBOARD</span>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: '2px solid #FFF', color: '#FFF',
          fontSize: 16, cursor: 'pointer', width: 34, height: 34,
          borderRadius: '50%', fontWeight: 'bold', fontFamily: 'monospace',
        }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none',
            color: tab === t.key ? '#FFD700' : '#666',
            borderBottom: tab === t.key ? '3px solid #FFD700' : '3px solid transparent',
            fontSize: 13, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <div style={{ textAlign: 'center', padding: '10px', fontSize: 11, color: '#555' }}>
        {currentTab?.desc}
      </div>

      {/* Rankings */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
            No entries yet. Be the first!
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', padding: '10px 8px',
              borderBottom: '1px solid #1a1a2e',
              backgroundColor: idx < 3 ? 'rgba(255,215,0,0.05)' : 'transparent',
            }}>
              {/* Rank */}
              <div style={{
                width: 32, textAlign: 'center', fontWeight: 'bold',
                fontSize: idx < 3 ? 18 : 14,
                color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#555',
              }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
              </div>

              {/* Name */}
              <div style={{ flex: 1, marginLeft: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 'bold' }}>{entry.nickname}</div>
                {entry.username && (
                  <div style={{ fontSize: 10, color: '#555' }}>@{entry.username}</div>
                )}
              </div>

              {/* Score */}
              <div style={{
                fontSize: 16, fontWeight: 'bold',
                color: idx < 3 ? '#FFD700' : '#AAA',
              }}>
                {tab === 'timing' ? `${Number(entry.score).toFixed(2)}s` :
                 tab === 'infinity' ? `${Math.floor(entry.score)}m` :
                 `◆ ${Math.floor(entry.score)}`}
              </div>

              {/* Extra info */}
              {entry.difficulty && (
                <div style={{
                  marginLeft: 8, fontSize: 9, color: '#555',
                  backgroundColor: '#1a1a2e', padding: '2px 6px', borderRadius: 4,
                }}>
                  {entry.difficulty}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
