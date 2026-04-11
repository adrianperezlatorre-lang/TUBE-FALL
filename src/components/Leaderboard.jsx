/**
 * Leaderboard — Worldwide rankings for gems, timing, and infinity.
 * Timing has sub-tabs per trial (1/2/3), Infinity has sub-tabs per difficulty.
 */

import { useState, useEffect } from 'react';
import { getLeaderboard } from '../agents/supabase.js';

const TABS = [
  { key: 'gems', label: 'GEMS', icon: '◆', desc: 'Most gems accumulated' },
  { key: 'timing', label: 'TIMING', icon: '⏱', desc: 'Fastest trial time' },
  { key: 'infinity', label: 'INFINITY', icon: '∞', desc: 'Farthest distance' },
];

const TRIAL_SUBS = [
  { key: 101, label: 'TRIAL 1' },
  { key: 102, label: 'TRIAL 2' },
  { key: 103, label: 'TRIAL 3' },
];

const DIFF_SUBS = [
  { key: 'easy', label: 'EASY' },
  { key: 'medium', label: 'MEDIUM' },
  { key: 'hard', label: 'HARD' },
];

export default function Leaderboard({ onClose }) {
  const [tab, setTab] = useState('gems');
  const [trialSub, setTrialSub] = useState(101);
  const [diffSub, setDiffSub] = useState('medium');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filters = {};
    if (tab === 'timing') filters.trialId = trialSub;
    if (tab === 'infinity') filters.difficulty = diffSub;

    getLeaderboard(tab, 50, filters).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [tab, trialSub, diffSub]);

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

      {/* Main Tabs */}
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

      {/* Sub-tabs for Timing */}
      {tab === 'timing' && (
        <div style={{ display: 'flex', borderBottom: '1px solid #1a1a2e', backgroundColor: '#0d0d18' }}>
          {TRIAL_SUBS.map(s => (
            <button key={s.key} onClick={() => setTrialSub(s.key)} style={{
              flex: 1, padding: '8px 0', background: 'none', border: 'none',
              color: trialSub === s.key ? '#E74C3C' : '#555',
              borderBottom: trialSub === s.key ? '2px solid #E74C3C' : '2px solid transparent',
              fontSize: 11, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace',
            }}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-tabs for Infinity */}
      {tab === 'infinity' && (
        <div style={{ display: 'flex', borderBottom: '1px solid #1a1a2e', backgroundColor: '#0d0d18' }}>
          {DIFF_SUBS.map(s => (
            <button key={s.key} onClick={() => setDiffSub(s.key)} style={{
              flex: 1, padding: '8px 0', background: 'none', border: 'none',
              color: diffSub === s.key ? '#667eea' : '#555',
              borderBottom: diffSub === s.key ? '2px solid #667eea' : '2px solid transparent',
              fontSize: 11, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace',
            }}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Description */}
      <div style={{ textAlign: 'center', padding: '10px', fontSize: 11, color: '#555' }}>
        {currentTab?.desc}
        {tab === 'timing' && ` — ${TRIAL_SUBS.find(s => s.key === trialSub)?.label}`}
        {tab === 'infinity' && ` — ${DIFF_SUBS.find(s => s.key === diffSub)?.label}`}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
