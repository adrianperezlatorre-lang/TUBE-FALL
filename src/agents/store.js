/**
 * AGENT 5 — STATE + PERSISTENCE
 * Simple pub/sub store with localStorage persistence.
 */

const STORAGE_KEY = 'tubeFall_save';

const UPGRADE_COSTS = {
  jumpPower: [15, 25, 40],
  fallSpeed: [20, 35, 55],
  skin: [0, 10, 15, 20, 25, 30, 40, 45, 50, 55, 60, 75], // skin 0 is free
};

const DEFAULT_STATE = {
  currentLevel: 1,
  completedLevels: [],
  gems: 0,
  upgrades: {
    jumpPower: 0,
    fallSpeed: 0,
    skin: 0,
  },
  firstAttemptLevels: [],
  totalDeaths: 0,
  totalGems: 0,
  // Time trial
  timeTrialBests: {}, // { '101': 0.85, '102': 1.2, ... } best times in seconds
  timeTrialCompleted: [], // trial IDs completed for the first time
  gemDoublerExpiry: 0, // timestamp when doubler expires (0 = inactive)
};

/** @type {Set<Function>} */
const listeners = new Set();

/** @type {typeof DEFAULT_STATE} */
let state = { ...DEFAULT_STATE };

/**
 * Load state from localStorage.
 */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...DEFAULT_STATE,
        ...parsed,
        upgrades: { ...DEFAULT_STATE.upgrades, ...(parsed.upgrades || {}) },
      };
    }
  } catch {
    state = { ...DEFAULT_STATE };
  }
}

/**
 * Save state to localStorage.
 */
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail if localStorage is full
  }
}

/** Notify all subscribers. */
function notify() {
  save();
  for (const fn of listeners) fn(state);
}

export const Store = {
  /** Initialize — load from localStorage. */
  init() {
    load();
  },

  /** Get current state (readonly copy). */
  getState() {
    return { ...state, upgrades: { ...state.upgrades } };
  },

  /**
   * Subscribe to state changes.
   * @param {Function} fn
   * @returns {Function} unsubscribe
   */
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /**
   * Mark a level as completed.
   * @param {number} levelId
   * @param {boolean} isFirstAttempt
   * @param {number} gemsEarned
   */
  completeLevel(levelId, isFirstAttempt, gemsEarned) {
    if (!state.completedLevels.includes(levelId)) {
      state.completedLevels.push(levelId);
    }
    if (isFirstAttempt && !state.firstAttemptLevels.includes(levelId)) {
      state.firstAttemptLevels.push(levelId);
    }
    // Unlock next level
    if (levelId >= state.currentLevel && levelId < 20) {
      state.currentLevel = levelId + 1;
    }
    state.gems += gemsEarned;
    state.totalGems += gemsEarned;
    notify();
  },

  /**
   * Add gems.
   * @param {number} n
   */
  collectGems(n) {
    state.gems += n;
    state.totalGems += n;
    notify();
  },

  /**
   * Record a death.
   */
  recordDeath() {
    state.totalDeaths++;
    // Don't save on every death to avoid perf issues; batch with other saves
  },

  /**
   * Purchase an upgrade.
   * @param {'jumpPower'|'fallSpeed'|'skin'} type
   * @param {number} tier - 1-indexed tier to buy
   * @returns {boolean} success
   */
  purchaseUpgrade(type, tier) {
    const costs = UPGRADE_COSTS[type];
    if (!costs) return false;

    if (type === 'skin') {
      // Skins: tier is the skin index (0-5), cost is at that index
      if (tier < 0 || tier >= costs.length) return false;
      if (tier === 0) return false; // already free
      const cost = costs[tier];
      if (state.gems < cost) return false;
      state.gems -= cost;
      state.upgrades.skin = tier;
    } else {
      // jumpPower/fallSpeed: tier is 1,2,3
      if (tier < 1 || tier > 3) return false;
      if (state.upgrades[type] >= tier) return false; // already owned
      if (state.upgrades[type] !== tier - 1) return false; // must buy in order
      const cost = costs[tier - 1];
      if (state.gems < cost) return false;
      state.gems -= cost;
      state.upgrades[type] = tier;
    }

    notify();
    return true;
  },

  /**
   * Check if a skin is owned.
   * @param {number} skinIndex
   * @returns {boolean}
   */
  isSkinOwned(skinIndex) {
    if (skinIndex === 0) return true; // default is always owned
    // A skin is owned if it was ever selected (purchased)
    // For simplicity, track owned skins in state
    return (state._ownedSkins || [0]).includes(skinIndex);
  },

  /**
   * Purchase a skin.
   * @param {number} skinIndex
   * @returns {boolean}
   */
  purchaseSkin(skinIndex) {
    const costs = UPGRADE_COSTS.skin;
    if (skinIndex < 0 || skinIndex >= costs.length) return false;
    if (skinIndex === 0) return false;

    if (!state._ownedSkins) state._ownedSkins = [0];
    if (state._ownedSkins.includes(skinIndex)) return false;

    const cost = costs[skinIndex];
    if (state.gems < cost) return false;

    state.gems -= cost;
    state._ownedSkins.push(skinIndex);
    state.upgrades.skin = skinIndex;
    notify();
    return true;
  },

  /**
   * Select an already-owned skin.
   * @param {number} skinIndex
   */
  selectSkin(skinIndex) {
    if (!state._ownedSkins) state._ownedSkins = [0];
    if (!state._ownedSkins.includes(skinIndex)) return;
    state.upgrades.skin = skinIndex;
    notify();
  },

  /**
   * Get all owned skin indices.
   * @returns {number[]}
   */
  getOwnedSkins() {
    return state._ownedSkins || [0];
  },

  /** Get upgrade costs. */
  getUpgradeCosts() {
    return UPGRADE_COSTS;
  },

  /**
   * Record a time trial completion.
   * @param {number} trialId - 101, 102, 103
   * @param {number} timeSeconds - completion time
   * @returns {{ gems: number, isNewBest: boolean, isFirstClear: boolean }}
   */
  completeTimeTrial(trialId, timeSeconds) {
    if (!state.timeTrialBests) state.timeTrialBests = {};
    if (!state.timeTrialCompleted) state.timeTrialCompleted = [];

    const prevBest = state.timeTrialBests[trialId];
    const isNewBest = prevBest === undefined || timeSeconds < prevBest;
    const isFirstClear = !state.timeTrialCompleted.includes(trialId);

    if (isNewBest) {
      state.timeTrialBests[trialId] = timeSeconds;
    }

    // Gem reward: 1 gem per second under 30s (max 30 gems per run)
    let gemsEarned = Math.max(0, Math.floor(30 - timeSeconds));
    // Apply doubler
    if (this.isDoublerActive()) gemsEarned *= 2;

    if (isFirstClear) {
      state.timeTrialCompleted.push(trialId);
      gemsEarned += 50; // first clear bonus
      // Activate gem doubler for 30 minutes
      state.gemDoublerExpiry = Date.now() + 30 * 60 * 1000;
    }

    state.gems += gemsEarned;
    state.totalGems += gemsEarned;
    notify();
    return { gems: gemsEarned, isNewBest, isFirstClear };
  },

  /** Check if gem doubler is active. */
  isDoublerActive() {
    return (state.gemDoublerExpiry || 0) > Date.now();
  },

  /** Get doubler remaining time in ms. */
  getDoublerRemaining() {
    const remaining = (state.gemDoublerExpiry || 0) - Date.now();
    return remaining > 0 ? remaining : 0;
  },

  /** Get best time for a trial. */
  getTrialBest(trialId) {
    return state.timeTrialBests ? state.timeTrialBests[trialId] : undefined;
  },

  /** Check if a trial has been completed. */
  isTrialCompleted(trialId) {
    return (state.timeTrialCompleted || []).includes(trialId);
  },

  /** Reset all progress. */
  resetProgress() {
    state = { ...DEFAULT_STATE, upgrades: { ...DEFAULT_STATE.upgrades } };
    notify();
  },
};
