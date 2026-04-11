/**
 * Friends — Friend list, search/add, pending requests, and race invites.
 */

import { useState, useEffect } from 'react';
import { getStoredAccount, searchUsers, sendFriendRequest, getFriendRequests, acceptFriendRequest, rejectFriendRequest, getFriends, getRaceInvites } from '../agents/supabase.js';

export default function Friends({ onClose, onCreateRace, onJoinRace }) {
  const account = getStoredAccount();
  const [tab, setTab] = useState('friends'); // friends | add | requests | races
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [raceInvites, setRaceInvites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) return;
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [f, r, ri] = await Promise.all([
      getFriends(),
      getFriendRequests(),
      getRaceInvites(),
    ]);
    setFriends(f);
    setRequests(r);
    setRaceInvites(ri);
    setLoading(false);
  }

  async function handleSearch() {
    if (searchQuery.length < 2) return;
    setSearching(true);
    setSendStatus('');
    const results = await searchUsers(searchQuery);
    // Filter out existing friends
    const friendIds = new Set(friends.map(f => f.id));
    setSearchResults(results.filter(u => !friendIds.has(u.id)));
    setSearching(false);
  }

  async function handleSendRequest(userId) {
    const result = await sendFriendRequest(userId);
    if (result.success) {
      setSendStatus('Request sent!');
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } else {
      setSendStatus(result.error || 'Failed');
    }
  }

  async function handleAccept(requestId) {
    await acceptFriendRequest(requestId);
    setRequests(prev => prev.filter(r => r.id !== requestId));
    // Reload friends
    const f = await getFriends();
    setFriends(f);
  }

  async function handleReject(requestId) {
    await rejectFriendRequest(requestId);
    setRequests(prev => prev.filter(r => r.id !== requestId));
  }

  if (!account) {
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>FRIENDS</div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
            Log in to add friends and race!
          </div>
          <button onClick={onClose} style={btnGrey}>CLOSE</button>
        </div>
      </div>
    );
  }

  const tabStyle = (t) => ({
    flex: 1, padding: '8px 4px', border: 'none', borderRadius: 6,
    fontSize: 10, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace',
    backgroundColor: tab === t ? '#FFD700' : '#222',
    color: tab === t ? '#000' : '#888',
  });

  return (
    <div style={overlay}>
      <div style={{ ...card, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>FRIENDS</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, width: '100%' }}>
          <button onClick={() => setTab('friends')} style={tabStyle('friends')}>
            FRIENDS {friends.length > 0 ? `(${friends.length})` : ''}
          </button>
          <button onClick={() => setTab('add')} style={tabStyle('add')}>ADD</button>
          <button onClick={() => setTab('requests')} style={tabStyle('requests')}>
            REQUESTS {requests.length > 0 ? `(${requests.length})` : ''}
          </button>
          <button onClick={() => setTab('races')} style={tabStyle('races')}>
            RACES {raceInvites.length > 0 ? `(${raceInvites.length})` : ''}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', width: '100%', minHeight: 0 }}>
          {loading && <div style={{ color: '#555', fontSize: 12, textAlign: 'center', padding: 20 }}>Loading...</div>}

          {/* FRIENDS LIST */}
          {!loading && tab === 'friends' && (
            <>
              {friends.length === 0 && (
                <div style={{ color: '#555', fontSize: 12, textAlign: 'center', padding: 20 }}>
                  No friends yet. Use ADD to search for players!
                </div>
              )}
              {friends.map(f => (
                <div key={f.id} style={friendRow}>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>@{f.username}</div>
                  <button
                    onClick={() => onCreateRace && onCreateRace(f.id)}
                    style={btnSmall}
                  >
                    RACE
                  </button>
                </div>
              ))}
            </>
          )}

          {/* ADD FRIEND */}
          {!loading && tab === 'add' && (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="Search username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={input}
                />
                <button onClick={handleSearch} disabled={searching || searchQuery.length < 2} style={{
                  ...btnSmall, opacity: searching || searchQuery.length < 2 ? 0.5 : 1,
                }}>
                  {searching ? '...' : 'SEARCH'}
                </button>
              </div>
              {sendStatus && <div style={{ color: '#2ECC71', fontSize: 11, marginBottom: 8 }}>{sendStatus}</div>}
              {searchResults.map(u => (
                <div key={u.id} style={friendRow}>
                  <div style={{ fontSize: 13 }}>@{u.username}</div>
                  <button onClick={() => handleSendRequest(u.id)} style={btnSmall}>ADD</button>
                </div>
              ))}
              {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                <div style={{ color: '#555', fontSize: 11, textAlign: 'center', padding: 10 }}>
                  No results. Try a different username.
                </div>
              )}
            </>
          )}

          {/* FRIEND REQUESTS */}
          {!loading && tab === 'requests' && (
            <>
              {requests.length === 0 && (
                <div style={{ color: '#555', fontSize: 12, textAlign: 'center', padding: 20 }}>
                  No pending requests
                </div>
              )}
              {requests.map(r => (
                <div key={r.id} style={friendRow}>
                  <div style={{ fontSize: 13 }}>@{r.from_username}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleAccept(r.id)} style={{ ...btnSmall, backgroundColor: '#2ECC71' }}>
                      ACCEPT
                    </button>
                    <button onClick={() => handleReject(r.id)} style={{ ...btnSmall, backgroundColor: '#E74C3C' }}>
                      DENY
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* RACE INVITES */}
          {!loading && tab === 'races' && (
            <>
              {raceInvites.length === 0 && (
                <div style={{ color: '#555', fontSize: 12, textAlign: 'center', padding: 20 }}>
                  No race invites. Challenge a friend from the Friends tab!
                </div>
              )}
              {raceInvites.map(inv => (
                <div key={inv.id} style={friendRow}>
                  <div>
                    <div style={{ fontSize: 13 }}>Race from @{inv.from_username}</div>
                    <div style={{ fontSize: 10, color: '#555' }}>
                      {new Date(inv.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => onJoinRace && onJoinRace(inv.race_map_id)}
                    style={{ ...btnSmall, backgroundColor: '#667eea' }}
                  >
                    PLAY
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <button onClick={onClose} style={{ ...btnGrey, marginTop: 12, width: '100%' }}>CLOSE</button>
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
  backgroundColor: '#1a1a2e', borderRadius: 16, padding: '24px 20px',
  width: '90%', maxWidth: 360, display: 'flex', flexDirection: 'column',
  alignItems: 'center', color: '#FFF',
};
const friendRow = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 12px', marginBottom: 6, backgroundColor: '#0d0d1a',
  borderRadius: 8, border: '1px solid #222',
};
const input = {
  flex: 1, padding: '8px 10px',
  backgroundColor: '#0d0d1a', border: '2px solid #333', borderRadius: 8,
  color: '#FFF', fontSize: 13, fontFamily: 'monospace', outline: 'none',
};
const btnSmall = {
  padding: '6px 12px', backgroundColor: '#FFD700', color: '#000',
  border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 'bold',
  cursor: 'pointer', fontFamily: 'monospace', whiteSpace: 'nowrap',
};
const btnGrey = {
  padding: '10px 20px', backgroundColor: '#333', color: '#FFF',
  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 'bold',
  cursor: 'pointer', fontFamily: 'monospace',
};
