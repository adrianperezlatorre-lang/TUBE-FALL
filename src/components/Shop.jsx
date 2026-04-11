/**
 * AGENT 9 — SHOP COMPONENT
 * Full screen shop overlay with upgrades and skins.
 */

import { useState, useEffect } from 'react';
import { Store } from '../agents/store.js';
import { PARTICLE_DESIGNS } from '../agents/particles.js';

const JUMP_TIERS = [
  { cost: 15, desc: 'Slightly higher jumps' },
  { cost: 25, desc: 'Much higher jumps' },
  { cost: 40, desc: 'Maximum jump power' },
];

const FALL_TIERS = [
  { cost: 20, desc: 'Slightly slower fall' },
  { cost: 35, desc: 'Much slower fall' },
  { cost: 55, desc: 'Maximum control' },
];

const SKINS = [
  { name: 'Default', cost: 0, shape: 'circle' },
  { name: 'Ghost', cost: 10, shape: 'circle-outline' },
  { name: 'Block', cost: 15, shape: 'square' },
  { name: 'Diamond', cost: 20, shape: 'diamond' },
  { name: 'Star', cost: 25, shape: 'star' },
  { name: 'Arrow', cost: 30, shape: 'triangle' },
  { name: '8-Ball', cost: 40, shape: '8ball', label: '8' },
  { name: 'Pizza', cost: 45, shape: 'pizza', label: '🍕' },
  { name: '67', cost: 50, shape: 'number', label: '67' },
  { name: 'Donut', cost: 55, shape: 'donut' },
  { name: 'Eye', cost: 60, shape: 'eye' },
  { name: 'Skull', cost: 75, shape: 'skull', label: '☠' },
];

/**
 * @param {Object} props
 * @param {Function} props.onClose
 */
export default function Shop({ onClose }) {
  const [state, setState] = useState(Store.getState());
  const [previewSkin, setPreviewSkin] = useState(state.upgrades.skin);

  useEffect(() => {
    return Store.subscribe((s) => setState({ ...s, upgrades: { ...s.upgrades } }));
  }, []);

  const gems = state.gems;
  const upgrades = state.upgrades;
  const ownedSkins = Store.getOwnedSkins();

  function buyJump(tier) {
    Store.purchaseUpgrade('jumpPower', tier);
  }

  function buyFall(tier) {
    Store.purchaseUpgrade('fallSpeed', tier);
  }

  function buySkin(idx) {
    if (ownedSkins.includes(idx)) {
      Store.selectSkin(idx);
      setPreviewSkin(idx);
    } else {
      if (Store.purchaseSkin(idx)) {
        setPreviewSkin(idx);
      }
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#F8F8F8',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
      overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '2px solid #000',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>SHOP</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            backgroundColor: '#000',
            color: '#FFD700',
            padding: '6px 14px',
            borderRadius: '16px',
            fontWeight: 'bold',
            fontSize: '16px',
          }}>
            ◆ {gems}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '2px solid #000',
              fontSize: '20px',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Ball preview */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <SkinPreview skinIndex={previewSkin} />
      </div>

      {/* Sections */}
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Jump Power */}
        <UpgradeSection
          title="Jump Power"
          tiers={JUMP_TIERS}
          currentTier={upgrades.jumpPower}
          gems={gems}
          onBuy={buyJump}
        />

        {/* Fall Speed */}
        <UpgradeSection
          title="Fall Speed"
          tiers={FALL_TIERS}
          currentTier={upgrades.fallSpeed}
          gems={gems}
          onBuy={buyFall}
        />

        {/* Ball Skins */}
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Ball Skins</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}>
            {SKINS.map((skin, idx) => {
              const owned = ownedSkins.includes(idx);
              const selected = upgrades.skin === idx;
              const canBuy = !owned && gems >= skin.cost;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setPreviewSkin(idx);
                    if (owned || idx === 0) buySkin(idx);
                  }}
                  style={{
                    border: selected ? '3px solid #000' : '2px solid #CCC',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    backgroundColor: selected ? '#E8E8E8' : '#FFF',
                  }}
                >
                  <SkinIcon index={idx} size={28} />
                  <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{skin.name}</div>
                  {idx === 0 ? (
                    <div style={{ fontSize: '10px', color: '#888' }}>FREE</div>
                  ) : owned ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); buySkin(idx); }}
                      style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        border: '1px solid #000',
                        borderRadius: '4px',
                        background: selected ? '#000' : '#FFF',
                        color: selected ? '#FFF' : '#000',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                      }}
                    >
                      {selected ? 'EQUIPPED' : 'SELECT'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); buySkin(idx); }}
                      disabled={!canBuy}
                      style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        border: 'none',
                        borderRadius: '4px',
                        background: canBuy ? '#FFD700' : '#DDD',
                        color: '#000',
                        cursor: canBuy ? 'pointer' : 'default',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                      }}
                    >
                      ◆ {skin.cost}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        {/* PARTICLES */}
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Particle Trails</div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
          }}>
            {PARTICLE_DESIGNS.map((pd) => {
              const owned = (Store.getOwnedParticles()).includes(pd.id);
              const selected = upgrades.particleDesign === pd.id;
              const canBuy = !owned && gems >= pd.cost;
              const hasFree = Store.getFreeItems() > 0;

              return (
                <div key={pd.id} onClick={() => {
                  if (owned || pd.id === 0) Store.selectParticle(pd.id);
                }} style={{
                  border: selected ? '3px solid #000' : '2px solid #CCC',
                  borderRadius: '8px', padding: '8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  cursor: 'pointer', backgroundColor: selected ? '#E8E8E8' : '#FFF',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    backgroundColor: pd.color || '#DDD',
                  }} />
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{pd.name}</div>
                  {pd.id === 0 ? (
                    <div style={{ fontSize: '9px', color: '#888' }}>FREE</div>
                  ) : owned ? (
                    <div style={{ fontSize: '9px', color: selected ? '#000' : '#888' }}>
                      {selected ? 'ACTIVE' : 'SELECT'}
                    </div>
                  ) : (
                    <button onClick={(e) => {
                      e.stopPropagation();
                      if (hasFree) { Store.useFreeItem(); Store.purchaseParticle(pd.id, 0); }
                      else Store.purchaseParticle(pd.id, pd.cost);
                    }} disabled={!canBuy && !hasFree} style={{
                      fontSize: '9px', padding: '2px 6px', border: 'none', borderRadius: '3px',
                      background: (canBuy || hasFree) ? '#FFD700' : '#DDD', color: '#000',
                      cursor: (canBuy || hasFree) ? 'pointer' : 'default', fontFamily: 'monospace', fontWeight: 'bold',
                    }}>
                      {hasFree ? 'FREE' : `◆ ${pd.cost}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CODES */}
        <CodeRedeemer />
        </div>
      </div>
    </div>
  );
}

function UpgradeSection({ title, tiers, currentTier, gems, onBuy }) {
  return (
    <div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</div>
      {/* Progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              backgroundColor: i <= currentTier ? '#000' : '#CCC',
              border: '2px solid #000',
            }} />
            {i < 3 && <div style={{ width: 20, height: 2, backgroundColor: i < currentTier ? '#000' : '#CCC' }} />}
          </div>
        ))}
      </div>
      {/* Tier items */}
      {tiers.map((tier, idx) => {
        const tierNum = idx + 1;
        const owned = currentTier >= tierNum;
        const nextUp = currentTier === idx;
        const canBuy = nextUp && gems >= tier.cost;

        return (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0',
            opacity: owned ? 0.5 : 1,
          }}>
            <div style={{ fontSize: '13px' }}>{tier.desc}</div>
            {owned ? (
              <span style={{ fontSize: '12px', color: '#888' }}>OWNED</span>
            ) : (
              <button
                onClick={() => onBuy(tierNum)}
                disabled={!canBuy}
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  border: 'none',
                  borderRadius: '4px',
                  background: canBuy ? '#FFD700' : '#DDD',
                  color: '#000',
                  cursor: canBuy ? 'pointer' : 'default',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              >
                ◆ {tier.cost}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkinPreview({ skinIndex }) {
  return (
    <div style={{
      width: 60, height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <SkinIcon index={skinIndex} size={40} />
    </div>
  );
}

function SkinIcon({ index, size }) {
  const s = size;
  const half = s / 2;

  const svgStyle = { width: s, height: s };

  switch (index) {
    case 0: // Default black circle
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 1} fill="#000" />
        </svg>
      );
    case 1: // White circle with black outline
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 2} fill="#FFF" stroke="#000" strokeWidth="2" />
        </svg>
      );
    case 2: // Black square
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <rect x={2} y={2} width={s - 4} height={s - 4} fill="#000" />
        </svg>
      );
    case 3: // Black diamond
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${half},1 ${s - 1},${half} ${half},${s - 1} 1,${half}`} fill="#000" />
        </svg>
      );
    case 4: // Black star
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={starPoints(half, half, 5, half - 1, half * 0.4)} fill="#000" />
        </svg>
      );
    case 5: // Black triangle
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${half},2 ${s - 2},${s - 2} 2,${s - 2}`} fill="#000" />
        </svg>
      );
    case 6: // 8-Ball
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 1} fill="#000" />
          <circle cx={half} cy={half} r={half * 0.45} fill="#FFF" />
          <text x={half} y={half + 4} textAnchor="middle" fontSize={s * 0.35} fontWeight="bold" fill="#000">8</text>
        </svg>
      );
    case 7: // Pizza
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 1} fill="#F4A460" />
          <circle cx={half} cy={half} r={half * 0.7} fill="#FFD700" />
          <circle cx={half - 4} cy={half - 3} r={2.5} fill="#C0392B" />
          <circle cx={half + 5} cy={half + 2} r={2} fill="#C0392B" />
          <circle cx={half - 1} cy={half + 5} r={2.5} fill="#C0392B" />
        </svg>
      );
    case 8: // 67
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 1} fill="#000" />
          <text x={half} y={half + 5} textAnchor="middle" fontSize={s * 0.45} fontWeight="bold" fill="#FFF">67</text>
        </svg>
      );
    case 9: // Donut
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 1} fill="#D2691E" />
          <circle cx={half} cy={half} r={half * 0.7} fill="#FF69B4" />
          <circle cx={half} cy={half} r={half * 0.3} fill="#FFF" />
        </svg>
      );
    case 10: // Eye
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <ellipse cx={half} cy={half} rx={half - 1} ry={half * 0.65} fill="#FFF" stroke="#000" strokeWidth="2" />
          <circle cx={half} cy={half} r={half * 0.35} fill="#2C3E50" />
          <circle cx={half} cy={half} r={half * 0.15} fill="#000" />
          <circle cx={half + 2} cy={half - 2} r={1.5} fill="#FFF" />
        </svg>
      );
    case 11: // Skull
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half - 1} r={half - 2} fill="#FFF" stroke="#000" strokeWidth="2" />
          <circle cx={half - 5} cy={half - 3} r={3} fill="#000" />
          <circle cx={half + 5} cy={half - 3} r={3} fill="#000" />
          <rect x={half - 5} y={half + 4} width={2} height={4} fill="#000" />
          <rect x={half - 1} y={half + 4} width={2} height={4} fill="#000" />
          <rect x={half + 3} y={half + 4} width={2} height={4} fill="#000" />
        </svg>
      );
    default:
      return (
        <svg style={svgStyle} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 1} fill="#000" />
        </svg>
      );
  }
}

function starPoints(cx, cy, spikes, outerR, innerR) {
  const pts = [];
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes; i++) {
    pts.push(`${cx + Math.cos(rot) * outerR},${cy + Math.sin(rot) * outerR}`);
    rot += step;
    pts.push(`${cx + Math.cos(rot) * innerR},${cy + Math.sin(rot) * innerR}`);
    rot += step;
  }
  return pts.join(' ');
}

function CodeRedeemer() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('#888');

  function handleRedeem() {
    if (!code.trim()) return;
    const result = Store.redeemCode(code.trim());
    if (result.success) {
      setMsg(result.desc);
      setMsgColor('#2ECC71');
      setCode('');
    } else {
      setMsg(result.error);
      setMsgColor('#E74C3C');
    }
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Redeem Code</div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          maxLength={8}
          style={{
            flex: 1, padding: '8px 10px', border: '2px solid #CCC', borderRadius: '6px',
            fontSize: '14px', fontFamily: 'monospace', outline: 'none',
          }}
        />
        <button onClick={handleRedeem} style={{
          padding: '8px 14px', backgroundColor: '#000', color: '#FFF',
          border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold',
          cursor: 'pointer', fontFamily: 'monospace',
        }}>OK</button>
      </div>
      {msg && <div style={{ fontSize: '12px', color: msgColor, marginTop: '6px' }}>{msg}</div>}
    </div>
  );
}
