/**
 * useInput — Touch and mouse input handler for the game canvas.
 * Tracks both taps (for jumping) and held state (for rolling on platforms).
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Shared held-direction state, readable by engine each frame.
 * @type {{ left: boolean, right: boolean }}
 */
export const heldDirection = { left: false, right: false };

/**
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {Function} onJump - Called with 'left' or 'right' on initial press
 * @param {Function} onMuteToggle - Called when M key pressed
 * @param {boolean} active - Whether input is active
 */
export function useInput(canvasRef, onJump, onMuteToggle, active) {
  const touchSideRef = useRef(null);

  const handleInput = useCallback((clientX) => {
    if (!active || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const midX = rect.width / 2;
    onJump(x < midX ? 'left' : 'right');
  }, [active, onJump, canvasRef]);

  useEffect(() => {
    if (!active) {
      heldDirection.left = false;
      heldDirection.right = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Track which keys are currently held
    const keysDown = new Set();

    const onTouchStart = (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const side = x < rect.width / 2 ? 'left' : 'right';
        touchSideRef.current = side;
        heldDirection[side] = true;
        onJump(side);
      }
    };

    const onTouchEnd = (e) => {
      if (touchSideRef.current) {
        heldDirection[touchSideRef.current] = false;
        touchSideRef.current = null;
      }
    };

    const onMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const side = x < rect.width / 2 ? 'left' : 'right';
      heldDirection[side] = true;
      onJump(side);
    };

    const onMouseUp = () => {
      heldDirection.left = false;
      heldDirection.right = false;
    };

    const onKeyDown = (e) => {
      if (e.repeat) return; // Don't fire jump on key repeat

      if (e.key === 'm' || e.key === 'M') {
        onMuteToggle();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (!keysDown.has('left')) {
          keysDown.add('left');
          heldDirection.left = true;
          onJump('left');
        }
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (!keysDown.has('right')) {
          keysDown.add('right');
          heldDirection.right = true;
          onJump('right');
        }
      }
    };

    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysDown.delete('left');
        heldDirection.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysDown.delete('right');
        heldDirection.right = false;
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      heldDirection.left = false;
      heldDirection.right = false;
    };
  }, [active, handleInput, onJump, onMuteToggle, canvasRef]);
}
