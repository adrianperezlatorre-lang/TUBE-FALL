/**
 * ScoreSubmit — Popup to optionally submit a score to the leaderboard.
 */

import { useState } from 'react';
import { submitScore, getStoredAccount } from '../agents/supabase.js';

/**
 * @param {Object} props
 * @param {'gems'|'timing'|'infinity'} props.category
 * @param {number} props.score
 * @param {Object} [props.options] - { difficulty, trialId }
 * @param {Function} props.onDone
 */
export default function ScoreSubmit({ category, score, options, onDone }) {
  const account = getStoredAccount();
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!nickname.trim() || nickname.length > 16) return;
    setSubmitting(true);
    await submitScore(category, score, nickname.trim(), options || {});
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(onDone, 800);
  }

  const scoreText = category === 'timing' ? `${score.toFixed(2)}s` :
    category === 'infinity' ? `${Math.floor(score)}m` : `${Math.floor(score)} gems`;

  if (submitted) {
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2ECC71' }}>SUBMITTED!</div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>POST TO LEADERBOARD?</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginBottom: 16 }}>
          {scoreText}
        </div>

        <input
          type="text"
          placeholder="Your nickname (max 16)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={16}
          style={{
            width: '100%', padding: '10px 12px',
            backgroundColor: '#0d0d1a', border: '2px solid #333', borderRadius: 8,
            color: '#FFF', fontSize: 14, fontFamily: 'monospace', outline: 'none',
          }}
        />

        {account && (
          <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
            Will show as @{account.username}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16, width: '100%' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || !nickname.trim()}
            style={{
              flex: 1, padding: '12px', backgroundColor: '#FFD700', color: '#000',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 'bold',
              cursor: 'pointer', fontFamily: 'monospace',
              opacity: submitting || !nickname.trim() ? 0.5 : 1,
            }}
          >
            {submitting ? '...' : 'SUBMIT'}
          </button>
          <button
            onClick={onDone}
            style={{
              flex: 1, padding: '12px', backgroundColor: '#333', color: '#FFF',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 'bold',
              cursor: 'pointer', fontFamily: 'monospace',
            }}
          >
            SKIP
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 55, fontFamily: 'monospace',
};
const card = {
  backgroundColor: '#1a1a2e', borderRadius: 16, padding: '24px 20px',
  width: '85%', maxWidth: 300, display: 'flex', flexDirection: 'column',
  alignItems: 'center', color: '#FFF',
};
