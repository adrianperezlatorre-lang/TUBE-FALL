/**
 * Tutorial — First-time interactive tutorial overlay.
 * Shows once, then never again (stored in localStorage).
 */

import { useState } from 'react';

const STORAGE_KEY = 'tubeFall_tutorialDone';

const STEPS = [
  {
    title: 'TUBE FALL',
    text: 'Guide your ball through the tube.\nAvoid all black obstacles!',
    icon: '⊙',
    bg: '#FF6B9D',
  },
  {
    title: 'CONTROLS',
    text: 'Tap LEFT side = jump left\nTap RIGHT side = jump right',
    icon: '◁  ▷',
    bg: '#FF9F43',
    showHands: true,
  },
  {
    title: 'PLATFORMS',
    text: 'Land on platforms to roll.\nHold left/right to keep rolling.',
    icon: '▬▬▬',
    bg: '#48DBFB',
  },
  {
    title: 'VANISH BARS',
    text: 'Dashed platforms disappear!\nJump off before they vanish.',
    icon: '▪ ▪ ▪',
    bg: '#FECA57',
  },
  {
    title: 'COLLECT GEMS',
    text: 'Grab yellow gems for currency.\nBuy upgrades and skins in the shop.',
    icon: '◆',
    bg: '#1DD1A1',
    iconColor: '#FFD700',
  },
  {
    title: 'READY?',
    text: 'Die & retry fast.\nBeat all 20 levels!',
    icon: '▼',
    bg: '#6C5CE7',
    isLast: true,
  },
];

/**
 * Check if tutorial has been completed before.
 * @returns {boolean}
 */
export function isTutorialDone() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * @param {Object} props
 * @param {Function} props.onComplete - Called when tutorial finishes
 */
export default function Tutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  function next() {
    if (step >= STEPS.length - 1) {
      // Mark tutorial as done
      try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
      onComplete();
    } else {
      setStep(step + 1);
    }
  }

  return (
    <div
      onClick={next}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: current.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        fontFamily: 'monospace',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.3s',
      }}
    >
      {/* Step dots */}
      <div style={{
        position: 'absolute',
        top: '30px',
        display: 'flex',
        gap: '8px',
      }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10,
            borderRadius: '50%',
            backgroundColor: i === step ? '#000' : 'rgba(0,0,0,0.2)',
            transition: 'background-color 0.2s',
          }} />
        ))}
      </div>

      {/* Icon */}
      <div style={{
        fontSize: '64px',
        marginBottom: '24px',
        color: current.iconColor || '#000',
        opacity: 0.9,
      }}>
        {current.icon}
      </div>

      {/* Hand indicators for controls step */}
      {current.showHands && (
        <div style={{
          display: 'flex',
          width: '80%',
          maxWidth: '300px',
          marginBottom: '20px',
          gap: '4px',
        }}>
          <div style={{
            flex: 1,
            height: '80px',
            border: '3px dashed rgba(0,0,0,0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'rgba(0,0,0,0.5)',
          }}>
            TAP LEFT
          </div>
          <div style={{
            flex: 1,
            height: '80px',
            border: '3px dashed rgba(0,0,0,0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'rgba(0,0,0,0.5)',
          }}>
            TAP RIGHT
          </div>
        </div>
      )}

      {/* Title */}
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#000',
        marginBottom: '12px',
        letterSpacing: '2px',
      }}>
        {current.title}
      </div>

      {/* Text */}
      <div style={{
        fontSize: '16px',
        color: 'rgba(0,0,0,0.7)',
        textAlign: 'center',
        lineHeight: '1.6',
        whiteSpace: 'pre-line',
        padding: '0 30px',
      }}>
        {current.text}
      </div>

      {/* Bottom prompt */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        fontSize: '14px',
        color: 'rgba(0,0,0,0.4)',
        animation: 'pulse 1.5s infinite',
      }}>
        {current.isLast ? 'TAP TO PLAY' : 'TAP TO CONTINUE'}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
