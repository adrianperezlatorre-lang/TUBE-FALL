/**
 * Supabase client for leaderboard and accounts.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://croaqgftmnfxxdvkktie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb2FxZ2Z0bW5meHhkdmtrdGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MTA3MjIsImV4cCI6MjA5MTQ4NjcyMn0.0BqrLzq3zm-fQI7KYaKMPnloaXTK6--FDje-g88DT18';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── ACCOUNTS ──────────────────────────────────────

const ACCOUNT_KEY = 'tubeFall_account';

/** Get stored account from localStorage */
export function getStoredAccount() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Store account locally */
function storeAccount(account) {
  try { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account)); } catch {}
}

/** Create account. Returns { success, error, user } */
export async function createAccount(username, password) {
  if (username.length < 3 || username.length > 20) return { success: false, error: 'Username must be 3-20 characters' };
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { success: false, error: 'Only letters, numbers, - and _' };
  if (password.length < 5) return { success: false, error: 'Password must be 5+ characters' };

  // Simple hash (not cryptographically secure, but fine for a game)
  const hash = btoa(password + ':tubefall');

  const { data, error } = await supabase
    .from('users')
    .insert({ username, password_hash: hash })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Username already taken' };
    return { success: false, error: error.message };
  }

  const account = { id: data.id, username: data.username };
  storeAccount(account);
  return { success: true, user: account };
}

/** Login. Returns { success, error, user } */
export async function login(username, password) {
  const hash = btoa(password + ':tubefall');

  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', username)
    .eq('password_hash', hash)
    .single();

  if (error || !data) return { success: false, error: 'Wrong username or password' };

  const account = { id: data.id, username: data.username };
  storeAccount(account);
  return { success: true, user: account };
}

/** Logout */
export function logout() {
  try { localStorage.removeItem(ACCOUNT_KEY); } catch {}
}

// ── AUTO-SUBMIT ──────────────────────────────────

/**
 * Auto-submit a score if user is logged in (silent, no UI).
 * @param {'gems'|'timing'|'infinity'} category
 * @param {number} score
 * @param {Object} [options] - { difficulty, trialId }
 */
export async function autoSubmitScore(category, score, options = {}) {
  const account = getStoredAccount();
  if (!account) return; // not logged in, skip
  const entry = {
    nickname: account.username,
    category,
    score,
    user_id: account.id,
    username: account.username,
    difficulty: options.difficulty || null,
    trial_id: options.trialId || null,
  };
  try {
    await supabase.from('leaderboard').insert(entry);
  } catch {}
}

// ── LEADERBOARD ───────────────────────────────────

/**
 * Submit a leaderboard entry.
 * @param {'gems'|'timing'|'infinity'} category
 * @param {number} score
 * @param {string} nickname
 * @param {Object} [options] - { difficulty, trialId }
 */
export async function submitScore(category, score, nickname, options = {}) {
  const account = getStoredAccount();
  const entry = {
    nickname,
    category,
    score,
    user_id: account?.id || null,
    username: account?.username || null,
    difficulty: options.difficulty || null,
    trial_id: options.trialId || null,
  };

  const { error } = await supabase.from('leaderboard').insert(entry);
  return !error;
}

/**
 * Get leaderboard rankings.
 * @param {'gems'|'timing'|'infinity'} category
 * @param {number} limit
 * @param {Object} [filters] - { trialId, difficulty }
 * @returns {Promise<Array>}
 */
export async function getLeaderboard(category, limit = 50, filters = {}) {
  const ascending = category === 'timing'; // lower time = better
  let query = supabase
    .from('leaderboard')
    .select('nickname, username, score, difficulty, trial_id, created_at')
    .eq('category', category);

  if (filters.trialId) {
    query = query.eq('trial_id', filters.trialId);
  }
  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  const { data, error } = await query
    .order('score', { ascending })
    .limit(limit);

  if (error) return [];
  return data || [];
}

// ── FRIENDS ──────────────────────────────────────

/** Search users by username prefix */
export async function searchUsers(query) {
  const account = getStoredAccount();
  if (!account) return [];
  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .ilike('username', `${query}%`)
    .neq('id', account.id)
    .limit(10);
  if (error) return [];
  return data || [];
}

/** Send friend request */
export async function sendFriendRequest(toUserId) {
  const account = getStoredAccount();
  if (!account) return { success: false, error: 'Not logged in' };
  const { error } = await supabase
    .from('friend_requests')
    .insert({ from_user_id: account.id, to_user_id: toUserId, status: 'pending' });
  if (error) {
    if (error.code === '23505') return { success: false, error: 'Already sent' };
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Get pending friend requests received */
export async function getFriendRequests() {
  const account = getStoredAccount();
  if (!account) return [];
  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, from_user_id, status, created_at')
    .eq('to_user_id', account.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) return [];
  // Resolve usernames
  const userIds = (data || []).map(r => r.from_user_id);
  if (userIds.length === 0) return [];
  const { data: users } = await supabase
    .from('users')
    .select('id, username')
    .in('id', userIds);
  const userMap = {};
  (users || []).forEach(u => { userMap[u.id] = u.username; });
  return (data || []).map(r => ({ ...r, from_username: userMap[r.from_user_id] || '?' }));
}

/** Accept friend request */
export async function acceptFriendRequest(requestId) {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId);
  return !error;
}

/** Reject friend request */
export async function rejectFriendRequest(requestId) {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);
  return !error;
}

/** Get accepted friends list */
export async function getFriends() {
  const account = getStoredAccount();
  if (!account) return [];
  // Friends where I sent request OR they sent to me, both accepted
  const { data: sent } = await supabase
    .from('friend_requests')
    .select('to_user_id')
    .eq('from_user_id', account.id)
    .eq('status', 'accepted');
  const { data: received } = await supabase
    .from('friend_requests')
    .select('from_user_id')
    .eq('to_user_id', account.id)
    .eq('status', 'accepted');
  const friendIds = [
    ...((sent || []).map(r => r.to_user_id)),
    ...((received || []).map(r => r.from_user_id)),
  ];
  if (friendIds.length === 0) return [];
  const { data: users } = await supabase
    .from('users')
    .select('id, username')
    .in('id', friendIds);
  return users || [];
}

// ── RACES ────────────────────────────────────────

/** Create a new race map (seed-based) */
export async function createRaceMap(seed, difficulty, height) {
  const account = getStoredAccount();
  if (!account) return null;
  const { data, error } = await supabase
    .from('race_maps')
    .insert({ seed, difficulty, height, created_by: account.id })
    .select()
    .single();
  if (error) return null;
  return data;
}

/** Get a race map by ID */
export async function getRaceMap(raceMapId) {
  const { data } = await supabase
    .from('race_maps')
    .select('*')
    .eq('id', raceMapId)
    .single();
  return data;
}

/** Submit a race run (time + ball recording) */
export async function submitRaceRun(raceMapId, timeMs, ballRecording) {
  const account = getStoredAccount();
  if (!account) return null;
  const iconIdx = parseInt(localStorage.getItem('tubeFall_selectedIcon') || '0');
  const { data, error } = await supabase
    .from('race_runs')
    .insert({
      race_map_id: raceMapId,
      user_id: account.id,
      username: account.username,
      icon_index: iconIdx,
      time_ms: timeMs,
      ball_recording: ballRecording,
    })
    .select()
    .single();
  if (error) return null;
  return data;
}

/** Get all runs for a race map */
export async function getRaceRuns(raceMapId) {
  const { data } = await supabase
    .from('race_runs')
    .select('*')
    .eq('race_map_id', raceMapId)
    .order('time_ms', { ascending: true });
  return data || [];
}

/** Send race invite to a friend */
export async function sendRaceInvite(raceMapId, toUserId) {
  const account = getStoredAccount();
  if (!account) return { success: false };
  const { error } = await supabase
    .from('race_invites')
    .insert({ race_map_id: raceMapId, from_user_id: account.id, to_user_id: toUserId });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Get race invites received */
export async function getRaceInvites() {
  const account = getStoredAccount();
  if (!account) return [];
  const { data, error } = await supabase
    .from('race_invites')
    .select('id, race_map_id, from_user_id, created_at')
    .eq('to_user_id', account.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return [];
  // Resolve usernames
  const userIds = (data || []).map(r => r.from_user_id);
  if (userIds.length === 0) return [];
  const { data: users } = await supabase
    .from('users')
    .select('id, username')
    .in('id', userIds);
  const userMap = {};
  (users || []).forEach(u => { userMap[u.id] = u.username; });
  return (data || []).map(r => ({ ...r, from_username: userMap[r.from_user_id] || '?' }));
}

/** Get races I created */
export async function getMyRaces() {
  const account = getStoredAccount();
  if (!account) return [];
  const { data } = await supabase
    .from('race_maps')
    .select('*')
    .eq('created_by', account.id)
    .order('created_at', { ascending: false })
    .limit(20);
  return data || [];
}
