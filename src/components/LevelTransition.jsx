/**
 * AGENT 10 — LEVEL TRANSITION
 * Full-screen overlay shown for 400ms between levels.
 * Shows next level's color + level number with scale animation.
 */

import { useState, useEffect } from 'react';

/**
 * @param {Object} props
 * @param {string} props.color - Next level's background color
 * @param {number} props.levelNumber - Next level number
 * @param {boolean} props.isDeath - If true, show red death flash (150ms)
 * @param {Function} props.onComplete - Called when transition finishes
 */
export default function LevelTransition({ color, levelNumber, isDeath, onComplete }) {
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (isDeath) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 150);
      return () => clearTimeout(timer);
    }

    // Level transition: scale in the number
    requestAnimationFrame(() => setScale(1));

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);

    return () => clearTimeout(timer);
  }, [isDeath, onComplete]);

  if (isDeath) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#FF0000',
        opacity: 0.6,
        zIndex: 100,
        pointerEvents: 'none',
      }} />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        fontSize: '72px',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        color: '#000000',
        transform: `scale(${scale})`,
        transition: 'transform 0.3s ease-out',
        opacity,
      }}>
        {levelNumber}
      </div>
    </div>
  );
}
