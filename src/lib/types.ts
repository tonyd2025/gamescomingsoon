export type Platform = 'PC' | 'PS5' | 'XBX' | 'NSW';
export type Status = 'upcoming' | 'released' | 'delayed';
export type Canvas = 'paper' | 'white';
export type Density = 'cozy' | 'compact';

export interface Game {
  id: string;
  title: string;
  genre: string;
  platforms: Platform[];
  dateLabel: string;
  monthKey: string;
  when: string;
  sort: number;
  price: number;
  status: Status;
  rating: number | null;
  reviews: number;
  demo: boolean;
  thisMonth: boolean;
  dev: string;
  pub: string;
  hue: number;
  ch: number;
  desc: string;
}

export interface ColorSet {
  accent: string;
  accent2: string;
  tint: string;
  stripe: string;
  ink: string;
  glow: string;
  border: string;
  badgeInk: string;
}

export interface ThemeTokens {
  bg: string;
  ink: string;
  sub: string;
  sub2: string;
  cardbg: string;
  tint2: string;
  panel: string;
  chip: string;
  chipink: string;
  headerA: string;
  headerB: string;
  hairline: string;
}

export interface CalendarProps {
  canvas?: Canvas;
  density?: Density;
  motion?: boolean;
}
