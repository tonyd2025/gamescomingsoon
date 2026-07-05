'use client';

import React, { CSSProperties, useEffect, useState } from 'react';

type CSSWithVars = CSSProperties & Record<`--${string}`, string | number>;
import type { Canvas, Density, Game, ThemeTokens } from '@/lib/types';
import { MONTHS } from '@/lib/data';
import GameCard from './GameCard';

// ── Theme token sets ───────────────────────────────────────────────────────

const THEMES: Record<Canvas, ThemeTokens> = {
  paper: {
    bg:      '#faf6ef',
    ink:     '#241a12',
    sub:     'rgba(60,40,20,.58)',
    sub2:    'rgba(60,40,20,.44)',
    cardbg:  '#fffdfa',
    tint2:   '#fdf8f0',
    panel:   '#fffcf6',
    chip:    '#ffffff',
    chipink: 'rgba(60,40,20,.64)',
    headerA: 'oklch(0.68 0.19 42)',
    headerB: 'oklch(0.62 0.2 20)',
    hairline:'rgba(60,40,20,.1)',
  },
  white: {
    bg:      '#f4f6fb',
    ink:     '#14183a',
    sub:     'rgba(20,24,50,.58)',
    sub2:    'rgba(20,24,50,.42)',
    cardbg:  '#ffffff',
    tint2:   '#ffffff',
    panel:   '#ffffff',
    chip:    '#ffffff',
    chipink: 'rgba(20,24,50,.6)',
    headerA: 'oklch(0.66 0.2 258)',
    headerB: 'oklch(0.6 0.22 300)',
    hairline:'rgba(20,24,50,.09)',
  },
};

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  canvas?:       Canvas;
  density?:      Density;
  motion?:       boolean;
  initialGames?: Game[];
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ReleaseCalendar({
  canvas       = 'paper',
  density      = 'cozy',
  motion       = true,
  initialGames = [],
}: Props) {
  // Games are provided by the server component (page.tsx) via ISR.
  // The useState here allows future client-side refresh without touching page.tsx.
  const [allGames] = useState<Game[]>(initialGames);

  // ── Filter state ──
  const [status,      setStatus]      = useState<string>('all');
  const [platform,    setPlatform]    = useState<string>('all');
  const [genre,       setGenre]       = useState<string>('all');
  const [month,       setMonth]       = useState<string>('all');

  // Default month filter to the current calendar month (set after mount to avoid hydration mismatch)
  useEffect(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(key);
  }, []);
  const [q,           setQ]           = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);

  // ── Window width for responsive columns ──
  const [w, setW] = useState(1200);
  useEffect(() => {
    const update = () => setW(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Theme + density ──
  const T   = THEMES[canvas];
  const pad = density === 'compact' ? 14 : 18;
  const titleSize = density === 'compact' ? '19px' : '21px';

  // ── CSS variables injected on the root div ──
  const cssVars: CSSWithVars = {
    '--bg':      T.bg,
    '--ink':     T.ink,
    '--sub':     T.sub,
    '--sub2':    T.sub2,
    '--cardbg':  T.cardbg,
    '--tint2':   T.tint2,
    '--panel':   T.panel,
    '--chip':    T.chip,
    '--chipink': T.chipink,
    '--headerA': T.headerA,
    '--headerB': T.headerB,
    '--hairline':T.hairline,
    '--title':   titleSize,
  };

  // ── Filter + sort ──
  const qTrimmed = q.trim().toLowerCase();
  const filtered = allGames
    .filter(g => {
      if (status   !== 'all' && g.status          !== status)   return false;
      if (platform !== 'all' && !g.platforms.includes(platform as never)) return false;
      if (genre    !== 'all' && g.genre            !== genre)   return false;
      if (month    !== 'all' && g.monthKey         !== month)   return false;
      if (qTrimmed && !(
        g.title.toLowerCase().includes(qTrimmed) ||
        g.genre.toLowerCase().includes(qTrimmed) ||
        g.dev.toLowerCase().includes(qTrimmed)
      )) return false;
      return true;
    })
    .sort((a, b) => a.sort - b.sort);

  // ── Column count ──
  const cols = w < 680 ? 1 : w < 1040 ? 2 : 3;

  // ── Chip helpers ──
  const chipBase: CSSProperties = {
    padding:    '9px 14px',
    borderRadius:'20px',
    font:       "600 12px 'Space Grotesk'",
    cursor:     'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transition: 'transform .15s',
    display:    'inline-block',
  };

  const chipActive: CSSProperties = {
    ...chipBase,
    color:     '#fff',
    background:`linear-gradient(120deg,${T.headerA},${T.headerB})`,
    boxShadow: `0 6px 14px -6px ${T.headerB}`,
    border:    '1px solid transparent',
  };

  const chipOff: CSSProperties = {
    ...chipBase,
    background: T.chip,
    color:      T.chipink,
    border:     `1px solid ${T.hairline}`,
  };

  type ChipOpt = { v: string; label: string };

  function mkChips(cur: string, setter: (v: string) => void, opts: ChipOpt[]) {
    return opts.map(o => ({
      ...o,
      style:   cur === o.v ? chipActive : chipOff,
      onClick: () => setter(o.v),
    }));
  }

  const statusChips = mkChips(status, setStatus, [
    { v: 'all',      label: 'All'      },
    { v: 'upcoming', label: 'Upcoming' },
    { v: 'released', label: 'Out now'  },
  ]);

  const platformChips = mkChips(platform, setPlatform, [
    { v: 'all', label: 'All'    },
    { v: 'PC',  label: 'PC'     },
    { v: 'PS5', label: 'PS5'    },
    { v: 'XBX', label: 'Xbox'   },
    { v: 'NSW', label: 'Switch' },
  ]);

  const genres = [...new Set(allGames.map(g => g.genre))].sort();
  const genreChips = mkChips(genre, setGenre,
    [{ v: 'all', label: 'All' }].concat(genres.map(x => ({ v: x, label: x })))
  );

  const monthChips = mkChips(month, setMonth,
    [{ v: 'all', label: 'All' }].concat(MONTHS.map(m => ({ v: m.key, label: m.label })))
  );

  // ── Filters toggle button style ──
  const filterBtnStyle: CSSProperties = {
    ...chipBase,
    display:    'flex',
    alignItems: 'center',
    gap:        '5px',
    marginLeft: '2px',
    background: showFilters ? T.ink  : T.chip,
    color:      showFilters ? T.bg   : T.chipink,
    border:     showFilters ? '1px solid transparent' : `1px solid ${T.hairline}`,
  };

  // ── Derived ──
  const anyFilter = status !== 'all' || platform !== 'all' || genre !== 'all' || month !== 'all' || q.trim() !== '';
  const clearFilters = () => {
    setStatus('all'); setPlatform('all'); setGenre('all');
    setMonth('all');  setQ('');
  };

  const n = filtered.length;
  const resultLabel = `${n} ${n === 1 ? 'release' : 'releases'}`;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', width: '100%', background: T.bg, ...cssVars }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 16px 64px' }}>

        {/* ── Sticky header ── */}
        <div
          style={{
            position:    'sticky',
            top:         0,
            zIndex:      20,
            margin:      '0 -16px',
            padding:     '18px 16px 12px',
            background:  T.bg,
            borderBottom:`1px solid ${T.hairline}`,
          }}
        >
          <div style={{ maxWidth: '1160px', margin: '0 auto' }}>

            {/* Title + search row */}
            <div
              style={{
                display:        'flex',
                alignItems:     'flex-start',
                justifyContent: 'space-between',
                gap:            '14px',
              }}
            >
              {/* Title block */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-fredoka)',
                    fontWeight: 700,
                    fontSize:   '29px',
                    lineHeight: '.9',
                    color:      T.ink,
                  }}
                >
                  Coming up{' '}
                  <span style={{ color: T.headerA }}>✦</span>
                </div>
                <div
                  style={{
                    marginTop: '5px',
                    font:      "500 12px 'Space Grotesk'",
                    color:     T.sub2,
                  }}
                >
                  {allGames.length} games · Nov 2025 – Jun 2026
                </div>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', flex: 1, maxWidth: '230px' }}>
                <span
                  style={{
                    position:  'absolute',
                    left:      '13px',
                    top:       '50%',
                    transform: 'translateY(-50%)',
                    color:     T.sub2,
                    fontSize:  '14px',
                  }}
                >
                  ⌕
                </span>
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search games…"
                  style={{
                    width:        '100%',
                    padding:      '11px 12px 11px 32px',
                    borderRadius: '16px',
                    border:       `1px solid ${T.hairline}`,
                    background:   T.cardbg,
                    color:        T.ink,
                    font:         "500 13px 'Space Grotesk'",
                    outline:      'none',
                  }}
                />
              </div>
            </div>

            {/* Status segmented row + Filters toggle */}
            <div
              style={{
                display:      'flex',
                gap:          '8px',
                marginTop:    '14px',
                overflowX:    'auto',
                paddingBottom:'2px',
              }}
            >
              {statusChips.map(c => (
                <div key={c.v} onClick={c.onClick} style={c.style}>
                  {c.label}
                </div>
              ))}
              <div
                onClick={() => setShowFilters(f => !f)}
                style={filterBtnStyle}
              >
                Filters {showFilters ? '▴' : '▾'}
              </div>
            </div>

            {/* Expandable filters panel */}
            {showFilters && (
              <div
                style={{
                  marginTop:    '12px',
                  padding:      '14px',
                  borderRadius: '20px',
                  background:   T.panel,
                  border:       `1px solid ${T.hairline}`,
                  animation:    'detailIn .28s ease both',
                }}
              >
                {/* Platform */}
                <div
                  style={{
                    font:          "700 10px 'Space Grotesk'",
                    letterSpacing: '.14em',
                    color:         T.sub2,
                    marginBottom:  '8px',
                  }}
                >
                  PLATFORM
                </div>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                  {platformChips.map(c => (
                    <div key={c.v} onClick={c.onClick} style={c.style}>
                      {c.label}
                    </div>
                  ))}
                </div>

                {/* Genre */}
                <div
                  style={{
                    font:          "700 10px 'Space Grotesk'",
                    letterSpacing: '.14em',
                    color:         T.sub2,
                    margin:        '14px 0 8px',
                  }}
                >
                  GENRE
                </div>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                  {genreChips.map(c => (
                    <div key={c.v} onClick={c.onClick} style={c.style}>
                      {c.label}
                    </div>
                  ))}
                </div>

                {/* Month */}
                <div
                  style={{
                    font:          "700 10px 'Space Grotesk'",
                    letterSpacing: '.14em',
                    color:         T.sub2,
                    margin:        '14px 0 8px',
                  }}
                >
                  MONTH
                </div>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                  {monthChips.map(c => (
                    <div key={c.v} onClick={c.onClick} style={c.style}>
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Results bar ── */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            margin:         '20px 2px 14px',
          }}
        >
          <div style={{ font: "600 13px 'Space Grotesk'", color: T.sub }}>
            {resultLabel}
          </div>
          {anyFilter && (
            <div
              onClick={clearFilters}
              style={{
                font:   "600 12px 'Space Grotesk'",
                color:  T.headerA,
                cursor: 'pointer',
              }}
            >
              Clear all ✕
            </div>
          )}
        </div>

        {/* ── Card grid ── */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
            gap:                 '16px',
            alignItems:          'start',
          }}
        >
          {filtered.map((g, i) => (
            <GameCard
              key={g.id}
              game={g}
              index={i}
              expanded={expandedId === g.id}
              onToggle={() => setExpandedId(prev => (prev === g.id ? null : g.id))}
              motion={motion}
              pad={pad}
            />
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && allGames.length > 0 && (
          <div
            style={{
              textAlign: 'center',
              padding:   '64px 20px',
              color:     T.sub,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-fredoka)',
                fontWeight: 600,
                fontSize:   '22px',
                color:      T.ink,
              }}
            >
              No releases match
            </div>
            <div style={{ marginTop: '6px', font: "500 13px 'Space Grotesk'" }}>
              Try loosening a filter.
            </div>
            <div
              onClick={clearFilters}
              style={{
                display:      'inline-block',
                marginTop:    '16px',
                padding:      '11px 18px',
                borderRadius: '16px',
                background:   `linear-gradient(120deg,${T.headerA},${T.headerB})`,
                color:        '#fff',
                font:         "700 13px 'Space Grotesk'",
                cursor:       'pointer',
              }}
            >
              Clear all filters
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
