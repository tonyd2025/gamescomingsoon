import type { ColorSet } from './types';

/**
 * Derives a full per-game color palette from hue (0–360) and chroma.
 * Matches the colorSet(h, c) formula from the design spec exactly.
 */
export function colorSet(h: number, c: number): ColorSet {
  const cc = Math.min(c, 0.2);
  return {
    accent: `oklch(0.6 ${c} ${h})`,
    accent2: `oklch(0.54 ${c} ${(h + 24) % 360})`,
    tint: `oklch(0.82 0.13 ${h} / 0.18)`,
    stripe: `oklch(0.64 ${cc} ${h} / 0.4)`,
    ink: `oklch(0.46 ${cc} ${h})`,
    glow: `oklch(0.66 0.19 ${h} / 0.5)`,
    border: `oklch(0.7 0.17 ${h} / 0.22)`,
    badgeInk: h >= 42 && h <= 155 ? '#2a1e05' : '#ffffff',
  };
}
