/**
 * useGameLoop — Game loop with fixed timestep.
 * Uses requestAnimationFrame only. The fixed timestep accumulator
 * guarantees identical physics on all devices regardless of refresh rate.
 */

import { useRef, useEffect, useCallback } from 'react';

const FIXED_DT = 16.67;
const MAX_STEPS_PER_FRAME = 4; // prevent spiral of death

/**
 * @param {Function} updateFn - Called each fixed timestep (16.67ms)
 * @param {Function} drawFn - Called each animation frame
 * @param {boolean} running - Whether loop is active
 */
export function useGameLoop(updateFn, drawFn, running) {
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const updateRef = useRef(updateFn);
  const drawRef = useRef(drawFn);

  updateRef.current = updateFn;
  drawRef.current = drawFn;

  const tick = useCallback((now) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = now;
    }

    let dt = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Clamp large dt (e.g. tab was hidden or resumed)
    if (dt > 200) dt = FIXED_DT;

    accumulatorRef.current += dt;

    // Run fixed-step updates (capped to prevent spiral of death)
    let steps = 0;
    while (accumulatorRef.current >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
      updateRef.current(FIXED_DT);
      accumulatorRef.current -= FIXED_DT;
      steps++;
    }

    // If we hit the cap, discard remaining time to prevent catching up
    if (steps >= MAX_STEPS_PER_FRAME) {
      accumulatorRef.current = 0;
    }

    drawRef.current();

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!running) return;

    lastTimeRef.current = 0;
    accumulatorRef.current = 0;

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [running, tick]);
}
