'use client';

import React, { CSSProperties, MouseEvent } from 'react';
import type { Game } from '@/lib/types';
import { colorSet } from '@/lib/colors';
import { PLAT_MAP } from '@/lib/data';

// CSS custom properties aren't in the standard CSSProperties type
type CSSWithVars = CSSProperties & Record<`--${string}`, string | number>;

interface Props {
  game: Game;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  motion: boolean;
  pad: number;
}

export default function GameCard({ game: g, index: i, expanded, onToggle, motion, pad }: Props) {
  const C = colorSet(g.hue, g.ch);

  const statusLabel =
    g.status === 'delayed'  ? 'DELAYED'    :
    g.status === 'released' ? 'OUT NOW'    :
    g.thisMonth             ? 'THIS MONTH' :
    g.when;

  const hasRating = g.status === 'released';
  const priceLabel = g.price === 0 ? 'Free' : `$${g.price.toFixed(2)}`;
  const buyHeading = g.price === 0 ? 'PLAY IT ON' : 'GET IT ON';

  // ── Card shell ──────────────────────────────────────────────────────────
  const cardStyle: CSSWithVars = {
    gridColumn: expanded ? '1 / -1' : 'auto',
    borderRadius: '26px',
    padding: `${pad}px`,
    position: 'relative',
    background: `radial-gradient(120% 130% at 100% 0%, ${C.tint}, var(--cardbg) 55%)`,
    border: `1px solid ${C.border}`,
    transition: 'transform .2s ease',
    '--gc': C.glow,
    ...(motion
      ? { animation: `glowPulse ${7 + (i % 5)}s ease-in-out ${(i % 7) * 0.35}s infinite` }
      : { boxShadow: `0 12px 30px -16px ${C.glow}` }),
  };

  // ── Cover thumbnail ──────────────────────────────────────────────────────
  const coverWrapStyle: CSSProperties = {
    flex: 'none',
    width: '80px',
    height: '80px',
    borderRadius: '22px',
    overflow: 'hidden',
    boxShadow: `0 12px 24px -10px ${C.glow}`,
    ...(motion
      ? { animation: `floaty ${5 + (i % 4) * 0.6}s ease-in-out ${(i % 5) * 0.3}s infinite` }
      : {}),
  };

  // ── Status badge ─────────────────────────────────────────────────────────
  const badgeStyle: CSSProperties = {
    position: 'absolute',
    top: '-4px',
    right: '0',
    transform: `rotate(${i % 2 ? -4 : 5}deg)`,
    padding: '6px 11px',
    borderRadius: '13px',
    font: "700 9.5px 'Space Grotesk'",
    letterSpacing: '.03em',
    color: C.badgeInk,
    background: `linear-gradient(120deg, ${C.accent}, ${C.accent2})`,
    boxShadow: `0 7px 16px -5px ${C.glow}`,
    whiteSpace: 'nowrap',
  };

  // ── Platform + demo pills ─────────────────────────────────────────────────
  const pillStyle: CSSProperties = {
    padding: '3px 7px',
    borderRadius: '8px',
    font: "600 9px 'Space Grotesk'",
    background: 'var(--chip)',
    color: 'var(--chipink)',
    border: '1px solid var(--hairline)',
  };

  const demoPillStyle: CSSProperties = {
    padding: '3px 8px',
    borderRadius: '11px',
    font: "700 8.5px 'Space Grotesk'",
    color: 'oklch(0.48 0.16 155)',
    background: 'oklch(0.85 0.13 155 / 0.4)',
  };

  // ── Expanded: hero key art ────────────────────────────────────────────────
  const heroStyle: CSSProperties = {
    height: '150px',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: '14px',
    background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
    backgroundSize: '200% 200%',
    boxShadow: 'inset 0 0 60px -10px rgba(0,0,0,.25)',
    ...(motion ? { animation: 'gradShift 9s ease infinite' } : {}),
  };

  // ── Metadata rows ─────────────────────────────────────────────────────────
  const metaRows = [
    { k: 'DEVELOPER', v: g.dev },
    { k: 'PUBLISHER', v: g.pub },
    { k: 'GENRE',     v: g.genre },
    { k: 'PLATFORMS', v: g.platforms.map(c => PLAT_MAP[c].pill).join(' · ') },
    {
      k: 'RELEASE',
      v: g.status === 'delayed' ? `TBD · was ${g.dateLabel}` : g.dateLabel,
    },
    { k: 'PRICE', v: g.price === 0 ? 'Free to play' : `$${g.price.toFixed(2)}` },
  ];

  // ── Buy button hover handlers ─────────────────────────────────────────────
  const onBuyEnter = (e: MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.filter = 'brightness(1.06)';
    el.style.transform = 'translateY(-1px)';
  };
  const onBuyLeave = (e: MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.filter = '';
    el.style.transform = '';
  };

  return (
    <div style={cardStyle}>
      {/* ── Collapsed header (always visible, click to toggle) ── */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Cover art */}
        <div style={coverWrapStyle}>
          {/* Swap src for real cover art when available */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://picsum.photos/seed/${g.id}/80/80`}
            alt={g.title}
            width={80}
            height={80}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
          <div
            style={{
              fontFamily: 'var(--font-fredoka)',
              fontWeight: 600,
              fontSize: 'var(--title)',
              lineHeight: 1.02,
              color: 'var(--ink)',
            }}
          >
            {g.title}
          </div>
          <div
            style={{
              marginTop: '5px',
              font: "500 11px 'Space Grotesk'",
              color: 'var(--sub)',
            }}
          >
            {g.genre} · {g.dateLabel}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              marginTop: '11px',
            }}
          >
            {g.platforms.map(code => (
              <span key={code} style={pillStyle}>
                {PLAT_MAP[code].pill}
              </span>
            ))}
            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                gap: '7px',
                alignItems: 'center',
              }}
            >
              {g.demo && <span style={demoPillStyle}>DEMO</span>}
              {hasRating && g.rating != null && (
                <span
                  style={{
                    font: "600 11px 'Space Grotesk'",
                    color: C.accent,
                  }}
                >
                  ★ {g.rating.toFixed(1)}
                </span>
              )}
              <span
                style={{
                  fontFamily: 'var(--font-fredoka)',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--ink)',
                }}
              >
                {priceLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div style={badgeStyle}>{statusLabel}</div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--hairline)',
            animation: 'detailIn .34s ease both',
          }}
        >
          {/* Key art hero — swap <img> src for real key art when available */}
          <div style={heroStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://picsum.photos/seed/${g.id}-hero/800/150`}
              alt={`${g.title} key art`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.45,
              }}
            />
            <span
              style={{
                position: 'relative',
                font: '600 10px ui-monospace, Menlo, monospace',
                letterSpacing: '.22em',
                color: 'rgba(255,255,255,.82)',
              }}
            >
              KEY ART
            </span>
          </div>

          {/* Critic score */}
          {hasRating && g.rating != null && (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '9px',
                marginTop: '14px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-fredoka)',
                  fontWeight: 700,
                  fontSize: '30px',
                  color: C.accent,
                  lineHeight: 1,
                }}
              >
                {g.rating.toFixed(1)}
              </span>
              <span
                style={{ font: "600 12px 'Space Grotesk'", color: 'var(--sub)' }}
              >
                ★ critic score · {g.reviews} reviews
              </span>
            </div>
          )}

          {/* Description */}
          <p
            style={{
              margin: '13px 0 0',
              font: "400 13.5px/1.6 'Space Grotesk'",
              color: 'var(--ink)',
              opacity: 0.86,
              textWrap: 'pretty',
            } as CSSProperties}
          >
            {g.desc}
          </p>

          {/* Metadata grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '11px 16px',
              marginTop: '16px',
            }}
          >
            {metaRows.map(m => (
              <div key={m.k}>
                <div
                  style={{
                    font: "700 9px 'Space Grotesk'",
                    letterSpacing: '.13em',
                    color: 'var(--sub2)',
                  }}
                >
                  {m.k}
                </div>
                <div
                  style={{
                    marginTop: '3px',
                    font: "600 12.5px 'Space Grotesk'",
                    color: 'var(--ink)',
                  }}
                >
                  {m.v}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '9px',
              marginTop: '18px',
            }}
          >
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '11px 16px',
                borderRadius: '15px',
                border: 'none',
                cursor: 'pointer',
                font: "700 12.5px 'Space Grotesk'",
                background: 'var(--ink)',
                color: 'var(--bg)',
              }}
            >
              ▶ Watch trailer
            </button>
            {g.demo && (
              <button
                style={{
                  padding: '11px 16px',
                  borderRadius: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  font: "700 12.5px 'Space Grotesk'",
                  color: '#062b16',
                  background:
                    'linear-gradient(120deg, oklch(0.74 0.15 155), oklch(0.68 0.17 140))',
                }}
              >
                ✨ Try demo
              </button>
            )}
          </div>

          {/* Store buy row */}
          <div
            style={{
              font: "700 9px 'Space Grotesk'",
              letterSpacing: '.13em',
              color: 'var(--sub2)',
              margin: '18px 0 8px',
            }}
          >
            {buyHeading}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
            {g.platforms.map(code => (
              <button
                key={code}
                onMouseEnter={onBuyEnter}
                onMouseLeave={onBuyLeave}
                style={{
                  padding: '10px 15px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  font: "700 12px 'Space Grotesk'",
                  background: 'transparent',
                  color: C.accent,
                  border: `1.5px solid ${C.accent}`,
                  transition: 'transform .15s, filter .15s',
                }}
              >
                {PLAT_MAP[code].store}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
