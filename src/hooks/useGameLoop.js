/**
 * useGameLoop — Game loop with fixed timestep.
 * Uses requestAnimationFrame when available, falls back to setInterval.
 * Also uses setInterval as a backup to ensure updates run even in
 * background tabs where RAF is throttled.
 */

import { useRef, useEffect, useCallback } from 'react';

const FIXED_DT = 16.67;

/**
 * @param {Function} updateFn - Called each fixed timestep (16.67ms)
 * @param {Function} drawFn - Called each animation frame
 * @param {boolean} running - Whether loop is active
 */
export function useGameLoop(updateFn, drawFn, running) {
  const rafRef = useRef(null);
  const intervalRef = useRef(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const updateRef = useRef(updateFn);
  const drawRef = useRef(drawFn);

  updateRef.current = updateFn;
  drawRef.current = drawFn;

  const tick = useCallback(() => {
    const now = performance.now();
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = now;
    }

    let dt = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Clamp large dt (e.g. tab was hidden)
    if (dt > 100) dt = FIXED_DT;

    accumulatorRef.current += dt;

    // Cap accumulated updates to prevent spiral of death
    if (accumulatorRef.current > FIXED_DT * 5) {
      accumulatorRef.current = FIXED_DT * 2;
    }

    while (accumulatorRef.current >= FIXED_DT) {
      updateRef.current(FIXED_DT);
      accumulatorRef.current -= FIXED_DT;
    }

    drawRef.current();
  }, []);

  useEffect(() => {
    if (!running) return;

    lastTimeRef.current = 0;
    accumulatorRef.current = 0;

    // Use both RAF and setInterval for robustness
    // RAF provides smooth rendering, setInterval ensures updates run
    // even when RAF is throttled (background tabs)
    function rafLoop() {
      tick();
      rafRef.current = requestAnimationFrame(rafLoop);
    }
    rafRef.current = requestAnimationFrame(rafLoop);

    // Backup interval ensures the game runs even if RAF is paused
    intervalRef.current = setInterval(tick, FIXED_DT);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, tick]);
}
