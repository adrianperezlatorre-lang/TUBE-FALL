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
    particleDesign: 0,
  },
  ownedParticles: [0], // particle design IDs owned
  ownedIcons: [0], // profile icon indices owned (0 = default)
  selectedIcon: 0, // selected profile icon index
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
    if (levelId >= state.currentLevel && levelId < 50) {
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

  // ── PARTICLES ─────────────────────────

  getOwnedParticles() {
    return state.ownedParticles || [0];
  },

  purchaseParticle(designId, cost) {
    if (!state.ownedParticles) state.ownedParticles = [0];
    if (state.ownedParticles.includes(designId)) return false;
    if (state.gems < cost) return false;
    state.gems -= cost;
    state.ownedParticles.push(designId);
    state.upgrades.particleDesign = designId;
    notify();
    return true;
  },

  selectParticle(designId) {
    if (!state.ownedParticles) state.ownedParticles = [0];
    if (!state.ownedParticles.includes(designId)) return;
    state.upgrades.particleDesign = designId;
    notify();
  },

  // ── CODES ─────────────────────────────

  getRedeemedCodes() {
    return state._redeemedCodes || [];
  },

  redeemCode(code) {
    if (!state._redeemedCodes) state._redeemedCodes = [];
    if (state._redeemedCodes.includes(code)) return { success: false, error: 'Already redeemed' };

    const CODES = {
      '676767': { type: 'gems', amount: 67, desc: '+67 gems!' },
      '270712': { type: 'gems', amount: 99999, desc: 'Infinite gems!' },
      'H20H2O': { type: 'particle', designId: 5, desc: 'Bubbles particle unlocked!' },
      'FREE26': { type: 'freeItems', amount: 3, desc: '3 free shop items!' },
    };

    const reward = CODES[code];
    if (!reward) return { success: false, error: 'Invalid code' };

    state._redeemedCodes.push(code);

    if (reward.type === 'gems') {
      state.gems += reward.amount;
      state.totalGems += reward.amount;
    } else if (reward.type === 'particle') {
      if (!state.ownedParticles) state.ownedParticles = [0];
      if (!state.ownedParticles.includes(reward.designId)) {
        state.ownedParticles.push(reward.designId);
      }
    } else if (reward.type === 'freeItems') {
      state._freeItems = (state._freeItems || 0) + reward.amount;
    }

    notify();
    return { success: true, desc: reward.desc };
  },

  getFreeItems() {
    return state._freeItems || 0;
  },

  useFreeItem() {
    if ((state._freeItems || 0) <= 0) return false;
    state._freeItems--;
    notify();
    return true;
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

  // ── PROFILE ICONS ────────────────────────

  getOwnedIcons() {
    return state.ownedIcons || [0];
  },

  getSelectedIcon() {
    const ICONS = ['👤', '🎮', '🔥', '⭐', '💀', '🎯', '🌈', '👑', '🤖', '💎'];
    const idx = state.selectedIcon || 0;
    return ICONS[idx] || '👤';
  },

  getSelectedIconIndex() {
    return state.selectedIcon || 0;
  },

  purchaseIcon(iconIndex, cost) {
    if (!state.ownedIcons) state.ownedIcons = [0];
    if (state.ownedIcons.includes(iconIndex)) return false;
    if (state.gems < cost) return false;
    state.gems -= cost;
    state.ownedIcons.push(iconIndex);
    state.selectedIcon = iconIndex;
    notify();
    return true;
  },

  selectIcon(iconIndex) {
    if (!state.ownedIcons) state.ownedIcons = [0];
    if (!state.ownedIcons.includes(iconIndex)) return;
    state.selectedIcon = iconIndex;
    notify();
  },

  /** Reset all progress. */
  resetProgress() {
    state = { ...DEFAULT_STATE, upgrades: { ...DEFAULT_STATE.upgrades } };
    notify();
  },
};
