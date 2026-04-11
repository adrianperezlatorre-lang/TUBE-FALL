/**
 * Account — Login/Create account overlay.
 */

import { useState } from 'react';
import { createAccount, login, logout, getStoredAccount } from '../agents/supabase.js';

export default function Account({ onClose }) {
  const [account, setAccount] = useState(getStoredAccount());
  const [mode, setMode] = useState('login'); // 'login' or 'create'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    const result = mode === 'create'
      ? await createAccount(username, password)
      : await login(username, password);
    setLoading(false);

    if (result.success) {
      setAccount(result.user);
    } else {
      setError(result.error);
    }
  }

  function handleLogout() {
    logout();
    setAccount(null);
  }

  // If logged in, show account info
  if (account) {
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>@{account.username}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Logged in</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={handleLogout} style={btnDanger}>LOG OUT</button>
            <button onClick={onClose} style={btnGrey}>CLOSE</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
          {mode === 'create' ? 'CREATE ACCOUNT' : 'LOG IN'}
        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          style={input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={30}
          style={input}
        />

        {error && <div style={{ color: '#E74C3C', fontSize: 12, marginTop: 6 }}>{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={loading || !username || !password}
          style={{
            ...btnPrimary,
            opacity: loading || !username || !password ? 0.5 : 1,
            marginTop: 16,
          }}
        >
          {loading ? '...' : mode === 'create' ? 'CREATE' : 'LOG IN'}
        </button>

        <button
          onClick={() => { setMode(mode === 'create' ? 'login' : 'create'); setError(''); }}
          style={{ ...btnLink, marginTop: 12 }}
        >
          {mode === 'create' ? 'Already have an account? Log in' : "Don't have an account? Create one"}
        </button>

        <button onClick={onClose} style={{ ...btnLink, marginTop: 8, color: '#555' }}>
          Skip (play without account)
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.8)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 60, fontFamily: 'monospace',
};
const card = {
  backgroundColor: '#1a1a2e', borderRadius: 16, padding: '30px 24px',
  width: '85%', maxWidth: 320, display: 'flex', flexDirection: 'column',
  alignItems: 'center', color: '#FFF',
};
const input = {
  width: '100%', padding: '10px 12px', marginTop: 10,
  backgroundColor: '#0d0d1a', border: '2px solid #333', borderRadius: 8,
  color: '#FFF', fontSize: 14, fontFamily: 'monospace', outline: 'none',
};
const btnPrimary = {
  width: '100%', padding: '12px', backgroundColor: '#FFD700', color: '#000',
  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 'bold',
  cursor: 'pointer', fontFamily: 'monospace',
};
const btnDanger = {
  padding: '10px 20px', backgroundColor: '#E74C3C', color: '#FFF',
  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 'bold',
  cursor: 'pointer', fontFamily: 'monospace',
};
const btnGrey = {
  padding: '10px 20px', backgroundColor: '#333', color: '#FFF',
  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 'bold',
  cursor: 'pointer', fontFamily: 'monospace',
};
const btnLink = {
  background: 'none', border: 'none', color: '#888',
  fontSize: 12, cursor: 'pointer', fontFamily: 'monospace',
};
