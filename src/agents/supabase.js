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
