import type { Metadata } from "next";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { TrailCard } from "@/components/trail/TrailCard";
import { getServerFirebase } from "@/lib/firebase/server-app";
import { toTrail } from "@/lib/trails/convert";
import { FilterableTrailList } from "./_components/FilterableTrailList";

export const metadata: Metadata = {
  title: "Explore trails · Friendly Trails",
  description: "Ridge climbs, lake loops and city escapes around New York, with live trail conditions from fellow hikers.",
};

// v3: one query on the server (as the visitor, so rules apply), full HTML for crawlers,
// and instant filtering in the browser.
export default async function ExplorePage() {
  const { db } = await getServerFirebase();
  const snapshot = await getDocs(query(collection(db, "trails"), orderBy("name")));
  const trails = snapshot.docs.map(toTrail);

  return (
    <div className="explore">
      <header className="page-intro">
        <h1>Trails around New York</h1>
        <p>Ridge climbs, lake loops and city escapes, with live trail conditions from fellow hikers.</p>
      </header>

      <FilterableTrailList
        // Only the fields the filters need go to the browser...
        trails={trails.map(({ id, name, region, difficulty, distanceKm, dogFriendly }) => ({
          id,
          name,
          region,
          difficulty,
          distanceKm,
          dogFriendly,
        }))}
        // ...and the cards arrive already rendered. Full prefetch, so trail pages open offline.
        cards={Object.fromEntries(
          trails.map((trail) => [trail.id, <TrailCard trail={trail} href={`/v3/trails/${trail.id}`} prefetch />]),
        )}
      />
    </div>
  );
}
