import { getGames } from '@/lib/data';
import ReleaseCalendar from '@/components/ReleaseCalendar';

// Re-render this page on Vercel at most every 5 minutes so edits to the
// Google Sheet appear without a manual redeploy.
export const revalidate = 300;

export default async function Home() {
  const games = await getGames();
  return <ReleaseCalendar canvas="paper" density="cozy" motion={true} initialGames={games} />;
}
