import type { Game, Platform } from './types';

// ── CSV helpers ────────────────────────────────────────────────────────────

/**
 * Minimal RFC 4180-compliant CSV parser.
 * Handles quoted fields (which may contain commas and newlines).
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"')           { inQuotes = false; }
      else                           { field += ch; }
    } else {
      if (ch === '"')                { inQuotes = true; }
      else if (ch === ',')           { row.push(field); field = ''; }
      else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        row.push(field); field = '';
        rows.push(row);  row = [];
      } else {
        field += ch;
      }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  return rows;
}

/** Converts a row + header array into a Game, deriving computed fields from release_date. */
function rowToGame(headers: string[], cells: string[]): Game {
  const get = (key: string) => cells[headers.indexOf(key)]?.trim() ?? '';

  const dateStr = get('release_date'); // e.g. "2026-01-12"
  const date    = new Date(dateStr + 'T00:00:00'); // avoid UTC offset issues

  const year    = date.getFullYear();
  const month   = date.getMonth() + 1; // 1-based
  const day     = date.getDate();

  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateLabel = `${MONTH_ABBR[month - 1]} ${day}, ${year}`;
  const monthKey  = `${year}-${String(month).padStart(2, '0')}`;
  const when      = `${MONTH_ABBR[month - 1].toUpperCase()} ${day}`;
  const sort      = year * 10000 + month * 100 + day;

  const currentMonth = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();

  const status    = get('status') as Game['status'];
  const rating    = get('rating') !== '' ? parseFloat(get('rating')) : null;
  const platforms = get('platforms').split('|').map(p => p.trim()).filter(Boolean) as Platform[];

  return {
    id:        get('id'),
    title:     get('title'),
    genre:     get('genre'),
    platforms,
    dateLabel,
    monthKey,
    when,
    sort,
    price:     parseFloat(get('price')) || 0,
    status,
    rating,
    reviews:   parseInt(get('reviews')) || 0,
    demo:      get('demo').toUpperCase() === 'TRUE',
    thisMonth: monthKey === currentMonth && status === 'upcoming',
    dev:       get('dev'),
    pub:       get('pub'),
    hue:       parseFloat(get('hue')),
    ch:        parseFloat(get('ch')),
    desc:      get('desc'),
  };
}

export const PLAT_MAP: Record<Platform, { pill: string; store: string }> = {
  PC:  { pill: 'PC',  store: 'Steam'    },
  PS5: { pill: 'PS5', store: 'PS Store' },
  XBX: { pill: 'XBX', store: 'Xbox'     },
  NSW: { pill: 'NSW', store: 'eShop'    },
};

export const MONTHS = [
  { key: '2025-11', label: 'Nov 25' },
  { key: '2025-12', label: 'Dec 25' },
  { key: '2026-01', label: 'Jan 26' },
  { key: '2026-02', label: 'Feb 26' },
  { key: '2026-03', label: 'Mar 26' },
  { key: '2026-04', label: 'Apr 26' },
  { key: '2026-05', label: 'May 26' },
  { key: '2026-06', label: 'Jun 26' },
] as const;

// Mock dataset from the design prototype — 18 games.
// Replace getGames() with a real fetch; no component code changes needed.
const ALL: Game[] = [
  {
    id: 'starbound', title: 'Starbound Requiem', genre: 'RPG',
    platforms: ['PC', 'PS5', 'XBX'],
    dateLabel: 'Jan 12, 2026', monthKey: '2026-01', when: 'JAN 12', sort: 20260112,
    price: 69.99, status: 'released', rating: 9.1, reviews: 142,
    demo: false, thisMonth: false, dev: 'Nebula Forge', pub: 'Aurora Interactive',
    hue: 295, ch: 0.24,
    desc: 'A sweeping space-opera RPG where every jump gate rewrites your crew\'s fate. Branching loyalties, hand-built star systems, and a score that swells with each decision.',
  },
  {
    id: 'chrono', title: 'Chrono Reef', genre: 'Adventure',
    platforms: ['PC', 'PS5', 'XBX', 'NSW'],
    dateLabel: 'Feb 5, 2026', monthKey: '2026-02', when: 'FEB 5', sort: 20260205,
    price: 39.99, status: 'released', rating: 8.8, reviews: 76,
    demo: true, thisMonth: true, dev: 'Tidecall', pub: 'Deepwater',
    hue: 210, ch: 0.18,
    desc: 'Dive a time-looping ocean and untangle a sunken mystery. Every loop teaches the tide a little more about you.',
  },
  {
    id: 'tiny', title: 'Tiny Kingdoms', genre: 'Tower Defense',
    platforms: ['PC', 'NSW', 'PS5'],
    dateLabel: 'Feb 13, 2026', monthKey: '2026-02', when: 'FEB 13', sort: 20260213,
    price: 17.99, status: 'released', rating: 8.6, reviews: 53,
    demo: true, thisMonth: true, dev: 'Acorn', pub: 'Acorn',
    hue: 140, ch: 0.18,
    desc: 'Adorable tower defense with surprising strategic depth. Stack tiny heroes, giant combos, and one very grumpy dragon.',
  },
  {
    id: 'hollow', title: 'Hollow Verge', genre: 'Metroidvania',
    platforms: ['PC', 'NSW'],
    dateLabel: 'Feb 20, 2026', monthKey: '2026-02', when: 'FEB 20', sort: 20260220,
    price: 24.99, status: 'upcoming', rating: null, reviews: 0,
    demo: true, thisMonth: true, dev: 'Palewood', pub: 'Palewood',
    hue: 185, ch: 0.16,
    desc: 'Descend a crumbling vertical world in this hand-painted metroidvania. Every ledge hides a shortcut — or a secret.',
  },
  {
    id: 'gravity', title: 'Gravity Heist', genre: 'Shooter',
    platforms: ['PC', 'PS5', 'XBX'],
    dateLabel: 'Feb 27, 2026', monthKey: '2026-02', when: 'FEB 27', sort: 20260227,
    price: 44.99, status: 'upcoming', rating: null, reviews: 0,
    demo: false, thisMonth: true, dev: 'Null Sector', pub: 'Vantablack',
    hue: 275, ch: 0.2,
    desc: 'Zero-g co-op shooter — rob orbital vaults with up to four friends. Cut the gravity, grab the loot, get out clean.',
  },
  {
    id: 'neon', title: 'Neon Drifters', genre: 'Racing',
    platforms: ['PS5', 'PC'],
    dateLabel: 'Mar 6, 2026', monthKey: '2026-03', when: 'MAR 6', sort: 20260306,
    price: 49.99, status: 'upcoming', rating: null, reviews: 0,
    demo: true, thisMonth: false, dev: 'Overdrive Studio', pub: 'Voltage Games',
    hue: 350, ch: 0.26,
    desc: 'Anti-gravity street racing lit up by a pulsing synthwave soundtrack. Drift the neon, chain the boost, never brake.',
  },
  {
    id: 'crimson', title: 'Crimson Vow', genre: 'Visual Novel',
    platforms: ['PC', 'NSW'],
    dateLabel: 'Mar 14, 2026', monthKey: '2026-03', when: 'MAR 14', sort: 20260314,
    price: 21.99, status: 'upcoming', rating: null, reviews: 0,
    demo: false, thisMonth: false, dev: 'Rougework', pub: 'Petal Press',
    hue: 10, ch: 0.22,
    desc: 'A gothic romance visual novel of oaths, secrets, and blood. Six routes, one unforgettable night that never quite ends.',
  },
  {
    id: 'bloomfall', title: 'Bloomfall', genre: 'Cozy Sim',
    platforms: ['NSW', 'PC'],
    dateLabel: 'Mar 27, 2026', monthKey: '2026-03', when: 'MAR 27', sort: 20260327,
    price: 29.99, status: 'delayed', rating: null, reviews: 0,
    demo: false, thisMonth: false, dev: 'Softlight', pub: 'Meadow',
    hue: 12, ch: 0.2,
    desc: 'Restore a forgotten valley one gentle season at a time. Plant, befriend, rebuild — no clocks, no pressure.',
  },
  {
    id: 'ironclad', title: 'Ironclad Tactics', genre: 'Strategy',
    platforms: ['PC'],
    dateLabel: 'Apr 8, 2026', monthKey: '2026-04', when: 'APR 8', sort: 20260408,
    price: 34.99, status: 'upcoming', rating: null, reviews: 0,
    demo: false, thisMonth: false, dev: 'Bastion Works', pub: 'Grand Table',
    hue: 45, ch: 0.2,
    desc: 'Command clockwork legions in deep, deterministic turn-based warfare. Every gear you wind is a plan three turns ahead.',
  },
  {
    id: 'duskfarer', title: 'Duskfarer', genre: 'Survival',
    platforms: ['PC', 'PS5', 'XBX'],
    dateLabel: 'Apr 22, 2026', monthKey: '2026-04', when: 'APR 22', sort: 20260422,
    price: 32.99, status: 'upcoming', rating: null, reviews: 0,
    demo: true, thisMonth: false, dev: 'Lantern Bay', pub: 'Northwind',
    hue: 90, ch: 0.18,
    desc: 'Survive the long night in a wilderness that rearranges itself while you sleep. Keep the lantern lit; keep moving.',
  },
  {
    id: 'ashen', title: 'Ashen Crown', genre: 'Soulslike',
    platforms: ['PC', 'PS5', 'XBX'],
    dateLabel: 'May 2, 2026', monthKey: '2026-05', when: 'MAY 2', sort: 20260502,
    price: 59.99, status: 'upcoming', rating: null, reviews: 0,
    demo: false, thisMonth: false, dev: 'Emberfall', pub: 'Black Iron',
    hue: 25, ch: 0.22,
    desc: 'A brutal soulslike beneath a dying sun. Master the parry, learn the kings, inherit an ashen crown of your own.',
  },
  {
    id: 'sable', title: 'Sable Circuit', genre: 'Cyberpunk RPG',
    platforms: ['PC', 'PS5', 'XBX'],
    dateLabel: 'May 19, 2026', monthKey: '2026-05', when: 'MAY 19', sort: 20260519,
    price: 54.99, status: 'upcoming', rating: null, reviews: 0,
    demo: false, thisMonth: false, dev: 'Grid Runner', pub: 'Synaptic',
    hue: 200, ch: 0.2,
    desc: 'A neon-noir RPG where your implants define who you can become. Rewrite your body, rewrite the city.',
  },
  {
    id: 'meadowlark', title: 'Meadowlark', genre: 'Farming',
    platforms: ['NSW', 'PC', 'PS5'],
    dateLabel: 'Jun 11, 2026', monthKey: '2026-06', when: 'JUN 11', sort: 20260611,
    price: 27.99, status: 'upcoming', rating: null, reviews: 0,
    demo: false, thisMonth: false, dev: 'Sunhaven', pub: 'Cozy Collective',
    hue: 120, ch: 0.17,
    desc: 'Build a farm, a town, and a life on a sun-soaked frontier. Grow roots, throw festivals, watch a village bloom.',
  },
  {
    id: 'pixel', title: 'Pixel Panic', genre: 'Party',
    platforms: ['NSW'],
    dateLabel: 'Nov 14, 2025', monthKey: '2025-11', when: 'NOV 14', sort: 20251114,
    price: 19.99, status: 'released', rating: 8.4, reviews: 210,
    demo: false, thisMonth: false, dev: 'Jellybean Co', pub: 'Jellybean Co',
    hue: 65, ch: 0.2,
    desc: 'Frantic four-player microgame chaos built for the couch. Fifty games, five seconds each, zero mercy.',
  },
  {
    id: 'karaoke', title: 'Karaoke Kings', genre: 'Rhythm',
    platforms: ['NSW', 'PS5'],
    dateLabel: 'Nov 28, 2025', monthKey: '2025-11', when: 'NOV 28', sort: 20251128,
    price: 24.99, status: 'released', rating: 8.1, reviews: 98,
    demo: false, thisMonth: false, dev: 'Big Mic', pub: 'Party Line',
    hue: 320, ch: 0.24,
    desc: 'Belt out 200+ tracks solo or with a full living room. Real-time pitch scoring and a very forgiving crowd.',
  },
  {
    id: 'vector', title: 'Vector Bloom', genre: 'Puzzle',
    platforms: ['PC', 'NSW'],
    dateLabel: 'Dec 3, 2025', monthKey: '2025-12', when: 'DEC 3', sort: 20251203,
    price: 14.99, status: 'released', rating: 9.4, reviews: 64,
    demo: true, thisMonth: false, dev: 'Kite', pub: 'Kite',
    hue: 155, ch: 0.18,
    desc: 'Minimalist puzzles that unfold like origami. One rule, a hundred quiet revelations, no wasted line.',
  },
  {
    id: 'riftbound', title: 'Riftbound', genre: 'MOBA',
    platforms: ['PC'],
    dateLabel: 'Jan 30, 2026', monthKey: '2026-01', when: 'JAN 30', sort: 20260130,
    price: 0, status: 'released', rating: 7.9, reviews: 188,
    demo: false, thisMonth: false, dev: 'Arclight', pub: 'Arclight',
    hue: 260, ch: 0.2,
    desc: 'Fast, free-to-play 4v4 hero brawls with a rotating roster. Ten-minute matches, ten-second comebacks.',
  },
  {
    id: 'frostpeak', title: 'Frostpeak Rally', genre: 'Sports',
    platforms: ['PS5', 'XBX', 'PC'],
    dateLabel: 'Jan 9, 2026', monthKey: '2026-01', when: 'JAN 9', sort: 20260109,
    price: 39.99, status: 'delayed', rating: null, reviews: 0,
    demo: false, thisMonth: false, dev: 'Summit', pub: 'Alpine',
    hue: 220, ch: 0.16,
    desc: 'White-knuckle downhill rally across shifting alpine passes. Read the ice, trust the co-driver, hold your line.',
  },
];

/**
 * Returns the game list.
 *
 * When SHEET_CSV_URL is set (Vercel env var or .env.local), fetches live data
 * from a published Google Sheets CSV. Otherwise falls back to the mock dataset.
 *
 * CSV is re-fetched at most every 5 minutes via Next.js fetch caching (ISR).
 */
export async function getGames(): Promise<Game[]> {
  const url = process.env.SHEET_CSV_URL;

  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const [headerRow, ...dataRows] = parseCSV(text);
      if (!headerRow) return ALL;
      const headers = headerRow.map(h => h.trim().toLowerCase());
      return dataRows
        .filter(row => row.some(cell => cell.trim()))
        .map(row => rowToGame(headers, row));
    } catch (err) {
      console.error('[getGames] Failed to fetch sheet, falling back to mock data:', err);
    }
  }

  return ALL;
}
