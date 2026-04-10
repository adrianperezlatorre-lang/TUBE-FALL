/**
 * AGENT 6 — AUDIO
 * Procedural audio using Web Audio API. Zero audio files.
 */

let ctx = null;
let muted = false;
let unlocked = false;

const MUTE_KEY = 'tubeFall_muted';

/**
 * Ensure AudioContext is created and unlocked.
 */
function ensureContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

/**
 * Play a short sine sweep.
 * @param {number} startFreq
 * @param {number} endFreq
 * @param {number} duration - in seconds
 * @param {string} type - oscillator type
 * @param {number} [gain=0.3]
 */
function playSweep(startFreq, endFreq, duration, type = 'sine', gain = 0.3) {
  ensureContext();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/**
 * Play a ping at a specific frequency.
 * @param {number} freq
 * @param {number} duration - in seconds
 * @param {number} [gain=0.2]
 * @param {number} [delay=0] - start delay in seconds
 */
function playPing(freq, duration, gain = 0.2, delay = 0) {
  ensureContext();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

/**
 * Play noise burst.
 * @param {number} duration - seconds
 * @param {number} [gain=0.2]
 */
function playNoise(duration, gain = 0.2) {
  ensureContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(g);
  g.connect(ctx.destination);
  source.start(ctx.currentTime);
}

const SOUNDS = {
  /** Short sine sweep 200→500Hz, 60ms */
  JUMP() {
    playSweep(200, 500, 0.06, 'sine', 0.15);
  },

  /** Soft thud 100Hz sawtooth, 40ms */
  LAND_ON_ELEV() {
    playSweep(100, 80, 0.04, 'sawtooth', 0.12);
  },

  /** Descending noise burst 300→80Hz, 200ms */
  DEATH() {
    playSweep(300, 80, 0.2, 'sawtooth', 0.25);
    playNoise(0.15, 0.15);
  },

  /** Bright ping 880Hz sine, 80ms */
  GEM_COLLECT() {
    playPing(880, 0.08, 0.2);
    playPing(1320, 0.06, 0.1, 0.03);
  },

  /** Ascending 4-note arpeggio C4-E4-G4-C5, 50ms each */
  LEVEL_COMPLETE() {
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, i) => {
      playPing(freq, 0.12, 0.2, i * 0.05);
    });
  },

  /** Sparkle — 5 ascending pings 400ms total */
  FIRST_ATTEMPT_BONUS() {
    const freqs = [600, 800, 1000, 1200, 1500];
    freqs.forEach((freq, i) => {
      playPing(freq, 0.1, 0.15, i * 0.08);
    });
  },

  /** Quick whoosh, 150ms */
  LEVEL_TRANSITION() {
    playNoise(0.15, 0.1);
    playSweep(150, 600, 0.15, 'sine', 0.08);
  },
};

export const AudioSystem = {
  /**
   * Unlock audio context (call on first user tap).
   */
  unlock() {
    if (unlocked) return;
    ensureContext();
    unlocked = true;
    // Load mute preference
    try {
      muted = localStorage.getItem(MUTE_KEY) === 'true';
    } catch {
      muted = false;
    }
  },

  /**
   * Play a named sound.
   * @param {string} soundName - Key from SOUNDS object
   */
  play(soundName) {
    if (muted || !unlocked) return;
    const fn = SOUNDS[soundName];
    if (fn) {
      try { fn(); } catch { /* ignore audio errors */ }
    }
  },

  /** Mute all sounds. */
  mute() {
    muted = true;
    try { localStorage.setItem(MUTE_KEY, 'true'); } catch {}
  },

  /** Unmute sounds. */
  unmute() {
    muted = false;
    try { localStorage.setItem(MUTE_KEY, 'false'); } catch {}
  },

  /** Toggle mute state. */
  toggleMute() {
    if (muted) this.unmute();
    else this.mute();
    return muted;
  },

  /** @returns {boolean} */
  isMuted() {
    return muted;
  },
};
