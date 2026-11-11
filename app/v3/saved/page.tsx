import type { Metadata } from "next";
import { collection, getDocs } from "firebase/firestore";
import { getServerFirebase } from "@/lib/firebase/server-app";
import { toSavedTrail } from "@/lib/trails/convert";
import { SavedList, type SavedItem } from "../_components/SavedList";

export const metadata: Metadata = { title: "Saved trails · Friendly Trails" };

// v3: the server renders the list as the visitor (security rules apply), so there's no
// spinner. The client listener then keeps it live and available offline.
export default async function SavedPage() {
  const { db, user } = await getServerFirebase();
  let initial: SavedItem[] | null = null;
  if (user) {
    try {
      const snapshot = await getDocs(collection(db, "users", user.uid, "saved"));
      initial = snapshot.docs
        .map(toSavedTrail)
        .sort((a, b) => (b.savedAt?.getTime() ?? 0) - (a.savedAt?.getTime() ?? 0))
        .map(({ savedAt: _savedAt, ...item }) => item);
    } catch {
      initial = null; // The browser loads it instead.
    }
  }

  return (
    <div className="saved">
      <header className="page-intro">
        <h1>Saved trails</h1>
        <p>Your shortlist for the next weekend. Available offline, too.</p>
      </header>
      <SavedList initial={initial} />
    </div>
  );
}
